// Generates per-project share pages (p/<id>/index.html) with their own Open Graph card (assets/og/<id>.png).
// Social crawlers read the OG tags; browsers are redirected to the project modal in the portfolio.
//   node tools/share-pages.mjs
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const w = {}; globalThis.window = w; await import(pathToFileURL(resolve(site, 'js/data.js')).href);
const D = w.PORTFOLIO;
const live = { loca: 'https://web-production-202cdf.up.railway.app/', cashnt: 'https://apps.apple.com/app/id6789244062' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const card = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0b0d0c;font-family:Inter,sans-serif;color:#eef2ee}
.bg{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.045) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse 80% 90% at 40% 50%,#000 30%,transparent 100%)}
.glow{position:absolute;left:-200px;top:-200px;width:900px;height:900px;border-radius:50%;background:radial-gradient(closest-side,${p.accent}44,transparent 70%);filter:blur(40px)}
.wrap{position:absolute;left:72px;top:0;height:630px;width:${p.frame === 'browser' ? 480 : 640}px;display:flex;flex-direction:column;justify-content:center;gap:18px}
.top{display:flex;align-items:center;gap:16px}
.top img{width:64px;height:64px;border-radius:16px;border:1px solid rgba(255,255,255,.14)}
.kicker{font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${p.accent}}
h1{margin:0;font-family:'Inter Tight',sans-serif;font-weight:800;font-size:74px;letter-spacing:-.045em;line-height:1}
.sub{font-size:21px;color:#a6b0a8;line-height:1.45}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-family:'JetBrains Mono',monospace;font-size:12.5px;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.14);color:#a6b0a8;background:rgba(255,255,255,.03)}
.chip.a{border-color:${p.accent}88;color:${p.accent}}
.url{position:absolute;left:72px;bottom:40px;font-family:'Inter Tight',sans-serif;font-weight:700;font-size:20px;display:flex;align-items:center;gap:10px}
.url i{width:8px;height:8px;border-radius:50%;background:#3ee39a;box-shadow:0 0 14px #3ee39a}
.by{position:absolute;right:72px;bottom:40px;font-size:15px;color:#6b756d}
.phones{position:absolute;right:40px;top:50px;width:430px;height:630px}
.ph{position:absolute;aspect-ratio:390/844;border-radius:30px;background:#050605;padding:6px;box-shadow:0 30px 60px rgba(0,0,0,.65),inset 0 0 0 1px rgba(255,255,255,.16);overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:24px}
.p1{width:230px;left:110px;top:10px;z-index:3}.p2{width:190px;left:-10px;top:90px;transform:rotate(-9deg);filter:brightness(.75)}
.browser{position:absolute;right:50px;top:120px;width:500px;border-radius:14px;background:#0a0c0b;box-shadow:0 30px 60px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.14);overflow:hidden}
.browser b{display:block;height:28px;background:#141715;border-bottom:1px solid rgba(255,255,255,.08)}
.browser img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top}
</style></head><body><div class="bg"></div><div class="glow"></div>
<div class="wrap">
  <div class="top"><img src="${pathToFileURL(resolve(site, p.icon)).href}"><div class="kicker">${esc(p.kicker)}</div></div>
  <h1>${esc(p.name)}</h1>
  <div class="sub">${esc(p.summary)}</div>
  <div class="chips">${(p.skills || p.stack).slice(0, 5).map((s, i) => `<span class="chip${i === 0 ? ' a' : ''}">${esc(s)}</span>`).join('')}</div>
</div>
${p.frame === 'browser'
  ? `<div class="browser"><b></b><img src="${pathToFileURL(resolve(site, p.cover)).href}"></div>`
  : `<div class="phones">${p.gallery[1] ? `<div class="ph p2"><img src="${pathToFileURL(resolve(site, p.gallery[1])).href}"></div>` : ''}<div class="ph p1"><img src="${pathToFileURL(resolve(site, p.cover)).href}"></div></div>`}
<div class="url"><i></i>alexuskarljoaquin.com</div><div class="by">Built solo by Alexus Karl Joaquin</div>
</body></html>`;

const page = (p) => {
  const url = `https://alexuskarljoaquin.com/p/${p.id}/`;
  const target = `/#project-${p.id}`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.name)} — ${esc(p.kicker)}</title>
<meta name="description" content="${esc(p.summary)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.name)} — ${esc(p.kicker)}">
<meta property="og:description" content="${esc(p.summary)} Built solo by Alexus Karl Joaquin.">
<meta property="og:image" content="https://alexuskarljoaquin.com/assets/og/${p.id}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.name)}"><meta name="twitter:image" content="https://alexuskarljoaquin.com/assets/og/${p.id}.png">
<script>location.replace(${JSON.stringify(target)});</script>
<style>body{background:#0b0d0c;color:#a6b0a8;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0}a{color:#3ee39a}</style>
</head><body><p>Opening ${esc(p.name)}… <a href="${target}">continue</a>${live[p.id] ? ` · <a href="${live[p.id]}">open the live app</a>` : ''}</p></body></html>`;
};

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of D.projects) {
  if (p.id === 'bananas') continue;
  const tmp = resolve(site, 'assets/og', `${p.id}.html`);
  writeFileSync(tmp, card(p));
  await tab.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready); await tab.waitForTimeout(600);
  await tab.screenshot({ path: resolve(site, 'assets/og', `${p.id}.png`), clip: { x: 0, y: 0, width: 1200, height: 630 } });
  mkdirSync(resolve(site, 'p', p.id), { recursive: true });
  writeFileSync(resolve(site, 'p', p.id, 'index.html'), page(p));
  console.log('ok', p.id);
}
await browser.close();
