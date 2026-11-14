// GM Modulars — static site builder (no dependencies).
// node build.mjs  →  dist/
import fs from 'node:fs'; import path from 'node:path';
const SRC = 'src', OUT = process.env.OUT || 'docs'; // docs/ is served by GitHub Pages
const data = JSON.parse(fs.readFileSync(`${SRC}/data/site.json`, 'utf8'));
const co = data.company;
const LOGO = JSON.parse(fs.readFileSync(`${SRC}/data/logo.json`, 'utf8')); // {sym, word:[...]}

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>`;
const ARROW_L = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 12H5"/><path d="m11 6-6 6 6 6"/></svg>`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tel = p => 'tel:' + p.replace(/\s/g, '');

// ---------- logo (inline SVG; G + wordmark currentColor, M bronze) ----------
let lid = 0;
function logoHz(label = 'GM Modulars — home') {
  const id = 'mc' + (++lid);
  const w = LOGO.word.map(d => `<path d="${d}"/>`).join('');
  return `<svg class="logo-hz" viewBox="0 0 1674.5 319.3" role="img" aria-label="${label}"><defs><clipPath id="${id}"><polygon points="385.09,150 385.09,265 407,265 539,397 539,500 770,500 770,150"/></clipPath></defs><g fill-rule="evenodd" transform="translate(-100 -169.914)"><path d="${LOGO.sym}"/><g transform="translate(830 409.414) scale(1.7236) translate(-151 -537.9)">${w}</g></g><path class="m" fill-rule="evenodd" clip-path="url(#${id})" transform="translate(-100 -169.914)" d="${LOGO.sym}"/></svg>`;
}

