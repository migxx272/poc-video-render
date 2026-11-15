import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = path.dirname(url.fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'frames');
const FPS = 24;
const FRAMES = parseInt(process.env.FRAMES || '240', 10);
const START = parseInt(process.env.START_FRAME || '0', 10);
const PORT = parseInt(process.env.PORT || '8931', 10);

fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(ROOT, rel === '/' ? 'scene/index.html' : rel);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    // WebGL 100% por software, independente de GPU da máquina:
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
page.on('console', (m) => console.log('[browser]', m.text()));
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });

const t0 = Date.now();
for (let i = START; i < START + FRAMES; i++) {
  await page.evaluate((i) => window.tick(i), i);
  await page.screenshot({ path: path.join(OUT, `f_${String(i).padStart(5, '0')}.png`), type: 'png' });
  if (i % 24 === 0) {
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`frame ${i}/${START + FRAMES} (${dt}s, ${(i > 0 ? (Date.now() - t0) / 1000 / (i - START + 1) : 0).toFixed(3)}s/frame)`);
  }
}

await browser.close();
server.close();
console.log(`OK: ${FRAMES} frames em ${OUT}`);
