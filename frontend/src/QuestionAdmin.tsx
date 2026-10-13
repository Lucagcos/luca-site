import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { customQuestions } from './customQuestions'
import type { Pack, Question } from './game'
import { appendWeek, editorStorageKey, exportQuestions, parseAliases, validateQuestions } from './questionEditor'
import { defaultWeek, listWeeks } from './weeklyGame'
import './QuestionAdmin.css'

type AnswerDraft = { name: string; aliases: string; points: string }
type Draft = {
  id: string; category: string; pack: Pack; week: string; prompt: string; detail: string; source: string
  answers: AnswerDraft[]
}

const blankAnswer = (): AnswerDraft => ({ name: '', aliases: '', points: '50' })
const blankQuestion = (): Draft => ({
  id: 'custom-', category: '', pack: 'grover', week: defaultWeek, prompt: '', detail: '', source: '', answers: [blankAnswer()],
})

function toDraft(question: Question): Draft {
  return {
    ...question,
    week: question.week ?? defaultWeek,
    source: question.source ?? '',
    answers: question.answers.map((answer) => ({
      name: answer.name, aliases: (answer.aliases ?? []).join('\n'), points: String(answer.points),
    })),
  }
}

function loadBank(): { bank: Question[]; error: string } {
  try {
    const stored = localStorage.getItem(editorStorageKey)
    return { bank: validateQuestions(stored === null ? customQuestions : JSON.parse(stored)), error: '' }
  } catch (error) {
    return {
      bank: [],
      error: `Could not load saved questions: ${error instanceof Error ? error.message : String(error)} Your saved data has not been overwritten. Import a backup or reload after correcting it.`,
    }
  }
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function QuestionAdmin() {
  const [initial] = useState(loadBank)
  const [bank, setBank] = useState(initial.bank)
  const [draft, setDraft] = useState<Draft>(blankQuestion)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState(initial.error)
  const [message, setMessage] = useState('')
  const [importText, setImportText] = useState('')
  const [uploadWeek, setUploadWeek] = useState('')

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function update(next: Draft) {
    setDraft(next)
    setDirty(true)
    setMessage('')
    setError('')
  }

  function select(question?: Question) {
    if (dirty && !window.confirm('Discard unsaved changes to this question?')) return
    setDraft(question ? toDraft(question) : blankQuestion())
    setEditingId(question?.id ?? null)
    setDirty(false)
    setError('')
    setMessage('')
  }

  function persist(next: Question[], success: string): boolean {
    try {
      localStorage.setItem(editorStorageKey, JSON.stringify(next))
      setBank(next)
      setError('')
      setMessage(success)
      return true
    } catch (error) {
      setError(`Could not save questions in this browser: ${error instanceof Error ? error.message : String(error)} No changes were saved. Keep this page open and try again.`)
      return false
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const question = {
        ...draft,
        answers: draft.answers.map((answer) => ({
          name: answer.name,
          points: Number(answer.points),
          aliases: parseAliases(answer.aliases),
        })),
      }
      const next = validateQuestions(editingId === null
        ? [...bank, question]
        : bank.map((item) => item.id === editingId ? question : item))
      if (persist(next, 'Question saved in this browser. Export to publish it.')) {
        const saved = next.find((item) => item.id === draft.id.trim())!
        setDraft(toDraft(saved))
        setEditingId(saved.id)
        setDirty(false)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  function remove() {
    if (editingId === null || !window.confirm('Delete this question and any unsaved edits? Exported files will not change.')) return
    if (persist(bank.filter((item) => item.id !== editingId), 'Question deleted from this browser.')) {
      setDraft(blankQuestion())
      setEditingId(null)
      setDirty(false)
    }
  }

  function importBank() {
    try {
      const next = validateQuestions(JSON.parse(importText))
      if (!window.confirm('Replace all editor questions with this backup and discard unsaved edits?')) return
      if (persist(next, 'Backup imported and saved in this browser.')) {
        setDraft(blankQuestion())
        setEditingId(null)
        setDirty(false)
        setImportText('')
      }
    } catch (error) {
      setError(`Could not import backup: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  function exportBank(format: 'ts' | 'json') {
    if (dirty) {
      setError('Save or discard the current question before exporting. Exports contain saved questions only.')
      return
    }
    try {
      const content = format === 'ts' ? exportQuestions(bank) : JSON.stringify(validateQuestions(bank), null, 2)
      download(format === 'ts' ? 'customQuestions.ts' : 'customQuestions.json', content, format === 'ts' ? 'text/plain' : 'application/json')
      setError('')
      setMessage('Export downloaded. Browser saves do not modify the source file or deployed game.')
    } catch (error) {
      setError(`Could not export questions: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async function upload(file: File) {
    if (dirty) {
      setError('Save or discard the current question before uploading a week.')
      return
    }
    try {
      const next = appendWeek(bank, JSON.parse(await file.text()), uploadWeek)
      if (persist(next, `Added ${uploadWeek.trim()} without changing previous weeks. Export to publish it.`)) setUploadWeek('')
    } catch (error) {
      setError(`Could not upload week: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <main className="question-admin">
      <header className="admin-header">
        <div><p className="admin-eyebrow">NICHE / LOCAL ADMIN</p><h1>Question editor</h1></div>
        <a href="/" onClick={(event) => { if (dirty && !window.confirm('Leave and discard unsaved changes?')) event.preventDefault() }}>Back to game</a>
      </header>
      <p className="admin-description">Create questions visually or upload a new weekly JSON pack below. Previous weeks stay in the bank. Save in this browser, then export <code>customQuestions.ts</code> and replace <code>frontend/src/customQuestions.ts</code> before building and deploying. Keep published week names and questions unchanged. This editor is development-only, not an online publishing tool.</p>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {message && <p className="admin-message" role="status">{message}</p>}
      <div className="admin-layout">
        <aside className="admin-panel">
          <h2>Saved questions ({bank.length})</h2>
          <button type="button" onClick={() => select()}>New question</button>
          <ul className="admin-question-list">{bank.map((question) => (
            <li key={question.id}><button type="button" aria-pressed={editingId === question.id} onClick={() => select(question)}>
              <strong>{question.prompt}</strong><small>{question.id} / {question.pack} / {question.week ?? defaultWeek}</small>
            </button></li>
          ))}</ul>
          {bank.length === 0 && <p>No custom questions saved yet.</p>}
          <div className="admin-actions">
            <button type="button" onClick={() => exportBank('ts')}>Export customQuestions.ts</button>
            <button type="button" onClick={() => exportBank('json')}>Download JSON backup</button>
          </div>
          <section className="admin-import">
            <h3>Upload a new week</h3>
            <label>New week name<input value={uploadWeek} onChange={(event) => setUploadWeek(event.target.value)} placeholder="Week 2" /></label>
            <p>Upload a JSON array of questions. It becomes a new Grover week; existing weeks are kept. Uploaded IDs are prefixed with the week name. New weeks appear first in the game selector.</p>
            <label>Questions JSON file<input type="file" accept=".json,application/json" disabled={!uploadWeek.trim() || dirty} onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void upload(file)
            }} /></label>
          </section>
          <details className="admin-import"><summary>Restore JSON backup</summary>
            <label htmlFor="import-bank">Paste the JSON array from your backup</label>
            <textarea id="import-bank" rows={8} value={importText} onChange={(event) => setImportText(event.target.value)} />
            <button type="button" onClick={importBank}>Replace saved questions</button>
          </details>
        </aside>
        <form className="admin-panel admin-form" onSubmit={save}>
          <h2>{editingId === null ? 'New question' : 'Edit question'}{dirty ? ' (unsaved)' : ''}</h2>
          <div className="admin-fields">
            <label>ID<input required value={draft.id} onChange={(event) => update({ ...draft, id: event.target.value })} /><small>Unique across all weeks and packs. Use a week-specific ID such as week-2-q1. Uploaded weekly packs get prefixed IDs automatically.</small></label>
            <label>Category<input required value={draft.category} onChange={(event) => update({ ...draft, category: event.target.value })} /></label>
            <label>Pack<select value={draft.pack} onChange={(event) => update({ ...draft, pack: event.target.value === 'grover' ? 'grover' : 'classic' })}><option value="classic">Classic</option><option value="grover">Grover</option></select></label>
            <label>Week name<input required list="existing-weeks" value={draft.week} onChange={(event) => update({ ...draft, week: event.target.value })} /><datalist id="existing-weeks">{listWeeks(bank).map((week) => <option key={week} value={week} />)}</datalist><small>Use a new name for a new week. Never rename a published week; the name identifies players' saved games.</small></label>
            <label>Source URL (optional)<input type="url" value={draft.source} onChange={(event) => update({ ...draft, source: event.target.value })} /></label>
          </div>
          <label>Prompt<textarea required rows={2} value={draft.prompt} onChange={(event) => update({ ...draft, prompt: event.target.value })} /></label>
          <label>Detail<textarea rows={2} value={draft.detail} onChange={(event) => update({ ...draft, detail: event.target.value })} /></label>
          <h3>Answers</h3>
          <p>Points must be whole numbers from 10 to 100. Shared point values are allowed. Separate aliases with commas or newlines. Case, spaces, punctuation, and accents do not affect matching.</p>
          {draft.answers.map((answer, index) => (
            <fieldset key={index}>
              <legend>Answer {index + 1}</legend>
              <div className="admin-fields">
                <label>Name<input required value={answer.name} onChange={(event) => update({ ...draft, answers: draft.answers.map((item, i) => i === index ? { ...item, name: event.target.value } : item) })} /></label>
                <label>Points<input required type="number" min="10" max="100" step="1" value={answer.points} onChange={(event) => update({ ...draft, answers: draft.answers.map((item, i) => i === index ? { ...item, points: event.target.value } : item) })} /></label>
              </div>
              <label>Aliases<textarea rows={2} value={answer.aliases} onChange={(event) => update({ ...draft, answers: draft.answers.map((item, i) => i === index ? { ...item, aliases: event.target.value } : item) })} /></label>
              <button type="button" disabled={draft.answers.length === 1} onClick={() => update({ ...draft, answers: draft.answers.filter((_, i) => i !== index) })}>Remove answer {index + 1}</button>
            </fieldset>
          ))}
          <button type="button" onClick={() => update({ ...draft, answers: [...draft.answers, blankAnswer()] })}>Add answer</button>
          <div className="admin-actions">
            <button className="admin-primary" type="submit">Save question</button>
            <button type="button" onClick={() => select(bank.find((item) => item.id === editingId))}>Discard edits</button>
            {editingId !== null && <button type="button" onClick={remove}>Delete question</button>}
          </div>
        </form>
      </div>
      <details className="admin-panel admin-preview"><summary>Generated TypeScript (saved questions)</summary><pre>{exportQuestions(bank)}</pre></details>
    </main>
  )
}
