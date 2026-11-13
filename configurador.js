/* Configurador visual v2.3 — IMPARE Automotive.
   Solo en proyecto-g20-rojo.html y proyecto-g20-blanco.html.
   Sin librerías, sin peticiones externas. Los datos del panel son
   solo los ya publicados en el sitio: volante, consola y umbral tienen
   precio de referencia y ficha; el resto está por estudiar. */
(function () {
  'use strict';

  var ZONES = {
    fascia: {
      grupo: 'Exterior',
      nombre: 'Fascia estilo M2 Competition',
      desc: 'Fascia delantera con la línea de M2 Competition, integrada a la carrocería del G20.',
      estado: 'Próximamente — por estudiar. Esta pieza aún no tiene ficha ni fotografía de la pieza en el sitio.'
    },
    rines: {
      grupo: 'Exterior',
      nombre: 'Rines',
      desc: 'Juego de rines a medida del proyecto, con el acabado que marca el carácter del auto.',
      estado: 'Próximamente — por estudiar. Esta pieza aún no tiene ficha ni fotografía de la pieza en el sitio.'
    },
    spoiler: {
      grupo: 'Exterior',
      nombre: 'Spoiler',
      desc: 'Spoiler trasero discreto, en la línea del auto, sin romper su silueta.',
      estado: 'Próximamente — por estudiar. Esta pieza aún no tiene ficha ni fotografía de la pieza en el sitio.'
    },
    volante: {
      grupo: 'Interior',
      nombre: 'Volante M Competition de carbono',
      desc: 'Volante M Competition de piel, de M3/M4 (G80/G82), con botones M1 y M2. En carros que no son M, los botones son parte del diseño.',
      origen: 'OEM genuino',
      precio: '$21,500 MXN',
      enlace: 'volante.html'
    },
    umbral: {
      grupo: 'Interior',
      nombre: 'Umbral M Performance Carbono',
      desc: 'Umbral de puerta en fibra de carbono con el logo M Performance. Se ve cada vez que abres la puerta; se ocupan dos, uno por lado.',
      origen: 'OEM genuino',
      precio: '$3,500 MXN',
      enlace: 'umbral.html'
    },
    consola: {
      grupo: 'Interior',
      nombre: 'Consola M3',
      desc: 'Consola central M3 con acabado en fibra de carbono.',
      origen: 'OEM Take-Off',
      precio: '$9,900 MXN',
      enlace: 'consola.html'
    },
    asientos: {
      grupo: 'Interior',
      nombre: 'Asientos M3',
      desc: 'Asientos M3, con el apoyo y el carácter del interior M.',
      estado: 'Próximamente — por estudiar. Esta pieza aún no tiene ficha ni fotografía de la pieza en el sitio.'
    },
    escapes: {
      grupo: 'Escapes',
      nombre: 'Escapes',
      desc: 'Salidas de escape a medida del proyecto, con la presencia que pide el G20.',
      estado: 'Próximamente — por estudiar. Esta pieza aún no tiene ficha ni fotografía de la pieza en el sitio.'
    }
  };

  var section = document.querySelector('.cfg');
  if (!section) { return; }
  var panel = document.getElementById('cfg-panel');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-cfg-zone]'));
  if (!panel || !triggers.length) { return; }

  var elGrupo = panel.querySelector('[data-cfg-eyebrow]');
  var elNombre = panel.querySelector('[data-cfg-name]');
  var elDesc = panel.querySelector('[data-cfg-desc]');
  var elNota = panel.querySelector('[data-cfg-note]');
  var elFacts = panel.querySelector('[data-cfg-facts]');
  var elEstado = panel.querySelector('[data-cfg-status]');
  var elEnlace = panel.querySelector('[data-cfg-link]');
  var elCerrar = panel.querySelector('[data-cfg-close]');
  if (!elNombre || !elDesc || !elFacts || !elCerrar) { return; }

  var abierto = null;
  var ultimoTrigger = null;

  /* v2.3.1 — Vistas Exterior / Interior: dos botones grandes cambian
     la foto del escenario. Al tocar una zona de la lista se cambia
     primero a su vista y luego se abre el panel; si el panel ya estaba
     abierto para esa zona, el toque lo cierra. */
  var viewBtns = Array.prototype.slice.call(document.querySelectorAll('[data-cfg-view-btn]'));
  var stages = Array.prototype.slice.call(document.querySelectorAll('[data-cfg-view-stage]'));
  function mostrarVista(vista) {
    viewBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-cfg-view-btn') === vista ? 'true' : 'false');
    });
    stages.forEach(function (st) {
      st.hidden = st.getAttribute('data-cfg-view-stage') !== vista;
    });
  }
  viewBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      mostrarVista(b.getAttribute('data-cfg-view-btn'));
      /* Cambiar de vista cierra el panel; el foco se queda en el botón. */
      cerrar(false);
    });
  });

  function setExpanded(id, value) {
    triggers.forEach(function (t) {
      if (t.getAttribute('data-cfg-zone') === id) {
        t.setAttribute('aria-expanded', value ? 'true' : 'false');
      }
    });
  }

  function limpiarHechos() {
    while (elFacts.firstChild) { elFacts.removeChild(elFacts.firstChild); }
  }

  function agregarHecho(etiqueta, valor) {
    var dt = document.createElement('dt');
    dt.textContent = etiqueta;
    var dd = document.createElement('dd');
    dd.textContent = valor;
    elFacts.appendChild(dt);
    elFacts.appendChild(dd);
  }

  function abrir(id, trigger) {
    var zona = ZONES[id];
    if (!zona) { return; }
    if (abierto) { setExpanded(abierto, false); }
    elGrupo.textContent = zona.grupo;
    elNombre.textContent = zona.nombre;
    elDesc.textContent = zona.desc;
    var nota = trigger.getAttribute('data-cfg-nota') || '';
    if (nota) {
      elNota.textContent = nota;
      elNota.hidden = false;
    } else {
      elNota.textContent = '';
      elNota.hidden = true;
    }
    limpiarHechos();
    if (zona.origen) { agregarHecho('Origen', zona.origen); }
    if (zona.precio) { agregarHecho('Precio de referencia', zona.precio + ' — por confirmar'); }
    if (zona.estado) {
      elEstado.textContent = zona.estado;
      elEstado.hidden = false;
    } else {
      elEstado.textContent = '';
      elEstado.hidden = true;
    }
    if (zona.enlace) {
      elEnlace.setAttribute('href', zona.enlace);
      elEnlace.hidden = false;
    } else {
      elEnlace.removeAttribute('href');
      elEnlace.hidden = true;
    }
    panel.hidden = false;
    abierto = id;
    ultimoTrigger = trigger;
    setExpanded(id, true);
    elNombre.focus();
  }

  function cerrar(devolverFoco) {
    if (!abierto) { return; }
    setExpanded(abierto, false);
    abierto = null;
    panel.hidden = true;
    if (devolverFoco !== false && ultimoTrigger) {
      ultimoTrigger.focus();
    }
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var id = trigger.getAttribute('data-cfg-zone');
      var eraAbierto = (abierto === id);
      var vista = trigger.getAttribute('data-cfg-view');
      if (vista) { mostrarVista(vista); }
      if (eraAbierto) { cerrar(true); return; }
      abrir(id, trigger);
    });
  });

  elCerrar.addEventListener('click', function () { cerrar(true); });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !abierto) { return; }
    /* Si el lightbox está abierto, Escape es suyo. */
    if (document.querySelector('.lightbox:not([hidden])')) { return; }
    cerrar(true);
  });
})();
