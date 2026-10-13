import { makeDeck, questions } from './game.js'
import type { Question } from './game.js'
import { validateQuestions } from './questionEditor.js'

export const defaultWeek = 'Week 1'
export const storagePrefix = 'niche-week-v1:'
export type Round = { answerIndex: number | null; timedOut: boolean }
export type Session = {
  week: string
  deck: Question[]
  results: Round[]
  currentResult: Round | null
  deadline: number | null
}

export function listWeeks(bank: Question[]): string[] {
  const weeks = [...new Set(bank.filter((question) => question.pack === 'grover').map((question) => question.week ?? defaultWeek))]
  return weeks.length ? weeks.reverse() : [defaultWeek]
}

export function weeklyDeck(week: string, bank: Question[], random = Math.random): Question[] {
  const custom = bank.filter((question) => question.pack === 'grover' && (question.week ?? defaultWeek) === week)
  if (!custom.length && week !== defaultWeek) throw new Error(`No questions found for ${week}.`)
  return makeDeck('grover', random, questions, custom)
}

export function beginSession(week: string, deck: Question[], now = Date.now()): Session {
  if (!deck.length) throw new Error('This week has no questions.')
  return { week, deck, results: [], currentResult: null, deadline: now + 30_000 }
}

export function isComplete(session: Session): boolean {
  return session.results.length === session.deck.length
}

export function hasExpired(session: Session, now = Date.now()): boolean {
  return session.deadline !== null && now >= session.deadline
}

export function finishRound(session: Session, answerIndex: number | null, now = Date.now()): Session {
  if (isComplete(session) || session.currentResult) return session
  const timedOut = hasExpired(session, now)
  return { ...session, currentResult: { answerIndex: timedOut ? null : answerIndex, timedOut }, deadline: null }
}

export function advanceSession(session: Session, now = Date.now()): Session {
  if (!session.currentResult) return session
  const results = [...session.results, session.currentResult]
  return { ...session, results, currentResult: null, deadline: results.length === session.deck.length ? null : now + 30_000 }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseSession(raw: string, week: string): Session {
  const value: unknown = JSON.parse(raw)
  if (!record(value) || value.week !== week) throw new Error('Invalid saved week.')
  const deck = validateQuestions(value.deck, [])
  if (!deck.length || deck.length > 5 || deck.some((question) => question.pack !== 'grover' || (question.week ?? defaultWeek) !== week)) {
    throw new Error('Invalid saved question deck.')
  }
  if (!Array.isArray(value.results) || value.results.length > deck.length) throw new Error('Invalid saved rounds.')
  const round = (item: unknown, index: number): Round => {
    if (!record(item) || typeof item.timedOut !== 'boolean' ||
      (item.answerIndex !== null && (typeof item.answerIndex !== 'number' || !Number.isInteger(item.answerIndex) ||
        item.answerIndex < 0 || item.answerIndex >= deck[index].answers.length)) ||
      (item.timedOut && item.answerIndex !== null)) throw new Error('Invalid saved answer.')
    return { answerIndex: item.answerIndex, timedOut: item.timedOut }
  }
  const results = value.results.map(round)
  const currentResult = value.currentResult === null ? null : results.length < deck.length ? round(value.currentResult, results.length) : undefined
  if (currentResult === undefined) throw new Error('Invalid saved current round.')
  const waiting = results.length < deck.length && currentResult === null
  if (waiting ? typeof value.deadline !== 'number' || !Number.isSafeInteger(value.deadline) || value.deadline <= 0 : value.deadline !== null) {
    throw new Error('Invalid saved timer.')
  }
  return { week, deck, results, currentResult, deadline: waiting ? Number(value.deadline) : null }
}

export function loadSession(week: string, storage: Pick<Storage, 'getItem'> = localStorage): Session | null {
  const raw = storage.getItem(storagePrefix + week)
  return raw === null ? null : parseSession(raw, week)
}

export function saveSession(session: Session, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(storagePrefix + session.week, JSON.stringify(session))
}
