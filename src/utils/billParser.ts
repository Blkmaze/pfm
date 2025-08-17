// Advanced Bill Detection and Parsing System

export interface BillTransaction {
  id: string
  payee: string
  amount: number
  date: string
  category: BillCategory
  frequency: BillFrequency
  status: PaymentStatus
  nextDueDate?: string
  outstandingBalance?: number
  notes?: string
  confidence: number // 0-1 score for detection accuracy
}

export enum BillCategory {
  UTILITIES = 'utilities',
  SUBSCRIPTIONS = 'subscriptions',
  LOANS = 'loans',
  INSURANCE = 'insurance',
  RENT_MORTGAGE = 'rent_mortgage',
  CREDIT_CARDS = 'credit_cards',
  TELECOMMUNICATIONS = 'telecommunications',
  TRANSPORTATION = 'transportation',
  HEALTHCARE = 'healthcare',
  OTHER = 'other'
}

export enum BillFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  ONE_TIME = 'one_time'
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  UPCOMING = 'upcoming'
}

// Bill detection patterns and keywords
const BILL_PATTERNS = {
  [BillCategory.UTILITIES]: {
    keywords: ['electric', 'gas', 'water', 'sewer', 'utility', 'power', 'energy', 'pge', 'sdge', 'edison'],
    patterns: [/electric/i, /gas\s*(company|corp)/i, /water\s*dept/i, /utility/i]
  },
  [BillCategory.SUBSCRIPTIONS]: {
    keywords: ['netflix', 'spotify', 'amazon prime', 'hulu', 'disney', 'apple music', 'youtube', 'subscription'],
    patterns: [/netflix/i, /spotify/i, /prime/i, /subscription/i]
  },
  [BillCategory.LOANS]: {
    keywords: ['loan', 'mortgage', 'student loan', 'auto loan', 'personal loan', 'lending'],
    patterns: [/loan/i, /mortgage/i, /lending/i, /finance/i]
  },
  [BillCategory.INSURANCE]: {
    keywords: ['insurance', 'allstate', 'geico', 'progressive', 'state farm', 'health insurance'],
    patterns: [/insurance/i, /allstate/i, /geico/i, /progressive/i]
  },
  [BillCategory.RENT_MORTGAGE]: {
    keywords: ['rent', 'mortgage', 'property management', 'landlord', 'housing'],
    patterns: [/rent/i, /mortgage/i, /property\s*mgmt/i, /housing/i]
  },
  [BillCategory.CREDIT_CARDS]: {
    keywords: ['credit card', 'visa', 'mastercard', 'amex', 'discover', 'payment'],
    patterns: [/credit\s*card/i, /visa/i, /mastercard/i, /amex/i, /discover/i]
  },
  [BillCategory.TELECOMMUNICATIONS]: {
    keywords: ['verizon', 'att', 'tmobile', 'sprint', 'internet', 'phone', 'wireless', 'cable'],
    patterns: [/verizon/i, /at&t/i, /t-mobile/i, /internet/i, /wireless/i, /cable/i]
  },
  [BillCategory.TRANSPORTATION]: {
    keywords: ['car payment', 'auto', 'insurance', 'gas', 'parking', 'toll', 'uber', 'lyft'],
    patterns: [/car\s*payment/i, /auto/i, /parking/i, /toll/i, /uber/i, /lyft/i]
  },
  [BillCategory.HEALTHCARE]: {
    keywords: ['medical', 'doctor', 'hospital', 'pharmacy', 'dental', 'vision', 'health'],
    patterns: [/medical/i, /doctor/i, /hospital/i, /pharmacy/i, /dental/i, /health/i]
  }
}

export class BillParser {
  private transactions: any[] = []
  private detectedBills: BillTransaction[] = []
  private recurringPatterns: Map<string, BillTransaction[]> = new Map()

  constructor(transactions: any[]) {
    this.transactions = transactions
  }

  // Main parsing function
  public parseBills(): BillTransaction[] {
    this.detectBillTransactions()
    this.identifyRecurringPatterns()
    this.addMissingRecurringBills()
    this.sortAndOrganizeBills()
    this.calculateNextPaymentDates()
    
    return this.detectedBills
  }

  // Step 1: Detect bill-related transactions
  private detectBillTransactions(): void {
    this.transactions.forEach((transaction, index) => {
      const billInfo = this.analyzeBillTransaction(transaction)
      if (billInfo.confidence > 0.6) {
        this.detectedBills.push({
          id: `bill_${index}`,
          payee: this.extractPayeeName(transaction.description),
          amount: Math.abs(transaction.amount),
          date: transaction.date,
          category: billInfo.category,
          frequency: this.estimateFrequency(transaction.description),
          status: this.determinePaymentStatus(transaction.date),
          confidence: billInfo.confidence,
          notes: this.generateNotes(transaction)
        })
      }
    })
  }

