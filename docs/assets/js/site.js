/* GM Modulars — site.js
   Vanilla JS, no dependencies. Every effect is progressive: content is
   readable and usable with JavaScript off or reduced motion on. */
(() => {
  const C = window.GM_CONFIG || {};
  const D = document, H = D.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DESK = () => matchMedia('(min-width: 901px)').matches;
  const $ = (s, r = D) => r.querySelector(s), $$ = (s, r = D) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const store = { get(k) { try { return sessionStorage.getItem(k) } catch { return null } }, set(k, v) { try { sessionStorage.setItem(k, v) } catch {} } };

  if (C.showPlaceholderLabels === false) H.classList.add('no-ph');
  H.classList.add('js');

  /* ---------- scroll loop (one rAF for everything) ---------- */
  const onScroll = [];
  let ticking = false;
  const run = () => { ticking = false; const y = scrollY, vh = innerHeight; onScroll.forEach(f => f(y, vh)); };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(run));

  /* ---------- header: theme by section underneath, hide on scroll down ---------- */
  const hdr = $('.hdr');
  if (hdr) {
    const themed = $$('[data-theme]');
    let lastY = scrollY;
    onScroll.push((y) => {
      const probe = hdr.offsetHeight / 2;
      let theme = 'dark';
      for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) { theme = s.dataset.theme; break; } }
      const overHero = !!$('[data-hero-zone]') && $('[data-hero-zone]').getBoundingClientRect().bottom > probe && y < innerHeight * .6;
      hdr.classList.toggle('is-light', theme === 'light');
      hdr.classList.toggle('is-solid-dark', theme === 'dark' && !overHero && y > 40);
      const menuOpen = D.body.classList.contains('menu-open');
      hdr.classList.toggle('is-hidden', !menuOpen && y > lastY && y > innerHeight * 1.2);
      lastY = y;
    });
  }

  /* ---------- mobile menu with focus trap ---------- */
  const mBtn = $('.menu-btn'), mNav = $('.mnav');
  if (mBtn && mNav) {
    const close = $('.mnav__close', mNav);
    const open = (on) => {
      mNav.classList.toggle('is-open', on); mBtn.setAttribute('aria-expanded', on);
      mNav.setAttribute('aria-hidden', !on); D.body.classList.toggle('menu-open', on);
      D.body.style.overflow = on ? 'hidden' : '';
      if (on) setTimeout(() => close.focus(), 50); else mBtn.focus();
    };
    mBtn.addEventListener('click', () => open(true));
    close.addEventListener('click', () => open(false));
    mNav.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') open(false);
      if (e.key === 'Tab') {
        const f = $$('a,button', mNav); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$('a', mNav).forEach(a => a.addEventListener('click', () => open(false)));
  }

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px', threshold: .01 });
  const armReveals = () => $$('[data-reveal], .lines:not([data-manual])').forEach(el => io.observe(el));

  /* ---------- opening sequence (home, once per session) ---------- */
  const intro = $('.intro');
  const heroLines = $('.hero .lines');
  const startHero = () => { heroLines && heroLines.classList.add('is-in'); };
  if (intro) {
    if (RM || store.get('gm-intro')) { intro.classList.add('done'); startHero(); }
    else {
      store.set('gm-intro', '1');
      const t = [];
      const finish = () => { t.forEach(clearTimeout); intro.classList.add('s1', 's2'); startHero(); setTimeout(() => intro.classList.add('done'), 1150); ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => removeEventListener(ev, skip)); };
      const skip = () => finish();
      t.push(setTimeout(() => intro.classList.add('s1'), 120));
      t.push(setTimeout(finish, 1500));
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, skip, { passive: true, once: true }));
    }
  } else if (heroLines) startHero();
  // inner-page heroes reveal on load
  $$('.phero .lines').forEach(l => requestAnimationFrame(() => setTimeout(() => l.classList.add('is-in'), 60)));

  /* ---------- home hero → services continuity ---------- */
  const hero = $('.hero');
  const svcEl = $('.hero + .svc');
  if (svcEl && (RM || !DESK())) svcEl.classList.add('is-docked');
  if (hero && !RM) {
    onScroll.push((y, vh) => {
      if (!DESK()) { hero.style.setProperty('--p', 0); return; }
      const r = hero.getBoundingClientRect();
      const p = clamp(-r.top / (hero.offsetHeight - vh));
      const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // ease in-out cubic
      hero.style.setProperty('--p', e.toFixed(4));
      hero.classList.toggle('is-end', p > .7);
      const done = r.top <= -(hero.offsetHeight - vh) + 1; // stage about to release
      hero.classList.toggle('is-handoff', done);
      svcEl && svcEl.classList.toggle('is-docked', done);
    });
  }

  /* ---------- services: active category drives the shared frame ---------- */
  const svc = $('.svc');
  if (svc) {
    const items = $$('.svc__item', svc), imgs = $$('.svc__frame img', svc), ticks = $$('.svc__tick i', svc), cap = $('.svc__cap', svc);
    let cur = -1;
    const set = (i) => {
      if (i === cur) return;
      imgs.forEach((im, k) => { im.classList.toggle('was-active', k === cur); im.classList.toggle('is-active', k === i); });
      items.forEach((it, k) => it.classList.toggle('is-active', k === i));
      ticks.forEach((t, k) => t.classList.toggle('on', k === i));
      if (cap) cap.textContent = items[i].dataset.name;
      svc.dataset.tone = i + 1; cur = i;
    };
    set(0);
    // Continuity: the first frame image keeps the hero's full-screen crop, and the hero clip lands on this frame's edges.
    const frame = $('.svc__frame', svc), first = imgs[0];
    const align = () => {
      if (!svcEl || !DESK() || RM) { first.removeAttribute('style'); return; }
      const fr = frame.getBoundingClientRect(), W = innerWidth, Hh = innerHeight;
      Object.assign(first.style, { inset: 'auto', maxWidth: 'none', width: W * 1.04 + 'px', height: Hh * 1.04 + 'px', left: (-fr.left - W * .02) + 'px', top: (-Hh * .13 - Hh * .02) + 'px' });
      hero && (hero.style.setProperty('--fl', fr.left + 'px'), hero.style.setProperty('--fr', (W - fr.right) + 'px'));
    };
    align(); addEventListener('resize', align);
    // Active = item nearest the middle of the viewport. (IntersectionObserver rootMargin is ignored inside cross-origin iframes, so measure directly.)
    onScroll.push((y, vh) => {
      let best = 0, bd = Infinity;
      items.forEach((it, k) => { const r = it.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < bd) { bd = d; best = k; } });
      set(best);
    });
  }

  /* ---------- factory: laminate stack separates with scroll ---------- */
  const fac = $('.fac');
  if (fac) {
    const stack = $('.stack', fac), proc = $('.process', fac);
    onScroll.push((y, vh) => {
      if (RM) { stack && stack.style.setProperty('--q', 1); proc && proc.style.setProperty('--q2', 1); return; }
      if (stack) { const r = stack.getBoundingClientRect(); stack.style.setProperty('--q', clamp((vh - r.top) / (vh * .9)).toFixed(3)); }
      if (proc) { const r = proc.getBoundingClientRect(); proc.style.setProperty('--q2', clamp((vh * .9 - r.top) / (vh * .5)).toFixed(3)); }
    });
  }

  /* ---------- project track: drag, arrows, progress ---------- */
  $$('[data-track]').forEach(wrap => {
    const tr = $('.track', wrap), prev = $('[data-prev]', wrap), next = $('[data-next]', wrap), bar = $('.progress i', wrap);
    if (!tr) return;
    const upd = () => {
      const max = tr.scrollWidth - tr.clientWidth; const p = max > 0 ? tr.scrollLeft / max : 0;
      if (bar) { const w = clamp(tr.clientWidth / tr.scrollWidth, .12, 1); bar.style.width = (w * 100) + '%'; bar.style.transform = `translateX(${p * (1 / w - 1) * 100}%)`; }
      if (prev) prev.disabled = tr.scrollLeft < 4; if (next) next.disabled = tr.scrollLeft > max - 4;
    };
    const step = () => (tr.querySelector('.card')?.offsetWidth || 400) + 24;
    prev && prev.addEventListener('click', () => tr.scrollBy({ left: -step(), behavior: RM ? 'auto' : 'smooth' }));
    next && next.addEventListener('click', () => tr.scrollBy({ left: step(), behavior: RM ? 'auto' : 'smooth' }));
    tr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    let down = false, sx = 0, sl = 0, moved = 0;
    tr.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = tr.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 6) tr.classList.add('is-drag'); tr.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => tr.classList.remove('is-drag'), 0); });
    tr.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); moved = 0; } }, true);
  });

  /* ---------- finish explorer (illustrative) ---------- */
  $$('[data-fx]').forEach(fx => {
    const svg = $('svg', fx.closest('.fx') || fx);
    $$('[role="radiogroup"]', fx).forEach(g => {
      const part = g.dataset.group, out = $(`output[for="${g.id}"]`, fx), chips = $$('.chip', g);
      const pick = (c, focus) => {
        chips.forEach(x => { const on = x === c; x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; });
        if (focus) c.focus();
        if (out) out.textContent = c.dataset.name;
        $$(`[data-part="${part}"]`, svg).forEach(p => p.setAttribute('fill', c.dataset.c));
        if (c.dataset.g) $$(`[data-part="${part}-grain"]`, svg).forEach(p => p.setAttribute('stroke', c.dataset.g));
      };
      chips.forEach((c, i) => {
        c.addEventListener('click', () => pick(c));
        c.addEventListener('keydown', e => {
          const k = e.key; let j = null;
          if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % chips.length;
          if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + chips.length) % chips.length;
          if (j !== null) { e.preventDefault(); pick(chips[j], true); }
        });
      });
      pick(chips.find(c => c.getAttribute('aria-checked') === 'true') || chips[0]);
    });
  });

  /* ---------- portfolio filter (hash-synced: #residential etc.) ---------- */
  const filters = $$('.filter');
  if (filters.length) {
    const cards = $$('.pgrid .card'), empty = $('.pgrid .empty');
    const apply = (cat, push) => {
      filters.forEach(f => f.setAttribute('aria-pressed', f.dataset.cat === cat));
      let n = 0; cards.forEach(c => { const on = cat === 'all' || (c.dataset.cats || '').split(' ').includes(cat); c.classList.toggle('is-hidden', !on); if (on) n++; });
      if (empty) empty.hidden = n > 0;
      if (push) history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat);
    };
    filters.forEach(f => f.addEventListener('click', () => apply(f.dataset.cat, true)));
    const fromHash = () => { const h = location.hash.slice(1); apply(filters.some(f => f.dataset.cat === h) ? h : 'all'); };
    fromHash(); addEventListener('hashchange', fromHash);
  }

  /* ---------- lightbox ---------- */
  const lb = $('.lb');
  if (lb) {
    const btns = $$('[data-lb]'), img = $('img', lb), count = $('[data-count]', lb);
    let i = 0, opener = null;
    const show = (k) => { i = (k + btns.length) % btns.length; const b = btns[i]; img.src = b.dataset.lb; img.alt = b.querySelector('img').alt; count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(btns.length).padStart(2, '0')}`; };
    const open = (k, b) => { opener = b; show(k); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); D.body.style.overflow = 'hidden'; $('.lb__close', lb).focus(); };
    const shut = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); D.body.style.overflow = ''; opener && opener.focus(); };
    btns.forEach((b, k) => b.addEventListener('click', () => open(k, b)));
    $('.lb__close', lb).addEventListener('click', shut);
    $('[data-lb-prev]', lb).addEventListener('click', () => show(i - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', e => { if (e.target === lb) shut(); });
    lb.addEventListener('keydown', e => {
      if (e.key === 'Escape') shut(); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'Tab') { const f = $$('button', lb); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && D.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && D.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
  }

  /* ---------- enquiry form ---------- */
  const form = $('#enquiry');
  if (form) {
    const status = $('.form__status', form);
    const rules = {
      name: v => v.trim().length >= 2 || 'Please enter your name.',
      phone: v => /^[+\d][\d\s-]{8,}$/.test(v.trim()) || 'Please enter a phone number we can call, e.g. +91 98401 90449.',
      email: v => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'That email doesn’t look complete — check for a missing @ or domain.',
      type: v => !!v || 'Choose the kind of space so we can prepare.',
    };
    const check = (el) => {
      const f = rules[el.name]; if (!f) return true;
      const r = f(el.value); const wrap = el.closest('.field'); const err = $('.err', wrap);
      const ok = r === true; wrap.classList.toggle('is-invalid', !ok); el.setAttribute('aria-invalid', !ok); err.textContent = ok ? '' : r; return ok;
    };
    $$('input,select,textarea', form).forEach(el => {
      el.addEventListener('blur', () => { if (el.value || el.closest('.field').classList.contains('is-invalid')) check(el); });
      el.addEventListener('input', () => { if (el.closest('.field')?.classList.contains('is-invalid')) check(el); });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fields = $$('input[name],select[name],textarea[name]', form).filter(el => rules[el.name]);
      const bad = fields.filter(el => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      const fd = new FormData(form); const data = Object.fromEntries(fd.entries());
      const btn = $('button[type="submit"]', form), label = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = 'Sending…';
      const lines = ['New enquiry — GM Modulars website', '', `Name: ${data.name}`, `Phone: ${data.phone}`];
      if (data.email) lines.push(`Email: ${data.email}`);
      lines.push(`Space: ${data.type}`);
      if (data.location) lines.push(`Location: ${data.location}`);
      if (data.message) lines.push('', data.message);
      const msg = lines.join('\n');
      let sent = false;
      if (C.formEndpoint) {
        try { const r = await fetch(C.formEndpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd }); sent = r.ok; } catch { sent = false; }
      }
      btn.disabled = false; btn.innerHTML = label;
      status.classList.add('is-on');
      if (sent) {
        status.innerHTML = `<strong>Thank you, ${escapeHtml(data.name)}.</strong> We've received your enquiry and will call you within one working day.`;
        form.reset();
      } else {
        const wa = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
        status.innerHTML = `<strong>Almost there — send it on WhatsApp.</strong> Your details are ready in a WhatsApp message to our team. <a class="link" href="${wa}" target="_blank" rel="noopener">Open WhatsApp</a> &nbsp; Or call <a href="tel:+919840190449">+91 98401 90449</a>.`;
      }
      status.focus();
    });
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* ---------- go ---------- */
  armReveals();
  run();
})();
