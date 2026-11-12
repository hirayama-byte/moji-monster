// KanjiVG (https://github.com/KanjiVG/kanjivg, CC BY-SA 3.0) から、
// モンスターの名前に出てくる ひらがな・カタカナ の画データを取り出して src/data/kana.json に書き出す。
//   node scripts/fetch-kana.mjs
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const outPath = join(here, '..', 'src', 'data', 'kana.json')
const src = readFileSync(join(here, '..', 'src', 'data', 'monsters.ts'), 'utf8')
const kana = [...new Set(src.match(/names: \[[^\]]+\]/g).join('').match(/[ぁ-ゖァ-ー]/g))]

const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : {}
const todo = kana.filter((k) => !existing[k])
console.log(`${kana.length} kana, ${todo.length} to fetch: ${todo.join('')}`)

for (const k of todo) {
  const code = k.codePointAt(0).toString(16).padStart(5, '0')
  const res = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`)
  if (!res.ok) { console.error(`${k}: HTTP ${res.status}`); continue }
  const svg = await res.text()
  const strokes = [...svg.matchAll(/<path[^>]*id="kvg:[0-9a-f]+-s(\d+)"[^>]*\sd="([^"]+)"/g)]
    .map((m) => ({ n: Number(m[1]), d: m[2] }))
    .sort((a, b) => a.n - b.n)
    .map((s) => s.d)
  if (!strokes.length) { console.error(`${k}: no strokes`); continue }
  existing[k] = strokes
  console.log(`${k}: ${strokes.length}画`)
}

writeFileSync(outPath, JSON.stringify(existing, null, 1) + '\n')
console.log('saved', Object.keys(existing).length)
