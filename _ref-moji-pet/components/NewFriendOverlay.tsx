import type { Animal } from '../data/animals'
import KawaiiButton from './KawaiiButton'
import AnimalCharacter from './AnimalCharacter'

type Props = {
  animal: Animal
  onClose: () => void
}

/** なかよし度100で新しい動物が仲間入りしたときのお祝い画面 */
export default function NewFriendOverlay({ animal, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pastel-lavender/70 backdrop-blur-sm px-6">
      {/* 紙吹雪 */}
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          className="absolute text-2xl animate-float-up pointer-events-none"
          style={
            {
              left: `${(i * 7.3) % 100}%`,
              top: `${30 + ((i * 13) % 40)}%`,
              animationDelay: `${(i % 5) * 0.15}s`,
              animationDuration: '2s',
              '--dx': `${((i % 4) - 1.5) * 40}px`,
              '--dy': `${-120 - (i % 3) * 40}px`,
            } as React.CSSProperties
          }
        >
          {['🎉', '✨', '💖', '⭐'][i % 4]}
        </span>
      ))}

      <div className="relative bg-white rounded-[2.5rem] px-8 py-8 text-center shadow-[0_10px_0_#f3c6d8] max-w-sm w-full animate-pop">
        <p className="text-lg font-bold text-pastel-pink-deep">🎊 あたらしい なかまが きたよ！ 🎊</p>
        <div className="my-4 animate-wiggle inline-block">
          <AnimalCharacter id={animal.id} size={140} mood="happy" />
        </div>
        <p className="text-2xl font-bold">{animal.name}</p>
        <p className="mt-2 text-choco/80 leading-relaxed">「{animal.greeting}」</p>
        <KawaiiButton onClick={onClose} className="mt-6 w-full">
          どうぶつえんに いれる 🏡
        </KawaiiButton>
      </div>
    </div>
  )
}
