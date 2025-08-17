import { TrendingUp, Calendar, DollarSign, Target } from 'lucide-react'

interface PayoffResult {
  months: number
  totalInterest: number
  totalPaid: number
  monthlyPayment: number
}

interface PayoffPlanProps {
  result: PayoffResult
  totalDebt: number
  method: 'avalanche' | 'snowball'
}

export default function PayoffPlan({ result, totalDebt, method }: PayoffPlanProps) {
  const years = Math.floor(result.months / 12)
  const remainingMonths = result.months % 12
  const interestSavings = totalDebt * 0.1 // Estimated savings vs minimum payments

  const formatTimeframe = () => {
    if (years === 0) {
      return `${result.months} month${result.months !== 1 ? 's' : ''}`
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`
    } else {
      return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
    }
  }

  return (
    <div className="payoff-plan">
      <div className="plan-header">
        <div className="method-badge">
          <Target size={16} />
          {method === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} Strategy
        </div>
        <p className="method-description">
          {method === 'avalanche' 
            ? 'Paying highest interest rates first to minimize total interest paid'
            : 'Paying smallest balances first for psychological momentum'
          }
        </p>
      </div>

      <div className="results-grid">
        <div className="result-card">
          <div className="result-icon">
            <Calendar className="icon" />
          </div>
          <div className="result-content">
            <div className="result-value">{formatTimeframe()}</div>
            <div className="result-label">Payoff Time</div>
          </div>
        </div>

        <div className="result-card">
          <div className="result-icon interest">
            <DollarSign className="icon" />
          </div>
          <div className="result-content">
            <div className="result-value">${result.totalInterest.toLocaleString()}</div>
            <div className="result-label">Total Interest</div>
          </div>
        </div>

        <div className="result-card">
          <div className="result-icon total">
            <TrendingUp className="icon" />
          </div>
          <div className="result-content">
            <div className="result-value">${result.totalPaid.toLocaleString()}</div>
            <div className="result-label">Total Paid</div>
          </div>
        </div>

        <div className="result-card">
          <div className="result-icon savings">
            <Target className="icon" />
          </div>
          <div className="result-content">
            <div className="result-value">${result.monthlyPayment.toLocaleString()}</div>
            <div className="result-label">Monthly Payment</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h4>Debt Freedom Progress</h4>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '0%' }}>
            <span className="progress-text">Start your journey!</span>
          </div>
        </div>
        <div className="progress-labels">
          <span>Today</span>
          <span>Debt Free in {formatTimeframe()}</span>
        </div>
      </div>

      <div className="tips-section">
        <h4>💡 Tips to Accelerate Your Payoff</h4>
        <ul className="tips-list">
          <li>Consider making bi-weekly payments instead of monthly to reduce interest</li>
          <li>Apply any windfalls (tax refunds, bonuses) directly to debt</li>
          <li>Look for ways to increase your monthly budget by $50-100</li>
          <li>Avoid taking on new debt while paying off existing balances</li>
          {method === 'avalanche' && (
            <li>Stay motivated by celebrating each debt you eliminate completely</li>
          )}
          {method === 'snowball' && (
            <li>Consider switching to avalanche method once you build momentum</li>
          )}
        </ul>
      </div>

      <style jsx>{`
        .payoff-plan {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .plan-header {
          text-align: center;
        }

        .method-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .method-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .result-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 0.75rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .result-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.5rem;
          background: rgba(102, 126, 234, 0.1);
        }

        .result-icon.interest {
          background: rgba(239, 68, 68, 0.1);
        }

        .result-icon.total {
          background: rgba(16, 185, 129, 0.1);
        }

        .result-icon.savings {
          background: rgba(245, 158, 11, 0.1);
        }

        .icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #667eea;
        }

        .interest .icon {
          color: #ef4444;
        }

        .total .icon {
          color: #10b981;
        }

        .savings .icon {
          color: #f59e0b;
        }

        .result-content {
          flex: 1;
        }

        .result-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
          line-height: 1.2;
        }

        .result-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .progress-section {
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 0.75rem;
        }

        .progress-section h4 {
          margin-bottom: 1rem;
          color: #374151;
          font-size: 1rem;
        }

        .progress-bar {
          position: relative;
          height: 1rem;
          background: #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.3s ease;
          min-width: 120px;
        }

        .progress-text {
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .tips-section {
          padding: 1rem;
          background: rgba(16, 185, 129, 0.05);
          border-radius: 0.75rem;
          border: 1px solid rgba(16, 185, 129, 0.1);
        }

        .tips-section h4 {
          margin-bottom: 0.75rem;
          color: #374151;
          font-size: 1rem;
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tips-list li {
          padding-left: 1.5rem;
          position: relative;
          color: #4b5563;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .tips-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }

        @media (max-width: 640px) {
          .results-grid {
            grid-template-columns: 1fr;
          }

          .result-card {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}