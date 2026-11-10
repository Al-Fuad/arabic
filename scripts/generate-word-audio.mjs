// Local only. Prepare: node scripts/generate-word-audio.mjs
// Generate/resume: node --env-file=.env.local scripts/generate-word-audio.mjs --generate
import {readFile, writeFile, mkdir, rename, copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bookPages} from '../src/esho-pages.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const queuePath = `${root}output/word-audio/queue.json`;
const indexPath = `${root}src/word-audio.json`;
const approved = JSON.parse(await readFile(`${root}output/audio-comparison-charon/manifest.json`, 'utf8'));
const config = {model:approved.model, voice:approved.voice, style:`${approved.baseStyle} ${approved.speeds.natural}`};
const profile = createHash('sha256').update(JSON.stringify(config)).digest('hex').slice(0,12);
await mkdir(`${root}output/word-audio`, {recursive:true});
await mkdir(`${root}public/audio/words`, {recursive:true});
const readJson = async path => {try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}};
const previous = await readJson(queuePath);
const keyName = process.argv.find(arg=>arg.startsWith('--key='))?.slice(6) || 'GEMINI_API_KEY';
if(!/^GEMINI_API_KEY[0-9]*$/.test(keyName)) throw Error('Invalid key environment variable name.');
if(previous && previous.profile!==profile) throw Error('Voice profile changed; review before creating a new queue.');
const entries = new Map();
for(const page of Object.values(bookPages).filter(p=>p.page>=15 && p.page<=102)) {
 for(const [text,bengali] of page.words) {
  const arabic=text.normalize('NFC');
  if(!entries.has(arabic)) entries.set(arabic,{id:createHash('sha256').update(arabic).digest('hex').slice(0,20),arabic,references:[]});
  entries.get(arabic).references.push({page:page.page,bengali});
 }
}
const queue = {version:1, profile, ...config,
 scope:'Existing bookPages vocabulary on PDF viewer pages 15–102 only; not exhaustive source coverage.',
 review:'User approved Charon natural sample style. Future generated files require pronunciation review; no makhraj/sifat certification.',
 blockedUntil:previous?.blockedUntil || null,
 quotaKeyName:previous?.quotaKeyName || 'GEMINI_API_KEY',
 items:[...entries.values()].map(entry=>({...previous?.items.find(x=>x.arabic===entry.arabic),...entry}))};
function validWav(bytes){return bytes.length>44 && bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WAVE';}
const pathFor = item=>`${root}public/audio/words/${profile}-${item.id}.wav`;
for(const item of queue.items) {
 const sample=approved.samples.find(s=>s.speed==='natural' && s.arabic.normalize('NFC')===item.arabic);
 item.sourceReview=sample?`Checked against sample source image, viewer page ${sample.sourcePage}; other occurrences not re-audited.`:'Not independently image-reviewed in this audio batch; existing course form retained.';
 try {const bytes=await readFile(pathFor(item));if(!validWav(bytes))throw Error('Invalid WAV');item.status='generated';}
 catch {
  if(sample){const from=`${root}output/audio-comparison-charon/${sample.file}`;const bytes=await readFile(from);if(!validWav(bytes))throw Error('Invalid approved sample');await copyFile(from,pathFor(item));item.status='generated';item.origin='approved-sample';item.pronunciationReview='User approved sample style; not expert phonetic certification';}
  else {item.status=item.status==='failed'?'failed':'pending';}
 }
}
async function save(){
 queue.updatedAt=new Date().toISOString();
 queue.counts={total:queue.items.length,generated:queue.items.filter(x=>x.status==='generated').length,failed:queue.items.filter(x=>x.status==='failed').length};
 queue.counts.remaining=queue.counts.total-queue.counts.generated;
 await writeFile(`${queuePath}.tmp`,JSON.stringify(queue,null,2)+'\n');await rename(`${queuePath}.tmp`,queuePath);
 const index=Object.fromEntries(queue.items.filter(x=>x.status==='generated').map(x=>[x.arabic,`/audio/words/${profile}-${x.id}.wav`]));
 await writeFile(`${indexPath}.tmp`,JSON.stringify(index,null,2)+'\n');await rename(`${indexPath}.tmp`,indexPath);
}
await save();
if(process.argv.includes('--generate')) {
 if(queue.quotaKeyName===keyName && queue.blockedUntil && Date.now()<Date.parse(queue.blockedUntil)){console.log(`Quota cooldown until ${queue.blockedUntil}; no API request made.`);}
 else {
  const key=process.env[keyName];if(!key)throw Error(`Supply ${keyName} via the ignored .env.local file.`);
  let lastRequestAt=0;
  for(const item of queue.items.filter(x=>x.status!=='generated')) {
   // Free-tier pacing: at most three request starts per minute.
   const wait=Math.max(0,21000-(Date.now()-lastRequestAt));
   if(wait) await new Promise(resolve=>setTimeout(resolve,wait));
   lastRequestAt=Date.now();
   item.attempts=(item.attempts||0)+1;item.lastAttemptAt=new Date().toISOString();
   try {
    const response=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{
     method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},
     body:JSON.stringify({model:config.model,input:[{type:'user_input',content:[{type:'text',text:item.arabic,annotations:[{type:'speech_metadata',style:config.style}]}]}],response_format:{type:'audio'},generation_config:{speech_config:[{voice:config.voice}]}}),signal:AbortSignal.timeout(120000)});
    const result=await response.json();
    if(!response.ok){
     const message=String(result.error?.message||'Request failed').replaceAll(key,'[REDACTED]');
     if(response.status===429){
      queue.quotaKeyName=keyName;
      const delay=message.match(/retry in\s+(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
      const seconds=delay ? (+delay[1]||0)*3600+(+delay[2]||0)*60+(+delay[3]||0) : 86400;
      queue.blockedUntil=new Date(Date.now()+Math.max(seconds,60)*1000).toISOString();
     }
     throw Error(`HTTP ${response.status}: ${message}`);
    }
    const audio=result.steps?.filter(s=>s.type==='model_output').flatMap(s=>s.content||[]).filter(c=>c.type==='audio').at(-1);
    const bytes=Buffer.from(audio?.data||'','base64');if(!validWav(bytes))throw Error('Missing or invalid WAV audio');
    await writeFile(`${pathFor(item)}.tmp`,bytes);await rename(`${pathFor(item)}.tmp`,pathFor(item));
    item.status='generated';item.origin='batch';item.pronunciationReview='Pending human listening';item.generatedAt=new Date().toISOString();delete item.error;queue.blockedUntil=null;
    await save();console.log(`Generated ${item.id}`);
   }catch(error){item.status='failed';item.error=String(error.message).replaceAll(key,'[REDACTED]');await save();console.log(`Stopped: ${item.error}`);process.exitCode=1;break;}
  }
 }
}
console.log(JSON.stringify(queue.counts));
