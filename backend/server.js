const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// API endpoint for checking currency authenticity
app.post('/api/check-currency', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imagePath = req.file.path;

  // Call Python script for currency detection
  const pythonProcess = spawn('python', ['../ai-model/currency_detector.py', imagePath]);

  let pythonResult = '';
  let pythonError = '';

  pythonProcess.stdout.on('data', (data) => {
    pythonResult += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    pythonError += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
      console.error(`Error: ${pythonError}`);
      return res.status(500).json({ error: 'Failed to analyze currency' });
    }

    try {
      // Extract JSON from the output (last line should be JSON)
      const lines = pythonResult.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      
      const result = JSON.parse(lastLine);
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing Python result:', parseError);
      console.error('Raw Python output:', pythonResult);
      res.status(500).json({ error: 'Invalid response from analysis engine' });
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Currency detector backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});