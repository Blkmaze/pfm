import Importer from './components/Importer'
import DebtPlanner from './components/DebtPlanner'

export default function App(){
  return (
    <div style={{padding:24, maxWidth:980, margin:'0 auto', fontFamily:'system-ui, -apple-system'}}>
      <h1>Personal Finance Manager</h1>
      <p>Import statements/screenshots, add APRs, and get a payoff plan.</p>
      <Importer/>
      <div style={{height:16}}/>
      <DebtPlanner/>
    </div>
  )
}