  // Analyze individual transaction for bill characteristics
  private analyzeBillTransaction(transaction: any): { category: BillCategory, confidence: number } {
    const description = transaction.description.toLowerCase()
    let bestMatch = { category: BillCategory.OTHER, confidence: 0 }

    // Check against each category
    Object.entries(BILL_PATTERNS).forEach(([category, patterns]) => {
      let confidence = 0
      
      // Keyword matching
      patterns.keywords.forEach(keyword => {
        if (description.includes(keyword.toLowerCase())) {
          confidence += 0.3
        }
      })

      // Pattern matching
      patterns.patterns.forEach(pattern => {
        if (pattern.test(description)) {
          confidence += 0.4
        }
      })

      // Amount-based heuristics
      if (this.isTypicalBillAmount(Math.abs(transaction.amount), category as BillCategory)) {
        confidence += 0.2
      }

      // Recurring transaction bonus
      if (this.appearsRecurring(transaction.description)) {
        confidence += 0.1
      }

      if (confidence > bestMatch.confidence) {
        bestMatch = { category: category as BillCategory, confidence }
      }
    })

    return bestMatch
  }

  // Step 2: Identify recurring payment patterns
  private identifyRecurringPatterns(): void {
    const payeeGroups = new Map<string, BillTransaction[]>()
    
    // Group by similar payee names
    this.detectedBills.forEach(bill => {
      const normalizedPayee = this.normalizePayeeName(bill.payee)
      if (!payeeGroups.has(normalizedPayee)) {
        payeeGroups.set(normalizedPayee, [])
      }
      payeeGroups.get(normalizedPayee)!.push(bill)
    })

    // Analyze patterns for each payee
    payeeGroups.forEach((bills, payee) => {
      if (bills.length >= 2) {
        const frequency = this.calculateFrequency(bills)
        const avgAmount = this.calculateAverageAmount(bills)
        
        // Update bills with refined frequency and amount data
        bills.forEach(bill => {
          bill.frequency = frequency
          if (Math.abs(bill.amount - avgAmount) / avgAmount < 0.1) {
            bill.confidence = Math.min(bill.confidence + 0.2, 1.0)
          }
        })
        
        this.recurringPatterns.set(payee, bills)
      }
    })
  }

  // Step 3: Add missing recurring bills based on patterns
  private addMissingRecurringBills(): void {
    this.recurringPatterns.forEach((bills, payee) => {
      const lastPayment = bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      const expectedNextDate = this.calculateExpectedNextPayment(lastPayment)
      
      if (expectedNextDate && this.isMissingPayment(expectedNextDate)) {
        this.detectedBills.push({
          id: `missing_${Date.now()}_${payee}`,
          payee: lastPayment.payee,
          amount: lastPayment.amount,
          date: expectedNextDate,
          category: lastPayment.category,
          frequency: lastPayment.frequency,
          status: PaymentStatus.UPCOMING,
          confidence: 0.8,
          notes: 'Projected based on recurring pattern'
        })
      }
    })
  }

  // Step 4: Sort and organize bills
  private sortAndOrganizeBills(): void {
    this.detectedBills.sort((a, b) => {
      // First by status priority
      const statusPriority = {
        [PaymentStatus.OVERDUE]: 0,
        [PaymentStatus.UPCOMING]: 1,
        [PaymentStatus.PENDING]: 2,
        [PaymentStatus.PAID]: 3
      }
      
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status]
      }
      
      // Then by date
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }

  // Step 5: Calculate next payment dates
  private calculateNextPaymentDates(): void {
    this.detectedBills.forEach(bill => {
      if (bill.status === PaymentStatus.PAID && bill.frequency !== BillFrequency.ONE_TIME) {
        bill.nextDueDate = this.calculateExpectedNextPayment(bill)
      }
    })
  }

