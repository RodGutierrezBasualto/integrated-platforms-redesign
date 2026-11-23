/* Integrated Platforms — motion and interactive pieces.
   Everything works without JavaScript; this file adds html.is-anim to arm the reveals, then runs:
     · reveals          [data-anim] rises in; [data-anim="diamond"] opens out of a diamond (the IP mark)
     · the workflow     [data-flow] requests → AI drafts → a person approves → your systems (or returned with notes)
     · stages           [data-stages] the five delivery stages, auto-advancing until someone picks one
     · TRACE            [data-trace] five tiles that expand to show the vendor question
     · quick answers    [data-ask] a bar with answers taken from the FAQ */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- reveals ---------- */
  if ('IntersectionObserver' in window) {
    const els = [...document.querySelectorAll('[data-anim], [data-observe]')];
    els.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-anim'));
      const k = sibs.indexOf(el);
      if (k > 0) el.style.setProperty('--d', Math.min(k, 6) * 0.07 + 's');
    });
    root.classList.add('is-anim');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }), { rootMargin: '100000px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* run a callback only while an element is on screen */
  const whileVisible = (el, onChange) => {
    if (!('IntersectionObserver' in window)) { onChange(true); return; }
    new IntersectionObserver(([e]) => onChange(e.isIntersecting), { threshold: 0.2 }).observe(el);
  };

  /* ---------- the workflow ---------- */
  document.querySelectorAll('[data-flow]').forEach(fig => {
    if (reduce) return;
    const layer = fig.querySelector('[data-tokens]');
    const log = fig.querySelector('[data-log]');
    const stat = name => fig.querySelector(`[data-stat="${name}"]`);
    const node = name => fig.querySelector(`[data-node="${name}"]`);
    const P = { a: [70, 80], b: [260, 80], c: [260, 215], d: [450, 215], e: [70, 215] };
    const kinds = [['Enquiry', 'CRM'], ['Invoice', 'finance system'], ['Quote request', 'CRM'], ['Support ticket', 'help desk'], ['Supplier form', 'finance system'], ['Booking change', 'booking system']];
    const counts = { drafted: 0, approved: 0, returned: 0 };
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    let tokens = [], serial = 1040, made = 0, lastSpawn = -1e9, visible = false, raf = 0;

    const say = text => {
      const p = document.createElement('p');
      p.textContent = text;
      log.replaceChildren(p);
    };
    const bump = name => { counts[name]++; stat(name).textContent = counts[name]; };
    const ping = name => {
      const g = node(name);
      g.style.transformBox = 'fill-box';
      g.style.transformOrigin = 'center';
      g.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
    };

    function spawn(now) {
      const g = document.createElementNS(NS, 'g');
      const card = document.createElementNS(NS, 'rect');
      Object.entries({ x: -10, y: -12, width: 20, height: 24, rx: 4, fill: '#ffffff' }).forEach(([k, v]) => card.setAttribute(k, v));
      const lines = document.createElementNS(NS, 'path');
      lines.setAttribute('d', 'M-5 -5h10M-5 0h10M-5 5h6');
      lines.setAttribute('stroke', '#0d0d12');
      lines.setAttribute('stroke-opacity', '.45');
      lines.setAttribute('stroke-width', '1.6');
      g.append(card, lines);
      layer.append(g);
      const [kind, system] = kinds[made % kinds.length];
      tokens.push({ g, card, t0: now, id: `${kind} ${serial++}`, system, returned: made % 6 === 4, fired: new Set() });
      made++;
    }

    // timeline of one item, in ms
    const T = { toB: 1000, atB: 650, toC: 900, atC: 800, out: 1000, fade: 350 };
    const tB = T.toB, tB2 = tB + T.atB, tC = tB2 + T.toC, tC2 = tC + T.atC, tEnd = tC2 + T.out, tGone = tEnd + T.fade;

    function step(now) {
      raf = 0;
      if (!visible) return;
      if (now - lastSpawn > 1550) { spawn(now); lastSpawn = now; }
      tokens = tokens.filter(tok => {
        const t = now - tok.t0;
        const once = (key, fn) => { if (!tok.fired.has(key)) { tok.fired.add(key); fn(); } };
        let pos, opacity = 1;
        if (t < tB) pos = lerp(P.a, P.b, ease(t / T.toB));
        else if (t < tB2) {
          pos = P.b;
          once('drafted', () => { tok.card.setAttribute('fill', '#e6dbff'); bump('drafted'); ping('b'); say(`${tok.id} · drafted by AI`); });
        } else if (t < tC) pos = lerp(P.b, P.c, ease((t - tB2) / T.toC));
        else if (t < tC2) {
          pos = P.c;
          if (t > tC + T.atC * 0.45) once('decided', () => {
            ping('c');
            if (tok.returned) { tok.card.setAttribute('fill', '#ffd9a8'); bump('returned'); say(`${tok.id} · returned with notes for more context`); }
            else { tok.card.setAttribute('fill', '#bfee67'); bump('approved'); say(`${tok.id} · approved by a person`); }
          });
        } else if (t < tEnd) pos = lerp(P.c, tok.returned ? P.e : P.d, ease((t - tC2) / T.out));
        else if (t < tGone) {
          pos = tok.returned ? P.e : P.d;
          opacity = 1 - (t - tEnd) / T.fade;
          once('landed', () => { ping(tok.returned ? 'e' : 'd'); if (!tok.returned) say(`${tok.id} · synced to the ${tok.system}`); });
        } else { tok.g.remove(); return false; }
        tok.g.setAttribute('transform', `translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)})`);
        tok.g.setAttribute('opacity', opacity.toFixed(2));
        return true;
      });
      raf = requestAnimationFrame(step);
    }

    whileVisible(fig, on => {
      visible = on;
      if (on && !raf) {
        // resume cleanly: shift every item's clock so nothing jumps after being off screen
        const now = performance.now();
        if (fig._pausedAt) { const gap = now - fig._pausedAt; tokens.forEach(t => { t.t0 += gap; }); lastSpawn += gap; }
        raf = requestAnimationFrame(step);
      }
      if (!on) fig._pausedAt = performance.now();
    });
  });

  /* ---------- stages ---------- */
  document.querySelectorAll('[data-stages]').forEach(box => {
    const btns = [...box.querySelectorAll('.stage-btn')];
    const items = [...box.querySelectorAll('[data-stage-data] li')];
    const panel = box.querySelector('.stage-panel');
    const rail = box.querySelector('.stage-rail');
    const DUR = 5200;
    let i = 0, timer = 0, auto = !reduce, visible = false, started = false;
    box.style.setProperty('--dur', DUR + 'ms');
    if (!auto) box.classList.add('is-manual');

    function show(k) {
      i = k;
      btns.forEach((b, j) => {
        b.classList.toggle('is-active', j === k);
        b.classList.toggle('is-done', j < k);
        b.setAttribute('aria-selected', String(j === k));
        b.tabIndex = j === k ? 0 : -1;
      });
      rail.style.setProperty('--p', k / (btns.length - 1));
      const it = items[k];
      const tags = it.dataset.tags.split('|').map(t => `<li><span class="dia"></span>${t}</li>`).join('');
      panel.innerHTML = `<div class="art" aria-hidden="true">${it.querySelector('template').innerHTML}</div>
        <div><span class="label">Stage 0${k + 1} of 05</span><h3>${it.dataset.title}</h3><p>${it.textContent.trim()}</p></div><ul>${tags}</ul>`;
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      if (auto && visible) timer = setTimeout(() => show((i + 1) % btns.length), DUR);
    }
    btns.forEach((b, j) => b.addEventListener('click', () => { auto = false; box.classList.add('is-manual'); show(j); }));
    rail.addEventListener('keydown', e => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const k = (i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length;
      auto = false; box.classList.add('is-manual'); show(k); btns[k].focus();
    });
    whileVisible(box, on => {
      visible = on;
      if (on && !started) { started = true; show(0); }
      else if (on) schedule();
      else clearTimeout(timer);
    });
  });

  /* ---------- TRACE tiles ---------- */
  document.querySelectorAll('[data-trace]').forEach(group => {
    const tiles = [...group.querySelectorAll('.tile')];
    const open = tile => tiles.forEach(t => {
      const on = t === tile;
      t.classList.toggle('is-open', on);
      t.setAttribute('aria-expanded', String(on));
    });
    tiles.forEach(t => {
      t.addEventListener('click', () => open(t));
      t.addEventListener('focus', () => open(t));
      if (fine) t.addEventListener('pointerenter', () => open(t));
    });
  });

  /* ---------- quick answers ---------- */
  const ask = document.querySelector('[data-ask]');
  if (ask) {
    const answers = [
      'You don’t need to know which service you need. Tell us what you’re trying to improve and what you’ve tried so far, and we’ll suggest a sensible first step: an assessment, a workshop or a build.',
      'Both. We assess opportunities and set up governance, and we design and build the systems too: AI workflows, agents, integrations, production software and custom MCP servers for Claude and ChatGPT. <a href="#work">See what we’ve built</a>.',
      'Data access, privacy, security and human oversight are agreed before anything goes live, and the controls are matched to the use case. Our governance work complements legal advice and specialist security testing; it doesn’t replace them.',
    ];
    const bar = ask.querySelector('.ask-bar');
    const panel = ask.querySelector('.ask-panel');
    const out = ask.querySelector('.ask-out');
    const setOpen = open => { panel.hidden = !open; bar.setAttribute('aria-expanded', String(open)); };
    bar.addEventListener('click', () => setOpen(panel.hidden));
    ask.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
      ask.querySelectorAll('[data-q]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
      out.innerHTML = `<div class="ask-answer">${answers[+b.dataset.q]}</div>`;
    }));
    out.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); bar.focus(); } });
    document.addEventListener('click', e => { if (!ask.contains(e.target)) setOpen(false); });
    // only shows once the hero is behind you, and steps aside while the footer is on screen
    const foot = document.querySelector('.foot');
    let footIn = false;
    const place = () => {
      const tuck = scrollY < innerHeight * 0.8 || footIn;
      ask.classList.toggle('is-tucked', tuck);
      if (tuck) setOpen(false);
    };
    if (foot && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => { footIn = e.isIntersecting; place(); }).observe(foot);
    addEventListener('scroll', place, { passive: true });
    place();
  }
})();
