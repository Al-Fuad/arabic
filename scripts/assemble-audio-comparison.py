"""Assemble review tracks without changing pitch or speaking speed; verify PCM signals."""
import array
import json
import math
from pathlib import Path
import wave

root = Path(__file__).resolve().parents[1]
directory = root / "output/audio-comparison-charon"
manifest = json.loads((directory / "manifest.json").read_text())
report = []

def read_audio(path):
    with wave.open(str(path)) as audio:
        assert (audio.getnchannels(), audio.getsampwidth(), audio.getframerate()) == (1, 2, 24000)
        frames = audio.readframes(audio.getnframes())
    samples = array.array("h", frames)
    peak = max(map(abs, samples))
    assert peak > 0, f"Silent file: {path}"
    # Coarse signal span only; this is not a phonetic or speech-recognition check.
    active = [i for i, value in enumerate(samples) if abs(value) > max(200, peak * .02)]
    report.append({"file": str(path.relative_to(root)), "durationSeconds": round(len(samples)/24000, 3),
        "signalSpanSeconds": round((active[-1]-active[0]+1)/24000, 3), "peak": peak,
        "clippedSamples": sum(abs(v) >= 32767 for v in samples),
        "rms": round(math.sqrt(sum(v*v for v in samples)/len(samples)))})
    return frames

for speed in manifest["speeds"]:
    group = [s for s in manifest["samples"] if s["speed"] == speed]
    if not all((directory / s["file"]).exists() for s in group):
        print(f"Skipped incomplete {speed} set")
        continue
    frames = []
    positions = []
    elapsed = 0
    for sample in [s for s in manifest["samples"] if s["speed"] == speed]:
        pcm = read_audio(directory / sample["file"])
        positions.append({"arabic": sample["arabic"], "sourcePage": sample["sourcePage"], "startSeconds": round(elapsed, 3)})
        frames += [pcm, bytes(24000 * 2)]  # One extra second between original clips.
        elapsed += len(pcm)/48000 + 1
    frames.pop()
    with wave.open(str(directory / f"comparison-{speed}.wav"), "wb") as audio:
        audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
        audio.writeframes(b"".join(frames))
    (directory / f"timeline-{speed}.json").write_text(json.dumps(positions, ensure_ascii=False, indent=2)+"\n")
for path in sorted((root / "output/audio-samples").glob("*.wav")):
    read_audio(path)
(directory / "signal-review.json").write_text(json.dumps({"limitations": "File and signal checks only. No direct listening or phonetic certification. Qualified human listening is required for makhraj, sifat, short vowels, shadda, vowel length and final endings.", "files": report}, ensure_ascii=False, indent=2)+"\n")
for item in report:
    print(item["file"], item["durationSeconds"], item["signalSpanSeconds"], "clipped:", item["clippedSamples"])
