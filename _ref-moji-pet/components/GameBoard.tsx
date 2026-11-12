import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import PetArea from './PetArea'
import CanvasDraw, { type CanvasDrawHandle, type StrokeFeedback } from './CanvasDraw'
import KawaiiButton from './KawaiiButton'
import ZooView from './ZooView'
import NewFriendOverlay from './NewFriendOverlay'
import { kanjiPartsOf, pickRandomRequest, readingOf, requestsFor, textOf, type GradeFilter, type KanjiRequest } from '../data/requests'
import { GRADE_LABEL } from '../data/kanjiGrades'
import { ANIMALS, animalById } from '../data/animals'
import { GAIN_BY_HINTS, hintOf, MAX_HINT_LEVEL, strokePathsOf } from '../data/kanjiHints'
import { useZoo } from '../hooks/useZoo'

type FlyingItem = { id: number; emoji: string; x: number; y: number; dx: number; dy: number }
type Heart = { id: number; dx: number; dy: number }
type Screen = 'care' | 'zoo'
type Feedback = { tone: 'good' | 'bad' | 'info'; text: string }

const HINT_LABELS = ['💡 ヒント', '✏️ 1かくめを みる', '👀 ぜんぶ うすく みる', 'ヒントは おしまい']

function feedbackFor(fb: StrokeFeedback): Feedback {
  const n = fb.strokeIndex + 1
  switch (fb.judgement.kind) {
    case 'ok':
      return { tone: 'good', text: `⭕ ${n}かくめ じょうず！` }
    case 'wrong-order':
      return { tone: 'bad', text: `✋ かきじゅんが ちがうよ！ それは ${fb.judgement.matched + 1}かくめ。いまは ${n}かくめだよ` }
    case 'already':
      return { tone: 'bad', text: `🔁 ${fb.judgement.matched + 1}かくめは もう かいたよ。つぎは ${n}かくめ！` }
    case 'reversed':
      return { tone: 'bad', text: '↩️ むきが ぎゃくだよ！ はじまりの ばしょを たしかめてね' }
    default:
      return { tone: 'bad', text: `🤔 うーん… ${n}かくめは そこじゃないみたい。もういちど！` }
  }
}

