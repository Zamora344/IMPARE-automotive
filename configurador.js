/* Configurador visual v2.3 — IMPARE Automotive.
   Solo en proyecto-g20-rojo.html y proyecto-g20-blanco.html.
   Sin librerías, sin peticiones externas. Los datos del panel son
   solo los ya publicados en el sitio: volante y consola tienen
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
      desc: 'Volante M de Alcántara con detalles en carbono, con marca central y botones M.',
      origen: 'OEM genuino',
      precio: '$21,500 MXN',
      enlace: 'volante.html'
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
      if (abierto === id) { cerrar(true); }
      else { abrir(id, trigger); }
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
