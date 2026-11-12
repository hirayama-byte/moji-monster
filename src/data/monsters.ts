// もじモンスターの一覧（すべてオリジナル）。4タイプ × 2けいとう × 3だんかい = 24たい
// name は書くお題そのもの（ひらがな／カタカナ）。stage が上がるほど少し長くなる

export type MonType = 'fire' | 'water' | 'grass' | 'thunder'

export const TYPES: Record<MonType, { label: string; area: string; color: string; soft: string; emoji: string }> = {
  fire: { label: 'ほのお', area: 'かざん', color: '#ff7a45', soft: '#ffe1d2', emoji: '🔥' },
  water: { label: 'みず', area: 'うみ', color: '#3fa7ff', soft: '#d8eeff', emoji: '💧' },
  grass: { label: 'くさ', area: 'もり', color: '#4cc46a', soft: '#dcf5e0', emoji: '🌱' },
  thunder: { label: 'でんき', area: 'かみなりのおか', color: '#f5c400', soft: '#fff4c2', emoji: '⚡' },
}

/** 「〇〇タイプに つよい」タイプ（相性）。あいて（やせい）の タイプ → 勝てる タイプ */
export const STRONG_AGAINST: Record<MonType, MonType[]> = {
  fire: ['water'], // ほのお には みず
  water: ['grass', 'thunder'], // みず には くさ・でんき
  grass: ['fire'], // くさ には ほのお
  thunder: ['grass'], // でんき には くさ
}

export type Line = {
  id: string
  type: MonType
  /** 'a' はカタカナ、'b' はひらがな の名前 */
  kana: 'katakana' | 'hiragana'
  /** 見た目のかたち（MonsterArt で使う） */
  body: 'round' | 'tall'
  names: [string, string, string]
  /** 体の色（なければ タイプの色） */
  tint?: string
  /** ひとこと（なかまになったとき） */
  lines: [string, string, string]
}

export const LINES: Line[] = [
  { id: 'achimo', type: 'fire', kana: 'katakana', body: 'round', names: ['アチモ', 'アチモス', 'アチモグラン'], lines: ['ぽかぽか するよ！', 'もえて きた！', 'かざんの おうさまだ！'] },
  { id: 'hokapi', tint: '#ffa53a', type: 'fire', kana: 'hiragana', body: 'tall', names: ['ほかぴ', 'ほかぽん', 'ほかだいおう'], lines: ['あったかいね', 'ほっかほか！', 'みんなを あたためるぞ'] },
  { id: 'zabun', type: 'water', kana: 'katakana', body: 'round', names: ['ザブン', 'ザブリン', 'ザブリオン'], lines: ['ざぶーん！', 'およぐの だいすき', 'うみの まもりがみ'] },
  { id: 'pukuru', tint: '#41c3d8', type: 'water', kana: 'hiragana', body: 'tall', names: ['ぷくる', 'ぷくまる', 'おおぷくまる'], lines: ['ぷくぷく', 'あわが いっぱい', 'おおきな あわの おやぶん'] },
  { id: 'morimo', type: 'grass', kana: 'katakana', body: 'round', names: ['モリモ', 'モリモン', 'モリモジャ'], lines: ['もりもり げんき', 'はっぱが ふえた', 'もりの ぬしだよ'] },
  { id: 'mebu', tint: '#9acd32', type: 'grass', kana: 'hiragana', body: 'tall', names: ['めぶ', 'めぶき', 'めぶきさま'], lines: ['めが でたよ', 'すくすく そだつ', 'はなを さかせるよ'] },
  { id: 'biriko', type: 'thunder', kana: 'katakana', body: 'round', names: ['ビリコ', 'ビリボン', 'ビリボルト'], lines: ['びりっ！', 'びりびり パワー', 'かみなりの ゆうしゃ'] },
  { id: 'pachi', tint: '#ffb020', type: 'thunder', kana: 'hiragana', body: 'tall', names: ['ぱち', 'ぱちまる', 'ぱちらいおう'], lines: ['ぱちっ', 'ぱちぱち ひかる', 'いなずまの おう'] },
]

/** さいしょから かける けいとう（タイプごとに1つ）。のこりは やせいの モンスターと なかよくなると ふえる */
export const STARTER_LINES = ['achimo', 'zabun', 'morimo', 'pachi']

/** なんかい かくと しんかするか（だんかい1→2、2→3） */
export const EVOLVE_AT = 3

export const lineById = (id: string) => LINES.find((l) => l.id === id)!

/** お題に出てくる かな（画データの取得に使う） */
export function allKana(): string[] {
  return [...new Set(LINES.flatMap((l) => l.names.join('').split('')))]
}
