const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

// Enable CORS for your frontend origin
app.use(cors({
  origin: ['http://localhost:8080', 'http://172.20.10.2:8080'],  // Allow both origins
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,X-DeepSeek-API-Key'
}));

app.use(express.json());

// Root endpoint for health check
app.get('/', (req, res) => {
  res.json({ status: 'Proxy server root endpoint' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ status: 'Proxy server is running!' });
});

// Add documentation endpoint for the DeepSeek API
app.get('/api/deepseek', (req, res) => {
  res.json({ 
    message: 'This endpoint requires a POST request with the following structure:',
    example: {
      headers: {
        'Content-Type': 'application/json',
        'X-DeepSeek-API-Key': 'your-api-key-here'
      },
      body: {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'system prompt'
          },
          {
            role: 'user',
            content: 'user text'
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      }
    }
  });
});

// Proxy endpoint for DeepSeek API
app.post('/api/deepseek', async (req, res) => {
  try {
    const deepseekApiKey = req.headers['x-deepseek-api-key'];
    if (!deepseekApiKey) {
      return res.status(400).json({ error: 'DeepSeek API key is required' });
    }

    console.log('Making request to DeepSeek API with body:', JSON.stringify(req.body, null, 2));

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...req.body,
        model: 'deepseek-chat' // Ensure the correct model name
      })
    });

    if (!response.ok) {
      const errorText = await response.text(); // Read response once
      console.error('DeepSeek API error:', errorText);
      return res.status(response.status).json({ error: 'DeepSeek API error', details: errorText });
    }

    const data = await response.json(); // Read response once

    // Log the response for debugging
    console.log('DeepSeek API Response:', JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request to DeepSeek API',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
  console.log(`Test the server at: http://localhost:${port}/test`);
});
