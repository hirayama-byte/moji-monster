import { ANIMALS, animalById, FRIENDSHIP_MAX } from '../data/animals'
import type { ZooState } from '../hooks/useZoo'
import KawaiiButton from './KawaiiButton'
import AnimalCharacter from './AnimalCharacter'

type Props = {
  zoo: ZooState
  onSelect: (id: string) => void
  onBackToCare: () => void
}

export default function ZooView({ zoo, onSelect, onBackToCare }: Props) {
  const unlocked = zoo.unlocked.map(animalById)
  const lockedCount = ANIMALS.length - unlocked.length

  return (
    <section className="flex flex-col items-center gap-5 w-full">
      <div className="text-center">
        <p className="text-lg font-bold">
          どうぶつ {unlocked.length} / {ANIMALS.length} ひき
        </p>
        <p className="text-sm text-choco/70">
          なかよし<ruby>度<rt>ど</rt></ruby>を {FRIENDSHIP_MAX} にすると あたらしい なかまが やってくるよ
        </p>
      </div>

      {/* 動物園の広場：仲間たちがゆらゆら歩き回る */}
      <div className="relative w-full max-w-sm h-64 rounded-[2rem] overflow-hidden border-4 border-white shadow-[0_8px_0_#bfe8d6] bg-[linear-gradient(180deg,#d6ecff_0%,#d6ecff_45%,#c8f5e4_45%,#b6edd5_100%)]">
        <span className="absolute top-3 left-4 text-3xl">☀️</span>
        <span className="absolute top-5 right-6 text-2xl opacity-80">☁️</span>
        <span className="absolute bottom-2 left-2 text-2xl">🌳</span>
        <span className="absolute bottom-2 right-3 text-2xl">🌷</span>
        {/* さく */}
        <div className="absolute bottom-0 inset-x-0 h-3 bg-[repeating-linear-gradient(90deg,#fff_0_8px,transparent_8px_16px)] opacity-80" />

        {unlocked.map((a, i) => {
          const n = unlocked.length
          // 横に等間隔で並べ、奥行き感のために上下をずらす
          const left = n === 1 ? 50 : 12 + (76 * i) / (n - 1)
          const bottom = 18 + (i % 3) * 14
          const isActive = a.id === zoo.activeId
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a.id)}
              aria-label={`${a.name}を おせわする`}
              className="absolute -translate-x-1/2 select-none transition-transform active:scale-90 animate-bounce-soft"
              style={{ left: `${left}%`, bottom: `${bottom}%`, animationDelay: `${(i * 0.37) % 1.6}s`, zIndex: 3 - (i % 3) }}
            >
              <span className="relative inline-block drop-shadow-md">
                <AnimalCharacter id={a.id} size={n > 6 ? 44 : 60} mood={isActive ? 'happy' : 'idle'} />
                {isActive && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-base animate-pop">💖</span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* ずかん：仲間になった動物と、まだの動物 */}
      <div className="w-full max-w-sm bg-white/80 rounded-[2rem] p-4 shadow-[0_6px_0_#f3c6d8]">
        <p className="text-sm font-bold mb-3 text-center">
          どうぶつ<ruby>図鑑<rt>ずかん</rt></ruby>（タップで おせわする こを えらべるよ）
        </p>
        <div className="grid grid-cols-5 gap-2">
          {ANIMALS.map((a) => {
            const isUnlocked = zoo.unlocked.includes(a.id)
            const fr = zoo.friendship[a.id] ?? 0
            const isActive = a.id === zoo.activeId
            return (
              <button
                key={a.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => onSelect(a.id)}
                className={`flex flex-col items-center rounded-2xl p-1 transition-all active:scale-95 ${
                  isActive ? 'bg-pastel-pink ring-4 ring-pastel-pink-deep' : isUnlocked ? 'bg-pastel-cream' : 'bg-gray-100'
                }`}
              >
                <span className={`flex items-end justify-center h-12 ${isUnlocked ? '' : 'grayscale opacity-30 blur-[1px]'}`}>
                  {isUnlocked ? <AnimalCharacter id={a.id} size={36} /> : <span className="text-3xl">❓</span>}
                </span>
                <span className="text-[10px] leading-tight mt-0.5 truncate w-full text-center">
                  {isUnlocked ? a.name : '？？？'}
                </span>
                {isUnlocked && (
                  <span className="mt-1 h-1.5 w-full rounded-full bg-white overflow-hidden">
                    <span className="block h-full bg-pastel-pink-deep" style={{ width: `${fr}%` }} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {lockedCount > 0 && (
          <p className="text-xs text-center mt-3 text-choco/60">あと {lockedCount} ひき かくれているよ…！</p>
        )}
      </div>

      <KawaiiButton onClick={onBackToCare} className="w-full max-w-sm">
        ✏️ おせわに もどる
      </KawaiiButton>
    </section>
  )
}
