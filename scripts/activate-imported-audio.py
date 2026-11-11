"""Activate only clips with independent unprompted lexical ASR support; retain uncertain candidates."""
import json,pathlib,re,shutil,html
root=pathlib.Path(__file__).resolve().parents[1];out=root/'output/imported-audio'
def norm(x):
 x=re.sub('[\u064b-\u065f\u0670\u0640]','',x)
 return re.sub('[^ء-ي]','',x).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي')
def supports(text,arabic):
 a,b=norm(text),norm(arabic)
 if b=='ذلك' and a=='ذالك':return True # common ASR orthographic spelling of the same word
 return a==b or a in [b+'ون',b+'ن'] or (b.endswith('ة') and a in [b[:-1]+'تون',b[:-1]+'تن',b[:-1]+'اتون'])
audit=json.loads((out/'order-audit.json').read_text());individual=json.loads((out/'individual-review.json').read_text())
late=out/'individual-review-late.json'
if late.exists():individual.update(json.loads(late.read_text()))
indexpath=root/'src/word-audio.json';backup=out/'previous-word-audio.json'
if not backup.exists():shutil.copyfile(indexpath,backup)
index=json.loads(backup.read_text());dest=root/'public/audio/imported';dest.mkdir(parents=True,exist_ok=True)
reviewPath=out/'user-review.json'
reviewData=json.loads(reviewPath.read_text()) if reviewPath.exists() else {}
reviews=reviewData.get('decisions',{})
for row in audit:
 replacement=reviewData.get('replacements',{}).get(row['id'])
 if replacement:
  row['originalBatchCandidate']=row['candidate']
  row['candidate']=replacement['file'];row['source']=replacement['source'];row['sourceSha256']=replacement['sha256']
  row['start']=0;row['end']=replacement['duration'];row['speechSpan']=[0,replacement['duration']]
  row['replacementReview']='User supplied and explicitly requested this replacement; earlier ASR evidence refers to the original batch clip.'
 second=individual.get(row['id'],{}).get('text','')
 row['individualRecognized']=second
 ok=supports(row['recognized'],row['arabic']) or supports(second,row['arabic'])
 decision=reviews.get(row['id'])
 if decision=='approved':ok=True
 if decision=='rejected':ok=False;index.pop(row['arabic'],None)
 row['status']=('imported-user-approved' if decision=='approved' else 'imported-lexical-check') if ok else ('user-rejected' if decision=='rejected' else 'needs-human-word-check')
 row['userReview']=decision
 row['pronunciationReview']='Not expert makhraj/sifat or vowel certification. Source word retained without new source-image audit.'
 if ok:
  shutil.copyfile(row['candidate'],dest/(row['id']+'.wav'))
  index[row['arabic']]=f'/audio/imported/{row["id"]}.wav'
indexpath.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
(out/'import-report.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
rows=['<!doctype html><meta charset="utf-8"><title>Audio import review</title><style>body{font:18px system-ui;max-width:1000px;margin:40px auto}article{padding:20px;border-bottom:1px solid #ddd}.ar{font-size:32px}audio{width:360px}</style><h1>Audio review</h1><p>Uncertain candidates are not activated. ASR matches do not certify pronunciation.</p>']
for r in sorted(audit,key=lambda r:(r['status'].startswith('imported-'),r['batch'],r['index'])):
 rows.append(f'<article><div>Batch {r["batch"]}, word {r["index"]} — {r["status"]}</div><div class="ar" dir="rtl">{html.escape(r["arabic"])}</div><audio controls src="{html.escape(str(pathlib.Path(r["candidate"]).relative_to(out)))}"></audio><p>Recognition: {html.escape(r["recognized"])} / {html.escape(r["individualRecognized"])}</p></article>')
(out/'review.html').write_text('\n'.join(rows))
print('Imported:',sum(r['status'].startswith('imported-') for r in audit),'uncertain:',sum(not r['status'].startswith('imported-') for r in audit),'index total:',len(index))
