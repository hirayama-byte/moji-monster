import { useCallback, useEffect, useState } from 'react'
import { ANIMALS, FRIENDSHIP_GAIN, FRIENDSHIP_MAX } from '../data/animals'
import type { GradeFilter } from '../data/requests'

export type ZooState = {
  /** 仲間になった動物の id（仲間入り順） */
  unlocked: string[]
  /** 動物ごとのなかよし度 */
  friendship: Record<string, number>
  /** いまお世話している動物 */
  activeId: string
  feedCount: number
  /** お題の学年（1・2・3・ぜんぶ） */
  grade?: GradeFilter
}

const STORAGE_KEY = 'moji-pet-zoo-v1'

const initialState = (): ZooState => ({
  unlocked: [ANIMALS[0].id],
  friendship: { [ANIMALS[0].id]: 20 },
  activeId: ANIMALS[0].id,
  feedCount: 0,
})

function load(): ZooState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as ZooState
    if (!Array.isArray(parsed.unlocked) || parsed.unlocked.length === 0) return initialState()
    return parsed
  } catch {
    return initialState()
  }
}

export type FeedResult = {
  friendship: number
  /** なかよし度100到達で仲間入りした動物の id（なければ null） */
  newAnimalId: string | null
}

/** いまの状態から「ごはんをあげた後」の状態を計算する（純粋関数） */
export function applyFeed(s: ZooState, gain = FRIENDSHIP_GAIN): { next: ZooState; result: FeedResult } {
  const current = s.friendship[s.activeId] ?? 0
  const value = Math.min(FRIENDSHIP_MAX, current + gain)
  const friendship = { ...s.friendship, [s.activeId]: value }
  let unlocked = s.unlocked
  let newAnimalId: string | null = null

  if (value >= FRIENDSHIP_MAX && current < FRIENDSHIP_MAX) {
    const candidate = ANIMALS.find((a) => !s.unlocked.includes(a.id))
    if (candidate) {
      newAnimalId = candidate.id
      unlocked = [...s.unlocked, candidate.id]
      friendship[candidate.id] = 20
    }
  }
  return {
    next: { ...s, friendship, unlocked, feedCount: s.feedCount + 1 },
    result: { friendship: value, newAnimalId },
  }
}

export function useZoo() {
  const [state, setState] = useState<ZooState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* プライベートモードなどで保存できなくてもゲームは続行 */
    }
  }, [state])

  /** ごはんをあげる（gain はなかよし度の増え方）。新しい仲間が増えたらその id を返す */
  const feed = useCallback(
    (gain?: number): FeedResult => {
      const { next, result } = applyFeed(state, gain)
      setState(next)
      return result
    },
    [state],
  )

  const setActive = useCallback((id: string) => {
    setState((s) => (s.unlocked.includes(id) ? { ...s, activeId: id } : s))
  }, [])

  const setGrade = useCallback((grade: GradeFilter) => setState((s) => ({ ...s, grade })), [])

  const reset = useCallback(() => setState(initialState()), [])

  return { state, feed, setActive, setGrade, reset }
}
