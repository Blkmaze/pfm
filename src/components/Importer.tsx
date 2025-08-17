import { useState } from 'react'
import api from '../api'

export default function Importer(){
  const [img,setImg] = useState<File|null>(null)
  const [bills,setBills] = useState<any[]>([])
  async function send(){
    if(!img) return
    const fd = new FormData(); fd.append('file', img)
    const r = await api.post('/import/image', fd, { headers:{'Content-Type':'multipart/form-data'} })
    setBills(r.data.bills||[])
  }
  return (
    <div style={{padding:16, border:'1px solid #ddd', borderRadius:12}}>
      <h3>Import (CSV or Screenshot)</h3>
      <input type="file" accept="image/*,.csv" onChange={e=> setImg(e.target.files?.[0]||null)} />
      <button onClick={send} style={{marginLeft:8}}>Extract Bills</button>
      {bills.length>0 && <ul>{bills.map((b:any,i:number)=> <li key={i}>${b.amount} — {b.line}</li>)}</ul>}
    </div>
  )
}