import { WORDS } from './words'
import { gradeOf, type Grade } from './kanjiGrades'

/**
 * お題は「ことば」。漢字のマスと、ひらがなのまま見せる部分（送り仮名や、
 * 3年生までに習わない漢字）を並べて表現する。
 */
export type WordPart =
  | { kind: 'kanji'; char: string; reading: string }
  | { kind: 'kana'; text: string }

export type KanjiRequest = {
  id: string
  /** 使われている漢字の、いちばん上の学年 */
  grade: Grade
  /** ペットのセリフ（ひらがな中心） */
  message: string
  /** ことばの各部分 */
  parts: WordPart[]
  /** 正解時に飛んでいくアイテム */
  item: string
}

export type GradeFilter = Grade | 'all'

const isKanji = (ch: string) => /[一-鿿]/.test(ch)

/** 「青い空」+「あお|そら」 → [漢字 青(あお)][かな い][漢字 空(そら)] */
function parseParts(text: string, readings: string): WordPart[] {
  const rs = readings ? readings.split('|') : []
  const parts: WordPart[] = []
  let ri = 0
  for (const ch of text) {
    if (isKanji(ch)) {
      parts.push({ kind: 'kanji', char: ch, reading: rs[ri++] ?? '' })
    } else {
      const last = parts[parts.length - 1]
      if (last && last.kind === 'kana') last.text += ch
      else parts.push({ kind: 'kana', text: ch })
    }
  }
  return parts
}

export const REQUESTS: KanjiRequest[] = WORDS.map(([text, readings, message, item]) => {
  const parts = parseParts(text, readings)
  const grades = parts.flatMap((p) => (p.kind === 'kanji' ? [gradeOf(p.char) ?? 3] : []))
  return { id: text, grade: Math.max(1, ...grades) as Grade, message, parts, item }
})

export function requestsFor(filter: GradeFilter): KanjiRequest[] {
  return filter === 'all' ? REQUESTS : REQUESTS.filter((r) => r.grade === filter)
}

export function pickRandomRequest(filter: GradeFilter = 'all', exceptId?: string): KanjiRequest {
  const base = requestsFor(filter)
  const pool = base.filter((r) => r.id !== exceptId)
  const list = pool.length > 0 ? pool : base
  return list[Math.floor(Math.random() * list.length)]
}

/** ことば全体のよみ（例：みずたま） */
export function readingOf(req: KanjiRequest): string {
  return req.parts.map((p) => (p.kind === 'kanji' ? p.reading : p.text)).join('')
}

/** ことば全体の表記（例：水玉） */
export function textOf(req: KanjiRequest): string {
  return req.parts.map((p) => (p.kind === 'kanji' ? p.char : p.text)).join('')
}

/** 書く漢字だけを順番に */
export function kanjiPartsOf(req: KanjiRequest): Extract<WordPart, { kind: 'kanji' }>[] {
  return req.parts.filter((p): p is Extract<WordPart, { kind: 'kanji' }> => p.kind === 'kanji')
}
