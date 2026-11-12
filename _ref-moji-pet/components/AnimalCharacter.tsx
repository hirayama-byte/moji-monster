import type { ReactNode } from 'react'

/**
 * 全身の「もじペット」キャラクター。
 * 大きな丸い頭＋ちいさな体＋短い手足、茶色のやわらかい線、ほっぺの赤み、という
 * 絵本風フラットイラストのスタイルで、20種を同じ骨格から描き分ける。
 * viewBox は 0 0 120 150。
 */

type Props = {
  id: string
  size?: number
  /** happy のときは目がにっこり・口があく・手があがる */
  mood?: 'idle' | 'happy'
  className?: string
}

const LINE = '#6b4b3a'
const SW = 2.6
const BLUSH = '#ffb3c6'

type EarType = 'round' | 'upright' | 'floppy' | 'pointed' | 'tiny' | 'wide' | 'none'

type Spec = {
  body: string
  belly?: string
  ear: EarType
  earColor?: string
  earInner?: string
  /** 顔の下半分に明るい鼻先パッチを置く */
  muzzle?: string
  /** 鼻の形 */
  nose: 'dot' | 'triangle' | 'pig' | 'beak' | 'none' | 'big'
  noseColor?: string
  whiskers?: boolean
  tail: 'curl' | 'puff' | 'long' | 'bushy' | 'none' | 'stub'
  tailColor?: string
  /** 頭の位置を少し高くする（きりん） */
  neck?: number
}

const SPECS: Record<string, Spec> = {
  dog: { body: '#f2c89b', belly: '#fff3e0', ear: 'floppy', earColor: '#c9915c', nose: 'dot', tail: 'curl' },
  rabbit: { body: '#ffd1dc', belly: '#fff4f7', ear: 'upright', earColor: '#ffd1dc', earInner: '#ff9fb8', nose: 'triangle', noseColor: '#ff7fa0', whiskers: true, tail: 'puff' },
  cat: { body: '#ffe9b3', belly: '#fff8e5', ear: 'pointed', earColor: '#ffe9b3', earInner: '#ffb7c5', nose: 'triangle', noseColor: '#ff8fa8', whiskers: true, tail: 'long' },
  hamster: { body: '#ffc98a', belly: '#fff3dc', ear: 'tiny', earColor: '#ffc98a', earInner: '#ffb0a0', nose: 'triangle', noseColor: '#ff8fa8', whiskers: true, tail: 'stub' },
  fox: { body: '#ffa559', belly: '#fff5e8', ear: 'pointed', earColor: '#ffa559', earInner: '#5c3a2a', muzzle: '#fff5e8', nose: 'dot', tail: 'bushy', tailColor: '#ffa559' },
  panda: { body: '#ffffff', ear: 'round', earColor: '#3b3b3b', nose: 'dot', tail: 'none' },
  koala: { body: '#bcc5cf', belly: '#eef1f4', ear: 'wide', earColor: '#bcc5cf', earInner: '#f6d4dc', nose: 'big', noseColor: '#4a4a4a', tail: 'none' },
  penguin: { body: '#4b5a8a', belly: '#ffffff', ear: 'none', nose: 'beak', noseColor: '#ffb347', tail: 'none' },
  frog: { body: '#9ddc8a', belly: '#e9f8d8', ear: 'none', nose: 'none', tail: 'none' },
  pig: { body: '#ffc1cc', belly: '#ffe3e9', ear: 'floppy', earColor: '#ffb0bf', nose: 'pig', noseColor: '#ff9fb0', tail: 'curl', tailColor: '#ffb0bf' },
  cow: { body: '#ffffff', ear: 'wide', earColor: '#ffffff', earInner: '#ffc9d4', muzzle: '#ffd1da', nose: 'pig', noseColor: '#ffb0bf', tail: 'long', tailColor: '#5a5a5a' },
  monkey: { body: '#c98a5e', belly: '#ffe4c4', ear: 'wide', earColor: '#c98a5e', earInner: '#ffe4c4', muzzle: '#ffe4c4', nose: 'dot', tail: 'long', tailColor: '#c98a5e' },
  tiger: { body: '#ffb258', belly: '#fff3dc', ear: 'round', earColor: '#ffb258', earInner: '#fff3dc', muzzle: '#fff3dc', nose: 'triangle', noseColor: '#ff8fa8', whiskers: true, tail: 'long', tailColor: '#ffb258' },
  lion: { body: '#f6c66e', belly: '#fff0c9', ear: 'round', earColor: '#f6c66e', earInner: '#fff0c9', muzzle: '#fff0c9', nose: 'triangle', noseColor: '#c97a5a', whiskers: true, tail: 'long', tailColor: '#f6c66e' },
  hedgehog: { body: '#ffe1bd', belly: '#fff6ea', ear: 'tiny', earColor: '#ffe1bd', nose: 'dot', tail: 'none' },
  turtle: { body: '#a8dba0', belly: '#e4f5dc', ear: 'none', nose: 'none', tail: 'stub', tailColor: '#a8dba0' },
  parrot: { body: '#ff6b7a', belly: '#ffd166', ear: 'none', nose: 'beak', noseColor: '#ffcf4d', tail: 'none' },
  elephant: { body: '#b5d8f0', belly: '#e6f3fb', ear: 'wide', earColor: '#b5d8f0', earInner: '#f6d4dc', nose: 'none', tail: 'stub', tailColor: '#b5d8f0' },
  giraffe: { body: '#ffd86b', belly: '#fff5d0', ear: 'tiny', earColor: '#ffd86b', muzzle: '#fff5d0', nose: 'dot', tail: 'long', tailColor: '#ffd86b', neck: 14 },
  unicorn: { body: '#ffffff', belly: '#fff0f6', ear: 'pointed', earColor: '#ffffff', earInner: '#ffc2d9', nose: 'dot', noseColor: '#ff9fb8', tail: 'bushy', tailColor: '#f7a8d8' },
}

