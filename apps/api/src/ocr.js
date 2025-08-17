import { spawn } from 'child_process';

export async function ocrImageToText(filePath){
  return new Promise((resolve, reject)=>{
    const p = spawn('tesseract',[filePath,'stdout','--psm','6']);
    let out = '', err = '';
    p.stdout.on('data', d=> out+=d.toString());
    p.stderr.on('data', d=> err+=d.toString());
    p.on('close', code=> code===0? resolve(out): reject(new Error(err||`tesseract exit ${code}`)));
  });
}

export function extractBillsFromText(text){
  const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const bills=[];
  const amtRe = /(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
  const dueRe = /(due|statement|payment|minimum|balance|amount)/i;
  for(const L of lines){
    if(dueRe.test(L) && amtRe.test(L)){
      const m = L.match(amtRe);
      const amt = Number(m[1].replace(/[$,]/g,''));
      if(!isNaN(amt)) bills.push({ line:L, amount: amt });
    }
  }
  const uniq = new Map();
  for(const b of bills){ if(!uniq.has(b.amount)) uniq.set(b.amount,b); }
  return [...uniq.values()];
}
