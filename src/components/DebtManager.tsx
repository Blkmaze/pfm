import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

interface Debt {
  id: string
  name: string
  balance: number
  apr: number
  minimumPayment: number
}

interface DebtManagerProps {
  debts: Debt[]
  onAdd: (debt: Omit<Debt, 'id'>) => void
  onUpdate: (id: string, updates: Partial<Debt>) => void
  onRemove: (id: string) => void
}

export default function DebtManager({ debts, onAdd, onUpdate, onRemove }: DebtManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    balance: 0,
    apr: 0,
    minimumPayment: 0
  })

  const resetForm = () => {
    setFormData({
      name: '',
      balance: 0,
      apr: 0,
      minimumPayment: 0
    })
  }

  const handleAdd = () => {
    if (formData.name && formData.balance > 0) {
      onAdd(formData)
      resetForm()
      setShowAddForm(false)
    }
  }

  const handleEdit = (debt: Debt) => {
    setEditingId(debt.id)
    setFormData({
      name: debt.name,
      balance: debt.balance,
      apr: debt.apr,
      minimumPayment: debt.minimumPayment
    })
  }

  const handleUpdate = () => {
    if (editingId && formData.name && formData.balance > 0) {
      onUpdate(editingId, formData)
      setEditingId(null)
      resetForm()
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowAddForm(false)
    resetForm()
  }

  return (
    <div className="debt-manager">
      <div className="debt-list">
        {debts.map((debt) => (
          <div key={debt.id} className="debt-item">
            <div className="debt-info">
              <h4 className="debt-name">{debt.name}</h4>
              <div className="debt-details">
                <span className="debt-balance">${debt.balance.toLocaleString()}</span>
                <span className="debt-apr">{debt.apr}% APR</span>
                <span className="debt-minimum">Min: ${debt.minimumPayment}</span>
              </div>
            </div>
            <div className="debt-actions">
              <button
                onClick={() => handleEdit(debt)}
                className="action-btn edit-btn"
                title="Edit debt"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onRemove(debt.id)}
                className="action-btn delete-btn"
                title="Delete debt"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {debts.length === 0 && (
          <div className="empty-state">
            <p>No debts added yet. Add your first debt to get started.</p>
          </div>
        )}
      </div>

      {(showAddForm || editingId) && (
        <div className="debt-form">
          <h4>{editingId ? 'Edit Debt' : 'Add New Debt'}</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Debt Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Credit Card, Student Loan"
              />
            </div>
            <div className="form-group">
              <label>Current Balance</label>
              <input
                type="number"
                value={formData.balance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, balance: Number(e.target.value) }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>APR (%)</label>
              <input
                type="number"
                value={formData.apr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, apr: Number(e.target.value) }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Minimum Payment</label>
              <input
                type="number"
                value={formData.minimumPayment || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumPayment: Number(e.target.value) }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleCancel} className="cancel-btn">
              <X size={16} />
              Cancel
            </button>
            <button 
              onClick={editingId ? handleUpdate : handleAdd} 
              className="save-btn"
            >
              <Save size={16} />
              {editingId ? 'Update' : 'Add'} Debt
            </button>
          </div>
        </div>
      )}

      {!showAddForm && !editingId && (
        <button
          onClick={() => setShowAddForm(true)}
          className="add-debt-btn"
        >
          <Plus size={20} />
          Add New Debt
        </button>
      )}

      <style jsx>{`
        .debt-manager {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .debt-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .debt-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 0.5rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .debt-info {
          flex: 1;
        }

        .debt-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .debt-details {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .debt-balance {
          font-weight: 600;
          color: #dc2626;
        }

        .debt-apr {
          color: #f59e0b;
        }

        .debt-minimum {
          color: #059669;
        }

        .debt-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-btn {
          background: #f3f4f6;
          color: #6b7280;
        }

        .edit-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .delete-btn {
          background: #fef2f2;
          color: #dc2626;
        }

        .delete-btn:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          font-style: italic;
        }

        .debt-form {
          padding: 1.5rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 0.75rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .debt-form h4 {
          margin-bottom: 1rem;
          color: #374151;
          font-size: 1.1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .form-group input {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .cancel-btn,
        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #6b7280;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .save-btn {
          background: #667eea;
          color: white;
        }

        .save-btn:hover {
          background: #5a67d8;
        }

        .add-debt-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: transparent;
          border: 2px dashed #d1d5db;
          border-radius: 0.5rem;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .add-debt-btn:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        @media (max-width: 640px) {
          .debt-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .debt-details {
            flex-direction: column;
            gap: 0.25rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}