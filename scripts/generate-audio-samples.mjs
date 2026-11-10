// Local-only sample generator. Node 20+: node --env-file=.env.local scripts/generate-audio-samples.mjs
import { mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { vocalizeWord } from '../src/arabic.js';

const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error('GEMINI_API_KEY must be supplied locally.');
const model = process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts';
const voice = 'Kore';
const style = 'A clear native Modern Standard Arabic teacher, slightly slow natural speech for a beginner. Pronounce the word exactly once, with all written vowel marks, doubled consonants, and the final tanween fully audible even in isolation. No introduction, translation, repetition, or music.';
// Arabic and Bengali checked against local source images esho-015.jpg and esho-017.jpg.
const samples = [
  ['kitab', 'كتاب', 'বই', 15],
  ['qalam', 'قلم', 'কলম', 15],
  ['misbah', 'مصباح', 'বাতি', 15],
  ['haqibah', 'حقيبة', 'ব্যাগ', 17],
  ['sabburah', 'سبورة', 'ব্ল্যাকবোর্ড', 17],
].map(([id, base, bengali, sourcePage]) => ({id, arabic: vocalizeWord(base), bengali, sourcePage}));
const dir = fileURLToPath(new URL('../output/audio-samples/', import.meta.url));
await mkdir(dir, { recursive: true });
for (const sample of samples) {
  const path = `${dir}${sample.id}.wav`;
  try { await access(path); console.log(`Already exists: ${sample.id}`); continue; } catch {}
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {'x-goog-api-key': key, 'Content-Type': 'application/json'},
    body: JSON.stringify({model,
      input: [{type: 'user_input', content: [{type: 'text', text: sample.arabic,
        annotations: [{type: 'speech_metadata', style}]}]}],
      response_format: {type: 'audio'},
      generation_config: {speech_config: [{voice}]},
    }),
    signal: AbortSignal.timeout(120000),
  });
  const result = await response.json();
  if (!response.ok) {
    // Never log raw responses or request headers; sanitize even the error message.
    const message = String(result.error?.message || 'Request failed').replaceAll(key, '[REDACTED]');
    throw new Error(`Gemini HTTP ${response.status}: ${message}`);
  }
  const audio = result.steps?.filter(s => s.type === 'model_output').flatMap(s => s.content || []).filter(c => c.type === 'audio').at(-1);
  if (!audio?.data) throw new Error(`No audio returned for ${sample.id}`);
  const bytes = Buffer.from(audio.data, 'base64');
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Expected WAV audio.');
  await writeFile(path, bytes);
  console.log(`Generated ${sample.id}: ${bytes.length} bytes`);
}
await writeFile(`${dir}manifest.json`, JSON.stringify({model, voice, style, reviewStatus: 'Pending human pronunciation and speed review; source images checked for these five words only.', samples: samples.map(s => ({...s, file: `${s.id}.wav`}))}, null, 2) + '\n');
