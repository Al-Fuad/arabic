"""Export the existing canonical vocabulary queue for manual AI Studio recording. No API calls."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/ai-studio-word-batches'
OUT.mkdir(parents=True, exist_ok=True)
queue = json.loads((ROOT / 'output/word-audio/queue.json').read_text())
items = queue['items']
assert len({w['arabic'] for w in items}) == len(items)
direction = 'صوت رجل بالغ (Charon)، بسرعة طبيعية واضحة. اقرأ الكلمات بالترتيب، كل كلمة مرة واحدة، مع صمت نحو ثانية بين الكلمات. التزم بمخارج الحروف وصفاتها والحركات والسكون والشدة ومقادير المد والتنوين، وأظهر الإعراب في آخر كل كلمة للتعليم. لا تقرأ أرقام الدفعات ولا تضف ترجمة أو شرحًا أو مقدمة أو موسيقى.'
mapping = {'scope': queue['scope'], 'review': queue['review'], 'voice': 'Charon', 'speed': 'natural', 'batchSize': 16, 'totalWords': len(items), 'direction': direction, 'batches': []}
markdown = ['# Google AI Studio — শব্দের ব্যাচ', '', f'মোট {len(items)}টি বর্তমান শব্দ; প্রতি ব্যাচে সর্বোচ্চ ১৬টি। আগে তৈরি শব্দও অন্তর্ভুক্ত।', '', 'এটি বর্তমান কোর্সের তালিকা; বইয়ের পূর্ণাঙ্গ যাচাইকৃত প্রতিলিপি নয়। নতুন অডিও শুনে উচ্চারণ ও ক্রম যাচাই করতে হবে।', '', '## কণ্ঠের নির্দেশনা', '', 'Charon নির্বাচন করুন। নিচের নির্দেশনা style/instructions অংশে দিন; শব্দের সঙ্গে পাঠযোগ্য লেখা হিসেবে মেশাবেন না।', '', direction, '', 'প্রতিটি অডিও batch-01.wav, batch-02.wav ইত্যাদি নামে রাখুন। এক সেকেন্ড বিরতি অনুরোধ করা হয়েছে; প্রকৃত বিরতি ও শব্দের সংখ্যা শুনে মিলিয়ে নিন।', '']
files=[]
for start in range(0,len(items),16):
    number=start//16+1
    group=items[start:start+16]
    filename=f'batch-{number:02d}.txt'
    text='\n'.join(w['arabic'] for w in group)+'\n'
    (OUT/filename).write_text(text,encoding='utf-8')
    assert (OUT/filename).read_text().splitlines()==[w['arabic'] for w in group]
    files.append(filename)
    mapping['batches'].append({'batch':number,'file':filename,'suggestedAudioFile':f'batch-{number:02d}.wav','count':len(group),'sha256':hashlib.sha256(text.encode()).hexdigest(),'words':[{'index':i+1,'globalIndex':start+i+1,'id':w['id'],'arabic':w['arabic'],'references':w['references'],'sourceReview':w.get('sourceReview','Not independently reviewed in this export')} for i,w in enumerate(group)]})
    markdown += [f'## ব্যাচ {number:02d} — {len(group)}টি শব্দ', '', '```text',text.rstrip(),'```','']
flat=[w for b in mapping['batches'] for w in b['words']]
assert [w['arabic'] for w in flat]==[w['arabic'] for w in items]
assert [w['id'] for w in flat]==[w['id'] for w in items]
(OUT/'all-batches.md').write_text('\n'.join(markdown),encoding='utf-8')
(OUT/'batch-mapping.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'voice-direction.txt').write_text(direction+'\n',encoding='utf-8')
with zipfile.ZipFile(OUT/'all-batches.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in files+['all-batches.md','batch-mapping.json','voice-direction.txt']: z.write(OUT/name,name)
print(f'{len(items)} words; {len(files)} batches; last batch {len(mapping["batches"][-1]["words"])} words; round-trip passed.')
