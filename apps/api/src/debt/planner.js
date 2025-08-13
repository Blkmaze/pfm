\
export function planPayoff({ debts, monthlyBudget, method='avalanche' }){
  const copy = debts.map(d=> ({...d, balance: d.principal }));
  const order = ()=> copy
    .filter(d=> d.balance>0.009)
    .sort((a,b)=> method==='snowball' ? a.balance-b.balance : b.apr-a.apr);

  const schedule=[]; let month=0;
  while(copy.some(d=> d.balance>0.009) && month<600){
    month++;
    const row={ month, payments:[], totals:{interest:0, principal:0} };
    let avail = monthlyBudget;

    // accrue + pay minimums
    for(const d of copy){
      if(d.balance<=0.009) continue;
      const interest = d.balance * (d.apr/100/12);
      d.balance += interest;
      row.totals.interest += interest;
      const payMin = Math.min(d.balance, d.min||0);
      if(payMin>0 && avail>0){
        const applied = Math.min(payMin, avail);
        d.balance -= applied;
        avail -= applied;
        row.payments.push({ id:d.id, name:d.name, min: applied, extra:0 });
        row.totals.principal += Math.max(0, applied - interest);
      }
    }

    // target debt by strategy
    for(const d of order()){
      if(avail<=0 || d.balance<=0.009) continue;
      const extra = Math.min(d.balance, avail);
      d.balance -= extra; avail -= extra;
      const p = row.payments.find(p=>p.id===d.id);
      if(p) p.extra += extra; else row.payments.push({ id:d.id, name:d.name, min:0, extra });
      row.totals.principal += extra;
      if(avail<=0) break;
    }

    schedule.push(row);
  }
  const months = schedule.length;
  const interestPaid = schedule.reduce((s,r)=> s+r.totals.interest,0);
  return { months, interestPaid, schedule };
}
