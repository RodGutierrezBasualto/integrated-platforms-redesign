/* Integrated Platforms — interface: floating header, mobile menu, FAQ accordion, contact form. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* floating header: a shadow once the page moves */
  const top = document.querySelector('.top');
  if (top) {
    const update = () => top.classList.toggle('is-scrolled', scrollY > 10);
    addEventListener('scroll', update, { passive: true });
    update();

    const toggle = top.querySelector('.nav-toggle');
    const panel = top.querySelector('.nav-panel');
    if (toggle && panel) {
      const setOpen = open => { panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); };
      toggle.addEventListener('click', () => setOpen(panel.hidden));
      panel.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); } });
      document.addEventListener('click', e => { if (!top.contains(e.target)) setOpen(false); });
      matchMedia('(min-width: 961px)').addEventListener('change', () => setOpen(false));
    }
  }

  /* FAQ: <details> that open and close smoothly */
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
      details.classList.toggle('closing', !opening);
      const anim = details.animate({ height: [from + 'px', to + 'px'] }, { duration: opening ? 480 : 340, easing: 'cubic-bezier(.22,.9,.24,1)' });
      details._anim = anim;
      anim.onfinish = () => { details._anim = null; details.style.overflow = ''; details.classList.remove('closing'); if (!opening) details.open = false; };
    });
  });

  /* contact form: validates in the browser; this prototype sends nothing */
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
      const done = document.querySelector('.form-done');
      done.querySelector('h2').textContent = `Thanks, ${form.querySelector('#name').value.trim().split(/\s+/)[0]}.`;
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  }
})();
