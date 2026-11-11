import test from 'node:test';import assert from 'node:assert/strict';
import {wordListCsv} from '../src/word-export.js';
import {speakArabic,stopArabic} from '../src/audio.js';
test('CSV preserves tashkeel, Bengali and quoted commas, with spreadsheet BOM',()=>{const csv=wordListCsv([{ar:'كِتَابٌ',bn:'বই, "একটি"'}]);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('كِتَابٌ'));assert.ok(csv.includes('"বই, ""একটি"""'));});
test('TTS passes the complete sentence with final irab unchanged and cancels on navigation',()=>{
 const spoken=[];let cancellations=0;global.window={speechSynthesis:{cancel(){cancellations++},resume(){},getVoices:()=>[{lang:'ar-SA',name:'Arabic'}],speak:u=>spoken.push(u)}};global.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 speakArabic('هَذَا كِتَابٌ.');assert.equal(spoken[0].text,'هَذَا كِتَابٌ.');assert.equal(spoken[0].lang,'ar-SA');assert.equal(spoken[0].volume,1);stopArabic();assert.equal(cancellations,2);delete global.window;delete global.SpeechSynthesisUtterance;
});

test('recorded word plays without device voice and cancels before fallback can race',async()=>{
 const players=[];const spoken=[];let rejectFirst;
 global.window={speechSynthesis:{cancel(){},resume(){},getVoices:()=>[{lang:'ar-SA'}],speak:u=>spoken.push(u)}};
 global.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 global.Audio=class{constructor(src){this.src=src;players.push(this)}play(){return new Promise((_,reject)=>{rejectFirst=reject})}pause(){this.paused=true}};
 try{
  speakArabic('كِتَابٌ');assert.equal(players.length,1);assert.match(players[0].src,/^\/audio\/(?:words|imported)\//);assert.equal(spoken.length,0);
  speakArabic('هَذَا كِتَابٌ.');assert.equal(players[0].paused,true);assert.equal(spoken.length,1);
  rejectFirst(Error('old playback rejected'));await Promise.resolve();assert.equal(spoken.length,1);
 }finally{stopArabic();delete global.Audio;delete global.window;delete global.SpeechSynthesisUtterance;}
});
test('failed recording falls back to complete text and identifies the device voice',async()=>{
 const spoken=[],notices=[];
 global.window={speechSynthesis:{cancel(){},resume(){},getVoices:()=>[{lang:'ar-SA'}],speak:u=>{spoken.push(u);u.onstart()}}};
 global.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 global.Audio=class{play(){return Promise.reject(Error('missing recording'))}pause(){}};
 try{speakArabic('قَلَمٌ',s=>notices.push(s));await Promise.resolve();assert.equal(spoken[0].text,'قَلَمٌ');assert.ok(notices.some(s=>s.includes('ডিভাইসের')));}
 finally{stopArabic();delete global.Audio;delete global.window;delete global.SpeechSynthesisUtterance;}
});
