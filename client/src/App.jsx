import React ,{useState} from 'react';
import axios from 'axios';
import 'App.css'

function App() {
  const [file,setfile]=useState(null)
  const [extractedText,setExtractedText]=useState('')
  const [loading,setLoading]=useState(false)

  const handleFileChange = (e) => {
    setfile(e.target.files[0]);
  };
  const handleUpload = async () => {
    if (!file){
      alert('Please select a Pdf')
    }
    const formData = new FormData()
    formData.append('pdf', file)

    try{
      setLoading(true)
      const response =await axios.post('/upload',formData)
      setExtractedText(response.data.text)
    }catch(error){
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    }finally{
      setLoading(false)
      }
  }
  return(
    <div className="container">
      <h2>PDF to Question Generator</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Extract</button>

      {loading && <p>Extracting text...</p>}

      {extractedText && (
        <div className="result">
          <h3>Extracted Text</h3>
          <textarea value={extractedText} readOnly rows={20} />
        </div>
      )}
    </div>
  )

}

export default App;