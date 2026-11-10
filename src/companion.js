// A local learning companion: reactions and study prompts, with no chat service.
const tips = [
  'শব্দটি শুনে একবার নিজে বলো। তারপর অর্থ মিলিয়ে দেখো।',
  'তিনটি শব্দ শেখার পর চোখ বন্ধ করে অর্থ মনে করার চেষ্টা করো।',
  'ভুল হলে সমস্যা নেই। ব্যাখ্যাটি পড়ে আবার চেষ্টা করো।',
  'শব্দকার্ডে আগে অর্থ মনে করো, তারপর কার্ড উল্টাও।'
];
export function mountCompanion() {
  if (document.querySelector('#learning-companion')) return;
  const host = document.createElement('section');
  host.id = 'learning-companion';
  host.className = 'learning-companion';
  host.setAttribute('aria-label', 'হুদহুদ শেখার সঙ্গী');
  host.innerHTML = `<div class="companion-panel" id="companion-panel" hidden><div class="companion-heading"><strong>হুদহুদ · তোমার শেখার সঙ্গী</strong><button type="button" data-companion-close aria-label="সঙ্গীর কথা বন্ধ করুন">×</button></div><p role="status" aria-live="polite" id="companion-message">সালাম! চলো, আজ একটু একটু করে আরবি শিখি।</p><div class="companion-actions"><button type="button" data-companion-tip>একটা টিপস দাও</button><a href="#esho">পাঠে যাই →</a></div></div><button type="button" class="companion-toggle" aria-label="হুদহুদের সঙ্গে শিখুন" aria-expanded="false" aria-controls="companion-panel"><img src="/images/companion-hudhud.webp" alt="সবুজ ডানা আর বই হাতে হাসিখুশি হুদহুদ" width="88" height="88"><span>হুদহুদ</span></button>`;
  document.body.append(host);
  const panel = host.querySelector('.companion-panel');
  const toggle = host.querySelector('.companion-toggle');
  const message = host.querySelector('#companion-message');
  let tip = 0;
  function open(value) { panel.hidden = !value; toggle.setAttribute('aria-expanded', String(value)); }
  toggle.addEventListener('click', () => open(panel.hidden));
  host.querySelector('[data-companion-close]').addEventListener('click', () => { open(false); toggle.focus(); });
  host.querySelector('[data-companion-tip]').addEventListener('click', () => { message.textContent = tips[tip++ % tips.length]; });
  host.addEventListener('keydown', e => { if (e.key === 'Escape') { open(false); toggle.focus(); } });
  document.addEventListener('click', e => {
    const target = e.target.closest('button, summary');
    if (!target || host.contains(target)) return;
    let text;
    if (target.matches('[data-esho-speak], [data-speak]')) text = 'শুনে নিজে বলার চেষ্টা করো। চাইলে আবার শব্দটিতে চাপ দিয়ে শুনতে পারো।';
    else if (target.matches('.native-word summary, [data-esho-flip]')) text = 'অর্থটা কি মনে ছিল? এবার আরবি শব্দটি দেখে আবার বলো।';
    else if (target.matches('[data-esho-check], [data-check]')) {
      if (document.querySelector('.answer-celebrate, .answer.correct')) text = 'দারুণ, সঠিক হয়েছে! এবার পরেরটি চেষ্টা করি।';
      else if (document.querySelector('.quiz-feedback strong, .answer.wrong')) text = 'চলো ব্যাখ্যাটা মিলিয়ে দেখি। ভুল থেকেই নতুন কিছু শিখি।';
    } else if (target.matches('[data-esho-read]')) text = 'পড়া শেষ! এবার অনুশীলনে দেখি কতটা মনে আছে।';
    if (text) { message.textContent = text; host.classList.remove('companion-react'); void host.offsetWidth; host.classList.add('companion-react'); }
  });
}
