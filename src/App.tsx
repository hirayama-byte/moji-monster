import { useState } from 'react'
import IslandView from './components/IslandView'
import PickScreen from './components/PickScreen'
import WriteScreen from './components/WriteScreen'
import BookView from './components/BookView'
import Celebrate, { type CelebrateItem } from './components/Celebrate'
import MonsterArt from './components/MonsterArt'
import { LINES } from './data/monsters'
import { useIsland } from './hooks/useIsland'

/** `?gallery` を付けて開くと、全モンスターの見た目を一覧で確認できる（開発用） */
function Gallery() {
  return (
    <div className="p-6 grid grid-cols-3 gap-4 max-w-5xl mx-auto">
      {LINES.map((l) => (
        <div key={l.id} className="flex items-end justify-around bg-white/70 rounded-3xl p-3">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex flex-col items-center">
              <MonsterArt lineId={l.id} stage={s} size={70 + s * 20} />
              <span className="text-sm font-bold">{l.names[s - 1]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

type Screen =
  | { name: 'island' }
  | { name: 'pick'; wild?: string }
  | { name: 'write'; lineId: string; wild?: string }
  | { name: 'book' }

function Game() {
  const { state, wrote, reset } = useIsland()
  const [screen, setScreen] = useState<Screen>({ name: 'island' })
  const [queue, setQueue] = useState<CelebrateItem[]>([])

  const finishWrite = (lineId: string, wild?: string) => {
    const r = wrote(lineId, wild)
    const items: CelebrateItem[] = []
    if (r.evolvedTo) items.push({ kind: 'evolved', lineId, stage: r.evolvedTo })
    else items.push({ kind: 'added', lineId, stage: r.stage })
    if (r.befriended) items.push({ kind: 'friend', lineId: r.befriended })
    if (r.wildArrived) items.push({ kind: 'wild', lineId: r.wildArrived })
    setQueue(items)
    setScreen({ name: 'island' })
  }

  return (
    <div className="h-full w-full">
      {screen.name === 'island' && (
        <IslandView
          state={state}
          onWrite={() => setScreen({ name: 'pick' })}
          onWild={() => state.wild && setScreen({ name: 'pick', wild: state.wild.lineId })}
          onBook={() => setScreen({ name: 'book' })}
        />
      )}
      {screen.name === 'pick' && (
        <PickScreen state={state} wildLineId={screen.wild} onBack={() => setScreen({ name: 'island' })} onPick={(id) => setScreen({ name: 'write', lineId: id, wild: screen.wild })} />
      )}
      {screen.name === 'write' && (
        <WriteScreen
          key={`${screen.lineId}-${state.stage[screen.lineId]}-${state.totalWrites}`}
          lineId={screen.lineId}
          stage={state.stage[screen.lineId]}
          wildLineId={screen.wild}
          onBack={() => setScreen({ name: 'pick', wild: screen.wild })}
          onDone={() => finishWrite(screen.lineId, screen.wild)}
        />
      )}
      {screen.name === 'book' && <BookView state={state} onBack={() => setScreen({ name: 'island' })} onReset={() => { reset(); setScreen({ name: 'island' }) }} />}
      {queue.length > 0 && <Celebrate key={queue.length} item={queue[0]} onNext={() => setQueue((q) => q.slice(1))} />}
    </div>
  )
}

export default function App() {
  if (new URLSearchParams(window.location.search).has('gallery')) return <Gallery />
  return <Game />
}
