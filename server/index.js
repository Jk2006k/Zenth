const express =require('express')
const cors = require('cors')
const PORT=process.env.PORT || 3000
const multer=require('multer')
const fs=require('fs')
const path=require('path')
const pdfParser=require('pdf-parser')
require('dotenv').config()

const app=express()
app.use(cors())
app.use(express.json())

const upload =multer({dest:'uploads/'})

app.post('/upload',upload.single('pdf'),async(req,res)=>{
    try{
        const fileData=fs.readFileSync(req.file.path)
        const parsed=await pdfParser(fileData)
        fs.unlinkSync(req.file.path)

        res.json({text:parsed.text})
    }catch(err){
        console.error('Error processing PDF:', err)
        res.status(500).json({error:'Failed to process PDF'})
    }
})

app.get('/',(req,res)=>{
    try{
        res.send('Welcome to the PDF Processing API')
    }catch(error){
        res.status(500).send('Error loading the API')
    }
})      

app.listen(PORT,()=>{
    try{
        console.log(`Server is running on port ${PORT}`)
    }catch(error){
        console.error('Error starting server:', error)
    }
})

