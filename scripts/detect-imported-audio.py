import subprocess,re,json,concurrent.futures

def check(n):
 p=f'/Users/nur/Downloads/{n}.wav'
 r=subprocess.run(['ffmpeg','-hide_banner','-i',p,'-af','silencedetect=noise=-40dB:d=0.35','-f','null','-'],capture_output=True,text=True)
 starts=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',r.stderr)]
 ends=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',r.stderr)]
 dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],text=True))
 spans=[];a=0
 for s,e in zip(starts,ends):
  if s-a>.12:spans.append([a,s])
  a=e
 if dur-a>.12:spans.append([a,dur])
 return {'batch':n,'duration':dur,'spans':spans,'count':len(spans)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:r=list(pool.map(check,range(1,26)))
json.dump(r,open('output/imported-audio/detection.json','w'),indent=2)
for x in r:print(x['batch'],x['count'],round(x['duration'],1))
