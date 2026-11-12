// 書いた線と、お手本の画（KanjiVG の SVG パス）を見くらべるための道具

export type Point = { x: number; y: number }

/** KanjiVG の座標系は 109x109 */
export const KANJIVG_SIZE = 109
/** 見くらべるときの点の数 */
const SAMPLE_COUNT = 32

let measurePath: SVGPathElement | null = null
const sampleCache = new Map<string, Point[]>()

/** SVG パス文字列を、等間隔の点の列にする（KanjiVG 座標系のまま） */
export function samplePath(d: string): Point[] {
  const cached = sampleCache.get(d)
  if (cached) return cached
  if (!measurePath) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'absolute'
    svg.style.visibility = 'hidden'
    measurePath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svg.appendChild(measurePath)
    document.body.appendChild(svg)
  }
  measurePath.setAttribute('d', d)
  const total = measurePath.getTotalLength()
  const pts: Point[] = []
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const p = measurePath.getPointAtLength((total * i) / (SAMPLE_COUNT - 1))
    pts.push({ x: p.x, y: p.y })
  }
  sampleCache.set(d, pts)
  return pts
}

export function scalePoints(pts: Point[], scale: number): Point[] {
  return pts.map((p) => ({ x: p.x * scale, y: p.y * scale }))
}

export function pathLength(pts: Point[]): number {
  let len = 0
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return len
}

/** 自由に書いた線を、等間隔の N 点にそろえる */
export function resample(pts: Point[], n = SAMPLE_COUNT): Point[] {
  if (pts.length === 0) return []
  if (pts.length === 1) return Array.from({ length: n }, () => pts[0])
  const total = pathLength(pts)
  if (total === 0) return Array.from({ length: n }, () => pts[0])
  const step = total / (n - 1)
  const out: Point[] = [pts[0]]
  let acc = 0
  let i = 1
  let prev = pts[0]
  while (out.length < n && i < pts.length) {
    const cur = pts[i]
    const seg = Math.hypot(cur.x - prev.x, cur.y - prev.y)
    if (acc + seg >= step) {
      const t = (step - acc) / seg
      const np = { x: prev.x + (cur.x - prev.x) * t, y: prev.y + (cur.y - prev.y) * t }
      out.push(np)
      prev = np
      acc = 0
    } else {
      acc += seg
      prev = cur
      i++
    }
  }
  while (out.length < n) out.push(pts[pts.length - 1])
  return out
}

/** 点どうしの平均距離。小さいほど似ている */
function meanDistance(a: Point[], b: Point[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y)
  return sum / a.length
}

/** 似ている度合い（距離 px）。はじまりと終わりは重めに見る */
export function strokeDistance(user: Point[], expected: Point[]): number {
  const body = meanDistance(user, expected)
  const start = Math.hypot(user[0].x - expected[0].x, user[0].y - expected[0].y)
  const end = Math.hypot(
    user[user.length - 1].x - expected[expected.length - 1].x,
    user[user.length - 1].y - expected[expected.length - 1].y,
  )
  // 長さが大きく違うときだけ減点。短い画（点や短い横棒）は指のブレで長さが変わりやすいので見ない
  const expectedLen = pathLength(expected)
  const lenRatio = pathLength(user) / Math.max(1, expectedLen)
  const lenPenalty = expectedLen > 120 && (lenRatio < 0.4 || lenRatio > 2.5) ? 60 : 0
  return body * 0.6 + start * 0.2 + end * 0.2 + lenPenalty
}

/** 指のブレをならす（前後の点との平均） */
export function smooth(pts: Point[], passes = 2): Point[] {
  let out = pts
  for (let p = 0; p < passes; p++) {
    if (out.length < 3) return out
    const next: Point[] = [out[0]]
    for (let i = 1; i < out.length - 1; i++) {
      next.push({
        x: (out[i - 1].x + out[i].x + out[i + 1].x) / 3,
        y: (out[i - 1].y + out[i].y + out[i + 1].y) / 3,
      })
    }
    next.push(out[out.length - 1])
    out = next
  }
  return out
}

export type Judgement =
  | { kind: 'ok' }
  | { kind: 'wrong-order'; matched: number }
  | { kind: 'already'; matched: number }
  | { kind: 'reversed' }
  | { kind: 'miss' }

/**
 * いま書いた線が、何画目にあたるかを判定する。
 * @param user      書いた線（キャンバス座標）
 * @param strokes   お手本の各画（キャンバス座標・サンプル済み）
 * @param nextIndex つぎに書くべき画の番号
 * @param threshold これより距離が小さければ「同じ画」とみなす
 */
export function judgeStroke(user: Point[], strokes: Point[][], nextIndex: number, threshold: number): Judgement {
  const u = resample(smooth(user))
  const scores = strokes.map((s) => strokeDistance(u, s))
  const expected = scores[nextIndex]

  let best = 0
  for (let i = 1; i < scores.length; i++) if (scores[i] < scores[best]) best = i

  // 正しい画に十分近く、ほかの画が「明らかに」近いわけでもなければ OK
  if (expected <= threshold && (best === nextIndex || expected <= scores[best] * 1.35)) return { kind: 'ok' }

  if (scores[best] <= threshold) {
    return best < nextIndex ? { kind: 'already', matched: best } : { kind: 'wrong-order', matched: best }
  }

  // 逆向きに書いていないか
  const reversed = strokeDistance([...u].reverse(), strokes[nextIndex])
  if (reversed <= threshold) return { kind: 'reversed' }

  // どれにもぴったりではないが、まだ書いていない別の画に「そこそこ」近いなら書き順ちがいと伝える
  if (best !== nextIndex && best > nextIndex && scores[best] <= threshold * 1.6) {
    return { kind: 'wrong-order', matched: best }
  }

  return { kind: 'miss' }
}
