import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, DollarSign } from 'lucide-react'

interface CalendarEvent {
  id: string
  date: number
  type: 'bill' | 'payday'
  description: string
  amount: number
  category?: string
}

interface CalendarProps {
  events: CalendarEvent[]
  onAddPayday: (date: number, amount: number, description: string) => void
  onDeleteEvent: (eventId: string) => void
  onDiscoverBills: () => void
  transactions: any[]
}

export default function Calendar({ events, onAddPayday, onDeleteEvent, onDiscoverBills, transactions }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 17)) // August 17, 2025
  const [showAddPayday, setShowAddPayday] = useState(false)
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [paydayForm, setPaydayForm] = useState({
    amount: '',
    description: 'Payday'
  })

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getCurrentMonthName = () => {
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleAddPayday = () => {
    if (selectedDate && paydayForm.amount) {
      onAddPayday(selectedDate, parseFloat(paydayForm.amount), paydayForm.description)
      setShowAddPayday(false)
      setSelectedDate(null)
      setPaydayForm({ amount: '', description: 'Payday' })
    }
  }

  const handleDiscoverBills = () => {
    onDiscoverBills()
  }

  const handleDateClick = (date: number) => {
    setSelectedDate(date)
    setShowAddPayday(true)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      onDeleteEvent(selectedEvent.id)
      setShowEventDetails(false)
      setSelectedEvent(null)
    }
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events.filter(event => event.date === day)
      days.push(
        <div 
          key={day} 
          className="calendar-day"
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {dayEvents.map((event) => (
            <div 
              key={event.id} 
              className={`calendar-event ${event.type}`}
              onClick={(e) => handleEventClick(event, e)}
              title="Click to view/delete this event"
            >
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
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Calendar</h2>
        <div className="calendar-controls">
          <button className="calendar-nav" onClick={() => navigateMonth('prev')}>
            <ChevronLeft size={16} />
          </button>
          <span className="current-month">{getCurrentMonthName()}</span>
          <button className="calendar-nav" onClick={() => navigateMonth('next')}>
            <ChevronRight size={16} />
          </button>
          <button className="add-payday" onClick={() => setShowAddPayday(true)}>
            <Plus size={16} />
            Add Payday
          </button>
          <button className="discover-bills" onClick={handleDiscoverBills}>
            <Search size={16} />
            Discover Bills
          </button>
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

      {/* Add Payday Modal */}
      {showAddPayday && (
        <div className="modal-overlay" onClick={() => setShowAddPayday(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Payday Event</h3>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="text" 
                value={selectedDate ? `${getCurrentMonthName()} ${selectedDate}` : ''} 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={paydayForm.amount}
                onChange={(e) => setPaydayForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={paydayForm.description}
                onChange={(e) => setPaydayForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Payday"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddPayday(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleAddPayday} className="save-btn">
                Add Payday
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details/Delete Modal */}
      {showEventDetails && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventDetails(false)}>
          <div className="modal-content event-details-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Event Details</h3>
            <div className="event-info">
              <div className="info-row">
                <label>Type:</label>
                <span className={`event-type-badge ${selectedEvent.type}`}>
                  {selectedEvent.type === 'payday' ? 'Payday' : 'Bill'}
                </span>
              </div>
              <div className="info-row">
                <label>Description:</label>
                <span>{selectedEvent.description}</span>
              </div>
              <div className="info-row">
                <label>Amount:</label>
                <span>${selectedEvent.amount.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <label>Date:</label>
                <span>{getCurrentMonthName()} {selectedEvent.date}</span>
              </div>
            </div>
            
            <div className="warning-message">
              <p>⚠️ <strong>Deletion Warning:</strong></p>
              <p>This will permanently remove this {selectedEvent.type} entry from your calendar. This action cannot be undone.</p>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowEventDetails(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleDeleteEvent} className="delete-btn">
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #334155;
          border-radius: 1rem;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .calendar-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .calendar-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .calendar-nav {
          background: #1e293b;
          border: 1px solid #475569;
          color: #cbd5e1;
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .calendar-nav:hover {
          background: #334155;
        }

        .current-month {
          font-weight: 600;
          color: #f8fafc;
          min-width: 150px;
          text-align: center;
        }

        .add-payday,
        .discover-bills {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .add-payday {
          background: #0ea5e9;
          color: white;
        }

        .add-payday:hover {
          background: #0284c7;
        }

        .discover-bills {
          background: #7c3aed;
          color: white;
        }

        .discover-bills:hover {
          background: #6d28d9;
        }

        .calendar-grid {
          background: #1e293b;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #334155;
        }

        .weekday {
          padding: 0.75rem;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: #94a3b8;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-day {
          min-height: 100px;
          padding: 0.5rem;
          border: 1px solid #334155;
          position: relative;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .calendar-day:hover {
          background: rgba(51, 65, 85, 0.5);
        }

        .calendar-day.empty {
          background: #0f172a;
          cursor: default;
        }

        .calendar-day.empty:hover {
          background: #0f172a;
        }

        .day-number {
          font-size: 0.875rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .calendar-event {
          margin-top: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .calendar-event:hover {
          opacity: 0.8;
        }

        .calendar-event.bill {
          background: #dc2626;
          color: white;
        }

        .calendar-event.payday {
          background: #10b981;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 0.75rem;
          padding: 2rem;
          min-width: 400px;
          max-width: 90vw;
        }

        .modal-content h3 {
          color: #f8fafc;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          color: #cbd5e1;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .form-group input {
          width: 100%;
          background: #0f172a;
          border: 1px solid #475569;
          border-radius: 0.375rem;
          padding: 0.75rem;
          color: #e2e8f0;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #0ea5e9;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .cancel-btn,
        .save-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #475569;
          color: #e2e8f0;
        }

        .cancel-btn:hover {
          background: #64748b;
        }

        .save-btn {
          background: #0ea5e9;
          color: white;
        }

        .save-btn:hover {
          background: #0284c7;
        }

        .event-details-modal {
          min-width: 450px;
        }

        .event-info {
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #334155;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row label {
          font-weight: 600;
          color: #cbd5e1;
        }

        .info-row span {
          color: #f8fafc;
        }

        .event-type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .event-type-badge.payday {
          background: #10b981;
        }

        .event-type-badge.bill {
          background: #dc2626;
        }

        .warning-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .warning-message p {
          margin: 0.25rem 0;
          color: #fca5a5;
          font-size: 0.875rem;
        }

        .warning-message strong {
          color: #ef4444;
        }

        .delete-btn {
          background: #dc2626;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .delete-btn:hover {
          background: #b91c1c;
        }

        @media (max-width: 768px) {
          .calendar-controls {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          
          .calendar-day {
            min-height: 80px;
          }

          .modal-content {
            min-width: 300px;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  )
}