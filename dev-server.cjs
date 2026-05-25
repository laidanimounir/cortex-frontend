const http = require('http');
const fs = require('fs');
const path = require('path');

function wrapRes(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  return res;
}

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

async function start() {
  const chatHandler = require('./api/chat.cjs');
  const searchHandler = require('./api/search.cjs');

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.error('Raw body received:', body);
      try {
        req.body = JSON.parse(body);
        console.error('Parsed body:', JSON.stringify(req.body));
      } catch (e) {
        console.error('Parse error:', e.message);
        req.body = {};
      }

      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname === '/search') {
        searchHandler(req, wrapRes(res));
      } else {
        chatHandler(req, wrapRes(res));
      }
    });
  });

  server.listen(3001, () => {
    console.log('API dev server running on http://localhost:3001');
  });
}

start().catch(console.error);
