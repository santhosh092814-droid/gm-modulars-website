/* GM Modulars — kitchen finish studio (illustrative).
   Draws a kitchen in SVG; every surface is a pattern built from SVG noise
   filters (wood grain, stone veining, banding, speckle), so finishes look
   like materials rather than flat colour. No dependencies. */
(() => {
  const root = document.querySelector('[data-fx-studio]');
  if (!root) return;
  const WA = (window.GM_CONFIG && window.GM_CONFIG.whatsapp) || '919840190449';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- material library ---------- */
  // layer: {t:noise type, f:baseFrequency, o:octaves, s:seed, c:colour, k/off: alpha = k*noise+off, tb: alpha table}
  const M = {
    wood: (base, grain, dir = 'v') => ({ base, layers: [
      { t: 'fractalNoise', f: dir === 'v' ? '0.07 0.0045' : '0.0045 0.07', o: 3, s: 4, c: grain, k: 1.9, off: -0.62 },
      { t: 'fractalNoise', f: dir === 'v' ? '0.6 0.018' : '0.018 0.6', o: 2, s: 9, c: grain, k: 0.9, off: -0.32 }] }),
    matte: (base) => ({ base, layers: [{ t: 'fractalNoise', f: '0.9', o: 2, s: 2, c: '#000000', k: 0.16, off: -0.05 }] }),
    gloss: (base) => ({ base, sheen: true, layers: [{ t: 'fractalNoise', f: '0.9', o: 2, s: 2, c: '#000000', k: 0.08, off: -0.03 }] }),
    concrete: (base) => ({ base, layers: [
      { t: 'fractalNoise', f: '0.012', o: 4, s: 6, c: '#000000', k: 0.55, off: -0.22 },
      { t: 'fractalNoise', f: '0.7', o: 2, s: 3, c: '#ffffff', k: 0.4, off: -0.2 }] }),
    marble: (base, vein, seed = 3) => ({ base, layers: [
      { t: 'fractalNoise', f: '0.005', o: 4, s: seed, c: vein, k: 0.5, off: -0.24 },
      { t: 'turbulence', f: '0.0032 0.0075', o: 4, s: seed + 7, c: vein, tb: '0 1 0.55 0.12 0 0 0 0 0 0 0 0' }] }),
    travertine: (base, band) => ({ base, layers: [
      { t: 'fractalNoise', f: '0.0018 0.045', o: 3, s: 5, c: band, k: 1.25, off: -0.48 },
      { t: 'fractalNoise', f: '0.4', o: 2, s: 11, c: band, tb: '0 0 0 0 0 0 0 0.55 0.9 0.9' }] }),
    speckle: (base, chip, chip2 = '#ffffff', size = '0.28') => ({ base, layers: [
      { t: 'fractalNoise', f: size, o: 1, s: 7, c: chip, tb: '0 0 0 0 0 0 0 0.9 1 1' },
      { t: 'fractalNoise', f: size, o: 1, s: 21, c: chip2, tb: '0 0 0 0 0 0 0 0 0.85 1' }] }),
    plaster: (base) => ({ base, layers: [{ t: 'fractalNoise', f: '0.008', o: 4, s: 12, c: '#000000', k: 0.12, off: -0.05 }, { t: 'fractalNoise', f: '0.8', o: 1, s: 1, c: '#000000', k: 0.08, off: -0.03 }] }),
  };
  const sw = {
    wood: (c, g) => `repeating-linear-gradient(90deg,${c} 0 3px,${g} 3px 4px,${c} 4px 9px,${g}55 9px 11px,${c} 11px 15px)`,
    stone: (c, v) => `linear-gradient(125deg,${c} 0 38%,${v}99 40%,${c} 43% 70%,${v}66 72%,${c} 75%)`,
    band: (c, v) => `repeating-linear-gradient(0deg,${c} 0 5px,${v}88 5px 6px,${c} 6px 13px)`,
    speck: (c, v) => `radial-gradient(${v} 1px,transparent 1.5px) 0 0/7px 7px,radial-gradient(#fff 1px,transparent 1.5px) 3px 4px/9px 9px,${c}`,
    flat: (c) => c,
    gloss: (c) => `linear-gradient(135deg,${c} 0 45%,#ffffff55 50%,${c} 58%)`,
  };

  const F = {
    shutter: [
      ['walnut', 'Walnut', M.wood('#5A3F2E', '#2E1D12'), sw.wood('#5A3F2E', '#3B271B')],
      ['smoked-oak', 'Smoked oak', M.wood('#6E5643', '#3A2A1E'), sw.wood('#6E5643', '#4A3828')],
      ['natural-oak', 'Natural oak', M.wood('#B8936A', '#7E5F3E'), sw.wood('#B8936A', '#8A6A45')],
      ['teak', 'Teak', M.wood('#97663B', '#5C3A1C'), sw.wood('#97663B', '#6A4424')],
      ['ash', 'Bleached ash', M.wood('#D9CBB2', '#A8977A'), sw.wood('#D9CBB2', '#B8A586')],
      ['ivory', 'Ivory matte', M.matte('#E9E2D4'), sw.flat('#E9E2D4')],
      ['cashmere', 'Cashmere', M.matte('#CDBFAE'), sw.flat('#CDBFAE')],
      ['stone', 'Stone grey', M.matte('#A49D92'), sw.flat('#A49D92')],
      ['sage', 'Sage', M.matte('#8C9883'), sw.flat('#8C9883')],
      ['olive', 'Deep olive', M.matte('#4F5541'), sw.flat('#4F5541')],
      ['clay', 'Terracotta', M.matte('#A3634A'), sw.flat('#A3634A')],
      ['ink', 'Ink blue', M.matte('#2C3746'), sw.flat('#2C3746')],
      ['graphite', 'Graphite', M.matte('#363437'), sw.flat('#363437')],
      ['white-gloss', 'White gloss', M.gloss('#F1EFEA'), sw.gloss('#F1EFEA')],
      ['black-gloss', 'Black gloss', M.gloss('#1D1C1B'), sw.gloss('#1D1C1B')],
      ['concrete', 'Concrete', M.concrete('#8E8B85'), sw.speck('#8E8B85', '#6f6c66')],
    ],
    style: [['flat', 'Flat slab'], ['shaker', 'Shaker'], ['fluted', 'Fluted'], ['groove', 'Handleless groove']],
    handle: [['bronze', 'Brushed bronze', '#A58869'], ['black', 'Matte black', '#1B1B1B'], ['steel', 'Brushed steel', '#B9BCBF'], ['gold', 'Champagne gold', '#C8A964'], ['none', 'Handleless', 'transparent']],
    counter: [
      ['white-marble', 'White marble', M.marble('#EFECE7', '#8F877D'), sw.stone('#EFECE7', '#8F877D')],
      ['calacatta', 'Calacatta gold', M.marble('#F2EEE6', '#B39468', 8), sw.stone('#F2EEE6', '#B39468')],
      ['travertine', 'Travertine', M.travertine('#DCCDB4', '#A88F6D'), sw.band('#DCCDB4', '#A88F6D')],
      ['nero', 'Nero marquina', M.marble('#1F1E1D', '#CFC9C0', 5), sw.stone('#1F1E1D', '#CFC9C0')],
      ['grey-quartz', 'Grey quartz', M.speckle('#9C9A96', '#6E6C68', '#D9D7D2'), sw.speck('#9C9A96', '#6E6C68')],
      ['terrazzo', 'Terrazzo', M.speckle('#E7E0D4', '#A0785A', '#5E6B5E', '0.09'), sw.speck('#E7E0D4', '#A0785A')],
      ['concrete-top', 'Concrete', M.concrete('#9A968F'), sw.speck('#9A968F', '#7a766f')],
      ['butcher', 'Oak butcher block', M.wood('#A87B4F', '#6E4A2A', 'h'), sw.wood('#A87B4F', '#7E5A36')],
    ],
    splash: [
      ['match', 'Match the counter', null, 'linear-gradient(135deg,#EFECE7 0 50%,#9C958C 50%)'],
      ['ivory-tile', 'Ivory tile', M.matte('#ECE6DA'), sw.flat('#ECE6DA'), 'grid'],
      ['zellige', 'Green zellige', M.marble('#4F6D5C', '#2F4A3B', 2), sw.flat('#4F6D5C'), 'grid', true],
      ['subway', 'White subway', M.gloss('#F3F1EC'), sw.flat('#F3F1EC'), 'brick'],
      ['fluted-oak', 'Fluted oak', M.wood('#B8936A', '#7E5F3E'), sw.wood('#B8936A', '#8A6A45'), 'ribs'],
      ['bronze-mirror', 'Bronze mirror', M.gloss('#7E6448'), sw.gloss('#7E6448')],
    ],
    wall: [
      ['ivory', 'Ivory', M.plaster('#EEE8DD'), '#EEE8DD'], ['warm-white', 'Warm white', M.plaster('#F5F2EC'), '#F5F2EC'],
      ['limewash', 'Sand limewash', M.plaster('#D8C9B2'), '#D8C9B2'], ['sage-wall', 'Sage', M.plaster('#B6BDAA'), '#B6BDAA'],
      ['clay-wall', 'Clay plaster', M.plaster('#C79A80'), '#C79A80'], ['charcoal-wall', 'Charcoal', M.plaster('#3A3836'), '#3A3836'],
    ],
    floor: [
      ['oak-floor', 'Oak planks', M.wood('#B08A62', '#7A5A3A', 'h'), sw.wood('#B08A62', '#7A5A3A'), 'planks'],
      ['walnut-floor', 'Walnut planks', M.wood('#5E4433', '#33231A', 'h'), sw.wood('#5E4433', '#33231A'), 'planks'],
      ['terrazzo-floor', 'Terrazzo', M.speckle('#E2DACD', '#9A7A62', '#6A6F66', '0.1'), sw.speck('#E2DACD', '#9A7A62')],
      ['stone-floor', 'Limestone', M.travertine('#D6CBB9', '#B3A288'), sw.band('#D6CBB9', '#B3A288'), 'slabs'],
      ['concrete-floor', 'Polished concrete', M.concrete('#77746F'), sw.speck('#77746F', '#5d5a55')],
    ],
    light: [['day', 'Daylight'], ['evening', 'Warm evening'], ['neutral', 'Studio']],
  };
  const DEF = { shutter: 'walnut', style: 'flat', handle: 'bronze', counter: 'travertine', splash: 'match', wall: 'ivory', floor: 'oak-floor', light: 'day', led: true };
  const state = { ...DEF };
  const find = (g, id) => F[g].find(x => x[0] === id);

  /* ---------- SVG scene ---------- */
  const W = 1000, H = 680;
  const filt = (id) => `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB"><feTurbulence/><feColorMatrix type="matrix"/><feComponentTransfer><feFuncA type="identity"/></feComponentTransfer></filter>`;
  const pat = (s) => `<pattern id="p-${s}" patternUnits="userSpaceOnUse" width="${W}" height="${H}"><rect class="b" width="${W}" height="${H}"/><rect class="l1" width="${W}" height="${H}" filter="url(#f-${s}-1)"/><rect class="l2" width="${W}" height="${H}" filter="url(#f-${s}-2)"/></pattern>${filt(`f-${s}-1`)}${filt(`f-${s}-2`)}`;
  const SURF = ['shutter', 'counter', 'splash', 'wall', 'floor'];
  const doors = (x0, y, w, h, n, kind) => Array.from({ length: n }, (_, i) => ({ x: x0 + i * w, y, w, h, kind }));
  const UP = doors(90, 60, 150, 170, 4, 'up'), BASE = doors(90, 336, 150, 126, 4, 'base'), ISL = doors(250, 492, 180, 146, 3, 'isl');
  const TALL = [{ x: 712, y: 60, w: 188, h: 190, kind: 'up' }, { x: 712, y: 372, w: 188, h: 90, kind: 'base' }];
  const ALL = [...UP, ...BASE, ...ISL, ...TALL];
  const door = (d) => `
    <rect x="${d.x + 1.5}" y="${d.y + 1.5}" width="${d.w - 3}" height="${d.h - 3}" fill="url(#p-shutter)"/>
    <rect class="ov-fluted" x="${d.x + 1.5}" y="${d.y + 1.5}" width="${d.w - 3}" height="${d.h - 3}" fill="url(#ribs)"/>
    <rect class="ov-gloss" x="${d.x + 1.5}" y="${d.y + 1.5}" width="${d.w - 3}" height="${d.h - 3}" fill="url(#sheen)"/>
    <g class="ov-shaker"><rect x="${d.x + 14}" y="${d.y + 14}" width="${d.w - 28}" height="${d.h - 28}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2.5"/><rect x="${d.x + 16}" y="${d.y + 16}" width="${d.w - 32}" height="${d.h - 32}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/></g>
    <rect class="ov-groove" x="${d.x + 1.5}" y="${d.kind === 'up' ? d.y + d.h - 12 : d.y + 1.5}" width="${d.w - 3}" height="10" fill="url(#groove)"/>
    <rect x="${d.x + .5}" y="${d.y + .5}" width="${d.w - 1}" height="${d.h - 1}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
    ${handle(d)}`;
  function handle(d) {
    if (d.kind === 'up') { const x = d.x + d.w - 22, y = d.y + d.h - 70; return `<rect class="hdl" x="${x}" y="${y}" width="5" height="52" rx="1.5"/>`; }
    const w = Math.min(90, d.w * .45), x = d.x + (d.w - w) / 2, y = d.y + 16; return `<rect class="hdl" x="${x}" y="${y}" width="${w}" height="5" rx="1.5"/>`;
  }
  const svg = `
<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="fx-title" preserveAspectRatio="xMidYMid slice">
<title id="fx-title">Illustrative kitchen showing the selected finishes</title>
<defs>
  ${SURF.map(pat).join('')}
  <pattern id="ribs" width="9" height="10" patternUnits="userSpaceOnUse"><rect width="2" height="10" fill="rgba(0,0,0,.30)"/><rect x="2" width="2.5" height="10" fill="rgba(255,255,255,.14)"/><rect x="7" width="2" height="10" fill="rgba(0,0,0,.10)"/></pattern>
  <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 .75H36M.75 0V36" stroke="rgba(70,60,50,.38)" stroke-width="1.5"/><path d="M0 2.2H36M2.2 0V36" stroke="rgba(255,255,255,.22)" stroke-width="1"/></pattern>
  <pattern id="brick" width="72" height="26" patternUnits="userSpaceOnUse"><path d="M0 .75H72M0 13.75H72M.75 0V13M36.75 13V26" stroke="rgba(90,80,70,.35)" stroke-width="1.5"/></pattern>
  <pattern id="planks" width="420" height="34" patternUnits="userSpaceOnUse"><path d="M0 .75H420" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/><path d="M130 0V17M330 17V34" stroke="rgba(0,0,0,.28)" stroke-width="1.5"/><path d="M0 17.75H420" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/></pattern>
  <pattern id="slabs" width="200" height="60" patternUnits="userSpaceOnUse"><path d="M0 .75H200M.75 0V60" stroke="rgba(0,0,0,.22)" stroke-width="1.5"/></pattern>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".38" stop-color="#fff" stop-opacity=".0"/><stop offset=".46" stop-color="#fff" stop-opacity=".32"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset=".58" stop-color="#fff" stop-opacity=".18"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="groove" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
  <linearGradient id="ao-down" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
  <linearGradient id="ao-up" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
  <linearGradient id="led" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3B0" stop-opacity=".85"/><stop offset=".55" stop-color="#FFD596" stop-opacity=".18"/><stop offset="1" stop-color="#FFD596" stop-opacity="0"/></linearGradient>
  <linearGradient id="day" x1="0" y1="0" x2="1" y2=".25"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".30"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
  <linearGradient id="floorfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".75"/><stop offset="1" stop-color="#FFB766" stop-opacity="0"/></radialGradient>
  <radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<!-- room -->
<rect width="${W}" height="472" fill="url(#p-wall)"/>
<rect y="470" width="${W}" height="${H - 470}" fill="url(#p-floor)"/>
<rect class="ov-floor ov-planks" y="470" width="${W}" height="${H - 470}" fill="url(#planks)"/>
<rect class="ov-floor ov-slabs" y="470" width="${W}" height="${H - 470}" fill="url(#slabs)"/>
<rect y="470" width="${W}" height="${H - 470}" fill="url(#floorfade)"/>
<rect y="466" width="${W}" height="6" fill="rgba(0,0,0,.18)"/>
<!-- window light on wall -->
<polygon class="lt-day" points="0,40 70,40 150,470 0,470" fill="#fff" opacity=".12"/>
<!-- splash -->
<rect x="90" y="230" width="600" height="90" fill="url(#p-splash)"/>
<rect class="ov-sp ov-grid" x="90" y="230" width="600" height="90" fill="url(#grid)"/>
<rect class="ov-sp ov-brick" x="90" y="230" width="600" height="90" fill="url(#brick)"/>
<rect class="ov-sp ov-ribs" x="90" y="230" width="600" height="90" fill="url(#ribs)"/>
<rect class="ov-sp ov-spgloss" x="90" y="230" width="600" height="90" fill="url(#sheen)"/>
<rect x="90" y="230" width="600" height="22" fill="url(#ao-down)"/>
<rect class="led" x="90" y="230" width="600" height="90" fill="url(#led)"/>
<!-- shelf objects on counter -->
<g opacity=".95"><path d="M150 318c0-26 6-40 14-46h12c8 6 14 20 14 46z" fill="#C9C1B6"/><path d="M164 272v-16h12v16" fill="#B5AC9F"/><path d="M168 256c-10-24-2-40 4-48M172 256c8-18 18-28 26-30M170 256c-14-10-24-12-32-10" stroke="#5F6B4E" stroke-width="2.5" fill="none"/>
<rect x="560" y="290" width="38" height="28" rx="3" fill="#2B2826" opacity=".85"/><rect x="606" y="280" width="26" height="38" rx="3" fill="#E7DFD2"/></g>
<!-- tap -->
<path class="tap" d="M402 318v-44a16 16 0 0 1 32 0v8" fill="none" stroke-width="6" stroke-linecap="round"/>
<!-- counter (back run) -->
<rect x="84" y="318" width="612" height="18" fill="url(#p-counter)"/>
<rect x="84" y="318" width="612" height="2" fill="#fff" opacity=".35"/>
<!-- cabinets -->
${UP.map(door).join('')}
${BASE.map(door).join('')}
<rect x="90" y="336" width="600" height="14" fill="url(#ao-down)"/>
<rect x="90" y="462" width="600" height="8" fill="#141210"/>
<!-- tall unit with oven -->
${TALL.map(door).join('')}
<rect x="712" y="252" width="188" height="118" fill="#151413"/><rect x="726" y="266" width="160" height="72" rx="3" fill="#0B0B0B" stroke="#3A3836"/><rect x="726" y="266" width="160" height="72" rx="3" fill="url(#sheen)" opacity=".6"/><rect class="hdl" x="740" y="350" width="132" height="5" rx="1.5"/>
<rect x="712" y="462" width="188" height="8" fill="#141210"/>
<rect x="900" y="60" width="10" height="410" fill="#000" opacity=".12"/>
<!-- pendants -->
<g class="pendants"><path d="M410 0V382M600 0V382" stroke="#2a2a2a" stroke-width="1.2"/>
<ellipse class="lt-eve" cx="410" cy="416" rx="70" ry="44" fill="url(#glow)"/><ellipse class="lt-eve" cx="600" cy="416" rx="70" ry="44" fill="url(#glow)"/>
<path class="shade" d="M386 414l10-32h28l10 32z"/><path class="shade" d="M576 414l10-32h28l10 32z"/>
<path d="M386 414l10-32h28l10 32z" fill="url(#metal)" opacity=".7"/><path d="M576 414l10-32h28l10 32z" fill="url(#metal)" opacity=".7"/></g>
<!-- island -->
<ellipse cx="520" cy="660" rx="330" ry="22" fill="url(#pool)" filter="url(#soft)"/>
<ellipse class="lt-eve" cx="505" cy="472" rx="250" ry="30" fill="url(#glow)" opacity=".7"/>
${ISL.map(door).join('')}
<rect x="250" y="492" width="540" height="16" fill="url(#ao-down)"/>
<rect x="244" y="472" width="552" height="22" fill="url(#p-counter)"/>
<rect x="244" y="472" width="552" height="2.5" fill="#fff" opacity=".4"/>
<rect x="244" y="491" width="552" height="3" fill="#000" opacity=".2"/>
<rect x="258" y="638" width="524" height="10" fill="#141210"/>
<!-- light overlays -->
<rect class="lt-day" width="${W}" height="${H}" fill="url(#day)"/>
<rect class="lt-evebg" width="${W}" height="${H}" fill="#1A1108" opacity=".42"/>
<ellipse class="lt-eve" cx="410" cy="416" rx="40" ry="26" fill="url(#glow)"/><ellipse class="lt-eve" cx="600" cy="416" rx="40" ry="26" fill="url(#glow)"/>
</svg>`;

  /* ---------- controls ---------- */
  const groups = {
    cabinets: [['shutter', 'Shutter finish', 'swatch'], ['style', 'Door style', 'text'], ['handle', 'Handles', 'swatchHandle']],
    surfaces: [['counter', 'Countertop', 'swatch'], ['splash', 'Backsplash', 'swatch']],
    room: [['wall', 'Wall', 'swatchWall'], ['floor', 'Floor', 'swatch'], ['light', 'Lighting', 'text']],
  };
  const chip = (g, item, mode) => {
    const [id, name] = item; const on = state[g] === id;
    let style = '';
    if (mode === 'swatch') style = `--sw:${item[3]}`;
    if (mode === 'swatchWall') style = `--sw:${item[3]}`;
    if (mode === 'swatchHandle') style = id === 'none' ? '--sw:repeating-linear-gradient(135deg,#e8e1d5 0 4px,#cfc6b8 4px 5px)' : `--sw:linear-gradient(135deg,#ffffff88,transparent 45%,#00000044),${item[2]}`;
    if (mode === 'text') return `<button type="button" class="tchip" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-id="${id}">${name}</button>`;
    return `<button type="button" class="chip" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" aria-label="${name}" title="${name}" data-id="${id}" style="${style}"></button>`;
  };
  const tabs = Object.keys(groups);
  root.innerHTML = `
    <div class="fx__view">${svg}<span class="ph">Illustrative demonstration</span></div>
    <div class="fx__ctrl">
      <div class="fx__tabs" role="tablist" aria-label="Finish categories">
        ${tabs.map((t, i) => `<button type="button" role="tab" id="fxt-${t}" aria-controls="fxp-${t}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
      </div>
      ${tabs.map((t, i) => `<div class="fx__panel" role="tabpanel" id="fxp-${t}" aria-labelledby="fxt-${t}"${i ? ' hidden' : ''}>
        ${groups[t].map(([g, label, mode]) => `<div class="fx__group"><h3 id="fxl-${g}"><span>${label}</span><output data-out="${g}" aria-live="polite"></output></h3>
          <div class="${mode === 'text' ? 'tchips' : 'chips'}" role="radiogroup" aria-labelledby="fxl-${g}" data-group="${g}">${F[g].map(it => chip(g, it, mode)).join('')}</div></div>`).join('')}
        ${t === 'room' ? `<label class="fx__toggle"><input type="checkbox" data-led checked><span aria-hidden="true"></span>Under-cabinet lighting</label>` : ''}
      </div>`).join('')}
      <div class="fx__summary"><p class="label">Your combination</p><p class="fx__sum" data-sum></p>
        <div class="fx__actions"><a class="btn btn--solid" data-send target="_blank" rel="noopener">Send this design on WhatsApp <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg></a><button type="button" class="link" data-reset>Reset</button></div>
      </div>
      <p class="fx__note">An illustrative demonstration of how finishes work together. Actual laminate, stone and hardware ranges are confirmed at consultation, with physical samples.</p>
    </div>`;

  const S = root.querySelector('svg');
  const $$ = (sel) => [...S.querySelectorAll(sel)];
  const hex = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

  function setSurface(s, mat) {
    const p = S.querySelector(`#p-${s}`);
    p.querySelector('.b').setAttribute('fill', mat.base);
    [1, 2].forEach(n => {
      const L = mat.layers[n - 1], r = p.querySelector('.l' + n);
      if (!L) { r.setAttribute('opacity', 0); return; }
      r.setAttribute('opacity', 1);
      const f = S.querySelector(`#f-${s}-${n}`), [tu, cm, ct] = f.children, fa = ct.firstElementChild;
      tu.setAttribute('type', L.t); tu.setAttribute('baseFrequency', L.f); tu.setAttribute('numOctaves', L.o); tu.setAttribute('seed', L.s);
      const [cr, cg, cb] = hex(L.c);
      cm.setAttribute('values', `0 0 0 0 ${cr} 0 0 0 0 ${cg} 0 0 0 0 ${cb} ${L.tb ? 1 : L.k} 0 0 0 ${L.tb ? 0 : L.off}`);
      if (L.tb) { fa.setAttribute('type', 'table'); fa.setAttribute('tableValues', L.tb); } else { fa.setAttribute('type', 'identity'); fa.removeAttribute('tableValues'); }
    });
  }
  const show = (sel, on) => $$(sel).forEach(e => e.style.display = on ? '' : 'none');

  function render() {
    const sh = find('shutter', state.shutter), co = find('counter', state.counter), sp = find('splash', state.splash);
    const wa = find('wall', state.wall), fl = find('floor', state.floor), hd = find('handle', state.handle);
    setSurface('shutter', sh[2]); setSurface('counter', co[2]); setSurface('wall', wa[2]); setSurface('floor', fl[2]);
    setSurface('splash', sp[0] === 'match' ? co[2] : sp[2]);
    show('.ov-gloss', !!sh[2].sheen);
    show('.ov-fluted', state.style === 'fluted'); show('.ov-shaker', state.style === 'shaker'); show('.ov-groove', state.style === 'groove');
    const noHandle = state.style === 'groove' || state.handle === 'none';
    $$('.hdl').forEach(h => { h.style.display = noHandle ? 'none' : ''; h.setAttribute('fill', hd[2]); });
    $$('.tap,.shade').forEach(e => { const c = hd[0] === 'none' ? '#1B1B1B' : hd[2]; e.getAttribute('class') === 'tap' ? e.setAttribute('stroke', c) : e.setAttribute('fill', c); });
    show('.ov-sp', false); if (sp[4]) show('.ov-' + sp[4], true); if (sp[5] || (sp[2] && sp[2].sheen)) show('.ov-spgloss', true);
    show('.ov-floor', false); if (fl[4]) show('.ov-' + fl[4], true);
    show('.lt-day', state.light === 'day'); show('.lt-eve,.lt-evebg', state.light === 'evening');
    show('.led', state.led);
    // outputs + summary
    root.querySelectorAll('[data-out]').forEach(o => { const g = o.dataset.out; o.textContent = find(g, state[g])[1]; });
    const parts = [`${sh[1]} ${find('style', state.style)[1].toLowerCase()} shutters`, noHandle ? 'handleless' : `${hd[1].toLowerCase()} handles`, `${co[1].toLowerCase()} counter`, sp[0] === 'match' ? 'matching backsplash' : `${sp[1].toLowerCase()} backsplash`, `${wa[1].toLowerCase()} walls`, `${fl[1].toLowerCase()} floor`];
    root.querySelector('[data-sum]').textContent = parts.join(' · ');
    const msg = `Hello GM Modulars, I'd like to discuss a kitchen like this:\n\n• Shutters: ${sh[1]} (${find('style', state.style)[1]})\n• Handles: ${noHandle ? 'Handleless' : hd[1]}\n• Countertop: ${co[1]}\n• Backsplash: ${sp[0] === 'match' ? 'Matching the counter' : sp[1]}\n• Wall: ${wa[1]}  • Floor: ${fl[1]}\n\n(Created with the finish studio on your website)`;
    root.querySelector('[data-send]').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  }

  /* ---------- interaction ---------- */
  root.querySelectorAll('[role="radiogroup"]').forEach(grp => {
    const g = grp.dataset.group, items = [...grp.children];
    const pick = (el, focus) => {
      items.forEach(x => { const on = x === el; x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; });
      state[g] = el.dataset.id; if (focus) el.focus(); flash(); render();
    };
    items.forEach((el, i) => {
      el.addEventListener('click', () => pick(el));
      el.addEventListener('keydown', e => {
        const k = e.key; let j = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % items.length;
        if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + items.length) % items.length;
        if (j !== null) { e.preventDefault(); pick(items[j], true); }
      });
    });
  });
  const tabEls = [...root.querySelectorAll('[role="tab"]')];
  const selectTab = (t, focus) => {
    tabEls.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; root.querySelector('#' + x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
  };
  tabEls.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(tabEls[(i + 1) % tabEls.length], true); } if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(tabEls[(i - 1 + tabEls.length) % tabEls.length], true); } });
  });
  root.querySelector('[data-led]').addEventListener('change', e => { state.led = e.target.checked; render(); });
  root.querySelector('[data-reset]').addEventListener('click', () => {
    Object.assign(state, DEF);
    root.querySelectorAll('[role="radiogroup"]').forEach(grp => [...grp.children].forEach(x => { const on = x.dataset.id === state[grp.dataset.group]; x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; }));
    root.querySelector('[data-led]').checked = true; flash(); render();
  });
  const view = root.querySelector('.fx__view');
  function flash() { if (RM) return; view.classList.remove('is-swap'); void view.offsetWidth; view.classList.add('is-swap'); }
  render();
})();
