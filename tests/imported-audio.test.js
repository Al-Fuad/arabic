import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {bookPages} from '../src/esho-pages.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
test('manual audio mapping preserves every canonical word and source reference in course order',()=>{
 const mapping=read('../output/ai-studio-word-batches/batch-mapping.json');
 const expected=new Map();for(const page of Object.values(bookPages))for(const [ar,bn] of page.words){const key=ar.normalize('NFC');if(!expected.has(key))expected.set(key,[]);expected.get(key).push({page:page.page,bengali:bn});}
 const words=mapping.batches.flatMap(b=>b.words);assert.deepEqual(words.map(w=>[w.arabic,w.references]),[...expected]);
 assert.equal(new Set(words.map(w=>w.id)).size,words.length);
});
test('every active imported recording is checked, exists, and retains the expected WAV format',()=>{
 const report=read('../output/imported-audio/import-report.json');const index=read('../src/word-audio.json');
 for(const row of report){if(!['imported-lexical-check','imported-user-approved'].includes(row.status)){assert.notEqual(index[row.arabic],`/audio/imported/${row.id}.wav`);continue;}
 const target=`/audio/imported/${row.id}.wav`;assert.equal(index[row.arabic],target);
 const bytes=readFileSync(new URL(`../public${target}`,import.meta.url));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WAVE');assert.ok(bytes.length>44);
 assert.ok(row.end>row.start);assert.ok(row.speechSpan[0]>=row.start&&row.speechSpan[1]<=row.end);
 }
});
