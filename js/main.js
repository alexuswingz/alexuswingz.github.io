/* Portfolio runtime: renders content from js/data.js and drives all motion. */
(function () {
  'use strict';
  const D = window.PORTFOLIO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth > 900;
  const hasGsap = typeof gsap !== 'undefined';
  const motion = hasGsap && !reduced;
  if (reduced) document.documentElement.classList.add('reduced');
  if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICONS = {
    rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8-.8-.7-2-.7-2.8 0z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.6 12.6 0 0 1 22 2c0 2.7-.9 7.6-6 11a22 22 0 0 1-4 2z"/><path d="M9 12H4s.5-3 2-4 4 0 4 0"/><path d="M12 15v5s3-.5 4-2 0-4 0-4"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/><path d="M19 17v4M17 19h4M5 3v3M3.5 4.5h3"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
    arrow: '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>',
  };

  /* ---------------- render ---------------- */
  function renderStats() {
    $('#stats').innerHTML = D.stats.map((s) => `
      <div class="stat reveal"><div class="stat__num"><span data-count="${s.value}">0</span><sup>${esc(s.suffix)}</sup></div><div class="stat__label">${esc(s.label)}</div></div>`).join('');
  }
  function renderMarquee() {
    const items = D.marquee.map((m) => `<span class="marquee__item">${esc(m)}</span>`).join('');
    $('#marquee').innerHTML = items + items;
  }
  function renderWhyHire() {
    $('#whyHire').innerHTML = D.whyHire.map((c) => `
      <article class="card reveal"><div class="card__icon">${ICONS[c.icon]}</div><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></article>`).join('');
  }
  function renderExperience() {
    $('#timeline').insertAdjacentHTML('beforeend', D.experience.map((j) => `
      <article class="job">
        <div class="job__meta"><div class="job__period">${esc(j.period)}</div><div class="job__company">${esc(j.company)}</div><div class="job__role">${esc(j.role)}</div></div>
        <div class="job__body"><ul class="job__bullets">${j.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
          <div class="job__stack">${j.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div></div>
      </article>`).join(''));
  }
  function badgeFor(p) {
    if (p.id === 'cashnt') return '<span class="badge"><i></i>App Store</span>';
    if (p.demo.kind === 'embed') return '<span class="badge"><i></i>Live demo</span>';
    if (p.demo.kind === 'gallery') return '<span class="badge badge--warm"><i></i>Live app</span>';
    return '<span class="badge badge--gold"><i></i>Company</span>';
  }
  function renderProjects() {
    $('#projectsGrid').innerHTML = D.projects.map((p, i) => {
      const visual = p.demo.kind === 'architecture'
        ? `<div class="arch">
             <div class="arch__box arch__box--wide arch__box--accent"><strong>1000 Bananas Platform</strong>Next.js · Django · FastAPI · PostgreSQL · Railway</div>
             <div class="arch__box"><strong>N-GOOS</strong>forecast · inventory · shipments</div>
             <div class="arch__box"><strong>Battlefield</strong>252 routes · bid engine</div>
             <div class="arch__box"><strong>MCP server</strong>AI tool access</div>
             <div class="arch__box arch__box--wide"><strong>Amazon SP-API · Ads API</strong>multi-account sync · reporting</div>
           </div>`
        : `<div class="phone"><img loading="lazy" src="${p.cover}" alt="${esc(p.name)} screenshot" /></div>${p.gallery[1] ? `<div class="phone phone--second"><img loading="lazy" src="${p.gallery[1]}" alt="" /></div>` : ''}`;
      const cta = p.demo.kind === 'embed' ? 'Try the live demo' : p.demo.kind === 'gallery' ? 'See it in action' : 'See the architecture';
      return `
      <article class="project reveal ${i === 0 ? 'project--featured' : ''}" data-project="${p.id}" data-cursor="Open" style="--p-accent:${p.accent}" tabindex="0" role="button" aria-label="Open ${esc(p.name)}">
        <div class="project__visual">${visual}<div class="project__glare"></div></div>
        <div class="project__body">
          <div class="project__top"><div style="display:flex;align-items:center;gap:12px"><div class="project__icon"><img src="${p.icon}" alt="" /></div><div><div class="project__kicker">${esc(p.kicker)}</div></div></div>${badgeFor(p)}</div>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.summary)}</p>
          <div class="project__tags">${p.stack.slice(0, 5).map((s) => `<span class="chip">${esc(s)}</span>`).join('')}${p.stack.length > 5 ? `<span class="chip chip--accent">+${p.stack.length - 5}</span>` : ''}</div>
          <div class="project__cta">${cta} ${ICONS.arrow}</div>
        </div>
      </article>`;
    }).join('');
  }
  function renderSkills() {
    $('#rings').innerHTML = D.skillRings.map((r) => `
      <div class="ring reveal"><div class="ring__wrap"><svg viewBox="0 0 110 110"><circle class="track" cx="55" cy="55" r="50"/><circle class="fill" cx="55" cy="55" r="50" data-pct="${r.pct}"/></svg><span class="ring__pct" data-count="${r.pct}" data-suffix="%">0%</span></div><div class="ring__label">${esc(r.label)}</div></div>`).join('');
    $('#skillGroups').innerHTML = D.skillGroups.map((g) => `
      <div class="skill-group reveal"><h4>${esc(g.title)}</h4><ul>${g.items.map((i) => `<li class="chip">${esc(i)}</li>`).join('')}</ul></div>`).join('');
    $('#eduDegree').textContent = D.education.degree;
    $('#eduSchool').textContent = `${D.education.school} · ${D.education.period}`;
  }

  /* ---------------- modal ---------------- */
  let current = -1;
  const modal = $('#modal');
  const demoHost = $('#modalDemo');
  const contentHost = $('#modalContent');

  function archSvg() {
    return `<div class="arch-diagram"><svg viewBox="0 0 460 420" role="img" aria-label="Platform architecture">
      <rect x="20" y="20" width="420" height="60" rx="10" class="gold"/><text class="t" x="230" y="45" text-anchor="middle">Next.js frontends (14 + 16)</text><text x="230" y="64" text-anchor="middle">72 pages · 44 pages · Zustand · TanStack Query · realtime</text>
      <rect x="20" y="120" width="200" height="70" rx="10"/><text class="t" x="120" y="146" text-anchor="middle">Django 5 + DRF</text><text x="120" y="164" text-anchor="middle">forecast · inventory · NPD</text><text x="120" y="178" text-anchor="middle">Channels · JWT · ~230 endpoints</text>
      <rect x="240" y="120" width="200" height="70" rx="10"/><text class="t" x="340" y="146" text-anchor="middle">FastAPI Battlefield</text><text x="340" y="164" text-anchor="middle">252 routes · bid engine</text><text x="340" y="178" text-anchor="middle">throttle · placements · cron</text>
      <rect x="20" y="230" width="200" height="56" rx="10"/><text class="t" x="120" y="254" text-anchor="middle">PostgreSQL (combined)</text><text x="120" y="272" text-anchor="middle">two schemas · ~97 tables</text>
      <rect x="240" y="230" width="200" height="56" rx="10" class="gold"/><text class="t" x="340" y="254" text-anchor="middle">MCP server · Banana Land</text><text x="340" y="272" text-anchor="middle">AI tools · read-only SQL runner</text>
      <rect x="20" y="326" width="420" height="56" rx="10"/><text class="t" x="230" y="350" text-anchor="middle">Amazon SP-API · Amazon Ads API</text><text x="230" y="368" text-anchor="middle">catalog sync · reports · multi-seller · cron services</text>
      <path d="M120 80v40M340 80v40M120 190v40M340 190v40M120 286v40M340 286v40"/>
    </svg></div>`;
  }

  function deviceMarkup(p) {
    if (p.demo.kind === 'embed') {
      return `<div class="device-wrap"><div class="device" id="device"><div class="device__frame"></div><div class="device__island"></div>
        <div class="device__screen"><div class="device__loading" id="deviceLoading"><div style="display:grid;place-items:center"><i></i>Booting ${esc(p.name)}</div></div><iframe id="demoFrame" title="${esc(p.name)} live demo" src="${p.demo.url}" allow="clipboard-write" loading="eager"></iframe></div></div></div>
        <div class="demo__actions"><button class="btn btn--sm" id="demoReload">${ICONS.refresh} Restart</button><a class="btn btn--sm" href="${p.demo.url}" target="_blank" rel="noopener">${ICONS.ext} Open full screen</a></div>
        <p class="demo__note">${esc(p.demo.note)}</p>`;
    }
    if (p.demo.kind === 'gallery') {
      return `<div class="device-wrap"><div class="device" id="device"><div class="device__frame"></div><div class="device__island"></div><div class="device__screen"><img id="galleryMain" src="${p.gallery[0]}" alt="${esc(p.name)} screenshot" /></div></div></div>
        <div class="gallery" id="gallery">${p.gallery.map((g, i) => `<button class="${i === 0 ? 'is-active' : ''}" data-src="${g}" data-cursor="View" aria-label="Screenshot ${i + 1}"><img loading="lazy" src="${g}" alt="" /></button>`).join('')}</div>
        ${p.links[0] ? `<div class="demo__actions"><a class="btn btn--sm btn--primary" href="${p.links[0].url}" target="_blank" rel="noopener">${ICONS.ext} ${esc(p.links[0].label)}</a></div>` : ''}
        <p class="demo__note">${esc(p.demo.note)}</p>`;
    }
    return `${archSvg()}<p class="demo__note">${esc(p.demo.note)}</p>`;
  }

  function contentMarkup(p) {
    return `
      <div><div class="modal__kicker">${esc(p.kicker)}</div><h2 class="modal__title" id="modalTitle"><img src="${p.icon}" alt="" />${esc(p.name)}</h2></div>
      <p class="modal__summary">${esc(p.summary)}</p>
      <div class="facts">${p.facts.map(([k, v]) => `<div class="fact"><div class="mono">${esc(k)}</div><strong>${esc(v)}</strong></div>`).join('')}</div>
      <div class="modal__section"><h4>Role</h4><p style="color:var(--text-dim)">${esc(p.role)} · ${esc(p.year)}</p></div>
      <div class="modal__section"><h4>What I built</h4><ul class="highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>
      <div class="modal__section"><h4>Stack</h4><div class="job__stack" style="margin-top:0">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div></div>
      ${p.gallery.length && p.demo.kind === 'embed' ? `<div class="modal__section"><h4>Screens</h4><div class="gallery" style="max-width:none;grid-template-columns:repeat(auto-fill,minmax(120px,1fr))">${p.gallery.map((g) => `<button data-lightbox="${g}" data-cursor="View" aria-label="Enlarge screenshot"><img loading="lazy" src="${g}" alt="" /></button>`).join('')}</div></div>` : ''}
      <div class="modal__links">${p.links.map((l) => `<a class="btn ${l.primary ? 'btn--primary' : ''}" href="${l.url}" target="_blank" rel="noopener">${esc(l.label)} ${ICONS.ext}</a>`).join('')}${p.demo.kind === 'embed' ? `<a class="btn" href="${p.demo.url}" target="_blank" rel="noopener">Open demo in a new tab ${ICONS.ext}</a>` : ''}</div>`;
  }

  function fitDevice() {
    const d = $('#device');
    if (!d) return;
    const wrap = d.parentElement;
    const availH = window.innerHeight - 190;
    const h = d.clientWidth * (844 / 390);
    const scale = Math.min(1, availH / h);
    d.style.transform = `scale(${scale})`;
    wrap.style.height = `${h * scale}px`;
  }

  function openProject(i) {
    current = (i + D.projects.length) % D.projects.length;
    const p = D.projects[current];
    demoHost.innerHTML = deviceMarkup(p);
    contentHost.innerHTML = contentMarkup(p);
    modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
    if (window.lenis) window.lenis.stop();
    $('#modalPanel').scrollTop = 0;
    history.replaceState(null, '', `#project-${p.id}`);
    fitDevice();

    const frame = $('#demoFrame');
    if (frame) {
      const done = () => $('#deviceLoading')?.classList.add('is-done');
      frame.addEventListener('load', () => setTimeout(done, 350));
      setTimeout(done, 6000);
      $('#demoReload').addEventListener('click', () => { $('#deviceLoading').classList.remove('is-done'); frame.src = p.demo.url; });
    }
    const gal = $('#gallery');
    if (gal) gal.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', gal).forEach((x) => x.classList.toggle('is-active', x === b));
      const img = $('#galleryMain');
      if (motion) gsap.fromTo(img, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out' });
      img.src = b.dataset.src;
    });
    contentHost.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lightbox]'); if (!b) return;
      window.open(b.dataset.lightbox, '_blank', 'noopener');
    });
    if (motion) {
      gsap.fromTo('.modal__demo', { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: .8, ease: 'power3.out' });
      gsap.fromTo('.modal__content > *', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .07, ease: 'power3.out', delay: .1 });
      gsap.fromTo('.highlights li', { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: .6, stagger: .06, ease: 'power3.out', delay: .35 });
    }
    $('.modal__close').focus();
  }
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (window.lenis) window.lenis.start();
    demoHost.innerHTML = '';
    contentHost.innerHTML = '';
    history.replaceState(null, '', ' ');
  }
  $$('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
  $('#modalPrev').addEventListener('click', () => openProject(current - 1));
  $('#modalNext').addEventListener('click', () => openProject(current + 1));
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') openProject(current + 1);
    if (e.key === 'ArrowLeft') openProject(current - 1);
  });
  window.addEventListener('resize', fitDevice);

  /* ---------------- header / nav ---------------- */
  function initHeader() {
    const header = $('#header');
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 20);
      header.classList.toggle('is-hidden', y > last && y > 400 && !$('#mobileNav').classList.contains('is-open'));
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const burger = $('#burger'), mnav = $('#mobileNav');
    burger.addEventListener('click', () => {
      const open = mnav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
      if (window.lenis) open ? window.lenis.stop() : window.lenis.start();
      if (open && motion) gsap.fromTo('.mobile-nav a', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: .5, stagger: .06, ease: 'power3.out' });
    });
    $$('a', mnav).forEach((a) => a.addEventListener('click', () => burger.click()));
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id); if (!target) return;
      e.preventDefault();
      if (window.lenis) window.lenis.scrollTo(target, { offset: -60, duration: 1.4 });
      else target.scrollIntoView({ behavior: 'smooth' });
    }));
    if ('IntersectionObserver' in window) {
      const links = $$('.nav a');
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) links.forEach((l) => l.classList.toggle('is-active', l.dataset.nav === en.target.id)); });
      }, { rootMargin: '-40% 0px -55% 0px' });
      ['top', 'about', 'experience', 'projects', 'skills', 'contact'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    }
  }

  /* ---------------- cursor ---------------- */
  function initCursor() {
    if (!fine || reduced) return;
    const dot = $('#cursorDot'), ring = $('#cursorRing'), label = $('#cursorLabel');
    document.body.classList.add('has-cursor');
    let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my, rx = mx, ry = my, visible = false;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!visible) { visible = true; dx = rx = mx; dy = ry = my; dot.classList.remove('is-hidden'); ring.classList.remove('is-hidden'); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => { dot.classList.add('is-hidden'); ring.classList.add('is-hidden'); visible = false; });
    document.addEventListener('mousedown', () => { dot.classList.add('is-down'); ring.classList.add('is-down'); });
    document.addEventListener('mouseup', () => { dot.classList.remove('is-down'); ring.classList.remove('is-down'); });
    // state from the hovered element
    document.addEventListener('mouseover', (e) => {
      const t = e.target;
      const view = t.closest('[data-cursor]');
      const link = t.closest('a, button, [role="button"], label, select, input[type="checkbox"]');
      const text = t.closest('input[type="text"], input[type="email"], textarea');
      const frame = t.closest('iframe');
      ring.classList.toggle('is-view', !!view);
      dot.classList.toggle('is-view', !!view);
      ring.classList.toggle('is-hover', !!link && !view);
      ring.classList.toggle('is-text', !!text);
      label.textContent = view ? view.dataset.cursor : '';
      dot.classList.toggle('is-hidden', !!frame);
      ring.classList.toggle('is-hidden', !!frame);
    });
    let pvx = 0, pvy = 0;
    const loop = () => {
      dx += (mx - dx) * 0.55; dy += (my - dy) * 0.55;
      const vx = mx - rx, vy = my - ry;
      rx += vx * 0.16; ry += vy * 0.16;
      pvx += (vx - pvx) * 0.3; pvy += (vy - pvy) * 0.3;
      const speed = Math.min(Math.hypot(pvx, pvy), 120);
      const stretch = 1 + speed / 400, squash = 1 - speed / 900;
      const ang = Math.atan2(pvy, pvx) * 180 / Math.PI;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)${dot.classList.contains('is-down') ? ' scale(.7)' : ''}`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) rotate(${ang}deg) scale(${stretch}, ${squash}) rotate(${-ang}deg)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // magnetic buttons
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: 'power3.out' }); });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
    });
    // spotlight cards
    $$('.card').forEach((c) => c.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`); }));
    // 3D tilt on project cards
    $$('.project').forEach((p) => {
      const glare = p.querySelector('.project__glare');
      p.addEventListener('mousemove', (e) => {
        const r = p.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(p, { rotateY: x * 7, rotateX: -y * 7, transformPerspective: 1100, duration: .5, ease: 'power2.out' });
        if (glare) { glare.style.setProperty('--gx', `${(x + .5) * 100}%`); glare.style.setProperty('--gy', `${(y + .5) * 100}%`); }
      });
      p.addEventListener('mouseleave', () => gsap.to(p, { rotateY: 0, rotateX: 0, duration: .8, ease: 'power3.out' }));
    });
  }

  /* ---------------- hero stage ---------------- */
  function initStage() {
    const stage = $('#stage');
    if (!stage) return;
    const layers = $$('[data-depth]', stage);
    if (motion) {
      // idle float, each layer on its own rhythm
      layers.forEach((el, i) => {
        const d = +el.dataset.depth;
        if (d <= 0) return;
        gsap.to(el, { y: `+=${6 + d * 0.35}`, duration: 3 + (i % 4) * 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.2 });
      });
      // mouse parallax (desktop)
      if (fine) {
        const hero = $('#hero');
        const setters = layers.map((el) => ({ el, x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3' }), d: +el.dataset.depth }));
        const rot = { x: gsap.quickTo(stage, 'rotateY', { duration: 1, ease: 'power3' }), y: gsap.quickTo(stage, 'rotateX', { duration: 1, ease: 'power3' }) };
        hero.addEventListener('mousemove', (e) => {
          const r = stage.getBoundingClientRect();
          const nx = (e.clientX - (r.left + r.width / 2)) / r.width, ny = (e.clientY - (r.top + r.height / 2)) / r.height;
          setters.forEach((s) => { s.x(nx * s.d * 2.2); });
          rot.x(nx * 8); rot.y(-ny * 8);
        });
        hero.addEventListener('mouseleave', () => { setters.forEach((s) => s.x(0)); rot.x(0); rot.y(0); });
      }
    }
    // typing shipping log
    const log = $('#stageLog');
    const lines = [
      ['cmd', '$ git push origin main'], ['ok', '✓ CI passed · tests green · 3m 12s'],
      ['cmd', '$ xcrun altool --upload-app'], ['ok', "✓ Cashn't 1.1 · Ready for Sale"],
      ['cmd', '$ railway up --service api'], ['ok', '✓ LOCA API healthy · db up · 1 ms'],
      ['cmd', '$ claude "ship the feature"'], ['ok', '✓ PR opened · reviewed · merged'],
    ];
    if (!log) return;
    if (reduced) { log.innerHTML = lines.slice(0, 4).map(([c, t]) => `<span class="${c}">${esc(t)}</span>`).join('\n'); return; }
    let i = 0, shown = [];
    const type = () => {
      const [cls, text] = lines[i % lines.length];
      let k = 0;
      const tick = () => {
        k++;
        log.innerHTML = shown.join('\n') + (shown.length ? '\n' : '') + `<span class="${cls}">${esc(text.slice(0, k))}</span><span class="caret"></span>`;
        if (k < text.length) setTimeout(tick, cls === 'cmd' ? 38 : 14);
        else { shown.push(`<span class="${cls}">${esc(text)}</span>`); if (shown.length > 3) shown.shift(); i++; setTimeout(type, cls === 'cmd' ? 500 : 1500); }
      };
      tick();
    };
    setTimeout(type, 2600);
  }

  /* ---------------- motion helpers ---------------- */
  function splitWords(el, keepMarkup) {
    // Wraps each word in .w > span so lines can slide up from a clipped box.
    const mk = (part) => { const w = document.createElement('span'); w.className = 'w'; const inner = document.createElement('span'); inner.textContent = part; w.appendChild(inner); return w; };
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          const parts = n.textContent.split(/(\s+)/).filter(Boolean);
          parts.forEach((part, idx) => {
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = mk(part);
            // Punctuation glued to a preceding element (e.g. "<em>inside</em>.") must not wrap alone.
            const prev = n.previousSibling;
            if (idx === 0 && prev && prev.nodeType === 1 && /^[^\w\s]/.test(part)) {
              const glue = document.createElement('span'); glue.style.whiteSpace = 'nowrap';
              prev.replaceWith(glue); glue.appendChild(prev); glue.appendChild(w); return;
            }
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el);
    return $$('.w > span', el);
  }
  function rolesLoop() {
    const host = $('#roles');
    host.innerHTML = D.roles.map((r) => `<span>${esc(r)}</span>`).join('');
    const spans = $$('span', host);
    const fit = () => {
      host.style.fontSize = '1em';
      const avail = host.closest('.hero__title').clientWidth;
      const widest = Math.max(...spans.map((s) => s.offsetWidth));
      if (widest > avail) host.style.fontSize = `${Math.max(0.55, avail / widest).toFixed(3)}em`;
    };
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if (!motion) { spans[0].style.opacity = 1; return; }
    const tl = gsap.timeline({ repeat: -1 });
    spans.forEach((s) => {
      tl.fromTo(s, { yPercent: 60, opacity: 0, rotateX: -40 }, { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.7, ease: 'power3.out' })
        .to(s, { yPercent: -60, opacity: 0, rotateX: 40, duration: 0.6, ease: 'power3.in' }, '+=1.9');
    });
  }
  function counters(scope) {
    $$('[data-count]', scope).forEach((el) => {
      const end = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (!motion) { el.textContent = end + suffix; return; }
      const o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 100%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } });
    });
  }
  const st = (trigger, extra = {}) => ({ trigger, start: 'top 85%', once: true, ...extra });

  function initMotion() {
    const pre = $('#preloader');
    if (!hasGsap) { pre.remove(); $$('.reveal').forEach((r) => (r.style.opacity = 1, r.style.transform = 'none')); return; }
    if (reduced) { pre.remove(); heroIn(true); return; }

    // progress bar
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 } });

    // preloader → hero
    const intro = gsap.timeline({ onComplete: () => pre.remove() });
    intro.to('.preloader__word span', { y: 0, duration: 0.9, stagger: 0.06, ease: 'power4.out' })
      .to('.preloader__bar', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, '<0.2')
      .to('.preloader__word span', { y: '-110%', duration: 0.6, stagger: 0.04, ease: 'power3.in' }, '+=0.15')
      .to(pre, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '-=0.3')
      .add(() => heroIn(false), '-=0.55');

    // generic reveals (anything not choreographed below)
    $$('.reveal').forEach((el) => {
      if (el.closest('#hero') || el.closest('#whyHire') || el.closest('#projectsGrid') || el.closest('#rings') || el.closest('#skillGroups')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: st(el, { start: 'top 88%' }) });
    });

    // section titles: word-by-word slide-up from a clipped box
    $$('.section__title').forEach((t) => {
      const words = splitWords(t);
      gsap.to(words, { y: 0, duration: 1, stagger: 0.06, ease: 'power4.out', scrollTrigger: st(t) });
    });
    $$('.section__head .mono').forEach((m) => gsap.from(m, { x: -24, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: st(m) }));

    // ABOUT: paragraphs fade in word by word; cards flip in
    $$('.about__text p').forEach((p) => {
      const words = splitWords(p);
      gsap.fromTo(words, { opacity: 0.12, y: 6 }, { opacity: 1, y: 0, duration: .5, stagger: 0.012, ease: 'power2.out', scrollTrigger: st(p, { start: 'top 82%' }) });
    });
    gsap.from('.about__meta > div', { y: 20, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: st('.about__meta') });
    // one tween per card: rise, settle, then hand the element back to CSS so hover effects stay clean
    const settle = (el) => () => { el.classList.add('is-in'); gsap.set(el, { clearProps: 'all' }); };
    $$('#whyHire .card').forEach((c, i) => {
      gsap.fromTo(c, { opacity: 0, y: 40, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .9, ease: 'power3.out', delay: (i % 2) * .12, scrollTrigger: st(c, { start: 'top 90%' }), onComplete: settle(c) });
      gsap.from(c.querySelector('.card__icon'), { scale: .6, opacity: 0, duration: .6, ease: 'back.out(2)', delay: .3 + (i % 2) * .12, scrollTrigger: st(c, { start: 'top 90%' }) });
    });

    // EXPERIENCE: meta from the left, bullets from the right, chips pop
    $$('.job').forEach((j) => {
      gsap.from(j.querySelector('.job__meta'), { x: -50, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: st(j, { start: 'top 80%' }) });
      gsap.from($$('.job__bullets li', j), { x: 40, opacity: 0, duration: .7, stagger: .07, ease: 'power3.out', scrollTrigger: st(j, { start: 'top 80%' }) });
      gsap.from($$('.job__stack .chip', j), { scale: .5, opacity: 0, duration: .5, stagger: .035, ease: 'back.out(2.5)', scrollTrigger: st(j, { start: 'top 70%' }) });
      ScrollTrigger.create({ trigger: j, start: 'top 60%', end: 'bottom 60%', toggleClass: 'is-active' });
    });
    gsap.to('#timelineProgress', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 60%', end: 'bottom 60%', scrub: 0.4 } });

    // PROJECTS: cards rise and un-tilt in a stagger, visuals parallax
    $$('#projectsGrid .project').forEach((p, i) => {
      gsap.fromTo(p, { opacity: 0, y: 56, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', delay: (i % 3) * .1, scrollTrigger: st(p, { start: 'top 92%' }), onComplete: settle(p) });
    });

    // SKILLS: rings draw, chips pop in
    $$('#rings .ring').forEach((r, i) => {
      gsap.fromTo(r, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: (i % 4) * .08, scrollTrigger: st(r, { start: 'top 92%' }), onComplete: settle(r) });
      gsap.to(r.querySelector('.fill'), { strokeDashoffset: 314 - (314 * +r.querySelector('.fill').dataset.pct) / 100, duration: 1.6, ease: 'power3.out', scrollTrigger: st(r, { start: 'top 88%' }), delay: (i % 4) * .08 });
    });
    $$('#skillGroups .skill-group').forEach((g, i) => {
      gsap.fromTo(g, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: (i % 3) * .08, scrollTrigger: st(g, { start: 'top 92%' }), onComplete: settle(g) });
      gsap.from($$('.chip', g), { scale: .4, opacity: 0, duration: .5, stagger: .025, ease: 'back.out(2.5)', scrollTrigger: st(g, { start: 'top 85%' }), delay: .15 + (i % 3) * .08 });
    });

    // PANELS
    $$('.panel').forEach((p, i) => gsap.from($$('li', p), { x: -20, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', scrollTrigger: st(p, { start: 'top 75%' }), delay: .2 }));

    // CONTACT: big words rise, underline draws, buttons pop
    const ct = $('#contactTitle');
    const ctWords = splitWords(ct);
    ctWords.forEach((w) => (w.style.transform = 'translateY(110%)'));
    gsap.to(ctWords, { y: 0, duration: 1.1, stagger: 0.08, ease: 'power4.out', scrollTrigger: st(ct) });
    gsap.from('.contact__row .btn', { y: 24, opacity: 0, scale: .9, duration: .7, stagger: .08, ease: 'back.out(1.8)', scrollTrigger: st('.contact__row') });
    ScrollTrigger.create({ trigger: '.contact__email', start: 'top 85%', once: true, onEnter: () => setTimeout(() => $('.contact__email').classList.add('is-drawn'), 400) });

    counters(document);
    // marquee
    gsap.to('#marquee', { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    // hero parallax on scroll
    gsap.to('.hero__visual', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__copy', { yPercent: 6, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  function heroIn(instant) {
    const title = $('#heroTitle');
    const lines = $$('.line > span', title);
    if (instant || !motion) { lines.forEach((l) => (l.style.transform = 'none')); $$('#hero .reveal').forEach((r) => { r.style.opacity = 1; r.style.transform = 'none'; }); rolesLoop(); return; }
    lines.forEach((l) => (l.style.transform = 'translateY(110%)'));
    const tl = gsap.timeline();
    tl.to(lines, { y: 0, duration: 1.1, stagger: 0.1, ease: 'power4.out' })
      .to('#hero .hero__copy .reveal', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, '-=0.6')
      .to('#hero .hero__visual', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=1')
      .from('.stage__phone', { y: 120, opacity: 0, rotate: 0, scale: .9, duration: 1.3, stagger: .12, ease: 'power4.out' }, '-=1')
      .from('.stage__chip, .stage__tag, .stage__photo', { y: 24, opacity: 0, scale: .85, duration: .8, stagger: .1, ease: 'back.out(1.6)' }, '-=0.7')
      .from('.stage__log', { y: 30, opacity: 0, duration: .8, ease: 'power3.out' }, '-=0.5')
      .add(rolesLoop, '-=0.9');
  }
  function initLenis() {
    if (typeof Lenis === 'undefined' || !motion) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------- boot ---------------- */
  renderStats(); renderMarquee(); renderWhyHire(); renderExperience(); renderProjects(); renderSkills();
  $('#year').textContent = new Date().getFullYear();
  $('#projectsGrid').addEventListener('click', (e) => { const c = e.target.closest('.project'); if (c) openProject(D.projects.findIndex((p) => p.id === c.dataset.project)); });
  $('#projectsGrid').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const c = e.target.closest('.project'); if (c) { e.preventDefault(); openProject(D.projects.findIndex((p) => p.id === c.dataset.project)); } } });
  initHeader(); initLenis(); initMotion(); initCursor(); initStage();
  const m = location.hash.match(/^#project-([\w-]+)$/);
  if (m) { const i = D.projects.findIndex((p) => p.id === m[1]); if (i >= 0) setTimeout(() => openProject(i), motion ? 2600 : 0); }
  $$('a[href$=".pdf"]').forEach((a) => a.addEventListener('click', () => { const t = $('#toast'); t.textContent = 'Opening CV…'; t.classList.add('is-on'); setTimeout(() => t.classList.remove('is-on'), 1800); }));
})();
