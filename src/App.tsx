import React, { useState } from 'react'
import { Upload, Calculator, TrendingDown, DollarSign, Clock, Target } from 'lucide-react'
import './App.css'

interface Debt {
  id: string
  name: string
  balance: number
  apr: number
  minimumPayment: number
}

interface PayoffResult {
  totalMonths: number
  totalInterest: number
  monthlyPayment: number
  payoffOrder: Array<{
    name: string
    months: number
    totalPaid: number
  }>
}

function App() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500)
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche')
  const [payoffResult, setPayoffResult] = useState<PayoffResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: `Credit Card ${debts.length + 1}`,
      balance: 1000,
      apr: 18.99,
      minimumPayment: 25
    }
    setDebts([...debts, newDebt])
  }

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(debts.map(debt => 
      debt.id === id ? { ...debt, [field]: value } : debt
    ))
  }

  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id))
  }

  const calculatePayoff = () => {
    if (debts.length === 0) return

    const totalMinimum = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const extraPayment = Math.max(0, monthlyBudget - totalMinimum)

    // Sort debts based on strategy
    const sortedDebts = [...debts].sort((a, b) => {
      if (strategy === 'avalanche') {
        return b.apr - a.apr // Highest APR first
      } else {
        return a.balance - b.balance // Smallest balance first
      }
    })

    let totalInterest = 0
    let totalMonths = 0
    const payoffOrder: PayoffResult['payoffOrder'] = []

    // Simulate payoff (simplified calculation)
    sortedDebts.forEach((debt, index) => {
      const monthlyRate = debt.apr / 100 / 12
      const payment = debt.minimumPayment + (index === 0 ? extraPayment : 0)
      
      if (payment <= debt.balance * monthlyRate) {
        // Payment too low, would never pay off
        return
      }

      const months = Math.ceil(
        -Math.log(1 - (debt.balance * monthlyRate) / payment) / Math.log(1 + monthlyRate)
      )
      
      const totalPaid = payment * months
      const interest = totalPaid - debt.balance

      totalInterest += interest
      totalMonths = Math.max(totalMonths, months)
      
      payoffOrder.push({
        name: debt.name,
        months,
        totalPaid
      })
    })

    setPayoffResult({
      totalMonths,
      totalInterest,
      monthlyPayment: monthlyBudget,
      payoffOrder
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = (file: File) => {
    // Simulate file processing
    console.log('Processing file:', file.name)
    
    // Mock data extraction
    setTimeout(() => {
      const mockDebts: Debt[] = [
        {
          id: Date.now().toString(),
          name: 'Chase Freedom',
          balance: 2500,
          apr: 22.99,
          minimumPayment: 75
        },
        {
          id: (Date.now() + 1).toString(),
          name: 'Capital One',
          balance: 1800,
          apr: 19.99,
          minimumPayment: 50
        }
      ]
      setDebts(mockDebts)
    }, 1000)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <DollarSign className="header-icon" />
            <div>
              <h1>Personal Finance Manager</h1>
              <p>Import statements, manage debts, and create your payoff plan</p>
            </div>
          </div>
        </header>

        {/* File Upload Section */}
        <div className="card">
          <div className="card-header">
            <Upload className="card-icon" />
            <h2>Import Financial Data</h2>
          </div>
          <div 
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="upload-icon" />
            <p>Drag & drop your bank statements or credit card bills</p>
            <p className="upload-subtitle">Supports CSV files and images (JPG, PNG)</p>
            <input
              type="file"
              accept=".csv,image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="file-input"
            />
            <button className="upload-button">Choose Files</button>
          </div>
        </div>

        {/* Debt Management Section */}
        <div className="card">
          <div className="card-header">
            <TrendingDown className="card-icon" />
            <h2>Debt Management</h2>
          </div>
          
          <button onClick={addDebt} className="add-debt-button">
            + Add Debt
          </button>

          <div className="debts-list">
            {debts.map((debt) => (
              <div key={debt.id} className="debt-item">
                <div className="debt-fields">
                  <input
                    type="text"
                    value={debt.name}
                    onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                    placeholder="Debt name"
                    className="debt-input debt-name"
                  />
                  <input
                    type="number"
                    value={debt.balance}
                    onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)}
                    placeholder="Balance"
                    className="debt-input"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={debt.apr}
                    onChange={(e) => updateDebt(debt.id, 'apr', parseFloat(e.target.value) || 0)}
                    placeholder="APR %"
                    className="debt-input"
                  />
                  <input
                    type="number"
                    value={debt.minimumPayment}
                    onChange={(e) => updateDebt(debt.id, 'minimumPayment', parseFloat(e.target.value) || 0)}
                    placeholder="Min Payment"
                    className="debt-input"
                  />
                </div>
                <button
                  onClick={() => removeDebt(debt.id)}
                  className="remove-debt-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payoff Planning Section */}
        <div className="card">
          <div className="card-header">
            <Calculator className="card-icon" />
            <h2>Payoff Strategy</h2>
          </div>

          <div className="strategy-controls">
            <div className="control-group">
              <label>Monthly Budget:</label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                className="budget-input"
              />
            </div>

            <div className="control-group">
              <label>Strategy:</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as 'avalanche' | 'snowball')}
                className="strategy-select"
              >
                <option value="avalanche">Debt Avalanche (Highest APR First)</option>
                <option value="snowball">Debt Snowball (Smallest Balance First)</option>
              </select>
            </div>

            <button onClick={calculatePayoff} className="calculate-button">
              <Target className="button-icon" />
              Calculate Payoff Plan
            </button>
          </div>

          {payoffResult && (
            <div className="results">
              <div className="results-summary">
                <div className="result-item">
                  <Clock className="result-icon" />
                  <div>
                    <div className="result-value">{payoffResult.totalMonths}</div>
                    <div className="result-label">Months to Pay Off</div>
                  </div>
                </div>
                <div className="result-item">
                  <DollarSign className="result-icon" />
                  <div>
                    <div className="result-value">${payoffResult.totalInterest.toFixed(2)}</div>
                    <div className="result-label">Total Interest</div>
                  </div>
                </div>
              </div>

              <div className="payoff-order">
                <h3>Payoff Order:</h3>
                {payoffResult.payoffOrder.map((item, index) => (
                  <div key={index} className="payoff-item">
                    <span className="payoff-rank">{index + 1}</span>
                    <span className="payoff-name">{item.name}</span>
                    <span className="payoff-months">{item.months} months</span>
                    <span className="payoff-total">${item.totalPaid.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App