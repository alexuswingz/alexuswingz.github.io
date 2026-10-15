// Rebuilds every embedded demo under ./demos from its source project.
//
//   node tools/build-demos.mjs            # all
//   node tools/build-demos.mjs cashnt     # one
//
// Each app is a Vite build with `--base /demos/<name>/` so it runs from a sub-folder of this
// site. Env vars that would point a demo at a real backend (sync API, Firebase, job API) are
// blanked, so the demos are self-contained: Cashn't runs in guest + demo-data mode, Studyverse
// on its in-memory mocks, Proof with simulated generation, and Job Finder behind a fetch shim
// (tools/shims/jobfinder-demo-shim.js) that answers the API from sample data.
import { spawnSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const desktop = resolve(site, '..');

const demos = {
  cashnt: {
    src: resolve(desktop, "Cashn't"),
    env: { VITE_API_URL: '', VITE_FIREBASE_API_KEY: '', VITE_FIREBASE_AUTH_DOMAIN: '', VITE_FIREBASE_PROJECT_ID: '',
      VITE_FIREBASE_STORAGE_BUCKET: '', VITE_FIREBASE_MESSAGING_SENDER_ID: '', VITE_FIREBASE_APP_ID: '' },
  },
  studyverse: { src: resolve(desktop, 'Studyverse'), env: { VITE_API_URL: '', VITE_REALTIME_URL: '' } },
  proof: { src: resolve(desktop, 'AI Generation'), env: {} },
  // Static client site; the Desktop copy carries the base-path patch (BrowserRouter basename + asset paths).
  matteosbrew: { src: resolve(desktop, 'MatteosBrew'), env: {} },
  jobfinder: {
    src: resolve(desktop, 'Job Finder', 'frontend'),
    env: { VITE_API_URL: '' },
    after(out) {
      copyFileSync(resolve(here, 'shims', 'jobfinder-demo-shim.js'), resolve(out, 'demo-shim.js'));
      const index = resolve(out, 'index.html');
      let html = readFileSync(index, 'utf8');
      if (!html.includes('demo-shim.js')) {
        html = html.replace('<script type="module"', '<script src="/demos/jobfinder/demo-shim.js"></script>\n    <script type="module"');
        writeFileSync(index, html);
      }
    },
  },
};

// GitHub Pages has no SPA fallback: /404.html redirects unknown demo paths to the demo's index with
// the original path in ?p=. This inline script puts that path back before the app's router boots.
export const RESTORE_SNIPPET = '<script>(function(){var q=new URLSearchParams(location.search).get("p");if(q){history.replaceState(null,"",q+location.hash);}})();</script>';
export function restoreDeepLinks(indexPath) {
  let html = readFileSync(indexPath, 'utf8');
  if (html.includes('get("p")')) return;
  html = html.replace('<head>', '<head>\n    ' + RESTORE_SNIPPET);
  writeFileSync(indexPath, html);
}

const only = process.argv.slice(2);
for (const [name, d] of Object.entries(demos)) {
  if (only.length && !only.includes(name)) continue;
  if (!existsSync(d.src)) { console.error(`skip ${name}: ${d.src} not found`); continue; }
  const out = resolve(site, 'demos', name);
  console.log(`\n=== ${name} ← ${d.src}`);
  const r = spawnSync('npx', ['vite', 'build', '--base', `/demos/${name}/`, '--outDir', out, '--emptyOutDir'],
    { cwd: d.src, stdio: 'inherit', shell: true, env: { ...process.env, MSYS_NO_PATHCONV: '1', ...d.env } });
  if (r.status !== 0) { console.error(`build failed: ${name}`); process.exitCode = 1; continue; }
  d.after?.(out);
  restoreDeepLinks(resolve(out, 'index.html'));
  const html = readFileSync(resolve(out, 'index.html'), 'utf8');
  if (!html.includes(`/demos/${name}/assets/`)) { console.error(`${name}: index.html does not reference /demos/${name}/assets — check the --base path`); process.exitCode = 1; }
}
