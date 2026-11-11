"""Local, unprompted Arabic ASR evidence. Not phonetic certification."""
from faster_whisper import WhisperModel
import json,pathlib,subprocess
import numpy as np
out=pathlib.Path('output/imported-audio')
model=WhisperModel('small',device='cpu',compute_type='int8',download_root='/tmp/arabic-whisper-models',cpu_threads=4)
for n in range(1,26):
 target=out/f'transcript-{n:02}.json'
 if target.exists():continue
 pcm=subprocess.check_output(['ffmpeg','-v','error','-i',f'/Users/nur/Downloads/{n}.wav','-ar','16000','-ac','1','-f','f32le','-'])
 segments,_=model.transcribe(np.frombuffer(pcm,dtype=np.float32),language='ar',word_timestamps=True,condition_on_previous_text=False,beam_size=5)
 result=[{'start':s.start,'end':s.end,'text':s.text,'words':[{'start':w.start,'end':w.end,'word':w.word,'probability':w.probability} for w in s.words]} for s in segments]
 target.write_text(json.dumps(result,ensure_ascii=False,indent=2))
 print(n,' '.join(s['text'] for s in result),flush=True)
