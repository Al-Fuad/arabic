import fs from 'node:fs';
const jobs = JSON.parse(fs.readFileSync(new URL('../output/imagegen/word-jobs.json', import.meta.url)));
const root = new URL('../public/images/words/', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('../src/word-images.json', import.meta.url)));
const pending = [];
for (const job of jobs) {
  if (fs.existsSync(new URL(job.file, root))) manifest[job.ar] ||= job.file;
  else pending.push({ar: job.ar, bn: job.bn, file: job.file});
}
fs.writeFileSync(new URL('../src/word-images.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(new URL('../output/imagegen/pending.json', import.meta.url), JSON.stringify(pending, null, 2) + '\n');
console.log(`${Object.keys(manifest).length} individual images mapped; ${pending.length} jobs pending.`);
