// ずかん。8けいとう × 3だんかい。あった すがたは なまえつき、まだの すがたは かげだけ
import MonsterArt from './MonsterArt'
import { LINES, TYPES } from '../data/monsters'
import { speak } from '../lib/speak'
import type { IslandState } from '../hooks/useIsland'

export default function BookView({ state, onBack, onReset }: { state: IslandState; onBack: () => void; onReset: () => void }) {
  const total = LINES.length * 3
  return (
    <div className="h-full w-full flex flex-col p-4 gap-3 overflow-auto">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-lg font-bold bg-white/80 rounded-full px-5 py-2 shadow active:scale-95">← しまに もどる</button>
        <div className="text-2xl font-bold text-choco">📖 ずかん</div>
        <div className="ml-auto text-lg font-bold bg-white/85 rounded-full px-4 py-2 shadow" id="bookCount">{state.seen.length} / {total}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LINES.map((l) => (
          <div key={l.id} className="flex items-end justify-around bg-white/80 rounded-[1.6rem] p-3 border-4" style={{ borderColor: TYPES[l.type].soft }}>
            {([1, 2, 3] as const).map((s) => {
              const seen = state.seen.includes(`${l.id}:${s}`)
              return (
                <button key={s} type="button" className="flex flex-col items-center" onClick={() => seen && speak(`${l.names[s - 1]}。 ${l.lines[s - 1]}`)} aria-label={seen ? l.names[s - 1] : 'まだ あっていない'}>
                  <MonsterArt lineId={l.id} stage={s} size={56 + s * 18} silhouette={!seen} />
                  <span className="text-lg font-bold text-choco">{seen ? l.names[s - 1] : '？？？'}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-choco/50">かきじゅんの データ: <a className="underline" href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener">KanjiVG</a>（CC BY-SA 3.0）／ モンスターは すべて オリジナル</span>
        <button
          type="button"
          onClick={() => { if (window.confirm('しまを さいしょから やりなおしますか？（なかまと ずかんが ぜんぶ きえます）')) onReset() }}
          className="text-sm text-choco/50 underline"
        >
          さいしょから やりなおす（おうちの ひと むけ）
        </button>
      </div>
    </div>
  )
}
