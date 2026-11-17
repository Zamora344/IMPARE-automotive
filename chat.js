/* IMPARE v3.0.1 — chat del sitio (asistente con el conocimiento de la página)
   Responde sobre los cinco volantes, compatibilidad y ATELIER.
   No vende, no cobra, no promete compatibilidad sin verificar.
   Es un asistente de reglas (no una IA): entiende modelos, años, precios,
   comparaciones, instalación, garantía, envíos y contacto, y recuerda el
   modelo y el volante de la conversación para responder en contexto.
   Nunca menciona el módulo, el kit ni el proceso; nunca dice que se
   compran los airbags; nunca inventa garantía, precios, horarios ni
   teléfonos. */
(function () {
  'use strict';

  /* ---------- Hero: video o foto, sonido ---------- */
  var video = document.querySelector('[data-hero-video]');
  var soundBtn = document.querySelector('[data-hero-sound]');
  if (video) {
    var showPhoto = function () { video.setAttribute('data-missing', ''); if (soundBtn) soundBtn.hidden = true; };
    video.addEventListener('error', showPhoto, true);
    var src = video.querySelector('source');
    if (src) src.addEventListener('error', showPhoto);
    video.addEventListener('loadeddata', function () {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        video.removeAttribute('data-missing');
        if (soundBtn) soundBtn.hidden = false;
      } else { showPhoto(); }
    });
    // Si a los 4 s no hay video, queda la foto.
    setTimeout(function () {
      if (video.readyState < 2 || video.videoWidth === 0) showPhoto();
    }, 4000);
  }
  if (soundBtn && video) {
    soundBtn.addEventListener('click', function () {
      video.muted = !video.muted;
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
      soundBtn.textContent = video.muted ? 'Sonido: apagado' : 'Sonido: encendido';
      if (!video.muted) video.volume = 0.7;
    });
  }

  /* ---------- Chat ---------- */
  var openBtn = document.querySelector('[data-chat-open]');
  var panel = document.querySelector('[data-chat-panel]');
  var closeBtn = document.querySelector('[data-chat-close]');
  var log = document.querySelector('[data-chat-log]');
  var form = document.querySelector('[data-chat-form]');
  var input = document.querySelector('[data-chat-input]');
  if (!panel || !log || !form || !input) return;

  var greeted = false;
  function addMsg(text, who) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + who;
    div.innerHTML = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }
  function openChat() {
    panel.hidden = false;
    if (!greeted) {
      greeted = true;
      addMsg('Hola, soy el asistente de IMPARE. Pregúntame por los cinco volantes, por tu modelo de BMW, o por ATELIER.', 'bot');
    }
    input.focus();
  }
  if (openBtn) openBtn.addEventListener('click', openChat);
  if (closeBtn) closeBtn.addEventListener('click', function () { panel.hidden = true; });

  /* ---------- Conocimiento ---------- */
  var WHEELS = [
    { key: 'sport', name: 'M Sport', price: '$13,500', desc: 'El de todos los días, con carácter M. Piel, brazos plateados, sin M1/M2.', re: /sport|msport|m sport/ },
    { key: 'performance', name: 'M Performance · Alcántara', price: '$21,500', desc: 'Alcántara con franja roja en las 12. Sin M1/M2. El tacto M.', re: /performance|alcantara/ },
    { key: 'competition', name: 'M Competition · Piel', price: '$23,500', desc: 'El del M3 y M4. Piel, brazos plateados, M1 y M2 rojos.', re: /competition/ },
    { key: 'lci', name: 'M LCI · Base plana', price: '$25,500', desc: 'El nuevo, de base plana. Alcántara, M1 y M2. Detalles en carbono.', re: /lci|base plana|plana/ },
    { key: 'cs', name: 'M CS · Alcántara y carbono', price: '$31,500', desc: 'El tope. Alcántara, carbono, M1 y M2.', re: /\bcs\b|cs\/csl|\bcsl\b/ }
  ];
  var PRICE_LIST = 'M Sport $13,500 · M Performance Alcántara $21,500 · M Competition $23,500 · M LCI $25,500 · M CS $31,500 MXN. Todos son precios de referencia y están por confirmar.';
  var ATELIER_LINK = '<a href="atelier.html">ATELIER</a>';
  var FINDER_LINK = '<a href="finder.html">¿Le queda a mi BMW?</a>';
  var COLLECTION_LINK = '<a href="collection.html">Collection</a>';

  /* Modelos: serie, con código de modelo o chasis cuando el cliente lo dice. */
  var MODELS = [
    { re: /\b120i\b|\b118i\b|\b116i\b|\bm140i\b|serie 1\b|f20|f21|f40/, serie: 'Serie 1' },
    { re: /\b220i\b|\b228i\b|\b230i\b|\bm2\b|\bm240i\b|serie 2\b|f22|f23|f44|g42/, serie: 'Serie 2' },
    { re: /\b320i\b|\b330i\b|\b340i\b|\bm3\b|serie 3\b|f30|f31|f34|g20|g21/, serie: 'Serie 3' },
    { re: /\b420i\b|\b430i\b|\b440i\b|\bm4\b|serie 4\b|f32|f33|f36|g22|g23|g26/, serie: 'Serie 4' },
    { re: /\b520i\b|\b530i\b|\b540i\b|\bm5\b|serie 5\b|f10|f11|g30|g31/, serie: 'Serie 5' },
    { re: /\b640i\b|\b650i\b|serie 6\b|f06|f12|f13|g32/, serie: 'Serie 6' },
    { re: /\b740i\b|\b750i\b|serie 7\b|g11|g12/, serie: 'Serie 7' },
    { re: /\b840i\b|\bm8\b|serie 8\b|g14|g15|g16/, serie: 'Serie 8' },
    { re: /\bx1\b|f48|u11/, serie: 'X1' },
    { re: /\bx2\b|f39|u10/, serie: 'X2' },
    { re: /\bx3\b|f25|g01/, serie: 'X3' },
    { re: /\bx4\b|f26|g02/, serie: 'X4' },
    { re: /\bx5\b|f15|g05/, serie: 'X5' },
    { re: /\bx6\b|f16|g06/, serie: 'X6' },
    { re: /\bx7\b|g07/, serie: 'X7' },
    { re: /\bz4\b|g29/, serie: 'Z4' },
    { re: /\bi4\b/, serie: 'i4' }
  ];
  /* Año en que cada serie pasó a generación G (aproximado; siempre se
     verifica en persona, nunca se promete por aquí). */
  var G_SINCE = { 'Serie 1': 2020, 'Serie 2': 2022, 'Serie 3': 2019, 'Serie 4': 2021, 'Serie 5': 2017, 'Serie 6': 2018, 'Serie 7': 2016, 'Serie 8': 2019, 'X1': 2023, 'X2': 2024, 'X3': 2018, 'X4': 2019, 'X5': 2019, 'X6': 2020, 'X7': 2019, 'Z4': 2019, 'i4': 2022 };
  var OTHER_BRANDS = /nissan|audi|mercedes|benz|volkswagen|\bvw\b|seat|toyota|honda|ford|kia|hyundai|porsche|tesla|chevrolet|mazda|subaru|lexus|jaguar|land rover|range rover/;

  /* Memoria de la conversación: modelo y volante mencionados. */
  var state = { model: null, wheel: null, lastType: '', lastText: '', fallbackIdx: 0 };

  function norm(q) {
    return String(q || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[?¿!¡.,;:()"]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function findWheel(s) {
    for (var i = 0; i < WHEELS.length; i++) {
      if (WHEELS[i].re.test(s)) return WHEELS[i];
    }
    return null;
  }
  function modelCode(s) {
    var m = s.match(/\b[1-8][234]0i\b|\bm[234578]\b|\bx[1-7]\b|\bz4\b|\bi4\b|\bm140i\b/);
    if (!m) return '';
    var c = m[0].toUpperCase();
    if (c === 'I4') return 'i4';
    return c.replace(/I$/, 'i');
  }
  function findModel(s) {
    var chassis = s.match(/\b[fg]\d{2}\b/);
    var gen = chassis ? chassis[0][0].toUpperCase() : null;
    for (var i = 0; i < MODELS.length; i++) {
      if (MODELS[i].re.test(s)) {
        var serie = MODELS[i].serie;
        var code = modelCode(s);
        if (!gen) {
          var y = s.match(/\b(19|20)\d{2}\b/);
          if (y) {
            var year = parseInt(y[0], 10);
            var cut = G_SINCE[serie] || 2019;
            gen = year >= cut ? 'G' : 'F';
          }
        }
        return { serie: serie, gen: gen, label: code ? serie + ' ' + code : serie };
      }
    }
    return null;
  }
  function wheelLink(w) {
    return '<a href="volante-m-' + (w.key === 'performance' ? 'performance' : w.key) + '.html">Verlo de cerca</a>';
  }
  function wheelText(w) {
    return '<strong>' + w.name + '.</strong> ' + w.desc + ' Precio de referencia: ' + w.price + ' MXN, por confirmar. Todos son OEM, originales de agencia. ' + wheelLink(w);
  }
  function fitmentText(model, wheel) {
    if (!model) return null;
    var base;
    if (model.gen === 'F') base = 'Tu ' + model.label + ' es Serie F: estos volantes de generación G se le pueden montar. La compatibilidad se verifica por vehículo, en persona.';
    else if (model.gen === 'G') base = 'Tu ' + model.label + ' es Serie G: es directo y rápido. La compatibilidad se verifica por vehículo, en persona.';
    else base = 'Tu ' + model.label + ': dime el año y te digo si es Serie F o Serie G. En Serie F estos volantes G se le pueden montar; en Serie G es directo y rápido. Todo se verifica por vehículo, en persona.';
    if (wheel) base = 'El <strong>' + wheel.name + '</strong> le queda en principio a tu ' + model.label + '. ' + base;
    return base + ' Revisa tu modelo aquí: ' + FINDER_LINK;
  }

  var FALLBACKS = [
    'Te puedo ayudar con los cinco volantes, con saber si le quedan a tu BMW, o con ATELIER. ¿Qué BMW tienes? Dime tu serie y tu año.',
    'No te entendí del todo, pero te ayudo: dime tu serie y tu año y te digo cuáles volantes le quedan. También puedes revisar tu modelo aquí: ' + FINDER_LINK,
    'Puedo contarte de cada volante, sus precios de referencia y si le queda a tu BMW. ¿Por cuál empezamos? Están en ' + COLLECTION_LINK + '.'
  ];

  function answer(q) {
    var s = norm(q);
    if (!s) return 'Dime tu serie y tu año, o pregunta por un volante. ¿Qué BMW tienes?';
    var wheel = findWheel(s);
    var model = findModel(s);
    if (model) state.model = model;
    if (wheel) state.wheel = wheel;
    var m = state.model, w = state.wheel;
    var out = '', type = '';

    /* MINI: no hay volantes para MINI en Collection. */
    if (/\bmini\b|cooper|countryman/.test(s)) {
      out = 'Por ahora Collection no tiene volantes para MINI. Hoy trabajamos BMW, Serie F y Serie G. Si tienes un BMW, dime cuál es.'; type = 'mini';
    }
    /* Otras marcas: hoy solo BMW. */
    else if (OTHER_BRANDS.test(s) && !model) {
      out = 'Hoy trabajamos BMW. Para otras marcas premium, cuéntanos tu idea en ' + ATELIER_LINK + ' y lo revisamos contigo.'; type = 'brand';
    }
    /* Garantía y reversibilidad: no hay texto aprobado, no se promete nada. */
    else if (/garantia|reversible|reversibilidad|se puede quitar|volver.*original|regresar.*original|vuelve.*original/.test(s)) {
      out = 'La garantía y la reversibilidad se revisan por vehículo, en persona. No te prometo nada por aquí sin ver tu auto: cuéntanos en ' + ATELIER_LINK + '.'; type = 'warranty';
    }
    /* Airbag: se presentan completos, como originales. Nunca se dice que se compran. */
    else if (/airbag|bolsa de aire/.test(s)) {
      out = 'Los volantes se presentan completos, con su airbag, como originales de agencia. Si quieres verlos, están en ' + COLLECTION_LINK + '.'; type = 'airbag';
    }
    /* Precio: del volante mencionado, del que venía en la conversación, o la lista. */
    else if (/precio|cuesta|cuanto vale|cuanto cuesta|mas barato|menos caro|mas caro|el tope|presio|cuanto sale|vale/.test(s) || (/\bcuanto\b/.test(s) && !/tarda|tiempo|dura|se tarda/.test(s))) {
      if (/mas barato|menos caro/.test(s)) {
        if (wheel) out = 'De los de su tipo, el <strong>' + wheel.name + '</strong> es el de menor precio: ' + wheel.price + ' MXN, de referencia, por confirmar. ' + wheelLink(wheel);
        else out = 'El de menor precio es el <strong>M Sport</strong>, $13,500 MXN de referencia, por confirmar. ' + wheelLink(WHEELS[0]);
      } else if (/mas caro|el tope/.test(s)) {
        out = 'El de mayor precio es el <strong>M CS</strong>, $31,500 MXN de referencia, por confirmar. Cada uno tiene lo suyo: están en ' + COLLECTION_LINK + '.';
      } else if (wheel) {
        out = 'El <strong>' + wheel.name + '</strong> cuesta ' + wheel.price + ' MXN, precio de referencia, por confirmar.';
        if (model) out += ' ' + fitmentText(model, null);
        out += ' Para el precio exacto de tu auto, escríbenos en ' + ATELIER_LINK + '.';
      } else if (m) {
        out = 'Los precios son por volante, no por auto: ' + PRICE_LIST + ' Para tu ' + m.label + ', los cinco aplican en principio; se verifica en persona. Revisa tu modelo aquí: ' + FINDER_LINK;
      } else {
        out = 'Los precios en la página son de referencia y están por confirmar: ' + PRICE_LIST + ' Para el precio de tu auto, escríbenos en ' + ATELIER_LINK + '.';
      }
      type = 'price';
    }
    /* Comparación y recomendación: la escalera, sin inventar un favorito. */
    else if (/diferencia|compar|recomiendas|recomienda|me conviene|cual es mejor|cual es el mejor|que volante me|ayudame a elegir|no se cual|cual me compro|cual escojo/.test(s)) {
      out = 'Los cinco son OEM, originales de agencia. La escalera es así: <strong>M Sport</strong> ($13,500), el de todos los días, piel; <strong>M Performance Alcántara</strong> ($21,500), Alcántara con franja roja; <strong>M Competition</strong> ($23,500), piel con M1 y M2; <strong>M LCI</strong> ($25,500), el nuevo de base plana; <strong>M CS</strong> ($31,500), Alcántara y carbono, el tope. Cada uno tiene lo suyo: depende de tu auto y de tu gusto.';
      if (m) out += ' Para tu ' + m.label + ', los cinco aplican en principio; se verifica en persona.';
      out += ' Están todos en ' + COLLECTION_LINK + '.';
      type = 'compare';
    }
    /* M1 y M2 juntos: la pregunta es por los botones, no por el auto M2. */
    else if (/\bm1\b.*\bm2\b|\bm2\b.*\bm1\b|botones rojos|botones m1|botones m2/.test(s)) {
      out = 'M1 y M2 son los botones rojos de los volantes M. En un auto M funcionan como modos de manejo; en un auto que no es M quedan como parte del diseño, no prometemos que activen modos M.';
      type = 'm1m2';
    }
    /* Qué es un volante / qué cambia: antes que compatibilidad, porque
       "qué es un volante" contiene "es un". */
    else if (/que es un volante|que cambia|para que sirve|que es el volante/.test(s)) {
      out = 'El volante es lo que tocas siempre al manejar: cambia el tacto, el diseño y cómo se siente tu BMW. Estos cinco son originales de agencia, de generación G, para Serie F y Serie G.';
      type = 'whatwheel';
    }
    /* Compatibilidad: volante + modelo, o solo modelo, o solo la pregunta. */
    else if (/le queda|queda|compatib|aplica|le entra|entra en|para mi|se puede|se le puede|tengo un|tengo una|es un|es una|mi bmw|mi serie|mi auto|mi carro|mi coche|serie [fg]\b/.test(s) || model || (wheel && m)) {
      if (model || m) out = fitmentText(model || m, wheel);
      else if (wheel) out = 'El <strong>' + wheel.name + '</strong> es para Serie F y Serie G. Dime tu serie y tu año y te digo si le queda a tu BMW. Revisa tu modelo aquí: ' + FINDER_LINK;
      else out = 'Si tienes un Serie F, estos volantes de generación G se le pueden montar. Si tienes un Serie G, es directo y rápido. La compatibilidad se verifica por vehículo, en persona. Revisa tu modelo aquí: ' + FINDER_LINK;
      type = 'fitment';
    }
    /* Instalación: en persona, sin explicar el proceso. */
    else if (/instal|montar|montaje|cuanto tarda|cuanto tiempo|que incluye|incluye|cuanto se tarda|lo instalan|me lo ponen/.test(s)) {
      out = 'Se monta en persona y se verifica tu auto antes. El tiempo y lo que incluye se revisa contigo en ' + ATELIER_LINK + ', en persona, en San Pedro.'; type = 'install';
    }
    /* Calefacción: por volante, con lo que se sabe de cada uno. */
    else if (/calefac|calienta|calent/.test(s)) {
      if (wheel && wheel.key === 'performance') out = 'El <strong>M Performance Alcántara</strong>: con este volante la calefacción deja de funcionar. Es un volante para quien no usa la calefacción del volante.';
      else if (wheel && wheel.key === 'lci') out = 'El <strong>M LCI</strong> no trae botón físico de calefacción: se maneja por voz o desde la pantalla.';
      else if (wheel) out = 'El <strong>' + wheel.name + '</strong>: la calefacción depende de tu auto y del volante; se verifica por vehículo, en persona.';
      else out = 'La calefacción depende del volante y de tu auto. El M Performance Alcántara pierde la calefacción; el M LCI se maneja por voz o desde la pantalla. Lo demás se verifica por vehículo, en persona.';
      type = 'heating';
    }
    /* Driving Assistant Professional. */
    else if (/driving|asistent|5au/.test(s)) {
      out = 'El <strong>M Performance Alcántara</strong> no es compatible con Driving Assistant Professional. Los demás se verifican por vehículo, en persona.';
      type = 'da';
    }
    /* M1 y M2: honestidad siempre. */
    else if (/\bm1\b|\bm2\b|botones rojos/.test(s)) {
      out = 'M1 y M2 son los botones rojos de los volantes M. En un auto M funcionan como modos de manejo; en un auto que no es M quedan como parte del diseño, no prometemos que activen modos M.';
      type = 'm1m2';
    }
    /* Carbono y fibra. */
    else if (/carbon|fibra/.test(s)) {
      out = 'Tenemos volantes con detalles de carbono: el M LCI y el M CS. El carbono es original de BMW en estos volantes.';
      type = 'carbon';
    }
    /* Paletas. */
    else if (/paleta|paddle/.test(s)) {
      out = 'Los cinco volantes traen paletas de cambio detrás del volante.';
      type = 'paddles';
    }
    /* Materiales sueltos (sin volante mencionado). */
    else if (/piel|cuero/.test(s)) {
      out = 'De piel son el <strong>M Sport</strong> y el <strong>M Competition</strong>. De Alcántara, el M Performance, el M LCI y el M CS. Están en ' + COLLECTION_LINK + '.';
      type = 'material';
    }
    /* Un volante en concreto. */
    else if (wheel) {
      out = wheelText(wheel);
      if (m) out += ' A tu ' + m.label + ' le queda en principio; se verifica en persona.';
      type = 'wheel';
    }
    /* Qué es IMPARE / quiénes son: sin nombres de fundadores. */
    else if (/que es impare|quienes son|que hacen|de que va|que es esto|quien eres|quien es impare|edgard|mauricio|fundador|dueno|socio/.test(s)) {
      out = 'IMPARE nace en Monterrey. Hacemos personalización premium: volantes OEM de BMW, originales de agencia, de generación G para Serie F y Serie G. La idea es que cada auto se sienta hecho a tu medida.';
      type = 'about';
    }
    /* Contacto: no hay número confirmado; todo por ATELIER. */
    else if (/whatsapp|telefono|numero|contacto|llamar|celular|telegram/.test(s)) {
      out = 'Por aquí te atiendo yo. Para agendar o hablar de tu proyecto, déjanos tus datos en ' + ATELIER_LINK + ' y lo revisamos contigo en persona, en San Pedro.';
      type = 'contact';
    }
    /* Horarios y lugar. */
    else if (/horario|abren|cierran|cuando abren|a que hora|donde estan|donde queda|ubicacion|direccion|local|tienda|sucursal|showroom/.test(s)) {
      out = 'Estamos en Monterrey. Las citas de ATELIER se revisan en persona, en San Pedro. Cuéntanos tu idea en ' + ATELIER_LINK + ' y te decimos.';
      type = 'place';
    }
    /* Pago. */
    else if (/pagar|tarjeta|meses|credito|msi|efectivo|transferencia|como pago/.test(s)) {
      out = 'Por ahora no se vende en línea ni se cobra por aquí. Los precios son de referencia y están por confirmar; el pago se concreta en persona, en ' + ATELIER_LINK + '.';
      type = 'pay';
    }
    /* Envíos. */
    else if (/envio|enviar|paqueteria|mandan|llega a|a domicilio/.test(s)) {
      out = 'Por ahora no enviamos: todo se concreta en persona, en Monterrey. Cuéntanos tu proyecto en ' + ATELIER_LINK + '.';
      type = 'ship';
    }
    /* Saludos, gracias, despedidas, asentimientos. */
    else if (/hola|buenas|que tal|buenos dias|buenas tardes|buenas noches|hey|saludos/.test(s)) {
      out = 'Hola. ¿Qué BMW tienes? Dime tu serie y tu año y te digo cuáles volantes le quedan.';
      type = 'hello';
    }
    else if (/gracias/.test(s)) {
      out = 'A la orden. Si quieres verlos, están en ' + COLLECTION_LINK + '.';
      type = 'thanks';
    }
    else if (/adios|hasta luego|nos vemos|chao|bye/.test(s)) {
      out = 'Nos vemos. Si te decides por un volante, está ' + ATELIER_LINK + '.';
      type = 'bye';
    }
    else if (/^(ok|va|vale|perfecto|si|sí|orale|sale|entendido|ya|claro)$/.test(s)) {
      if (m) out = 'Perfecto. Para tu ' + m.label + ', los cinco aplican en principio; se verifica en persona. ¿Quieres que lo revisemos en ' + ATELIER_LINK + '?';
      else if (w) out = 'Perfecto. El <strong>' + w.name + '</strong> está en ' + COLLECTION_LINK + '. ¿Quieres que lo revisemos en ' + ATELIER_LINK + '?';
      else out = 'Perfecto. ¿Qué BMW tienes? Dime tu serie y tu año.';
      type = 'ack';
    }
    /* Palabras sueltas con faltas comunes. */
    else if (/bolante|volante/.test(s)) {
      out = 'Los cinco volantes están en ' + COLLECTION_LINK + ': M Sport, M Performance Alcántara, M Competition, M LCI y M CS. ¿Cuál quieres ver, o dime tu serie y tu año y te digo cuáles le quedan?';
      type = 'wheels';
    }
    /* Inglés básico. */
    else if (/how much|price|cost/.test(s)) {
      out = 'Los precios son de referencia y están por confirmar: ' + PRICE_LIST;
      type = 'price';
    }
    else if (/does it fit|will it fit|fit my|my bmw/.test(s)) {
      out = 'Si tienes un Serie F, estos volantes de generación G se le pueden montar. Si tienes un Serie G, es directo y rápido. La compatibilidad se verifica por vehículo, en persona. Revisa tu modelo aquí: ' + FINDER_LINK;
      type = 'fitment';
    }
    else if (/where|location/.test(s)) {
      out = 'Estamos en Monterrey. Las citas de ATELIER se revisan en persona, en San Pedro.';
      type = 'place';
    }
    /* Fallback guiado, que rota para no repetir el mismo saludo en bucle. */
    else {
      if (state.lastType === 'fallback') {
        state.fallbackIdx = (state.fallbackIdx + 1) % FALLBACKS.length;
      }
      out = FALLBACKS[state.fallbackIdx];
      type = 'fallback';
    }

    /* Nunca dos respuestas idénticas seguidas. */
    if (out === state.lastText) {
      out += ' Dime tu serie y tu año y lo revisamos.';
    }
    state.lastType = type;
    state.lastText = out;
    return out;
  }

  function resetState() {
    state.model = null;
    state.wheel = null;
    state.lastType = '';
    state.lastText = '';
    state.fallbackIdx = 0;
  }

  /* Expuesto solo para pruebas (qa-chat-v30.js); no se usa en la página. */
  if (typeof window !== 'undefined') {
    window.IMPARE_CHAT = { answer: answer, reset: resetState };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    var safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    addMsg(safe, 'user');
    input.value = '';
    setTimeout(function () { addMsg(answer(text), 'bot'); }, 350);
  });
})();
