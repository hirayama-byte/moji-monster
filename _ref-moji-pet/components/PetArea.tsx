import { forwardRef } from 'react'
import AnimalCharacter from './AnimalCharacter'
import { readingOf, type KanjiRequest } from '../data/requests'
import type { Animal } from '../data/animals'

type Props = {
  animal: Animal
  request: KanjiRequest
  /** ごはんをもらって喜んでいる間 true */
  happy: boolean
  /** ことばの漢字を何文字 書き終えたか */
  solvedKanji: number
  /** 全部書き終えて答えを見せてよいとき true */
  revealed: boolean
  friendship: number // 0..100
  hearts: { id: number; dx: number; dy: number }[]
}

/**
 * ペットとお題の吹き出しを横にならべた、背の低いレイアウト。
 * 下の「かく ばしょ」と いっしょに 1画面に入るように、ペットは小さめ・吹き出しは右がわ。
 */
const PetArea = forwardRef<HTMLDivElement, Props>(function PetArea(
  { animal, request, happy, solvedKanji, revealed, friendship, hearts },
  ref,
) {
  // ことばのマス目：漢字は書けた順に現れ、いま書く文字はピンクで光る
  let kanjiSeen = 0
  const wordSlots = request.parts.map((p, i) => {
    if (p.kind === 'kana') {
      return (
        <span key={i} className="text-xl font-bold px-0.5">
          {p.text}
        </span>
      )
    }
    const idx = kanjiSeen++
    const solved = idx < solvedKanji
    const current = idx === solvedKanji && !revealed
    return (
      <span key={i} className="inline-flex flex-col items-center mx-0.5">
        <span className="text-[10px] leading-none text-choco/60 mb-0.5">{p.reading}</span>
        <span
          className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xl font-bold ${
            solved
              ? 'bg-pastel-pink-deep text-white border-pastel-pink-deep animate-pop'
              : current
                ? 'bg-pastel-pink border-pastel-pink-deep border-dashed animate-pulse'
                : 'bg-white border-pastel-pink border-dashed text-choco/30'
          }`}
        >
          {solved ? p.char : '？'}
        </span>
      </span>
    )
  })

  return (
    <section className="flex flex-col gap-2 w-full max-w-sm">
      <div className="flex items-center gap-2 w-full">
        {/* ペット本体（左） */}
        <div ref={ref} className="relative flex-none flex flex-col items-center w-24">
          <div className={`relative select-none drop-shadow-md ${happy ? 'animate-wiggle' : 'animate-bounce-soft'}`}>
            <AnimalCharacter id={animal.id} size={80} mood={happy ? 'happy' : 'idle'} />
          </div>
          <span className="-mt-1 bg-white/90 rounded-full px-2 py-0.5 text-xs font-bold shadow">{animal.name}</span>
          {/* ハートのパーティクル */}
          {hearts.map((h) => (
            <span
              key={h.id}
              className="absolute left-1/2 top-1/3 text-3xl pointer-events-none animate-float-up"
              style={{ '--dx': `${h.dx}px`, '--dy': `${h.dy}px` } as React.CSSProperties}
            >
              💖
            </span>
          ))}
        </div>

        {/* 吹き出し（右）。しっぽはペットのほうを向く */}
        <div
          key={request.id}
          className="relative flex-1 min-w-0 bg-white rounded-[1.5rem] px-3 py-2 shadow-[0_5px_0_#f3c6d8] text-center animate-pop"
        >
          <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rotate-45 rounded-sm" />
          <p className="relative text-base leading-snug">
            {happy ? 'わ〜い！ ありがとう💕' : revealed ? 'せいかい！ すごい！✨' : request.message}
          </p>
          {!happy && (
            <div className="relative mt-1">
              <p className="text-xs text-choco/70">
                おだい：<span className="text-lg font-bold text-pastel-pink-deep mx-0.5">「{readingOf(request)}」</span>
              </p>
              <div className="flex items-end justify-center flex-wrap">{wordSlots}</div>
            </div>
          )}
        </div>
      </div>

      {/* なかよし度ゲージ（細め） */}
      <div className="flex items-center gap-2 text-xs px-1">
        <span className="flex-none">
          なかよし<ruby>度<rt>ど</rt></ruby>
        </span>
        <div className="flex-1 h-3.5 rounded-full bg-white/80 shadow-inner overflow-hidden border-2 border-white">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#ff9ec7,#ffd6e7,#ff9ec7,#ffd6e7)] bg-[length:200%_100%] animate-shimmer transition-all duration-700 ease-out"
            style={{ width: `${friendship}%` }}
          />
        </div>
        <span className="flex-none font-bold">{friendship} / 100</span>
      </div>
    </section>
  )
})

export default PetArea
