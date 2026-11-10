import fs from 'node:fs';
import {words} from '../src/data.js';
const dir = new URL('../output/gemini-grids/', import.meta.url);
const notes = {
  'প্রভু':'Use a symbolic scene of creation and light; never depict God as a person or creature.',
  'নবী':'Use a closed book and a path of light as a respectful symbolic illustration; no prophet figure.',
  'রাসুল':'Use a symbolic message scroll and path of light; do not depict any prophet.',
  'নির্বোধ':'Use a neutral confused expression during a puzzle; avoid insulting caricatures.',
  'কুৎসিত':'Show a misshapen cracked clay pot, never a person judged by appearance.',
  'মুশরিক':'Use an abstract symbolic composition, no depiction or stereotyping of a community.',
  'গরিব':'A simple nearly empty coin purse; do not caricature a person.',
  'ধনী':'A full coin purse; do not stereotype a person.'
};
const instructions = `Create ONE square educational illustration sprite sheet containing EXACTLY 16 equal-sized cells in a precise 4-column × 4-row grid. Use the attached vocabulary image as a STYLE REFERENCE ONLY; the subjects must follow the list below.

OUTPUT AND LAYOUT:
- Square image, preferably 2048 × 2048 pixels. Exactly 4 columns and 4 rows; all cells equal size. If 2048 is supported, each cell is exactly 512 × 512 pixels.
- Read positions LEFT TO RIGHT, then TOP TO BOTTOM (not Arabic reading order). Cell 01 is top-left; cell 04 top-right; cell 16 bottom-right.
- Invisible straight grid boundaries. NO gutters, dividers, frames, rounded card borders, captions, numbers, text, letters, watermarks, or decorative elements between cells.
- Every cell has the same plain warm ivory background (#FBF6ED). Keep each subject centered within the middle 75% of its own cell with a generous safety margin, fully visible and easy to crop. Nothing may overlap another cell.

STYLE:
Soft, rounded, high-quality handcrafted 3D clay illustrations; sage green, warm cream, ochre and natural wood tones; subtle material texture, soft studio lighting and gentle contact shadows. Match the attached reference consistently. Each object or minimal teaching scene must remain readable as a small vocabulary thumbnail.

MEANING:
Arabic and Bengali below identify the intended meaning; DO NOT print them in the image. Illustrate objects directly. For actions, show a minimal clear action scene. For adjectives, spatial relations, demonstratives and pronouns, show a simple contextual scene or comparison that communicates the intended meaning; use pointing gestures and relative distance when useful. Gender in Arabic is grammatical: do not assume every feminine noun needs a female person. For possession show the object with its owner. Abstract grammar and religious concepts should use respectful visual metaphors. Never depict God or prophets. Do not use insulting caricatures or stereotypes. These are memory aids and must not introduce unrelated objects.

CELL CONTENTS (strict row-major order):`;
const manifest = {version:1,totalWords:words.length,columns:4,rows:4,readingOrder:'left-to-right, top-to-bottom',suggestedPixels:2048,grids:[]};
let all = '# Gemini: সব শব্দের ৪×৪ ছবির গ্রিড\n\n';
all += `মোট ${words.length}টি শব্দের এন্ট্রি → ${Math.ceil(words.length/16)}টি গ্রিড। প্রতিটি প্রম্পট আলাদাভাবে Gemini-তে দিন। আগের vocabulary-3d.webp ছবিটি স্টাইল রেফারেন্স হিসেবে সংযুক্ত করুন।\n\n`;
all += 'প্রতি গ্রিডে বাম থেকে ডানে, ওপর থেকে নিচে ১৬টি ঘর। ছবির মধ্যে কোনো লেখা বা নম্বর থাকবে না। শেষ গ্রিডে ৭টি শব্দ ও ৯টি খালি ঘর। ছবি ফেরত দেওয়ার সময় grid-01.png, grid-02.png… নামে দিন; মূল রেজল্যুশনের PNG পাঠান।\n\n';
for(let start=0;start<words.length;start+=16){
 const number=String(start/16+1).padStart(2,'0');
 const slice=words.slice(start,start+16);
 const cells=Array.from({length:16},(_,i)=>{
  const w=slice[i];
  return {cell:i+1,row:Math.floor(i/4)+1,column:i%4+1,...(w?{wordId:w.id,ar:w.ar,bn:w.bn,sourcePages:w.sourcePages||[]}:{blank:true})};
 });
 const content=cells.map(c=>{
  const pos=`Cell ${String(c.cell).padStart(2,'0')} (row ${c.row}, column ${c.column})`;
  return c.blank?`${pos}: EMPTY — plain ivory background only, absolutely no object.`:`${pos}: ${c.ar} — ${c.bn}.${notes[c.bn]?' '+notes[c.bn]:''}`;
 }).join('\n');
 const prompt=`${instructions}\n${content}\n\nFinal check: one square sheet, exactly 4 × 4 cells, all ${slice.length} specified subjects in the exact assigned positions${slice.length<16?`, plus ${16-slice.length} empty cells`:''}. No text anywhere. Do not rearrange, combine, omit, duplicate or substitute subjects.\n`;
 fs.writeFileSync(new URL(`grid-${number}-prompt.txt`,dir),prompt);
 manifest.grids.push({id:`grid-${number}`,expectedFilename:`grid-${number}.png`,promptFile:`grid-${number}-prompt.txt`,cells});
 all+=`## গ্রিড ${number}\n\nফাইলের নাম: grid-${number}.png\n\n\`\`\`text\n${prompt}\`\`\`\n\n`;
}
fs.writeFileSync(new URL('ALL-GRID-PROMPTS.md',dir),all);
fs.writeFileSync(new URL('grid-manifest.json',dir),JSON.stringify(manifest,null,2)+'\n');
fs.copyFileSync(new URL('../public/images/vocabulary-3d.webp',import.meta.url),new URL('style-reference.webp',dir));
fs.writeFileSync(new URL('README-বাংলা.txt',dir),`১. style-reference.webp ছবিটি Gemini-তে দিন।\n২. grid-01-prompt.txt-এর পুরো লেখা কপি করে দিন।\n৩. তৈরি ছবিটি মূল রেজল্যুশনে grid-01.png নামে রাখুন।\n৪. একইভাবে grid-02 থেকে grid-26 পর্যন্ত করুন। প্রতিবার স্টাইল রেফারেন্স সংযুক্ত রাখুন।\n৫. প্রতি ছবিতে ঠিক চার সারি ও চার কলাম আছে কি না দেখুন। ঘরগুলোর ক্রম বদলানো যাবে না।\n৬. সব ছবি একসঙ্গে অথবা কয়েকটি করে এই চ্যাটে দিন। আমি আলাদা করে শব্দের সঙ্গে বসাব।\n\nমোট ৪০৭টি শব্দের এন্ট্রি। শেষ গ্রিডে ৭টি ছবি, ৯টি খালি ঘর। একই অর্থের আলাদা আরবি রূপও তালিকায় রাখা হয়েছে।\nপ্রম্পটের নম্বরগুলো কেবল অবস্থান নির্দেশ করে; ছবিতে নম্বর বা লেখা থাকবে না।\nবিমূর্ত শব্দের ছবি অর্থ মনে রাখার সহায়ক, পূর্ণ ব্যাকরণগত অর্থের বিকল্প নয়।\n`);
console.log(`Prepared ${manifest.grids.length} grids with ${manifest.grids.flatMap(g=>g.cells).filter(c=>!c.blank).length} mapped words.`);
