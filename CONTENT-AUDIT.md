# Esho Arbi Shikhi content audit

Source: user-supplied Esho-Arbi-Shikhi.pdf, PDF viewer pages 15–102 inclusive. Author: Abu Taher Misbah. Scans remain in ignored local `tmp/pdfs` for editorial reference only; no scanned book pages ship with the application.

## Implemented

- All 88 source-page identifiers mapped to native content records in `src/esho-pages.js`.
- 576 page-linked vocabulary entries, 395 distinct Arabic written forms (repeated meanings/forms retained where useful).
- Native Arabic examples with revealable Bengali meanings; no OCR text is automatically published.
- 20 rule explanations with construction examples and common mistakes.
- 1,566 generated exercise items across word meaning, reverse translation, cloze, sentence ordering and written response. This count includes alternate practice formats; it is not 1,508 independently authored source questions.
- Page-only practice cannot grant whole-lesson mastery. Whole-lesson sessions require 75% accuracy. Old normalized 0–4 best scores remain compatible.

## Remaining source audit — not complete

These are selected manually checked teaching items, not an exhaustive transcription of every token, inflection, proper name, footnote, example or exercise in all 88 pages. Every page currently has `audit: selected-material-checked`. Complete word-by-word and example-by-example reconciliation is still required before claiming that no source material was missed. OCR is especially unreliable for the mixed Arabic/Bengali tables; intermediate OCR is not a source of truth.

Rules are currently organized by the original 20 lessons. The rule panel repeats within a lesson; 11 source pages also have specific rule commentary; not every page has independently authored rule commentary. Introductory and blank pages are represented as learning transitions.

Written answers normalize optional vowel marks and basic punctuation, but require the demonstrated wording. Alternative correct paraphrases are not semantically graded; the UI states this limitation.

## Chapter presentation and speech update — 2026-11-10
- Existing imported examples, including source repetitions, are retained in chapter/lesson views. This does not change the earlier incomplete full-source audit.
- Vocabulary now uses an explicit vocalized lexicon. Harakat presence checks do not establish scholarly accuracy of every case ending.
- Arabic text controls invoke device Text-to-Speech with the full original string, including tashkeel. No MP3 files are shipped. Arabic voice availability and acoustic realization of final i‘rab depend on the browser/device; exact pronunciation has not been certified.
- `public/images/vocabulary-3d.webp`: AI-generated 4×4 atlas of 16 learning objects (book, pen, chair, house, door, lamp, wall, bed, mosque, backpack, ruler, clock, lock, key, umbrella, glasses), created using imagegen. Only matching vocabulary receives an illustration; other nouns are not assigned unrelated images.
- Madinah integration removed at the user’s request on 2026-11-10. Its navigation, book cards, reader and API requests are no longer included.
- Word-list CSV exports the active vocabulary/search/saved filter with UTF-8 BOM and quoted fields.
