const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Middleware
app.use(cors());
app.use(express.json());

// GitHub API token (you should store this in environment variables in production)
const GITHUB_TOKEN = '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';

// API endpoint for file uploads to GitHub
app.post('/api/github/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.body.path;
    const commitMessage = req.body.message || `Upload file: ${req.file.originalname}`;
    
    // Read file as base64
    const fileContent = fs.readFileSync(req.file.path);
    const encodedContent = Buffer.from(fileContent).toString('base64');
    
    // Construct the GitHub API URL
    // The filePath should be in the format: owner/repo/contents/path/to/file
    const pathParts = filePath.split('/');
    
    if (pathParts.length < 4) {
      return res.status(400).json({ message: 'Invalid file path format' });
    }
    
    const owner = pathParts[0];
    const repo = pathParts[1];
    const contentPath = pathParts.slice(3).join('/');
    
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${contentPath}`;
    
    // Check if file already exists to get its SHA
    let existingSha = null;
    try {
      const fileCheck = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (fileCheck.status === 200 && fileCheck.data.sha) {
        existingSha = fileCheck.data.sha;
      }
    } catch (error) {
      // File doesn't exist, which is fine for new uploads
      if (error.response && error.response.status !== 404) {
        throw error;
      }
    }
    
    // Prepare request payload
    const payload = {
      message: commitMessage,
      content: encodedContent,
      committer: {
        name: 'DSACE LMS Bot',
        email: 'lms-bot@dsace.edu'
      }
    };
    
    // If file exists, include its SHA for update
    if (existingSha) {
      payload.sha = existingSha;
    }
    
    // Upload file to GitHub
    const response = await axios.put(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    });
    
    // Delete temporary file
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({
      message: 'File uploaded successfully',
      data: response.data
    });
    
  } catch (error) {
    console.error('Error uploading file to GitHub:', error);
    
    // Clean up temporary file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to upload file to GitHub',
      error: error.message
    });
  }
});

// API endpoint to check server status
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`GitHub upload server running on port ${PORT}`);
});