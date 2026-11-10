export function buildReport(lesson,answers,startedAt,endedAt=Date.now()){
 const byType={};for(const a of answers){const row=byType[a.type]||(byType[a.type]={total:0,correct:0});row.total++;if(a.correct)row.correct++;}
 const correct=answers.filter(a=>a.correct).length;
 return {lessonId:lesson.id,title:lesson.title,chapter:lesson.chapter,at:new Date(endedAt).toISOString(),total:answers.length,correct,accuracy:answers.length?Math.round(correct/answers.length*100):0,seconds:Math.max(0,Math.round((endedAt-startedAt)/1000)),byType,answers};
}
export function saveReport(report){try{const prev=JSON.parse(localStorage.getItem('esho-reports-v1')||'[]');localStorage.setItem('esho-reports-v1',JSON.stringify([report,...(Array.isArray(prev)?prev:[])].slice(0,20)));return true;}catch{return false;}}
