const https = require('https');
const { URL } = require('url');

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzmT3j44JWPjfFJJ7o0rFHQ2gpqc2p3dbuT0TFfN1wHmYxAoizTiD1ftESIIF7YbozinQ/exec';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function requestWithRedirects(url, method, body, cookies = '', redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      return reject(new Error('Too many redirects'));
    }

    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: {
        'Content-Type': 'text/plain',
        ...(cookies ? { Cookie: cookies } : {}),
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      const setCookie = res.headers['set-cookie'];
      let newCookies = cookies;
      if (setCookie) {
        const cookieParts = setCookie.map((c) => c.split(';')[0]);
        newCookies = cookieParts.join('; ');
      }

      const status = res.statusCode;

      if (status >= 300 && status < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        req.destroy();
        return requestWithRedirects(redirectUrl, 'GET', null, newCookies, redirectCount + 1)
          .then(resolve)
          .catch(reject);
      }

      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          status: status,
          body: Buffer.concat(chunks).toString(),
        });
      });
    });

    req.on('error', reject);

    if (body && method === 'POST') {
      req.write(body);
    }

    req.end();
  });
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const query = req.url.split('?')[1] || '';
    const targetUrl = query ? `${APPS_SCRIPT_URL}?${query}` : APPS_SCRIPT_URL;

    let body = null;
    if (req.method === 'POST') {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    }

    const result = await requestWithRedirects(targetUrl, req.method, body);

    res.status(result.status).setHeader('Content-Type', 'application/json').send(result.body);
  } catch (err) {
    res.status(502).json({ success: false, error: 'Proxy error: ' + err.message });
  }
};
