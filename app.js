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
        /* v2.3: la intro termina → arranca la entrada cinética del titular. */
        document.documentElement.classList.add('kinetic-go');
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
  const revealEls = document.querySelectorAll('.product, .project, .atelier-step, .acc-item, .note, .home-ba, .home-atelier, .ba-slider, .case-story, .note-item, .process-step, .finder-result, .compare, .faq');
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

  /* ---- 1. Slider antes/después (arrastre + teclado + guiño inicial) ----
     v2.3: en Inicio el slider vive dentro de [data-ba-film]: ahí el
     scroll mueve el control (sin secuestrarlo) y el guiño no se usa,
     porque el scroll ya enseña que se puede comparar. En cuanto el
     visitante arrastra o usa el teclado, manda él y el scroll deja
     de mover el control. Con movimiento reducido o sin JS, el slider
     queda en 50% y funciona como siempre. ---- */
  document.querySelectorAll('[data-ba-slider]').forEach(slider => {
    const handle = slider.querySelector('[data-ba-handle]');
    if (!handle) return;
    const film = slider.closest('[data-ba-film]');
    let pos = 50, dragging = false, nudged = false, userDriven = false;
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
      userDriven = true;
      try { slider.setPointerCapture(e.pointerId); } catch (err) { /* sin captura: sigue el arrastre */ }
      fromEvent(e);
    });
    slider.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => slider.addEventListener(ev, () => { dragging = false; }));
    handle.addEventListener('keydown', e => {
      userDriven = true;
      if (e.key === 'ArrowLeft') { set(pos - 6); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { set(pos + 6); e.preventDefault(); }
      else if (e.key === 'Home') { set(4); e.preventDefault(); }
      else if (e.key === 'End') { set(96); e.preventDefault(); }
    });
    /* Guiño: la primera vez que se ve, se mueve solo un poco para
       que se entienda que se puede arrastrar. Solo fuera de la
       película: ahí el scroll ya mueve el control. */
    if (!film && !reducedMotion && 'IntersectionObserver' in window) {
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
    /* v2.3 — Película: el progreso del scroll mueve el control
       (10% → 90%) mientras la sección fijada está en pantalla.
       Sticky de CSS, nunca secuestro de scroll: la sección termina
       y el scroll sigue; en móvil el recorrido es más corto.
       Solo se activa con JS + IntersectionObserver y sin movimiento
       reducido; si el visitante ya tomó el control, no se le quita. */
    if (film && !reducedMotion && 'IntersectionObserver' in window) {
      document.documentElement.classList.add('js-ba-film');
      let filmInView = false;
      const driveFromScroll = () => {
        if (!filmInView || userDriven || dragging) return;
        const travel = film.offsetHeight - window.innerHeight;
        if (travel <= 0) return;
        const p = Math.max(0, Math.min(1, -film.getBoundingClientRect().top / travel));
        set(10 + p * 80);
      };
      const filmIO = new IntersectionObserver(entries => {
        filmInView = entries.some(entry => entry.isIntersecting);
        if (filmInView) driveFromScroll();
      }, { threshold: 0 });
      filmIO.observe(film);
      let filmQueued = false;
      window.addEventListener('scroll', () => {
        if (filmQueued) return;
        filmQueued = true;
        requestAnimationFrame(() => { filmQueued = false; driveFromScroll(); });
      }, { passive: true });
      driveFromScroll();
    }
  });

  /* ---- v2.3 — Titular del hero con entrada cinética por letras.
     Solo sin movimiento reducido: divide el h1 [data-kinetic] en
     spans por letra, conservando <em> y <br>; los espacios quedan
     como texto para no romper el interletrado. Sin JS el h1 se ve
     normal; con movimiento reducido no se divide y queda visible. ---- */
  const kinetic = document.querySelector('[data-kinetic]');
  if (kinetic && !reducedMotion) {
    const wrapLetters = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          [...child.textContent].forEach(ch => {
            if (/\s/.test(ch)) frag.appendChild(document.createTextNode(ch));
            else {
              const s = document.createElement('span');
              s.className = 'hero-letter';
              s.textContent = ch;
              frag.appendChild(s);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          wrapLetters(child);
        }
      });
    };
    wrapLetters(kinetic);
    kinetic.querySelectorAll('.hero-letter').forEach((span, i) => {
      span.style.animationDelay = (0.08 + i * 0.035) + 's';
    });
    /* Sin intro (visita repetida en la sesión: ya se quitó arriba),
       la entrada arranca ya; con intro, la arranca finish() a los 2 s. */
    if (!document.getElementById('site-intro')) document.documentElement.classList.add('kinetic-go');
  }

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
    const runFinder = () => {
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
      /* Guardar el resultado en la URL (reemplazo, sin navegar), para
         poder copiarlo y compartirlo. En la vista previa el origen es
         opaco y la URL no se puede tocar: se ignora el error. */
      try {
        history.replaceState(null, '', 'finder.html?serie=' + encodeURIComponent(serie) + '&gen=' + encodeURIComponent(gen) + '&ano=' + encodeURIComponent(ano));
      } catch (e) { /* origen opaco */ }
    };
    finder.querySelector('[data-finder-submit]').addEventListener('click', runFinder);
    finder.querySelector('[data-finder-restart]').addEventListener('click', () => {
      finder.querySelectorAll('input[type="radio"]').forEach(i => { i.checked = false; });
      markSelected();
      result.hidden = true;
      showStep(1);
    });

    /* ---- v2.1: copiar el enlace al resultado, y abrir un resultado
       desde el enlace (?serie=&gen=&ano=). ---- */
    const copyBtn = finder.querySelector('[data-finder-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const serie = valueOf('serie'), gen = valueOf('generacion'), ano = valueOf('ano');
        const url = (location.origin === 'null' ? 'https://zamora344.github.io/IMPARE-automotive' : location.origin) +
          '/finder.html?serie=' + encodeURIComponent(serie || '') + '&gen=' + encodeURIComponent(gen || '') + '&ano=' + encodeURIComponent(ano || '');
        const row = copyBtn.closest('.share-row');
        const feedback = row ? row.querySelector('[data-share-feedback]') : null;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(url);
          else throw new Error('sin portapapeles');
          if (feedback) feedback.textContent = 'Enlace copiado.';
        } catch (e) { if (feedback) feedback.textContent = 'Copia el enlace de la barra del navegador.'; }
      });
    }
    /* Abrir un resultado desde el enlace, si trae las tres respuestas. */
    const finderParams = new URLSearchParams(location.search);
    const pSerie = finderParams.get('serie'), pGen = finderParams.get('gen'), pAno = finderParams.get('ano');
    const hasOpt = (name, v) => !!finder.querySelector('input[name="' + name + '"][value="' + CSS.escape(v || '') + '"]');
    if (pSerie && pGen && pAno && hasOpt('serie', pSerie) && hasOpt('generacion', pGen) && hasOpt('ano', pAno)) {
      finder.querySelector('input[name="serie"][value="' + CSS.escape(pSerie) + '"]').checked = true;
      finder.querySelector('input[name="generacion"][value="' + CSS.escape(pGen) + '"]').checked = true;
      finder.querySelector('input[name="ano"][value="' + CSS.escape(pAno) + '"]').checked = true;
      markSelected();
      runFinder();
    }
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

  /* ================================================================
     v2.0 — "A tu imaginación" (Mauricio, 2026-11-12).
     Transiciones de página, lightbox, progreso de lectura +
     volver arriba, y formulario ATELIER más claro. Todo calmado;
     nada se mueve bajo prefers-reduced-motion. Sin librerías.
     ================================================================ */

  /* ---- 1. Transiciones de página: salir con calma antes de navegar.
     La vista previa corre en un origen opaco (location.origin es
     'null'): ahí NO se intercepta la navegación, porque su enrutado
     en memoria ya la resuelve; el fundido se hace al renderizar
     la ruta. En el sitio real, el fundido es al salir y al entrar. ---- */
  const inPreview = location.origin === 'null';
  if (!reducedMotion && !inPreview) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      let url;
      try { url = new URL(href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (!url.pathname.endsWith('.html') && url.pathname !== '/' && url.pathname !== '') return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      /* v2.1.1: si ya se está saliendo (primer toque), el segundo toque
         rápido no reinicia el temporizador: la navegación del primero
         sigue su curso y el toque no se traga. */
      if (document.body.classList.contains('leaving')) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(() => { location.href = url.href; }, 180);
    });
  }

  /* ---- 2. Progreso de lectura + volver arriba (se crean por JS,
     así no hay que tocar las 20 páginas) ---- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Volver arriba');
  toTop.textContent = '↑';
  document.body.appendChild(toTop);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    toTop.classList.toggle('show', window.scrollY > 600);
  };
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  /* ---- 3. Lightbox: tocar la foto principal para verla grande.
     La foto nunca se muestra más ancha que su tamaño nativo
     (lección v1.9.1): el tope se pone en JS con naturalWidth.
     Pie = el alt de la foto. Flechas y Escape para moverse y cerrar;
     el foco vuelve a donde estaba. ---- */
  let lightbox = null, lightboxItems = [], lightboxIndex = 0, lastFocus = null;
  function showLightbox(i) {
    if (!lightboxItems.length || !lightbox) return;
    lightboxIndex = (i + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[lightboxIndex];
    const img = lightbox.querySelector('img');
    img.removeAttribute('style');
    const cap = () => {
      const w = img.naturalWidth || item.width || 0;
      if (w > 0) img.style.maxWidth = Math.min(w, window.innerWidth * 0.94) + 'px';
    };
    img.onload = cap;
    img.srcset = item.srcset || '';
    img.sizes = item.sizes || '';
    img.src = item.src;
    img.alt = item.alt;
    if (img.complete && img.naturalWidth) cap();
    lightbox.querySelector('figcaption').textContent = item.alt;
    lightbox.querySelector('.lightbox-count').textContent = lightboxItems.length > 1 ? (lightboxIndex + 1) + ' / ' + lightboxItems.length : '';
    lightbox.querySelector('.lightbox-prev').hidden = lightboxItems.length < 2;
    lightbox.querySelector('.lightbox-next').hidden = lightboxItems.length < 2;
  }
  function openLightbox(items, start) {
    lightboxItems = items;
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.hidden = true;
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', 'Fotografía ampliada');
      lightbox.innerHTML = '<figure><img alt=""><figcaption></figcaption><div class="lightbox-count"></div></figure>' +
        '<button type="button" class="lightbox-close" aria-label="Cerrar">✕</button>' +
        '<button type="button" class="lightbox-prev" aria-label="Fotografía anterior">‹</button>' +
        '<button type="button" class="lightbox-next" aria-label="Fotografía siguiente">›</button>';
      document.body.appendChild(lightbox);
      lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showLightbox(lightboxIndex - 1));
      lightbox.querySelector('.lightbox-next').addEventListener('click', () => showLightbox(lightboxIndex + 1));
      lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
      document.addEventListener('keydown', e => {
        if (!lightbox || lightbox.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
        else if (e.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
        else if (e.key === 'Tab') {
          /* Trampa de foco: Tab no sale del lightbox mientras está abierto. */
          const focusables = [...lightbox.querySelectorAll('button:not([hidden])')];
          if (!focusables.length) return;
          const first = focusables[0], last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }
    lastFocus = document.activeElement;
    showLightbox(Math.max(0, Math.min(start, items.length - 1)));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  /* Set de la ficha (volante / consola): las miniaturas definen el set;
     la foto principal abre en la que está seleccionada. */
  const mainPhoto = document.querySelector('[data-main-photo]');
  const thumbBtns = [...document.querySelectorAll('[data-thumb]')];
  if (mainPhoto && thumbBtns.length) {
    const detailItems = thumbBtns.map(b => ({
      src: b.dataset.src, srcset: b.dataset.srcset, sizes: b.dataset.sizes,
      alt: b.dataset.alt || '', width: Number(b.dataset.width) || 0, height: Number(b.dataset.height) || 0
    }));
    mainPhoto.addEventListener('click', () => {
      const current = thumbBtns.findIndex(b => b.getAttribute('aria-pressed') === 'true');
      openLightbox(detailItems, current < 0 ? 0 : current);
    });
  }
  /* Fotos grandes de proyecto / nota: cada imagen abre su set de página. */
  const pagePhotos = [...document.querySelectorAll('img.project-full[data-lightbox]')];
  pagePhotos.forEach(img => {
    img.addEventListener('click', () => {
      const items = pagePhotos.map(p => ({
        src: p.getAttribute('src'), srcset: p.getAttribute('srcset') || '', sizes: p.getAttribute('sizes') || '',
        alt: p.getAttribute('alt') || '', width: Number(p.getAttribute('width')) || 0, height: Number(p.getAttribute('height')) || 0
      }));
      openLightbox(items, pagePhotos.indexOf(img));
    });
  });

  /* ================================================================
     v2.1 — Otra ronda (Mauricio, 2026-11-12).
     Compartir, resultado del buscador que se puede copiar y abrir
     por enlace, menú móvil a pantalla completa y pase de
     accesibilidad. Todo calmado; sin librerías.
     ================================================================ */

  /* ---- 1. Compartir: Web Share API, con copiar el enlace como
     respaldo. El texto es honesto: nombre, origen y precio de
     referencia, sin afirmaciones inventadas. ---- */
  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const data = {
        title: btn.getAttribute('data-share-title') || document.title,
        text: btn.getAttribute('data-share-text') || '',
        url: btn.getAttribute('data-share-url') || location.href
      };
      const row = btn.closest('.share-row');
      const feedback = row ? row.querySelector('[data-share-feedback]') : null;
      const say = msg => { if (feedback) feedback.textContent = msg; };
      if (navigator.share) {
        try { await navigator.share(data); return; }
        catch (e) { if (e && e.name === 'AbortError') return; /* si falla, probar copiar */ }
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(data.url);
        } else {
          const ta = document.createElement('textarea');
          ta.value = data.url; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        say('Enlace copiado.');
      } catch (e) { say('Copia el enlace de la barra del navegador.'); }
    });
  });

  /* ---- 3. Menú móvil a pantalla completa. Se construye desde los
     enlaces del <details> original (que queda como respaldo sin JS):
     al abrirse, el foco va al primer enlace; Escape o tocar un enlace
     lo cierra y devuelve el foco al botón. La navegación en memoria
     de la vista previa no se toca: los enlaces son <a> normales. ---- */
  const menuDetails = document.querySelector('.menu');
  const topBar = document.querySelector('.top');
  if (menuDetails && topBar) {
    document.documentElement.classList.add('js');
    const menuLinks = [...menuDetails.querySelectorAll('.menu-panel a')].map(a => ({
      href: a.getAttribute('href'), text: a.textContent.trim(),
      current: a.getAttribute('aria-current') === 'page'
    }));
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'menu-toggle';
    toggle.textContent = 'Menú';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'menu-overlay');
    toggle.setAttribute('aria-label', 'Abrir menú');
    topBar.insertBefore(toggle, topBar.querySelector('.cart-link'));
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    overlay.id = 'menu-overlay';
    overlay.hidden = true;
    overlay.innerHTML = '<button type="button" class="menu-close" aria-label="Cerrar menú">✕</button>' +
      '<nav class="menu-overlay-nav" aria-label="Menú móvil"></nav>' +
      '<p class="menu-overlay-note">Citas privadas · San Pedro</p>';
    const overlayNav = overlay.querySelector('.menu-overlay-nav');
    menuLinks.forEach(l => {
      const a = document.createElement('a');
      a.href = l.href; a.textContent = l.text;
      if (l.current) a.setAttribute('aria-current', 'page');
      overlayNav.appendChild(a);
    });
    document.body.appendChild(overlay);
    let menuOpen = false, menuLastFocus = null;
    const openMenu = () => {
      menuOpen = true; menuLastFocus = document.activeElement;
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      const first = overlayNav.querySelector('a');
      if (first) first.focus();
    };
    const closeMenu = () => {
      if (!menuOpen) return;
      menuOpen = false;
      overlay.hidden = true;
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      if (menuLastFocus && menuLastFocus.focus) menuLastFocus.focus();
    };
    toggle.addEventListener('click', () => { if (menuOpen) closeMenu(); else openMenu(); });
    overlay.querySelector('.menu-close').addEventListener('click', closeMenu);
    overlayNav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', e => { if (menuOpen && e.key === 'Escape') closeMenu(); });
  }

  /* ---- 4. Accesibilidad: que Tab recorra la página en orden.
     Los controles principales ya son <button>, <a> o <input>; aquí
     se cierran los huecos: la miniatura activa de la galería se
     anuncia, y el slider ya tiene rol y teclado (v1.9). ---- */
  thumbs.forEach(button => {
    button.addEventListener('click', () => {
      button.setAttribute('aria-current', 'true');
      thumbs.forEach(t => { if (t !== button) t.removeAttribute('aria-current'); });
    });
  });

  /* ---- 4. ATELIER: prefill visible + errores en línea + confirmación
     con pasos. El envío sigue siendo demo: no se envía ni se guarda nada. ---- */
  if (bookingForm) {
    const prefillNote = document.querySelector('[data-prefill-note]');
    const params = new URLSearchParams(location.search);
    const piezaNames = { volante: 'Volante M Alcántara LCI', consola: 'Consola central M Carbon' };
    const pieza = params.get('pieza');
    const modelo = params.get('modelo');
    if (prefillNote) {
      if (pieza && piezaNames[pieza]) {
        prefillNote.innerHTML = '<strong>Tu consulta es sobre:</strong> ' + piezaNames[pieza] + '.';
        prefillNote.hidden = false;
      } else if (modelo) {
        const vehiculo = bookingForm.querySelector('[name="vehiculo"]');
        const label = (vehiculo && vehiculo.value) ? vehiculo.value : ('BMW ' + modelo);
        prefillNote.innerHTML = '<strong>Tu BMW:</strong> ' + label + '.';
        prefillNote.hidden = false;
      }
    }
    /* Errores en línea: en lugar del globo del navegador, un mensaje
       tranquilo bajo el campo, con aria para lectores de pantalla. */
    const messages = {
      nombre: 'Escribe tu nombre, por favor.',
      telefono: 'Escribe un teléfono para poder contactarte.',
      idea: 'Cuéntanos tu idea en unas líneas.',
      correo: 'Revisa el correo, parece incompleto.'
    };
    const showError = field => {
      const label = field.closest('.field');
      if (!label) return;
      let msg = label.querySelector('.field-error');
      if (!msg) {
        msg = document.createElement('span');
        msg.className = 'field-error';
        msg.id = 'err-' + field.name;
        label.appendChild(msg);
      }
      msg.textContent = messages[field.name] || 'Revisa este campo.';
      label.classList.add('field--error');
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', msg.id);
    };
    const clearError = field => {
      const label = field.closest('.field');
      if (!label) return;
      const msg = label.querySelector('.field-error');
      if (msg) msg.remove();
      label.classList.remove('field--error');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    };
    bookingForm.addEventListener('invalid', e => {
      e.preventDefault();
      showError(e.target);
    }, true);
    bookingForm.addEventListener('input', e => {
      if (e.target.matches('input, textarea')) clearError(e.target);
    });
    bookingForm.addEventListener('submit', () => {
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Idea enviada'; }
      bookingForm.querySelectorAll('input, textarea').forEach(el => { el.disabled = true; });
    });
  }
})();