const CX = 60
const HEAD_Y = 50
const HEAD_R = 33
const BODY_TOP = 80
const BODY_BOTTOM = 128

export default function AnimalCharacter({ id, size = 160, mood = 'idle', className = '' }: Props) {
  const s = SPECS[id] ?? SPECS.dog
  const neck = s.neck ?? 0
  const hy = HEAD_Y - neck
  const happy = mood === 'happy'
  const outline = { stroke: LINE, strokeWidth: SW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

  return (
    <svg
      viewBox="0 0 120 150"
      width={size}
      height={size * 1.25}
      className={className}
      role="img"
      aria-label={id}
      style={{ overflow: 'visible' }}
    >
      {/* ---- 後ろにあるもの：しっぽ・たてがみ・こうら・はり ---- */}
      {renderBack(id, s, hy, outline)}

      {/* あし */}
      <ellipse cx={46} cy={BODY_BOTTOM + 4} rx={12} ry={8} fill={legColor(id, s)} {...outline} />
      <ellipse cx={74} cy={BODY_BOTTOM + 4} rx={12} ry={8} fill={legColor(id, s)} {...outline} />

      {/* からだ */}
      <rect x={32} y={BODY_TOP - neck} width={56} height={BODY_BOTTOM - BODY_TOP + neck} rx={26} fill={s.body} {...outline} />
      {s.belly && <ellipse cx={CX} cy={108} rx={17} ry={16} fill={s.belly} />}
      {renderBodyMarks(id)}

      {/* うで（happy なら ばんざい） */}
      {happy ? (
        <>
          <ellipse cx={26} cy={78 - neck} rx={8} ry={14} transform={`rotate(25 26 ${78 - neck})`} fill={armColor(id, s)} {...outline} />
          <ellipse cx={94} cy={78 - neck} rx={8} ry={14} transform={`rotate(-25 94 ${78 - neck})`} fill={armColor(id, s)} {...outline} />
        </>
      ) : (
        <>
          <ellipse cx={30} cy={98} rx={8} ry={14} transform="rotate(-20 30 98)" fill={armColor(id, s)} {...outline} />
          <ellipse cx={90} cy={98} rx={8} ry={14} transform="rotate(20 90 98)" fill={armColor(id, s)} {...outline} />
        </>
      )}

      {/* みみ（頭のうしろ側） */}
      {renderEars(s, hy, outline)}

      {/* あたま */}
      <circle cx={CX} cy={hy} r={HEAD_R} fill={headColor(id, s)} {...outline} />
      {s.muzzle && <ellipse cx={CX} cy={hy + 13} rx={17} ry={12} fill={s.muzzle} />}
      {renderHeadMarks(id, hy)}

      {/* かお */}
      {renderFace(s, hy, happy)}

      {/* ---- 前にあるもの：つの・はな（ぞう）・とさか ---- */}
      {renderFront(id, hy, outline)}
    </svg>
  )
}

type Outline = { stroke: string; strokeWidth: number; strokeLinejoin: 'round'; strokeLinecap: 'round' }

function headColor(id: string, s: Spec) {
  return id === 'penguin' ? s.body : s.body
}
function armColor(id: string, s: Spec) {
  if (id === 'panda') return '#3b3b3b'
  if (id === 'penguin') return '#4b5a8a'
  if (id === 'parrot') return '#4fb0ff'
  return s.body
}
function legColor(id: string, s: Spec) {
  if (id === 'panda') return '#3b3b3b'
  if (id === 'penguin' || id === 'parrot') return '#ffb347'
  return s.body
}

function renderEars(s: Spec, hy: number, o: Outline) {
  const c = s.earColor ?? s.body
  const inner = s.earInner
  switch (s.ear) {
    case 'round':
      return (
        <>
          <circle cx={34} cy={hy - 24} r={11} fill={c} {...o} />
          <circle cx={86} cy={hy - 24} r={11} fill={c} {...o} />
          {inner && (
            <>
              <circle cx={34} cy={hy - 24} r={5.5} fill={inner} />
              <circle cx={86} cy={hy - 24} r={5.5} fill={inner} />
            </>
          )}
        </>
      )
    case 'upright':
      return (
        <>
          <ellipse cx={44} cy={hy - 40} rx={9} ry={24} transform={`rotate(-8 44 ${hy - 40})`} fill={c} {...o} />
          <ellipse cx={76} cy={hy - 40} rx={9} ry={24} transform={`rotate(8 76 ${hy - 40})`} fill={c} {...o} />
          {inner && (
            <>
              <ellipse cx={44} cy={hy - 38} rx={4.5} ry={16} transform={`rotate(-8 44 ${hy - 38})`} fill={inner} />
              <ellipse cx={76} cy={hy - 38} rx={4.5} ry={16} transform={`rotate(8 76 ${hy - 38})`} fill={inner} />
            </>
          )}
        </>
      )
    case 'floppy':
      return (
        <>
          <ellipse cx={28} cy={hy + 2} rx={9} ry={20} transform={`rotate(12 28 ${hy + 2})`} fill={c} {...o} />
          <ellipse cx={92} cy={hy + 2} rx={9} ry={20} transform={`rotate(-12 92 ${hy + 2})`} fill={c} {...o} />
        </>
      )
    case 'pointed':
      return (
        <>
          <path d={`M34 ${hy - 16} L28 ${hy - 46} L56 ${hy - 28} Z`} fill={c} {...o} />
          <path d={`M86 ${hy - 16} L92 ${hy - 46} L64 ${hy - 28} Z`} fill={c} {...o} />
          {inner && (
            <>
              <path d={`M38 ${hy - 20} L33 ${hy - 39} L50 ${hy - 28} Z`} fill={inner} />
              <path d={`M82 ${hy - 20} L87 ${hy - 39} L70 ${hy - 28} Z`} fill={inner} />
            </>
          )}
        </>
      )
    case 'tiny':
      return (
        <>
          <circle cx={38} cy={hy - 27} r={7} fill={c} {...o} />
          <circle cx={82} cy={hy - 27} r={7} fill={c} {...o} />
          {inner && (
            <>
              <circle cx={38} cy={hy - 27} r={3.5} fill={inner} />
              <circle cx={82} cy={hy - 27} r={3.5} fill={inner} />
            </>
          )}
        </>
      )
    case 'wide':
      return (
        <>
          <ellipse cx={24} cy={hy - 6} rx={13} ry={15} fill={c} {...o} />
          <ellipse cx={96} cy={hy - 6} rx={13} ry={15} fill={c} {...o} />
          {inner && (
            <>
              <ellipse cx={24} cy={hy - 6} rx={7} ry={9} fill={inner} />
              <ellipse cx={96} cy={hy - 6} rx={7} ry={9} fill={inner} />
            </>
          )}
        </>
      )
    default:
      return null
  }
}

function renderFace(s: Spec, hy: number, happy: boolean) {
  const eyeY = hy + 2
  const nose = (() => {
    const ny = hy + 12
    switch (s.nose) {
      case 'dot':
        return <ellipse cx={CX} cy={ny} rx={4.5} ry={3.5} fill={s.noseColor ?? LINE} />
      case 'big':
        return <ellipse cx={CX} cy={ny + 2} rx={8} ry={6.5} fill={s.noseColor ?? LINE} />
      case 'triangle':
        return <path d={`M${CX - 4} ${ny - 2} L${CX + 4} ${ny - 2} L${CX} ${ny + 3} Z`} fill={s.noseColor ?? LINE} />
      case 'pig':
        return (
          <>
            <ellipse cx={CX} cy={ny + 2} rx={10} ry={7} fill={s.noseColor} stroke={LINE} strokeWidth={2} />
            <circle cx={CX - 3.5} cy={ny + 2} r={1.6} fill={LINE} />
            <circle cx={CX + 3.5} cy={ny + 2} r={1.6} fill={LINE} />
          </>
        )
      case 'beak':
        return <path d={`M${CX - 7} ${ny - 4} L${CX + 7} ${ny - 4} L${CX} ${ny + 6} Z`} fill={s.noseColor} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      default:
        return null
    }
  })()

  const mouthY = hy + 17
  const mouth =
    s.nose === 'beak' ? null : happy ? (
      <path d={`M${CX - 7} ${mouthY} Q${CX} ${mouthY + 9} ${CX + 7} ${mouthY}`} fill="#ff8fa8" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
    ) : s.nose === 'pig' || s.nose === 'big' ? null : (
      <path
        d={`M${CX - 6} ${mouthY} Q${CX - 3} ${mouthY + 4} ${CX} ${mouthY} Q${CX + 3} ${mouthY + 4} ${CX + 6} ${mouthY}`}
        fill="none"
        stroke={LINE}
        strokeWidth={2}
        strokeLinecap="round"
      />
    )

  return (
    <>
      {/* ほっぺ */}
      <circle cx={CX - 20} cy={hy + 10} r={5.5} fill={BLUSH} opacity={0.75} />
      <circle cx={CX + 20} cy={hy + 10} r={5.5} fill={BLUSH} opacity={0.75} />
      {/* め */}
      {happy ? (
        <>
          <path d={`M${CX - 17} ${eyeY + 1} Q${CX - 12} ${eyeY - 5} ${CX - 7} ${eyeY + 1}`} fill="none" stroke={LINE} strokeWidth={2.6} strokeLinecap="round" />
          <path d={`M${CX + 7} ${eyeY + 1} Q${CX + 12} ${eyeY - 5} ${CX + 17} ${eyeY + 1}`} fill="none" stroke={LINE} strokeWidth={2.6} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={CX - 12} cy={eyeY} r={3.2} fill={LINE} />
          <circle cx={CX + 12} cy={eyeY} r={3.2} fill={LINE} />
          <circle cx={CX - 11} cy={eyeY - 1.2} r={1} fill="#fff" />
          <circle cx={CX + 13} cy={eyeY - 1.2} r={1} fill="#fff" />
        </>
      )}
      {nose}
      {mouth}
      {s.whiskers && (
        <g stroke={LINE} strokeWidth={1.6} strokeLinecap="round">
          <line x1={CX - 22} y1={hy + 14} x2={CX - 32} y2={hy + 12} />
          <line x1={CX - 22} y1={hy + 18} x2={CX - 32} y2={hy + 20} />
          <line x1={CX + 22} y1={hy + 14} x2={CX + 32} y2={hy + 12} />
          <line x1={CX + 22} y1={hy + 18} x2={CX + 32} y2={hy + 20} />
        </g>
      )}
    </>
  )
}

/** 頭のうしろ・体のうしろに描くもの */
function renderBack(id: string, s: Spec, hy: number, o: Outline): ReactNode {
  const tailColor = s.tailColor ?? s.body
  const parts: ReactNode[] = []

  switch (s.tail) {
    case 'curl':
      parts.push(<path key="t" d="M88 112 q14 -4 10 -16 q-2 -6 -8 -4" fill="none" stroke={tailColor} strokeWidth={7} strokeLinecap="round" />, <path key="t2" d="M88 112 q14 -4 10 -16 q-2 -6 -8 -4" fill="none" stroke={LINE} strokeWidth={SW} strokeLinecap="round" opacity={0.5} />)
      break
    case 'puff':
      parts.push(<circle key="t" cx={92} cy={118} r={9} fill="#fff" {...o} />)
      break
    case 'long':
      parts.push(<path key="t" d="M86 118 q22 2 24 -18 q0 -8 -6 -10" fill="none" stroke={LINE} strokeWidth={SW + 6} strokeLinecap="round" />, <path key="t2" d="M86 118 q22 2 24 -18 q0 -8 -6 -10" fill="none" stroke={tailColor} strokeWidth={SW + 2} strokeLinecap="round" />)
      if (id === 'lion') parts.push(<circle key="t3" cx={104} cy={90} r={6} fill="#c98a5e" {...o} />)
      if (id === 'cow') parts.push(<circle key="t3" cx={104} cy={90} r={5} fill="#5a5a5a" {...o} />)
      break
    case 'bushy':
      parts.push(<ellipse key="t" cx={98} cy={112} rx={11} ry={20} transform="rotate(-30 98 112)" fill={tailColor} {...o} />)
      if (id === 'fox') parts.push(<ellipse key="t2" cx={106} cy={98} rx={6} ry={8} transform="rotate(-30 106 98)" fill="#fff5e8" />)
      if (id === 'unicorn')
        parts.push(
          <path key="t2" d="M94 100 q6 8 4 18" fill="none" stroke="#9fd8ff" strokeWidth={3} strokeLinecap="round" />,
          <path key="t3" d="M100 98 q6 8 6 18" fill="none" stroke="#fff3a8" strokeWidth={3} strokeLinecap="round" />,
        )
      break
    case 'stub':
      parts.push(<circle key="t" cx={90} cy={122} r={5} fill={tailColor} {...o} />)
      break
  }

  if (id === 'lion') {
    // たてがみ：頭のうしろに波うつ円
    const petals = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2
      return <circle key={i} cx={CX + Math.cos(a) * 36} cy={hy + Math.sin(a) * 36} r={11} fill="#c98a5e" {...o} />
    })
    parts.push(<g key="mane">{petals}</g>, <circle key="mane2" cx={CX} cy={hy} r={38} fill="#c98a5e" />)
  }
  if (id === 'hedgehog') {
    const spikes = Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI + (i / 8) * Math.PI
      const x = CX + Math.cos(a) * 36
      const y = hy + 4 + Math.sin(a) * 36
      return <path key={i} d={`M${CX + Math.cos(a) * 28} ${hy + 4 + Math.sin(a) * 28} L${x + Math.cos(a - 0.25) * 8} ${y + Math.sin(a - 0.25) * 8} L${x + Math.cos(a + 0.25) * 8} ${y + Math.sin(a + 0.25) * 8} Z`} fill="#a9744f" {...o} />
    })
    parts.push(<g key="spikes">{spikes}</g>, <circle key="back" cx={CX} cy={hy + 4} r={34} fill="#a9744f" />)
  }
  if (id === 'turtle') {
    parts.push(
      <ellipse key="shell" cx={CX} cy={104} rx={38} ry={30} fill="#8fbf6f" {...o} />,
      <ellipse key="shell2" cx={CX} cy={104} rx={28} ry={21} fill="#b9dc9a" />,
      <path key="shell3" d="M44 96 L60 88 L76 96 L76 112 L60 120 L44 112 Z" fill="none" stroke="#6f9a52" strokeWidth={2.5} strokeLinejoin="round" />,
    )
  }
  if (id === 'unicorn') {
    // たてがみ（にじいろ）
    parts.push(
      <path key="m1" d={`M40 ${hy - 26} q-16 10 -12 36`} fill="none" stroke="#ffb3d9" strokeWidth={8} strokeLinecap="round" />,
      <path key="m2" d={`M44 ${hy - 30} q-14 14 -10 34`} fill="none" stroke="#c9b3ff" strokeWidth={6} strokeLinecap="round" />,
      <path key="m3" d={`M48 ${hy - 33} q-10 12 -8 30`} fill="none" stroke="#9fd8ff" strokeWidth={4} strokeLinecap="round" />,
    )
  }
  if (id === 'parrot') {
    parts.push(
      <path key="tf1" d="M58 126 l-6 20" stroke="#4fb0ff" strokeWidth={6} strokeLinecap="round" />,
      <path key="tf2" d="M62 126 l6 20" stroke="#6bd36b" strokeWidth={6} strokeLinecap="round" />,
      <path key="tf3" d="M60 126 l0 22" stroke="#ffd166" strokeWidth={6} strokeLinecap="round" />,
    )
  }
  if (id === 'giraffe') {
    parts.push(
      <path key="h1" d={`M50 ${hy - 30} l-3 -14`} stroke={LINE} strokeWidth={3} strokeLinecap="round" />,
      <path key="h2" d={`M70 ${hy - 30} l3 -14`} stroke={LINE} strokeWidth={3} strokeLinecap="round" />,
      <circle key="h3" cx={47} cy={hy - 45} r={4} fill="#c98a5e" {...o} />,
      <circle key="h4" cx={73} cy={hy - 45} r={4} fill="#c98a5e" {...o} />,
    )
  }
  if (id === 'cow') {
    parts.push(
      <path key="c1" d={`M40 ${hy - 26} q-6 -14 4 -16`} fill="none" stroke={LINE} strokeWidth={5} strokeLinecap="round" />,
      <path key="c2" d={`M80 ${hy - 26} q6 -14 -4 -16`} fill="none" stroke={LINE} strokeWidth={5} strokeLinecap="round" />,
      <path key="c3" d={`M40 ${hy - 26} q-6 -14 4 -16`} fill="none" stroke="#f3e2c7" strokeWidth={2.5} strokeLinecap="round" />,
      <path key="c4" d={`M80 ${hy - 26} q6 -14 -4 -16`} fill="none" stroke="#f3e2c7" strokeWidth={2.5} strokeLinecap="round" />,
    )
  }
  return <g>{parts}</g>
}

