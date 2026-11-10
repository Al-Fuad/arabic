import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const sourceDir=process.argv[2];
if(!sourceDir)throw Error('Pass the folder containing 1.jpeg through 11.jpeg');
const plan=JSON.parse(fs.readFileSync('output/gemini-grids/grid-manifest.json'));
const map=JSON.parse(fs.readFileSync('src/word-images.json'));
// Verified against the actual supplied artwork, rather than assuming filename order.
const inputForGrid={1:1,2:2,3:3,4:4,5:5,6:6,7:8,8:7,9:11,10:9,11:10};
const held={21:'Four: hand shows five fingers despite four blocks',22:'Five: only four blocks shown',23:'Six: five fingers and four blocks',32:'School: supplied illustration depicts a mosque'};
const audit=[];
for(const grid of plan.grids.slice(0,11)){
 const n=Number(grid.id.slice(-2)),input=inputForGrid[n],source=path.join(sourceDir,`${input}.jpeg`);
 const dimensions=execFileSync('sips',['-g','pixelWidth','-g','pixelHeight',source],{encoding:'utf8'});
 const width=Number(dimensions.match(/pixelWidth: (\d+)/)[1]),height=Number(dimensions.match(/pixelHeight: (\d+)/)[1]);
 if(width!==height||width%4)throw Error(`Unexpected grid dimensions: ${source}`);
 const unit=width/4,scale=unit/256;
 for(const cell of grid.cells){
  const id=cell.wordId;
  if(held[id]){audit.push({...cell,input:`${input}.jpeg`,status:'retained-previous-verified-image',reason:held[id]});continue;}
  let top=4,bottom=4;
  // Remove generated English captions while preserving the illustration area.
  if(input===9&&[1,2,3,4,5,6,7,8,9,12,14,15].includes(cell.cell))top=45;
  if(input===11&&cell.cell>=7)bottom=36;
  const x=Math.round((cell.column-1)*unit+4*scale),y=Math.round((cell.row-1)*unit+top*scale);
  const w=Math.round(unit-8*scale),h=Math.round(unit-(top+bottom)*scale);
  const file=`gemini-word-${id}.webp`;
  execFileSync('cwebp',['-quiet','-q','88','-crop',String(x),String(y),String(w),String(h),source,'-o',`public/images/words/${file}`]);
  map[`${cell.ar}|${cell.bn}`]=file;
  if(!map[cell.ar]||!audit.some(a=>a.ar===cell.ar&&a.status==='imported'))map[cell.ar]=file;
  audit.push({...cell,input:`${input}.jpeg`,status:'imported',file,crop:{x,y,width:w,height:h}});
 }
}
// Optimize the four verified replacement images retained for inaccurate supplied cells.
for(const id of Object.keys(held)){
 const cell=plan.grids.flatMap(g=>g.cells).find(c=>c.wordId===Number(id));
 const file=`verified-word-${id}.webp`;
 if(!fs.existsSync(`public/images/words/${file}`))execFileSync('cwebp',['-quiet','-q','85','-resize','384','0',`tmp/imagegen-prior/word-${id}.png`,'-o',`public/images/words/${file}`]);
 map[cell.ar]=file;map[`${cell.ar}|${cell.bn}`]=file;
}
fs.writeFileSync('src/word-images.json',JSON.stringify(map,null,2)+'\n');
fs.writeFileSync('output/gemini-grids/import-audit.json',JSON.stringify({inputForGrid,imported:audit.filter(c=>c.status==='imported').length,cells:audit},null,2)+'\n');
console.log('Imported',audit.filter(c=>c.status==='imported').length,'cells; retained 4 verified illustrations.');
