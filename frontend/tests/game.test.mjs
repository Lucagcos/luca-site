import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findAnswer, makeDeck, matchAnswer, normalizeAnswer, questions, rarity } from '../node_modules/.cache/niche-tests/game.js'

test('matching handles case, spacing, punctuation, diacritics and aliases', () => {
  const languages = questions.find((q) => q.id === 'ese')
  assert.equal(findAnswer(languages, '  PORTUGUÉSE!! ')?.name, 'Portuguese')
  const halls = questions.find((q) => q.id === 'halls')
  assert.equal(findAnswer(halls, 'mary ethel pew hall')?.name, 'MEP Hall')
  assert.equal(normalizeAnswer('Paul J. McNulty'), 'pauljmcnulty')
})

test('canonical matches score directly while aliases require canonical confirmation', () => {
  const halls = questions.find((q) => q.id === 'halls')
  assert.equal(matchAnswer(halls, '  mép HALL!! ').kind, 'exact')
  const alias = matchAnswer(halls, 'mary ethel pew hall')
  assert.equal(alias.kind, 'correction')
  assert.equal(alias.answer.name, 'MEP Hall')
  assert.equal(matchAnswer(halls, alias.answer.name).kind, 'exact')
})

test('one and two character typos correct names and aliases without scoring', () => {
  const question = {
    ...questions[0],
    answers: [{ name: 'Bookstore', points: 40 }, { name: 'Dining hall', aliases: ['Hicks'], points: 10 }],
  }
  for (const input of ['Bookstor', 'Bookstoore', 'Booxstore', 'Booxstor', 'Booxstoxe', 'Bookstroe']) {
    const match = matchAnswer(question, input)
    assert.equal(match.kind, 'correction', input)
    assert.equal(match.answer.name, 'Bookstore', input)
    assert.equal(matchAnswer(question, match.answer.name).kind, 'exact')
  }
  assert.equal(matchAnswer(question, 'Hixks').answer.name, 'Dining hall')
  assert.equal(matchAnswer(question, 'Bxxxstore').kind, 'missing')
})

test('exact matches outrank fuzzy candidates and the unique closest match wins', () => {
  const question = {
    ...questions[0],
    answers: [{ name: 'Alpha', points: 50 }, { name: 'Alphab', points: 60 }],
  }
  assert.equal(matchAnswer(question, 'Alpha').kind, 'exact')
  assert.equal(matchAnswer(question, 'Alpxa').answer.name, 'Alpha')
  assert.equal(matchAnswer(question, 'Alphax').kind, 'ambiguous')
})

test('multiple equally close aliases for the same answer do not create ambiguity', () => {
  const question = {
    ...questions[0],
    answers: [{ name: 'Dining hall', aliases: ['Hicks', 'Hickz'], points: 10 }],
  }
  assert.equal(matchAnswer(question, 'Hick').kind, 'correction')
  assert.equal(matchAnswer(question, 'Hick').answer.name, 'Dining hall')
})

test('empty and unrelated inputs never produce a fuzzy correction', () => {
  const halls = questions.find((q) => q.id === 'halls')
  for (const input of ['', ' ', '!!!', 'unknown answer', 'z'.repeat(120)]) {
    assert.equal(matchAnswer(halls, input).kind, 'missing')
  }
})

test('invalid and empty inputs do not award points', () => {
  const question = questions[0]
  for (const input of ['', ' ', '!!!', 'English', 'Japan', 'Japanese or Chinese']) {
    assert.equal(findAnswer(question, input), undefined)
  }
})

test('rarer examples earn more points than common answers', () => {
  const question = questions[0]
  assert.equal(findAnswer(question, 'Japanese').points, 15)
  assert.equal(findAnswer(question, 'Buginese').points, 100)
  assert.ok(findAnswer(question, 'Buginese').points > findAnswer(question, 'Japanese').points)
})

