# Outlier

A responsive, single-player rarity trivia game built with React, TypeScript, and Vite.

## Run

```sh
npm install
npm run dev
```

```sh
npm run build
npm run lint
npm test
```

## Gameplay

- Five untimed rounds per game, with classic, Grove City College, and mixed packs.
- Accepted answers earn 100–1,000 points. Obscure answers earn more.
- Incorrect answers can be retried; skipping awards zero and reveals the answer bank.
- Results show each answer and score. Personal bests persist in browser local storage per pack.
- Switching packs resets the current game. Replay shuffles the questions; the classic pack always starts with the language question.

## Content and scoring

Question definitions, accepted aliases, and point values live in [src/game.ts](src/game.ts).
Matching ignores case, whitespace, punctuation, and diacritics, but intentionally does not use fuzzy matching.
These are **finite, curated answer banks**, not exhaustive validation of every possible answer. The interface explicitly reports unrecognized answers and lets players retry.

Rarity rankings are **editorial estimates**, not measured response frequencies or survey results. The GCC pack uses the official [residence halls](https://www.gcc.edu/Home/Experience-the-Grove/Campus-Life/Residence-Life/Residence-Halls), [past presidents](https://www.gcc.edu/Home/Our-Story/History/Past-Presidents), and [history](https://www.gcc.edu/Home/Our-Story/History) pages. Its president question explicitly uses completed terms through 2025. Sources are linked after each campus answer.

This version needs no server, API key, or account. It does not provide online multiplayer or a global leaderboard. Real popularity-based scoring would require a backend that collects and aggregates player responses; local personal bests are not authoritative competitive scores.

Google Fonts are optional network-loaded typography; system sans-serif fallbacks work offline.