// ---------- image helper ----------
const img = (root, name, alt, { cls = '', sizes = '100vw', eager = false, vt = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="${root}assets/img/${name}-1600.webp" srcset="${root}assets/img/${name}-800.webp 800w, ${root}assets/img/${name}-1600.webp 1600w" sizes="${sizes}" alt="${esc(alt)}" width="1600" height="900"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${vt ? ` style="view-transition-name:${vt}"` : ''}>`;
const ALT = {
  residential: 'Living room with travertine fireplace wall, boucle sofas and a walnut coffee table',
  corporate: 'Boardroom with a long walnut table, upholstered chairs and glass partitions',
  kitchen: 'Kitchen with walnut cabinetry and a veined stone island with bar stools',
  furniture: 'Boucle armchair with a curved walnut frame beside a low wooden table',
  signage: 'Brushed bronze GM Modulars sign mounted on a travertine wall',
  stationery: 'GM Modulars stationery set on a stone surface'
};
const PH = (txt = 'Illustrative image') => `<span class="ph">${txt}</span>`;

// ---------- components ----------
const C = {
  logo: () => logoHz(),
  card: (root, p, { sizes = '(max-width:900px) 80vw, 40vw' } = {}) => `
    <a class="card" href="${root}projects/${p.slug}.html" data-cat="${p.category}">
      <div class="card__img">${img(root, p.img, ALT[p.img], { sizes, vt: 'p-' + p.slug })}${p.placeholder ? PH('Placeholder project') : ''}</div>
      <div class="card__body"><div><h3>${esc(p.title)}</h3><span class="label">${esc(p.categoryName)} · ${esc(p.location)}</span></div><span class="card__arrow" aria-hidden="true">${ARROW}</span></div>
    </a>`,
  cards: (root, filter) => data.projects.filter(p => !filter || filter === 'all' || p.category === filter).map(p => C.card(root, p)).join(''),
  fx: (root) => {
    const F = data.finishes;
    const group = (key, label, list, def) => `
      <div class="fx__group"><h3 id="fx-${key}-l"><span>${label}</span><output for="fx-${key}" aria-live="polite"></output></h3>
      <div class="chips" role="radiogroup" id="fx-${key}" data-group="${key}" aria-labelledby="fx-${key}-l">
      ${list.map((f, i) => `<button type="button" class="chip" role="radio" aria-checked="${f.id === def}" tabindex="${f.id === def ? 0 : -1}" aria-label="${f.name}" title="${f.name}" data-name="${f.name}" data-c="${f.c}"${f.g ? ` data-g="${f.g}"` : ''} style="--sw:${f.c}"></button>`).join('')}
      </div></div>`;
    return `
    <div class="fx">
      <div class="fx__view" data-reveal="img">
        ${PH('Illustrative demonstration')}
        <svg viewBox="0 0 800 560" role="img" aria-label="Kitchen elevation showing the selected finishes">
          <defs><pattern id="grain" width="140" height="24" patternUnits="userSpaceOnUse"><path data-part="shutter-grain" d="M0 6c30-3 50 4 80 1s45-3 60 0M0 17c25 2 55-3 85 0s40 2 55-1" fill="none" stroke="#4A3528" stroke-width="1.2" opacity=".55"/></pattern></defs>
          <rect x="0" y="0" width="800" height="560" fill="#F4F0E9"/>
          <rect x="0" y="470" width="800" height="90" fill="#D9D0C2"/>
          <!-- backsplash -->
          <rect data-part="counter" x="60" y="190" width="680" height="120" fill="#E2D6C3" opacity=".75"/>
          <!-- upper cabinets -->
          ${[60, 230, 400, 570].map(x => `<rect data-part="shutter" x="${x}" y="40" width="166" height="140" fill="#5E4535"/><rect x="${x}" y="40" width="166" height="140" fill="url(#grain)"/><rect data-part="hardware" x="${x + 70}" y="166" width="26" height="4" fill="#A58869"/>`).join('')}
          <!-- base cabinets -->
          ${[60, 230, 400, 570].map(x => `<rect data-part="shutter" x="${x}" y="330" width="166" height="140" fill="#5E4535"/><rect x="${x}" y="330" width="166" height="140" fill="url(#grain)"/><rect data-part="hardware" x="${x + 70}" y="344" width="26" height="4" fill="#A58869"/>`).join('')}
          <!-- counter -->
          <rect data-part="counter" x="52" y="310" width="696" height="20" fill="#E2D6C3"/>
          <rect x="52" y="329" width="696" height="2" fill="rgba(0,0,0,.12)"/>
          <!-- tap & objects -->
          <path d="M470 310v-46a14 14 0 0 1 28 0" fill="none" stroke="#7A5F44" stroke-width="5"/>
          <rect x="140" y="270" width="54" height="40" rx="4" fill="#C9C1B6"/><circle cx="640" cy="290" r="20" fill="#A58869" opacity=".7"/>
          <rect x="52" y="470" width="696" height="6" fill="#171717" opacity=".85"/>
        </svg>
      </div>
      <div class="fx__ctrl" data-fx>
        ${group('shutter', 'Shutter finish', F.shutter, 'walnut')}
        ${group('counter', 'Counter & backsplash', F.counter, 'travertine')}
        ${group('hardware', 'Handles', F.hardware, 'bronze')}
        <p class="fx__note">An illustrative demonstration of how finishes work together. Your actual laminate, stone and hardware options are selected with you at consultation.</p>
      </div>
    </div>`;
  },
  contactList: () => `
    <div class="contact-list">
      <a href="${tel(co.phones[0])}"><span class="label">Call</span><strong>${co.phones[0]}<br>${co.phones[1]}</strong></a>
      <a href="https://wa.me/${co.whatsapp}" target="_blank" rel="noopener"><span class="label">WhatsApp</span><strong>${co.phones[0]}</strong></a>
      <a href="mailto:${co.email}"><span class="label">Email</span><strong>${co.email}</strong></a>
      <a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(co.mapsQuery)}" target="_blank" rel="noopener"><span class="label">Visit</span><strong>${co.address}</strong></a>
    </div>`,
  cta: (root) => `
  <section class="section dark cta" data-theme="dark" aria-labelledby="cta-h">
    <div class="wrap">
      <div class="cta__grid">
        <h2 id="cta-h" class="h-display lines"><span class="ln"><span>Let’s design</span></span><span class="ln"><span style="--i:1">your <em class="accent">space.</em></span></span></h2>
        <div class="cta__side" data-reveal>
          <p class="lead">Tell us about your home, office or kitchen. We’ll visit, measure and talk it through with you.</p>
          <a class="btn btn--solid" href="${root}contact.html">Start a project ${ARROW}</a>
        </div>
      </div>
      ${C.contactList()}
    </div>
  </section>`,
  svcCaps: (s) => `<ul class="svc__caps">${s.caps.map(c => `<li>${esc(c[0])}<span>${esc(c[1])}</span></li>`).join('')}</ul>`,
};

// ---------- partials ----------
const NAV = [['residential', 'residential.html', 'Residential'], ['commercial', 'commercial.html', 'Commercial'], ['kitchens', 'kitchens.html', 'Kitchens'], ['furniture', 'furniture.html', 'Furniture'], ['projects', 'projects.html', 'Projects'], ['materials', 'materials.html', 'Materials'], ['about', 'about.html', 'About']];
const head = (m, root, rel) => `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
<link rel="canonical" href="${co.siteUrl}/${rel === 'index.html' ? '' : rel}">
<meta name="theme-color" content="#171717">
<meta property="og:type" content="website"><meta property="og:site_name" content="GM Modulars">
<meta property="og:title" content="${esc(m.title)}"><meta property="og:description" content="${esc(m.desc)}">
<meta property="og:image" content="${co.siteUrl}/assets/img/og-image.png"><meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}assets/logo/favicon.ico" sizes="any">
<link rel="icon" href="${root}assets/logo/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}assets/logo/apple-touch-icon.png">
<link rel="preload" href="${root}assets/fonts/newsreader.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/geist.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/css/site.css">
${m.preload ? `<link rel="preload" as="image" href="${root}assets/img/${m.preload}-1600.webp" imagesrcset="${root}assets/img/${m.preload}-800.webp 800w, ${root}assets/img/${m.preload}-1600.webp 1600w" imagesizes="100vw">` : ''}
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', name: co.name, description: 'Interior design and build company in Chennai with its own factory for modular kitchens, furniture, doors and woodwork.', telephone: co.phones[0].replace(/\s/g, ''), email: co.email, url: co.siteUrl, image: co.siteUrl + '/assets/img/og-image.png', address: { '@type': 'PostalAddress', streetAddress: '7/137, Ground Floor, Kundrathur Main Road, Kovur', addressLocality: 'Chennai', postalCode: '600128', addressRegion: 'Tamil Nadu', addressCountry: 'IN' }, areaServed: 'Tamil Nadu' })}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;
const header = (m, root) => `
<header class="hdr" role="banner">
  <div class="wrap hdr__in">
    <a class="hdr__logo" href="${root}index.html">${logoHz()}</a>
    <nav class="nav" aria-label="Main">
      ${NAV.map(([k, h, t]) => `<a href="${root}${h}"${m.nav === k ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
    </nav>
    <a class="btn" href="${root}contact.html">Start a project ${ARROW}</a>
    <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
  </div>
</header>
<div class="mnav" id="mnav" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Menu">
  <button class="mnav__close" aria-label="Close menu"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
  <span class="kicker">Menu</span>
  <ol>
    <li><a href="${root}index.html" style="--i:0">Home</a></li>
    ${NAV.map(([k, h, t], i) => `<li><a href="${root}${h}" style="--i:${i + 1}"${m.nav === k ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}
    <li><a href="${root}contact.html" style="--i:8">Start a project</a></li>
  </ol>
  <div class="mnav__foot"><a href="${tel(co.phones[0])}">${co.phones[0]}</a><a href="mailto:${co.email}">${co.email}</a><span>${co.addressShort}</span></div>
</div>`;
const footer = (m, root) => `
<footer class="ftr" data-theme="dark">
  <div class="wrap">
    <div class="ftr__grid">
      <div class="ftr__brand"><a href="${root}index.html" style="display:inline-block">${logoHz('GM Modulars')}</a><p>Interior design and build from Chennai, with our own factory for modular kitchens, furniture, doors and woodwork.</p></div>
      <div class="ftr__col"><h2>Services</h2><ul>${data.services.map(s => `<li><a href="${root}${s.page}">${s.name}</a></li>`).join('')}</ul></div>
      <div class="ftr__col"><h2>Studio</h2><ul><li><a href="${root}projects.html">Projects</a></li><li><a href="${root}materials.html">Materials &amp; finishes</a></li><li><a href="${root}about.html">About</a></li><li><a href="${root}contact.html">Start a project</a></li></ul></div>
      <div class="ftr__contact ftr__col"><h2>Contact</h2><ul><li><a href="${tel(co.phones[0])}">${co.phones[0]}</a> · <a href="${tel(co.phones[1])}">${co.phones[1]}</a></li><li><a href="mailto:${co.email}">${co.email}</a></li><li style="color:var(--ash)">${co.address}</li></ul></div>
    </div>
    <div class="ftr__base"><span>© <span data-year>2026</span> GM Modulars</span><span>Chennai · Tamil Nadu</span></div>
  </div>
</footer>
<script src="${root}assets/js/config.js"></script>
<script src="${root}assets/js/site.js" defer></script>
<script>document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear())</script>
</body>
</html>`;

// ---------- page assembly ----------
const pages = [];
function render(tpl, root, m) {
  return tpl
    .replace(/\{\{@(\w+)(?:\s+([\w-]+))?\}\}/g, (_, fn, arg) => C[fn](root, arg))
    .replace(/\{\{img\s+([\w-]+)(?:\s+([\w-]+))?(\s+eager)?\}\}/g, (_, n, cls, e) => img(root, n, ALT[n], { cls: cls || '', eager: !!e }))
    .replace(/\{\{ph\}\}/g, PH())
    .replace(/\{\{arrow\}\}/g, ARROW).replace(/\{\{arrowL\}\}/g, ARROW_L)
    .replace(/\{\{root\}\}/g, root)
    .replace(/\{\{co\.(\w+)(?:\.(\d))?\}\}/g, (_, k, i) => i !== undefined ? co[k][i] : co[k])
    .replace(/\{\{tel(\d)\}\}/g, (_, i) => tel(co.phones[i]));
}
function emit(rel, m, body) {
  const root = rel.includes('/') ? '../' : '';
  const html = head(m, root, rel) + header(m, root) + `\n<main id="main">` + render(body, root, m) + `</main>` + footer(m, root);
  fs.mkdirSync(path.dirname(`${OUT}/${rel}`), { recursive: true });
  fs.writeFileSync(`${OUT}/${rel}`, html); pages.push(rel);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(`${SRC}/assets`, `${OUT}/assets`, { recursive: true });

// static pages from src/pages
for (const f of fs.readdirSync(`${SRC}/pages`)) {
  const raw = fs.readFileSync(`${SRC}/pages/${f}`, 'utf8');
  const mm = raw.match(/^<!--meta\s+([\s\S]*?)-->/); const m = JSON.parse(mm[1]);
  let body = raw.slice(mm[0].length);
  if (m.service) body = servicePage(m.service) ;
  emit(f, m, body);
}
// project case studies
data.projects.forEach((p, i) => {
  const nx = data.projects[(i + 1) % data.projects.length];
  emit(`projects/${p.slug}.html`, { title: `${p.title} — ${p.categoryName} | GM Modulars`, desc: `${p.title}: ${p.scope}. A GM Modulars project in ${p.location}.`, nav: 'projects', preload: p.img }, projectPage(p, nx));
});
// sitemap + robots
fs.writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${co.siteUrl}/${p === 'index.html' ? '' : p}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(`${OUT}/.nojekyll`, '');
fs.writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${co.siteUrl}/sitemap.xml\n`);
console.log('built', pages.length, 'pages');

// ---------- templates built from data ----------
function servicePage(slug) {
  const s = data.services.find(x => x.slug === slug);
  const copy = JSON.parse(fs.readFileSync(`${SRC}/data/services-copy.json`, 'utf8'))[slug];
  const others = data.services.filter(x => x.slug !== slug);
  return `
  <section class="phero" data-theme="dark" data-hero-zone>
    <div class="phero__img">${img('{{root}}', s.img, ALT[s.img], { eager: true })}${PH()}</div>
    <div class="wrap phero__copy">
      <nav class="crumbs kicker" aria-label="Breadcrumb" style="gap:.6rem"><a href="{{root}}index.html">Home</a><span aria-hidden="true">/</span><span>${s.short}</span></nav>
      <h1 class="h-xl lines"><span class="ln"><span>${copy.h1[0]}</span></span><span class="ln"><span style="--i:1">${copy.h1[1]}</span></span></h1>
      <p class="lead" data-reveal>${s.intro}</p>
    </div>
  </section>
  <section class="section" data-theme="light">
    <div class="wrap split">
      <div class="split__l"><span class="kicker" data-reveal>${s.num} — What we do</span><h2 class="h1 lines" style="margin-top:1.5rem"><span class="ln"><span>${copy.h2}</span></span></h2></div>
      <div class="split__r">
        ${copy.body.map((p, i) => `<p class="lead" data-reveal style="--i:${i}">${p}</p>`).join('')}
        <ul class="caps">${copy.caps.map((c, i) => `<li data-reveal style="--i:${i}"><span class="label">${String(i + 1).padStart(2, '0')}</span><div><h3>${c[0]}</h3><p>${c[1]}</p></div></li>`).join('')}</ul>
      </div>
    </div>
  </section>
  <section class="section trav" data-theme="light" style="padding-top:0;background:var(--ivory)">
    <div class="wrap duo">
      <figure class="fig" data-reveal="img">${img('{{root}}', copy.imgs[0], ALT[copy.imgs[0]], { sizes: '(max-width:900px) 100vw, 58vw' })}${PH()}</figure>
      <figure class="fig" data-reveal="img" style="--i:1">${img('{{root}}', copy.imgs[1], ALT[copy.imgs[1]], { sizes: '(max-width:900px) 100vw, 40vw' })}${PH()}</figure>
    </div>
  </section>
  <section class="section dark" data-theme="dark">
    <div class="wrap split">
      <div class="split__l"><span class="kicker" data-reveal>How it works</span><h2 class="h1 lines" style="margin-top:1.5rem"><span class="ln"><span>One team,</span></span><span class="ln"><span style="--i:1">drawing to <em class="accent">fitting.</em></span></span></h2></div>
      <div class="split__r"><ul class="caps">${[['Visit & measure', 'We see the space, understand how you use it and take exact measurements.'], ['Design', 'Layouts, materials and finishes, worked out with you.'], ['Make', 'Built in our own factory, with laminate, edge banding and finishing in-house.'], ['Install', 'Fitted on site by our own team.']].map((c, i) => `<li data-reveal style="--i:${i}"><span class="label">${String(i + 1).padStart(2, '0')}</span><div><h3>${c[0]}</h3><p>${c[1]}</p></div></li>`).join('')}</ul></div>
    </div>
  </section>
  <section class="section" data-theme="light" data-track>
    <div class="wrap work__head"><div><span class="kicker" data-reveal>Related work</span><h2 class="h1 lines" style="margin-top:1.5rem"><span class="ln"><span>${s.short} <em class="accent">projects</em></span></span></h2></div><a class="link" href="{{root}}projects.html#${s.slug}">All projects {{arrow}}</a></div>
    <div class="track">${C.cards('{{root}}', s.slug)}</div>
  </section>
  <section class="section trav" data-theme="light">
    <div class="wrap"><span class="kicker" data-reveal>Explore other spaces</span>
      <div class="caps" style="margin-top:2rem">${others.map(o => `<a href="{{root}}${o.page}" class="svc-row" data-reveal style="display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;border-top:1px solid var(--rule)"><span style="display:flex;gap:1.5rem;align-items:baseline"><span class="label" style="color:var(--bd)">${o.num}</span><span class="h2">${o.name}</span></span><span class="card__arrow">{{arrow}}</span></a>`).join('')}</div>
    </div>
  </section>
  {{@cta}}`;
}
function projectPage(p, nx) {
  const root = '{{root}}';
  return `
  <section class="phero" data-theme="dark" data-hero-zone>
    <div class="phero__img">${img(root, p.img, ALT[p.img], { eager: true, vt: 'p-' + p.slug })}${p.placeholder ? PH('Placeholder project') : ''}</div>
    <div class="wrap phero__copy">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="{{root}}projects.html">Projects</a><span aria-hidden="true">/</span><span>${p.categoryName}</span></nav>
      <h1 class="h-xl lines"><span class="ln"><span>${esc(p.title)}</span></span></h1>
    </div>
  </section>
  <section class="section" data-theme="light">
    <div class="wrap">
      ${p.placeholder ? `<div class="notice" data-reveal><span class="label">Placeholder</span><span>This is a case-study template. The photographs are illustrative and the details below are placeholders — replace them with a real GM Modulars project in <code>src/data/site.json</code>.</span></div>` : ''}
      <dl class="facts" style="margin-top:3rem">
        <div data-reveal><dt>Type</dt><dd>${p.categoryName}</dd></div>
        <div data-reveal style="--i:1"><dt>Location</dt><dd>${p.location}</dd></div>
        <div data-reveal style="--i:2"><dt>Scope</dt><dd>${p.scope}</dd></div>
        <div data-reveal style="--i:3"><dt>Completed</dt><dd>${p.year}</dd></div>
      </dl>
      <div class="split" style="margin-top:clamp(4rem,8vw,7rem)">
        <div class="split__l"><span class="kicker" data-reveal>The brief</span></div>
        <div class="split__r"><p class="lead" data-reveal>[What the client needed, the site and its constraints — two or three sentences.]</p></div>
        <div class="split__l"><span class="kicker" data-reveal>Our approach</span></div>
        <div class="split__r"><p class="lead" data-reveal>[Layout decisions, materials and finishes, and what was made in the GM factory.]</p></div>
        <div class="split__l"><span class="kicker" data-reveal>The result</span></div>
        <div class="split__r"><p class="lead" data-reveal>[How the space works now, in the client's terms.]</p></div>
      </div>
    </div>
  </section>
  <section class="section" data-theme="light" style="padding-top:0">
    <div class="wrap gallery">${p.gallery.map((g, i) => `<button type="button" data-lb="{{root}}assets/img/${g}-1600.webp" aria-label="Open image ${i + 1} of ${p.gallery.length}" data-reveal="img">${img(root, g, ALT[g], { sizes: i % 3 === 0 ? '100vw' : '(max-width:900px) 100vw, 50vw' })}${PH()}</button>`).join('')}</div>
  </section>
  <a class="nextp" href="{{root}}projects/${nx.slug}.html" data-theme="dark">
    ${img(root, nx.img, ALT[nx.img], { vt: 'p-' + nx.slug })}
    <div class="wrap nextp__in"><span class="kicker">Next project</span><span class="h-display" style="margin-top:1.25rem">${esc(nx.title)}</span><span class="link" style="margin-top:2rem;align-self:flex-start;color:var(--bl)">View project {{arrow}}</span></div>
  </a>
  <div class="lb" role="dialog" aria-modal="true" aria-label="Image viewer" aria-hidden="true">
    <img src="" alt="">
    <button class="iconbtn lb__close" aria-label="Close viewer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
    <div class="lb__bar"><span class="label" data-count></span><span style="display:flex;gap:.5rem"><button class="iconbtn" data-lb-prev aria-label="Previous image">{{arrowL}}</button><button class="iconbtn" data-lb-next aria-label="Next image">{{arrow}}</button></span></div>
  </div>
  {{@cta}}`;
}
