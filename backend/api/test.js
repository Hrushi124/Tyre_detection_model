// Simple test API
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple health check
  if (req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({ status: 'OK', message: 'Backend is working!' });
  }

  // Default response
  res.status(200).json({ 
    message: 'Tyre Detection API Server',
    status: 'Running',
    url: req.url,
    method: req.method
  });
};
