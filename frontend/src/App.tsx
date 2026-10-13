import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { matchAnswer, makeDeck, questions, rarity } from './game'
import type { Answer, Pack, Question } from './game'
import { customQuestions } from './customQuestions'
import './App.css'

function Icon({ name, size = 20 }: { name: 'arrow' | 'spark' | 'cap' | 'trophy' | 'check' | 'mark'; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
    spark: <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z" />,
    cap: <path d="m2 9 10-5 10 5-10 5ZM6 11v6c4 3 8 3 12 0v-6M22 9v8" />,
    trophy: <path d="M8 3h8v7a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-4 1h8" />,
    check: <path d="m5 12 4 4L19 6" />,
    mark: <><path d="M5 18 12 5l7 13" /><path d="M8 13h8M10 18h4" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function AnswerBank({ question }: { question: Question }) {
  return <ul className="answer-bank">{[...question.answers].sort((a, b) => b.points - a.points).map((answer, index) => <li key={`${answer.name}-${index}`}><span>{answer.name}<small>{rarity(answer.points)}</small></span><strong>{answer.points} pts</strong></li>)}</ul>
}

type RoundResult = { question: Question; answer?: Answer; skipped: boolean; timedOut?: boolean }
type BestScores = Partial<Record<Pack, number>>

function loadBest(): { scores: BestScores; error: string } {
  try {
    const raw = localStorage.getItem('niche-best')
    if (!raw) return { scores: {}, error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid saved scores')
    const scores: BestScores = {}
    for (const pack of ['classic', 'grover'] as const) {
      const value: unknown = Reflect.get(parsed, pack)
      if (value !== undefined) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 500) throw new Error('Invalid saved score')
        scores[pack] = value
      }
    }
    return { scores, error: '' }
  } catch {
    return { scores: {}, error: 'Saved scores could not be loaded. You can still play, but your previous best may be unavailable.' }
  }
}

function App() {
  const pack = 'grover'
  const [deck, setDeck] = useState(() => makeDeck(pack, Math.random, questions, customQuestions))
  const [results, setResults] = useState<RoundResult[]>([])
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [correction, setCorrection] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [saved, setSaved] = useState(loadBest)
  const inputRef = useRef<HTMLInputElement>(null)
  const helpRef = useRef<HTMLDialogElement>(null)
  const complete = started && results.length === deck.length
  const question = deck[Math.min(results.length, deck.length - 1)]
  const total = results.reduce((sum, result) => sum + (result.answer?.points ?? 0), 0)
  const maxScore = deck.length * 100
  const displayedTotal = total + (currentResult?.answer?.points ?? 0)

  useEffect(() => {
    if (showHelp && helpRef.current && !helpRef.current.open) helpRef.current.showModal()
  }, [showHelp])

  useEffect(() => {
    if (!started || complete || currentResult) return
    let seconds = 30
    const timer = window.setInterval(() => {
      seconds -= 1
      setTimeLeft(seconds)
      if (seconds === 0) {
        window.clearInterval(timer)
        setCurrentResult({ question, skipped: true, timedOut: true })
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [started, complete, currentResult, question])

  function startGame() {
    if (complete) setDeck(makeDeck(pack, Math.random, questions, customQuestions))
    setResults([])
    setCurrentResult(null)
    setInput('')
    setError('')
    setCorrection('')
    setTimeLeft(30)
    setStarted(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!started || currentResult || complete) return
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
    setCurrentResult({ question, answer: match.answer, skipped: false })
  }

  function advance() {
    if (!currentResult) return
    const nextResults = [...results, currentResult]
    setResults(nextResults)
    setCurrentResult(null)
    setInput('')
    setError('')
    setCorrection('')
    setTimeLeft(30)
    if (nextResults.length === deck.length) {
      const score = nextResults.reduce((sum, result) => sum + (result.answer?.points ?? 0), 0)
      if (score > (saved.scores[pack] ?? 0)) {
        const scores = { ...saved.scores, [pack]: score }
        try {
          localStorage.setItem('niche-best', JSON.stringify(scores))
          setSaved({ scores, error: '' })
        } catch {
          setSaved({ scores, error: 'Your best score is available for this visit, but browser storage is unavailable so it could not be saved.' })
        }
      }
    } else {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  return (
    <div className="site-shell">
      <header className="header">
        <a className="brand" href="./" aria-label="Niche home"><span className="brand-mark"><Icon name="mark" size={27} /></span>niche<span className="brand-dot">.</span></a>
        <nav aria-label="Main navigation">
          <button onClick={() => setShowHelp(true)}>How to play <span className="help-circle">?</span></button>
        </nav>
      </header>

      <main>
        <div className="play-layout">
          <section className="game-card" aria-label="Trivia game">
            <div className="game-topline"><span><span className="live-dot" /> {complete ? 'SESSION COMPLETE' : started ? 'GROVER TRIVIA' : 'READY WHEN YOU ARE'}</span><span>Grove City College Trivia</span></div>
            <div className="game-stats"><span>Round <strong>{complete ? deck.length : results.length + 1}</strong><span className="muted"> / {deck.length}</span></span><span className="score"><Icon name="trophy" size={18} /><strong>{displayedTotal.toLocaleString()}</strong> <span className="muted">pts</span></span></div>
            <div className="round-progress" aria-label={`${results.length} of ${deck.length} rounds completed`}>{deck.map((item, i) => <span key={item.id} className={i < results.length ? 'done' : started && i === results.length ? 'current' : ''} />)}</div>

            {complete ? (
              <div className="summary" aria-live="polite">
                <span className="category-chip"><Icon name="trophy" size={15} /> THAT’S A WRAP</span>
                <h2>{total >= maxScore * 0.7 ? 'A fine bit of niche knowledge.' : total >= maxScore * 0.3 ? 'Nicely done.' : 'Curiosity looks good on you.'}</h2>
                <p>You scored <strong>{total.toLocaleString()} / {maxScore}</strong> in Grover trivia.</p>
                <ul className="summary-list">{results.map((result, i) => <li key={result.question.id}><span className="summary-number">{i + 1}</span><span>{result.answer?.name ?? (result.timedOut ? 'Time ran out' : 'Skipped')}<small>{result.question.category}</small></span><strong>+{result.answer?.points ?? 0}</strong></li>)}</ul>
                <section className="question-review" aria-labelledby="review-title">
                  <h3 id="review-title">Review all answers</h3>
                  {results.map((result, i) => <details key={result.question.id}><summary>Question {i + 1}: {result.question.prompt}</summary>{result.question.detail && <p className="question-detail">{result.question.detail}</p>}<AnswerBank question={result.question} /></details>)}
                </section>
                <button className="primary-button" onClick={startGame}>Play another round <Icon name="arrow" /></button>
              </div>
            ) : !started ? (
              <div className="question-body">
                <span className="category-chip"><Icon name="cap" size={15} /> GROVER TRIVIA</span>
                <h1>Ready to play?</h1>
                <div className="start-panel">
                  <p>{deck.length} questions. 30 seconds each. Answers earn 10–100 points.</p>
                  <button className="primary-button" onClick={startGame}>Start the clock <Icon name="arrow" /></button>
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
                      <div className="answer-actions"><button className="primary-button" type="submit">{correction ? 'Confirm answer' : 'Submit answer'} <Icon name="arrow" /></button><button className="skip-button" type="button" onClick={() => { setError(''); setCorrection(''); setCurrentResult({ question, skipped: true }) }}>Give up · 0 pts</button></div>
                    </form>
                  ) : (
                    <div className="answer-result" aria-live="polite">
                      <div className={`result-banner ${currentResult.skipped ? 'skipped' : ''}`}><Icon name={currentResult.skipped ? 'arrow' : 'check'} /><div><strong>{currentResult.timedOut ? 'Time’s up. 0 points this round.' : currentResult.skipped ? 'Round skipped. 0 points.' : `${rarity(currentResult.answer?.points ?? 0)} find!`}</strong><p>{currentResult.timedOut || currentResult.skipped ? 'Take a look at the accepted answers before the next question.' : `${currentResult.answer?.name} earns you ${currentResult.answer?.points} points.`}</p></div></div>
                      <details><summary>Explore the accepted answers <span>{question.answers.length}</span></summary><AnswerBank question={question} /></details>
                      {question.source && <a className="source-link" href={question.source} target="_blank" rel="noreferrer">Verified with Grove City College ↗</a>}
                      <button className="primary-button" onClick={advance}>{results.length === deck.length - 1 ? 'See my results' : 'Next question'}<Icon name="arrow" /></button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

            <div className="personal-best"><span><Icon name="trophy" size={19} /> YOUR BEST · {pack.toUpperCase()}</span><strong>{(saved.scores[pack] ?? 0).toLocaleString()} <small>pts</small></strong></div>
            {saved.error && <p className="storage-error" role="alert">{saved.error}</p>}
        </div>
      </main>

      {showHelp && <dialog ref={helpRef} aria-labelledby="help-title" onCancel={(event) => { event.preventDefault(); setShowHelp(false) }}><button className="close-button" aria-label="Close instructions" onClick={() => setShowHelp(false)}>×</button><span className="category-chip"><Icon name="cap" size={16} /> GROVER TRIVIA</span><h2 id="help-title">How to play</h2><p>Start the clock for up to five Grove City questions. Each question has a 30-second timer; a correct answer earns 10–100 points. Less common answers earn more.</p><p>Aliases and answers within one or two character edits of a unique closest match are replaced with the main answer. Review the correction and submit again to confirm it before time runs out. Editing the answer clears the confirmation. Equally close matches need a more specific answer.</p><p>If you run out of time or give up, that question is worth zero. Your Grover best score is saved in this browser.</p><button className="primary-button" onClick={() => setShowHelp(false)}>Got it <Icon name="arrow" /></button></dialog>}
    </div>
  )
}

export default App