  // Helper methods
  private extractPayeeName(description: string): string {
    // Remove common prefixes and clean up payee name
    return description
      .replace(/^(payment to|pay|bill pay|online payment)/i, '')
      .replace(/\d{4,}/g, '') // Remove long numbers
      .replace(/[#*]/g, '') // Remove special characters
      .trim()
      .substring(0, 50) // Limit length
  }

  private normalizePayeeName(payee: string): string {
    return payee.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private isTypicalBillAmount(amount: number, category: BillCategory): boolean {
    const typicalRanges = {
      [BillCategory.UTILITIES]: [50, 300],
      [BillCategory.SUBSCRIPTIONS]: [5, 50],
      [BillCategory.RENT_MORTGAGE]: [800, 5000],
      [BillCategory.INSURANCE]: [100, 500],
      [BillCategory.TELECOMMUNICATIONS]: [30, 200],
      [BillCategory.CREDIT_CARDS]: [25, 1000]
    }
    
    const range = typicalRanges[category]
    return range ? amount >= range[0] && amount <= range[1] : true
  }

  private appearsRecurring(description: string): boolean {
    const recurringIndicators = ['autopay', 'recurring', 'monthly', 'subscription', 'auto']
    return recurringIndicators.some(indicator => 
      description.toLowerCase().includes(indicator)
    )
  }

  private estimateFrequency(description: string): BillFrequency {
    const desc = description.toLowerCase()
    if (desc.includes('monthly') || desc.includes('mo')) return BillFrequency.MONTHLY
    if (desc.includes('quarterly')) return BillFrequency.QUARTERLY
    if (desc.includes('annual') || desc.includes('yearly')) return BillFrequency.ANNUAL
    if (desc.includes('weekly')) return BillFrequency.WEEKLY
    return BillFrequency.MONTHLY // Default assumption
  }

  private calculateFrequency(bills: BillTransaction[]): BillFrequency {
    if (bills.length < 2) return BillFrequency.ONE_TIME
    
    const dates = bills.map(b => new Date(b.date)).sort((a, b) => a.getTime() - b.getTime())
    const intervals = []
    
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24)
      intervals.push(daysDiff)
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    
    if (avgInterval <= 10) return BillFrequency.WEEKLY
    if (avgInterval <= 35) return BillFrequency.MONTHLY
    if (avgInterval <= 100) return BillFrequency.QUARTERLY
    if (avgInterval <= 200) return BillFrequency.SEMI_ANNUAL
    return BillFrequency.ANNUAL
  }

  private calculateAverageAmount(bills: BillTransaction[]): number {
    return bills.reduce((sum, bill) => sum + bill.amount, 0) / bills.length
  }

  private determinePaymentStatus(date: string): PaymentStatus {
    const paymentDate = new Date(date)
    const today = new Date()
    const daysDiff = (today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysDiff < 0) return PaymentStatus.UPCOMING
    if (daysDiff <= 2) return PaymentStatus.PENDING
    return PaymentStatus.PAID
  }

  private calculateExpectedNextPayment(bill: BillTransaction): string | undefined {
    const lastDate = new Date(bill.date)
    
    switch (bill.frequency) {
      case BillFrequency.WEEKLY:
        lastDate.setDate(lastDate.getDate() + 7)
        break
      case BillFrequency.MONTHLY:
        lastDate.setMonth(lastDate.getMonth() + 1)
        break
      case BillFrequency.QUARTERLY:
        lastDate.setMonth(lastDate.getMonth() + 3)
        break
      case BillFrequency.SEMI_ANNUAL:
        lastDate.setMonth(lastDate.getMonth() + 6)
        break
      case BillFrequency.ANNUAL:
        lastDate.setFullYear(lastDate.getFullYear() + 1)
        break
      default:
        return undefined
    }
    
    return lastDate.toISOString().split('T')[0]
  }

  private isMissingPayment(expectedDate: string): boolean {
    const expected = new Date(expectedDate)
    const today = new Date()
    return expected <= today
  }

  private generateNotes(transaction: any): string {
    const notes = []
    
    if (transaction.amount < 0) notes.push('Outgoing payment')
    if (Math.abs(transaction.amount) > 1000) notes.push('Large amount')
    if (transaction.description.toLowerCase().includes('autopay')) notes.push('Automatic payment')
    
    return notes.join('; ')
  }

  // Public utility methods for external use
  public getBillsByCategory(): Map<BillCategory, BillTransaction[]> {
    const categorized = new Map<BillCategory, BillTransaction[]>()
    
    this.detectedBills.forEach(bill => {
      if (!categorized.has(bill.category)) {
        categorized.set(bill.category, [])
      }
      categorized.get(bill.category)!.push(bill)
    })
    
    return categorized
  }

  public getUpcomingBills(days: number = 30): BillTransaction[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + days)
    
    return this.detectedBills.filter(bill => {
      if (bill.status === PaymentStatus.UPCOMING && bill.nextDueDate) {
        return new Date(bill.nextDueDate) <= cutoffDate
      }
      return false
    })
  }

  public calculateMonthlyObligations(): number {
    return this.detectedBills
      .filter(bill => bill.frequency === BillFrequency.MONTHLY)
      .reduce((total, bill) => total + bill.amount, 0)
  }

  public getOverdueBills(): BillTransaction[] {
    return this.detectedBills.filter(bill => bill.status === PaymentStatus.OVERDUE)
  }
}