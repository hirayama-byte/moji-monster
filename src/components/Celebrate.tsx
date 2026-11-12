// かけた あとの おいわい（ふえた／しんか／なかまに なった／やせいが きた）
import { useEffect } from 'react'
import MonsterArt from './MonsterArt'
import { lineById, TYPES } from '../data/monsters'
import { speak } from '../lib/speak'
import type { Stage } from '../hooks/useIsland'

export type CelebrateItem =
  | { kind: 'added'; lineId: string; stage: Stage }
  | { kind: 'evolved'; lineId: string; stage: Stage }
  | { kind: 'friend'; lineId: string }
  | { kind: 'wild'; lineId: string }

function info(it: CelebrateItem) {
  const l = lineById(it.lineId)
  switch (it.kind) {
    case 'added':
      return { title: `${l.names[it.stage - 1]}が ふえた！`, say: `${l.names[it.stage - 1]}が ふえたよ！`, stage: it.stage, from: 0 }
    case 'evolved':
      return { title: `しんか した！`, sub: `${l.names[it.stage - 2]} → ${l.names[it.stage - 1]}`, say: `おめでとう！ ${l.names[it.stage - 2]}が ${l.names[it.stage - 1]}に しんか したよ！ 「${l.lines[it.stage - 1]}」`, stage: it.stage, from: it.stage - 1 }
    case 'friend':
      return { title: `${l.names[0]}が なかまに なった！`, sub: `これから ${l.names[0]}の なまえも かけるよ`, say: `やったね！ ${l.names[0]}が なかまに なったよ！`, stage: 1, from: 0 }
    case 'wild':
      return { title: `やせいの ${l.names[0]}が きた！`, sub: `${TYPES[l.type].label}タイプ。しまで まってるよ`, say: `あっ！ やせいの ${l.names[0]}が きたよ！`, stage: 1, from: 0 }
  }
}

export default function Celebrate({ item, onNext }: { item: CelebrateItem; onNext: () => void }) {
  const x = info(item)
  useEffect(() => { speak(x.say) }, [x.say])
  const big = item.kind === 'evolved' || item.kind === 'friend'
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30" onClick={onNext}>
      <div role="dialog" aria-label={x.title} className="relative bg-white rounded-[2.5rem] px-10 py-8 shadow-2xl flex flex-col items-center gap-3 animate-pop max-w-[90vw]">
        {big && <div className="absolute -top-6 text-5xl">🎉✨🎉</div>}
        <div className="text-3xl font-bold text-choco text-center" id="celebTitle">{x.title}</div>
        {x.sub && <div className="text-xl font-bold text-choco/70 text-center">{x.sub}</div>}
        <div className="flex items-end gap-4">
          {x.from > 0 && (
            <>
              <MonsterArt lineId={item.lineId} stage={x.from as Stage} size={110} />
              <span className="text-4xl pb-10">➡️</span>
            </>
          )}
          <span className="animate-bounce-soft inline-block">
            <MonsterArt lineId={item.lineId} stage={x.stage as Stage} size={big ? 200 : 150} mood="happy" />
          </span>
        </div>
        <button type="button" id="celebNext" onClick={(e) => { e.stopPropagation(); onNext() }} className="mt-2 min-h-16 px-10 rounded-full text-2xl font-bold bg-pastel-pink-deep text-white shadow-[0_6px_0_#e07aa8] active:translate-y-1">
          やったー！
        </button>
      </div>
    </div>
  )
}
