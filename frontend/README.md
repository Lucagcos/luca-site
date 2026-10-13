# Niche

A responsive, single-player trivia game built with React, TypeScript, and Vite.

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

- Up to five 30-second rounds per game, using only the Grover pack. The first question is revealed only after starting the clock.
- Accepted answers earn 10–100 points; multiple answers may share a value.
- Incorrect answers can be retried until the timer runs out. Giving up or timing out without a correct answer awards zero points.
- Aliases and typos within one or two character edits of a unique closest accepted name or alias fill the input with the canonical answer. Submit again to confirm; no points are awarded on correction, and the timer keeps running. Editing clears the confirmation. Equally close answers require a more specific input.
- Results show each submitted answer and score, with expandable lists of all canonical accepted answers and their points for every question played (no aliases). Grover personal bests persist in browser local storage, preserving existing saved scores.
- Playing again shuffles a new deck of up to five questions.

## Content and scoring

Built-in question definitions, accepted aliases, and point values live in [src/game.ts](src/game.ts). Owner-managed additions belong in [src/customQuestions.ts](src/customQuestions.ts). Use the local visual editor below instead of writing question objects manually. Multiple answers may share a point value. Source-file additions are included in the public game on the next build/deployment; players have no question or pack editor in the production app.
Any questions with `pack: 'grover'` in the custom bank **replace the entire built-in Grover bank**, regardless of their IDs. Each game randomly selects up to five of these custom questions without repeats. With fewer than five, the game is shorter; built-in questions are used only when there are zero custom Grover questions. Legacy Classic data and editor support remain for compatibility but are not playable in the public UI.
Matching ignores case, whitespace, punctuation, and diacritics. Exact canonical matches score immediately; exact aliases and unique closest fuzzy matches require review and a second submission. Fuzzy matching uses Levenshtein distance (insertions, deletions, and substitutions; a transposition counts as two edits).
These are **finite answer banks**, not exhaustive validation of every possible answer. The interface explicitly reports unrecognized answers and lets players retry.

Rarity rankings are **editorial estimates**, not measured response frequencies or survey results. The GCC pack uses the official [residence halls](https://www.gcc.edu/Home/Experience-the-Grove/Campus-Life/Residence-Life/Residence-Halls), [past presidents](https://www.gcc.edu/Home/Our-Story/History/Past-Presidents), and [history](https://www.gcc.edu/Home/Our-Story/History) pages. Its president question explicitly uses completed terms through 2025. Sources are linked after each campus answer.

This version needs no server, API key, or account. It does not provide online multiplayer or a global leaderboard. Real popularity-based scoring would require a backend that collects and aggregates player responses; local personal bests are not authoritative competitive scores.

Google Fonts are optional network-loaded typography; system sans-serif fallbacks work offline.

## Local question admin

1. Run `npm run dev` and open `/admin` on the development server (normally `http://localhost:5173/admin`).
2. Enter an ID, category, pack, prompt, detail, optional source URL, and answers with names, aliases (separated by commas or newlines), and points. Set the pack to **Grover** to replace built-in Grover questions; use IDs starting with `custom-` to prioritize custom Classic questions. IDs cannot collide with built-in or other custom questions. Ambiguous aliases and non-integer/out-of-range scores are rejected.
3. Click **Save question**. Select saved questions to edit or delete them. Saves persist only in this browser on this development origin; they do not change the game, repository, or deployed site. Existing source-file custom questions seed the editor on its first visit. Subsequent visits use the browser's saved bank.
4. Click **Export customQuestions.ts** and replace [src/customQuestions.ts](src/customQuestions.ts) with the downloaded file. The export contains the entire saved custom bank, not the built-in questions. Save or discard unfinished edits before exporting.
5. Run `npm run build`, `npm run lint`, and `npm test`, then commit/deploy through your usual workflow.

Download a **JSON backup** for safekeeping or moving between browsers. **Restore JSON backup** accepts its array and replaces the saved editor bank after confirmation. Backups are data only; TypeScript imports are not evaluated. Browser-storage and import errors are displayed explicitly. Keep backups: clearing site data removes browser saves.
Alias lists are split into separate strings when loading saved questions, importing, saving, or exporting, including older comma-separated entries. For example, `CFA, Chick-fil-a, Chick` exports as `["CFA", "Chick-fil-a", "Chick"]`. If editing TypeScript manually, keep each alias as a separate array item. Exact matching is preferred over fuzzy corrections, which always require confirmation before scoring.

The admin route and editor code are excluded from production builds. It has no authentication or backend because it is a local authoring tool, not a private online admin. Keep the development server bound to localhost.
