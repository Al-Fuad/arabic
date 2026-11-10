export function wordListCsv(list){
 const cell=value=>'"'+String(value??'').replace(/^[=+@-]/,'\t$&').replaceAll('"','""')+'"';
 return '\uFEFF'+[['আরবি (তাশকিলসহ)','বাংলা অর্থ'],...list.map(w=>[w.ar,w.bn])].map(row=>row.map(cell).join(',')).join('\r\n');
}
export function downloadWords(list){
 const url=URL.createObjectURL(new Blob([wordListCsv(list)],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='arabi-sagor-words.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
