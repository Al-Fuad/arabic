# Pronunciation samples — partial comparison

Charon (Google lists this preset as male), prompted as an adult Arabic teacher. Model: gemini-3.8-flash-tts.
Voice reference: https://firebase.google.com/docs/ai-logic/generate-speech

Natural-speed combined track: comparison-natural.wav. Seven individual natural-speed WAV files are also included.
Order: رَجُلٌ (PDF viewer p.25), قَلَمٌ (p.15), كِتَابٌ (p.15), حَقِيبَةٌ (p.17), خُبْزٌ (p.55), عَيْنٌ (p.71), مِصْبَاحٌ (p.15).
Arabic vowel marks and Bengali meanings checked against the source images on these pages. No exhaustive content audit implied.

Slower samples: NONE generated. Google returned HTTP 429, citing a free-tier limit of 10 requests per day and a retry delay of 10h39m28s. Do not present the older Kore samples as the slow half of a matching male-voice comparison.

All seven new and five prior files decode as mono 24 kHz 16-bit PCM, contain nonzero signal, and have no full-scale clipped samples. The combined natural track preserves the original audio and adds one second between clips; no pitch or speed processing was applied.

No direct audio listening was available in this session. These checks cannot establish accurate makhraj/sifat, vowel identity or length, shadda, endings, or adult voice quality. A qualified Arabic speaker should listen before these become course audio. The first word has fatḥa on ر in the source; no claim is made that an earlier رَجُلٌ sample was wrong, since it was not among the previous five samples. None of these seven words contains shadda; the earlier سَبُّورَةٌ sample is the separate shadda example.

Resume after quota resets from the project folder:

    node --env-file=.env.local scripts/generate-audio-comparison.mjs
    python3 scripts/assemble-audio-comparison.py

Existing individual files are skipped. Review manifest.json and signal-review.json for prompts, references, and checks. The key stays in the ignored local environment file. Nothing has been published.
