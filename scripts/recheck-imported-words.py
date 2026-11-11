from faster_whisper import WhisperModel
import numpy as np
import json,pathlib,subprocess,sys
out=pathlib.Path('output/imported-audio');path=out/('individual-review-late.json' if len(sys.argv)>1 else 'individual-review.json')
results=json.loads(path.read_text()) if path.exists() else {}
model=WhisperModel('small',device='cpu',compute_type='int8',download_root='/tmp/arabic-whisper-models',cpu_threads=2,local_files_only=True)
for row in json.loads((out/'order-audit.json').read_text()):
 if row['orderMatch'] or row['id'] in results:continue
 if len(sys.argv)>1 and row['batch']<int(sys.argv[1]):continue
 pcm=subprocess.check_output(['ffmpeg','-v','error','-i',row['candidate'],'-ar','16000','-ac','1','-f','f32le','-'])
 seg,_=model.transcribe(np.frombuffer(pcm,dtype=np.float32),language='ar',condition_on_previous_text=False,beam_size=5)
 text=' '.join(s.text for s in seg).strip();results[row['id']]={'text':text,'batch':row['batch'],'index':row['index']}
 path.write_text(json.dumps(results,ensure_ascii=False,indent=2))
 print(row['batch'],row['index'],row['arabic'],'=>',text,flush=True)
