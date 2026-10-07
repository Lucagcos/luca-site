import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findAnswer, makeDeck, normalizeAnswer, questions, rarity } from '../node_modules/.cache/outlier-tests/game.js'

test('matching handles case, spacing, punctuation, diacritics and aliases', () => {
  const languages = questions.find((q) => q.id === 'ese')
  assert.equal(findAnswer(languages, '  PORTUGUÉSE!! ')?.name, 'Portuguese')
  const halls = questions.find((q) => q.id === 'halls')
  assert.equal(findAnswer(halls, 'mary ethel pew hall')?.name, 'MEP Hall')
  assert.equal(normalizeAnswer('Paul J. McNulty'), 'pauljmcnulty')
})

test('invalid and empty inputs do not award points', () => {
  const question = questions[0]
  for (const input of ['', ' ', '!!!', 'English', 'Japan', 'Japanese or Chinese']) {
    assert.equal(findAnswer(question, input), undefined)
  }
})

test('rarer examples earn more points than common answers', () => {
  const question = questions[0]
  assert.equal(findAnswer(question, 'Japanese').points, 150)
  assert.equal(findAnswer(question, 'Buginese').points, 1000)
  assert.ok(findAnswer(question, 'Buginese').points > findAnswer(question, 'Japanese').points)
})

test('each pack produces five unique questions and respects pack boundaries', () => {
  for (const pack of ['classic', 'grover', 'mixed']) {
    const deck = makeDeck(pack, () => 0.4)
    assert.equal(deck.length, 5)
    assert.equal(new Set(deck.map((q) => q.id)).size, 5)
    if (pack !== 'mixed') assert.ok(deck.every((q) => q.pack === pack))
  }
  assert.equal(makeDeck('classic')[0].id, 'ese')
})

test('shuffling leaves the shared question bank unchanged', () => {
  const before = questions.map((q) => q.id)
  makeDeck('mixed', () => 0)
  assert.deepEqual(questions.map((q) => q.id), before)
  assert.notDeepEqual(makeDeck('grover', () => 0).map((q) => q.id), makeDeck('grover', () => 0.999).map((q) => q.id))
})

test('question data has unique, unambiguous aliases and bounded integer scores', () => {
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length)
  for (const question of questions) {
    assert.ok(question.answers.length > 0)
    if (question.pack === 'grover') assert.ok(question.source.startsWith('https://www.gcc.edu/'))
    const owners = new Map()
    for (const answer of question.answers) {
      assert.ok(Number.isInteger(answer.points) && answer.points >= 100 && answer.points <= 1000)
      for (const name of [answer.name, ...(answer.aliases ?? [])]) {
        const normalized = normalizeAnswer(name)
        assert.ok(!owners.has(normalized) || owners.get(normalized) === answer.name, `Ambiguous alias: ${name}`)
        owners.set(normalized, answer.name)
        assert.equal(findAnswer(question, name)?.name, answer.name)
      }
    }
  }
})

test('literal category rules are respected by canonical country and language names', () => {
  for (const answer of questions.find((q) => q.id === 'am').answers) {
    const name = answer.name.toLowerCase()
    assert.ok(name.includes('a') && name.includes('m'), answer.name)
  }
  for (const answer of questions.find((q) => q.id === 'ese').answers) assert.ok(answer.name.endsWith('ese'))
  for (const answer of questions.find((q) => q.id === 'land').answers) assert.ok(answer.name.endsWith('land'))
})

test('rarity boundaries are explicit', () => {
  assert.equal(rarity(100), 'Common')
  assert.equal(rarity(349), 'Common')
  assert.equal(rarity(350), 'Uncommon')
  assert.equal(rarity(649), 'Uncommon')
  assert.equal(rarity(650), 'Rare')
  assert.equal(rarity(899), 'Rare')
  assert.equal(rarity(900), 'Legendary')
  assert.equal(rarity(1000), 'Legendary')
})
