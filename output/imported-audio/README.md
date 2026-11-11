# Latest replacement

User supplied /Users/nur/Downloads/قَلَمِي.wav and explicitly requested adding it. The 1.6-second original is preserved; a local copy in replacements/ is used for re-imports. All 396 recordings are active. Earlier counts below are historical. No publication performed.

# Latest user review

User approved every recording except قَلَمِي. 395 recordings are now active; قَلَمِي is withheld and uses device TTS fallback. user-review.json persists the decisions across re-imports. The earlier 363/33 counts below describe the automated review before this user decision. No publication performed.

# Manual batch import

Input: /Users/nur/Downloads/1.wav through 25.wav, numeric order. Originals are unchanged (SHA-256 checked after processing). The authoritative export mapping contains 396 canonical forms: 24 batches of 16 and one of 12. All 396 were split into candidate WAVs, with page references and canonical IDs retained.

Activated: 363 recordings in public/audio/imported and src/word-audio.json. Uncertain: 33 candidates, listed in needs-review.md and shown first in review.html; these are not activated. Existing fallback remains for unavailable audio. No additional API calls, generation, publishing, commits or pushes were made.

Method: measured silence at -40 dB for at least 0.35 seconds produced exactly the expected counts in every batch without forcing segment counts. Cuts use the midpoint of each inter-word silence, preserving the entire detected speech region and surrounding quiet. Speech spans range from 0.40 to 1.71 seconds. Original files were converted to mono 24 kHz PCM for splitting, without pitch or speed changes.

Word order validation: unprompted local faster-whisper small Arabic recognition, followed by independent recognition of each ambiguous individual candidate. Activation requires matching normalized consonantal text (including explicit recognizer spellings of tanween and the common ذالك spelling). Ambiguous substitutions, missing recognized words, and unresolved timestamp alignment are withheld. Full-batch transcripts, individual results and per-word decisions are retained. ASR is fallible: this is lexical evidence, NOT human listening or expert makhraj/sifat/vowel-length/final-ending certification. Source text has not been newly audited against all book images.

Verification: all 396 candidates are valid nonempty WAVs; all 25 original hashes unchanged; current course order/text/references round-trip against the authoritative mapping. Playback tests cover starting a recorded word, cancelling on a new request, stale rejection protection and honest device-voice fallback. All 16 tests passed; production build passed. No real-browser listening certification is claimed.

Scripts: detect-imported-audio.py, split-imported-audio.py, review-imported-audio.py, audit-imported-order.py, recheck-imported-words.py, activate-imported-audio.py. Recognition ran in a temporary local virtual environment; the downloaded model is in /tmp, not the project. review.html is a local listening sheet with candidates and recognized text. previous-word-audio.json preserves the pre-import playback index.
