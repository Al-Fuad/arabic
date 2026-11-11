// Node 20+: see scripts/COURSE-AUDIO.md. No API requests unless --generate.
import {readFile, writeFile, mkdir, rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bookPages} from '../src/esho-pages.js';
import {eshoLessons} from '../src/esho-data.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const option = name => args.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
const digest = text => createHash('sha256').update(text).digest('hex').slice(0,20);
const model = process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts';
const voice = process.env.GEMINI_TTS_VOICE || 'Charon';
const style = 'معلّم عربي فصيح بصوت طبيعي واضح وهادئ. اقرأ النص مرة واحدة فقط دون مقدمة أو ترجمة أو موسيقى. التزم بمخارج الحروف وصفاتها: الهمس والجهر والشدة والرخاوة والتفخيم والترقيق. ميّز الحروف المتقاربة ولا تستبدل حرفاً بآخر. حافظ على الفتحة والضمة والكسرة والسكون والشدة والتنوين كما كُتبت. لا تمد الحركات القصيرة ولا تبالغ في المد الطبيعي. هذه قراءة تعليمية وليست تلاوة قرآنية. أظهر الحركات الإعرابية المكتوبة في آخر الكلمات لأغراض التعليم.';
const config = {model,voice,style,wordStyle:'اقرأ الكلمة المفردة كاملة بسرعة طبيعية واضحة.',sentenceStyle:'اقرأ الجملة مترابطة بنبرة طبيعية، مع وصل الكلمات ومراعاة همزة الوصل واللام الشمسية والقمرية. لا تقطع الجملة إلى كلمات منفصلة.'};
const profile = digest(JSON.stringify(config));
const dir = `${root}output/course-audio/${profile}`;
const audioDir = `${root}public/audio/course/${profile}`;
await mkdir(dir,{recursive:true});
await mkdir(audioDir,{recursive:true});
const readJson = async path => {try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const atomic = async (path,data) => {await writeFile(`${path}.tmp`,data);await rename(`${path}.tmp`,path);};
const previous = await readJson(`${dir}/manifest.json`);
const entries = new Map();
function add(arabic,bengali,kind,source){
 arabic=arabic.normalize('NFC');
 const id=digest(`${kind}:${arabic}`);
 if(!entries.has(id))entries.set(id,{...previous?.items.find(i=>i.id===id),id,arabic,kind,references:[]});
 entries.get(id).references.push({...source,bengali});
}
for(const page of Object.values(bookPages).filter(p=>p.page>=15&&p.page<=102)){
 for(const [ar,bn] of page.words)add(ar,bn,'word',{file:'src/esho-pages.js',page:page.page});
 for(const [ar,bn] of page.examples)add(ar,bn,'sentence',{file:'src/esho-pages.js',page:page.page});
}
for(const lesson of eshoLessons){
 for(const [ar,bn] of lesson.examples)add(ar,bn,'sentence',{file:'src/esho-data.js',lesson:lesson.id,pages:lesson.pages,sourceNote:'Lesson adaptation; range reference, not an exact source-page transcription.'});
}
const manifest={version:1,profile,...config,scope:'All current bookPages words/examples on viewer pages 15–102 and eshoLessons examples. Excludes rule prose, quiz distractors and other courses. Not exhaustive PDF transcription.',sourceReview:'This batch has not been checked against source images.',items:[...entries.values()]};
const pathFor = item=>`${audioDir}/${item.id}.wav`;
function validWav(bytes){return bytes.length>44&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WAVE';}
for(const item of manifest.items){
 try{const bytes=await readFile(pathFor(item));if(!validWav(bytes))throw Error('Invalid WAV');
  if(item.audioHash!==digest(bytes)){item.review='pending';delete item.reviewer;}
  item.audioHash=digest(bytes);item.status='generated';
 }catch{item.status='pending';item.review='pending';delete item.reviewer;}
}
const save = async()=>{
 manifest.updatedAt=new Date().toISOString();
 manifest.counts={total:manifest.items.length,words:manifest.items.filter(i=>i.kind==='word').length,sentences:manifest.items.filter(i=>i.kind==='sentence').length,generated:manifest.items.filter(i=>i.status==='generated').length,approved:manifest.items.filter(i=>i.status==='generated'&&i.review==='approved').length};
 await atomic(`${dir}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
};
const approve=option('approve');
if(approve){
 const item=entries.get(approve), reviewer=option('reviewer')?.trim();
 if(!item||item.status!=='generated'||!reviewer)throw Error('Approval requires a generated ID and --reviewer=NAME after listening and source checking.');
 item.review='approved';item.reviewer=reviewer;item.reviewedAt=new Date().toISOString();
}
await save();
if(args.includes('--generate')){
 const key=process.env.GEMINI_API_KEY;
 if(!key)throw Error('Set GEMINI_API_KEY in .env.local (never commit it).');
 const limit=Number(option('limit')||manifest.items.length);
 if(!Number.isInteger(limit)||limit<1)throw Error('--limit must be a positive integer');
 const selected=option('id');
 if(selected&&!entries.has(selected))throw Error('Unknown --id');
 const items=manifest.items.filter(i=>selected?i.id===selected:i.status!=='generated').slice(0,limit);
 for(const [n,item] of items.entries()){
  if(n)await new Promise(resolve=>setTimeout(resolve,21000));
  try{
   const published=await readJson(`${root}src/word-audio.json`)||{};
   if(Object.values(published).includes(`/audio/course/${profile}/${item.id}.wav`))throw Error('Already exported: remove this entry from src/word-audio.json before regenerating, so unreviewed audio cannot replace approved audio.');
   const response=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{
    method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},signal:AbortSignal.timeout(120000),
    body:JSON.stringify({model,input:[{type:'user_input',content:[{type:'text',text:item.arabic,annotations:[{type:'speech_metadata',style:`${style} ${item.kind==='word'?config.wordStyle:config.sentenceStyle}`}]}]}],response_format:{type:'audio'},generation_config:{speech_config:[{voice}]}})
   });
   if(!response.ok)throw Error(`HTTP ${response.status}; stopped. For 429, wait for provider quota reset before resuming.`);
   const result=await response.json();
   const audio=result.output_audio||result.steps?.filter(s=>s.type==='model_output').flatMap(s=>s.content||[]).filter(c=>c.type==='audio').at(-1);
   const bytes=Buffer.from(audio?.data||'','base64');
   if(!validWav(bytes))throw Error('Missing or invalid WAV; nothing saved.');
   await atomic(pathFor(item),bytes);
   item.status='generated';item.review='pending';item.audioHash=digest(bytes);delete item.reviewer;delete item.error;
   await save();console.log(`Generated; needs review: ${item.id} ${item.arabic}`);
  }catch(error){item.error=String(error.message).replaceAll(key,'[REDACTED]');await save();console.error(item.error);process.exitCode=1;break;}
 }
}
// Explicit export updates the site's existing lookup only for human-reviewed files.
if(args.includes('--export-approved')){
 const indexPath=`${root}src/word-audio.json`;
 const index=await readJson(indexPath)||{};
 // Remove stale exports from this profile if their audio was regenerated.
 for(const [text,path] of Object.entries(index))if(path.startsWith(`/audio/course/${profile}/`))delete index[text];
 for(const item of manifest.items.filter(i=>i.status==='generated'&&i.review==='approved'))index[item.arabic]=`/audio/course/${profile}/${item.id}.wav`;
 await atomic(indexPath,JSON.stringify(index,null,2)+'\n');
}
console.log(JSON.stringify(manifest.counts));
console.log(`Review manifest: ${dir}/manifest.json`);
