// もじモンスターの見た目（すべてオリジナル）。けいとう × だんかい で描き分ける。
// 体の形（まる／たまご）× タイプの飾り（ほのお・ひれ・はっぱ・いなずま）。だんかいが上がると飾りが増える
import { lineById, TYPES, type MonType } from '../data/monsters'

type Props = {
  lineId: string
  stage: 1 | 2 | 3
  size?: number
  mood?: 'normal' | 'happy'
  /** シルエット（まだ なかまに なっていない） */
  silhouette?: boolean
  className?: string
}

const OUTLINE = '#4a3b52'

function darker(hex: string, k = 0.78) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k)
  return `rgb(${r},${g},${b})`
}

/** 頭の上・うしろの飾り（体より うしろに描く） */
function Back({ type, stage, color }: { type: MonType; stage: number; color: string }) {
  const d = darker(color)
  switch (type) {
    case 'fire': {
      // しっぽの ほのお（2から）、3は 大きな ほのおの たてがみ
      return (
        <g>
          {stage >= 2 && <path d="M80 70 C 96 66 94 48 88 42 C 88 52 82 56 78 60 Z" fill="#ffb03a" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />}
          {stage >= 3 && <path d="M22 40 C 8 30 14 12 26 10 C 22 22 34 22 36 30 C 40 14 54 6 62 12 C 56 18 64 22 70 18 C 76 26 80 34 78 42 Z" fill="#ff5a2c" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />}
        </g>
      )
    }
    case 'water':
      return (
        <g>
          {stage >= 2 && <path d="M80 66 Q 98 60 96 76 Q 88 72 80 76 Z" fill={d} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />}
          {stage >= 3 && <path d="M30 34 Q 50 2 70 34 Q 60 24 50 26 Q 40 24 30 34 Z" fill="#7fd0ff" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />}
        </g>
      )
    case 'grass':
      return stage >= 3 ? (
        <g>
          <path d="M18 58 Q 4 44 14 30 Q 22 44 30 50 Z" fill="#2f9e54" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M82 58 Q 96 44 86 30 Q 78 44 70 50 Z" fill="#2f9e54" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        </g>
      ) : null
    case 'thunder':
      return (
        <g>
          {stage >= 2 && <path d="M78 72 L 92 64 L 86 60 L 98 48 L 82 56 L 88 60 Z" fill="#ffd400" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />}
          {stage >= 3 && <path d="M24 44 L 14 34 L 24 32 L 18 20 L 32 30 L 34 22 L 42 30 L 50 18 L 58 30 L 66 22 L 68 30 L 82 20 L 76 32 L 86 34 L 76 44 Z" fill="#ffe14d" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />}
        </g>
      )
  }
}

/** 頭の上の飾り（体より 前） */
function Top({ type, stage, color }: { type: MonType; stage: number; color: string }) {
  const d = darker(color)
  switch (type) {
    case 'fire': {
      const flames = stage === 1 ? [50] : stage === 2 ? [42, 58] : [36, 50, 64]
      return (
        <g>
          {flames.map((x, i) => (
            <path key={i} d={`M${x - 7} 34 C ${x - 8} 24 ${x - 2} 20 ${x} 12 C ${x + 3} 20 ${x + 9} 24 ${x + 7} 34 Z`} fill={i % 2 ? '#ffb03a' : '#ff6a2c'} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          ))}
        </g>
      )
    }
    case 'water':
      return <path d="M44 32 Q 50 10 58 32 Z" fill={d} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
    case 'grass': {
      const leaves = stage === 1 ? 2 : stage === 2 ? 3 : 4
      return (
        <g>
          <path d="M50 34 L 50 22" stroke="#2f7a3e" strokeWidth="3" strokeLinecap="round" />
          {Array.from({ length: leaves }).map((_, i) => {
            const a = -60 + (120 / (leaves - 1)) * i
            return <ellipse key={i} cx="50" cy="13" rx="5" ry="10" fill={i % 2 ? '#7be08f' : '#4cc46a'} stroke={OUTLINE} strokeWidth="2" transform={`rotate(${a} 50 22)`} />
          })}
          {stage >= 3 && <circle cx="50" cy="22" r="5" fill="#ff8fc2" stroke={OUTLINE} strokeWidth="2" />}
        </g>
      )
    }
    case 'thunder':
      return (
        <g>
          <path d="M30 34 L 22 12 L 32 20 L 36 8 L 40 30 Z" fill={color} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M70 34 L 78 12 L 68 20 L 64 8 L 60 30 Z" fill={color} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M26 16 L 22 12 L 28 14" fill="#4a3b52" />
        </g>
      )
  }
}

