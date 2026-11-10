// Public third-party Madinah grammar companion; not an official Reader edition.
export const MADINAH_API='https://madinah.arabic.aramb.dev/api';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bn=n=>Number(n).toLocaleString('bn-BD');
const lessonLabel=l=>l.id.replace(/^lesson/,'').split('_').map(bn).join('–');
let booksCache;
export function validateBooks(payload){return payload?.success===true&&Array.isArray(payload.data)&&payload.data.every(b=>typeof b.id==='string'&&Array.isArray(b.lessons)&&b.lessons.every(l=>typeof l.id==='string'&&Array.isArray(l.rules)));}
export function madinahCard(){return `<article class="course-card"><div class="cover medina"><span>বইভিত্তিক ব্যাকরণ সহায়িকা</span><div class="arch">المدينة</div><b>মদিনা আরবি</b><small>নিয়ম পড়ি, অর্থ বুঝি</small></div><div class="course-info"><span class="pill">মদিনা বইয়ের সহায়ক পাঠ</span><h3>মদিনা আরবি সিরিজ</h3><p>বই ও পাঠ অনুযায়ী আরবি নিয়ম এবং উৎসের ব্যাখ্যা।</p><a class="button" href="#madinah">বই খুলুন →</a></div></article>`;}
export async function mountMadinah(root,{toast,speech}){
 const route=location.hash;let completed=[];try{completed=JSON.parse(localStorage.getItem('madinah-read-v1')||'[]');if(!Array.isArray(completed))completed=[];}catch{}
 root.innerHTML='<h1>মদিনা আরবি</h1><p role="status">পাঠগুলো আনা হচ্ছে…</p>';
 try{
  if(!booksCache){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const response=await fetch(MADINAH_API+'/books',{signal:controller.signal});if(!response.ok)throw Error('API unavailable');const data=await response.json();if(!validateBooks(data))throw Error('Invalid lessons');booksCache=data.data;}finally{clearTimeout(timer);}}
  if(location.hash!==route||!root.isConnected)return;
  const parts=route.split('/'),book=booksCache.find(b=>b.id===parts[1]),lesson=book?.lessons.find(l=>l.id===parts[2]);
  const speak=ar=>`<button class="arabic-speak" lang="ar" dir="rtl" data-madinah-speak="${esc(ar)}">${esc(ar)}</button>`;
  const source='<p class="note">উৎস: <a href="https://madinah.arabic.aramb.dev/" target="_blank" rel="noopener">Madinah Books grammar companion</a>। এটি তৃতীয় পক্ষের সহায়ক পাঠ, মুদ্রিত Madina Arabic Reader-এর পূর্ণ প্রতিলিপি নয়। ব্যাখ্যা উৎসের ইংরেজিতে দেওয়া; বাংলা অনুবাদ এখনও যুক্ত হয়নি। আরবি লেখায় চাপ দিয়ে শুনুন।</p>';
  const lessonKey=book&&lesson?book.id+'/'+lesson.id:'';
  function draw(){
   root.innerHTML=`<div class="eyebrow">বইয়ের তাক / মদিনা আরবি</div><h1>${lesson?'পাঠ '+lessonLabel(lesson):book?'মদিনা আরবি · বই '+bn(booksCache.indexOf(book)+1):'মদিনা আরবি সিরিজ'}</h1>${source}`+(lesson?`<a class="text-button" href="#madinah/${esc(book.id)}">← বইয়ের সূচিপত্র</a><p class="intro">${esc(lesson.introduction?.english)}</p><div class="native-examples">${lesson.rules.map((r,i)=>`<article class="rule-panel"><span class="pill">নিয়ম ${bn(i+1)}</span><h2 dir="auto">${esc(r.name)}</h2>${speak(r.arabicText)}<details><summary>ব্যাখ্যা মিলিয়ে দেখি · English</summary><p lang="en">${esc(r.explanation)}</p></details></article>`).join('')}</div><button class="button" data-madinah-complete>${completed.includes(lessonKey)?'✓ এই পাঠ পড়া হয়েছে':'পাঠ পড়া শেষ ✓'}</button>${book.lessons[book.lessons.indexOf(lesson)+1]?` <a class="button secondary" href="#madinah/${esc(book.id)}/${esc(book.lessons[book.lessons.indexOf(lesson)+1].id)}">পরের পাঠ →</a>`:''}`:book?`<a class="text-button" href="#madinah">← সব বই</a><div class="esho-lesson-grid">${book.lessons.map((l,i)=>`<a class="esho-lesson" href="#madinah/${esc(book.id)}/${esc(l.id)}"><span class="pill">${completed.includes(book.id+'/'+l.id)?'✓ পড়া হয়েছে':'পাঠ '+lessonLabel(l)}</span><h2 lang="ar" dir="rtl">${esc(l.title?.ar)}</h2><p>${bn(l.rules.length)}টি নিয়ম</p><span>পাঠ খুলুন →</span></a>`).join('')}</div>`:`<div class="esho-lesson-grid">${booksCache.map((b,i)=>`<article class="esho-lesson"><span class="pill">${bn(b.lessons.length)}টি পাঠ</span><h2>মদিনা আরবি · বই ${bn(i+1)}</h2><p>${esc(b.description?.english)}</p>${b.available?`<a class="button" href="#madinah/${esc(b.id)}">বই খুলুন →</a>`:'<p>উৎসে বইটি এখনও প্রস্তুত নয়।</p>'}</article>`).join('')}</div>`);
  }
  root.onclick=e=>{const button=e.target.closest('button');if(!button)return;if(button.dataset.madinahSpeak)speech(button.dataset.madinahSpeak);if(button.hasAttribute('data-madinah-complete')&&lessonKey){completed=[...new Set([...completed,lessonKey])];try{localStorage.setItem('madinah-read-v1',JSON.stringify(completed));toast('পাঠের অগ্রগতি সংরক্ষিত হয়েছে।');}catch{toast('এই ব্রাউজারে অগ্রগতি রাখা যাচ্ছে না।');}draw();}};
  draw();
 }catch{
  if(location.hash!==route||!root.isConnected)return;
  root.innerHTML='<h1>মদিনা আরবি</h1><p role="alert">এই মুহূর্তে উৎস থেকে পাঠ আনা যাচ্ছে না। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</p><button class="button" data-madinah-retry>আবার চেষ্টা করুন</button>';
  root.onclick=e=>{if(e.target.closest('[data-madinah-retry]'))mountMadinah(root,{toast,speech});};
 }
}
