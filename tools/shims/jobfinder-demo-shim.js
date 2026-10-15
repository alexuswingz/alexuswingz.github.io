/*
 * Job Finder — portfolio demo shim.
 *
 * The real app talks to a FastAPI backend that aggregates LinkedIn / Indeed / JobStreet / Google Jobs
 * and scores every listing against a CV. For the static portfolio demo this file intercepts fetch()
 * and answers the same endpoints from an in-browser sample dataset, so the full UI (feed, scoring,
 * filters, save / apply / dismiss, profile editing) works with no server.
 *
 * Sample listings below are illustrative — company names are fictional.
 */
(function () {
  const STORAGE = 'jobfinder-demo-state-v1';
  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

  const profile = {
    name: 'Alexus Karl Joaquin',
    headline: 'Senior Full Stack Lead Engineer · AI-Native Development · Published iOS App Developer',
    years_experience: 8,
    seniority: 'senior',
    skills: [
      'Python', 'Flask', 'Django', 'FastAPI', 'Ruby on Rails', 'JavaScript', 'TypeScript', 'React', 'Angular',
      'Tailwind', 'PostgreSQL', 'MySQL', 'MongoDB', 'Elasticsearch', 'AWS', 'EC2', 'S3', 'RDS', 'CloudFront',
      'Docker', 'GitHub Actions', 'CI/CD', 'Railway', 'Grafana', 'Sentry', 'Selenium', 'LLM', 'MCP',
      'AI Agents', 'Prompt Engineering', 'REST API', 'System Design', 'iOS', 'App Store', 'Agile', 'Scrum',
    ],
    target_titles: [
      'Senior Full Stack Engineer', 'Full Stack Engineer', 'Senior Software Engineer', 'Lead Engineer',
      'Tech Lead', 'Backend Engineer', 'Python Developer', 'React Developer', 'AI Engineer', 'Engineering Manager',
    ],
    preferred_locations: ['Philippines', 'Manila', 'Remote'],
    remote_ok: true,
    default_query: 'senior full stack engineer',
  };

  const J = (o) => Object.assign({
    company_logo: null, is_remote: false, employment_type: 'Full-time', salary_min: null, salary_max: null,
    salary_currency: null, salary_period: null, status: null,
  }, o, { id: `${o.source}:${o.source_id}`, url: o.url || 'https://example.com/job/' + o.source_id });

  const jobs = [
    J({ source: 'linkedin', source_id: 'ln-4471', title: 'Senior Full Stack Engineer (Python / React)', company: 'Lumen Pay', location: 'Makati, Metro Manila', is_remote: true, salary_min: 180000, salary_max: 240000, salary_currency: 'PHP', salary_period: 'monthly', posted_at: hoursAgo(3), match_score: 94, matched_skills: ['Python', 'Flask', 'React', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
      description: 'Lumen Pay is building payment rails for Southeast Asian merchants. You will own features end to end across a Flask + PostgreSQL backend and a React/TypeScript frontend, deploy on AWS with GitHub Actions, and mentor two mid-level engineers.\n\nWhat you bring:\n• 6+ years shipping production web applications\n• Deep Python (Flask or Django) and modern React\n• Comfortable designing REST APIs and relational schemas\n• Experience running services on AWS (EC2, RDS, S3)\n\nNice to have: fintech experience, Elasticsearch, observability (Grafana / Sentry).' }),
    J({ source: 'jsearch', source_id: 'gj-9102', title: 'Lead Engineer, AI Platform', company: 'Northbridge Labs', location: 'Remote (APAC)', is_remote: true, salary_min: 95000, salary_max: 130000, salary_currency: 'USD', salary_period: 'yearly', posted_at: hoursAgo(9), match_score: 91, matched_skills: ['LLM', 'MCP', 'AI Agents', 'Python', 'FastAPI', 'React', 'System Design'],
      description: 'Lead a team of five building an agentic platform on top of LLMs. You will design tool-calling workflows using the Model Context Protocol, harden a FastAPI backend, and set the engineering standards for AI-assisted development across the company.\n\nRequirements:\n• Hands-on experience integrating LLMs into production products\n• Strong Python and TypeScript\n• Prior team leadership (4+ years)\n• Experience with prompt engineering and evaluation' }),
    J({ source: 'jobstreet', source_id: 'js-77213', title: 'Senior Software Engineer – Ruby on Rails', company: 'Harbour Logistics', location: 'Bonifacio Global City, Taguig', salary_min: 150000, salary_max: 200000, salary_currency: 'PHP', salary_period: 'monthly', posted_at: hoursAgo(14), match_score: 86, matched_skills: ['Ruby on Rails', 'React', 'PostgreSQL', 'REST API', 'Docker', 'Agile'],
      description: 'Join a product team modernising a freight-booking platform on Ruby on Rails and React. Hybrid, 2 days in BGC.\n\n• Own a domain of the Rails monolith and its PostgreSQL schema\n• Ship React features with a designer and PM\n• Improve test coverage and CI\n• Pair with and review code from junior engineers' }),
    J({ source: 'linkedin', source_id: 'ln-4502', title: 'Engineering Manager, Web Platform', company: 'Kayumanggi Studios', location: 'Quezon City', is_remote: true, posted_at: hoursAgo(20), match_score: 82, matched_skills: ['React', 'TypeScript', 'System Design', 'Agile', 'Scrum', 'CI/CD'],
      description: 'Manage a 6-person web platform team while staying close to the code. You will run sprints, grow engineers, and own the architecture of our Next.js + Node services.\n\nYou have led engineering teams for 3+ years, still ship code weekly, and care about documentation and developer experience.' }),
    J({ source: 'indeed', source_id: 'in-30981', title: 'Full Stack Developer (Django + React)', company: 'Verdant Health', location: 'Cebu City', salary_min: 110000, salary_max: 150000, salary_currency: 'PHP', salary_period: 'monthly', posted_at: hoursAgo(26), match_score: 79, matched_skills: ['Django', 'Python', 'React', 'PostgreSQL', 'REST API'],
      description: 'Build patient-facing tools for a network of clinics. Django REST backend, React frontend, PostgreSQL. On-site in Cebu IT Park with flexible hours.' }),
    J({ source: 'jsearch', source_id: 'gj-9144', title: 'iOS Engineer (Capacitor / React)', company: 'Sari Commerce', location: 'Remote (Philippines)', is_remote: true, salary_min: 140000, salary_max: 190000, salary_currency: 'PHP', salary_period: 'monthly', posted_at: hoursAgo(31), match_score: 77, matched_skills: ['iOS', 'App Store', 'React', 'TypeScript', 'REST API'],
      description: 'Ship and maintain our consumer app on iOS and Android from a single React + Capacitor codebase. You have published at least one app to the App Store and understand the review process, push notifications and native plugins.' }),
    J({ source: 'linkedin', source_id: 'ln-4520', title: 'Backend Engineer – Python (FastAPI)', company: 'Tidewater Analytics', location: 'Singapore', is_remote: true, salary_min: 7500, salary_max: 10000, salary_currency: 'SGD', salary_period: 'monthly', posted_at: hoursAgo(40), match_score: 74, matched_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Elasticsearch', 'AWS', 'Docker'],
      description: 'Design high-throughput ingestion and search APIs with FastAPI, PostgreSQL and Elasticsearch on AWS. Remote-first team across SG / PH / AU.' }),
    J({ source: 'jobstreet', source_id: 'js-77290', title: 'Tech Lead – Fintech Lending Platform', company: 'PesoBridge', location: 'Ortigas, Pasig', salary_min: 200000, salary_max: 260000, salary_currency: 'PHP', salary_period: 'monthly', posted_at: hoursAgo(52), match_score: 88, matched_skills: ['Python', 'Flask', 'React', 'AWS', 'RDS', 'Elasticsearch', 'System Design', 'Scrum'],
      description: 'Lead the build-out of a consumer lending platform from the ground up: loan origination, repayments, and risk tooling. Python (Flask) services, React frontend, AWS infrastructure with RDS and load balancing. You will lead 4 engineers and own uptime.' }),
    J({ source: 'indeed', source_id: 'in-31044', title: 'Senior React Developer', company: 'Bluefin Interactive', location: 'Remote', is_remote: true, salary_min: 60, salary_max: 80, salary_currency: 'USD', salary_period: 'hourly', employment_type: 'Contract', posted_at: hoursAgo(60), match_score: 68, matched_skills: ['React', 'TypeScript', 'Tailwind', 'REST API'],
      description: 'Six-month contract building dashboard features in React 19 + Tailwind. Async team across US and APAC time zones.' }),
    J({ source: 'jsearch', source_id: 'gj-9201', title: 'AI Engineer – LLM Applications', company: 'Cadence Works', location: 'Sydney, Australia', is_remote: true, salary_min: 160000, salary_max: 200000, salary_currency: 'AUD', salary_period: 'yearly', posted_at: hoursAgo(70), match_score: 83, matched_skills: ['LLM', 'Prompt Engineering', 'AI Agents', 'Python', 'TypeScript', 'React'],
      description: 'Build LLM-powered copilots for professional services firms. You will design retrieval pipelines, agent tool-use, and evaluation harnesses, and ship them in a TypeScript/React product.' }),
    J({ source: 'linkedin', source_id: 'ln-4588', title: 'Software Engineer II', company: 'Metro Grocer', location: 'Mandaluyong', salary_min: 90000, salary_max: 120000, salary_currency: 'PHP', salary_period: 'monthly', posted_at: hoursAgo(90), match_score: 52, matched_skills: ['JavaScript', 'React', 'MySQL'],
      description: 'Mid-level role on the e-commerce team. React and Node, MySQL. Great for 2–4 years of experience.' }),
    J({ source: 'jobstreet', source_id: 'js-77350', title: 'DevOps Engineer (AWS)', company: 'Harbour Logistics', location: 'Bonifacio Global City, Taguig', salary_min: 130000, salary_max: 170000, salary_currency: 'PHP', salary_period: 'monthly', posted_at: hoursAgo(100), match_score: 61, matched_skills: ['AWS', 'EC2', 'Docker', 'GitHub Actions', 'CI/CD', 'Grafana'],
      description: 'Own our AWS footprint, CI/CD pipelines and observability stack (Grafana, Sentry). Terraform experience is a plus.' }),
    J({ source: 'indeed', source_id: 'in-31120', title: 'Angular Developer', company: 'Civitas Systems', location: 'Davao City', posted_at: hoursAgo(130), match_score: 47, matched_skills: ['Angular', 'TypeScript', 'REST API'],
      description: 'Maintain and extend government-facing Angular applications. On-site.' }),
    J({ source: 'jsearch', source_id: 'gj-9260', title: 'Founding Full Stack Engineer', company: 'Ember Finance', location: 'Remote (Global)', is_remote: true, salary_min: 110000, salary_max: 150000, salary_currency: 'USD', salary_period: 'yearly', posted_at: hoursAgo(150), match_score: 89, matched_skills: ['Python', 'React', 'TypeScript', 'PostgreSQL', 'AWS', 'iOS', 'LLM', 'System Design'],
      description: 'First engineering hire for a personal-finance startup. You will build the mobile app, the backend, and the AI coach. We want someone who has shipped a product solo before — ideally to an app store.' }),
    J({ source: 'linkedin', source_id: 'ln-4610', title: 'Principal Engineer, Platform', company: 'Orbital Freight', location: 'Remote (APAC)', is_remote: true, posted_at: hoursAgo(200), match_score: 71, matched_skills: ['System Design', 'Python', 'AWS', 'PostgreSQL', 'Docker'],
      description: 'Set technical direction across 4 squads, drive architecture reviews and build the internal platform team.' }),
    J({ source: 'jobstreet', source_id: 'js-77411', title: 'Junior Web Developer', company: 'Sunrise BPO', location: 'Clark, Pampanga', salary_min: 30000, salary_max: 40000, salary_currency: 'PHP', salary_period: 'monthly', posted_at: hoursAgo(220), match_score: 28, matched_skills: ['JavaScript'],
      description: 'Entry-level role maintaining WordPress and small PHP sites.' }),
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch { return {}; }
  }
  function save(state) { try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch {} }
  let state = Object.assign({ statuses: {}, profile: null }, load());
  if (!state.statuses['linkedin:ln-4471']) {
    // A couple of pre-tracked jobs so the Saved tab isn't empty on first open.
    state.statuses['jsearch:gj-9102'] = 'saved';
    state.statuses['jobstreet:js-77290'] = 'applied';
    save(state);
  }

  const withStatus = (j) => Object.assign({}, j, { status: state.statuses[j.id] || null });

  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  async function handle(url, init) {
    const method = (init && init.method ? init.method : 'GET').toUpperCase();
    const u = new URL(url, location.href);
    const path = u.pathname.replace(/^.*?(?=\/api\/)/, '');

    if (path === '/api/health') return json({ ok: true, demo: true });

    if (path === '/api/feed') {
      await delay(u.searchParams.get('refresh') ? 900 : 250);
      const prof = state.profile || profile;
      const q = (u.searchParams.get('q') || prof.default_query).trim();
      const loc = (u.searchParams.get('location') ?? (prof.preferred_locations[0] || '')).trim();
      const sources = (u.searchParams.get('sources') || 'jsearch,linkedin,jobstreet,indeed').split(',').filter(Boolean);
      const remoteOnly = u.searchParams.get('remote_only') === 'true';
      const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2 && !['and', 'the', 'for'].includes(t));
      let list = jobs.map(withStatus).filter((j) => j.status !== 'dismissed' && sources.includes(j.source) && (!remoteOnly || j.is_remote));
      if (terms.length) {
        const generic = ['senior', 'engineer', 'developer', 'full', 'stack', 'software', 'lead'];
        const specific = terms.filter((t) => !generic.includes(t));
        if (specific.length) {
          list = list.filter((j) => specific.some((t) => (j.title + ' ' + j.description + ' ' + j.company).toLowerCase().includes(t)));
        }
      }
      if (loc && !/philippines|manila|remote/i.test(loc)) {
        list = list.filter((j) => j.is_remote || j.location.toLowerCase().includes(loc.toLowerCase()));
      }
      list.sort((a, b) => b.match_score - a.match_score);
      return json({ query: q, location: loc, sources, from_cache: !u.searchParams.get('refresh'), count: list.length, jobs: list });
    }

    let m = path.match(/^\/api\/jobs\/([^/]+)\/status$/);
    if (m && method === 'POST') {
      const id = decodeURIComponent(m[1]);
      let body = {};
      try { body = JSON.parse(init.body || '{}'); } catch {}
      if (body.status) state.statuses[id] = body.status; else delete state.statuses[id];
      save(state);
      return json({ id, status: body.status || null });
    }
    m = path.match(/^\/api\/jobs\/([^/]+)$/);
    if (m) {
      const j = jobs.find((x) => x.id === decodeURIComponent(m[1]));
      return j ? json(withStatus(j)) : json({ detail: 'Not found' }, 404);
    }

    if (path === '/api/tracked') {
      await delay(150);
      const out = { saved: [], applied: [], dismissed: [] };
      for (const j of jobs.map(withStatus)) if (j.status) out[j.status].push(j);
      return json(out);
    }

    if (path === '/api/profile') {
      if (method === 'PUT') {
        try { state.profile = Object.assign({}, profile, JSON.parse(init.body || '{}')); } catch {}
        save(state);
      }
      if (method === 'POST' || path.endsWith('/cv')) return json(state.profile || profile);
      return json(state.profile || profile);
    }
    if (path === '/api/profile/cv' && method === 'POST') {
      await delay(800);
      return json(state.profile || profile);
    }
    if (path === '/api/meta') {
      return json({ sources: [{ id: 'jsearch', label: 'Google Jobs' }, { id: 'linkedin', label: 'LinkedIn' }, { id: 'jobstreet', label: 'JobStreet' }, { id: 'indeed', label: 'Indeed' }], stats: { jobs: jobs.length } });
    }
    return json({ detail: 'Not found (demo)' }, 404);
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input && input.url ? input.url : String(input);
    if (/\/api\//.test(url) && !/^https?:\/\/(?!localhost)/.test(url) || /localhost:8811/.test(url)) {
      return handle(url, init);
    }
    return realFetch(input, init);
  };
  window.__JOBFINDER_DEMO__ = true;
})();
