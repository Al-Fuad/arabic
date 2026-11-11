"""Make candidates from measured silence; do not activate unverified mappings."""
import json,pathlib,subprocess,hashlib,wave
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'output/imported-audio';dest=out/'candidates';dest.mkdir(exist_ok=True)
m=json.loads((root/'output/ai-studio-word-batches/batch-mapping.json').read_text())
d=json.loads((out/'detection.json').read_text());report=[]
for b,det in zip(m['batches'],d):
 n=b['batch'];assert n==det['batch']
 source=pathlib.Path(f'/Users/nur/Downloads/{n}.wav')
 if len(det['spans'])!=len(b['words']):raise ValueError(f'Count mismatch in batch {n}')
 pcm=out/f'pcm-{n:02}.wav'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-ar','24000','-ac','1','-c:a','pcm_s16le',str(pcm)],check=True)
 with wave.open(str(pcm)) as w:frames=w.readframes(w.getnframes());rate=w.getframerate()
 spans=det['spans'];cuts=[0]+[(spans[i-1][1]+spans[i][0])/2 for i in range(1,len(spans))]+[len(frames)/2/rate]
 for i,word in enumerate(b['words']):
  # Midpoints of measured inter-word silences leave full consonant/tanween tails intact.
  a,z=cuts[i],cuts[i+1];path=dest/(word['id']+'.wav')
  with wave.open(str(path),'wb') as w:w.setparams((1,2,rate,0,'NONE','not compressed'));w.writeframes(frames[round(a*rate)*2:round(z*rate)*2])
  report.append({**word,'batch':n,'source':str(source),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'start':a,'end':z,'speechSpan':spans[i],'candidate':str(path),'status':'awaiting-order-review'})
 pcm.unlink()
(out/'segments.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('Candidates:',len(report))
