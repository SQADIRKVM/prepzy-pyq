// Vercel serverless function for proxying external URLs
// This allows fetching from external sites that have CORS restrictions

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = req.query.url;
    const intent = req.query.intent === 'download' ? 'download' : 'preview';
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Decode the URL
    let decodedUrl = decodeURIComponent(url);
    console.log('Proxying request to:', decodedUrl);

    // Special handling for Google Drive links
    const isGoogleDrive = decodedUrl.includes('drive.google.com');
    
    // Special handling for GitHub raw URLs (both github.com/.../raw/ and raw.githubusercontent.com)
    const isGitHubRaw = (decodedUrl.includes('github.com') && decodedUrl.includes('/raw/')) || 
                        decodedUrl.includes('raw.githubusercontent.com');
    
    if (isGoogleDrive) {
      // For Google Drive, add confirm parameter to skip the warning page
      if (decodedUrl.includes('uc?export=download')) {
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

    // Fetch the URL
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': isGoogleDrive ? 'application/pdf,*/*;q=0.9' : (isGitHubRaw ? 'application/pdf,*/*;q=0.9' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'),
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': isGoogleDrive ? 'https://drive.google.com/' : (isGitHubRaw ? 'https://github.com/' : 'https://www.ktunotes.in/')
      },
      redirect: 'follow'
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
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (intent === 'download') {
      if (upstreamDisposition) {
        res.setHeader('Content-Disposition', upstreamDisposition);
      } else {
        res.setHeader('Content-Disposition', 'attachment');
      }
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // For PDFs or binary content, return the binary data
    if (contentType.includes('application/pdf') || 
        contentType.includes('application/octet-stream') ||
        isGoogleDrive ||
        (isGitHubRaw && decodedUrl.toLowerCase().endsWith('.pdf'))) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    }

    // For HTML/text, return as text
    const text = await response.text();
    return res.send(text);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy request',
      details: error.message
    });
  }
}

