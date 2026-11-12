// しま（ホーム）。4つの エリアに なかまが すんでいて、かくたびに ふえて にぎやかに なる
import { useMemo, useState } from 'react'
import MonsterArt from './MonsterArt'
import { lineById, TYPES, type MonType } from '../data/monsters'
import { speak } from '../lib/speak'
import type { IslandState, Mon } from '../hooks/useIsland'

const AREAS: { type: MonType; deco: string[]; bg: string }[] = [
  { type: 'fire', deco: ['🌋', '🪨', '🔥'], bg: 'linear-gradient(160deg,#ffd9c2,#ffb08a)' },
  { type: 'water', deco: ['🌊', '🐚', '🫧'], bg: 'linear-gradient(160deg,#cfeaff,#8fd0ff)' },
  { type: 'grass', deco: ['🌳', '🌷', '🍄'], bg: 'linear-gradient(160deg,#d9f7d6,#9be3a0)' },
  { type: 'thunder', deco: ['⛰️', '⚡', '☁️'], bg: 'linear-gradient(160deg,#fff6c9,#ffe27a)' },
]

/** uid から いつも同じ ばしょ（0〜1） */
function spot(uid: number) {
  const a = Math.sin(uid * 12.9898) * 43758.5453
  const b = Math.sin(uid * 78.233) * 12543.123
  return { x: a - Math.floor(a), y: b - Math.floor(b), d: ((uid * 37) % 20) / 10 }
}

const SIZE: Record<number, number> = { 1: 54, 2: 70, 3: 88 }

type Props = {
  state: IslandState
  onWrite: () => void
  onWild: () => void
  onBook: () => void
}

export default function IslandView({ state, onWrite, onWild, onBook }: Props) {
  const [bubble, setBubble] = useState<{ uid: number; text: string } | null>(null)
  const byArea = useMemo(() => {
    const m: Record<MonType, Mon[]> = { fire: [], water: [], grass: [], thunder: [] }
    state.mons.forEach((x) => m[lineById(x.lineId).type].push(x))
    return m
  }, [state.mons])

  const tap = (m: Mon) => {
    const l = lineById(m.lineId)
    const text = `${l.names[m.stage - 1]}「${l.lines[m.stage - 1]}」`
    setBubble({ uid: m.uid, text })
    speak(`${l.names[m.stage - 1]}。 ${l.lines[m.stage - 1]}`)
    window.setTimeout(() => setBubble((b) => (b?.uid === m.uid ? null : b)), 2600)
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* うえの バー */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="text-2xl font-bold text-choco drop-shadow-sm">🏝️ もじモンスターの しま</div>
        <div className="ml-auto bg-white/85 rounded-full px-4 py-2 text-lg font-bold shadow" id="monCount">なかま {state.mons.length} ひき</div>
        <button type="button" id="bookBtn" onClick={onBook} className="bg-white rounded-full px-5 py-2 text-lg font-bold shadow active:scale-95">📖 ずかん</button>
      </div>

      {/* 4つの エリア */}
      <div className="relative flex-1 grid grid-cols-2 grid-rows-2 gap-2 px-3 pb-3 min-h-0">
        {AREAS.map((a) => {
          const t = TYPES[a.type]
          const list = byArea[a.type]
          return (
            <div key={a.type} data-area={a.type} className="relative rounded-[2rem] overflow-hidden shadow-inner border-4 border-white/70" style={{ background: a.bg }}>
              <div className="absolute top-2 left-3 text-base font-bold bg-white/75 rounded-full px-3 py-1 z-10">
                {t.emoji} {t.area}（{t.label}）<span className="ml-1 text-choco/70">{list.length}</span>
              </div>
              {a.deco.map((d, i) => (
                <span key={i} className="absolute select-none pointer-events-none opacity-70" style={{ fontSize: 44 - i * 6, right: 10 + i * 46, bottom: 6 + (i % 2) * 30 }}>{d}</span>
              ))}
              {list.map((m) => {
                const p = spot(m.uid)
                const s = SIZE[m.stage]
                return (
                  <button
                    key={m.uid}
                    type="button"
                    data-mon={m.lineId}
                    onClick={() => tap(m)}
                    className="absolute animate-bounce-soft"
                    style={{ left: `calc(${4 + p.x * 80}% )`, top: `calc(${16 + p.y * 62}%)`, animationDelay: `${p.d}s`, zIndex: Math.round(p.y * 50) + m.stage, marginLeft: -s / 4 }}
                    aria-label={lineById(m.lineId).names[m.stage - 1]}
                  >
                    <MonsterArt lineId={m.lineId} stage={m.stage} size={s} />
                    {bubble?.uid === m.uid && (
                      <span className="absolute left-1/2 -translate-x-1/2 -top-9 whitespace-nowrap bg-white rounded-2xl px-3 py-1 text-sm font-bold shadow animate-pop">{bubble.text}</span>
                    )}
                  </button>
                )
              })}
              {list.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-choco/50 text-lg font-bold pointer-events-none">まだ だれも いないよ</div>
              )}
            </div>
          )
        })}

        {/* やせいの モンスター */}
        {state.wild && (
          <button type="button" id="wildBtn" onClick={onWild} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex flex-col items-center bg-white/90 rounded-[2rem] px-6 py-3 shadow-2xl border-4 border-[#ffcf4d] animate-pop">
            <span className="text-lg font-bold text-[#d4486e]">❗ やせいの モンスターが きた！</span>
            <span className="animate-wiggle inline-block"><MonsterArt lineId={state.wild.lineId} stage={1} size={110} /></span>
            <span className="text-base font-bold">{lineById(state.wild.lineId).names[0]}（{TYPES[lineById(state.wild.lineId).type].label}タイプ）</span>
            <span className="mt-1 text-lg font-bold bg-pastel-pink-deep text-white rounded-full px-5 py-2">なかよく なる！</span>
          </button>
        )}
      </div>

      {/* したの ボタン */}
      <div className="flex justify-center pb-4">
        <button type="button" id="writeBtn" onClick={onWrite} className="min-h-20 px-10 rounded-full text-3xl font-bold bg-pastel-pink-deep text-white shadow-[0_8px_0_#e07aa8] active:translate-y-1 active:shadow-[0_3px_0_#e07aa8]">
          ✏️ なまえを かく
        </button>
      </div>
    </div>
  )
}