export default function MonsterArt({ lineId, stage, size = 120, mood = 'normal', silhouette, className }: Props) {
  const line = lineById(lineId)
  const t = TYPES[line.type]
  const color = line.tint ?? t.color
  const belly = t.soft
  const tall = line.body === 'tall'
  // 体：まる（横長）／たまご（たて長）。だんかいで 少しずつ 大きく
  const bodyRx = tall ? 26 + stage * 2 : 32 + stage * 2
  const bodyRy = tall ? 32 + stage * 2 : 28 + stage * 2
  const cy = 64 - stage
  const happy = mood === 'happy'
  const fill = silhouette ? '#6b6275' : color
  const eyeY = cy - 6
  const brave = stage === 3

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={line.names[stage - 1]}>
      <g style={silhouette ? { filter: 'brightness(0.35)' } : undefined}>
        <ellipse cx="50" cy="96" rx={bodyRx * 0.8} ry="3.5" fill="rgba(0,0,0,0.12)" />
        <Back type={line.type} stage={stage} color={color} />
        {/* あし */}
        <ellipse cx={50 - bodyRx * 0.5} cy={cy + bodyRy - 2} rx="8" ry="6" fill={darker(fill)} stroke={OUTLINE} strokeWidth="2" />
        <ellipse cx={50 + bodyRx * 0.5} cy={cy + bodyRy - 2} rx="8" ry="6" fill={darker(fill)} stroke={OUTLINE} strokeWidth="2" />
        {/* からだ */}
        <ellipse cx="50" cy={cy} rx={bodyRx} ry={bodyRy} fill={fill} stroke={OUTLINE} strokeWidth="2.5" />
        {!silhouette && <ellipse cx="50" cy={cy + bodyRy * 0.38} rx={bodyRx * 0.55} ry={bodyRy * 0.42} fill={belly} />}
        {/* て（2から。3は ばんざい） */}
        {stage >= 2 && (
          <g fill={fill} stroke={OUTLINE} strokeWidth="2">
            <ellipse cx={50 - bodyRx + 2} cy={cy + 4} rx="6" ry="9" transform={`rotate(${happy || brave ? 40 : 20} ${50 - bodyRx + 2} ${cy + 4})`} />
            <ellipse cx={50 + bodyRx - 2} cy={cy + 4} rx="6" ry="9" transform={`rotate(${happy || brave ? -40 : -20} ${50 + bodyRx - 2} ${cy + 4})`} />
          </g>
        )}
        <Top type={line.type} stage={stage} color={silhouette ? fill : color} />
        {!silhouette && (
          <g>
            {/* め */}
            {happy ? (
              <g stroke={OUTLINE} strokeWidth="3" fill="none" strokeLinecap="round">
                <path d={`M38 ${eyeY + 2} Q 42 ${eyeY - 4} 46 ${eyeY + 2}`} />
                <path d={`M54 ${eyeY + 2} Q 58 ${eyeY - 4} 62 ${eyeY + 2}`} />
              </g>
            ) : line.kana === 'hiragana' ? (
              <g fill={OUTLINE}>
                <circle cx="41" cy={eyeY} r="4" />
                <circle cx="59" cy={eyeY} r="4" />
                <circle cx="42.4" cy={eyeY - 1.4} r="1.3" fill="#fff" />
                <circle cx="60.4" cy={eyeY - 1.4} r="1.3" fill="#fff" />
              </g>
            ) : (
              <g>
                <ellipse cx="41" cy={eyeY} rx="5.5" ry="7" fill="#fff" stroke={OUTLINE} strokeWidth="2" />
                <ellipse cx="59" cy={eyeY} rx="5.5" ry="7" fill="#fff" stroke={OUTLINE} strokeWidth="2" />
                <circle cx="42" cy={eyeY + 1} r="3.2" fill={OUTLINE} />
                <circle cx="58" cy={eyeY + 1} r="3.2" fill={OUTLINE} />
                <circle cx="43" cy={eyeY - 0.5} r="1.2" fill="#fff" />
                <circle cx="59" cy={eyeY - 0.5} r="1.2" fill="#fff" />
              </g>
            )}
            {brave && !happy && (
              <g stroke={OUTLINE} strokeWidth="2.5" strokeLinecap="round">
                <path d={`M35 ${eyeY - 10} L 46 ${eyeY - 7}`} />
                <path d={`M65 ${eyeY - 10} L 54 ${eyeY - 7}`} />
              </g>
            )}
            {/* ほっぺ */}
            <ellipse cx="33" cy={eyeY + 9} rx="5" ry="3" fill="#ff8fa8" opacity="0.7" />
            <ellipse cx="67" cy={eyeY + 9} rx="5" ry="3" fill="#ff8fa8" opacity="0.7" />
            {/* くち */}
            {happy ? (
              <path d={`M43 ${eyeY + 10} Q 50 ${eyeY + 20} 57 ${eyeY + 10} Z`} fill="#c2405e" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
            ) : (
              <path d={`M45 ${eyeY + 11} Q 50 ${eyeY + 15} 55 ${eyeY + 11}`} fill="none" stroke={OUTLINE} strokeWidth="2.5" strokeLinecap="round" />
            )}
            {line.type === 'fire' && stage >= 2 && <path d={`M46 ${eyeY + 11} l 2 3 l 2 -3`} fill="#fff" stroke={OUTLINE} strokeWidth="1" />}
          </g>
        )}
      </g>
    </svg>
  )
}
