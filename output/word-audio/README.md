# Existing vocabulary audio

Approved profile: Gemini 3.8 Flash TTS, Charon, natural speed. Exact profile/prompt is recorded in queue.json. The seven user-approved natural-speed samples are reused byte-for-byte; older Kore and lighter-voice samples are excluded.

Scope: 396 distinct NFC-normalized, vowel-preserving forms from existing bookPages vocabulary on PDF viewer pages 15–102. All occurrences retain page and Bengali meaning references. This is NOT exhaustive coverage of the PDF. Only the seven sample words were checked against source images during this audio work; all other forms retain their existing course data and are explicitly marked as not independently reviewed in this batch.

Current: 7 generated, 389 remaining (388 pending, 1 failed due to HTTP 429). No new audio was produced by the full-batch attempt. Google reported 10 requests/day on the free tier and a retry delay of 10h33m23s. queue.json records the absolute cooldown; attempts before it expires make no network request. Wait for quota reset, or explicitly arrange paid API capacity yourself if desired. No billing change is made by these scripts.

Prepare/reconcile without network:

    node scripts/generate-word-audio.mjs

Generate or resume after the cooldown:

    node --env-file=.env.local scripts/generate-word-audio.mjs --generate

The generator saves progress and the playable index after every success, stops at the first error, retains failure details and attempts, and reuses existing valid WAV files. It never switches model/provider/voice. Keep this queue and the approved sample manifest with the generator. Do not run two generators concurrently. The API key is read only locally and never included in the browser bundle or output manifest.

App playback uses src/word-audio.json, containing only completed local audio paths. Missing files, unavailable generated audio, and sentences use the existing device TTS with an explicit Bengali notice. Navigation stops playback; late failures cannot restart old audio. No live generation occurs in the browser.

Quality: user approval applies to sample voice/style. Future audio is marked pending human listening; file validity is not makhraj/sifat certification. All seven reused samples were checked for PCM format/nonzero signal/no full-scale clipping earlier. A qualified Arabic listener must review future outputs and the source text as appropriate.

Nothing has been committed, pushed, or deployed as part of this work.

To use the second locally saved key:

    node --env-file=.env.local scripts/generate-word-audio.mjs --generate --key=GEMINI_API_KEY2

A newly selected key gets one quota check even if another key was blocked. A quota error stops generation and records a cooldown for the selected key. Key values are never saved in the queue. See queue.json for current counts; the initial counts above describe the first attempt.

Latest second-key run: 8 new files, 15 total generated, 381 remaining. Stopped on daily HTTP 429 after respecting the minute cooldown. Latest server retry delay: 10h27m25s. All 15 WAV files passed format/frame checks; new pronunciation is pending listening. Request starts are now spaced at least 21 seconds apart.
