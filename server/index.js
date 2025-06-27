const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const pdfParse = require('pdf-parse')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const upload = multer({ dest: 'uploads/' })

app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const fileData = fs.readFileSync(req.file.path)
    const parsed = await pdfParse(fileData)
    fs.unlinkSync(req.file.path)
    res.json({ text: parsed.text })
  } catch (err) {
    res.status(500).json({ error: 'Failed to process PDF' })
  }
})

app.post('/generate-questions', async (req, res) => {
  const { text, type } = req.body
  if (!text) return res.status(400).json({ error: 'No text provided' })

  try {
    let prompt = `Extract 5 ${type || 'academic'} questions from the following text:\n---\n${text}\n---\n`

    if (type === 'MCQ') {
      prompt += `Respond in this format:\n1. Question?\n  a) Option A\n  b) Option B\n  c) Option C\n  d) Option D\nAnswer: b)`
    } else if (type === 'True/False') {
      prompt += `Respond as:\n1. Statement (True/False)?`
    } else {
      prompt += `Respond as:\n1. What is ...?\n2. Why ...?\n3. Describe ...`
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const data = await response.json()
    if (!data || !data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      return res.status(500).json({ error: 'Invalid response from Gemini API' })
    }

    res.json({ questions: data.candidates[0].content.parts[0].text })
  } catch (err) {
    console.error('Gemini API Error:', err)
    res.status(500).json({ error: 'Failed to generate questions', details: err.message })
  }
})

app.get('/', (req, res) => {
  res.send('Welcome to the PDF Processing & Question Generator API')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
