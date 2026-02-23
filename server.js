const express = require('express');
const session = require('express-session');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Auth credentials from env vars (defaults for local dev)
const AUTH_USER = process.env.AUTH_USER || 'exacaster';
const AUTH_PASS = process.env.AUTH_PASS || 'opencvm2024';
const SESSION_SECRET = process.env.SESSION_SECRET || 'opencvm-dev-secret-change-me';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Static files (public assets — no auth required for CSS/JS/images)
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  // Allow PDF template to load without auth (Puppeteer internal)
  if (req.path === '/pdf-template') return next();
  res.redirect('/login');
}

// --- Auth routes (no auth required) ---

app.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === AUTH_USER && password === AUTH_PASS) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login?error=1');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// --- Protected routes ---

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/calculating', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'calculating.html'));
});

app.get('/results', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'results.html'));
});

// Internal route for Puppeteer to load the PDF template
app.get('/pdf-template', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pdf-template.html'));
});

// --- PDF generation ---

let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return browser;
}

app.get('/api/pdf', requireAuth, async (req, res) => {
  try {
    const params = req.query;
    const company = params.company || 'Client';

    const b = await getBrowser();
    const page = await b.newPage();

    // Navigate to the PDF template served by our own server
    const templateUrl = `http://localhost:${PORT}/pdf-template`;
    await page.goto(templateUrl, { waitUntil: 'networkidle0', timeout: 15000 });

    // Convert logos to base64 data URIs for embedding in PDF
    const fs = require('fs');
    const opencvmSvg = fs.readFileSync(path.join(__dirname, 'public', 'img', 'opencvm-logo.svg')).toString('base64');
    const opencvmDataUri = `data:image/svg+xml;base64,${opencvmSvg}`;
    const exaLogo = fs.readFileSync(path.join(__dirname, 'public', 'img', 'exacaster-logo-white.png')).toString('base64');
    const exaDataUri = `data:image/png;base64,${exaLogo}`;

    // Inject params and render
    await page.evaluate((p, logo, footerLogo) => {
      window.__PARAMS__ = p;
      window.__LOGO_PATH__ = logo;
      window.__FOOTER_LOGO__ = footerLogo;
      renderAll();
    }, params, opencvmDataUri, exaDataUri);

    // Wait for rendering to complete
    await page.waitForFunction(() => {
      return document.getElementById('summaryCards').innerHTML.length > 0 &&
             document.getElementById('tcoChart').innerHTML.length > 0;
    }, { timeout: 5000 });

    // Small delay for fonts to load
    await new Promise(r => setTimeout(r, 500));

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
    });

    await page.close();

    const safeName = company.replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="OpenCVM_Pricing_${safeName}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed', details: err.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (browser) await browser.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`OpenCVM Pricing Calculator running on http://localhost:${PORT}`);
  console.log(`Login: ${AUTH_USER} / ${AUTH_PASS}`);
});
