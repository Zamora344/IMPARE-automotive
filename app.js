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

  /* ================================================================
     v1.9 — Mejora continua (revision-v19.md).
     Sin librerías. Todo con calma; nada se mueve bajo
     prefers-reduced-motion. Sin JS, el contenido sigue visible:
     el slider arranca en 50% por CSS y el buscador es un formulario.
     ================================================================ */

  /* ---- Reveal al hacer scroll ---- */
  const revealEls = document.querySelectorAll('.product, .project, .atelier-step, .acc-item, .note, .home-ba, .home-atelier, .ba-slider, .case-story, .note-item, .process-step, .finder-result');
  if (revealEls.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(el => { el.classList.add('reveal'); io.observe(el); });
    }
  }

  /* ---- 1. Slider antes/después (arrastre + teclado + guiño inicial) ---- */
  document.querySelectorAll('[data-ba-slider]').forEach(slider => {
    const handle = slider.querySelector('[data-ba-handle]');
    if (!handle) return;
    let pos = 50, dragging = false, nudged = false;
    const set = p => {
      pos = Math.max(4, Math.min(96, p));
      slider.style.setProperty('--ba-pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
    };
    const fromEvent = e => {
      const r = slider.getBoundingClientRect();
      const x = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      set((x - r.left) / r.width * 100);
    };
    slider.addEventListener('pointerdown', e => {
      dragging = true;
      try { slider.setPointerCapture(e.pointerId); } catch (err) { /* sin captura: sigue el arrastre */ }
      fromEvent(e);
    });
    slider.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => slider.addEventListener(ev, () => { dragging = false; }));
    handle.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { set(pos - 6); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { set(pos + 6); e.preventDefault(); }
      else if (e.key === 'Home') { set(4); e.preventDefault(); }
      else if (e.key === 'End') { set(96); e.preventDefault(); }
    });
    /* Guiño: la primera vez que se ve, se mueve solo un poco para
       que se entienda que se puede arrastrar. */
    if (!reducedMotion && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || nudged) return;
          nudged = true; io.disconnect();
          const start = performance.now();
          const tick = now => {
            const t = Math.min(1, (now - start) / 1500);
            set(50 + 12 * Math.sin(t * Math.PI));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.4 });
      io.observe(slider);
    }
    set(50);
  });

  /* ---- 3. Buscador guiado "¿Es para mi BMW?" ----
     Reglas honestas, definidas por los fundadores:
     - Volante G→F: en generación F, por estudiar caso por caso.
       En generación G, aplica en principio (pieza de su generación).
     - Consola M Carbon: era G20/G22 (Serie 3 G20, Serie 4 G22).
       Todo lo demás, por estudiar. Sin generación, por estudiar.
     - MINI: no aplica (Collection no tiene piezas para MINI).
     - Si hay duda, "por estudiar". Nunca se promete compatibilidad. */
  const finder = document.querySelector('[data-finder]');
  if (finder) {
    finder.addEventListener('submit', e => e.preventDefault());
    const steps = [...finder.querySelectorAll('[data-finder-step]')];
    const result = finder.querySelector('[data-finder-result]');
    const seriesNames = {
      serie1: 'Serie 1', serie2: 'Serie 2', serie3: 'Serie 3', serie4: 'Serie 4',
      serie5: 'Serie 5', serie6: 'Serie 6', serie7: 'Serie 7',
      x1: 'X1', x2: 'X2', x3: 'X3', x4: 'X4', x5: 'X5', x6: 'X6', z4: 'Z4',
      mini: 'MINI', otro: 'Otro BMW'
    };
    const showStep = n => {
      steps.forEach(s => { s.hidden = Number(s.dataset.finderStep) !== n; });
      const current = steps.find(s => Number(s.dataset.finderStep) === n);
      if (current) { const first = current.querySelector('input'); if (first) first.focus(); }
    };
    const valueOf = name => { const el = finder.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; };
    const markSelected = () => {
      finder.querySelectorAll('.finder-opt').forEach(label => {
        const input = label.querySelector('input');
        label.classList.toggle('selected', !!(input && input.checked));
      });
      /* El botón de cada paso solo se activa cuando hay una respuesta. */
      const stepNames = { 1: 'serie', 2: 'generacion', 3: 'ano' };
      steps.forEach(step => {
        const n = Number(step.dataset.finderStep);
        const btn = step.querySelector('[data-finder-next], [data-finder-submit]');
        if (btn) btn.disabled = !valueOf(stepNames[n]);
      });
    };
    finder.addEventListener('change', markSelected);
    markSelected();
    finder.querySelectorAll('[data-finder-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = Number(btn.closest('[data-finder-step]').dataset.finderStep);
        if (!valueOf(step === 1 ? 'serie' : step === 2 ? 'generacion' : 'ano')) return;
        showStep(step + 1);
      });
    });
    finder.querySelectorAll('[data-finder-back]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = Number(btn.closest('[data-finder-step]').dataset.finderStep);
        showStep(step - 1);
      });
    });
    const volanteRow = result.querySelector('[data-result="volante"]');
    const consolaRow = result.querySelector('[data-result="consola"]');
    const setRow = (row, tag, tagLabel, text) => {
      row.querySelector('[data-result-tag]').textContent = tagLabel;
      row.querySelector('[data-result-tag]').className = 'result-tag result-tag--' + tag;
      row.querySelector('[data-result-text]').textContent = text;
    };
    finder.querySelector('[data-finder-submit]').addEventListener('click', () => {
      const serie = valueOf('serie'), gen = valueOf('generacion'), ano = valueOf('ano');
      if (!serie || !gen || !ano) return;
      /* Volante */
      if (serie === 'mini') {
        setRow(volanteRow, 'no', 'No aplica', 'Por ahora Collection no tiene piezas para MINI.');
      } else if (gen === 'G') {
        setRow(volanteRow, 'aplica', 'Aplica en principio', 'El volante es una pieza de generación G, como tu auto. Confirmamos modelo y año exactos antes de instalar.');
      } else {
        setRow(volanteRow, 'estudio', 'Por estudiar', 'El retrofit de volante G a F se evalúa caso por caso: modelo, año y equipamiento. Lo revisamos contigo, en persona.');
      }
      /* Consola */
      if (serie === 'mini') {
        setRow(consolaRow, 'no', 'No aplica', 'Por ahora Collection no tiene piezas para MINI.');
      } else if ((serie === 'serie3' || serie === 'serie4') && gen === 'G') {
        setRow(consolaRow, 'aplica', 'Aplica en principio', 'La consola es de la era G20/G22, como tu auto. Confirmamos modelo y año exactos antes de instalar.');
      } else {
        setRow(consolaRow, 'estudio', 'Por estudiar', 'La consola es una pieza de la era G20/G22. Para tu auto se revisa caso por caso: modelo, año y equipamiento.');
      }
      const summary = result.querySelector('[data-finder-summary]');
      summary.textContent = 'Tu BMW: ' + (seriesNames[serie] || serie) + ' · generación ' + (gen === 'nose' ? 'por confirmar' : gen) + ' · año ' + ano + '.';
      const cta = result.querySelector('[data-finder-cta]');
      cta.href = 'atelier.html?modelo=' + encodeURIComponent(seriesNames[serie] || serie) +
        '&gen=' + encodeURIComponent(gen) + '&ano=' + encodeURIComponent(ano);
      steps.forEach(s => { s.hidden = true; });
      result.hidden = false;
      result.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
    finder.querySelector('[data-finder-restart]').addEventListener('click', () => {
      finder.querySelectorAll('input[type="radio"]').forEach(i => { i.checked = false; });
      markSelected();
      result.hidden = true;
      showStep(1);
    });
  }

  /* ---- ATELIER: prefill también desde el buscador (?modelo=&gen=&ano=) ---- */
  if (bookingForm) {
    const params = new URLSearchParams(location.search);
    const modelo = params.get('modelo'), gen = params.get('gen'), ano = params.get('ano');
    const vehiculo = bookingForm.querySelector('[name="vehiculo"]');
    const idea = bookingForm.querySelector('[name="idea"]');
    if (modelo) {
      const label = 'BMW ' + modelo + (gen && gen !== 'nose' ? ' · generación ' + gen : '') + (ano ? ' · año ' + ano : '');
      if (vehiculo && !vehiculo.value) vehiculo.value = label;
      if (idea && !idea.value) idea.value = 'Mi BMW: ' + label + '. ';
    }
  }
})();
