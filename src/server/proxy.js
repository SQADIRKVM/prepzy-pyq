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

// Health check for proxy endpoint
app.get('/api/proxy/test', async (req, res) => {
  try {
    const testUrl = 'http://202.88.225.92';
    console.log('Testing proxy with:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    res.json({
      status: 'Proxy test successful',
      targetUrl: testUrl,
      responseStatus: response.status,
      responseOk: response.ok
    });
  } catch (error) {
    res.status(500).json({
      status: 'Proxy test failed',
      error: error.message
    });
  }
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

// Proxy endpoint for fetching external URLs (for KTU DSpace)
app.get('/api/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    const intent = req.query.intent === 'download' ? 'download' : 'preview';
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log('Proxying request to:', url);

    // Decode URL if needed
    let decodedUrl = decodeURIComponent(url);
    
    // Special handling for Google Drive links
    const isGoogleDrive = decodedUrl.includes('drive.google.com');
    
    // Special handling for GitHub raw URLs (both github.com/.../raw/ and raw.githubusercontent.com)
    const isGitHubRaw = (decodedUrl.includes('github.com') && decodedUrl.includes('/raw/')) || 
                        decodedUrl.includes('raw.githubusercontent.com');
    
    if (isGoogleDrive) {
      // For Google Drive, use a cookie to bypass the virus scan warning
      // Add confirm parameter to skip the warning page
      if (decodedUrl.includes('uc?export=download')) {
        // Already a direct download link, but might need to add confirm parameter
        if (!decodedUrl.includes('confirm=')) {
          // Extract file ID
          const fileIdMatch = decodedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            // Use the direct download format with confirm parameter
            decodedUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
          }
        }
      }
    }
    
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': isGoogleDrive ? 'application/pdf,*/*;q=0.9' : (isGitHubRaw ? 'application/pdf,*/*;q=0.9' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'),
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': isGoogleDrive ? 'https://drive.google.com/' : (isGitHubRaw ? 'https://github.com/' : 'https://www.ktunotes.in/'),
        'Sec-Fetch-Dest': isGoogleDrive ? 'document' : (isGitHubRaw ? 'document' : 'document'),
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site'
      },
      redirect: 'follow',
      follow: 10 // Follow up to 10 redirects
    };
    
    let response = await fetch(decodedUrl, fetchOptions);

    // Handle Google Drive responses differently based on intent
    if (isGoogleDrive && response.ok) {
      const contentType = response.headers.get('content-type') || '';
      
      // For preview intent with /preview URLs, Google Drive returns HTML embed page
      // Just proxy it through as-is (don't try to extract download links)
      if (intent === 'preview' && decodedUrl.includes('/preview')) {
        // Preview URLs return HTML that embeds the PDF viewer
        // Just pass it through
        const html = await response.text();
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(html);
      }
      
      // For download intent or non-preview URLs, handle virus scan warnings
      if (intent === 'download' && contentType.includes('text/html')) {
        console.log('Google Drive returned HTML (virus scan warning), extracting download link...');
        const html = await response.text();
        
        // Look for the actual download link in the HTML
        const downloadLinkMatch = html.match(/href="([^"]*uc[^"]*export=download[^"]*)"/);
        if (downloadLinkMatch) {
          let downloadUrl = downloadLinkMatch[1];
          if (downloadUrl.startsWith('/')) {
            downloadUrl = `https://drive.google.com${downloadUrl}`;
          }
          console.log('Found download link in HTML:', downloadUrl);
          response = await fetch(downloadUrl, fetchOptions);
        } else {
          // Try alternative: look for form action
          const formActionMatch = html.match(/action="([^"]*uc[^"]*export=download[^"]*)"/);
          if (formActionMatch) {
            let downloadUrl = formActionMatch[1];
            if (downloadUrl.startsWith('/')) {
              downloadUrl = `https://drive.google.com${downloadUrl}`;
            }
            console.log('Found form action download link:', downloadUrl);
            response = await fetch(downloadUrl, fetchOptions);
          }
        }
      }
    }

    if (!response.ok) {
      console.error(`Proxy fetch failed: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `Failed to fetch: ${response.statusText}`,
        status: response.status
      });
    }

    // Determine content type
    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    const upstreamDisposition = response.headers.get('content-disposition');
    
    // For GitHub raw URLs, detect PDF from URL extension if content-type is generic
    if (isGitHubRaw && contentType === 'application/octet-stream' && decodedUrl.toLowerCase().endsWith('.pdf')) {
      contentType = 'application/pdf';
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (intent === 'download') {
      if (upstreamDisposition) {
        res.setHeader('Content-Disposition', upstreamDisposition);
      } else {
        res.setHeader('Content-Disposition', 'attachment');
      }
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    // For PDFs or binary content, stream the binary data
    if (contentType.includes('application/pdf') || 
        contentType.includes('application/octet-stream') ||
        isGoogleDrive ||
        (isGitHubRaw && decodedUrl.toLowerCase().endsWith('.pdf'))) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    }

    // For HTML/text, send as text
    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
