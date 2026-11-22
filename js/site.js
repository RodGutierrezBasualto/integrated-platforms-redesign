/* Integrated Platforms — interface behaviour: header states, mobile menu, FAQ accordion, contact form. */
(() => {
  'use strict';
  const root = document.documentElement;

  /* Header: a soft shadow once you leave the top; slides away while scrolling down, back on the way up. */
  const mast = document.querySelector('.mast');
  if (mast) {
    let lastY = scrollY, raf = 0;
    const update = () => {
      raf = 0;
      const y = scrollY;
      if (y > 120) mast.classList.add('is-scrolled');
      else if (y < 40) mast.classList.remove('is-scrolled');
      if (mast.classList.contains('menu-open')) { lastY = y; return; }
      if (y > 480 && y > lastY + 6) mast.classList.add('is-away');
      else if (y < lastY - 6 || y <= 480) mast.classList.remove('is-away');
      if (Math.abs(y - lastY) > 6) lastY = y;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    mast.addEventListener('focusin', () => mast.classList.remove('is-away'));
    update();

    /* Mobile menu: the header turns ink and the links become big numbered rows. */
    const button = mast.querySelector('.menu-toggle');
    const nav = mast.querySelector('nav');
    if (button && nav) {
      button.hidden = false;
      const setMenu = (open, focusButton) => {
        mast.classList.toggle('menu-open', open);
        root.classList.toggle('menu-locked', open);
        button.setAttribute('aria-expanded', String(open));
        button.innerHTML = open ? 'Close <span aria-hidden="true">−</span>' : 'Menu <span aria-hidden="true">+</span>';
        if (focusButton) button.focus();
      };
      button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
      nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && mast.classList.contains('menu-open')) setMenu(false, true); });
      matchMedia('(min-width: 901px)').addEventListener('change', () => setMenu(false));
    }
  }

  /* FAQ: <details> that open and close with a height animation instead of a jump. */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.faq-list details').forEach(details => {
    const summary = details.querySelector('summary');
    summary.addEventListener('click', e => {
      if (reduce) return;
      e.preventDefault();
      if (details._anim) details._anim.cancel();
      const from = details.offsetHeight;
      const opening = !details.open;
      if (opening) details.open = true;
      const to = opening ? details.scrollHeight : summary.offsetHeight;
      details.style.overflow = 'hidden';
      const anim = details.animate({ height: [from + 'px', to + 'px'] }, { duration: opening ? 520 : 380, easing: 'cubic-bezier(.32,.72,0,1)' });
      details._anim = anim;
      details.classList.toggle('closing', !opening);
      anim.onfinish = () => { details._anim = null; details.style.overflow = ''; details.classList.remove('closing'); if (!opening) details.open = false; };
    });
  });

  /* Contact form (contact page). This prototype validates in the browser and sends nothing. */
  const form = document.querySelector('#enquiry');
  if (form) {
    const prompts = {
      strategy: 'What does your organisation do, and where do you think AI might help?',
      training: 'Which AI tools do your teams have, and how are they using them today?',
      automation: 'Which process would you like to automate, and which systems does it touch?',
      software: 'What do you need built, who will use it, and what does it need to connect to?',
      governance: 'How is AI used across your organisation today, and what needs clearer rules?',
      leadership: 'Which AI initiatives are underway, and who owns them today?',
      unsure: 'Tell us what you’re trying to improve and what you’ve tried so far.',
    };
    const message = form.querySelector('#message');
    const setPrompt = () => {
      const picked = form.querySelector('input[name="interest"]:checked');
      message.placeholder = prompts[picked ? picked.value : 'unsure'];
    };
    form.addEventListener('change', e => { if (e.target.name === 'interest') setPrompt(); });
    const wanted = new URLSearchParams(location.search).get('interest');
    const preset = wanted && form.querySelector(`input[name="interest"][value="${CSS.escape(wanted)}"]`);
    if (preset) preset.checked = true;
    setPrompt();

    const fieldOf = el => el.closest('.field');
    form.addEventListener('input', e => { const f = fieldOf(e.target); if (f) f.classList.remove('has-error'); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const checks = [
        [form.querySelector('#name'), v => v.trim().length > 1],
        [form.querySelector('#email'), v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())],
        [message, v => v.trim().length > 4],
      ];
      let first = null;
      checks.forEach(([el, ok]) => {
        const bad = !ok(el.value);
        fieldOf(el).classList.toggle('has-error', bad);
        if (bad && !first) first = el;
      });
      if (first) { first.focus(); return; }
      const name = form.querySelector('#name').value.trim().split(/\s+/)[0];
      const done = document.querySelector('.form-done');
      done.querySelector('h2').textContent = `Thanks, ${name}.`;
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  }
})();
