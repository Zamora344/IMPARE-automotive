(function () {
  const form = document.querySelector('[data-filter-form]');
  if (form) {
    const disclosure = document.querySelector('.filter-disclosure');
    if (disclosure && window.matchMedia('(max-width:650px)').matches) disclosure.open = false;
    if (disclosure) disclosure.dataset.ready = 'true';
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
      document.querySelector('[data-count]').textContent = shown + (shown === 1 ? ' pieza' : ' piezas') + ' para explorar';
      document.querySelector('.empty').classList.toggle('show', shown === 0);
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
  const photo = document.querySelector('[data-main-photo]');
  const thumbs = [...document.querySelectorAll('[data-thumb]')];
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
  const entry = document.querySelector('.atelier-entry');
  if (entry) {
    const skip = entry.querySelector('[data-skip]');
    const finish = () => { entry.classList.add('skipped'); entry.querySelector('video').pause(); };
    skip.addEventListener('click', finish);
    entry.addEventListener('animationend', e => { if (e.target === entry) finish(); });
  }
  const menu = document.querySelector('.menu');
  if (menu) menu.addEventListener('keydown', e => { if (e.key === 'Escape') {menu.open = false; menu.querySelector('summary').focus();} });
  const booking = document.querySelector('[data-booking]');
  if (booking) booking.addEventListener('submit', e => {e.preventDefault(); document.querySelector('.form-response').classList.add('show');});
})();
