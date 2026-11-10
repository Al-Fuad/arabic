// Local-only sample generator. Node 20+: node --env-file=.env.local scripts/generate-light-voice-sample.mjs
import { mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { vocalizeWord } from '../src/arabic.js';

const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error('GEMINI_API_KEY must be supplied locally.');
const model = process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts';
const voice = 'Charon';
const baseStyle = 'صوت رجل بالغ خفيف وناعم، بطبقة أعلى قليلاً من المعتاد، دون جهارة أو رنين جهير ثقيل، ودون همس. معلّم عربي فصيح. انطق الكلمة المكتوبة مرة واحدة فقط، دون مقدمة أو ترجمة أو تكرار أو موسيقى. التزم بمخارج الحروف وصفاتها، والحركات القصيرة، والسكون، والشدة، ومقادير المد الطبيعي دون مبالغة. أظهر الحركة والتنوين في آخر الكلمة لأغراض التعليم ولا تسكن آخرها. في رَجُلٌ افتح الراء فتحة قصيرة واضحة مع التفخيم الطبيعي دون ضم الشفتين، واضمم الجيم ضمة قصيرة، وانطق اللام مع تنوين الضم. حافظ على الفتحة والضمة والكسرة كما كُتبت، ولا تغيّر نوع الحركة عند إبطاء الكلام.';
const speeds = {
  natural: 'اقرأ بسرعة طبيعية واضحة وهادئة، كما يقرأ معلّم كلمة عربية مفردة.',
  slow: 'اقرأ بسرعة تعليمية أبطأ قليلاً من السرعة الطبيعية، نحو خمسة وسبعين بالمئة منها، دون تقطيع الكلمة أو إطالة الحركات القصيرة إلى حروف مد.',
};
// Source images visually checked: viewer pages 15, 17, 25, 55, 71.
const words = [
  ['rajul', 'رجل', 'পুরুষ', 25],
  ['qalam', 'قلم', 'কলম', 15],
  ['kitab', 'كتاب', 'বই', 15],
  ['haqibah', 'حقيبة', 'ব্যাগ', 17],
  ['khubz', 'خبز', 'রুটি', 55],
  ['ayn', 'عين', 'চোখ', 71],
  ['misbah', 'مصباح', 'বাতি', 15],
].map(([id, base, bengali, sourcePage]) => ({id, arabic: vocalizeWord(base), bengali, sourcePage}));
const samples = [{...words[0], id: 'rajul-light', speed: 'natural', style: `${baseStyle} ${speeds.natural}`}];
const dir = fileURLToPath(new URL('../output/audio-light-voice/', import.meta.url));
await mkdir(dir, { recursive: true });
await writeFile(`${dir}manifest.json`, JSON.stringify({model, voice, baseStyle, speeds, voiceSource: 'https://firebase.google.com/docs/ai-logic/generate-speech', reviewStatus: 'Pending qualified human listening. Source page 25 checked for this word. Lighter adult male delivery requested; perceived voice quality awaits listening.', samples: samples.map(s => ({...s, file: `${s.id}.wav`}))}, null, 2) + '\n');

if (process.argv.includes("--prepare-only")) process.exit(0);
for (const sample of samples) {
  const path = `${dir}${sample.id}.wav`;
  try { await access(path); console.log(`Already exists: ${sample.id}`); continue; } catch {}
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {'x-goog-api-key': key, 'Content-Type': 'application/json'},
    body: JSON.stringify({model,
      input: [{type: 'user_input', content: [{type: 'text', text: sample.arabic,
        annotations: [{type: 'speech_metadata', style: sample.style}]}]}],
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
