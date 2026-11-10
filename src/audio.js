// Speak the complete, unmodified vocalized text. No audio files or network service.
let utterance=null,request=0,cleanup=()=>{};
export function stopArabic(){request++;cleanup();cleanup=()=>{};utterance=null;if('speechSynthesis' in window)window.speechSynthesis.cancel();}
export function speakArabic(text,notify=()=>{}){
 stopArabic();
 if(!text?.trim())return;
 if(!('speechSynthesis' in window)){notify('এই ব্রাউজারে Text-to-Speech নেই। সমর্থিত ব্রাউজার ব্যবহার করুন।');return;}
 const synth=window.speechSynthesis,id=request;
 const play=()=>{
  if(id!==request)return;
  const voices=synth.getVoices().filter(v=>/^ar(?:-|_)/i.test(v.lang)||v.lang==='ar');
  const voice=voices.find(v=>v.lang==='ar-SA')||voices[0];
  if(!voice){notify('আরবি TTS কণ্ঠ পাওয়া যায়নি। ডিভাইসের ভাষা/Accessibility সেটিংসে Arabic voice যোগ করে আবার চাপুন।');return;}
  // Keep a strong reference until completion; Safari may otherwise stop early.
  utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.8;utterance.pitch=1;utterance.volume=1;
  utterance.onstart=()=>{if(id===request)notify('◖)) পুরো আরবি বাক্য পড়া হচ্ছে…');};
  utterance.onend=()=>{if(id===request){notify('উচ্চারণ শেষ হয়েছে।');utterance=null;}};
  utterance.onerror=event=>{if(id===request&&!['canceled','interrupted'].includes(event.error))notify('উচ্চারণ চালানো যায়নি। আরবি লেখায় আবার চাপুন বা ডিভাইসের Arabic voice পরীক্ষা করুন।');};
  synth.resume();synth.speak(utterance);
 };
 if(synth.getVoices().some(v=>/^ar(?:-|_|$)/i.test(v.lang))){play();return;}
 notify('আরবি TTS কণ্ঠ খোঁজা হচ্ছে…');
 const ready=()=>{if(!synth.getVoices().some(v=>/^ar(?:-|_|$)/i.test(v.lang)))return;cleanup();play();};
 const timer=setTimeout(()=>{cleanup();play();},3000);
 cleanup=()=>{clearTimeout(timer);synth.removeEventListener('voiceschanged',ready);};
 synth.addEventListener('voiceschanged',ready);
}
