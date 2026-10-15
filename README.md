# Alexus Karl Joaquin — Portfolio

A static, single-page portfolio with live, in-browser demos of my apps. No build step for the site itself:
open `index.html` through any static server and it works.

```
index.html          The page (sections are rendered from js/data.js)
css/styles.css      Design + layout
js/data.js          ALL content: profile, stats, experience, projects, skills. Edit this to change the site.
js/main.js          Rendering + motion (GSAP, ScrollTrigger, Lenis) + the project modal / demo player
assets/             CV, favicon, project icons and screenshots (drop your photo at assets/me.jpg)
demos/<app>/        Production builds of the apps, embedded in the project modal
tools/              build-demos.mjs rebuilds the demos from the source projects; shims/ holds the Job Finder data shim
```

## Run locally

```bash
npx serve .          # or: python -m http.server 8000
```

The demos need to be served from the **root of a domain** (`/demos/cashnt/` etc.), so use a server, not `file://`.

## Add your photo

Save a portrait as `assets/me.jpg` (portrait orientation, 4:5 works best). The hero swaps the monogram for it automatically.

## Deploy to GitHub Pages (user site)

The CV points at `alexusjoaquin.github.io`, which is a *user site*, served from the root of the domain. That is exactly what
the demo paths expect.

```bash
git init && git add -A && git commit -m "Portfolio"
git remote add origin https://github.com/<user>/<user>.github.io.git
git branch -M main && git push -u origin main
```

Then Settings → Pages → Deploy from branch `main`, folder `/ (root)`. If you deploy to a *project* site instead
(`<user>.github.io/<repo>`), rebuild the demos with a matching base path: change `/demos/${name}/` in
`tools/build-demos.mjs` to `/<repo>/demos/${name}/` and run it again.

Any other static host (Netlify, Vercel, Cloudflare Pages, Railway static) works as-is.

## Rebuilding the demos

```bash
node tools/build-demos.mjs            # all four embedded demos
node tools/build-demos.mjs cashnt     # one
```

Each demo is the real app built with Vite and `--base /demos/<name>/`, with the env vars that would point it at a real
backend blanked out:

| Demo | Source | How it runs without a server |
|---|---|---|
| `demos/cashnt` | `../Cashn't` | `?demo` seeds sample data and enters guest mode; sync API and Firebase are blanked |
| `demos/studyverse` | `../Studyverse` | No `VITE_API_URL` → in-memory mocks + simulated live events |
| `demos/proof` | `../AI Generation` | Generation is simulated; face retouch runs MediaPipe on-device |
| `demos/jobfinder` | `../Job Finder/frontend` | `tools/shims/jobfinder-demo-shim.js` intercepts `fetch()` and answers the API from a sample dataset |

LOCA is linked to its live Railway deployment (it needs an account) and shown as a gallery.
The 1000 Bananas platform is a company project and is described with an architecture diagram only.

Three one-line changes were made in the source projects so they can run under a sub-path
(all default to `/` so normal builds are unaffected): Studyverse `src/app/router.tsx` (router `basename`),
Job Finder `frontend/src/main.tsx` (`BrowserRouter basename`), Proof `src/lib/router.ts`, `src/data/photos.ts`
and `src/lib/face-retouch.ts` (asset / route base), and Studyverse `Logo.tsx` (logo path).

## Credits

GSAP + ScrollTrigger (cdnjs), Lenis smooth scroll, Google Fonts (Inter Tight, Inter, JetBrains Mono).
