import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { findAnswer, makeDeck, rarity } from './game'
import type { Answer, Pack, Question } from './game'
import './App.css'

function Icon({ name, size = 20 }: { name: 'arrow' | 'spark' | 'globe' | 'cap' | 'trophy' | 'check'; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    spark: <><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    cap: <><path d="m2 9 10-5 10 5-10 5Z M6 11v6c4 3 8 3 12 0v-6M22 9v8" /></>,
    trophy: <><path d="M8 3h8v7a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-4 1h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

type RoundResult = { question: Question; answer?: Answer; skipped: boolean }
type BestScores = Partial<Record<Pack, number>>

function loadBest(): { scores: BestScores; error: string } {
  try {
    const raw = localStorage.getItem('outlier-best')
    if (!raw) return { scores: {}, error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid saved scores')
    const scores: BestScores = {}
    for (const pack of ['classic', 'grover', 'mixed'] as const) {
      const value: unknown = Reflect.get(parsed, pack)
      if (value !== undefined) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 5000) throw new Error('Invalid saved score')
        scores[pack] = value
      }
    }
    return { scores, error: '' }
  } catch {
    return { scores: {}, error: 'Saved scores could not be loaded. You can still play, but your previous best may be unavailable.' }
  }
}

const packs: { id: Pack; name: string; description: string; icon: 'globe' | 'cap' | 'spark' }[] = [
  { id: 'classic', name: 'The original', description: 'A little bit of everything.', icon: 'globe' },
  { id: 'grover', name: 'The Grover edition', description: 'Big campus. Niche knowledge.', icon: 'cap' },
  { id: 'mixed', name: 'The wild card', description: 'The best of both worlds.', icon: 'spark' },
]

function App() {
  const [pack, setPack] = useState<Pack>('classic')
  const [deck, setDeck] = useState(() => makeDeck('classic'))
  const [results, setResults] = useState<RoundResult[]>([])
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [saved, setSaved] = useState(loadBest)
  const inputRef = useRef<HTMLInputElement>(null)
  const gameRef = useRef<HTMLElement>(null)
  const complete = results.length === deck.length
  const question = deck[Math.min(results.length, deck.length - 1)]
  const total = results.reduce((sum, result) => sum + (result.answer?.points ?? 0), 0)
  const displayedTotal = total + (currentResult?.answer?.points ?? 0)
  const packName = packs.find((item) => item.id === pack)?.name

  function reset(nextPack: Pack) {
    setPack(nextPack)
    setDeck(makeDeck(nextPack))
    setResults([])
    setCurrentResult(null)
    setInput('')
    setError('')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (currentResult || complete) return
    if (!input.trim()) {
      setError('Give us an answer first. Your niche knowledge is in there somewhere.')
      return
    }
    const answer = findAnswer(question, input)
    if (!answer) {
      setError('Not in this curated answer bank. Check the prompt and spelling, try another answer, or skip to reveal the list.')
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
    if (nextResults.length === deck.length) {
      const score = nextResults.reduce((sum, result) => sum + (result.answer?.points ?? 0), 0)
      if (score > (saved.scores[pack] ?? 0)) {
        const scores = { ...saved.scores, [pack]: score }
        try {
          localStorage.setItem('outlier-best', JSON.stringify(scores))
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
        <a className="brand" href="./" aria-label="Outlier home"><span className="brand-mark"><Icon name="spark" size={25} /></span>outlier<span className="brand-dot">.</span></a>
        <nav aria-label="Main navigation">
          <button className="nav-play" onClick={() => gameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Let’s play <span className="live-dot" /></button>
          <button onClick={() => setShowHelp(true)}>How to play <span className="help-circle">?</span></button>
        </nav>
      </header>

      <main>
        <section className="intro">
          <div className="eyebrow"><span className="tiny-star">✦</span> NOT YOUR AVERAGE TRIVIA GAME</div>
          <h1>Think outside<br />the <span className="common-word">common<svg viewBox="0 0 390 18" preserveAspectRatio="none" aria-hidden="true"><path d="M4 12Q160 -3 385 8M24 16Q210 4 360 13" /></svg></span>.</h1>
          <p>One question. Endless possibilities.<br />The less obvious your answer, the more you score.</p>
          <div className="intro-tag"><Icon name="spark" size={15} /> A little knowledge. A lot of originality.</div>
          <div className="orbit-art" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <span className="art-star star-one">✦</span><span className="art-star star-two">✧</span>
            <div className="floating-answer common-answer"><span>Japanese</span><span>150 pts</span></div>
            <div className="floating-answer rare-answer"><span className="rare-label">THE ROAD LESS TRAVELED</span><strong>Buginese</strong><span className="rare-points"><Icon name="spark" size={18} /> +1,000 pts</span></div>
            <span className="art-note">less obvious. more points.</span>
            <svg className="art-arrow" viewBox="0 0 100 80"><path d="M5 5Q5 60 80 50m-15-12 18 12-16 13" /></svg>
          </div>
        </section>

        <div className="play-layout">
          <section className="game-card" ref={gameRef} aria-label="Trivia game">
            <div className="game-topline"><span><span className="live-dot" /> {complete ? 'SESSION COMPLETE' : 'YOUR NEXT GREAT ANSWER'}</span><span>{pack === 'grover' ? 'GROVER EDITION' : pack === 'mixed' ? 'WILD CARD' : 'CLASSIC MIX'}</span></div>
            <div className="game-stats"><span>Round <strong>{complete ? 5 : results.length + 1}</strong><span className="muted"> / 5</span></span><span className="score"><Icon name="trophy" size={18} /><strong>{displayedTotal.toLocaleString()}</strong> <span className="muted">pts</span></span></div>
            <div className="round-progress" aria-label={`${complete ? 5 : results.length} of 5 rounds completed`}>{deck.map((item, i) => <span key={item.id} className={i < results.length ? 'done' : i === results.length ? 'current' : ''} />)}</div>

            {complete ? (
              <div className="summary" aria-live="polite">
                <span className="category-chip"><Icon name="trophy" size={15} /> THAT’S A WRAP</span>
                <h2>{total >= 3500 ? 'Certified outlier.' : total >= 1500 ? 'Nicely off the beaten path.' : 'Curiosity looks good on you.'}</h2>
                <p>You scored <strong>{total.toLocaleString()} / 5,000</strong> in {packName?.toLowerCase()}.</p>
                <ul className="summary-list">{results.map((result, i) => <li key={result.question.id}><span className="summary-number">{i + 1}</span><span>{result.answer?.name ?? 'Skipped'}<small>{result.question.category}</small></span><strong>+{result.answer?.points ?? 0}</strong></li>)}</ul>
                <button className="primary-button" onClick={() => reset(pack)}>Another round of curiosity <Icon name="arrow" /></button>
              </div>
            ) : (
              <>
                <div className="question-body">
                  <span className="category-chip"><Icon name={pack === 'grover' ? 'cap' : 'globe'} size={15} /> {question.category}</span>
                  <h2>{question.prompt}</h2>
                  <p className="question-detail">{question.detail}</p>
                  {!currentResult ? (
                    <form onSubmit={submit} noValidate>
                      <label htmlFor="answer">YOUR ANSWER</label>
                      <div className={`answer-input ${error ? 'input-error' : ''}`}><input id="answer" ref={inputRef} autoComplete="off" maxLength={120} value={input} onChange={(event) => { setInput(event.target.value); setError('') }} placeholder="Go on, surprise us…" aria-invalid={Boolean(error)} aria-describedby={error ? 'answer-error' : 'answer-hint'} /><span aria-hidden="true">↵</span></div>
                      {error ? <p className="form-error" id="answer-error" role="alert">{error}</p> : <p className="answer-hint" id="answer-hint">Think niche. Spelling matters, capitalization doesn’t.</p>}
                      <div className="answer-actions"><button className="primary-button" type="submit">Lock it in <Icon name="arrow" /></button><button className="skip-button" type="button" onClick={() => { setError(''); setCurrentResult({ question, skipped: true }) }}>Skip this question</button></div>
                    </form>
                  ) : (
                    <div className="answer-result" aria-live="polite">
                      <div className={`result-banner ${currentResult.skipped ? 'skipped' : ''}`}><Icon name={currentResult.skipped ? 'arrow' : 'check'} /><div><strong>{currentResult.skipped ? 'A little discovery, no points lost.' : `${rarity(currentResult.answer?.points ?? 0)} find!`}</strong><p>{currentResult.skipped ? 'Take a peek at what you could have answered.' : `${currentResult.answer?.name} earns you ${currentResult.answer?.points.toLocaleString()} points.`}</p></div></div>
                      <details><summary>Explore the accepted answers <span>{question.answers.length}</span></summary><ul className="answer-bank">{[...question.answers].sort((a, b) => b.points - a.points).map((answer) => <li key={answer.name}><span>{answer.name}<small>{rarity(answer.points)}</small></span><strong>{answer.points} pts</strong></li>)}</ul></details>
                      {question.source && <a className="source-link" href={question.source} target="_blank" rel="noreferrer">Verified with Grove City College ↗</a>}
                      <button className="primary-button" onClick={advance}>{results.length === 4 ? 'See my results' : 'Next question'}<Icon name="arrow" /></button>
                    </div>
                  )}
                </div>
                <div className="game-footnote"><Icon name="spark" size={16} /><span>No timer. No pressure. Just your wonderfully specific brain.</span></div>
              </>
            )}
          </section>

          <aside className="sidebar">
            <section className="pack-section">
              <div className="section-heading"><h2>Pick your playground</h2><span>01 — 03</span></div>
              <p>Find your corner of the curious.</p>
              <div className="pack-options">{packs.map((item) => <button key={item.id} className={`pack-option ${item.id === pack ? 'selected' : ''}`} aria-pressed={item.id === pack} onClick={() => { if (item.id !== pack) reset(item.id) }}><span className={`pack-icon ${item.id}`}><Icon name={item.icon} size={22} /></span><span className="pack-copy"><strong>{item.name}{item.id === 'grover' && <span className="gcc-tag">GCC</span>}</strong><small>{item.description}</small></span><span className="radio-mark">{item.id === pack && <span />}</span></button>)}</div>
              <p className="pack-note">Switching packs starts a fresh game.</p>
            </section>
            <section className="rarity-card"><div className="rarity-heading"><Icon name="spark" size={22} /><h2>Obscurity is a superpower.</h2></div><p>Everyone knows the obvious answer.<br />You’re not everyone.</p><div className="rarity-scale"><span /><span /><span /><span /></div><div className="scale-labels"><span>Common</span><span>Legendary</span></div><div className="points-range"><span>100 pts</span><strong>1,000 pts</strong></div><p className="curated-note">Rarity scores are curated estimates, not live player percentages. Answer banks are finite.</p></section>
            <div className="personal-best"><span><Icon name="trophy" size={19} /> YOUR BEST · {pack === 'grover' ? 'GROVER' : pack.toUpperCase()}</span><strong>{(saved.scores[pack] ?? 0).toLocaleString()} <small>pts</small></strong></div>
            {saved.error && <p className="storage-error" role="alert">{saved.error}</p>}
          </aside>
        </div>

        <section className="how-strip" aria-label="How it works"><div><span className="step-number">01</span><span><strong>A broad question.</strong><small>A whole world of possible answers.</small></span></div><div><span className="step-number">02</span><span><strong>A different kind of thinking.</strong><small>Skip the first thing that comes to mind.</small></span></div><div><span className="step-number">03</span><span><strong>A well-earned little flex.</strong><small>The rarer the answer, the bigger the score.</small></span></div></section>
      </main>
      <footer><span className="footer-brand">outlier.</span><span>For the wonderfully specific.</span><span>Made for curious minds <span className="footer-star">✦</span></span></footer>

      {showHelp && <dialog aria-labelledby="help-title" onCancel={(event) => { event.preventDefault(); setShowHelp(false) }} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); setShowHelp(false) } }} ref={(node) => { if (node && !node.open) node.showModal() }}><button className="close-button" aria-label="Close instructions" onClick={() => setShowHelp(false)}>×</button><span className="category-chip"><Icon name="spark" size={16} /> THE SHORT VERSION</span><h2 id="help-title">Be right. Be unexpected.</h2><p>Answer five broad questions. Each accepted answer earns 100–1,000 points based on its curated rarity: common answers earn less, obscure answers earn more.</p><p>There’s no timer or penalty for trying again. Skip a question for zero points and discover the accepted answers. Your best completed score is saved on this browser separately for each pack.</p><p>The Grover edition uses official GCC sources. All rankings are editorial estimates, not measured popularity among students. These are finite answer lists, so a valid answer may not yet be included.</p><button className="primary-button" onClick={() => setShowHelp(false)}>Got it. Let’s get niche. <Icon name="arrow" /></button></dialog>}
    </div>
  )
}

export default App
