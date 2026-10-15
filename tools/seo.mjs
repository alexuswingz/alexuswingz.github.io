// SEO / answer-engine build step. Run after editing js/data.js or index.html:
//   node tools/seo.mjs          (needs the local preview on :4600, e.g. node tools/serve.mjs)
// 1. Prerenders the JS-built sections into index.html so crawlers that don't run JS (most AI bots) see real content.
// 2. Writes JSON-LD (Person, WebSite, ProfilePage, SoftwareApplication list, FAQPage) into index.html.
// 3. Writes sitemap.xml, robots.txt and llms.txt.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const ORIGIN = 'https://alexuskarljoaquin.com';
const w = {}; globalThis.window = w; await import(pathToFileURL(resolve(site, 'js/data.js')).href);
const D = w.PORTFOLIO;
const personal = D.projects.filter((p) => p.id !== 'bananas');

// ---------- 1. prerender ----------
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await page.goto('http://localhost:4600/?prerender', { waitUntil: 'load' });
await page.waitForTimeout(1500);
const ids = ['stats', 'marquee', 'whyHire', 'projectsGrid', 'rings', 'skillGroups', 'faqList'];
const html = await page.evaluate((ids) => {
  const out = {};
  for (const id of ids) out[id] = document.getElementById(id).innerHTML;
  out.timeline = Array.from(document.querySelectorAll('#timeline .job')).map((j) => j.outerHTML).join('\n');
  return out;
}, ids);
await browser.close();
const clean = (s) => s.replace(/\sstyle="[^"]*"/g, (m) => (/--p-accent/.test(m) ? m : '')).replace(/\sdata-cursor="[^"]*"/g, '');
let index = readFileSync(resolve(site, 'index.html'), 'utf8');
const fill = (key, content) => {
  const re = new RegExp(`<!--pre:${key}-->[\\s\\S]*?<!--/pre-->`);
  if (!re.test(index)) throw new Error('marker missing: ' + key);
  index = index.replace(re, () => `<!--pre:${key}-->${content}<!--/pre-->`);
};
fill('stats', clean(html.stats)); fill('marquee', clean(html.marquee)); fill('whyHire', clean(html.whyHire));
fill('timeline', clean(html.timeline)); fill('projectsGrid', clean(html.projectsGrid)); fill('rings', clean(html.rings));
fill('skillGroups', clean(html.skillGroups)); fill('faq', clean(html.faqList));

