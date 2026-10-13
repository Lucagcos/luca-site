import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { matchAnswer, rarity } from './game'
import type { Answer, Question } from './game'
import { customQuestions } from './customQuestions'
import { advanceSession, beginSession, finishRound, hasExpired, isComplete, listWeeks, loadSession, saveSession, storagePrefix, weeklyDeck } from './weeklyGame'
import type { Round, Session } from './weeklyGame'
import './App.css'

function Icon({ name, size = 20 }: { name: 'arrow' | 'spark' | 'cap' | 'trophy' | 'check'; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
    spark: <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z" />,
    cap: <path d="m2 9 10-5 10 5-10 5ZM6 11v6c4 3 8 3 12 0v-6M22 9v8" />,
    trophy: <path d="M8 3h8v7a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-4 1h8" />,
    check: <path d="m5 12 4 4L19 6" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function AnswerBank({ question }: { question: Question }) {
  return <ul className="answer-bank">{[...question.answers].sort((a, b) => b.points - a.points).map((answer, index) => <li key={`${answer.name}-${index}`}><span>{answer.name}<small>{rarity(answer.points)}</small></span><strong>{answer.points} pts</strong></li>)}</ul>
}

type RoundResult = { question: Question; answer?: Answer; skipped: boolean; timedOut?: boolean }
const weeks = listWeeks(customQuestions)

function readSaved(week: string): { session: Session | null; error: string } {
  try {
    return { session: loadSession(week), error: '' }
  } catch (error) {
    return { session: null, error: `Could not load this week's game: ${error instanceof Error ? error.message : String(error)} Play is blocked to protect saved results.` }
  }
}

function App() {
  const [week, setWeek] = useState(weeks[0])
  return <WeeklyGame key={week} week={week} selectWeek={setWeek} />
}

function WeeklyGame({ week, selectWeek }: { week: string; selectWeek: (week: string) => void }) {
  const [initial] = useState(() => readSaved(week))
  const [session, setSession] = useState(initial.session)
  const [storageError, setStorageError] = useState(initial.error)
  const [previewDeck] = useState(() => weeklyDeck(week, customQuestions))
  const deck = session?.deck ?? previewDeck
  const toResult = (round: Round, index: number): RoundResult => ({
    question: deck[index], answer: round.answerIndex === null ? undefined : deck[index].answers[round.answerIndex],
    skipped: round.answerIndex === null, timedOut: round.timedOut,
  })
  const results = session?.results.map(toResult) ?? []
  const currentResult = session?.currentResult ? toResult(session.currentResult, results.length) : null
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [correction, setCorrection] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const started = session !== null
  const [timeLeft, setTimeLeft] = useState(30)
  const inputRef = useRef<HTMLInputElement>(null)
  const helpRef = useRef<HTMLDialogElement>(null)
  const complete = session !== null && isComplete(session)
  const question = deck[Math.min(results.length, deck.length - 1)]
  const total = results.reduce((sum, result) => sum + (result.answer?.points ?? 0), 0)
  const maxScore = deck.length * 100
  const displayedTotal = total + (currentResult?.answer?.points ?? 0)

  useEffect(() => {
    if (showHelp && helpRef.current && !helpRef.current.open) helpRef.current.showModal()
  }, [showHelp])

  useEffect(() => {
    function synchronize(event: StorageEvent) {
      if (event.key !== storagePrefix + week) return
      const saved = readSaved(week)
      if (saved.session) setSession(saved.session)
      setStorageError(saved.error || (!saved.session ? 'Saved game data was removed in another tab. Reload to check browser storage.' : ''))
      setInput('')
      setCorrection('')
      setError('')
    }
    window.addEventListener('storage', synchronize)
    return () => window.removeEventListener('storage', synchronize)
  }, [week])

  useEffect(() => {
    if (!session || session.deadline === null) return
    const active = session
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil(((active.deadline ?? 0) - Date.now()) / 1000))
      setTimeLeft(seconds)
      if (seconds === 0) {
        window.clearInterval(timer)
        const next = finishRound(active, null)
        setSession(next)
        try {
          saveSession(next)
          setStorageError('')
        } catch (error) {
          setStorageError(`Could not save progress: ${error instanceof Error ? error.message : String(error)} Keep this page open and retry saving.`)
        }
      }
    }, 200)
    return () => window.clearInterval(timer)
  }, [session])

  function persist(next: Session): boolean {
    try {
      saveSession(next)
      setSession(next)
      setStorageError('')
      return true
    } catch (error) {
      setStorageError(`Could not save this game: ${error instanceof Error ? error.message : String(error)} Keep this page open and retry.`)
      return false
    }
  }

  function startGame() {
    if (session || storageError) return
    const saved = readSaved(week)
    if (saved.error) { setStorageError(saved.error); return }
    if (saved.session) { setSession(saved.session); return }
    if (!persist(beginSession(week, deck))) return
    setInput('')
    setError('')
    setCorrection('')
    setTimeLeft(30)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!started || currentResult || complete) return
    if (hasExpired(session)) {
      lockAnswer(null)
      return
    }
    if (!input.trim()) {
      setError('Enter an answer before locking it in.')
      return
    }
    const match = matchAnswer(question, input)
    if (match.kind === 'missing' || match.kind === 'ambiguous') {
      setCorrection('')
      setError(match.kind === 'ambiguous'
        ? 'That spelling is close to more than one answer. Be more specific or check your spelling.'
        : 'That answer is not in this question’s answer bank. Check the spelling or try another answer.')
      return
    }
    setError('')
    if (match.kind === 'correction') {
      setInput(match.answer.name)
      setCorrection(`Corrected to “${match.answer.name}”. Review it, then submit again to confirm. The clock is still running.`)
      inputRef.current?.focus()
      return
    }
    setCorrection('')
    lockAnswer(question.answers.indexOf(match.answer))
  }

  function lockAnswer(answerIndex: number | null) {
    if (!session || complete || currentResult) return
    const next = finishRound(session, answerIndex)
    setSession(next)
    persist(next)
  }

  function advance() {
    if (!session || !currentResult) return
    if (!persist(advanceSession(session))) return
    setInput('')
    setError('')
    setCorrection('')
    setTimeLeft(30)
    if (results.length + 1 < deck.length) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  return (
    <div className="site-shell">
      <header className="header">
        <a className="brand" href="./" aria-label="Niche home"><span className="brand-mark"><img src="/favicon.svg" alt="" width="42" height="42" /></span>niche<span className="brand-dot">.</span></a>
        <nav aria-label="Main navigation">
          <button onClick={() => setShowHelp(true)}>How to play <span className="help-circle">?</span></button>
        </nav>
      </header>

      <main>
        <div className="play-layout">
          <div className="week-picker"><label htmlFor="week">Weekly pack</label><select id="week" disabled={Boolean(storageError && session)} value={week} onChange={(event) => selectWeek(event.target.value)}>{weeks.map((name) => <option key={name} value={name}>{name}</option>)}</select></div>
          <section className="game-card" aria-label="Trivia game">
            <div className="game-topline"><span><span className="live-dot" /> {complete ? 'SESSION COMPLETE' : started ? 'GROVER TRIVIA' : 'READY WHEN YOU ARE'}</span><span>Grove City College Trivia</span></div>
            <div className="game-stats"><span>Round <strong>{complete ? deck.length : results.length + 1}</strong><span className="muted"> / {deck.length}</span></span><span className="score"><Icon name="trophy" size={18} /><strong>{displayedTotal.toLocaleString()}</strong> <span className="muted">pts</span></span></div>
            <div className="round-progress" aria-label={`${results.length} of ${deck.length} rounds completed`}>{deck.map((item, i) => <span key={item.id} className={i < results.length ? 'done' : started && i === results.length ? 'current' : ''} />)}</div>

            {complete ? (
              <div className="summary" aria-live="polite">
                <span className="category-chip"><Icon name="trophy" size={15} /> THAT’S A WRAP</span>
                <h2>{total >= maxScore * 0.7 ? 'A fine bit of niche knowledge.' : total >= maxScore * 0.3 ? 'Nicely done.' : 'Curiosity looks good on you.'}</h2>
                <p>You scored <strong>{total.toLocaleString()} / {maxScore}</strong> in {week}.</p>
                <ul className="summary-list">{results.map((result, i) => <li key={result.question.id}><span className="summary-number">{i + 1}</span><span>{result.answer?.name ?? (result.timedOut ? 'Time ran out' : 'Skipped')}<small>{result.question.category}</small></span><strong>+{result.answer?.points ?? 0}</strong></li>)}</ul>
                <section className="question-review" aria-labelledby="review-title">
                  <h3 id="review-title">Review all answers</h3>
                  {results.map((result, i) => <details key={result.question.id}><summary>Question {i + 1}: {result.question.prompt}</summary>{result.question.detail && <p className="question-detail">{result.question.detail}</p>}<AnswerBank question={result.question} />{result.question.source && <a className="source-link" href={result.question.source} target="_blank" rel="noreferrer">Question source ↗</a>}</details>)}
                </section>
                <p>This week is complete. Choose another pack above to play a different week.</p>
              </div>
            ) : !started ? (
              <div className="question-body">
                <span className="category-chip"><Icon name="cap" size={15} /> GROVER TRIVIA</span>
                <h1>Ready to play?</h1>
                <div className="start-panel">
                  <p>{deck.length} questions. 30 seconds each. Answers earn 10–100 points.</p>
                  <p>One game per week in this browser. Progress and results are saved; all accepted answers are revealed only at the end.</p>
                  <button className="primary-button" disabled={Boolean(storageError)} onClick={startGame}>Start the clock <Icon name="arrow" /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="question-body">
                  <div className="question-meta"><span className="category-chip"><Icon name="cap" size={15} /> {question.category}</span><span className={`timer ${timeLeft <= 10 ? 'timer-urgent' : ''}`} aria-label={`${timeLeft} seconds remaining`}>00:{String(timeLeft).padStart(2, '0')}</span></div>
                  <h1>{question.prompt}</h1>
                  <p className="question-detail">{question.detail}</p>
                  {!currentResult ? (
                    <form onSubmit={submit} noValidate>
                      <label htmlFor="answer">YOUR ANSWER</label>
                      <div className={`answer-input ${error ? 'input-error' : ''}`}><input id="answer" ref={inputRef} autoComplete="off" maxLength={120} value={input} onChange={(event) => { setInput(event.target.value); setError(''); setCorrection('') }} placeholder="Type your answer…" aria-invalid={Boolean(error)} aria-describedby={error ? 'answer-error' : correction ? 'answer-correction' : 'answer-hint'} /><span aria-hidden="true">↵</span></div>
                      {error ? <p className="form-error" id="answer-error" role="alert">{error}</p> : correction ? <p className="answer-correction" id="answer-correction" role="status">{correction}</p> : <p className="answer-hint" id="answer-hint">Aliases and small typos are corrected for you to confirm.</p>}
                      <div className="answer-actions"><button className="primary-button" type="submit">{correction ? 'Confirm answer' : 'Submit answer'} <Icon name="arrow" /></button><button className="skip-button" type="button" onClick={() => { setError(''); setCorrection(''); lockAnswer(null) }}>Give up · 0 pts</button></div>
                    </form>
                  ) : (
                    <div className="answer-result" aria-live="polite">
                      <div className={`result-banner ${currentResult.skipped ? 'skipped' : ''}`}><Icon name={currentResult.skipped ? 'arrow' : 'check'} /><div><strong>{currentResult.timedOut ? 'Time’s up. 0 points this round.' : currentResult.skipped ? 'Round skipped. 0 points.' : `${rarity(currentResult.answer?.points ?? 0)} find!`}</strong><p>{currentResult.skipped ? 'Accepted answers will be revealed at the end of the game.' : `${currentResult.answer?.name} earns you ${currentResult.answer?.points} points.`}</p></div></div>
                      <button className="primary-button" onClick={advance}>{results.length === deck.length - 1 ? 'See my results' : 'Next question'}<Icon name="arrow" /></button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

            {storageError && <div className="storage-error" role="alert"><p>{storageError}</p><button type="button" onClick={() => { if (session) persist(session); else { const saved = readSaved(week); setSession(saved.session); setStorageError(saved.error) } }}>Retry saving / loading</button></div>}
        </div>
      </main>

      {showHelp && <dialog ref={helpRef} aria-labelledby="help-title" onCancel={(event) => { event.preventDefault(); setShowHelp(false) }}><button className="close-button" aria-label="Close instructions" onClick={() => setShowHelp(false)}>×</button><span className="category-chip"><Icon name="cap" size={16} /> GROVER TRIVIA</span><h2 id="help-title">How to play</h2><p>Start the clock for up to five Grove City questions. Each question has a 30-second timer; a correct answer earns 10–100 points. Less common answers earn more.</p><p>Aliases and answers within one or two character edits of a unique closest match are replaced with the main answer. Review the correction and submit again to confirm it before time runs out. Editing the answer clears the confirmation. Equally close matches need a more specific answer.</p><p>If you run out of time or give up, that question is worth zero. Other answers are revealed only after the game. Each weekly pack can be played once in this browser; returning to it shows saved progress or final results. Reloading does not reset an active round’s clock. Switching weeks pauses between rounds, not during an active timer.</p><button className="primary-button" onClick={() => setShowHelp(false)}>Got it <Icon name="arrow" /></button></dialog>}
    </div>
  )
}

export default App
