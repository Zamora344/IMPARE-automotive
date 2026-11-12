/* IMPARE v1.8 — carrito y checkout (demostración).
   Sin librerías externas, sin backend, sin proveedor de pago.
   El carrito vive en MEMORIA mientras se navega (la fuente de verdad);
   localStorage es solo un respaldo que se intenta, porque en algunos
   orígenes (vista previa incrustada, modo privado) el almacenamiento se
   descarta y el carrito salía vacío aunque dijera "Agregado".
   El checkout NO cobra nada, NO pide datos de tarjeta y NO guarda
   ningún dato del cliente: la confirmación es solo una vista de demo. */
(function () {
  'use strict';

  /* ---- Catálogo: solo las 2 piezas con fotografía en Collection.
     Precios de referencia (ver revision-v18.md): volante $21,500 MXN,
     consola $9,900 MXN. Etiquetados en el sitio como "por confirmar". ---- */
  var PRODUCTS = {
    volante: { id: 'volante', name: 'Volante M Alcántara LCI', price: 21500, img: 'assets/wheel-angle.webp', alt: 'Volante M Alcántara LCI', href: 'volante.html' },
    consola: { id: 'consola', name: 'Consola central M Carbon', price: 9900, img: 'assets/console.webp', alt: 'Consola central M Carbon', href: 'consola.html' }
  };
  var CART_KEY = 'impare-cart-v1';
  var CP_KEY = 'impare-ship-cp';
  var SHIPPING_NATIONAL = 350; /* MXN, estimado demo. Monterrey local: $0. */
  var MAX_QTY = 2; /* Piezas únicas / take-off: no tiene sentido pedir más. */

  function money(n) { return '$' + Number(n).toLocaleString('es-MX') + ' MXN'; }

  /* ---- Persistencia: memoria primero, localStorage solo como respaldo ---- */
  var memoryCart = null;
  var memoryCP = null;
  function loadCart() {
    if (memoryCart) return memoryCart;
    var cart = {};
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        Object.keys(data).forEach(function (id) {
          if (PRODUCTS[id] && Number(data[id]) > 0) cart[id] = Math.min(MAX_QTY, Math.floor(Number(data[id])));
        });
      }
    } catch (e) { /* almacenamiento no disponible: se queda en memoria */ }
    memoryCart = cart;
    return memoryCart;
  }
  function saveCart(cart) {
    memoryCart = cart;
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* modo privado */ }
  }
  function loadCP() {
    if (memoryCP !== null) return memoryCP;
    try { memoryCP = localStorage.getItem(CP_KEY) || ''; } catch (e) { memoryCP = ''; }
    return memoryCP;
  }
  function saveCPValue(value) {
    memoryCP = cleanCP(value);
    try { localStorage.setItem(CP_KEY, memoryCP); } catch (e) { /* modo privado */ }
  }
  function cartCount(cart) {
    return Object.keys(cart).reduce(function (n, id) { return n + cart[id]; }, 0);
  }
  function cartSubtotal(cart) {
    return Object.keys(cart).reduce(function (n, id) { return n + PRODUCTS[id].price * cart[id]; }, 0);
  }

  /* ---- Envío por CP (demo): 64000–67999 = Monterrey / área metro. ---- */
  function cleanCP(value) { return String(value || '').replace(/\D/g, '').slice(0, 5); }
  function isLocalCP(cp) { return /^6[4-7]\d{3}$/.test(cleanCP(cp)); }
  function shippingFor(cp) {
    if (cleanCP(cp).length !== 5) return null;
    return isLocalCP(cp) ? 0 : SHIPPING_NATIONAL;
  }
  function shippingLabel(cp) {
    var cost = shippingFor(cp);
    if (cost === null) return 'Escribe tu CP para calcular el envío';
    if (cost === 0) return 'Entrega personal en Monterrey — a acordar · $0 MXN';
    return 'Paquetería a ' + cleanCP(cp) + ' · $350 MXN (estimado)';
  }

  /* ---- Contador del nav (todas las páginas) ---- */
  function updateBadges() {
    var count = cartCount(loadCart());
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });
  }

  /* ---- Botones "Agregar al carrito" (Collection y fichas) ---- */
  document.querySelectorAll('[data-add-to-cart]').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-add-to-cart');
      if (!PRODUCTS[id]) return;
      var cart = loadCart();
      cart[id] = Math.min(MAX_QTY, (cart[id] || 0) + 1);
      saveCart(cart);
      updateBadges();
      var original = button.textContent;
      button.textContent = 'Agregado al carrito';
      button.setAttribute('aria-live', 'polite');
      button.disabled = true;
      setTimeout(function () { button.textContent = original; button.disabled = false; }, 1600);
    });
  });
  updateBadges();

  /* ================================================================
     Página del carrito (carrito.html)
     ================================================================ */
  var cartList = document.querySelector('[data-cart-list]');
  if (cartList) {
    var emptyState = document.querySelector('[data-cart-empty]');
    var summary = document.querySelector('[data-cart-summary]');
    var shipInput = document.querySelector('[data-ship-cp]');
    var shipCalc = document.querySelector('[data-ship-calc]');
    var shipLine = document.querySelector('[data-ship-line]');
    var shipCost = document.querySelector('[data-ship-cost]');
    var totalEl = document.querySelector('[data-cart-total]');
    var subtotalEl = document.querySelector('[data-cart-subtotal]');
    var checkoutBtn = document.querySelector('[data-goto-checkout]');

    if (shipInput && !shipInput.value) shipInput.value = loadCP();

    function renderCart() {
      var cart = loadCart();
      var ids = Object.keys(cart);
      var subtotal = cartSubtotal(cart);
      cartList.innerHTML = '';
      if (emptyState) emptyState.hidden = ids.length !== 0;
      if (summary) summary.hidden = ids.length === 0;
      if (checkoutBtn) checkoutBtn.hidden = ids.length === 0;
      ids.forEach(function (id) {
        var p = PRODUCTS[id];
        var qty = cart[id];
        var line = document.createElement('li');
        line.className = 'cart-line';
        line.innerHTML =
          '<a class="cart-thumb" href="' + p.href + '"><img src="' + p.img + '" alt="' + p.alt + '" width="120" height="90" loading="lazy"></a>' +
          '<div class="cart-info"><a href="' + p.href + '"><h3>' + p.name + '</h3></a>' +
          '<p>' + money(p.price) + ' c/u</p></div>' +
          '<div class="cart-qty" role="group" aria-label="Cantidad de ' + p.name + '">' +
          '<button type="button" data-dec="' + id + '" aria-label="Quitar uno">−</button>' +
          '<span aria-live="polite">' + qty + '</span>' +
          '<button type="button" data-inc="' + id + '" aria-label="Agregar uno"' + (qty >= MAX_QTY ? ' disabled title="Máximo 2 por pieza"' : '') + '>+</button></div>' +
          '<p class="cart-line-total">' + money(p.price * qty) + '</p>' +
          '<button type="button" class="cart-remove" data-remove="' + id + '">Quitar</button>';
        cartList.appendChild(line);
      });
      if (subtotalEl) subtotalEl.textContent = money(subtotal);
      updateTotals();
    }

    function updateTotals() {
      var cart = loadCart();
      var subtotal = cartSubtotal(cart);
      var cp = shipInput ? shipInput.value : '';
      var cost = shippingFor(cp);
      if (shipLine) shipLine.textContent = shippingLabel(cp);
      if (shipCost) shipCost.textContent = cost === null ? '—' : money(cost);
      if (totalEl) totalEl.textContent = money(subtotal + (cost === null ? 0 : cost));
    }

    cartList.addEventListener('click', function (e) {
      var button = e.target.closest('button');
      if (!button) return;
      var cart = loadCart();
      var id = button.getAttribute('data-inc') || button.getAttribute('data-dec') || button.getAttribute('data-remove');
      if (!id || !PRODUCTS[id]) return;
      /* v2.1: al redibujar el carrito el foco se perdía (el botón se
         destruía con la línea). Se guarda qué botón era y se devuelve
         el foco al equivalente, para poder seguir con el teclado. */
      var focusKey = button.hasAttribute('data-inc') ? 'inc' : button.hasAttribute('data-dec') ? 'dec' : 'remove';
      if (button.hasAttribute('data-inc')) cart[id] = Math.min(MAX_QTY, (cart[id] || 0) + 1);
      if (button.hasAttribute('data-dec')) { cart[id] = (cart[id] || 1) - 1; if (cart[id] <= 0) delete cart[id]; }
      if (button.hasAttribute('data-remove')) delete cart[id];
      saveCart(cart);
      updateBadges();
      renderCart();
      if (focusKey !== 'remove' && cart[id]) {
        var next = cartList.querySelector('[data-' + focusKey + '="' + id + '"]');
        if (next) next.focus();
      } else if (!cart[id] && Object.keys(cart).length === 0) {
        /* La línea desapareció y el carrito quedó vacío: el foco va
           al botón del estado vacío, no se queda en el aire. */
        var emptyCta = emptyState ? emptyState.querySelector('a.button') : null;
        if (emptyCta) emptyCta.focus();
      }
    });

    function saveCP() {
      if (shipInput) saveCPValue(shipInput.value);
      updateTotals();
    }
    if (shipCalc) shipCalc.addEventListener('click', saveCP);
    if (shipInput) shipInput.addEventListener('change', saveCP);
    renderCart();
    /* Si se vuelve a la página desde la caché del navegador (atrás /
       adelante), el carrito puede haber cambiado: volver a dibujarlo. */
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('pageshow', function (e) { if (e.persisted) renderCart(); });
    }
  }

  /* ================================================================
     Checkout (checkout.html) — 3 pasos en la misma página.
     Paso 1: Tus artículos · Paso 2: Tus datos y envío · Paso 3: Pago.
     Nada se cobra, nada se envía, ningún dato se guarda.
     ================================================================ */
  var checkout = document.querySelector('[data-checkout]');
  if (checkout) {
    var steps = Array.prototype.slice.call(checkout.querySelectorAll('[data-step-panel]'));
    var stepItems = Array.prototype.slice.call(checkout.querySelectorAll('[data-step-item]'));
    var form = checkout.querySelector('[data-checkout-form]');
    var cpField = form ? form.querySelector('[name="cp"]') : null;
    var shipMethod = checkout.querySelector('[data-ship-method]');
    var confirmPanel = checkout.querySelector('[data-confirm]');
    var orderNumberEl = checkout.querySelector('[data-order-number]');
    var current = 0;

    if (cpField && !cpField.value) cpField.value = loadCP();

    function totals() {
      var cart = loadCart();
      var subtotal = cartSubtotal(cart);
      var cost = shippingFor(cpField ? cpField.value : '');
      return { cart: cart, subtotal: subtotal, shipping: cost, total: subtotal + (cost === null ? 0 : cost) };
    }

    function renderSummary() {
      var t = totals();
      var ids = Object.keys(t.cart);
      checkout.querySelectorAll('[data-summary-items]').forEach(function (box) {
        box.innerHTML = '';
        ids.forEach(function (id) {
          var p = PRODUCTS[id];
          var row = document.createElement('li');
          row.innerHTML = '<span>' + p.name + ' × ' + t.cart[id] + '</span><span>' + money(p.price * t.cart[id]) + '</span>';
          box.appendChild(row);
        });
      });
      checkout.querySelectorAll('[data-summary-subtotal]').forEach(function (el) { el.textContent = money(t.subtotal); });
      checkout.querySelectorAll('[data-summary-shipping]').forEach(function (el) { el.textContent = t.shipping === null ? 'Por calcular (CP)' : money(t.shipping); });
      checkout.querySelectorAll('[data-summary-total]').forEach(function (el) { el.textContent = money(t.total); });
      if (shipMethod) shipMethod.textContent = shippingLabel(cpField ? cpField.value : '');
      return t;
    }

    function showStep(index, scroll) {
      current = index;
      steps.forEach(function (panel, i) { panel.hidden = i !== index; });
      stepItems.forEach(function (item, i) {
        if (i === index) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
        item.classList.toggle('is-done', i < index);
      });
      if (scroll !== false) checkout.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* Paso 1 → 2 */
    var toStep2 = checkout.querySelector('[data-to-step-2]');
    if (toStep2) toStep2.addEventListener('click', function () { renderSummary(); showStep(1); });

    /* Paso 2: el envío se recalcula al escribir el CP */
    if (cpField) cpField.addEventListener('input', function () {
      saveCPValue(cpField.value);
      renderSummary();
    });

    /* Paso 2 → 3 (con validación) */
    var toStep3 = checkout.querySelector('[data-to-step-3]');
    if (toStep3) toStep3.addEventListener('click', function () {
      if (!form) return;
      if (!form.reportValidity()) return;
      renderSummary();
      showStep(2);
    });
    checkout.querySelectorAll('[data-back]').forEach(function (button) {
      button.addEventListener('click', function () { showStep(Number(button.getAttribute('data-back'))); });
    });

    /* Método de pago: solo cambia el texto de ayuda, nunca pide tarjeta. */
    checkout.querySelectorAll('input[name="pago"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var cardNote = checkout.querySelector('[data-pay-note-card]');
        var transferNote = checkout.querySelector('[data-pay-note-transfer]');
        if (cardNote) cardNote.hidden = radio.value !== 'tarjeta';
        if (transferNote) transferNote.hidden = radio.value !== 'transferencia';
      });
    });

    /* Confirmar (demo): número de pedido, checklist, vaciar carrito. */
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var t = renderSummary();
      if (Object.keys(t.cart).length === 0) return;
      var now = new Date();
      var stamp = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
      var order = 'IMP-' + stamp + '-' + String(Math.floor(1000 + Math.random() * 9000));
      if (orderNumberEl) orderNumberEl.textContent = order;
      var name = form.querySelector('[name="nombre"]');
      var confirmName = checkout.querySelector('[data-confirm-name]');
      if (confirmName && name) confirmName.textContent = name.value;
      steps.forEach(function (panel) { panel.hidden = true; });
      if (confirmPanel) { confirmPanel.hidden = false; confirmPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      saveCart({});
      updateBadges();
    });

    /* Si el carrito está vacío, el checkout no tiene qué cobrar. */
    var emptyNote = checkout.querySelector('[data-checkout-empty]');
    function refreshCheckout() {
      /* No tocar nada si ya se mostró la confirmación de demo. */
      if (confirmPanel && !confirmPanel.hidden) return;
      if (cpField && !cpField.value) cpField.value = loadCP();
      if (Object.keys(loadCart()).length === 0) {
        steps.forEach(function (panel) { panel.hidden = true; });
        if (emptyNote) emptyNote.hidden = false;
      } else {
        if (emptyNote) emptyNote.hidden = true;
        renderSummary();
        showStep(0, false);
      }
    }
    refreshCheckout();
    /* Volver desde la caché del navegador (atrás / adelante) con el
       carrito ya cambiado: refrescar sin perder la confirmación. */
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('pageshow', function (e) { if (e.persisted) refreshCheckout(); });
    }
  }
})();
