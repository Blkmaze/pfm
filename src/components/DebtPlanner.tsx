import { useState } from 'react'
import api from '../api'

type Debt = { id?:string; name:string; principal:number; apr:number; min:number }

export default function DebtPlanner(){
  const [debts,setDebts]=useState<Debt[]>([])
  const [monthly,setMonthly]=useState(500)
  const [method,setMethod]=useState<'snowball'|'avalanche'>('avalanche')
  const [summary,setSummary]=useState<any>(null)

  function add(){ setDebts([...debts,{name:'Card',principal:1000,apr:24.99,min:25}]) }
  function upd(i:number, k:keyof Debt, v:any){ const d=[...debts]; (d[i] as any)[k]=v; setDebts(d) }

  async function saveAll(){
    for(const d of debts){ await api.post('/debts', d) }
    const r = await api.post('/debts/plan',{ monthlyBudget: monthly, method })
    setSummary(r.data)
  }

  return (
    <div style={{padding:16, border:'1px solid #ddd', borderRadius:12, marginTop:16}}>
      <h3>Debt Payoff Planner</h3>
      <button onClick={add}>+ Add Debt</button>
      <div>
        {debts.map((d,i)=> (
          <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8, marginTop:8}}>
            <input value={d.name} onChange={e=>upd(i,'name',e.target.value)} placeholder="Name"/>
            <input type="number" value={d.principal} onChange={e=>upd(i,'principal',Number(e.target.value))} placeholder="Principal"/>
            <input type="number" value={d.apr} onChange={e=>upd(i,'apr',Number(e.target.value))} placeholder="APR %"/>
            <input type="number" value={d.min} onChange={e=>upd(i,'min',Number(e.target.value))} placeholder="Min"/>
          </div>
        ))}
      </div>
      <div style={{marginTop:12}}>
        <label>Monthly Budget: <input type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value))}/></label>
        <select value={method} onChange={e=> setMethod(e.target.value as any)} style={{marginLeft:8}}>
          <option value="avalanche">Avalanche (highest APR first)</option>
          <option value="snowball">Snowball (smallest balance first)</option>
        </select>
        <button onClick={saveAll} style={{marginLeft:8}}>Compute Plan</button>
      </div>
      {summary && (
        <div style={{marginTop:12}}>
          <b>Months:</b> {summary.months} &nbsp; | &nbsp; <b>Total Interest:</b> {summary.interestPaid.toFixed(2)}
        </div>
      )}
    </div>
  )
}