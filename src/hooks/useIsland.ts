// しまの じょうたい（なかま・しんか・やせいの モンスター）。この端末のブラウザに保存する
import { useCallback, useEffect, useRef, useState } from 'react'
import { EVOLVE_AT, LINES, lineById, STARTER_LINES, STRONG_AGAINST } from '../data/monsters'

export type Stage = 1 | 2 | 3
export type Mon = { uid: number; lineId: string; stage: Stage }

export type IslandState = {
  /** かける けいとう */
  unlocked: string[]
  /** けいとうごとの いまの だんかい */
  stage: Record<string, Stage>
  /** いまの だんかいで かいた かいすう（EVOLVE_AT で しんか） */
  stageWrites: Record<string, number>
  /** ぜんぶで かいた かいすう */
  totalWrites: number
  /** しまに いる モンスター（かくたびに ふえる） */
  mons: Mon[]
  /** やってきた やせいの モンスター（なかよくなるまで のこる） */
  wild: { lineId: string } | null
  /** やせいが くるまでの カウント */
  untilWild: number
  /** ずかんに のった（いちどでも なかまに なった）すがた: "lineId:stage" */
  seen: string[]
  nextUid: number
}

const KEY = 'moji-monster-v1'
/** なんかい かくと やせいの モンスターが くるか */
export const WILD_EVERY = 4
/** しまに ならべる さいだいの かず（ふえすぎたら ふるい ちいさい子から おうちに かえる） */
export const MAX_MONS = 60

export function initial(): IslandState {
  return {
    unlocked: [...STARTER_LINES],
    stage: Object.fromEntries(LINES.map((l) => [l.id, 1 as Stage])),
    stageWrites: Object.fromEntries(LINES.map((l) => [l.id, 0])),
    totalWrites: 0,
    mons: [],
    wild: null,
    untilWild: WILD_EVERY,
    seen: [],
    nextUid: 1,
  }
}

function load(): IslandState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial(), ...JSON.parse(raw) }
  } catch {
    /* 保存できない環境でも あそべる */
  }
  return initial()
}

/** かいた けっか（画面の えんしゅつに つかう） */
export type WriteResult = {
  lineId: string
  stage: Stage
  /** しんか した（新しい だんかい） */
  evolvedTo?: Stage
  /** やせいの モンスターと なかよくなった */
  befriended?: string
  /** やせいの モンスターが やってきた */
  wildArrived?: string
}

function addMon(s: IslandState, lineId: string, stage: Stage): IslandState {
  let mons = [...s.mons, { uid: s.nextUid, lineId, stage }]
  if (mons.length > MAX_MONS) {
    // いちばん ふるい 1だんかいの子から かえる（なければ いちばん ふるい子）
    const i = mons.findIndex((m) => m.stage === 1)
    mons.splice(i >= 0 ? i : 0, 1)
  }
  const key = `${lineId}:${stage}`
  return { ...s, mons, nextUid: s.nextUid + 1, seen: s.seen.includes(key) ? s.seen : [...s.seen, key] }
}

function pickWild(s: IslandState, rand: () => number): string {
  const locked = LINES.filter((l) => !s.unlocked.includes(l.id))
  const pool = locked.length ? locked : LINES
  return pool[Math.floor(rand() * pool.length)].id
}

/** かいた けっかを 次の じょうたいに する（純粋な関数・テストしやすい） */
export function applyWrite(prev: IslandState, lineId: string, friendWith?: string, rand = Math.random): { next: IslandState; result: WriteResult } {
  let s: IslandState = { ...prev, stage: { ...prev.stage }, stageWrites: { ...prev.stageWrites } }
  const st = s.stage[lineId]
  s = addMon(s, lineId, st)
  s.totalWrites += 1
  s.stageWrites[lineId] = (s.stageWrites[lineId] ?? 0) + 1
  const result: WriteResult = { lineId, stage: st }
  if (st < 3 && s.stageWrites[lineId] >= EVOLVE_AT) {
    const nx = (st + 1) as Stage
    s.stage[lineId] = nx
    s.stageWrites[lineId] = 0
    // いま かいた子が しんか する
    s.mons = s.mons.map((m) => (m.uid === s.nextUid - 1 ? { ...m, stage: nx } : m))
    const key = `${lineId}:${nx}`
    if (!s.seen.includes(key)) s.seen = [...s.seen, key]
    result.evolvedTo = nx
  }
  if (friendWith && s.wild?.lineId === friendWith) {
    // やせいの子が なかまに なる
    if (!s.unlocked.includes(friendWith)) s.unlocked = [...s.unlocked, friendWith]
    s = addMon(s, friendWith, 1)
    s.wild = null
    s.untilWild = WILD_EVERY
    result.befriended = friendWith
  } else if (!s.wild) {
    s.untilWild -= 1
    if (s.untilWild <= 0) {
      s.wild = { lineId: pickWild(s, rand) }
      result.wildArrived = s.wild.lineId
    }
  }
  return { next: s, result }
}

export function useIsland() {
  const [state, setState] = useState<IslandState>(load)
  const ref = useRef(state)
  ref.current = state

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* noop */
    }
  }, [state])

  /** なかまの なまえを かけた（やせいの モンスターへの こたえ なら friendWith に やせいの子の lineId） */
  const wrote = useCallback((lineId: string, friendWith?: string): WriteResult => {
    const { next, result } = applyWrite(ref.current, lineId, friendWith)
    ref.current = next
    setState(next)
    return result
  }, [])

  const reset = useCallback(() => {
    const s = initial()
    ref.current = s
    setState(s)
  }, [])

  return { state, wrote, reset }
}

/** やせいの子に つよい なかま（かける けいとう） */
export function helpersFor(state: IslandState, wildLineId: string) {
  const strong = STRONG_AGAINST[lineById(wildLineId).type]
  return state.unlocked.filter((id) => strong.includes(lineById(id).type))
}
