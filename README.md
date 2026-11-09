# আরবি সাগর

A Bengali-first Arabic learning platform. Vite + native JavaScript, with no runtime dependencies. Deploy to Vercel as a static Vite project.

## Development

```sh
npm install
npm run dev
npm test
npm run build
```

## Included

Six original beginner lessons with mastery quizzes (3/4 correct to complete), 28-letter alphabet, 24-word searchable/savable vocabulary, randomized matching and quiz games, first-completion XP, learning-day history, and JSON progress backup/restore. Responsive Bengali interface with Arabic RTL examples and optional device-provided Arabic text-to-speech.

Progress is browser-local, not synchronized to an account. No artificial leaderboard or fake learner counts. Arabic TTS requires an installed Arabic voice; unavailable voices produce an explicit message. Bengali transliteration is approximate.

## Content and expansion

Curriculum data is in `src/data.js`; add original or licensed lessons there. The Madinah course is marked planned, and contains no copied book text. UI is currently Bengali only; additional locale dictionaries and professionally reviewed course content are future work. Authentication, cross-device progress, a content editor and full Madinah syllabus are not implemented in this release.

## Deployment

`vercel.json` specifies Vite build output. Domain target: `arabic.alfuad.me`. Its authoritative DNS is Cloudflare; use the exact CNAME supplied by Vercel for this project. Do not change unrelated apex, mail, or other subdomain records.

## Book adaptation and publishing workflow

The user manages Vercel through the GitHub repository `Al-Fuad/arabic`. Publish by pushing this repository only; do not deploy through the Vercel connector or CLI.

The first volume of *Esho Arbi Shikhi* is now presented as native page-linked words, rules, revealable examples, flashcards and mixed exercises. Scanned page assets have been removed from public output. See `CONTENT-AUDIT.md` for precise coverage and outstanding editorial verification; the current adaptation is not an exhaustive transcription.
