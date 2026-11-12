// どの モンスターの なまえを かく？（やせいの子と なかよくなる ときは、つよい タイプの なかまだけ）
import MonsterArt from './MonsterArt'
import { EVOLVE_AT, LINES, lineById, STRONG_AGAINST, TYPES } from '../data/monsters'
import type { IslandState } from '../hooks/useIsland'

type Props = {
  state: IslandState
  /** やせいの子と なかよくなる ため（その子に つよい タイプだけ えらべる） */
  wildLineId?: string
  onPick: (lineId: string) => void
  onBack: () => void
}

export default function PickScreen({ state, wildLineId, onPick, onBack }: Props) {
  const wild = wildLineId ? lineById(wildLineId) : null
  const strong = wild ? STRONG_AGAINST[wild.type] : null
  const lines = LINES.filter((l) => state.unlocked.includes(l.id) || !wild)

  return (
    <div className="h-full w-full flex flex-col p-4 gap-3 overflow-auto">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-lg font-bold bg-white/80 rounded-full px-5 py-2 shadow active:scale-95">← しまに もどる</button>
        <div className="text-2xl font-bold text-choco">
          {wild ? (
            <>
              <span style={{ color: TYPES[wild.type].color }}>{TYPES[wild.type].label}</span>タイプには… <span style={{ color: TYPES[strong![0]].color }}>{strong!.map((t) => TYPES[t].label).join('・')}</span>タイプが つよい！
            </>
          ) : (
            'だれの なまえを かく？'
          )}
        </div>
      </div>
      {wild && <div className="text-lg font-bold text-choco/80">つよい タイプの なかまを えらんで、なまえを かこう。{wild.names[0]}と なかよく なれるよ！</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lines.map((l) => {
          const open = state.unlocked.includes(l.id)
          const st = state.stage[l.id]
          const t = TYPES[l.type]
          const ok = !strong || strong.includes(l.type)
          const w = state.stageWrites[l.id] ?? 0
          return (
            <button
              key={l.id}
              type="button"
              data-pick={l.id}
              disabled={!open || !ok}
              onClick={() => onPick(l.id)}
              className={`relative flex flex-col items-center rounded-[1.6rem] p-3 border-4 shadow-md transition-transform active:scale-95 disabled:active:scale-100 ${open && ok ? 'bg-white' : 'bg-white/50'} ${ok && wild ? 'ring-4 ring-[#ffcf4d]' : ''}`}
              style={{ borderColor: open ? t.soft : 'transparent', opacity: open && ok ? 1 : 0.55 }}
            >
              <span className="absolute top-2 left-2 text-xs font-bold rounded-full px-2 py-0.5" style={{ background: t.soft, color: t.color }}>{t.emoji}{t.label}</span>
              <MonsterArt lineId={l.id} stage={open ? st : 1} size={110} silhouette={!open} />
              <span className="text-2xl font-bold text-choco">{open ? l.names[st - 1] : '？？？'}</span>
              {open ? (
                st < 3 ? (
                  <span className="text-sm font-bold text-choco/70 flex items-center gap-1" aria-label={`しんかまで あと ${EVOLVE_AT - w}かい`}>
                    しんかまで {Array.from({ length: EVOLVE_AT }).map((_, i) => (i < w ? '★' : '☆')).join('')}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-[#d4486e]">👑 さいしゅう しんか</span>
                )
              ) : (
                <span className="text-sm font-bold text-choco/60">やせいで あえるかも</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