// ---------- 2. JSON-LD ----------
const person = {
  '@type': 'Person', '@id': `${ORIGIN}/#person`, name: D.person.name, givenName: 'Alexus Karl', familyName: 'Joaquin',
  jobTitle: D.person.title, description: `${D.person.title}. ${D.person.tagline}. 8+ years of engineering, 4+ years leading teams.`,
  url: ORIGIN, image: `${ORIGIN}/assets/og.png`, email: `mailto:${D.person.email}`, telephone: D.person.phone,
  address: { '@type': 'PostalAddress', addressCountry: 'PH' }, nationality: 'Philippines',
  alumniOf: { '@type': 'CollegeOrUniversity', name: D.education.school },
  sameAs: ['https://www.linkedin.com/in/alexuskarljoaquin', D.person.github, 'https://apps.apple.com/us/developer/alexus-karl-joaquin/id1886366272', D.person.appstore],
  knowsAbout: D.skillGroups.flatMap((g) => g.items),
  worksFor: { '@type': 'Organization', name: 'Alexus Karl Joaquin · Studio', url: ORIGIN },
};
const apps = personal.map((p) => ({
  '@type': 'SoftwareApplication', name: p.name, url: `${ORIGIN}/p/${p.id}/`, description: p.summary, image: `${ORIGIN}/assets/og/${p.id}.png`,
  applicationCategory: p.id === 'cashnt' ? 'FinanceApplication' : p.id === 'matteosbrew' ? 'WebApplication' : 'MobileApplication',
  operatingSystem: p.id === 'matteosbrew' || p.id === 'lawsystem' ? 'Web' : 'iOS, Web', author: { '@id': `${ORIGIN}/#person` },
  ...(p.id === 'cashnt' ? { offers: { '@type': 'Offer', price: '2.99', priceCurrency: 'USD' }, installUrl: D.person.appstore } : {}),
}));
const ld = { '@context': 'https://schema.org', '@graph': [
  person,
  { '@type': 'WebSite', '@id': `${ORIGIN}/#website`, url: ORIGIN, name: 'Alexus Karl Joaquin — Portfolio', description: 'Portfolio and live demos of Alexus Karl Joaquin, Senior Full Stack Lead Engineer.', author: { '@id': `${ORIGIN}/#person` }, inLanguage: 'en' },
  { '@type': 'ProfilePage', '@id': `${ORIGIN}/#profile`, url: ORIGIN, mainEntity: { '@id': `${ORIGIN}/#person` }, dateModified: new Date().toISOString().slice(0, 10) },
  { '@type': 'ItemList', name: 'Software built by Alexus Karl Joaquin', itemListElement: apps.map((a, i) => ({ '@type': 'ListItem', position: i + 1, item: a })) },
  { '@type': 'FAQPage', mainEntity: D.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
] };
fill('jsonld', `<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
writeFileSync(resolve(site, 'index.html'), index);

// ---------- 3. sitemap / robots / llms.txt ----------
const today = new Date().toISOString().slice(0, 10);
const urls = [{ loc: `${ORIGIN}/`, pri: '1.0' }, ...personal.map((p) => ({ loc: `${ORIGIN}/p/${p.id}/`, pri: '0.8' })), { loc: `${ORIGIN}/assets/Alexus_Karl_Joaquin_CV.pdf`, pri: '0.5' }];
writeFileSync(resolve(site, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}\n</urlset>\n`);
const bots = ['*', 'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Bingbot', 'Applebot-Extended'];
writeFileSync(resolve(site, 'robots.txt'), `# Everyone welcome, including AI crawlers.\n${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nSitemap: ${ORIGIN}/sitemap.xml\n`);
writeFileSync(resolve(site, 'llms.txt'), [
  `# Alexus Karl Joaquin`, '',
  `> Senior Full Stack Lead Engineer (Philippines, works remote-first). 8+ years of engineering, 4+ years leading five-engineer teams. Early adopter of AI-native development (MCP, Claude Code, Cursor). Published Cashn't, a paid iOS app, on the Apple App Store and shipped seven more products solo.`, '',
  `Contact: ${D.person.email} · LinkedIn: https://www.linkedin.com/in/alexuskarljoaquin · GitHub: ${D.person.github}`,
  `CV (PDF): ${ORIGIN}/assets/Alexus_Karl_Joaquin_CV.pdf`, '',
  '## Skills', '', ...D.skillGroups.map((g) => `- ${g.title}: ${g.items.join(', ')}`), '',
  '## Experience', '', ...D.experience.map((j) => `- ${j.role}, ${j.company} (${j.period}): ${j.bullets[0]}`), '',
  '## Products (all built solo, zero to deployment)', '', ...personal.map((p) => `- [${p.name}](${ORIGIN}/p/${p.id}/): ${p.summary} Stack: ${p.stack.join(', ')}.`), '',
  '## FAQ', '', ...D.faq.map((f) => `- ${f.q} ${f.a}`), '',
].join('\n'));
console.log('prerendered + jsonld + sitemap + robots + llms.txt');

// ---------- 4. IndexNow (Bing, Yandex, DuckDuckGo, Naver; also feeds Copilot / ChatGPT search via Bing) ----------
// Key file lives at the site root; run with --indexnow to notify search engines of every URL in the sitemap.
if (process.argv.includes("--indexnow")) {
  const { readdirSync } = await import("node:fs");
  const keyFile = readdirSync(site).find((f) => /^[0-9a-f]{32}.txt$/.test(f));
  if (!keyFile) throw new Error("no IndexNow key file at site root");
  const key = keyFile.replace(".txt", "");
  const body = { host: "alexuskarljoaquin.com", key, keyLocation: ORIGIN + "/" + keyFile, urlList: urls.map((u) => u.loc) };
  const r = await fetch("https://api.indexnow.org/IndexNow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) });
  console.log("IndexNow:", r.status, r.status === 200 || r.status === 202 ? "accepted" : await r.text());
}
