import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { findAnswer, makeDeck, questions, rarity } from './game'
import type { Answer, Pack, Question } from './game'
import { customQuestions } from './customQuestions'
import './App.css'

function Icon({ name, size = 20 }: { name: 'arrow' | 'spark' | 'globe' | 'cap' | 'trophy' | 'check' | 'mark'; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
    spark: <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z" />,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    cap: <path d="m2 9 10-5 10 5-10 5ZM6 11v6c4 3 8 3 12 0v-6M22 9v8" />,
    trophy: <path d="M8 3h8v7a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-4 1h8" />,
    check: <path d="m5 12 4 4L19 6" />,
    mark: <><path d="M5 18 12 5l7 13" /><path d="M8 13h8M10 18h4" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
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

const packs: { id: Pack; name: string; description: string; icon: 'globe' | 'cap' }[] = [
  { id: 'classic', name: 'Classic edition', description: 'Curiosity from every corner.', icon: 'globe' },
  { id: 'grover', name: 'Grover edition', description: 'A little more Grove City.', icon: 'cap' },
]

function App() {
  const [pack, setPack] = useState<Pack>('classic')
  const [deck, setDeck] = useState(() => makeDeck('classic', Math.random, questions, customQuestions))
  const [results, setResults] = useState<RoundResult[]>([])
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [saved, setSaved] = useState(loadBest)
  const inputRef = useRef<HTMLInputElement>(null)
  const gameRef = useRef<HTMLElement>(null)
  const helpRef = useRef<HTMLDialogElement>(null)
  const complete = started && results.length === deck.length
  const question = deck[Math.min(results.length, deck.length - 1)]
  const total = results.reduce((sum, result) => sum + (result.answer?.points ?? 0), 0)
  const maxScore = deck.length * 100
  const displayedTotal = total + (currentResult?.answer?.points ?? 0)
  const packName = packs.find((item) => item.id === pack)?.name

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

  function reset(nextPack: Pack) {
    setPack(nextPack)
    setDeck(makeDeck(nextPack, Math.random, questions, customQuestions))
    setResults([])
    setCurrentResult(null)
    setInput('')
    setError('')
    setTimeLeft(30)
    setStarted(false)
  }

  function startGame() {
    setDeck(makeDeck(pack, Math.random, questions, customQuestions))
    setResults([])
    setCurrentResult(null)
    setInput('')
    setError('')
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
    const answer = findAnswer(question, input)
    if (!answer) {
      setError('That answer is not in this question’s answer bank. Check the spelling or try another answer.')
      return
    }
    setError('')
    setCurrentResult({ question, answer, skipped: false })
  }

  function advance() {
    if (!currentResult) return
    const nextResults = [...results, currentResult]
    setResults(nextResults)
    setCurrentResult(null)
    setInput('')
    setError('')
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
        <a className="brand" href="./" aria-label="Niche home"><span className="brand-mark"><Icon name="mark" size={25} /></span>niche<span className="brand-dot">.</span></a>
        <nav aria-label="Main navigation">
          <button className="nav-play" onClick={() => gameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Play a round <span className="live-dot" /></button>
          <button onClick={() => setShowHelp(true)}>How to play <span className="help-circle">?</span></button>
        </nav>
      </header>

      <main>
        <section className="intro">
          <div className="eyebrow"><span className="tiny-star">✦</span> TRIVIA FOR THE CURIOUS</div>
          <h1>Find your<br /><span className="common-word">kind of answer<svg viewBox="0 0 390 18" preserveAspectRatio="none" aria-hidden="true"><path d="M4 12Q160 -3 385 8M24 16Q210 4 360 13" /></svg></span>.</h1>
          <p>Big questions. Unexpected answers.<br />Thirty seconds to show what you know.</p>
          <div className="intro-tag"><Icon name="spark" size={15} /> A fresh question. A surprising answer.</div>
        </section>

        <div className="play-layout">
          <section className="game-card" ref={gameRef} aria-label="Trivia game">
            <div className="game-topline"><span><span className="live-dot" /> {complete ? 'SESSION COMPLETE' : started ? 'YOUR NEXT GREAT ANSWER' : 'READY WHEN YOU ARE'}</span><span>{pack === 'grover' ? 'GROVER EDITION' : 'CLASSIC EDITION'}</span></div>
            <div className="game-stats"><span>Round <strong>{complete ? deck.length : results.length + 1}</strong><span className="muted"> / {deck.length}</span></span><span className="score"><Icon name="trophy" size={18} /><strong>{displayedTotal.toLocaleString()}</strong> <span className="muted">pts</span></span></div>
            <div className="round-progress" aria-label={`${results.length} of ${deck.length} rounds completed`}>{deck.map((item, i) => <span key={item.id} className={i < results.length ? 'done' : started && i === results.length ? 'current' : ''} />)}</div>

            {complete ? (
              <div className="summary" aria-live="polite">
                <span className="category-chip"><Icon name="trophy" size={15} /> THAT’S A WRAP</span>
                <h2>{total >= maxScore * 0.7 ? 'A fine bit of niche knowledge.' : total >= maxScore * 0.3 ? 'Nicely done.' : 'Curiosity looks good on you.'}</h2>
                <p>You scored <strong>{total.toLocaleString()} / {maxScore}</strong> in {packName?.toLowerCase()}.</p>
                <ul className="summary-list">{results.map((result, i) => <li key={result.question.id}><span className="summary-number">{i + 1}</span><span>{result.answer?.name ?? (result.timedOut ? 'Time ran out' : 'Skipped')}<small>{result.question.category}</small></span><strong>+{result.answer?.points ?? 0}</strong></li>)}</ul>
                <button className="primary-button" onClick={startGame}>Play another round <Icon name="arrow" /></button>
              </div>
            ) : !started ? (
              <div className="start-panel">
                <span className="category-chip"><Icon name="spark" size={15} /> {pack === 'grover' ? 'GROVE CITY TRIVIA' : 'A LITTLE BIT OF EVERYTHING'}</span>
                <h2>Ready to find your answer?</h2>
                <p>{deck.length} {deck.length === 1 ? 'question' : 'questions'}, 30 seconds each. Correct answers score 10–100 points. No correct answer before time runs out means zero points for that question.</p>
                <button className="primary-button" onClick={startGame}>Start {pack === 'grover' ? 'Grover' : 'Classic'} game <Icon name="arrow" /></button>
              </div>
            ) : (
              <>
                <div className="question-body">
                  <div className="question-meta"><span className="category-chip"><Icon name={pack === 'grover' ? 'cap' : 'globe'} size={15} /> {question.category}</span><span className={`timer ${timeLeft <= 10 ? 'timer-urgent' : ''}`} aria-label={`${timeLeft} seconds remaining`}>00:{String(timeLeft).padStart(2, '0')}</span></div>
                  <h2>{question.prompt}</h2>
                  <p className="question-detail">{question.detail}</p>
                  {!currentResult ? (
                    <form onSubmit={submit} noValidate>
                      <label htmlFor="answer">YOUR ANSWER</label>
                      <div className={`answer-input ${error ? 'input-error' : ''}`}><input id="answer" ref={inputRef} autoComplete="off" maxLength={120} value={input} onChange={(event) => { setInput(event.target.value); setError('') }} placeholder="Go on, surprise us…" aria-invalid={Boolean(error)} aria-describedby={error ? 'answer-error' : 'answer-hint'} /><span aria-hidden="true">↵</span></div>
                      {error ? <p className="form-error" id="answer-error" role="alert">{error}</p> : <p className="answer-hint" id="answer-hint">Accepted spelling and aliases are not case-sensitive.</p>}
                      <div className="answer-actions"><button className="primary-button" type="submit">Lock it in <Icon name="arrow" /></button><button className="skip-button" type="button" onClick={() => { setError(''); setCurrentResult({ question, skipped: true }) }}>Give up · 0 pts</button></div>
                    </form>
                  ) : (
                    <div className="answer-result" aria-live="polite">
                      <div className={`result-banner ${currentResult.skipped ? 'skipped' : ''}`}><Icon name={currentResult.skipped ? 'arrow' : 'check'} /><div><strong>{currentResult.timedOut ? 'Time’s up. 0 points this round.' : currentResult.skipped ? 'Round skipped. 0 points.' : `${rarity(currentResult.answer?.points ?? 0)} find!`}</strong><p>{currentResult.timedOut || currentResult.skipped ? 'Take a look at the accepted answers before the next question.' : `${currentResult.answer?.name} earns you ${currentResult.answer?.points} points.`}</p></div></div>
                      <details><summary>Explore the accepted answers <span>{question.answers.length}</span></summary><ul className="answer-bank">{[...question.answers].sort((a, b) => b.points - a.points).map((answer, index) => <li key={`${answer.name}-${index}`}><span>{answer.name}<small>{rarity(answer.points)}</small></span><strong>{answer.points} pts</strong></li>)}</ul></details>
                      {question.source && <a className="source-link" href={question.source} target="_blank" rel="noreferrer">Verified with Grove City College ↗</a>}
                      <button className="primary-button" onClick={advance}>{results.length === deck.length - 1 ? 'See my results' : 'Next question'}<Icon name="arrow" /></button>
                    </div>
                  )}
                </div>
                <div className="game-footnote"><Icon name="spark" size={16} /><span>{currentResult ? 'Ready for the next one?' : 'The clock is ticking. Trust your niche knowledge.'}</span></div>
              </>
            )}
          </section>

          <aside className="sidebar">
            <section className="pack-section">
              <div className="section-heading"><h2>Choose an edition</h2><span>01 — 02</span></div>
              <p>Pick your corner of the curious.</p>
              <div className="pack-options">{packs.map((item) => <button key={item.id} className={`pack-option ${item.id === pack ? 'selected' : ''}`} aria-pressed={item.id === pack} onClick={() => { if (item.id !== pack) reset(item.id) }}><span className={`pack-icon ${item.id}`}><Icon name={item.icon} size={22} /></span><span className="pack-copy"><strong>{item.name}{item.id === 'grover' && <span className="gcc-tag">GCC</span>}</strong><small>{item.description}</small></span><span className="radio-mark">{item.id === pack && <span />}</span></button>)}</div>
              <p className="pack-note">Changing editions starts a fresh round.</p>
            </section>
            <section className="rarity-card"><div className="rarity-heading"><Icon name="spark" size={22} /><h2>Unexpected is rewarding.</h2></div><p>{deck.length} {deck.length === 1 ? 'question' : 'questions'}. Thirty seconds each.<br />Make every answer count.</p><div className="rarity-scale"><span /><span /><span /><span /></div><div className="scale-labels"><span>10 pts</span><span>100 pts</span></div><div className="points-range"><span>Every accepted answer scores</span><strong>10–100 pts</strong></div><p className="curated-note">Uncommon answers can earn up to 100 points.</p></section>
            <div className="personal-best"><span><Icon name="trophy" size={19} /> YOUR BEST · {pack.toUpperCase()}</span><strong>{(saved.scores[pack] ?? 0).toLocaleString()} <small>pts</small></strong></div>
            {saved.error && <p className="storage-error" role="alert">{saved.error}</p>}
          </aside>
        </div>

        <section className="how-strip" aria-label="How it works"><div><span className="step-number">01</span><span><strong>Pick an edition.</strong><small>Classic curiosity or the Grover edition.</small></span></div><div><span className="step-number">02</span><span><strong>Start the clock.</strong><small>You have 30 seconds to answer each question.</small></span></div><div><span className="step-number">03</span><span><strong>Trust your instincts.</strong><small>A good answer can come from an unexpected place.</small></span></div></section>
      </main>
      <footer><span className="footer-brand">niche.</span><span>Trivia for the unexpectedly curious.</span><span>Find the answer less traveled <span className="footer-star">✦</span></span></footer>

      {showHelp && <dialog ref={helpRef} aria-labelledby="help-title" onCancel={(event) => { event.preventDefault(); setShowHelp(false) }}><button className="close-button" aria-label="Close instructions" onClick={() => setShowHelp(false)}>×</button><span className="category-chip"><Icon name="spark" size={16} /> THE SHORT VERSION</span><h2 id="help-title">Ready, set, niche.</h2><p>Choose Classic or Grover, then start a game of up to five questions. Each question has a 30-second timer; a correct answer earns its listed 10–100 points.</p><p>If you run out of time or give up without a correct answer, that question is worth zero. Your best score is saved in this browser for each edition.</p><button className="primary-button" onClick={() => setShowHelp(false)}>Got it <Icon name="arrow" /></button></dialog>}
    </div>
  )
}

export default App
