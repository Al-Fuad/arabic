import json,pathlib,re
out=pathlib.Path('output/imported-audio')
segments=json.loads((out/'segments.json').read_text())
def norm(x):
 x=re.sub('[\u064b-\u065f\u0670\u0640]','',x)
 return re.sub('[^ء-ي]','',x).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي')
rows=[]
for s in segments:
 p=out/f'transcript-{s["batch"]:02}.json'
 if not p.exists():continue
 words=[w for seg in json.loads(p.read_text()) for w in seg['words']]
 overlap=[w for w in words if min(w['end'],s['end'])-max(w['start'],s['start'])>0 and s['start'] <= (w['start']+w['end'])/2 < s['end']]
 recognized=' '.join(w['word'].strip() for w in overlap)
 rows.append({**s,'recognized':recognized,'orderMatch':norm(recognized)==norm(s['arabic'])})
(out/'order-audit.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print('Reviewed',len(rows),'exact consonantal matches',sum(x['orderMatch'] for x in rows))
for x in rows:
 if not x['orderMatch']:print(x['batch'],x['index'],x['arabic'],'=>',x['recognized'])
