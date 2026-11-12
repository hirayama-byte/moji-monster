export type Animal = {
  id: string
  emoji: string
  /** 名前（ひらがな／カタカナ） */
  name: string
  /** 動物園でのひとこと */
  greeting: string
}

/** 仲間入りする順番。先頭の動物からスタートする */
export const ANIMALS: Animal[] = [
  { id: 'dog', emoji: '🐶', name: 'いぬ', greeting: 'わんわん！ いっしょに あそぼ！' },
  { id: 'rabbit', emoji: '🐰', name: 'うさぎ', greeting: 'ぴょんぴょん♪ はっぱ だいすき' },
  { id: 'cat', emoji: '🐱', name: 'ねこ', greeting: 'にゃ〜ん。ひなたぼっこ きもちいい' },
  { id: 'hamster', emoji: '🐹', name: 'ハムスター', greeting: 'ほっぺに たくさん つめちゃうよ' },
  { id: 'fox', emoji: '🦊', name: 'きつね', greeting: 'コンコン！ ふさふさ しっぽ みて！' },
  { id: 'panda', emoji: '🐼', name: 'パンダ', greeting: 'ささ たべて ごろごろ〜' },
  { id: 'koala', emoji: '🐨', name: 'コアラ', greeting: 'ねむいよ〜…ふぁ〜' },
  { id: 'penguin', emoji: '🐧', name: 'ペンギン', greeting: 'よちよち あるくの とくいだよ' },
  { id: 'frog', emoji: '🐸', name: 'かえる', greeting: 'ケロケロ！ あめの ひ だいすき' },
  { id: 'pig', emoji: '🐷', name: 'ぶた', greeting: 'ブヒブヒ♪ おなか いっぱい！' },
  { id: 'cow', emoji: '🐮', name: 'うし', greeting: 'モ〜。くさはら さいこう' },
  { id: 'monkey', emoji: '🐵', name: 'さる', greeting: 'ウキッ！ きのぼり しようよ' },
  { id: 'tiger', emoji: '🐯', name: 'とら', greeting: 'ガオー！ でも ほんとは やさしいよ' },
  { id: 'lion', emoji: '🦁', name: 'ライオン', greeting: 'どうぶつえんの おうさまだぞ！' },
  { id: 'hedgehog', emoji: '🦔', name: 'ハリネズミ', greeting: 'ちくちく だけど なかよくしてね' },
  { id: 'turtle', emoji: '🐢', name: 'かめ', greeting: 'ゆっくり いこう〜' },
  { id: 'parrot', emoji: '🦜', name: 'オウム', greeting: 'オハヨウ！ オハヨウ！' },
  { id: 'elephant', emoji: '🐘', name: 'ぞう', greeting: 'パオーン！ おみず かけっこ しよ' },
  { id: 'giraffe', emoji: '🦒', name: 'きりん', greeting: 'たかい ところの はっぱ とどくよ' },
  { id: 'unicorn', emoji: '🦄', name: 'ユニコーン', greeting: 'キラキラ✨ ひみつの なかまだよ' },
]

export const FRIENDSHIP_MAX = 100
export const FRIENDSHIP_GAIN = 15

export function animalById(id: string): Animal {
  return ANIMALS.find((a) => a.id === id) ?? ANIMALS[0]
}