export default function GameBoard() {
  const { state: zoo, feed, setActive, setGrade } = useZoo()
  const animal = animalById(zoo.activeId)
  const friendship = zoo.friendship[zoo.activeId] ?? 0
  const grade: GradeFilter = zoo.grade ?? 'all'

  const [screen, setScreen] = useState<Screen>('care')
  const [request, setRequest] = useState<KanjiRequest>(() => pickRandomRequest(zoo.grade ?? 'all'))
  /** ことばの中で、いま書いている漢字の番号 */
  const [slot, setSlot] = useState(0)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  /** いまの漢字で使ったヒントの段階（0〜3） */
  const [hintLevel, setHintLevel] = useState(0)
  /** このことばで使ったヒントの合計（なかよし度の増え方に効く） */
  const [hintsUsed, setHintsUsed] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [happy, setHappy] = useState(false)
  const [flying, setFlying] = useState<FlyingItem[]>([])
  const [hearts, setHearts] = useState<Heart[]>([])
  const [newFriendId, setNewFriendId] = useState<string | null>(null)

  const canvasRef = useRef<CanvasDrawHandle>(null)
  const petRef = useRef<HTMLDivElement>(null)
  const giveBtnRef = useRef<HTMLButtonElement>(null)
  const idSeq = useRef(0)
  const feedbackTimer = useRef<number | undefined>(undefined)
  /** お題（ペットと吹き出し）のかたまりと、書く場所のかたまり */
  const topRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const [boxSize, setBoxSize] = useState<number | undefined>(undefined)

  const kanjiParts = useMemo(() => kanjiPartsOf(request), [request])
  const complete = slot >= kanjiParts.length
  const currentKanji = kanjiParts[Math.min(slot, kanjiParts.length - 1)]
  const strokePaths = useMemo(() => strokePathsOf(currentKanji.char), [currentKanji.char])
  const hint = hintOf(currentKanji.char)
  const gain = GAIN_BY_HINTS[Math.min(hintsUsed, GAIN_BY_HINTS.length - 1)]

  // お題が変わったら最初の漢字から
  useEffect(() => {
    setSlot(0)
    setHintsUsed(0)
    setFeedback(null)
  }, [request])

  // 漢字が変わったら進み具合とヒント段階をリセット
  useEffect(() => {
    setProgress({ done: 0, total: strokePaths.length })
    setHintLevel(0)
  }, [strokePaths, slot])

  // 書く場所の大きさ: お題の上はし〜書く場所の下はしが、画面の高さに入るようにする（最大 384px・最小 220px）
  useLayoutEffect(() => {
    if (screen !== 'care') return
    const fit = () => {
      const top = topRef.current, board = boardRef.current
      if (!top || !board) return
      const above = board.getBoundingClientRect().top - top.getBoundingClientRect().top
      const width = board.parentElement?.clientWidth ?? 384
      const size = Math.round(Math.max(220, Math.min(384, width, window.innerHeight - above - 12)))
      setBoxSize(size)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [screen, request, slot, hintLevel])

  // 次のお題になったとき、吹き出しが画面の上に はみ出していたら見える位置まで戻す
  useEffect(() => {
    const top = topRef.current
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [request])

  const showFeedback = useCallback((fb: Feedback, ms = 2600) => {
    setFeedback(fb)
    window.clearTimeout(feedbackTimer.current)
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), ms)
  }, [])

  const handleStrokeFeedback = useCallback(
    (fb: StrokeFeedback) => {
      // 最後の一画の「できた」は handleProgress 側で ことば単位のメッセージを出す
      if (fb.judgement.kind === 'ok' && fb.strokeIndex + 1 >= strokePaths.length) return
      showFeedback(feedbackFor(fb), fb.judgement.kind === 'ok' ? 1800 : 3200)
    },
    [showFeedback, strokePaths.length],
  )

  const handleProgress = useCallback(
    (done: number, total: number) => {
      setProgress({ done, total })
      if (total === 0 || done < total) return
      const isLast = slot + 1 >= kanjiParts.length
      if (isLast) {
        showFeedback({ tone: 'good', text: `🎉 「${textOf(request)}（${readingOf(request)}）」が かけた！ すごい！` }, 5000)
      } else {
        const next = kanjiParts[slot + 1]
        showFeedback({ tone: 'good', text: `⭕ 「${currentKanji.char}」かけた！ つぎは「${next.reading}」の じだよ` }, 3500)
      }
      // 書けた字を少し見せてから次へ
      window.setTimeout(() => setSlot((s) => s + 1), 900)
    },
    [currentKanji.char, kanjiParts, request, showFeedback, slot],
  )

  const handleClear = useCallback(() => {
    canvasRef.current?.clear()
    setFeedback(null)
  }, [])

  const handleHint = useCallback(() => {
    if (hintLevel >= MAX_HINT_LEVEL) return
    const next = hintLevel + 1
    setHintLevel(next)
    setHintsUsed((h) => h + 1)
    if (next === 1) showFeedback({ tone: 'info', text: `💡 「${currentKanji.reading}」の じ：${hint.clue}（${strokePaths.length}かく）` }, 7000)
    if (next === 2) showFeedback({ tone: 'info', text: '✏️ 1かくめを うすく だしたよ。● から かきはじめてね' }, 4000)
    if (next === 3) showFeedback({ tone: 'info', text: '👀 ぜんぶ うすく だしたよ。なぞって かいてみよう' }, 4000)
  }, [currentKanji.reading, hint.clue, hintLevel, showFeedback, strokePaths.length])

  const handleGive = useCallback(() => {
    if (!complete || happy) return
    const petRect = petRef.current?.getBoundingClientRect()
    const btnRect = giveBtnRef.current?.getBoundingClientRect()
    if (!petRect || !btnRect) return

    // ボタンの位置からペットの中心へ飛ぶ
    const startX = btnRect.left + btnRect.width / 2
    const startY = btnRect.top
    const id = ++idSeq.current
    setFlying((f) => [
      ...f,
      {
        id,
        emoji: request.item,
        x: startX,
        y: startY,
        dx: petRect.left + petRect.width / 2 - startX,
        dy: petRect.top + petRect.height / 2 - startY,
      },
    ])
    setHappy(true)
    setFeedback(null)

    // アイテム到着 → ハート＆ゲージアップ
    let unlockedId: string | null = null
    window.setTimeout(() => {
      setFlying((f) => f.filter((i) => i.id !== id))
      const burst: Heart[] = Array.from({ length: 10 }, () => {
        const angle = Math.random() * Math.PI * 2
        const dist = 70 + Math.random() * 60
        return { id: ++idSeq.current, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 40 }
      })
      setHearts(burst)
      unlockedId = feed(gain).newAnimalId
    }, 900)

    // 次のお題へ（仲間が増えていればお祝い画面）
    window.setTimeout(() => {
      setHearts([])
      setHappy(false)
      setRequest((r) => pickRandomRequest(grade, r.id))
      if (unlockedId) setNewFriendId(unlockedId)
    }, 2600)
  }, [complete, happy, request.item, feed, gain, grade])

  /** 学年を変えたら、その学年のお題に切りかえる */
  const handleGrade = useCallback(
    (g: GradeFilter) => {
      if (g === grade || happy) return
      setGrade(g)
      setRequest(pickRandomRequest(g))
    },
    [grade, happy, setGrade],
  )

  const handleNewFriendClose = useCallback(() => {
    if (newFriendId) setActive(newFriendId)
    setNewFriendId(null)
    setScreen('zoo')
  }, [newFriendId, setActive])

  const handleSelectAnimal = useCallback(
    (id: string) => {
      setActive(id)
      setScreen('care')
    },
    [setActive],
  )

  const toneClass = {
    good: 'bg-pastel-mint text-choco',
    bad: 'bg-[#ffe4b8] text-choco',
    info: 'bg-pastel-lavender text-choco',
  }

  return (
    <main className="min-h-full flex flex-col items-center gap-3 px-4 py-4 max-w-md mx-auto">
      <header className="text-center w-full">
        <h1 className="text-2xl font-bold tracking-wide drop-shadow-[0_2px_0_white]">
          🐾 もじペットの おせわ 🐾
        </h1>
        <p className="text-sm mt-1 text-choco/70">
          ことばを きいて <ruby>漢字<rt>かんじ</rt></ruby>を かんがえて、ゆびで かこう！
        </p>

        {/* 画面切りかえタブ */}
        <nav className="mt-2 inline-flex rounded-full bg-white/70 p-1 shadow-inner">
          {(
            [
              ['care', `${animal.emoji} おせわ`],
              ['zoo', `🏡 どうぶつえん ${zoo.unlocked.length}/${ANIMALS.length}`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setScreen(key)}
              className={`px-4 min-h-11 rounded-full text-sm font-bold transition-all ${
                screen === key ? 'bg-pastel-pink-deep text-white shadow' : 'text-choco/70'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {screen === 'zoo' ? (
        <ZooView zoo={zoo} onSelect={handleSelectAnimal} onBackToCare={() => setScreen('care')} />
      ) : (
        <>
          {/* 学年えらび */}
          <div className="flex items-center gap-1 bg-white/60 rounded-full p-1 shadow-inner whitespace-nowrap">
            {(['1', '2', '3', 'all'] as const).map((key) => {
              const g: GradeFilter = key === 'all' ? 'all' : (Number(key) as 1 | 2 | 3)
              const active = g === grade
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleGrade(g)}
                  className={`px-3 min-h-9 rounded-full text-xs font-bold transition-all ${
                    active ? 'bg-pastel-mint-deep text-white shadow' : 'text-choco/70 hover:bg-white/70'
                  }`}
                >
                  {GRADE_LABEL[g]}
                  <span className="ml-1 opacity-70 font-normal">{requestsFor(g).length}</span>
                </button>
              )
            })}
          </div>

          <div ref={topRef} className="w-full flex flex-col items-center gap-2 scroll-mt-2">
          <PetArea
            ref={petRef}
            animal={animal}
            request={request}
            happy={happy}
            solvedKanji={slot}
            revealed={complete}
            friendship={friendship}
            hearts={hearts}
          />

          {!complete && (
            <p className="text-sm font-bold">
              いま かく じ：<span className="text-pastel-pink-deep text-lg">「{currentKanji.reading}」</span>
              {kanjiParts.length > 1 && (
                <span className="text-choco/60 font-normal">
                  （{slot + 1} / {kanjiParts.length} もじめ）
                </span>
              )}
            </p>
          )}

          <div ref={boardRef} className="w-full flex justify-center">
          <CanvasDraw
            key={`${request.id}-${slot}`}
            boxSize={boxSize}
            ref={canvasRef}
            strokePaths={strokePaths}
            hintLevel={hintLevel}
            radicalStrokes={hint.radicalStrokes}
            disabled={happy || complete}
            onProgress={handleProgress}
            onFeedback={handleStrokeFeedback}
          />
          </div>
          </div>

          {/* 判定メッセージ */}
          <div className="min-h-12 w-full max-w-sm flex items-center justify-center">
            {feedback && (
              <p
                key={feedback.text}
                className={`rounded-2xl px-4 py-2 font-bold text-center shadow ${
                  feedback.tone === 'bad' ? 'text-base animate-shake border-2 border-[#ffb15e]' : 'text-sm animate-pop'
                } ${toneClass[feedback.tone]}`}
              >
                {feedback.text}
              </p>
            )}
          </div>

          <div className="flex gap-3 w-full max-w-sm">
            <KawaiiButton
              variant="secondary"
              className="flex-1 !px-3 !text-base"
              onClick={handleClear}
              disabled={happy || complete || progress.done === 0}
            >
              🧽 かきなおす
            </KawaiiButton>
            <KawaiiButton
              variant="secondary"
              className="flex-1 !px-3 !text-base !bg-pastel-lavender !shadow-[0_6px_0_#c9b8f0] active:!shadow-[0_2px_0_#c9b8f0]"
              onClick={handleHint}
              disabled={happy || complete || hintLevel >= MAX_HINT_LEVEL}
            >
              {HINT_LABELS[hintLevel]}
            </KawaiiButton>
          </div>
          <KawaiiButton ref={giveBtnRef} className="w-full max-w-sm" onClick={handleGive} disabled={happy || !complete}>
            {request.item} {animal.name}に あげる{complete ? ` （+${gain}）` : ''}
          </KawaiiButton>

          <p className="text-sm text-choco/60">
            あげた <ruby>回数<rt>かいすう</rt></ruby>：{zoo.feedCount} かい
            {hintsUsed > 0 && !complete && ` ・ ヒント ${hintsUsed}かい（なかよし +${gain}）`}
          </p>
        </>
      )}

      {newFriendId && <NewFriendOverlay animal={animalById(newFriendId)} onClose={handleNewFriendClose} />}

      {/* 飛んでいくアイテム（画面全体に固定配置） */}
      {flying.map((f) => (
        <span
          key={f.id}
          className="fixed text-6xl pointer-events-none z-50 animate-fly -translate-x-1/2 -translate-y-1/2"
          style={
            {
              left: f.x,
              top: f.y,
              '--fly-x': `${f.dx}px`,
              '--fly-y': `${f.dy}px`,
            } as React.CSSProperties
          }
        >
          {f.emoji}
        </span>
      ))}
    </main>
  )
}
