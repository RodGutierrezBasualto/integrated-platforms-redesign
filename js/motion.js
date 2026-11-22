/* Integrated Platforms — motion.
   Everything is readable without JavaScript. This file adds html.mo, which arms the hidden "before" states,
   then reveals things as they scroll in:
     · data-reveal          rise + un-blur (siblings stagger 90 ms)      · data-reveal="wipe"  clip-path wipe + image settle
     · data-observe         just gets .is-in (the Sydney drawing, timeline, founder card, illustration loops)
     · data-split-words     words light up one by one with the scroll
     · data-map             the dot-matrix world map (canvas): ripple from Sydney, arcs to each market
     · .signoff             the giant footer word rises letter by letter; letters lift under the pointer */
(() => {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  /* ---------- split text ---------- */
  document.querySelectorAll('[data-split-words]').forEach(p => {
    const out = document.createDocumentFragment();
    const addWords = (text, em) => text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { out.append(' '); return; }
      const w = document.createElement('span');
      w.className = em ? 'w em' : 'w';
      w.textContent = part;
      out.append(w);
    });
    [...p.childNodes].forEach(n => addWords(n.textContent, n.nodeType === 1 && n.tagName === 'EM'));
    p.replaceChildren(out);
  });

  document.querySelectorAll('.signoff').forEach(sign => {
    const word = sign.firstChild;
    if (!word || word.nodeType !== 3) return;
    const letters = [...word.textContent].map((ch, i) => {
      const s = document.createElement('span');
      s.className = 'mo-letter';
      s.style.setProperty('--i', i);
      s.textContent = ch;
      return s;
    });
    word.replaceWith(...letters);
    const dot = sign.querySelector('.dot');
    if (dot) { dot.classList.add('mo-letter'); dot.style.setProperty('--i', letters.length); }
    if (finePointer) sign.querySelectorAll('.mo-letter').forEach(l => l.addEventListener('pointerenter', () => {
      l.classList.add('is-lift');
      clearTimeout(l._t);
      l._t = setTimeout(() => l.classList.remove('is-lift'), 650);
    }));
  });

  /* ---------- reveals ---------- */
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  reveals.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
    el.style.setProperty('--delay', Math.min(sibs.indexOf(el), 5) * 0.09 + 's');
  });
  // whatever is already on screen stays put, so arming the hidden states never flashes
  reveals.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
  });
  root.classList.add('mo');

  // the huge top margin counts anything scrolled past as revealed (anchor jumps never strand hidden sections)
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    io.unobserve(e.target);
  }), { rootMargin: '100000px 0px -12% 0px' });
  const ioEnd = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    ioEnd.unobserve(e.target);
  }), { rootMargin: '100000px 0px 0px 0px' });
  [...reveals, ...document.querySelectorAll('[data-observe]')].forEach(el => { if (!el.classList.contains('is-in')) io.observe(el); });
  document.querySelectorAll('[data-observe-end]').forEach(el => ioEnd.observe(el));

  /* ---------- statement: words light up as the paragraph scrolls through the screen ---------- */
  const statement = document.querySelector('[data-split-words]');
  if (statement && !reduce) {
    const words = [...statement.querySelectorAll('.w')];
    let raf = 0;
    const light = () => {
      raf = 0;
      const r = statement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.88 - r.top) / (r.height + innerHeight * 0.38)));
      const n = Math.round(p * words.length * 1.08);
      words.forEach((w, i) => w.classList.toggle('lit', i < n));
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(light); }, { passive: true });
    addEventListener('resize', light);
    light();
  }

  /* ---------- world map ---------- */
  const mapEl = document.querySelector('[data-map]');
  if (mapEl && window.IP_MAP) initMap(mapEl, window.IP_MAP);

  function initMap(wrap, M) {
    const canvas = wrap.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const raw = atob(M.bits);
    const land = new Uint8Array(M.cols * M.rows);
    for (let i = 0; i < land.length; i++) land[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    const dots = [];
    for (let r = 0; r < M.rows; r++) for (let c = 0; c < M.cols; c++) if (land[r * M.cols + c]) dots.push([c, r]);

    const toGrid = (lon, lat) => [((lon < 0 ? lon + 360 : lon) - M.lon0) / M.step, (M.lat0 - lat) / M.step];
    const home = { name: 'Sydney', at: toGrid(151.2, -33.9) };
    const markets = [
      { name: 'Canada', at: toGrid(-104, 56), label: [-1, -1.4] },
      { name: 'United States', at: toGrid(-98, 38.5), label: [1.4, 1.6] },
      { name: 'Chile', at: toGrid(-70.8, -31), label: [1.6, 0.4] },
    ];
    canvas.style.aspectRatio = `${M.cols} / ${M.rows}`;

    let W = 0, H = 0, cell = 0, dpr = 1, base = null, start = 0, running = false, visible = false;
    const px = g => [(g[0] + 0.5) * cell, (g[1] + 0.5) * cell];

    function layout() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.round(canvas.clientWidth * dpr);
      cell = W / M.cols;
      H = Math.round(cell * M.rows);
      canvas.width = W;
      canvas.height = H;
      // the grey dots never change: draw them once to an offscreen canvas
      base = document.createElement('canvas');
      base.width = W;
      base.height = H;
      const b = base.getContext('2d');
      const s = Math.max(1, cell * 0.42);
      b.fillStyle = 'rgba(242,240,231,.24)';
      dots.forEach(([c, r]) => b.fillRect((c + 0.5) * cell - s / 2, (r + 0.5) * cell - s / 2, s, s));
      draw(running ? performance.now() : start + 1e6);
    }

    // a quadratic arc that bows away from the equator, like a flight path
    function arcPoint(a, b, t) {
      const [x0, y0] = px(a), [x2, y2] = px(b);
      const dx = x2 - x0, dy = y2 - y0, d = Math.hypot(dx, dy);
      const x1 = (x0 + x2) / 2 + dy * 0.18, y1 = (y0 + y2) / 2 - d * 0.32;
      const u = 1 - t;
      return [u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2];
    }

    function draw(now) {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0);
      const [hx, hy] = px(home.at);
      const s = Math.max(1, cell * 0.42);

      // ripple: a ring of brighter dots spreading out from Sydney for the first few seconds
      const radius = t * 52;                       // in dots
      if (radius < 190) {
        dots.forEach(([c, r]) => {
          const d = Math.hypot(c + 0.5 - (home.at[0] + 0.5), r + 0.5 - (home.at[1] + 0.5));
          const k = 1 - Math.abs(d - radius) / 6;
          if (k <= 0) return;
          ctx.fillStyle = `rgba(220,232,122,${(k * 0.85).toFixed(3)})`;
          ctx.fillRect((c + 0.5) * cell - s / 2, (r + 0.5) * cell - s / 2, s, s);
        });
      }

      // arcs grow out one after another, then little comets keep travelling along them
      ctx.lineCap = 'round';
      markets.forEach((m, i) => {
        const grow = Math.min(1, Math.max(0, (t - 0.6 - i * 0.35) / 1.4));
        const eased = 1 - Math.pow(1 - grow, 3);
        if (eased <= 0) return;
        ctx.strokeStyle = 'rgba(220,232,122,.55)';
        ctx.lineWidth = 1.4 * dpr;
        ctx.beginPath();
        for (let k = 0; k <= 60; k++) {
          const [x, y] = arcPoint(home.at, m.at, (k / 60) * eased);
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        if (grow >= 1) {
          const phase = ((t - 2 - i * 0.7) / 2.6) % 1;
          if (phase > 0) {
            ctx.strokeStyle = 'rgba(242,240,231,.95)';
            ctx.lineWidth = 2.2 * dpr;
            ctx.beginPath();
            for (let k = 0; k <= 8; k++) {
              const [x, y] = arcPoint(home.at, m.at, Math.min(1, phase * 1.1) - (8 - k) * 0.012);
              k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.stroke();
          }
          // market marker + label
          const [mx, my] = px(m.at);
          const ms = s * 2.2;
          ctx.fillStyle = '#dce87a';
          ctx.fillRect(mx - ms / 2, my - ms / 2, ms, ms);
          ctx.font = `700 ${Math.round(11 * dpr)}px "Hanken Grotesk", Arial, sans-serif`;
          ctx.fillStyle = 'rgba(242,240,231,.9)';
          ctx.textAlign = m.label[0] < 0 ? 'right' : 'left';
          ctx.fillText(m.name.toUpperCase(), mx + m.label[0] * cell * 2, my + m.label[1] * cell * 2);
        }
      });

      // home: a white square with a repeating ping ring
      const ping = (t % 2.4) / 2.4;
      ctx.strokeStyle = `rgba(242,240,231,${(0.7 * (1 - ping)).toFixed(3)})`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.arc(hx, hy, cell * (1 + ping * 5), 0, Math.PI * 2);
      ctx.stroke();
      const hs = s * 2.6;
      ctx.fillStyle = '#f2f0e7';
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
      ctx.font = `800 ${Math.round(15 * dpr)}px "Hanken Grotesk", Arial, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText('Sydney', hx - cell * 2.4, hy + cell * 0.6);
    }

    function loop(now) {
      if (!visible) { running = false; return; }
      draw(now);
      requestAnimationFrame(loop);
    }

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !running) {
        if (!start) start = performance.now();
        if (reduce) { draw(start + 1e6); return; }
        running = true;
        requestAnimationFrame(loop);
      }
    }, { threshold: 0.15 }).observe(canvas);

    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
    if (document.fonts) document.fonts.ready.then(layout); else layout();
    layout();
  }

  if (reduce || !finePointer) return;

  /* ---------- "View" bubble that follows the pointer over project imagery ---------- */
  const zones = [...document.querySelectorAll('.work-media, .feature-stage')].filter(z => z.closest('a'));
  if (zones.length) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = 'View <svg class="i-arrow" viewBox="0 0 14 14"><path d="M3 11 11 3M5 3h6v6"/></svg>';
    document.body.append(cursor);
    let x = -200, y = -200, tx = x, ty = y, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      cursor.style.setProperty('--x', x + 'px');
      cursor.style.setProperty('--y', y + 'px');
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = e => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(tick); };
    zones.forEach(zone => {
      zone.classList.add('cursor-zone');
      zone.addEventListener('pointerenter', e => {
        if (!cursor.classList.contains('is-on')) { x = tx = e.clientX; y = ty = e.clientY; }
        cursor.classList.add('is-on');
        move(e);
      });
      zone.addEventListener('pointermove', move);
      zone.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    });
  }

  /* ---------- the header button leans toward the pointer ---------- */
  const magnet = document.querySelector('.mast .nav-cta');
  if (magnet) {
    magnet.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1), background .3s, color .3s';
    magnet.addEventListener('pointermove', e => {
      const r = magnet.getBoundingClientRect();
      magnet.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    magnet.addEventListener('pointerleave', () => { magnet.style.transform = ''; });
  }
})();
