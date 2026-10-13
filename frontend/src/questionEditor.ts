import { normalizeAnswer, questions } from './game.js'
import type { Answer, Question } from './game.js'

export const editorStorageKey = 'niche-question-editor-v1'

export function parseAliases(value: string): string[] {
  return value.split(/[,\r\n]+/).map((alias) => alias.trim()).filter(Boolean)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown, label: string, required = true): string {
  if (typeof value !== 'string' || (required && !value.trim())) {
    throw new Error(`${label} must be ${required ? 'non-empty text' : 'text'}.`)
  }
  return value.trim()
}

export function validateQuestions(value: unknown, reservedIds = questions.map((question) => question.id)): Question[] {
  if (!Array.isArray(value)) throw new Error('Questions must be a JSON array.')
  const ids = new Set(reservedIds)
  return value.map((item: unknown, index) => {
    const label = `Question ${index + 1}`
    if (!isRecord(item)) throw new Error(`${label} must be an object.`)
    const id = text(item.id, `${label} ID`)
    if (ids.has(id)) throw new Error(`${label}: ID "${id}" is already in use.`)
    ids.add(id)
    if (item.pack !== 'classic' && item.pack !== 'grover') {
      throw new Error(`${label}: pack must be classic or grover.`)
    }
    if (!Array.isArray(item.answers) || item.answers.length === 0) {
      throw new Error(`${label} needs at least one answer.`)
    }
    const names = new Map<string, number>()
    const answers: Answer[] = item.answers.map((entry: unknown, answerIndex) => {
      const answerLabel = `${label}, answer ${answerIndex + 1}`
      if (!isRecord(entry)) throw new Error(`${answerLabel} must be an object.`)
      const name = text(entry.name, `${answerLabel} name`)
      if (typeof entry.points !== 'number' || !Number.isInteger(entry.points) || entry.points < 10 || entry.points > 100) {
        throw new Error(`${answerLabel}: points must be an integer from 10 to 100.`)
      }
      let aliases: string[] = []
      if (entry.aliases !== undefined) {
        if (!Array.isArray(entry.aliases)) throw new Error(`${answerLabel}: aliases must be an array.`)
        aliases = entry.aliases.flatMap((alias: unknown) => parseAliases(text(alias, `${answerLabel} alias`)))
        if (entry.aliases.length > 0 && aliases.length === 0) {
          throw new Error(`${answerLabel}: aliases must contain non-empty text.`)
        }
      }
      for (const candidate of [name, ...aliases]) {
        const normalized = normalizeAnswer(candidate)
        if (!normalized) throw new Error(`${answerLabel}: "${candidate}" needs a letter or number recognized by the game.`)
        const owner = names.get(normalized)
        if (owner !== undefined && owner !== answerIndex) {
          throw new Error(`${answerLabel}: "${candidate}" matches another answer in this question.`)
        }
        names.set(normalized, answerIndex)
      }
      return { name, points: entry.points, ...(aliases.length ? { aliases } : {}) }
    })
    const question: Question = {
      id,
      category: text(item.category, `${label} category`),
      pack: item.pack,
      prompt: text(item.prompt, `${label} prompt`),
      detail: text(item.detail, `${label} detail`, false),
      answers,
    }
    if (item.week !== undefined) question.week = text(item.week, `${label} week`)
    if (item.source !== undefined && item.source !== '') {
      const source = text(item.source, `${label} source`)
      let url: URL
      try {
        url = new URL(source)
      } catch {
        throw new Error(`${label}: source must be an absolute HTTP or HTTPS URL.`)
      }
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`${label}: source must be an absolute HTTP or HTTPS URL.`)
      }
      question.source = source
    }
    return question
  })
}

export function appendWeek(bank: Question[], value: unknown, week: string): Question[] {
  const name = text(week, 'Week')
  if (bank.some((question) => question.pack === 'grover' && (question.week ?? 'Week 1') === name)) {
    throw new Error(`"${name}" already exists. Use a new week name to preserve previous weeks.`)
  }
  if (!Array.isArray(value) || value.length === 0) throw new Error('Upload a non-empty JSON array of questions.')
  return validateQuestions([...bank, ...value.map((item: unknown) => {
    if (!isRecord(item)) throw new Error('Each uploaded question must be an object.')
    return { ...item, id: `${name}:${text(item.id, 'Uploaded question ID')}`, pack: 'grover', week: name }
  })])
}

export function exportQuestions(value: unknown): string {
  const bank = validateQuestions(value)
  return `import type { Question } from './game'\n\nexport const customQuestions: Question[] = ${JSON.stringify(bank, null, 2)}\n`
}