test('both editions produce five unique questions and respect pack boundaries', () => {
  for (const pack of ['classic', 'grover']) {
    const deck = makeDeck(pack, () => 0.4)
    assert.equal(deck.length, 5)
    assert.equal(new Set(deck.map((q) => q.id)).size, 5)
    assert.ok(deck.every((q) => q.pack === pack))
  }
})

test('shuffling leaves the shared question bank unchanged', () => {
  const before = questions.map((q) => q.id)
  makeDeck('classic', () => 0)
  assert.deepEqual(questions.map((q) => q.id), before)
  assert.notDeepEqual(makeDeck('grover', () => 0).map((q) => q.id), makeDeck('grover', () => 0.999).map((q) => q.id))
})

test('question data has unique, unambiguous aliases and 10–100 integer scores', () => {
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length)
  for (const question of questions) {
    assert.ok(question.answers.length > 0)
    if (question.pack === 'grover') assert.ok(question.source.startsWith('https://www.gcc.edu/'))
    const owners = new Map()
    for (const answer of question.answers) {
      assert.ok(Number.isInteger(answer.points) && answer.points >= 10 && answer.points <= 100)
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

test('rarity boundaries are explicit on the 10–100 point scale', () => {
  assert.equal(rarity(10), 'Common')
  assert.equal(rarity(34), 'Common')
  assert.equal(rarity(35), 'Uncommon')
  assert.equal(rarity(64), 'Uncommon')
  assert.equal(rarity(65), 'Rare')
  assert.equal(rarity(89), 'Rare')
  assert.equal(rarity(90), 'Legendary')
  assert.equal(rarity(100), 'Legendary')
})

test('multiple accepted answers can share a point value', () => {
  const question = {
    ...questions[0],
    answers: [{ name: 'Alpha', points: 50 }, { name: 'Beta', points: 50 }],
  }
  assert.equal(findAnswer(question, 'Alpha').points, 50)
  assert.equal(findAnswer(question, 'Beta').points, 50)
})

test('custom questions are included in the matching edition deck', () => {
  const custom = { ...questions[0], id: 'custom-smoke', pack: 'classic' }
  const deck = makeDeck('classic', () => 0.4, questions, [custom])
  assert.ok(deck.some((question) => question.id === custom.id))
  assert.ok(deck.every((question) => question.pack === 'classic'))
})

test('Grover uses only custom questions, regardless of ID prefix or bank size', () => {
  for (const count of [1, 4, 5, 8]) {
    const custom = Array.from({ length: count }, (_, i) => ({
      ...questions[0], id: `owner-grover-${i}`, pack: 'grover',
    }))
    const before = custom.map((question) => question.id)
    for (const random of [() => 0, () => 0.4, () => 0.999]) {
      const deck = makeDeck('grover', random, questions, custom)
      assert.equal(deck.length, Math.min(5, count))
      assert.equal(new Set(deck.map((question) => question.id)).size, deck.length)
      assert.ok(deck.every((question) => custom.includes(question)))
    }
    assert.deepEqual(custom.map((question) => question.id), before)
  }
})

test('Grover falls back to built-ins only when there are no custom Grover questions', () => {
  const classic = { ...questions[0], id: 'custom-classic', pack: 'classic' }
  for (const custom of [[], [classic]]) {
    const deck = makeDeck('grover', () => 0.4, questions, custom)
    assert.equal(deck.length, 5)
    assert.ok(deck.every((question) => question.pack === 'grover' && questions.includes(question)))
  }
})

test('Classic still fills rounds with built-ins and ignores custom Grover questions', () => {
  const classic = { ...questions[0], id: 'custom-classic', pack: 'classic' }
  const grover = { ...questions[0], id: 'custom-grover', pack: 'grover' }
  const deck = makeDeck('classic', () => 0.4, questions, [classic, grover])
  assert.equal(deck.length, 5)
  assert.ok(deck.includes(classic))
  assert.ok(!deck.includes(grover))
  assert.equal(deck.filter((question) => questions.includes(question)).length, 4)
})
