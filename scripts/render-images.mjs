// Renders static/og.png (1200x630 share image) and static/apple-touch-icon.png.
// Dev-only: needs Playwright, which the Netlify build does not.
//   node scripts/render-images.mjs
// Kept free of ratings and counts so the image never goes stale.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const { platforms } = JSON.parse(readFileSync(new URL('../data/platforms.json', import.meta.url), 'utf8'));
const names = [...platforms].sort((a, b) => (b.count ?? -1) - (a.count ?? -1)).map((p) => p.name);

const fonts = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Newsreader:ital,opsz,wght@0,6..72,500;1,6..72,500&family=Plus+Jakarta+Sans:wght@600&display=block';
const og = `<!doctype html><html><head><link rel="stylesheet" href="${fonts}"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0b0c0f;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow:hidden;padding:72px 80px}
body::before{content:"";position:absolute;inset:0;background:radial-gradient(760px 420px at 88% -8%,rgba(189,12,12,.45),transparent 65%)}
body::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse at 75% 25%,#000 10%,transparent 70%)}
.c{position:relative;z-index:1;height:100%;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px;font-size:26px}
.mark{width:48px;height:48px;border-radius:12px;background:#bd0c0c;display:grid;place-items:center;font-family:Newsreader,serif;font-size:32px}
.brand small{font-family:'IBM Plex Mono',monospace;font-size:18px;letter-spacing:.1em;color:#c8ced8;padding-left:16px;border-left:1px solid rgba(255,255,255,.2)}
h1{font-family:Newsreader,serif;font-weight:500;font-size:96px;line-height:1;letter-spacing:-.035em;margin-top:auto}
h1 i{color:#c8ced8}
p{margin-top:28px;font-family:'IBM Plex Mono',monospace;font-size:20px;letter-spacing:.04em;color:#c8ced8}
</style></head><body><div class="c">
<div class="brand"><span class="mark">G</span>Griffin Funding<small>REVIEWS</small></div>
<h1>Griffin Funding reviews,<br><i>all in one place.</i></h1>
<p>${names.join(' · ')}</p>
</div></body></html>`;
const icon = `<!doctype html><html><head><link rel="stylesheet" href="${fonts}"><style>*{margin:0}body{width:180px;height:180px;background:#bd0c0c;display:grid;place-items:center;color:#fff;font-family:Newsreader,serif;font-size:124px;line-height:1}</style></head><body>G</body></html>`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const [html, w, h, out] of [[og, 1200, 630, 'og.png'], [icon, 180, 180, 'apple-touch-icon.png']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  if (process.env.FONT_PROXY_CURL) {
    const { execFileSync } = await import('node:child_process');
    await page.route(/fonts\.(googleapis|gstatic)\.com/, async (r) => {
      const u = r.request().url();
      const body = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 Chrome/130', u], { maxBuffer: 1e8 });
      await r.fulfill({ body, contentType: u.includes('googleapis') ? 'text/css' : 'font/woff2', headers: { 'access-control-allow-origin': '*' } });
    });
  }
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../static/${out}`, import.meta.url).pathname });
  console.log(`Wrote static/${out}`);
}
await browser.close();
