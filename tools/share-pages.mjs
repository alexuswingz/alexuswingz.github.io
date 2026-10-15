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
  const links = [];
  if (live[p.id]) links.push({ href: live[p.id], label: p.id === 'cashnt' ? 'View on the App Store' : 'Open the live app', primary: true });
  links.push({ href: `/#project-${p.id}`, label: p.demo.kind === 'embed' ? 'Try the live demo in the portfolio' : 'See it in the portfolio', primary: !live[p.id] });
  if (p.repoPublic && p.repo) links.push({ href: p.repo, label: 'Source code on GitHub' });
  const ld = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: p.name, url, description: p.summary, image: `https://alexuskarljoaquin.com/assets/og/${p.id}.png`,
    applicationCategory: p.id === 'cashnt' ? 'FinanceApplication' : 'MobileApplication', author: { '@type': 'Person', name: 'Alexus Karl Joaquin', url: 'https://alexuskarljoaquin.com' } };
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.name)} — ${esc(p.kicker)} | Alexus Karl Joaquin</title>
<meta name="description" content="${esc(p.summary)} Designed, built and deployed solo by Alexus Karl Joaquin.">
<link rel="canonical" href="${url}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.name)} — ${esc(p.kicker)}">
<meta property="og:description" content="${esc(p.summary)} Built solo by Alexus Karl Joaquin.">
<meta property="og:image" content="https://alexuskarljoaquin.com/assets/og/${p.id}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.name)}"><meta name="twitter:image" content="https://alexuskarljoaquin.com/assets/og/${p.id}.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css"><link rel="stylesheet" href="/css/motion.css">
<style>.pp{padding:110px 0 80px}.pp .hero-img{width:100%;border-radius:20px;border:1px solid var(--line-strong);margin:28px 0}.pp h1{font-size:clamp(40px,6vw,72px)}.pp .lead{font-size:19px;color:var(--text-dim);max-width:70ch;margin-top:14px}.pp .btns{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0 40px}.pp h2{font-size:22px;margin:36px 0 12px}.pp .shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}.pp .shots img{width:100%;border-radius:14px;border:1px solid var(--line)}.pp .reveal{opacity:1;transform:none}</style>
</head><body>
<header class="header is-scrolled"><div class="container"><a href="/" class="brand"><span class="brand__word"><span class="brand__first">Alexus</span><span class="brand__last">Joaquin</span></span><span class="brand__dot"></span></a><nav class="nav"><a href="/#projects">Projects</a><a href="/#experience">Experience</a><a href="/#contact">Contact</a></nav><div class="header__actions"><a class="btn btn--sm" href="/assets/Alexus_Karl_Joaquin_CV.pdf">Download CV</a></div></div></header>
<main class="pp"><div class="container">
  <div class="mono" style="color:${p.accent}">${esc(p.kicker)}</div>
  <h1 class="section__title" style="margin-top:10px"><img src="/${p.icon}" alt="" style="display:inline-block;width:.9em;height:.9em;border-radius:.2em;vertical-align:-.08em;margin-right:.2em">${esc(p.name)}</h1>
  <p class="lead">${esc(p.summary)}</p>
  <p class="lead" style="font-size:15px">${esc(p.role)} · ${esc(p.year)} · Designed, built and deployed by <a href="/" style="color:var(--accent)">Alexus Karl Joaquin</a>.</p>
  <div class="btns">${links.map((l) => `<a class="btn ${l.primary ? 'btn--primary' : ''}" href="${l.href}">${esc(l.label)}</a>`).join('')}</div>
  <img class="hero-img" src="/assets/og/${p.id}.png" alt="${esc(p.name)} overview">
  <div class="facts">${p.facts.map(([k, v]) => `<div class="fact"><div class="mono">${esc(k)}</div><strong>${esc(v)}</strong></div>`).join('')}</div>
  <h2>What I built</h2><ul class="highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
  <h2>Skills demonstrated</h2><ul class="skills-list">${(p.skills || p.stack).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  <h2>Stack</h2><div class="job__stack" style="margin-top:0">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
  ${p.gallery.length ? `<h2>Screens</h2><div class="shots">${p.gallery.map((g) => `<img loading="lazy" src="/${g}" alt="${esc(p.name)} screenshot">`).join('')}</div>` : ''}
  <h2>More</h2><p class="lead" style="font-size:16px"><a href="/#projects" style="color:var(--accent)">All projects</a> · <a href="/#experience" style="color:var(--accent)">Experience</a> · <a href="https://www.linkedin.com/in/alexuskarljoaquin" style="color:var(--accent)">LinkedIn</a> · <a href="https://github.com/alexuswingz" style="color:var(--accent)">GitHub</a></p>
</div></main>
<footer class="footer"><div class="container"><span>© ${new Date().getFullYear()} Alexus Karl Joaquin</span><span><a href="/">alexuskarljoaquin.com</a></span></div></footer>
</body></html>`;
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
