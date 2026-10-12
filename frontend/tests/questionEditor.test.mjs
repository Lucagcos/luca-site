import assert from 'node:assert/strict'
import { test } from 'node:test'
import ts from 'typescript'
import { exportQuestions, parseAliases, validateQuestions } from '../node_modules/.cache/niche-tests/questionEditor.js'
import { findAnswer, questions } from '../node_modules/.cache/niche-tests/game.js'
import { customQuestions } from '../node_modules/.cache/niche-tests/customQuestions.js'

const example = () => ({
  id: 'custom-example', category: 'Examples', pack: 'classic',
  prompt: 'Name an example.', detail: '', source: 'https://example.com/reference',
  answers: [
    { name: 'Alpha', aliases: ['First', 'One'], points: 10 },
    { name: 'Beta', points: 100 },
    { name: 'Gamma', points: 100 },
  ],
})

test('valid questions retain all fields and support both packs and repeated points', () => {
  for (const pack of ['classic', 'grover']) {
    const question = { ...example(), pack }
    assert.deepEqual(validateQuestions([question]), [question])
    assert.equal(findAnswer(validateQuestions([question])[0], 'FIRST').points, 10)
  }
  assert.deepEqual(validateQuestions([]), [])
})

test('invalid shapes, required fields, IDs and packs are rejected', () => {
  for (const value of [null, {}, '[]', [null], [2]]) assert.throws(() => validateQuestions(value))
  for (const field of ['id', 'category', 'prompt']) {
    for (const value of ['', ' ', 1, null]) {
      assert.throws(() => validateQuestions([{ ...example(), [field]: value }]))
    }
  }
  assert.throws(() => validateQuestions([{ ...example(), detail: undefined }]), /detail/)
  assert.throws(() => validateQuestions([{ ...example(), pack: 'unknown' }]), /pack/)
  assert.throws(() => validateQuestions([example(), example()]), /already in use/)
  assert.throws(() => validateQuestions([{ ...example(), id: questions[0].id }]), /already in use/)
})

test('answer scores are integers within the inclusive 10 to 100 range', () => {
  for (const points of [9, 101, 50.5, NaN, Infinity, '50', null]) {
    assert.throws(() => validateQuestions([{ ...example(), answers: [{ name: 'Alpha', points }] }]), /integer from 10 to 100/)
  }
  for (const answers of [[], null, [null], [{ name: '', points: 50 }], [{ name: '!!!', points: 50 }]]) {
    assert.throws(() => validateQuestions([{ ...example(), answers }]))
  }
})

test('alias validation matches game normalization and rejects cross-answer collisions', () => {
  assert.throws(() => validateQuestions([{
    ...example(),
    answers: [{ name: 'Alphá', points: 50 }, { name: 'Beta', aliases: [' ALPHA!! '], points: 75 }],
  }]), /matches another answer/)
  for (const aliases of ['Alpha', [1], ['!!!'], [' ']]) {
    assert.throws(() => validateQuestions([{ ...example(), answers: [{ name: 'Alpha', aliases, points: 50 }] }]))
  }
  assert.doesNotThrow(() => validateQuestions([{
    ...example(), answers: [{ name: 'Alpha', aliases: ['ALPHA'], points: 50 }],
  }]))
})

test('editor splits comma-separated and newline-separated aliases including old saved entries', () => {
  assert.deepEqual(parseAliases(' CFA, Chick-fil-a,\r\nChick\n\n, Kiosk '), ['CFA', 'Chick-fil-a', 'Chick', 'Kiosk'])
  const question = {
    ...example(), answers: [{ name: 'Chickfila', aliases: ['CFA, Chick-fil-a,\nChick'], points: 50 }],
  }
  const [saved] = validateQuestions(JSON.parse(JSON.stringify([question])))
  assert.deepEqual(saved.answers[0].aliases, ['CFA', 'Chick-fil-a', 'Chick'])
  for (const input of ['cfa', ' CHICK - FIL - A ', 'chick']) {
    assert.equal(findAnswer(saved, input)?.name, 'Chickfila')
  }
  assert.match(exportQuestions([question]), /"CFA",\n\s+"Chick-fil-a",\n\s+"Chick"/)
  assert.throws(() => validateQuestions([{
    ...example(),
    answers: [
      { name: 'Alpha', aliases: ['One, First'], points: 50 },
      { name: 'Beta', aliases: ['FIRST, Second'], points: 75 },
    ],
  }]), /matches another answer/)
  assert.throws(() => validateQuestions([{
    ...example(), answers: [{ name: 'Alpha', aliases: [',,\n'], points: 50 }],
  }]), /non-empty text/)
})

test('every actual custom name and alias matches independently, ignoring case, spaces and punctuation', () => {
  assert.deepEqual(validateQuestions(customQuestions), customQuestions)
  for (const question of customQuestions) {
    for (const answer of question.answers) {
      for (const name of [answer.name, ...(answer.aliases ?? [])]) {
        assert.ok(!name.includes(','), `${question.id}: combined alias "${name}"`)
        assert.equal(findAnswer(question, name)?.name, answer.name, `${question.id}: ${name}`)
        assert.equal(findAnswer(question, `  ${name.toUpperCase().split('').join(' ')}!! `)?.name, answer.name)
      }
    }
  }
  assert.equal(findAnswer(customQuestions.find((q) => q.id === 'custom-1'), 'hicks dining hall')?.name, 'Dining hall')
  assert.equal(findAnswer(customQuestions.find((q) => q.id === 'custom-2'), ' p p p ')?.name, 'Tri Rho')
})

test('source URLs cannot use script protocols or relative paths', () => {
  for (const source of ['javascript:alert(1)', 'file:///etc/passwd', '/relative', 'not a URL']) {
    assert.throws(() => validateQuestions([{ ...example(), source }]), /HTTP or HTTPS/)
  }
  const question = example()
  delete question.source
  assert.deepEqual(validateQuestions([question]), [question])
})

test('export is executable TypeScript with the exact Question[] shape and escaped text', () => {
  const question = {
    ...example(),
    prompt: 'Quotes: "\'`, slash: \\, newline:\n${alert(1)}',
    answers: [{ name: 'Quoted "answer"', aliases: ['Quoted "alias"'], points: 50 }],
  }
  const output = exportQuestions([question])
  assert.match(output, /import type \{ Question \} from '\.\/game'/)
  assert.match(output, /export const customQuestions: Question\[\] = /)
  const compiled = ts.transpileModule(output, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
    reportDiagnostics: true,
  })
  assert.deepEqual(compiled.diagnostics, [])
  assert.match(compiled.outputText, /^export const customQuestions = /)
  const json = compiled.outputText.replace(/^export const customQuestions = /, '').trim().replace(/;$/, '')
  assert.deepEqual(JSON.parse(json), [question])
  assert.equal(exportQuestions([]), "import type { Question } from './game'\n\nexport const customQuestions: Question[] = []\n")
})
