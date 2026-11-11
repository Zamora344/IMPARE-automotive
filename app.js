/* IMPARE v1.5 — app.js. No external libraries. */
(function () {
  /* ---- Site intro: 2 s on first open of a session, then never again
     in that session. Skippable with the button or Escape. Reduced motion
     skips it entirely (CSS hides it). ---- */
  const intro = document.getElementById('site-intro');
  if (intro) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = (() => { try { return sessionStorage.getItem('impare-intro') === '1'; } catch (e) { return false; } })();
    if (reduced || seen) {
      intro.remove();
    } else {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        try { sessionStorage.setItem('impare-intro', '1'); } catch (e) { /* private mode */ }
        intro.classList.add('fading');
        setTimeout(() => intro.remove(), 550);
      };
      const timer = setTimeout(finish, 2000);
      const skip = intro.querySelector('[data-intro-skip]');
      if (skip) skip.addEventListener('click', () => { clearTimeout(timer); finish(); });
      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') { clearTimeout(timer); finish(); document.removeEventListener('keydown', onKey); }
      });
    }
  }

  /* ---- Collection filters ---- */
  const form = document.querySelector('[data-filter-form]');
  if (form) {
    const cards = [...document.querySelectorAll('[data-product]')];
    const params = new URLSearchParams(location.search);
    for (const key of ['area', 'gen', 'kind']) {
      const value = params.get(key);
      if (value && [...form.elements[key].options].some(o => o.value === value)) form.elements[key].value = value;
    }
    const run = () => {
      let shown = 0;
      cards.forEach(card => {
        const {area, gen, kind} = form.elements;
        const show = (area.value === 'all' || card.dataset.area === area.value) &&
          (gen.value === 'all' || card.dataset.gen.includes(gen.value)) &&
          (kind.value === 'all' || card.dataset.kind === kind.value);
        card.hidden = !show;
        if (show) shown++;
      });
      const count = document.querySelector('[data-count]');
      if (count) count.textContent = shown + (shown === 1 ? ' pieza' : ' piezas') + ' para explorar';
      const empty = document.querySelector('.empty');
      if (empty) empty.classList.toggle('show', shown === 0);
      document.querySelectorAll('.collection-areas a').forEach(a => {
        const query = new URL(a.href).searchParams;
        const active = query.has('kind') ? form.elements.kind.value === query.get('kind') : form.elements.kind.value === 'all' && form.elements.area.value === (query.get('area') || 'all');
        if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    form.addEventListener('change', run);
    form.addEventListener('submit', e => e.preventDefault());
    run();
  }


  /* ---- Detail photo gallery (volante, consola) ---- */
  const photo = document.querySelector('[data-main-photo]');
  const thumbs = [...document.querySelectorAll('[data-thumb]')];
  if (photo && thumbs.length) {
    let selection = 0;
    thumbs.forEach((button, index) => {
      button.addEventListener('click', async () => {
        const request = ++selection;
        const frame = photo.closest('.detail-main');
        frame.setAttribute('aria-busy', 'true');
        const next = new Image();
        next.sizes = button.dataset.sizes;
        next.srcset = button.dataset.srcset;
        next.src = button.dataset.src;
        try {
          if (next.decode) await next.decode();
          else await new Promise((resolve, reject) => { if (next.complete && next.naturalWidth) resolve(); else { next.onload = resolve; next.onerror = reject; } });
          if (request !== selection) return;
          photo.width = Number(button.dataset.width);
          photo.height = Number(button.dataset.height);
          photo.sizes = button.dataset.sizes;
          photo.srcset = button.dataset.srcset;
          photo.src = button.dataset.src;
          photo.alt = button.dataset.alt;
          thumbs.forEach(t => t.setAttribute('aria-pressed', t === button ? 'true' : 'false'));
        } catch (error) {
          // Keep the previous photograph if the next resource cannot be decoded.
        } finally {
          if (request === selection) frame.setAttribute('aria-busy', 'false');
        }
      });
      button.addEventListener('keydown', e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? thumbs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + thumbs.length) % thumbs.length;
        thumbs[next].focus(); thumbs[next].click();
      });
    });
  }

  /* ---- Liquid Glass: floating nav only. Chromium gets refraction,
     everyone else keeps the frosted blur. Reduced transparency or
     reduced motion: solid nav, no glass. ---- */
  const nav = document.querySelector('.top');
  const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (nav && typeof window.liquidGlass === 'function' && !reducedTransparency && !reducedMotion) {
    try {
      window.liquidGlass(nav, { scale: -112, chroma: 1, border: 1, mapBlur: 4, blur: 8, saturate: 1.4, radius: 999, fallbackBlur: 14 });
    } catch (e) { /* frosted blur fallback stays */ }
  }


  /* ---- Mobile menu: Escape closes it ---- */
  const menu = document.querySelector('.menu');
  if (menu) menu.addEventListener('keydown', e => { if (e.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); } });

  /* ---- ATELIER: prefill the idea when coming from a piece (consulta / detail) ---- */
  const bookingForm = document.querySelector('[data-booking]');
  if (bookingForm) {
    const names = { volante: 'Volante M Alcántara LCI', consola: 'Consola central M Carbon' };
    const pieza = new URLSearchParams(location.search).get('pieza');
    const idea = bookingForm.querySelector('[name="idea"]');
    if (pieza && names[pieza] && idea && !idea.value) idea.value = 'Me interesa: ' + names[pieza] + '. ';
  }

  /* ---- ATELIER booking form (demo: no backend) ---- */
  const booking = document.querySelector('[data-booking]');
  if (booking) booking.addEventListener('submit', e => {
    e.preventDefault();
    const response = document.querySelector('.form-response');
    if (response) response.classList.add('show');
  });

  /* ---- Consulta: carry the piece into ATELIER ---- */
  const consultaCta = document.querySelector('[data-consulta-cta]');
  if (consultaCta) {
    const pieza = new URLSearchParams(location.search).get('pieza');
    if (pieza) consultaCta.href = 'atelier.html?pieza=' + encodeURIComponent(pieza);
  }

  /* ---- Consulta: name the piece from ?pieza= ---- */
  const piezaLine = document.querySelector('[data-pieza-line]');
  if (piezaLine) {
    const names = {
      volante: 'Volante M Alcántara LCI',
      consola: 'Consola central M Carbon',
    };
    const pieza = new URLSearchParams(location.search).get('pieza');
    if (pieza && names[pieza]) {
      piezaLine.textContent = 'Tu consulta es sobre: ' + names[pieza] + '. Modelo, año y equipamiento son el punto de partida. Esta vista todavía no recibe consultas. Puedes seguir explorando las piezas o conocer la solicitud privada de ATELIER.';
    }
  }
})();
