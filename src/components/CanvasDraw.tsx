import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { judgeStroke, KANJIVG_SIZE, samplePath, scalePoints, type Judgement, type Point } from '../lib/strokes'

export type CanvasDrawHandle = {
  clear: () => void
}

export type StrokeFeedback = { judgement: Judgement; strokeIndex: number }

type Props = {
  /** お手本の各画（KanjiVG の SVG パス）。順番＝書き順 */
  strokePaths: string[]
  /** 0: なし / 1: ぶしゅをうすく / 2: つぎの画をうすく（はじまりに点） / 3: ぜんぶうすく */
  hintLevel: number
  radicalStrokes: number[]
  disabled?: boolean
  onProgress?: (done: number, total: number) => void
  onFeedback?: (fb: StrokeFeedback) => void
  /** 書く場所の一辺（px）。お題と同じ画面に入るよう GameBoard が決める。なければ最大 24rem */
  boxSize?: number
}

const PEN_COLORS = [
  { name: 'ピンク', value: '#ff7eb6' },
  { name: 'ミント', value: '#4fd1a5' },
  { name: 'ラベンダー', value: '#a78bfa' },
  { name: 'そら', value: '#5bb8ff' },
] as const

const CANVAS_SIZE = 600 // 内部解像度（表示は CSS で正方形にフィット）
const SCALE = CANVAS_SIZE / KANJIVG_SIZE
const PEN_WIDTH = 22
/** これより近ければ同じ画とみなす（px） */
const MATCH_THRESHOLD = 95

const CanvasDraw = forwardRef<CanvasDrawHandle, Props>(function CanvasDraw(
  { strokePaths, hintLevel, radicalStrokes, disabled, onProgress, onFeedback, boxSize },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const current = useRef<Point[]>([])
  const [done, setDone] = useState(0)
  const [color, setColor] = useState<string>(PEN_COLORS[0].value)

  // お手本をキャンバス座標でサンプル & Path2D 化
  const expected = useMemo(() => strokePaths.map((d) => scalePoints(samplePath(d), SCALE)), [strokePaths])
  const path2ds = useMemo(() => strokePaths.map((d) => new Path2D(d)), [strokePaths])

  const strokeTemplate = useCallback(
    (ctx: CanvasRenderingContext2D, index: number, style: string, width = PEN_WIDTH) => {
      if (!path2ds[index]) return
      ctx.save()
      ctx.scale(SCALE, SCALE)
      ctx.strokeStyle = style
      ctx.lineWidth = width / SCALE
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke(path2ds[index])
      ctx.restore()
    },
    [path2ds],
  )

  /** 画面を全部描き直す */
  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // 十字ガイド
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 158, 199, 0.35)'
    ctx.lineWidth = 3
    ctx.setLineDash([14, 14])
    ctx.beginPath()
    ctx.moveTo(CANVAS_SIZE / 2, 0)
    ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE)
    ctx.moveTo(0, CANVAS_SIZE / 2)
    ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2)
    ctx.stroke()
    ctx.restore()

    // ヒントの線（うすいグレー）
    const faint = 'rgba(120, 100, 110, 0.18)'
    const hinted = new Set<number>()
    if (hintLevel >= 3) path2ds.forEach((_, i) => hinted.add(i))
    if (hintLevel >= 1) radicalStrokes.forEach((i) => hinted.add(i))
    if (hintLevel >= 2 && done < path2ds.length) hinted.add(done) // つぎに かく せん（2026-11 もじモンスター: 1画目 → つぎの画）
    hinted.forEach((i) => {
      if (i >= done) strokeTemplate(ctx, i, faint)
    })
    // つぎの画の はじまりに 点を打つ
    if (hintLevel >= 2 && expected[done]) {
      const p = expected[done][0]
      ctx.fillStyle = '#ff9ec7'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 13, 0, Math.PI * 2)
      ctx.fill()
    }

    // 書けた画（お手本どおりの位置に補正して表示）
    for (let i = 0; i < done; i++) strokeTemplate(ctx, i, color)

    // いま書いている線
    const pts = current.current
    if (pts.length > 0) {
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = PEN_WIDTH
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalAlpha = 0.85
      if (pts.length === 1) {
        ctx.beginPath()
        ctx.arc(pts[0].x, pts[0].y, PEN_WIDTH / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
  }, [color, done, expected, hintLevel, path2ds, radicalStrokes, strokeTemplate])

  useEffect(render, [render])

  // お題が変わるときは親が key を変えて作り直すので、ここでのリセットは不要

  useImperativeHandle(ref, () => ({
    clear() {
      setDone(0)
      current.current = []
      onProgress?.(0, strokePaths.length)
    },
  }))

  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    }
  }

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || done >= strokePaths.length) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* ペンによっては捕まえられないことがあるが、描画は続けられる */
    }
    drawing.current = true
    current.current = [toCanvasPoint(e)]
    render()
  }

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    current.current.push(toCanvasPoint(e))
    render()
  }

  const handleUp = () => {
    if (!drawing.current) return
    drawing.current = false
    const pts = current.current
    current.current = []
    if (pts.length === 0) return

    const judgement = judgeStroke(pts, expected, done, MATCH_THRESHOLD)
    onFeedback?.({ judgement, strokeIndex: done })
    if (judgement.kind === 'ok') {
      const next = done + 1
      setDone(next)
      onProgress?.(next, strokePaths.length)
    } else {
      render()
    }
  }

  const total = strokePaths.length

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="relative w-full max-w-sm aspect-square" style={boxSize ? { width: boxSize } : undefined}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onPointerLeave={handleUp}
          className={`w-full h-full rounded-[2rem] bg-white shadow-[0_8px_0_#f3c6d8,0_12px_30px_rgba(255,158,199,0.3)] border-4 border-pastel-pink ${
            disabled ? 'opacity-70' : 'cursor-crosshair'
          }`}
        />
        <span className="absolute -top-3 -left-3 text-3xl rotate-[-15deg] select-none pointer-events-none">✏️</span>
        {/* 画数カウンター */}
        <span className="absolute -top-3 -right-2 bg-white rounded-full px-3 py-1 text-sm font-bold shadow select-none">
          {done} / {total} かく
        </span>
      </div>

      {/* ペンの色えらび */}
      <div className="flex items-center gap-3">
        <span className="text-sm">ペンの いろ：</span>
        {PEN_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-label={c.name}
            onClick={() => setColor(c.value)}
            className={`w-9 h-9 rounded-full border-4 transition-transform active:scale-90 ${
              color === c.value ? 'border-white scale-110 shadow-md' : 'border-transparent'
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
    </div>
  )
})

export default CanvasDraw
