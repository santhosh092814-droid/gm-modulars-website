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
const DIM = JSON.parse(fs.readFileSync(`${SRC}/data/img-dims.json`, 'utf8'));
const img = (root, name, alt, { cls = '', sizes = '100vw', eager = false, vt = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="${root}assets/img/${name}-1600.webp" srcset="${root}assets/img/${name}-800.webp 800w, ${root}assets/img/${name}-1600.webp 1600w" sizes="${sizes}" alt="${esc(alt)}" width="${(DIM[name] || [1600, 900])[0]}" height="${(DIM[name] || [1600, 900])[1]}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${vt ? ` style="view-transition-name:${vt}"` : ''}>`;
const ALT = data.images || {};
const PH = (txt) => txt ? `<span class="ph">${txt}</span>` : ''; // photos are real GM work: no label by default

// ---------- components ----------
const C = {
  logo: () => logoHz(),
  card: (root, p, { sizes = '(max-width:900px) 80vw, 40vw' } = {}) => `
    <a class="card" href="${root}projects/${p.slug}.html" data-cats="${p.cats.join(' ')}">
      <div class="card__img">${img(root, p.img, ALT[p.img], { sizes, vt: 'p-' + p.slug })}</div>
      <div class="card__body"><div><h3>${esc(p.title)}</h3><span class="label">${esc(p.categoryName)} · ${esc(p.scope)}</span></div><span class="card__arrow" aria-hidden="true">${ARROW}</span></div>
    </a>`,
  cards: (root, filter) => data.projects.filter(p => !filter || filter === 'all' || p.cats.includes(filter)).sort((x, y) => (!filter || filter === 'all') ? 0 : (x.category === filter ? 0 : 1) - (y.category === filter ? 0 : 1)).map(p => C.card(root, p)).join(''),
  fx: (root) => `
    <div class="fx" data-fx-studio data-reveal>
      <noscript><p class="fx__note">The finish studio needs JavaScript. Call us to see real samples.</p></noscript>
    </div>
    <script src="${root}assets/js/fx.js" defer></script>`,
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
        <h2 id="cta-h" class="h-display lines"><span class="ln"><span>Let’s design</span></span><span class="ln"><span style="--i:1">your space.</span></span></h2>
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
<script>/* Open every page at the top. Embedded previews and some browsers keep the previous page's scroll position; Back/Forward and real #anchors still work. */
(function(){function top(){var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(n&&n.type==='back_forward')return;var h=location.hash.slice(1);if(h&&document.getElementById(h))return;window.scrollTo(0,0)}top();document.addEventListener('DOMContentLoaded',top);addEventListener('load',function(){top();setTimeout(top,60)});addEventListener('pageshow',function(e){if(!e.persisted)top()})})();</script>

${m.preload ? `<link rel="preload" as="image" fetchpriority="high" href="${root}assets/img/${m.preload}-1600.webp" imagesrcset="${root}assets/img/${m.preload}-800.webp 800w, ${root}assets/img/${m.preload}-1600.webp 1600w" imagesizes="100vw">` : ''}
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
    <button type="button" class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
  </div>
</header>
<div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="Menu" inert>
  <button type="button" class="mnav__close" aria-label="Close menu"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
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
  const html = (head(m, root, rel) + header(m, root) + `\n<main id="main">` + render(body, root, m) + `</main>` + footer(m, root))
    .replace(/(>[^<]*?)\+91 (\d{5}) (\d{5})/g, '$1+91&nbsp;$2&nbsp;$3');
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
  emit(`projects/${p.slug}.html`, { title: `${p.title} — ${p.categoryName} | GM Modulars`, desc: `${p.title}: ${p.scope}. ${p.brief}`.slice(0, 158), nav: 'projects', preload: p.img }, projectPage(p, nx));
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
      <div class="split__l"><span class="kicker" data-reveal>What we do</span><h2 class="h1 lines" style="margin-top:1.5rem"><span class="ln"><span>${copy.h2}</span></span></h2></div>
      <div class="split__r">
        ${copy.body.map((p, i) => `<p class="lead" data-reveal style="--i:${i}">${p}</p>`).join('')}
        <ul class="caps">${copy.caps.map((c, i) => `<li data-reveal style="--i:${i}"><span class="label">${String(i + 1)}</span><div><h3>${c[0]}</h3><p>${c[1]}</p></div></li>`).join('')}</ul>
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
      <div class="split__l"><span class="kicker" data-reveal>How it works</span><h2 class="h1 lines" style="margin-top:1.5rem"><span class="ln"><span>One team,</span></span><span class="ln"><span style="--i:1">drawing to fitting.</span></span></h2></div>
      <div class="split__r"><ul class="caps">${[['Visit & measure', 'We see the space, understand how you use it and take exact measurements.'], ['Design', 'Layouts, materials and finishes, worked out with you.'], ['Make', 'Built in our own factory, with laminate, edge banding and finishing in-house.'], ['Install', 'Fitted on site by our own team.']].map((c, i) => `<li data-reveal style="--i:${i}"><span class="label">${String(i + 1)}</span><div><h3>${c[0]}</h3><p>${c[1]}</p></div></li>`).join('')}</ul></div>
    </div>
  </section>
  <section class="section" data-theme="light" data-track>
    <div class="wrap work__head"><div><span class="kicker" data-reveal>Related work</span><h2 class="h1 lines" style="margin-top:1.5rem"><span class="ln"><span>${s.short} projects</span></span></h2></div><a class="link" href="{{root}}projects.html#${s.slug}">All projects {{arrow}}</a></div>
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
    <div class="phero__img">${img(root, p.img, ALT[p.img], { eager: true, vt: 'p-' + p.slug })}</div>
    <div class="wrap phero__copy">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="{{root}}projects.html">Projects</a><span aria-hidden="true">/</span><span>${p.categoryName}</span></nav>
      <h1 class="h-xl lines"><span class="ln"><span>${esc(p.title)}</span></span></h1>
    </div>
  </section>
  <section class="section" data-theme="light">
    <div class="wrap">
      <dl class="facts">
        <div data-reveal><dt>Type</dt><dd>${p.categoryName}</dd></div>
        <div data-reveal style="--i:1"><dt>Spaces</dt><dd>${p.spaces}</dd></div>
        <div data-reveal style="--i:2"><dt>Scope</dt><dd>${p.scope}</dd></div>
        <div data-reveal style="--i:3"><dt>Made in our factory</dt><dd>${p.made}</dd></div>
      </dl>
      <div class="split" style="margin-top:clamp(4rem,8vw,7rem)">
        <div class="split__l"><h2 class="kicker" data-reveal>The brief</h2></div>
        <div class="split__r"><p class="lead ink" data-reveal>${esc(p.brief)}</p></div>
        <div class="split__l"><h2 class="kicker" data-reveal>What they needed</h2></div>
        <div class="split__r"><ul class="caps" style="margin-top:0">${p.needs.map((n, i) => `<li data-reveal style="--i:${i}"><span class="label">${String(i + 1)}</span><div><p class="t">${esc(n)}</p></div></li>`).join('')}</ul></div>
        <div class="split__l"><h2 class="kicker" data-reveal>What we did</h2></div>
        <div class="split__r">${p.approach.map((t, i) => `<p class="lead" data-reveal style="--i:${i}">${esc(t)}</p>`).join('')}</div>
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
  <div class="lb" role="dialog" aria-modal="true" aria-label="Image viewer" inert>
    <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="">
    <button type="button" class="iconbtn lb__close" aria-label="Close viewer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
    <div class="lb__bar"><span class="label" data-count></span><span style="display:flex;gap:.5rem"><button type="button" class="iconbtn" data-lb-prev aria-label="Previous image">{{arrowL}}</button><button type="button" class="iconbtn" data-lb-next aria-label="Next image">{{arrow}}</button></span></div>
  </div>
  {{@cta}}`;
}
