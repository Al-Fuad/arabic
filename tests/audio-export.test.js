import test from 'node:test';import assert from 'node:assert/strict';
import {wordListCsv} from '../src/word-export.js';
import {speakArabic,stopArabic} from '../src/audio.js';
test('CSV preserves tashkeel, Bengali and quoted commas, with spreadsheet BOM',()=>{const csv=wordListCsv([{ar:'كِتَابٌ',bn:'বই, "একটি"'}]);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('كِتَابٌ'));assert.ok(csv.includes('"বই, ""একটি"""'));});
test('TTS passes the complete sentence with final irab unchanged and cancels on navigation',()=>{
 const spoken=[];let cancellations=0;global.window={speechSynthesis:{cancel(){cancellations++},resume(){},getVoices:()=>[{lang:'ar-SA',name:'Arabic'}],speak:u=>spoken.push(u)}};global.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 speakArabic('هَذَا كِتَابٌ.');assert.equal(spoken[0].text,'هَذَا كِتَابٌ.');assert.equal(spoken[0].lang,'ar-SA');assert.equal(spoken[0].volume,1);stopArabic();assert.equal(cancellations,2);delete global.window;delete global.SpeechSynthesisUtterance;
});
