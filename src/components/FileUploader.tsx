import { useState } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'

interface FileUploaderProps {
  onDataExtracted: (debt: {
    name: string
    balance: number
    apr: number
    minimumPayment: number
  }) => void
}

export default function FileUploader({ onDataExtracted }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any[]>([])

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
    setProcessing(true)
    
    try {
      if (file.type === 'text/csv') {
        await processCSV(file)
      } else if (file.type.startsWith('image/')) {
        await processImage(file)
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      setProcessing(false)
    }
  }

  const processCSV = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const data = []
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''))
      if (columns.length >= 3) {
        const amount = parseFloat(columns[1]) || 0
        if (amount > 0) {
          data.push({
            description: columns[0] || `Item ${i}`,
            amount: amount
          })
        }
      }
    }
    
    setExtractedData(data)
  }

  const processImage = async (file: File) => {
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock extracted data from image
    const mockData = [
      { description: 'Credit Card Statement - Balance', amount: 2500.00 },
      { description: 'Minimum Payment Due', amount: 75.00 }
    ]
    
    setExtractedData(mockData)
  }

  const addAsDebt = (item: any) => {
    onDataExtracted({
      name: item.description,
      balance: item.amount,
      apr: 18.99, // Default APR
      minimumPayment: Math.max(25, item.amount * 0.02) // 2% minimum or $25
    })
  }

  return (
    <div className="file-uploader">
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv,image/*"
          onChange={handleFileInput}
          className="file-input"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="upload-label">
          {processing ? (
            <div className="processing">
              <div className="spinner"></div>
              <span>Processing file...</span>
            </div>
          ) : (
            <>
              <Upload className="upload-icon" />
              <div className="upload-text">
                <p><strong>Click to upload</strong> or drag and drop</p>
                <p className="upload-hint">CSV files or images (PNG, JPG)</p>
              </div>
            </>
          )}
        </label>
      </div>

      {extractedData.length > 0 && (
        <div className="extracted-data">
          <h4>
            <FileText className="section-icon" />
            Extracted Data
          </h4>
          <div className="data-list">
            {extractedData.map((item, index) => (
              <div key={index} className="data-item">
                <div className="item-info">
                  <span className="item-description">{item.description}</span>
                  <span className="item-amount">${item.amount.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => addAsDebt(item)}
                  className="add-debt-btn"
                >
                  Add as Debt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="upload-info">
        <AlertCircle className="info-icon" />
        <p>
          Upload bank statements, credit card bills, or CSV files containing your financial data.
          We'll extract debt information automatically.
        </p>
      </div>

      <style jsx>{`
        .file-uploader {
          space-y: 1rem;
        }

        .upload-zone {
          border: 2px dashed #d1d5db;
          border-radius: 0.75rem;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .upload-zone:hover,
        .upload-zone.drag-active {
          border-color: #667eea;
          background-color: rgba(102, 126, 234, 0.05);
        }

        .file-input {
          display: none;
        }

        .upload-label {
          cursor: pointer;
          display: block;
        }

        .upload-icon {
          width: 3rem;
          height: 3rem;
          color: #9ca3af;
          margin: 0 auto 1rem;
        }

        .upload-text p {
          margin: 0.25rem 0;
        }

        .upload-hint {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .processing {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .extracted-data {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 0.5rem;
        }

        .extracted-data h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #374151;
        }

        .section-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .data-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 0.375rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-description {
          font-weight: 500;
          color: #374151;
        }

        .item-amount {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .add-debt-btn {
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .add-debt-btn:hover {
          background: #5a67d8;
        }

        .upload-info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 0.5rem;
          margin-top: 1rem;
        }

        .info-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .upload-info p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}