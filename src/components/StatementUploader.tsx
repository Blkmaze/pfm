import React, { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Download, Edit3, X } from 'lucide-react'
import { BankStatementParser, ParsedTransaction, ParseResult, TransactionCategory } from '../utils/bankStatementParser'

interface StatementUploaderProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
  onDataReplaced: () => void
}

export default function StatementUploader({ onTransactionsParsed, onDataReplaced }: StatementUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const parser = new BankStatementParser()

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    setError(null)
    setProcessing(true)
    setParseResult(null)

    try {
      const result = await parser.parseStatement(file)
      
      if (result.errors.length > 0) {
        setError(result.errors.join('; '))
      }
      
      if (result.transactions.length === 0) {
        setError('No transactions found in the uploaded file')
        return
      }

      setParseResult(result)
      setShowReview(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse statement')
    } finally {
      setProcessing(false)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleCategoryChange = (transactionId: string, newCategory: TransactionCategory) => {
    if (!parseResult) return
    
    const updatedTransactions = parseResult.transactions.map(tx =>
      tx.id === transactionId ? { ...tx, category: newCategory, confidence: 1.0 } : tx
    )
    
    setParseResult({
      ...parseResult,
      transactions: updatedTransactions
    })
  }

  const handleConfirmIntegration = () => {
    if (!parseResult) return
    
    // Replace existing data and integrate
    onDataReplaced()
    onTransactionsParsed(parseResult.transactions)
    
    // Reset state
    setParseResult(null)
    setShowReview(false)
    setEditingTransaction(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancelReview = () => {
    setParseResult(null)
    setShowReview(false)
    setEditingTransaction(null)
  }

  const exportParsedData = () => {
    if (!parseResult) return
    
    const csvContent = [
      ['Date', 'Description', 'Amount', 'Type', 'Category', 'Merchant', 'Confidence'].join(','),
      ...parseResult.transactions.map(tx => [
        tx.date,
        `"${tx.description}"`,
        tx.amount,
        tx.type,
        tx.category,
        tx.merchant || '',
        tx.confidence
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parsed-transactions.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getCategoryColor = (category: TransactionCategory): string => {
    const colors = {
      [TransactionCategory.GROCERIES]: '#10b981',
      [TransactionCategory.RESTAURANTS]: '#f59e0b',
      [TransactionCategory.GAS_FUEL]: '#ef4444',
      [TransactionCategory.UTILITIES]: '#3b82f6',
      [TransactionCategory.RENT_MORTGAGE]: '#8b5cf6',
      [TransactionCategory.INSURANCE]: '#06b6d4',
      [TransactionCategory.HEALTHCARE]: '#ec4899',
      [TransactionCategory.ENTERTAINMENT]: '#f97316',
      [TransactionCategory.SHOPPING]: '#84cc16',
      [TransactionCategory.TRANSPORTATION]: '#6366f1',
      [TransactionCategory.SUBSCRIPTIONS]: '#14b8a6',
      [TransactionCategory.BANKING_FEES]: '#dc2626',
      [TransactionCategory.INCOME]: '#059669',
      [TransactionCategory.TRANSFERS]: '#64748b',
      [TransactionCategory.OTHER]: '#6b7280'
    }
    return colors[category] || '#6b7280'
  }

  if (showReview && parseResult) {
    return (
      <div className="statement-review">
        <div className="review-header">
          <h3>Review Parsed Transactions</h3>
          <div className="review-actions">
            <button onClick={exportParsedData} className="export-btn">
              <Download size={16} />
              Export CSV
            </button>
            <button onClick={handleCancelReview} className="cancel-btn">
              <X size={16} />
              Cancel
            </button>
            <button onClick={handleConfirmIntegration} className="confirm-btn">
              <CheckCircle size={16} />
              Integrate Data
            </button>
          </div>
        </div>

        <div className="parse-summary">
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-value">{parseResult.summary.totalTransactions}</div>
              <div className="stat-label">Transactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(parseResult.summary.totalCredits)}</div>
              <div className="stat-label">Total Credits</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(parseResult.summary.totalDebits)}</div>
              <div className="stat-label">Total Debits</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round(parseResult.confidence * 100)}%</div>
              <div className="stat-label">Confidence</div>
            </div>
          </div>
          
          <div className="date-range">
            <span>Date Range: {parseResult.summary.dateRange.start} to {parseResult.summary.dateRange.end}</span>
          </div>
        </div>

        <div className="transactions-table">
          <div className="table-header">
            <span>Date</span>
            <span>Description</span>
            <span>Amount</span>
            <span>Category</span>
            <span>Confidence</span>
            <span>Actions</span>
          </div>
          
          <div className="table-body">
            {parseResult.transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-row">
                <span className="date-cell">{transaction.date}</span>
                <span className="description-cell" title={transaction.description}>
                  {transaction.description}
                </span>
                <span className={`amount-cell ${transaction.type}`}>
                  {formatCurrency(transaction.amount)}
                </span>
                <div className="category-cell">
                  {editingTransaction === transaction.id ? (
                    <select
                      value={transaction.category}
                      onChange={(e) => handleCategoryChange(transaction.id, e.target.value as TransactionCategory)}
                      onBlur={() => setEditingTransaction(null)}
                      autoFocus
                    >
                      {Object.values(TransactionCategory).map(category => (
                        <option key={category} value={category}>
                          {category.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    >
                      {transaction.category.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="confidence-cell">
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${transaction.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="confidence-text">{Math.round(transaction.confidence * 100)}%</span>
                </div>
                <div className="actions-cell">
                  <button
                    onClick={() => setEditingTransaction(transaction.id)}
                    className="edit-btn"
                    title="Edit category"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="integration-warning">
          <AlertCircle size={20} />
          <div>
            <p><strong>Data Integration Warning</strong></p>
            <p>Confirming will replace existing transaction data with the parsed results. This action cannot be undone. Please review all transactions and categories before proceeding.</p>
          </div>
        </div>

        <style jsx>{`
          .statement-review {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .review-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            border-bottom: 1px solid #334155;
          }

          .review-header h3 {
            color: #f8fafc;
            font-size: 1.25rem;
            margin: 0;
          }

          .review-actions {
            display: flex;
            gap: 0.75rem;
          }

          .export-btn,
          .cancel-btn,
          .confirm-btn {
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

          .cancel-btn {
            background: #dc2626;
            color: white;
          }

          .cancel-btn:hover {
            background: #b91c1c;
          }

          .confirm-btn {
            background: #059669;
            color: white;
          }

          .confirm-btn:hover {
            background: #047857;
          }

          .parse-summary {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #334155;
            border-radius: 0.75rem;
            padding: 1.5rem;
          }

          .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .stat-card {
            text-align: center;
            padding: 1rem;
            background: rgba(51, 65, 85, 0.5);
            border-radius: 0.5rem;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #f8fafc;
          }

          .stat-label {
            font-size: 0.875rem;
            color: #94a3b8;
            margin-top: 0.25rem;
          }

          .date-range {
            text-align: center;
            color: #cbd5e1;
            font-size: 0.875rem;
          }

          .transactions-table {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #334155;
            border-radius: 0.75rem;
            overflow: hidden;
          }

          .table-header {
            display: grid;
            grid-template-columns: 100px 2fr 120px 150px 100px 80px;
            gap: 1rem;
            padding: 1rem;
            background: #334155;
            color: #f8fafc;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .table-body {
            max-height: 400px;
            overflow-y: auto;
          }

          .transaction-row {
            display: grid;
            grid-template-columns: 100px 2fr 120px 150px 100px 80px;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid #334155;
            align-items: center;
            color: #e2e8f0;
            font-size: 0.875rem;
          }

          .transaction-row:hover {
            background: rgba(51, 65, 85, 0.3);
          }

          .description-cell {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .amount-cell {
            font-weight: 600;
            text-align: right;
          }

          .amount-cell.credit {
            color: #10b981;
          }

          .amount-cell.debit {
            color: #ef4444;
          }

          .category-cell select {
            background: #1e293b;
            border: 1px solid #475569;
            border-radius: 0.25rem;
            padding: 0.25rem;
            color: #e2e8f0;
            font-size: 0.75rem;
            width: 100%;
          }

          .category-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            text-transform: capitalize;
            display: inline-block;
          }

          .confidence-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
          }

          .confidence-bar {
            width: 60px;
            height: 6px;
            background: #334155;
            border-radius: 3px;
            overflow: hidden;
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

          .edit-btn {
            background: #475569;
            border: none;
            border-radius: 0.25rem;
            padding: 0.25rem;
            color: #cbd5e1;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .edit-btn:hover {
            background: #64748b;
          }

          .integration-warning {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 0.5rem;
            color: #fca5a5;
          }

          .integration-warning p {
            margin: 0.25rem 0;
            font-size: 0.875rem;
          }

          .integration-warning strong {
            color: #ef4444;
          }

          @media (max-width: 1024px) {
            .table-header,
            .transaction-row {
              grid-template-columns: 1fr;
              gap: 0.5rem;
            }

            .review-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="statement-uploader">
      <div className="card-header">
        <h2>Upload Bank Statement</h2>
        <div className="file-types">CSV PDF OFX QFX</div>
      </div>

      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf,.ofx,.qfx"
          onChange={handleFileInput}
          className="file-input"
        />
        
        {processing ? (
          <div className="processing">
            <div className="spinner"></div>
            <p>Parsing bank statement...</p>
            <p className="processing-subtitle">Extracting and categorizing transactions</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <Upload className="upload-icon" />
            <p>
              <strong>Drag & drop</strong> your bank statement here or{' '}
              <button onClick={handleBrowseClick} className="browse-btn">
                Browse
              </button>
            </p>
            <p className="upload-subtitle">Supports CSV, PDF, OFX, and QFX formats</p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="upload-info">
        <h4>Automatic Processing Features:</h4>
        <ul>
          <li>✓ Intelligent transaction categorization</li>
          <li>✓ Merchant name extraction and cleanup</li>
          <li>✓ Duplicate detection and handling</li>
          <li>✓ Bill pattern recognition for recurring payments</li>
          <li>✓ Data validation and error handling</li>
        </ul>
      </div>

      <style jsx>{`
        .statement-uploader {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .file-types {
          background: #065f46;
          color: #10b981;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .upload-zone {
          border: 2px dashed #475569;
          border-radius: 0.75rem;
          padding: 3rem 2rem;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
          background: rgba(15, 23, 42, 0.5);
        }

        .upload-zone:hover,
        .upload-zone.drag-active {
          border-color: #0ea5e9;
          background: rgba(14, 165, 233, 0.05);
        }

        .file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .upload-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-icon {
          width: 3rem;
          height: 3rem;
          color: #64748b;
        }

        .upload-prompt p {
          margin: 0;
          color: #cbd5e1;
          font-size: 1.1rem;
        }

        .browse-btn {
          background: none;
          border: none;
          color: #0ea5e9;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 600;
        }

        .browse-btn:hover {
          color: #0284c7;
        }

        .upload-subtitle {
          font-size: 0.875rem !important;
          color: #64748b !important;
        }

        .processing {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 2.5rem;
          height: 2.5rem;
          border: 3px solid #334155;
          border-top: 3px solid #0ea5e9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .processing p {
          margin: 0;
          color: #cbd5e1;
        }

        .processing-subtitle {
          font-size: 0.875rem !important;
          color: #64748b !important;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.5rem;
          font-weight: 500;
        }

        .upload-info {
          padding: 1rem;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 0.5rem;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .upload-info h4 {
          margin-bottom: 0.75rem;
          color: #f8fafc;
          font-size: 1rem;
        }

        .upload-info ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .upload-info li {
          color: #94a3b8;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}