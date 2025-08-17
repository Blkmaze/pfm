import React, { useState, useRef } from 'react'
import { Upload, Calendar, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface PaystubData {
  file: File | null
  payDate: string
  netPay: string
  grossPay: string
  employer: string
}

interface PaystubUploaderProps {
  onPaystubSaved: (data: PaystubData) => void
}

export default function PaystubUploader({ onPaystubSaved }: PaystubUploaderProps) {
  const [paystubData, setPaystubData] = useState<PaystubData>({
    file: null,
    payDate: '',
    netPay: '',
    grossPay: '',
    employer: ''
  })
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFile = (file: File) => {
    setError(null)
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or PDF file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setPaystubData(prev => ({ ...prev, file }))
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (field: keyof PaystubData, value: string) => {
    setPaystubData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!paystubData.file) {
      setError('Please select a paystub file')
      return false
    }
    if (!paystubData.payDate) {
      setError('Please enter the pay date')
      return false
    }
    if (!paystubData.netPay) {
      setError('Please enter the net pay amount')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setUploading(true)
    setError(null)

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Call the parent callback
      onPaystubSaved(paystubData)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
      // Reset form
      setPaystubData({
        file: null,
        payDate: '',
        netPay: '',
        grossPay: '',
        employer: ''
      })
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (err) {
      setError('Failed to save paystub. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="paystub-uploader">
      <div className="card-header">
        <h2>Add Paystub Screenshot</h2>
        <div className="file-types">JPG PNG PDF</div>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${paystubData.file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileInput}
          className="file-input"
        />
        
        {paystubData.file ? (
          <div className="file-selected">
            <FileText className="file-icon" />
            <div className="file-info">
              <p className="file-name">{paystubData.file.name}</p>
              <p className="file-size">{formatFileSize(paystubData.file.size)}</p>
            </div>
            <button onClick={handleBrowseClick} className="change-file-btn">
              Change File
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <Upload className="upload-icon" />
            <p>
              <strong>Drag & drop</strong> paystub here or{' '}
              <button onClick={handleBrowseClick} className="browse-btn">
                Browse
              </button>
            </p>
            <p className="upload-subtitle">JPG, PNG, or PDF files up to 10MB</p>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="paystub-form">
        <div className="form-row">
          <div className="form-group">
            <label>
              <Calendar size={16} />
              Pay Date *
            </label>
            <input
              type="date"
              value={paystubData.payDate}
              onChange={(e) => handleInputChange('payDate', e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <DollarSign size={16} />
              Net Pay * ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paystubData.netPay}
              onChange={(e) => handleInputChange('netPay', e.target.value)}
              className="form-input"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <DollarSign size={16} />
              Gross Pay ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paystubData.grossPay}
              onChange={(e) => handleInputChange('grossPay', e.target.value)}
              className="form-input"
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group">
            <label>Employer</label>
            <input
              type="text"
              value={paystubData.employer}
              onChange={(e) => handleInputChange('employer', e.target.value)}
              className="form-input"
              placeholder="Company name"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={uploading}
          className={`save-paystub-btn ${uploading ? 'uploading' : ''}`}
        >
          {uploading ? (
            <>
              <div className="spinner"></div>
              Saving Paystub...
            </>
          ) : (
            <>
              <Upload size={16} />
              Save Paystub
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="status-message error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {saved && (
        <div className="status-message success">
          <CheckCircle size={16} />
          Paystub saved successfully! File stored and payday event created.
        </div>
      )}

      {/* Help Text */}
      <div className="help-text">
        <p>We'll store the file and create a payday event in your calendar.</p>
        <p>Supported formats: JPG, PNG, PDF • Maximum size: 10MB</p>
      </div>

      <style jsx>{`
        .paystub-uploader {
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
          padding: 2rem;
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

        .upload-zone.has-file {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
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
          width: 2.5rem;
          height: 2.5rem;
          color: #64748b;
        }

        .upload-prompt p {
          margin: 0;
          color: #cbd5e1;
        }

        .browse-btn {
          background: none;
          border: none;
          color: #0ea5e9;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 500;
        }

        .browse-btn:hover {
          color: #0284c7;
        }

        .upload-subtitle {
          font-size: 0.875rem;
          color: #64748b;
        }

        .file-selected {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0.5rem;
        }

        .file-icon {
          width: 2rem;
          height: 2rem;
          color: #10b981;
        }

        .file-info {
          flex: 1;
          text-align: left;
        }

        .file-name {
          font-weight: 500;
          color: #f8fafc;
          margin-bottom: 0.25rem;
        }

        .file-size {
          font-size: 0.875rem;
          color: #94a3b8;
          margin: 0;
        }

        .change-file-btn {
          background: #1e293b;
          border: 1px solid #475569;
          color: #cbd5e1;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .change-file-btn:hover {
          background: #334155;
        }

        .paystub-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .form-input {
          background: #1e293b;
          border: 2px solid #475569;
          border-radius: 0.375rem;
          padding: 0.75rem;
          color: #e2e8f0;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #0ea5e9;
        }

        .form-input:invalid {
          border-color: #ef4444;
        }

        .save-paystub-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        .save-paystub-btn:hover:not(:disabled) {
          background: #0284c7;
          transform: translateY(-1px);
        }

        .save-paystub-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .save-paystub-btn.uploading {
          background: #64748b;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
        }

        .status-message.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .help-text {
          padding: 1rem;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 0.5rem;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .help-text p {
          margin: 0.25rem 0;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .upload-zone {
            padding: 1.5rem;
          }
          
          .file-selected {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}