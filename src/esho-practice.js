import {bookPages,normalizeArabic} from './esho-pages.js';
export function lessonWords(lesson){const seen=new Set();return lesson.pages.flatMap(p=>bookPages[p].words.map(([ar,bn])=>({ar,bn,page:p}))).filter(w=>{const key=w.ar+'|'+w.bn;if(seen.has(key))return false;seen.add(key);return true;});}
export function lessonExamples(lesson){const source=lesson.pages.flatMap(p=>bookPages[p].examples.map(([ar,bn])=>({ar,bn,page:p})));return [...source,...lesson.examples.filter(([ar])=>!source.some(e=>e.ar===ar)).map(([ar,bn])=>({ar,bn,page:lesson.start}))];}
export function practiceBank(lesson){
 const words=lessonWords(lesson),examples=lessonExamples(lesson),bank=[];
 for(const w of words){
  const distractors=words.filter(x=>x.bn!==w.bn&&normalizeArabic(x.ar)!==normalizeArabic(w.ar));
  const meanings=[...new Set(distractors.map(x=>x.bn))].slice(0,3);
  const arabic=[...new Set(distractors.map(x=>x.ar))].slice(0,3);
  if(meanings.length===3)bank.push({type:'choice',prompt:`${w.ar} — অর্থ কী?`,answer:w.bn,options:[w.bn,...meanings],page:w.page,why:`${w.ar} অর্থ ${w.bn}। শব্দকার্ডে উচ্চারণ শুনে আবার পড়ুন।`});
  if(arabic.length===3)bank.push({type:'choice',prompt:`“${w.bn}” আরবিতে কোনটি?`,answer:w.ar,options:[w.ar,...arabic],page:w.page,why:`“${w.bn}”-এর জন্য ${w.ar} ব্যবহার করুন।`});
 }
 for(const ex of examples){const tokens=ex.ar.split(/\s+/);
  bank.push({type:'write',prompt:`আরবিতে লিখুন: ${ex.bn}`,answer:ex.ar,page:ex.page,why:`এই উদাহরণের বাক্য: ${ex.ar}। হরকত না দিলেও উত্তর গ্রহণ করা হয়।`});
  if(tokens.length>1){bank.push({type:'order',prompt:`শব্দ সাজিয়ে বলুন: ${ex.bn}`,answer:ex.ar,tokens,page:ex.page,why:`আরবির প্রথম শব্দটি আগে বেছে নিন: ${ex.ar}`});
   const pos=tokens.length-1;bank.push({type:'blank',prompt:`${tokens.slice(0,pos).join(' ')} ____`,hint:ex.bn,answer:tokens[pos],page:ex.page,why:`সম্পূর্ণ বাক্য: ${ex.ar} — ${ex.bn}`});
  }
 }
 for(const [prompt,options,correct] of lesson.questions.slice(-2))bank.push({type:'choice',prompt,answer:options[correct],options,page:lesson.start,why:lesson.explanation});
 return bank;
}
export const correctResponse=(q,response)=>q.type==='choice'?response===q.answer:normalizeArabic(response)===normalizeArabic(q.answer);
export const normalizedScore=(score,total)=>total?Math.floor(score/total*4):0;
