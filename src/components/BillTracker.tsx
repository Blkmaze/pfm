import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, AlertTriangle, Clock, Filter, Download, Plus } from 'lucide-react'
import { BillParser, BillTransaction, BillCategory, BillFrequency, PaymentStatus } from '../utils/billParser'

interface BillTrackerProps {
  transactions: any[]
}

export default function BillTracker({ transactions }: BillTrackerProps) {
  const [bills, setBills] = useState<BillTransaction[]>([])
  const [filteredBills, setFilteredBills] = useState<BillTransaction[]>([])
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'payee'>('date')
  const [showAddBill, setShowAddBill] = useState(false)

  useEffect(() => {
    if (transactions.length > 0) {
      const parser = new BillParser(transactions)
      const parsedBills = parser.parseBills()
      setBills(parsedBills)
      setFilteredBills(parsedBills)
    }
  }, [transactions])

  useEffect(() => {
    let filtered = [...bills]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bill => bill.category === selectedCategory)
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(bill => bill.status === selectedStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'payee':
          return a.payee.localeCompare(b.payee)
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })

    setFilteredBills(filtered)
  }, [bills, selectedCategory, selectedStatus, sortBy])

  const getCategoryColor = (category: BillCategory): string => {
    const colors = {
      [BillCategory.UTILITIES]: '#f59e0b',
      [BillCategory.SUBSCRIPTIONS]: '#8b5cf6',
      [BillCategory.LOANS]: '#ef4444',
      [BillCategory.INSURANCE]: '#06b6d4',
      [BillCategory.RENT_MORTGAGE]: '#10b981',
      [BillCategory.CREDIT_CARDS]: '#f97316',
      [BillCategory.TELECOMMUNICATIONS]: '#3b82f6',
      [BillCategory.TRANSPORTATION]: '#84cc16',
      [BillCategory.HEALTHCARE]: '#ec4899',
      [BillCategory.OTHER]: '#6b7280'
    }
    return colors[category] || '#6b7280'
  }

  const getStatusColor = (status: PaymentStatus): string => {
    const colors = {
      [PaymentStatus.PAID]: '#10b981',
      [PaymentStatus.PENDING]: '#f59e0b',
      [PaymentStatus.OVERDUE]: '#ef4444',
      [PaymentStatus.UPCOMING]: '#3b82f6'
    }
    return colors[status]
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTotalByStatus = (status: PaymentStatus): number => {
    return bills
      .filter(bill => bill.status === status)
      .reduce((total, bill) => total + bill.amount, 0)
  }

  const getMonthlyTotal = (): number => {
    return bills
      .filter(bill => bill.frequency === BillFrequency.MONTHLY)
      .reduce((total, bill) => total + bill.amount, 0)
  }

  const exportBills = () => {
    const csvContent = [
      ['Payee', 'Amount', 'Date', 'Category', 'Status', 'Frequency', 'Next Due', 'Notes'].join(','),
      ...filteredBills.map(bill => [
        bill.payee,
        bill.amount,
        bill.date,
        bill.category,
        bill.status,
        bill.frequency,
        bill.nextDueDate || '',
        bill.notes || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bills-tracker.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bill-tracker">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card overdue">
          <div className="summary-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-amount">{formatCurrency(getTotalByStatus(PaymentStatus.OVERDUE))}</div>
            <div className="summary-label">Overdue Bills</div>
          </div>
        </div>

        <div className="summary-card upcoming">
          <div className="summary-icon">
            <Clock size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-amount">{formatCurrency(getTotalByStatus(PaymentStatus.UPCOMING))}</div>
            <div className="summary-label">Upcoming Bills</div>
          </div>
        </div>

        <div className="summary-card monthly">
          <div className="summary-icon">
            <Calendar size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-amount">{formatCurrency(getMonthlyTotal())}</div>
            <div className="summary-label">Monthly Total</div>
          </div>
        </div>

        <div className="summary-card total">
          <div className="summary-icon">
            <DollarSign size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-amount">{formatCurrency(bills.reduce((sum, bill) => sum + bill.amount, 0))}</div>
            <div className="summary-label">Total Tracked</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bill-controls">
        <div className="filter-controls">
          <div className="filter-group">
            <label>Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as BillCategory | 'all')}
            >
              <option value="all">All Categories</option>
              {Object.values(BillCategory).map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              {Object.values(PaymentStatus).map(status => (
                <option key={status} value={status}>
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'payee')}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="payee">Payee</option>
            </select>
          </div>
        </div>

        <div className="action-controls">
          <button onClick={exportBills} className="export-btn">
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={() => setShowAddBill(true)} className="add-bill-btn">
            <Plus size={16} />
            Add Bill
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bills-table-container">
        <table className="bills-table">
          <thead>
            <tr>
              <th>Payee</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Category</th>
              <th>Status</th>
              <th>Frequency</th>
              <th>Next Due</th>
              <th>Confidence</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill.id} className={`bill-row ${bill.status}`}>
                <td className="payee-cell">
                  <div className="payee-name">{bill.payee}</div>
                </td>
                <td className="amount-cell">
                  <span className="amount">{formatCurrency(bill.amount)}</span>
                </td>
                <td className="date-cell">
                  {formatDate(bill.date)}
                </td>
                <td className="category-cell">
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(bill.category) }}
                  >
                    {bill.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="status-cell">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(bill.status) }}
                  >
                    {bill.status}
                  </span>
                </td>
                <td className="frequency-cell">
                  {bill.frequency.replace('_', ' ')}
                </td>
                <td className="next-due-cell">
                  {bill.nextDueDate ? formatDate(bill.nextDueDate) : '-'}
                </td>
                <td className="confidence-cell">
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${bill.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="confidence-text">{Math.round(bill.confidence * 100)}%</span>
                </td>
                <td className="notes-cell">
                  <span className="notes-text">{bill.notes || '-'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBills.length === 0 && (
          <div className="empty-state">
            <p>No bills found matching your criteria.</p>
            <p>Upload bank statements to automatically detect bills.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .bill-tracker {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #334155;
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
        }

        .summary-card.overdue {
          border-color: #ef4444;
        }

        .summary-card.upcoming {
          border-color: #3b82f6;
        }

        .summary-card.monthly {
          border-color: #10b981;
        }

        .summary-card.total {
          border-color: #f59e0b;
        }

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 0.5rem;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .overdue .summary-icon {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .upcoming .summary-icon {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .monthly .summary-icon {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .total .summary-icon {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .summary-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .summary-label {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .bill-controls {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 1rem;
          padding: 1rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #334155;
          border-radius: 0.75rem;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.875rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .filter-group select {
          background: #1e293b;
          border: 1px solid #475569;
          border-radius: 0.375rem;
          padding: 0.5rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          min-width: 120px;
        }

        .action-controls {
          display: flex;
          gap: 0.75rem;
        }

        .export-btn,
        .add-bill-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-btn {
          background: #475569;
          color: #e2e8f0;
        }

        .export-btn:hover {
          background: #64748b;
        }

        .add-bill-btn {
          background: #0ea5e9;
          color: white;
        }

        .add-bill-btn:hover {
          background: #0284c7;
        }

        .bills-table-container {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #334155;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .bills-table {
          width: 100%;
          border-collapse: collapse;
        }

        .bills-table th {
          background: #334155;
          color: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          border-bottom: 1px solid #475569;
        }

        .bills-table td {
          padding: 1rem;
          border-bottom: 1px solid #334155;
          color: #e2e8f0;
          font-size: 0.875rem;
        }

        .bill-row:hover {
          background: rgba(51, 65, 85, 0.5);
        }

        .bill-row.overdue {
          border-left: 3px solid #ef4444;
        }

        .bill-row.upcoming {
          border-left: 3px solid #3b82f6;
        }

        .payee-name {
          font-weight: 500;
          color: #f8fafc;
        }

        .amount {
          font-weight: 600;
          color: #f8fafc;
        }

        .category-badge,
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .confidence-bar {
          width: 60px;
          height: 8px;
          background: #334155;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%);
          transition: width 0.3s ease;
        }

        .confidence-text {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .notes-text {
          color: #94a3b8;
          font-style: italic;
        }

        .empty-state {
          padding: 3rem;
          text-align: center;
          color: #94a3b8;
        }

        .empty-state p {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 1024px) {
          .bill-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-controls {
            flex-wrap: wrap;
          }

          .bills-table-container {
            overflow-x: auto;
          }

          .bills-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  )
}