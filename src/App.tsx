import React, { useState } from 'react'
import { Upload, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import BillTracker from './components/BillTracker'
import PaystubUploader from './components/PaystubUploader'
import StatementUploader from './components/StatementUploader'
import Calendar from './components/Calendar'
import { ParsedTransaction } from './utils/bankStatementParser'
import './App.css'

interface Debt {
  id: string
  name: string
  balance: number
  apr: number
  minimumPayment: number
}

interface Transaction {
  date: string
  description: string
  amount: number
}

interface CalendarEvent {
  date: number
  type: 'bill' | 'payday'
  description: string
  amount: number
}

function App() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [monthlyExtra, setMonthlyExtra] = useState(200)
  const [method, setMethod] = useState<'snowball' | 'avalanche'>('snowball')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [parsedCount, setParsedCount] = useState(0)
  const [showAddDebt, setShowAddDebt] = useState(false)
  const [currentMonth, setCurrentMonth] = useState('2025-08')
  const [paystubData, setPaystubData] = useState({ date: '', netPay: '' })
  const [savedPaystub, setSavedPaystub] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'debts'>('overview')
  const [savedPaystubs, setSavedPaystubs] = useState<any[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: '1', date: 1, type: 'bill', description: 'Rent', amount: 1200 },
    { id: '2', date: 10, type: 'bill', description: 'Internet', amount: 80 },
    { id: '3', date: 16, type: 'payday', description: 'Payday', amount: 1750 },
    { id: '4', date: 19, type: 'payday', description: 'Payday', amount: 2100 },
    { id: '5', date: 20, type: 'bill', description: 'Electric', amount: 140 }
  ])

  const handleFileUpload = (file: File) => {
    // Simulate parsing
    setTimeout(() => {
      const mockTransactions = [
        { date: '2025-01-15', description: 'PG&E Electric Bill Payment', amount: -125.50 },
        { date: '2025-01-14', description: 'Netflix Subscription', amount: -15.99 },
        { date: '2025-01-13', description: 'Verizon Wireless Payment', amount: -89.99 },
        { date: '2025-01-12', description: 'State Farm Insurance', amount: -156.00 },
        { date: '2025-01-11', description: 'Rent Payment - Property Management', amount: -1200.00 },
        { date: '2025-01-10', description: 'Chase Credit Card Payment', amount: -250.00 },
        { date: '2025-01-09', description: 'Spotify Premium', amount: -9.99 },
        { date: '2025-01-08', description: 'Water Department Bill', amount: -45.75 },
        { date: '2025-01-07', description: 'AT&T Internet Service', amount: -65.00 },
        { date: '2025-01-06', description: 'Auto Loan Payment - Wells Fargo', amount: -385.50 }
      ]
      setTransactions(mockTransactions)
      setParsedCount(mockTransactions.length)
    }, 1000)
  }

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: '',
      balance: 0,
      apr: 0,
      minimumPayment: 0
    }
    setDebts([...debts, newDebt])
    setShowAddDebt(true)
  }

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(debts.map(debt => 
      debt.id === id ? { ...debt, [field]: value } : debt
    ))
  }

  const calculatePlan = () => {
    // Mock calculation
    console.log('Calculating payoff plan...')
  }

  const savePaystub = () => {
    setSavedPaystub(true)
    setTimeout(() => setSavedPaystub(false), 2000)
  }

  const handlePaystubSaved = (paystubData: any) => {
    setSavedPaystubs(prev => [...prev, { ...paystubData, id: Date.now() }])
    
    // Auto-add payday event from paystub data
    if (paystubData.payDate && paystubData.netPay) {
      const payDate = new Date(paystubData.payDate)
      const day = payDate.getDate()
      const newPaydayEvent: CalendarEvent = {
        id: `payday-${Date.now()}`,
        date: day,
        type: 'payday',
        description: paystubData.employer ? `${paystubData.employer} Payday` : 'Payday',
        amount: parseFloat(paystubData.netPay)
      }
      setCalendarEvents(prev => [...prev, newPaydayEvent])
    }
    
    console.log('Paystub saved:', paystubData)
  }

  const handleAddPayday = (date: number, amount: number, description: string) => {
    const newEvent: CalendarEvent = {
      id: `payday-${Date.now()}`,
      date,
      type: 'payday',
      description,
      amount
    }
    setCalendarEvents(prev => [...prev, newEvent])
  }

  const handleDiscoverBills = () => {
    // Simulate bill discovery from transactions
    if (transactions.length > 0) {
      const discoveredBills: CalendarEvent[] = []
      
      // Extract bills from transactions and add to calendar
      transactions.forEach((tx, index) => {
        if (tx.amount < 0 && Math.abs(tx.amount) > 20) { // Negative amounts over $20
          const txDate = new Date(tx.date)
          const day = txDate.getDate()
          
          // Avoid duplicates
          const exists = calendarEvents.some(event => 
            event.date === day && 
            event.description.toLowerCase().includes(tx.description.toLowerCase().split(' ')[0])
          )
          
          if (!exists && discoveredBills.length < 5) { // Limit to 5 new bills
            discoveredBills.push({
              id: `discovered-${Date.now()}-${index}`,
              date: day,
              type: 'bill',
              description: tx.description.split(' ').slice(0, 2).join(' '), // First 2 words
              amount: Math.abs(tx.amount)
            })
          }
        }
      })
      
      if (discoveredBills.length > 0) {
        setCalendarEvents(prev => [...prev, ...discoveredBills])
        alert(`Discovered ${discoveredBills.length} new bills from your transactions!`)
      } else {
        alert('No new bills discovered. Upload bank statements to find more bills.')
      }
    } else {
      alert('Please upload bank statements first to discover bills.')
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(event => event.id !== eventId))
  }

  const handleTransactionsParsed = (parsedTransactions: ParsedTransaction[]) => {
    // Convert parsed transactions to our transaction format
    const newTransactions = parsedTransactions.map(tx => ({
      date: tx.date,
      description: tx.description,
      amount: tx.amount
    }))
    
    // Replace existing transactions with parsed data
    setTransactions(newTransactions)
    setParsedCount(newTransactions.length)
    
    // Auto-discover bills from parsed transactions
    setTimeout(() => {
      handleDiscoverBills()
    }, 500)
  }

  const handleDataReplaced = () => {
    // Clear existing data before replacement
    setTransactions([])
    setParsedCount(0)
    
    // Show user feedback
    console.log('Existing transaction data cleared for replacement')
  }
  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Personal Finance Manager</h1>
          <p>Uploads, parsing, calendar, and a no-nonsense debt attack plan.</p>
          
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
              onClick={() => setActiveTab('bills')}
            >
              Bill Tracker
            </button>
            <button 
              className={`tab-btn ${activeTab === 'debts' ? 'active' : ''}`}
              onClick={() => setActiveTab('debts')}
            >
              Debt Planner
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="main-grid">
          {/* Upload Bank Statement */}
          <div className="card upload-card">
            <StatementUploader 
              onTransactionsParsed={handleTransactionsParsed}
              onDataReplaced={handleDataReplaced}
            />
            
            {parsedCount > 0 && (
              <div className="upload-results">
                <div className="parsed-info">
                  <p>✅ Successfully parsed <strong>{parsedCount}</strong> transactions</p>
                  <p className="columns-info">Data integrated into Bill Tracker and Calendar</p>
                  <details>
                    <summary>▶ Sample transactions</summary>
                    <div className="sample-rows">
                      {transactions.slice(0, 3).map((tx, i) => (
                        <div key={i} className="sample-row">
                          {tx.date} | {tx.description} | ${Math.abs(tx.amount)}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            )}
          </div>

          {/* Add Paystub Screenshot */}
          <div className="card">
            <PaystubUploader onPaystubSaved={handlePaystubSaved} />
          </div>

          {/* Debt Payoff Planner */}
          <div className="card debt-card">
            <div className="card-header">
              <h2>Debt Payoff Planner</h2>
              <div className="method-badge">Snowball Avalanche</div>
            </div>
            
            <div className="debt-controls">
              <div className="control-group">
                <label>Method</label>
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value as 'snowball' | 'avalanche')}
                  className="method-select"
                >
                  <option value="snowball">Snowball (smallest balance first)</option>
                  <option value="avalanche">Avalanche (highest APR first)</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>Monthly Extra ($)</label>
                <input 
                  type="number" 
                  value={monthlyExtra}
                  onChange={(e) => setMonthlyExtra(Number(e.target.value))}
                  className="extra-input"
                />
                <button className="calculate-btn" onClick={calculatePlan}>Calculate Plan</button>
              </div>
            </div>

            <div className="debt-section">
              <p>Enter your debts:</p>
              <div className="debt-headers">
                <span>Name</span>
                <span>Balance</span>
                <span>APR %</span>
                <span>Min/mo</span>
              </div>
              
              {debts.map((debt) => (
                <div key={debt.id} className="debt-row">
                  <input 
                    type="text"
                    placeholder="Debt name"
                    value={debt.name}
                    onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                  />
                  <input 
                    type="number"
                    placeholder="0"
                    value={debt.balance || ''}
                    onChange={(e) => updateDebt(debt.id, 'balance', Number(e.target.value))}
                  />
                  <input 
                    type="number"
                    placeholder="0"
                    value={debt.apr || ''}
                    onChange={(e) => updateDebt(debt.id, 'apr', Number(e.target.value))}
                  />
                  <input 
                    type="number"
                    placeholder="0"
                    value={debt.minimumPayment || ''}
                    onChange={(e) => updateDebt(debt.id, 'minimumPayment', Number(e.target.value))}
                  />
                </div>
              ))}
              
              <button className="add-debt-btn" onClick={addDebt}>
                + Add Debt
              </button>
            </div>
          </div>

          {/* Calendar */}
          <Calendar 
            events={calendarEvents}
            onAddPayday={handleAddPayday}
            onDeleteEvent={handleDeleteEvent}
            onDiscoverBills={handleDiscoverBills}
            transactions={transactions}
          />
        </div>
        )}

        {activeTab === 'bills' && (
          <div className="bills-section">
            <BillTracker transactions={transactions} />
          </div>
        )}

        {activeTab === 'debts' && (
          <div className="debt-section-full">
            <div className="card debt-card">
              <div className="card-header">
                <h2>Debt Payoff Planner</h2>
                <div className="method-badge">Snowball Avalanche</div>
              </div>
              
              <div className="debt-controls">
                <div className="control-group">
                  <label>Method</label>
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value as 'snowball' | 'avalanche')}
                    className="method-select"
                  >
                    <option value="snowball">Snowball (smallest balance first)</option>
                    <option value="avalanche">Avalanche (highest APR first)</option>
                  </select>
                </div>
                
                <div className="control-group">
                  <label>Monthly Extra ($)</label>
                  <input 
                    type="number" 
                    value={monthlyExtra}
                    onChange={(e) => setMonthlyExtra(Number(e.target.value))}
                    className="extra-input"
                  />
                  <button className="calculate-btn" onClick={calculatePlan}>Calculate Plan</button>
                </div>
              </div>

              <div className="debt-section">
                <p>Enter your debts:</p>
                <div className="debt-headers">
                  <span>Name</span>
                  <span>Balance</span>
                  <span>APR %</span>
                  <span>Min/mo</span>
                </div>
                
                {debts.map((debt) => (
                  <div key={debt.id} className="debt-row">
                    <input 
                      type="text"
                      placeholder="Debt name"
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                    />
                    <input 
                      type="number"
                      placeholder="0"
                      value={debt.balance || ''}
                      onChange={(e) => updateDebt(debt.id, 'balance', Number(e.target.value))}
                    />
                    <input 
                      type="number"
                      placeholder="0"
                      value={debt.apr || ''}
                      onChange={(e) => updateDebt(debt.id, 'apr', Number(e.target.value))}
                    />
                    <input 
                      type="number"
                      placeholder="0"
                      value={debt.minimumPayment || ''}
                      onChange={(e) => updateDebt(debt.id, 'minimumPayment', Number(e.target.value))}
                    />
                  </div>
                ))}
                
                <button className="add-debt-btn" onClick={addDebt}>
                  + Add Debt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App