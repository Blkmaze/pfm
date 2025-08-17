import React, { useState } from 'react'
import { Upload, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import BillTracker from './components/BillTracker'
import PaystubUploader from './components/PaystubUploader'
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

  // Mock calendar events
  const calendarEvents: CalendarEvent[] = [
    { date: 1, type: 'bill', description: 'Rent', amount: 1200 },
    { date: 10, type: 'bill', description: 'Internet', amount: 80 },
    { date: 16, type: 'payday', description: 'Payday', amount: 1750 },
    { date: 19, type: 'payday', description: 'Payday', amount: 2100 },
    { date: 20, type: 'bill', description: 'Electric', amount: 140 }
  ]

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
    console.log('Paystub saved:', paystubData)
  }

  const renderCalendar = () => {
    const daysInMonth = 31
    const startDay = 6 // August 2025 starts on Friday (6)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = calendarEvents.filter(event => event.date === day)
      days.push(
        <div key={day} className="calendar-day">
          <span className="day-number">{day}</span>
          {events.map((event, index) => (
            <div key={index} className={`calendar-event ${event.type}`}>
              {event.type === 'bill' ? `Bill: ${event.description} $${event.amount}` : 
               `${event.description} $${event.amount}`}
            </div>
          ))}
        </div>
      )
    }

    return days
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
            <div className="card-header">
              <h2>Upload Bank Statement</h2>
              <div className="file-types">CSV OFX QFX PDF</div>
            </div>
            <div className="upload-zone">
              <Upload className="upload-icon" />
              <p><strong>Drag & drop</strong> your statement here or <button className="browse-btn">Browse</button></p>
              <p className="upload-subtitle">We auto-detect common headers and OFX tags.</p>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                Save to database after parse
              </label>
              <input
                type="file"
                accept=".csv,.ofx,.qfx,.pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="file-input"
              />
            </div>
            
            {parsedCount > 0 && (
              <div className="upload-results">
                <button className="upload-another">+ Upload another statement</button>
                <div className="parsed-info">
                  <p>Parsed <strong>{parsedCount}</strong> transactions</p>
                  <p className="columns-info">Columns: date description amount</p>
                  <details>
                    <summary>▶ Sample rows</summary>
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
          <div className="card calendar-card">
            <div className="calendar-header">
              <h2>Calendar</h2>
              <div className="calendar-controls">
                <button className="calendar-nav"><ChevronLeft size={16} /></button>
                <span className="current-month">{currentMonth}</span>
                <button className="calendar-nav"><ChevronRight size={16} /></button>
                <button className="add-payday">+ Add Payday</button>
                <button className="discover-bills">Discover Bills</button>
              </div>
            </div>
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {renderCalendar()}
              </div>
            </div>
          </div>
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