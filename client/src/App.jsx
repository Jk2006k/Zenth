import React, { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [questions, setQuestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [fileName, setFileName] = useState('')
  const [questionType, setQuestionType] = useState('Subjective')
  const fileInputRef = useRef(null)
  const resultRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('pdf', file)

    try {
      setLoading(true)
      const response = await axios.post('https://zenth-igjk.onrender.com/upload', formData)
      setExtractedText(response.data.text)
      setQuestions('')
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      console.error('Error uploading PDF:', error)
      alert('Failed to extract PDF content.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQuestions = async () => {
    if (!extractedText) return
    try {
      setGenerating(true)
      const response = await axios.post('https://zenth-igjk.onrender.com/generate-questions', {
        text: extractedText,
        type: questionType
      })
      setQuestions(response.data.questions)
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Failed to generate questions.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type === 'application/pdf') {
      setFile(files[0])
      setFileName(files[0].name)
      fileInputRef.current.files = files
    }
  }

  return (
    <div className="app">
      <div className="particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className="container">
        <div className="header">
          <h1 className="logo">Zenth</h1>
          <p className="subtitle">AI PDF Text + Question Generator</p>
        </div>

        <div className="upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div
            className={`file-drop-zone ${fileName ? 'file-selected' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="file-icon">📄</div>
            <div className="file-text">
              {fileName ? `Selected: ${fileName}` : 'Drop PDF here or click to upload'}
            </div>
          </div>

          <button className="upload-btn" onClick={handleUpload} disabled={!file || loading}>
            {loading ? 'Processing PDF...' : 'Extract Text'}
          </button>

          {loading && (
            <div className="loading">
              <div className="loading-text">⏳ Processing PDF...</div>
            </div>
          )}

          {extractedText && !loading && (
            <div className="result" ref={resultRef}>
              <h3 className="result-title">Extracted Text</h3>
              <textarea
                readOnly
                value={extractedText}
                placeholder="Extracted text appears here..."
              />

              <div style={{ margin: '20px 0' }}>
                <label htmlFor="questionType" style={{ marginRight: '10px' }}>Select Question Type:</label>
                <select
                  id="questionType"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    background: '#1a1a2e',
                    color: '#fff'
                  }}
                >
                  <option value="Subjective">Subjective</option>
                  <option value="MCQ">MCQ</option>
                  <option value="True/False">True/False</option>
                </select>
              </div>

              <button
                className="upload-btn"
                style={{ marginTop: '20px' }}
                onClick={handleGenerateQuestions}
                disabled={generating}
              >
                {generating ? 'Generating Questions...' : 'Generate Questions'}
              </button>
            </div>
          )}

          {questions && !generating && (
            <div className="result" style={{ marginTop: '30px' }}>
              <h3 className="result-title">AI-Generated Questions</h3>
              <textarea readOnly value={questions} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
