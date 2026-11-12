// なまえを 1もじずつ かく がめん。書き順・向きを 1かくずつ みて、ヒントは おした ときだけ
import { useEffect, useMemo, useRef, useState } from 'react'
import CanvasDraw, { type StrokeFeedback } from './CanvasDraw'
import MonsterArt from './MonsterArt'
import KANA from '../data/kana.json'
import { lineById, TYPES } from '../data/monsters'
import { speak } from '../lib/speak'
import type { Stage } from '../hooks/useIsland'

type Props = {
  lineId: string
  stage: Stage
  /** やせいの子と なかよくなる ために かいている */
  wildLineId?: string
  onDone: () => void
  onBack: () => void
}

const kana = KANA as Record<string, string[]>

function feedbackText(fb: StrokeFeedback): { tone: 'good' | 'bad'; text: string } {
  const n = fb.strokeIndex + 1
  switch (fb.judgement.kind) {
    case 'ok':
      return { tone: 'good', text: ['いいね！', 'じょうず！', 'そのちょうし！', 'ばっちり！'][fb.strokeIndex % 4] }
    case 'wrong-order':
      return { tone: 'bad', text: `✋ かくじゅんばんが ちがうよ。いまは ${n}ばんめの せん` }
    case 'already':
      return { tone: 'bad', text: 'そこは もう かいたよ！' }
    case 'reversed':
      return { tone: 'bad', text: '↩️ ぎゃくから かいたみたい。はじまりは どっちかな？' }
    default:
      return { tone: 'bad', text: '🤔 もういちど かいてみよう！' }
  }
}

export default function WriteScreen({ lineId, stage, wildLineId, onDone, onBack }: Props) {
  const line = lineById(lineId)
  const name = line.names[stage - 1]
  const chars = useMemo(() => name.split(''), [name])
  const [idx, setIdx] = useState(0)
  const [hint, setHint] = useState(0)
  const [fb, setFb] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null)
  const [finished, setFinished] = useState(false)
  const fbTimer = useRef<number | undefined>(undefined)
  const [vh, setVh] = useState(() => window.innerHeight)
  const [vw, setVw] = useState(() => window.innerWidth)

  useEffect(() => {
    const on = () => { setVh(window.innerHeight); setVw(window.innerWidth) }
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  useEffect(() => { speak(`${name}。 ${name} って かいてね`) }, [name])

  const ch = chars[idx]
  const strokes = kana[ch] ?? []
  // 書く場所: 画面に収まる いちばん大きい正方形（iPad 横で 約480px）
  const landscape = vw > vh
  const box = Math.max(240, Math.min(landscape ? vh - 200 : vh - 420, landscape ? vw - 420 : vw - 60, 560))

  const showFb = (f: { tone: 'good' | 'bad'; text: string }, ms: number) => {
    setFb(f)
    window.clearTimeout(fbTimer.current)
    fbTimer.current = window.setTimeout(() => setFb(null), ms)
  }

  const onProgress = (done: number, total: number) => {
    if (total === 0 || done < total) return
    // 1もじ かけた
    if (idx + 1 < chars.length) {
      speak(ch)
      window.setTimeout(() => { setIdx((i) => i + 1); setHint(0) }, 450)
    } else {
      setFinished(true)
      speak(`${name}！ かけたね！`)
      window.setTimeout(onDone, 1300)
    }
  }

  const t = TYPES[line.type]

  return (
    <div className={`h-full w-full flex ${landscape ? 'flex-row' : 'flex-col'} items-center justify-center gap-6 p-4`}>
      {/* ひだり（たて画面では うえ）: モンスターと なまえ */}
      <div className="flex flex-col items-center gap-3 shrink-0" style={{ width: landscape ? 360 : '100%' }}>
        <div className="self-start">
          <button type="button" onClick={onBack} className="text-lg font-bold bg-white/80 rounded-full px-5 py-2 shadow active:scale-95">← もどる</button>
        </div>
        {wildLineId && (
          <div className="text-center text-base font-bold bg-white/85 rounded-2xl px-4 py-2 shadow">
            {TYPES[lineById(wildLineId).type].label}タイプには <span style={{ color: t.color }}>{t.label}</span>が つよい！<br />なまえを かいて なかよく なろう
          </div>
        )}
        <div className={finished ? 'animate-bounce-soft' : ''}>
          <MonsterArt lineId={lineId} stage={stage} size={landscape ? 170 : 130} mood={finished ? 'happy' : 'normal'} />
        </div>
        <button type="button" onClick={() => speak(name)} className="flex items-center gap-2 bg-white rounded-full px-4 py-1 shadow text-base font-bold active:scale-95" aria-label="なまえを きく">
          🔊 きく
        </button>
        {/* なまえの マス（かけた字は いろつき・いまの字は わく） */}
        <div className="flex gap-2 flex-wrap justify-center" aria-label={`${name}（${idx + 1}もじめ）`}>
          {chars.map((c, i) => (
            <div
              key={i}
              data-cell={i}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-bold border-4 transition-all ${
                i < idx || finished ? 'bg-white text-choco border-transparent' : i === idx ? 'bg-white border-pastel-pink-deep text-choco scale-110 shadow-lg' : 'bg-white/60 border-white text-choco/40'
              }`}
              style={i < idx || finished ? { color: t.color } : undefined}
            >
              {c}
            </div>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <button
            type="button"
            id="hintBtn"
            disabled={finished || hint >= 3}
            onClick={() => { setHint((h) => (h < 2 ? 2 : 3)); speak(hint < 2 ? 'さいしょの せんは ここから' : 'うすい せんを なぞってみよう') }}
            className="text-lg font-bold bg-pastel-lavender rounded-full px-5 py-3 shadow-[0_5px_0_#c4b2f0] active:translate-y-1 active:shadow-[0_1px_0_#c4b2f0] disabled:opacity-50"
          >
            💡 ヒント{hint >= 2 ? (hint >= 3 ? '（ぜんぶ）' : '（もういちど）') : ''}
          </button>
        </div>
        <div className="min-h-12 flex items-center">
          {fb && (
            <div role="status" className={`px-4 py-2 rounded-2xl text-lg font-bold shadow ${fb.tone === 'good' ? 'bg-pastel-mint text-choco animate-pop' : 'bg-white text-[#d4486e] animate-shake'}`}>{fb.text}</div>
          )}
        </div>
      </div>

      {/* かく ばしょ */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl font-bold text-choco">「<span style={{ color: t.color }}>{ch}</span>」を かこう</div>
        <CanvasDraw
          key={`${name}-${idx}`}
          strokePaths={strokes}
          hintLevel={hint}
          radicalStrokes={[]}
          disabled={finished}
          boxSize={box}
          onProgress={onProgress}
          onFeedback={(f) => {
            if (f.judgement.kind === 'ok' && f.strokeIndex + 1 >= strokes.length) return
            const x = feedbackText(f)
            showFb(x, x.tone === 'good' ? 1200 : 3000)
            if (x.tone === 'bad') speak(x.text.replace(/[✋↩️🤔]/gu, ''))
          }}
        />
      </div>
    </div>
  )
}
