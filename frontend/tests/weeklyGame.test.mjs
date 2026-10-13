import assert from 'node:assert/strict'
import { test } from 'node:test'
import { appendWeek, exportQuestions, validateQuestions } from '../node_modules/.cache/niche-tests/questionEditor.js'
import { advanceSession, beginSession, finishRound, hasExpired, isComplete, listWeeks, loadSession, parseSession, saveSession, weeklyDeck } from '../node_modules/.cache/niche-tests/weeklyGame.js'

const question = (id, week) => ({
  id, pack: 'grover', category: 'Test', prompt: `Question ${id}`, detail: '',
  ...(week ? { week } : {}),
  answers: [{ name: 'Alpha', points: 10 }, { name: 'Beta', points: 100 }],
})
const storage = () => {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

test('legacy questions become Week 1 and newly added weeks appear first', () => {
  const bank = [question('old'), question('a', 'Week 2'), question('b', 'Week 2'), { ...question('c', 'Hidden'), pack: 'classic' }]
  assert.deepEqual(listWeeks(bank), ['Week 2', 'Week 1'])
  assert.deepEqual(listWeeks([]), ['Week 1'])
  assert.deepEqual(weeklyDeck('Week 2', bank).map((q) => q.id).sort(), ['a', 'b'])
  assert.deepEqual(weeklyDeck('Week 1', bank).map((q) => q.id), ['old'])
  assert.equal(weeklyDeck('Week 1', []).length, 5)
  assert.throws(() => weeklyDeck('Unknown', bank), /No questions/)
})

test('weekly decks preserve five-round limits and do not borrow from older weeks', () => {
  const bank = Array.from({ length: 7 }, (_, i) => question(`id-${i}`, 'Week 2'))
  bank.push(question('old'))
  const deck = weeklyDeck('Week 2', bank, () => 0.5)
  assert.equal(deck.length, 5)
  assert.equal(new Set(deck.map((q) => q.id)).size, 5)
  assert.ok(deck.every((q) => q.week === 'Week 2'))
})

test('uploads append a new week, namespace IDs, and preserve previous content', () => {
  const old = question('old')
  const next = appendWeek([old], [question('old'), question('second')], ' Week 2 ')
  assert.deepEqual(next[0], old)
  assert.equal(next[1].id, 'Week 2:old')
  assert.ok(next.slice(1).every((q) => q.week === 'Week 2'))
  assert.match(exportQuestions(next), /"week": "Week 2"/)
  assert.throws(() => appendWeek([old], [question('new')], 'Week 1'), /already exists/)
  assert.throws(() => appendWeek(next, [question('new')], 'Week 2'), /already exists/)
  assert.throws(() => appendWeek([old], [], 'Week 2'), /non-empty/)
  assert.throws(() => appendWeek([old], [question('x'), question('x')], 'Week 2'), /already in use/)
  for (const week of ['', ' ', null, 42]) assert.throws(() => validateQuestions([{ ...old, week }]), /week/)
})

test('progress round-trips with the original deck and deadline, independently for each week', () => {
  const store = storage()
  assert.equal(loadSession('Week 1', store), null)
  const first = beginSession('Week 1', [question('a'), question('b')], 1_000)
  saveSession(first, store)
  assert.deepEqual(loadSession('Week 1', store), first)
  assert.equal(loadSession('Week 1', store).deadline, 31_000)
  const second = beginSession('Week 2', [question('c', 'Week 2')], 2_000)
  saveSession(second, store)
  assert.deepEqual(loadSession('Week 1', store), first)
  assert.deepEqual(loadSession('Week 2', store), second)
})

test('completed results persist all player answers, skipped rounds, and points without replay', () => {
  const store = storage()
  let session = beginSession('Week 1', [question('a'), question('b'), question('c')], 1_000)
  session = finishRound(session, 1, 2_000)
  assert.equal(session.currentResult.answerIndex, 1)
  assert.equal(session.deadline, null)
  assert.deepEqual(finishRound(session, 0), session)
  session = advanceSession(session, 3_000)
  session = advanceSession(finishRound(session, null, 4_000), 5_000)
  session = advanceSession(finishRound(session, 0, 35_000), 36_000)
  assert.ok(isComplete(session))
  assert.deepEqual(session.results, [
    { answerIndex: 1, timedOut: false }, { answerIndex: null, timedOut: false }, { answerIndex: null, timedOut: true },
  ])
  assert.equal(session.results.reduce((sum, round, i) => sum + (round.answerIndex === null ? 0 : session.deck[i].answers[round.answerIndex].points), 0), 100)
  saveSession(session, store)
  assert.deepEqual(loadSession('Week 1', store), session)
  assert.deepEqual(advanceSession(session), session)
  assert.deepEqual(finishRound(session, 0), session)
})

test('elapsed time survives reload and expires at the exact deadline, even on submission', () => {
  const session = beginSession('Week 1', [question('a')], 10_000)
  const restored = parseSession(JSON.stringify(session), 'Week 1')
  assert.equal(hasExpired(restored, 39_999), false)
  assert.equal(hasExpired(restored, 40_000), true)
  assert.equal(finishRound(restored, 1, 39_999).currentResult.answerIndex, 1)
  assert.deepEqual(finishRound(restored, 1, 40_000).currentResult, { answerIndex: null, timedOut: true })
})

test('corrupt saves and storage failures surface instead of silently unlocking replay', () => {
  const session = beginSession('Week 1', [question('a')], 1_000)
  const invalid = [
    { ...session, week: 'Week 2' }, { ...session, deck: [] }, { ...session, results: [{ answerIndex: 9, timedOut: false }] },
    { ...session, results: [{ answerIndex: null, timedOut: true }, { answerIndex: null, timedOut: true }] },
    { ...session, deadline: null }, { ...session, currentResult: { answerIndex: 1, timedOut: true } },
    { ...session, currentResult: { answerIndex: null, timedOut: false } },
    { ...session, deadline: -1 }, { ...session, deck: [{ ...question('a'), week: 'Week 2' }] },
  ]
  for (const value of invalid) assert.throws(() => parseSession(JSON.stringify(value), 'Week 1'))
  assert.throws(() => parseSession('{', 'Week 1'))
  const broken = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('quota') } }
  assert.throws(() => loadSession('Week 1', broken), /blocked/)
  assert.throws(() => saveSession(session, broken), /quota/)
  assert.throws(() => beginSession('Week 1', []), /no questions/)
})
