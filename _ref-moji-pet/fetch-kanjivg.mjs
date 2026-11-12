// KanjiVG (https://github.com/KanjiVG/kanjivg, CC BY-SA 3.0) から
// お題で使う漢字の画データ・部首・部品を取得し、src/data/kanjivg.json に書き出す。
//   node scripts/fetch-kanjivg.mjs            … src/data/words.ts に出てくる漢字を全部
//   node scripts/fetch-kanjivg.mjs 火 山 …    … 指定した漢字だけ追加
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const outPath = join(here, '..', 'src', 'data', 'kanjivg.json')
const wordsPath = join(here, '..', 'src', 'data', 'words.ts')

let kanjiList = process.argv.slice(2)
if (kanjiList.length === 0) {
  const src = readFileSync(wordsPath, 'utf8')
  kanjiList = [...new Set(src.match(/[一-鿿]/g) ?? [])]
}

/** @type {Record<string, {strokes: string[], radical?: {element: string, strokes: number[]}, parts: string[]}>} */
const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : {}
// 旧形式（配列だけ）は作り直す
for (const k of Object.keys(existing)) if (Array.isArray(existing[k])) delete existing[k]

const todo = kanjiList.filter((k) => !existing[k])
console.log(`${kanjiList.length} kanji, ${todo.length} to fetch`)

/** <g ...> の属性を読む */
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]))

for (const kanji of todo) {
  const code = kanji.codePointAt(0).toString(16).padStart(5, '0')
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`${kanji}: HTTP ${res.status}`)
    continue
  }
  const svg = await res.text()

  // 画：<path id="kvg:06c34-s1" ... d="..."/> を番号順に
  const strokeTags = [...svg.matchAll(/<path[^>]*id="kvg:[0-9a-f]+-s(\d+)"[^>]*\sd="([^"]+)"/g)]
    .map((m) => ({ n: Number(m[1]), d: m[2] }))
    .sort((a, b) => a.n - b.n)
  const strokes = strokeTags.map((s) => s.d)
  if (strokes.length === 0) {
    console.error(`${kanji}: no strokes parsed`)
    continue
  }

  // StrokePaths グループだけを見る（StrokeNumbers は無視）
  const body = svg.slice(svg.indexOf('kvg:StrokePaths'), svg.indexOf('kvg:StrokeNumbers'))

  // 部首：kvg:radical="general"（なければ tradit）が付いた <g> と、その中の画番号
  const groups = [...body.matchAll(/<g\b([^>]*)>/g)].map((m) => ({ index: m.index, a: attrs(m[0]) }))
  const findGroupStrokes = (startIndex) => {
    // 開始位置から対応する </g> までを切り出し、含まれる画番号を集める
    let depth = 0
    let i = startIndex
    const re = /<g\b|<\/g>/g
    re.lastIndex = startIndex
    let m
    let end = body.length
    while ((m = re.exec(body))) {
      if (m[0] === '</g>') {
        depth--
        if (depth === 0) {
          end = m.index
          break
        }
      } else depth++
      i = m.index
    }
    void i
    const inner = body.slice(startIndex, end)
    return [...inner.matchAll(/-s(\d+)"/g)].map((x) => Number(x[1]) - 1)
  }
  let radical
  const radGroup =
    groups.find((g) => g.a['kvg:radical'] === 'general' && g.a['kvg:element']) ??
    groups.find((g) => g.a['kvg:radical'] === 'tradit' && g.a['kvg:element'])
  if (radGroup) radical = { element: radGroup.a['kvg:element'], strokes: findGroupStrokes(radGroup.index) }

  // 部品：いちばん外側の <g> の直下にある <g kvg:element="…"> を順に
  const top = groups[0]
  const parts = []
  if (top) {
    let depth = 0
    const re = /<g\b[^>]*>|<\/g>/g
    re.lastIndex = top.index
    let m
    while ((m = re.exec(body))) {
      if (m[0] === '</g>') {
        depth--
        if (depth === 0) break
      } else {
        depth++
        if (depth === 2) {
          const el = attrs(m[0])['kvg:element']
          if (el) parts.push(el)
        }
      }
    }
  }

  existing[kanji] = { strokes, radical, parts }
  console.log(`${kanji}: ${strokes.length}画 部首=${radical?.element ?? '-'} 部品=${parts.join('+') || '-'}`)
}

writeFileSync(outPath, JSON.stringify(existing, null, 1) + '\n')
console.log(`wrote ${outPath} (${Object.keys(existing).length} kanji)`)
