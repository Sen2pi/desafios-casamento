const https = require('https');
const { URL } = require('url');

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwAwmWKzns_yfVwj9cn7xCGPvv8PVeT_GDtOO0TrNWpXNpgvaadGB50QbBrJeP9F5M6Vw/exec';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function forward(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = req.url.split('?')[1] || '';
  const targetUrl = query ? `${APPS_SCRIPT_URL}?${query}` : APPS_SCRIPT_URL;
  const target = new URL(targetUrl);

  const options = {
    hostname: target.hostname,
    path: target.pathname + target.search,
    method: req.method,
    headers: {
      'Content-Type': req.headers['content-type'] || 'text/plain',
    },
    redirect: 'follow',
  };

  const proxyReq = https.request(options, (proxyRes) => {
    const chunks = [];
    proxyRes.on('data', (c) => chunks.push(c));
    proxyRes.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      res.status(proxyRes.statusCode).send(body);
    });
  });

  proxyReq.on('error', (err) => {
    res.status(502).json({ success: false, error: 'Proxy error: ' + err.message });
  });

  if (req.method === 'POST' && req.body) {
    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    proxyReq.write(bodyData);
  }

  proxyReq.end();
}

module.exports = (req, res) => forward(req, res);
module.exports.default = forward;