/** 体のもよう */
function renderBodyMarks(id: string): ReactNode {
  switch (id) {
    case 'cow':
      return (
        <>
          <ellipse cx={44} cy={96} rx={7} ry={5} fill="#5a5a5a" />
          <ellipse cx={80} cy={118} rx={6} ry={4.5} fill="#5a5a5a" />
        </>
      )
    case 'tiger':
      return (
        <g stroke="#4a3a2a" strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M36 92 q6 2 8 8" />
          <path d="M84 92 q-6 2 -8 8" />
          <path d="M36 110 q6 2 8 8" />
          <path d="M84 110 q-6 2 -8 8" />
        </g>
      )
    case 'giraffe':
      return (
        <>
          <circle cx={42} cy={84} r={4} fill="#c98a5e" />
          <circle cx={78} cy={90} r={3.5} fill="#c98a5e" />
          <circle cx={44} cy={118} r={3.5} fill="#c98a5e" />
          <circle cx={80} cy={118} r={4} fill="#c98a5e" />
        </>
      )
    case 'panda':
      return <path d="M32 92 q28 -10 56 0 l0 6 q-28 -8 -56 0 Z" fill="#3b3b3b" />
    default:
      return null
  }
}

/** 顔のもよう */
function renderHeadMarks(id: string, hy: number): ReactNode {
  switch (id) {
    case 'panda':
      return (
        <>
          <ellipse cx={CX - 12} cy={hy + 2} rx={8} ry={10} transform={`rotate(-15 ${CX - 12} ${hy + 2})`} fill="#3b3b3b" />
          <ellipse cx={CX + 12} cy={hy + 2} rx={8} ry={10} transform={`rotate(15 ${CX + 12} ${hy + 2})`} fill="#3b3b3b" />
        </>
      )
    case 'penguin':
      return <ellipse cx={CX} cy={hy + 8} rx={22} ry={20} fill="#ffffff" />
    case 'tiger':
      return (
        <g stroke="#4a3a2a" strokeWidth={3} strokeLinecap="round" fill="none">
          <path d={`M${CX} ${hy - 30} l0 8`} />
          <path d={`M${CX - 8} ${hy - 28} l2 7`} />
          <path d={`M${CX + 8} ${hy - 28} l-2 7`} />
        </g>
      )
    case 'dog':
      return <ellipse cx={CX + 14} cy={hy - 4} rx={9} ry={11} fill="#c9915c" opacity={0.55} />
    case 'cow':
      return <ellipse cx={CX - 16} cy={hy - 14} rx={9} ry={7} fill="#5a5a5a" />
    case 'frog':
      return (
        <>
          <circle cx={CX - 18} cy={hy - 28} r={9} fill="#9ddc8a" stroke={LINE} strokeWidth={SW} />
          <circle cx={CX + 18} cy={hy - 28} r={9} fill="#9ddc8a" stroke={LINE} strokeWidth={SW} />
          <circle cx={CX - 18} cy={hy - 28} r={3.5} fill={LINE} />
          <circle cx={CX + 18} cy={hy - 28} r={3.5} fill={LINE} />
        </>
      )
    case 'parrot':
      return (
        <>
          <path d={`M${CX - 4} ${hy - 32} q-4 -14 6 -12 q8 -2 6 10`} fill="#ffd166" stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
          <ellipse cx={CX} cy={hy + 4} rx={16} ry={12} fill="#fff" />
        </>
      )
    default:
      return null
  }
}

/** いちばん手前に描くもの */
function renderFront(id: string, hy: number, o: Outline): ReactNode {
  switch (id) {
    case 'elephant':
      return (
        <>
          <path d={`M${CX} ${hy + 8} q-2 22 12 30 q8 3 10 -4`} fill="none" stroke={LINE} strokeWidth={SW + 10} strokeLinecap="round" />
          <path d={`M${CX} ${hy + 8} q-2 22 12 30 q8 3 10 -4`} fill="none" stroke="#b5d8f0" strokeWidth={SW + 6} strokeLinecap="round" />
        </>
      )
    case 'unicorn':
      return (
        <>
          <path d={`M${CX} ${hy - 30} l-6 2 l6 -26 l6 26 Z`} fill="#ffe08a" {...o} />
          <path d={`M${CX - 3} ${hy - 38} l6 -2 M${CX - 2} ${hy - 45} l4 -1.5`} stroke={LINE} strokeWidth={1.5} strokeLinecap="round" />
        </>
      )
    case 'koala':
      return null
    default:
      return null
  }
}

export const ANIMAL_IDS = Object.keys(SPECS)
