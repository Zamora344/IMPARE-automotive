# IMPARE Automotive — v1.5 Changelog

**Base:** v1.4 (ChatGPT Sites ZIP, unmodified source in `~/workspace/impare/v1.4/`).
**Build:** complete redesign on top of v1.4, not from scratch. Taste owner: taste-skill;
support: frontend-design, impeccable-design, web-design-guidelines, web-quality,
liquid-glass. **Not pushed to GitHub, not published, nothing bought.**

## v2.1.1 — Doble toque en iOS Safari (2026-11-12)

Mauricio probó el sitio en vivo en su iPhone: funciona super bien en general, PERO a veces un toque no hace nada y hay que tocar otra vez — enlaces y botones pedían doble toque en lugar de uno, de forma intermitente, en todo el sitio.

### Causa raíz (confirmada en el código)
- **Las 31 reglas `:hover` sin proteger de `styles.css`.** En iOS Safari el primer toque aplica el estado hover y solo el segundo dispara el clic: es el comportamiento clásico del navegador cuando un elemento tiene hover. Las reglas estaban en todo el sitio (navegación, botones, tarjetas de producto/proyecto/relacionadas, buscador, slider, lightbox, CTA fijo, menú, compartir, carrito), así que el doble toque aparecía en cualquier parte, según qué elemento se tocara. `media.css` (máx. 900 px) solo neutralizaba las transformaciones del hover, no los cambios de color y borde, así que el estado hover se quedaba pegado en táctil.
- **Descartado, verificado:** el fundido de salida de v2.0 en `app.js` (clic en enlace interno → `preventDefault` → `body.leaving` → navegar a los 180 ms) retrasa la navegación pero no se traga el toque; se queda, con un resguardo nuevo (abajo). El reveal al hacer scroll (`.reveal`, opacidad 0 hasta `.in`) no desactiva eventos de puntero, así que tampoco bloquea toques. El enrutado en memoria solo corre en la vista previa (origen `null`), no en el sitio en vivo.

### Qué cambió
- **Todas las reglas hover, dentro de `@media (hover: hover) and (pointer: fine)`** — un solo bloque al final de `styles.css` con las 31 reglas, en el mismo orden y con las mismas declaraciones. En dispositivos táctiles (sin hover real) esas reglas ya no existen: el primer toque es el clic. En escritorio el hover sigue exactamente igual (elevaciones, zoom de foto, cambios de color y borde). Las tres reglas que compartían selector con algo que no es hover se partieron y lo otro se quedó fuera del bloque: `a[aria-current="page"]` en navegación y Collection, y `.ba-handle:focus-visible .ba-handle-knob`.
- **Respuesta al toque con `:active`** (botones, tarjetas, buscador, compartir, CTA fijo, volver arriba, menú, galería, carrito): el toque se siente vivo aunque ya no haya hover en el teléfono. El `:active` del botón principal ahora es `translateY(0) scale(.985)` (antes solo `translateY(0)`).
- **`touch-action: manipulation` en `a` y `button`**: quita cualquier resto de retardo por doble toque para zoom.
- **Resguardo en el fundido de `app.js`**: si el cuerpo ya está saliendo (`body.leaving`), un segundo toque rápido no reinicia el temporizador de 180 ms; la navegación del primer toque sigue su curso.
- **Neutralizaciones de hover en `media.css`: se quedan.** Las 8 líneas (10 ocurrencias) viven todas dentro de `prefers-reduced-motion`, donde siguen haciendo falta para usuarios de escritorio con movimiento reducido. No se tocó nada más de `media.css`.
- **Cerrados que no tapan nada (verificado):** el menú móvil se crea con `hidden` y `[hidden]{display:none!important}`; el lightbox igual; el botón de volver arriba es `visibility:hidden` hasta `.show`; el progreso de lectura tiene `pointer-events:none`. El CTA fijo no tapa el pie en móvil (el pie ya dejaba 116 px abajo).
- **Sin tocar:** animaciones que le gustan a Mauricio (reveal al hacer scroll, fundido de página, elevaciones en escritorio), `robots.txt`, `noindex`, OG/404/favicon, carrito demo, precios y textos. Cero fotos nuevas.

### QA (por script, `qa-v211.js`)
- **73/73 checks**: corre toda la suite de v2.1 y luego 30+ de v2.1.1: cero `:hover` fuera del bloque de hover (34 ocurrencias dentro, 31 reglas), las 31 reglas presentes con sus efectos de escritorio intactos, `aria-current` y `:focus-visible` intactos fuera del bloque, `:active` y `touch-action` presentes, resguardo de `leaving` en `app.js`, `media.css` sin hover fuera de `prefers-reduced-motion`, overlays cerrados sin bloquear toques, animaciones intactas, `node --check` en `app.js`.
- **Sin verificar con toques reales en este entorno**: no hay navegador en vivo aquí, así que la comprobación de "cada enlace/botón actúa al primer toque a 390 px" no se pudo hacer con toques reales. La verificación es estática (el estado hover ya no existe en táctil por construcción del CSS) más el QA por script. **Mauricio debe re-probar en su iPhone**: Inicio, Collection, una ficha, un proyecto, el buscador, el slider antes/después, el menú y el carrito — un solo toque por elemento.

## v2.1 — Otra ronda (2026-11-12)

Mauricio: "Haz otra implementación de mejoras, te lo dejo a tu criterio... con QA y UX y que funcione tanto como en celular como en computadora". Cinco mejoras nuevas (nada repetido de v2.0): compartir, también te puede interesar, menú móvil a pantalla completa, pase de accesibilidad y teclado, y carrito/checkout más claro. **El ítem 5 (indexación + sitemap + analítica) NO se tocó**, como siempre: `robots.txt` sigue en `Disallow: /`, todas las páginas siguen en `noindex,nofollow`, no hay `sitemap.xml` ni scripts de medición.

### Qué cambió
- **1. Compartir**: botón "Compartir" en las dos fichas, los tres proyectos y la nota. Usa la API nativa de compartir del teléfono o del navegador y, si no está disponible, copia el enlace y avisa "Enlace copiado." El texto es honesto: nombre, origen y precio de referencia, sin afirmaciones inventadas. En el buscador, el resultado ahora se puede copiar como enlace (`finder.html?serie=&gen=&ano=`): al abrir ese enlace, el buscador muestra el resultado directamente, y al ver un resultado la URL se actualiza sola para poder compartirla.
- **2. También te puede interesar**: al final de cada ficha, proyecto, nota y del buscador, tres tarjetas con un paso siguiente claro (volante ↔ consola ↔ retrofit X6 ↔ G20 ↔ nota ↔ finder ↔ ATELIER). Nada de catálogo infinito: tres opciones, una idea por tarjeta.
- **3. Menú móvil a pantalla completa**: el menú chico de antes ahora abre una pantalla completa en Obsidiana, con los enlaces grandes en Didone y una línea tranquila ("Citas privadas · San Pedro"). Se construye por JS desde los enlaces del menú original, que queda como respaldo si no hay JS. Al abrirse, el foco va al primer enlace; Escape o tocar un enlace lo cierra y devuelve el foco al botón. El enrutado en memoria de la vista previa no se toca (los enlaces son `<a>` normales).
- **4. Accesibilidad y teclado**: el enlace "Saltar al contenido" ahora mueve el foco de verdad (todas las páginas llevan `tabindex="-1"` en `<main>`); el lightbox tiene trampa de foco (Tab no se escapa de él mientras está abierto); el foco visible también se ve sobre las secciones en Marfil (antes el Titanio se perdía en el fondo claro); la miniatura activa de la galería se anuncia con `aria-current`.
- **5. Carrito y checkout**: al cambiar una cantidad con el teclado, el foco ya no se pierde (antes el botón se destruía al redibujar la línea); el botón "+" se deshabilita al llegar al máximo de 2 por pieza, con su aviso; el estado vacío ya no dice solo "vacío": muestra las dos piezas con sus precios de referencia y el enlace a cada una; en el paso 3 del checkout hay un recordatorio de demostración junto al botón de confirmar; en escritorio, el resumen del carrito queda fijo al hacer scroll.

### QA (por script, `qa-v21.js`)
- **104/104 checks**: primero corre toda la suite de v2.0 (que incluye v1.9) y luego 40+ de v2.1: `node --check` en los 3 JS; skip-link + `tabindex` en las 20 páginas; todas las imágenes con `width` y `height`; botones de compartir con sus datos honestos; deep-link del buscador; 3 tarjetas relacionadas por página; menú overlay (construcción, Escape, foco, respaldo sin JS); trampa de foco del lightbox; foco en cantidades; vacío útil; demo en paso 3; resumen fijo; sin peticiones externas nuevas; `noindex` intacto; cero cadenas prohibidas.
- **Sin verificar en navegador real**: no hay navegador headless en este entorno, así que el menú a pantalla completa en un teléfono real, el compartir nativo (Web Share API) y el flujo completo del carrito con teclado quedan para verificación en la vista previa y en el teléfono de Mauricio.

## v2.0 — "A tu imaginación" (2026-11-12)

Mauricio: "mete mas mejoras, te lo dejo a tu imaginacion". Seis mejoras elegidas por valer de verdad, no por decorar: transiciones de página, lightbox, progreso de lectura + volver arriba, comparador de las dos piezas, preguntas frecuentes y formulario ATELIER más claro. **El ítem 5 (indexación + sitemap + analítica) NO se tocó**, como en v1.9: `robots.txt` sigue en `Disallow: /`, todas las páginas siguen en `noindex,nofollow`, no hay `sitemap.xml` ni scripts de medición.

### Qué cambió
- **1. Transiciones de página**: la página entra con un fundido suave (0.5 s) y, al hacer clic en un enlace interno, sale con un fundido corto (0.18 s) antes de navegar. Sin `prefers-reduced-motion` no hay transición. En la vista previa (origen opaco) NO se intercepta la navegación: su enrutado en memoria ya la resuelve, así que el fundido se hace al renderizar la ruta, no al hacer clic — la corrección de enrutado de v1.6.1 no se toca.
- **2. Lightbox**: tocar la foto principal de una ficha (volante, consola) o una foto grande de proyecto/nota la abre en grande, con su pie (el alt de la foto), flechas para pasar a la siguiente, Escape para cerrar y el foco de vuelta a donde estaba. La foto nunca se muestra más ancha que su tamaño nativo (tope en JS con `naturalWidth`, lección de v1.9.1). En las fichas, el set es el de las miniaturas; en proyectos, las fotos grandes de la página. El slider antes/después no abre lightbox (ya es interactivo).
- **3. Progreso de lectura + volver arriba**: una línea fina de Titanio (2 px) bajo la navegación marca cuánto se ha leído de la página, y un botón redondo "↑" abajo a la izquierda aparece después de bajar 600 px. En móvil queda arriba del CTA fijo, sin taparlo. Ambos elementos los crea `app.js`, sin tocar las 20 páginas.
- **4. Comparador en Collection**: "Las dos piezas, lado a lado" — material, origen, para qué auto y precio de referencia, con los datos que ya están en las fichas (volante: Alcántara/carbono, OEM genuino, retrofit G→F por estudiar, $21,500; consola: fibra de carbono, OEM Take-Off, G20/G22 por confirmar, $9,900). Nada inventado; en móvil se apila y cada celda lleva su etiqueta.
- **5. Preguntas frecuentes**: 6 en Collection y 4 en ATELIER, con `<details>` nativo (sin JS, accesible). Respuestas solo con texto ya aprobado en el sitio o en Términos: cómo saber si una pieza es para tu BMW, cuánto cuesta (referencia, por confirmar), cómo se paga (carrito demo, ATELIER sin precio fijo), dónde se revisa (San Pedro, en persona), cuánto tarda (se define en la revisión) y los botones M1/M2 (según vehículo, sin promesa por defecto). No se responde nada sobre garantía o reversibilidad: no hay texto aprobado que lo diga.
- **6. Formulario ATELIER más claro**: (a) nota visible cuando se llega con una pieza o un modelo prellenado ("Tu consulta es sobre: Volante M Alcántara LCI" / "Tu BMW: BMW Serie 3 · generación G · año 2021"); (b) errores en línea bajo cada campo en lugar del globo del navegador, con `aria-invalid` y `aria-describedby`; (c) confirmación más calmada: "Gracias, ya la tenemos." con tres pasos (se lee, se revisa en persona en San Pedro, te respondemos para agendar), el botón cambia a "Idea enviada" y los campos se desactivan. Sigue siendo demo: no se envía ni se guarda nada.

### QA (por script, `qa-v20.js`)
- **247/247 checks**: todo lo de v1.9 (229) más 18 de v2.0: CSS y JS de las seis mejoras, comparador (2 piezas, 4 filas), FAQ (6 + 4), prefill y confirmación, lightbox en fichas y proyectos, reglas de `prefers-reduced-motion` y apilado móvil del comparador, `node --check` en los 3 JS, 0 enlaces rotos, OG/Twitter/favicon intactos, `noindex` intacto, cero cadenas prohibidas.
- **Sin verificar en vivo**: no hay navegador en este entorno, así que el fundido al navegar, el arrastre del lightbox en móvil real, el botón de volver arriba y el envío del formulario quedan para verificación en navegador real (padre).

## v1.9.1 — Foto de "Cómo trabajamos" sin pixelar (2026-11-12)

Mauricio: "en la página se ve muy pixeleada en esa sección de cómo trabajamos". Causa: la figura de `como-trabajamos.html` usaba `wheel-cabin.webp`, una foto real de solo 960 × 617 px, pero se mostraba a lo ancho de todo el `.shell` (hasta ~1320 px CSS en escritorio, 100vw en móvil), y el `sizes` decía `60vw`, así que en un teléfono de alta densidad el navegador servía la variante de 640w y la estiraba. La foto no era mala: se estaba mostrando más grande que su resolución nativa.

### Qué cambió
- **Figura acotada**: `.page-como-trabajamos .atelier-photo` ahora tiene `max-width:720px` y está centrada (`margin:0 auto 64px`). La foto ya nunca se muestra más ancha que su resolución nativa. Regla con alcance solo a esa figura: el resto de las páginas no cambia (la otra `.atelier-photo`, en ATELIER, usa otra foto y no se tocó).
- **`srcset`/`sizes` corregidos en esa imagen**: `sizes="(max-width:900px) 100vw, 720px"` (antes `60vw`) y se quitó la variante de 192w; la mayor sigue siendo el archivo completo de 960w, así que en pantallas de alta densidad el navegador ya sirve el archivo completo.
- **Revisados los demás usos de `wheel-cabin.webp`**: en `volante.html` solo es una miniatura de 140 px y, al abrirla, la foto principal se muestra a ≤ ~560 px CSS con `object-fit:contain` y su `data-sizes` ya hace que el navegador elija el archivo de 960w — no hay pixelado ahí, sin cambios. La referencia de fondo en `styles.css` (`.split-card`) es CSS heredado sin uso en ninguna página: nunca se muestra, sin cambios.
- **Sin atajos**: no se usó la versión mejorada con IA de esa foto (la de 1920 px que se generó para Mauricio), no se inventó ninguna foto nueva, no cambió el texto ni el pie de foto. La regla de cero fotos de IA en el sitio sigue intacta.

### Límite honesto
Esto quita el pixelado por estiramiento, pero el techo nativo de la foto sigue siendo 960 px: a pantalla completa o en un monitor muy grande no se puede mostrar más grande sin perder nitidez. Una versión realmente más grande necesita una foto real nueva de Edgard/Mauricio, o una decisión explícita de los fundadores de usar la versión mejorada con IA (que ya no sería la foto real).

## v1.9 — Mejora continua (2026-11-12)

Mauricio, esperando la llamada con Edgard: "implementa una mejora que tu veas necesaria o que falte" y luego "explora todos los rubros". La lista rankeada está en `revision-v19.md`. Se construyeron los ítems 1–4 y 6–10. **El ítem 5 (indexación + sitemap + analítica) NO se tocó**: `robots.txt` sigue en `Disallow: /`, todas las páginas siguen en `noindex,nofollow`, no hay `sitemap.xml` ni scripts de medición. Quitar el `noindex` expone el nombre IMPARE (marca provisional, sin búsqueda IMPI) a Google: decisión de los fundadores, no técnica.

### Qué cambió
- **1. Slider interactivo antes/después del X6** (Inicio y `proyecto-retrofit-x6.html`): las dos fotos reales de la cabina, con arrastre en móvil y escritorio, teclado accesible (flechas, Inicio, Fin), y un guiño automático la primera vez que se ve (50% → 62% → 50% en 1.5 s) para que se entienda que se mueve. Sin JS, arranca en 50%.
- **2. CTA fijo "Hablar de mi proyecto"**: píldora fija abajo en todas las páginas, lleva a ATELIER (en ATELIER, a #cita). Oculto en carrito y checkout. En móvil ocupa el ancho; el footer deja espacio para que no tape nada.
- **3. Buscador guiado "¿Es para mi BMW?"** (`finder.html`, enlazado desde Collection, las fichas, Consulta e Inicio): 3 preguntas (Serie, generación F/G, año). Resultado por pieza: Aplica en principio / Por estudiar / No aplica, con enlace a ATELIER prellenado con el modelo. Reglas: volante G→F en generación F = por estudiar caso por caso; en G = aplica en principio. Consola = era G20/G22 (Serie 3 G20, Serie 4 G22). MINI = no aplica. Sin generación = por estudiar. Nunca se promete compatibilidad no validada; M1/M2 nunca se prometen.
- **4. Fichas con datos duros**: volante (material, acabado, OEM genuino, números de parte 32307908499 / 32302462910, retrofit G→F) y consola (fibra de carbono, OEM Take-Off, número de parte 51168094583, aplica a G20/G22). Qué incluye la instalación y qué se verifica al final: **Por confirmar** (sin inventar).
- **6. Página "Cómo trabajamos"**: evaluación → búsqueda y verificación → instalación → comprobación final, con la foto real del volante instalado. Solo el proceso real, sin fotos de taller ajeno.
- **7. Proyectos como casos**: cada G20 y el X6 tienen su línea de historia y su bloque fijo (el auto, la idea, las piezas, el estado). Las etiquetas "Estudio conceptual" se mantienen; los G20 no se presentan como trabajo terminado.
- **8. Notas editoriales**: `notas.html` + primera nota real, la historia del retrofit G→F (conector comprado en Europa, instalación, M1/M2 por revisar), con foto real.
- **9. Footer completo** en las 20 páginas: aviso de privacidad y términos propios, y la nota que explica precios de referencia, estudio conceptual y carrito demo. Sin canal de contacto inventado.
- **10. Rendimiento**: el hero ya tenía `fetchpriority="high"`; se añadió `<link rel="preload" as="image">` con el `srcset` correcto en Inicio. No se pudo medir LCP (no hay navegador headless en este entorno) ni re-codificar el hero: el conector de GitHub solo acepta texto, así que no hay versión AVIF/JPEG nueva. El hero sigue siendo el mismo WebP de 447 KB.
- **Animación (pedido de Mauricio: "casi todo animado")**: reveal al hacer scroll en secciones, productos, proyectos, pasos y notas; hover en tarjetas (elevación + zoom suave de foto), botones, enlaces y galería; el slider y el CTA tienen su propia entrada. Todo lento y sutil, solo Titanio/Obsidiana/Marfil. Respetado `prefers-reduced-motion` (todo queda quieto y visible).

### QA (por script, `qa-v19.js`)
- **229/229 checks**: `node --check` OK en los 3 JS; un `<h1>` por página; `alt` en todas las imágenes; 0 enlaces internos rotos; 0 assets faltantes; OG/Twitter/favicon en las 20 páginas; `noindex` intacto; `robots.txt` sin tocar; cero scripts de analítica; cero cadenas prohibidas (Porsche, $250,000, Ambient Lighting, nombres de herramientas, "Edgard", "foto real", WhatsApp). Reglas del buscador probadas en 9 casos (volante/consola × serie/generación).
- **Sin verificar en vivo**: no hay navegador en este entorno, así que el arrastre del slider, el CTA fijo en móvil real, el flujo completo del buscador y el LCP quedan para verificación en navegador real (padre).

### Pendiente — decisión de los fundadores (no se tocó aquí)
- Ítem 5: indexación + sitemap + analítica (ver arriba). Proveedor de pago real, tarifas reales de envío, inventario real, política de devoluciones, guías y rastreo; fotos reales para las piezas retiradas; fotos reales de los G20; método de contacto real; dominio `impareautomotive.com` ($12.08/año); búsqueda oficial IMPI.

## v1.8.2 — Vista previa para compartir + 404 + favicon (2026-11-12)

Mauricio compartió el link en vivo en WhatsApp y salía una URL pelada, sin título, descripción ni foto. El sitio estaba público en GitHub Pages pero sin nada para que WhatsApp lo presentara.

### Qué cambió
- **Open Graph + Twitter Card en las 14 páginas** (13 + la nueva 404): `og:title`, `og:description` (la descripción de cada página, sin afirmaciones inventadas), `og:type` website, `og:locale` es_MX, `og:site_name`, `og:url` propia por página, `og:image` con la foto del BMW M4 rojo, `og:image:width/height` 1920×1280, `og:image:alt`, `twitter:card` summary_large_image con título, descripción e imagen. Verificado por grep: 10 etiquetas `og:` y 4 `twitter:` por página, sin duplicados.
- **Elección de `og:image`:** se usa `assets/hero-bmw.webp` (1920×1280, 3:2), la foto que ya está en el repo y en vivo. WhatsApp recomienda 1200×630 (1.91:1) y recorta al centro, así que la foto se verá con un leve recorte arriba y abajo; el M4 queda centrado y no se corta. No se hizo un recorte 1200×630 aparte porque es un archivo binario nuevo y el conector de GitHub solo acepta texto — quedaría pendiente subirlo por la interfaz web y cambiar `og:image` a esa versión. Tampoco hay versión JPEG de la foto (solo WebP): WhatsApp/Facebook aceptan WebP en `og:image` en la mayoría de los casos, pero si la vista previa no muestra la foto, el primer sospechoso es el formato y habría que subir un JPEG 1200×630.
- **Página 404 (`404.html`):** mismo diseño Obsidiana/Titanio/Marfil, "No encontramos esa página." y un solo botón claro "Volver a Inicio". GitHub Pages la sirve para enlaces rotos.
- **Favicon:** marca IMPARE como SVG en línea (letra "I" Didone en Titanio #B7A187 sobre Obsidiana #101215), sin archivo externo, en las 14 páginas. La pestaña y la vista previa ya no muestran el globo genérico.
- **Caché de WhatsApp:** WhatsApp guarda la vista previa de un enlace y puede tardar horas en refrescarla. El link ya se compartió una vez sin meta, así que aunque el sitio ya tenga todo, Edgard (o cualquiera) puede seguir viendo la vista previa vieja o pelada hasta que WhatsApp la vuelva a leer. No se puede forzar desde el sitio; se puede probar con un parámetro distinto (por ejemplo `?v=2` al final del link) para que WhatsApp lo lea como enlace nuevo.

### Pendiente — decisión de los fundadores (no se tocó aquí)
- **El sitio sigue con `noindex,nofollow` en las 14 páginas**, herencia de la época de "vista privada de prueba". Ahora que está público en GitHub Pages y se comparte en WhatsApp, ese `noindex` impide que Google lo indexe. Quitarlo es una decisión de Mauricio/Edgard, no se hizo en v1.8.2.
- Proveedor de pago real, tarifas reales de envío, inventario real, política de devoluciones, guías y rastreo; fotos reales para las piezas retiradas; fotos reales de los G20; método de contacto real; dominio `impareautomotive.com` ($12.08/año); búsqueda oficial IMPI.

## v1.8.1 — QA + UX final antes de compartir con Edgard (2026-11-10)

Mauricio: "si jalo bien, has un QA y UX y se lo compartimos a edgard, que quede super mamalon, de primer nivel premium". Veredicto: **LISTO PARA COMPARTIR** (la vista previa está sincronizada con la fuente; el link público todavía sirve la versión anterior y necesita un nuevo `artifact.share` del padre para mostrar v1.8.1).

### 1. Deriva fuente ↔ vista previa, encontrada y cerrada
- El icono SVG del carrito y el carrito en memoria vivían solo en la vista previa; en la fuente `cart.js` seguía siendo solo `localStorage` y los 13 enlaces del encabezado seguían diciendo la palabra "Carrito". Las dos cosas se devolvieron a la fuente y se volvieron a sincronizar a la vista previa: **icono SVG de carrito de súper (22 px, canasta, asa, dos ruedas) con el contador como bolita en la esquina, en las 13 páginas**; el menú móvil conserva el enlace de texto "Carrito" (es una lista de texto, ahí la palabra sí ayuda).
- **Carrito en memoria primero** (`cart.js`): la memoria es la fuente de verdad mientras se navega; `localStorage` es solo un respaldo que se intenta. Lo mismo para el CP de envío. Así, agregar en Collection y abrir el carrito siempre muestra la pieza, incluso donde el almacenamiento se descarta.
- **Failsafe de la intro (nuevo):** si `app.js` no carga o falla, la intro se esconde sola por CSS a los ~3 s (`introAutoHide`, 2.6 s + fundido .5 s, `pointer-events:none`) y nunca puede tapar la página para siempre. La intro sigue siendo 2 s, saltable (Entrar/Escape), una vez por sesión.

### 2. QA (fuente, por script — 0 fallos)
- 13 páginas + CSS/JS/robots + 49 archivos de imagen: **68/68 HTTP 200** en local; 0 enlaces internos rotos; 0 enlaces externos; 0 assets faltantes; un `<h1>` por página; `alt` en todas las imágenes; 0 desajustes de dimensiones declaradas (verificadas contra el archivo real); `node --check` OK en `app.js`, `cart.js` y `liquid-glass.js`.
- Cero cadenas prohibidas (Porsche, $250,000, Ambient Lighting, BimmerCode/BimmerLink/Carista, "Edgard", "foto real"/"generada" — la única "generada" es "Guía generada", paso del checklist del plan).
- Precios consistentes en fuente y vista previa: volante $21,500 MXN, consola $9,900 MXN, ambos "Precio de referencia — por confirmar". 2 piezas en Collection, G20 como "Estudio conceptual".
- Lógica del carrito: prueba existente `qa-cart-test.js` **TODO OK** (agregar ×2, límite de 2, quitar, subtotales, envío CP 64000 = $0 / 01000 = $350, pasos del checkout, confirmación `IMP-AAAAMMDD-####`, vaciado del carrito). Prueba nueva `qa-cart-memory-test.js` **11/11**: con `localStorage` roto (getItem siempre null, setItem lanza — como el origen opaco de la vista previa), agregar el volante muestra badge 1, la línea en el carrito, subtotal $21,500, envío $0/$350 y totales correctos.
- Contraste medido de nuevo: todos los pares de texto pasan AA — Marfil/Obsidiana 16.23:1, Titanio/Obsidiana 7.56:1, atenuado/Obsidiana 7.11:1, tenue/Obsidiana 5.51:1, bronce #534b43/Marfil 7.4:1, gris oscuro/Marfil 5.36:1, texto de botón Obsidiana/Titanio 7.56:1, texto de input sobre fondo oscuro 13–15:1. `--titanio-dim` (4.45:1) se usa solo en bordes, nunca en texto.

### 3. Vista previa sincronizada (builder, 2026-11-10)
- `impare-v1-5-preview` renombrada "IMPARE v1.8.1 Preview": 13 vistas, assets idénticos a la fuente (`diff -rq` sin diferencias), 0 assets referenciados faltantes, SVG del carrito byte a byte igual a la fuente, un solo `@keyframes introAutoHide` (.5 s/2.6 s), formulario ATELIER con exactamente 5 campos, checklist de confirmación de 7 pasos, sin campos de tarjeta/CVV, cero cadenas prohibidas, enrutado en memoria intacto.

### 4. Honesto — lo que NO se pudo verificar en vivo en esta pasada
- **No hay navegador headless en este entorno:** el recorrido de clics en vivo de esta edición quedó cubierto por la auditoría automática del build, no por un recorrido nuevo con clics reales a 390 px y 1440 px. El QA en vivo previo (v1.8, inspector) ya confirmó agregar → carrito con badge, cantidades y checkout, y esta edición no tocó esa lógica salvo el guard idéntico a la fuente en `saveCP`. Mauricio debe probar el carrito en su teléfono antes de tratarlo como confirmado al 100%, como hizo las veces anteriores.
- Render real a 320/390/768/1024/1440 y métricas LCP/INP/CLS siguen sin medirse en este entorno.
- CSS muerto heredado (`.split`, `.collection-areas`, `.filters`, `.detail details`, `.atelier-hero` en media.css) sin uso en ninguna página: no afecta nada visible, se deja para una limpieza futura, no para antes de compartir.
- **Pendiente (no en v1.8.1):** proveedor de pago real, tarifas reales de envío, inventario real, política de devoluciones, contacto real durante la compra, guías y rastreo; subir la base v1.4 a GitHub; dominio y búsqueda IMPI.

## v1.8 — carrito + checkout demo, con precios de referencia (2026-11-10)

Mauricio: "haz el carrito, ponle precio a los productos aunque no sea real todavía, solo para ver cómo funciona y el razonamiento — precio de mercado, piezas originales OEM, nada de AliExpress. Después el carrito del cliente y casi el botón de pagar; al picarle, que salgan los artículos y todo". Investigación, precios y decisiones: `~/workspace/impare/revision-v18.md`. Plan seguido: `~/workspace/impare/plan-pagos-envios.md` (pasos 1–2 de su orden de construcción).

### 1. Investigación (resumen; detalle en revision-v18.md)
- Shopify, Interact Studio, LogRocket, Luis Elias (análisis del checkout de Apple): el carrito registra la intención, el checkout la convierte; los costos inesperados son la razón #1 de abandono (~70% según Baymard), así que el envío y el total se muestran desde el carrito, no al final; checkout en pasos con ruta visible (Contacto > Envío > Pago > Confirmación); Apple quita la navegación durante el pago, explica por qué pide cada dato y deja comprar como invitado; varios métodos de pago, claros desde arriba.

### 2. Precios de referencia — mercado, OEM original, por confirmar
- Tipo de cambio: **$18.60 MXN/USD** (FIX Banxico $18.5983, DOF 10 Nov 2026).
- **Volante M Alcántara LCI — $21,500 MXN.** Rango US de pieza genuina OEM G80/G82/G87: $1,084–$1,160 USD (Turner Motorsport $1,083.99, part. 32307908499; AutoTecknic / IND $1,090.00, part. 32302462910; ECS Tuning $1,135.99, MSRP $1,160) → $20,160–$21,580 MXN. Se eligió el extremo alto, redondeado, por importación/logística a Monterrey y por la verificación de compatibilidad del retrofit G→F.
- **Consola central M Carbon — $9,900 MXN.** Pieza Take-Off (OEM original desmontada, no nueva de agencia). Take-off genuino: $369.99 USD (≈ $6,880 MXN, Pacific Motors, part. 51168094583); pieza suelta nueva OEM: $620–$750 USD (≈ $11,530–$13,950 MXN, go-parts). El kit completo genuino (€1,416 / $1,640 USD, PaddleShifterz / AutoTecknic) trae varias piezas y no es comparable con una sola. $9,900 queda entre take-off y nueva: pieza original verificada, con revisión de compatibilidad.
- Ambos precios aparecen en Collection y en su ficha, siempre con la etiqueta **"Precio de referencia — por confirmar"**. Solo las 2 piezas con fotografía llevan precio; nada sin foto entra a Collection ni al carrito. No son precio final ni promesa de venta.

### 3. Carrito (`cart.js` nuevo + `carrito.html` nueva)
- Icono "Carrito" con contador en la navegación de las 13 páginas (escritorio y menú móvil); el contador se actualiza al agregar y persiste entre páginas con `localStorage` (`impare-cart-v1`).
- "Agregar al carrito" en las tarjetas de Collection y en las fichas (volante, consola), con confirmación breve en el propio botón ("Agregado al carrito").
- Vista del carrito: foto, nombre, precio unitario, cantidad +/− (máx. 2 por pieza, son piezas únicas / take-off), quitar, subtotal, envío y total. Estado vacío con camino de vuelta a Collection.
- Envío por CP (demo): Monterrey / área metropolitana (CP 64000–67999) = entrega personal a acordar, $0; resto de México = $350 MXN estimado, paquetería por confirmar. Se calcula en el carrito y se recuerda para el checkout (`impare-ship-cp`).

### 4. Checkout demo (`checkout.html` nueva — casi el botón de pagar)
- Misma página, 3 pasos con ruta visible: **1 Tus artículos · 2 Tus datos y envío · 3 Pago**. Resumen (artículos, subtotal, envío, total) visible en los 3 pasos.
- Paso 2: nombre, teléfono, correo, ciudad, CP, calle y número (+ colonia opcional); el envío se recalcula al escribir el CP, con validación antes de avanzar.
- Paso 3: tarjeta o transferencia. **No se pide ni se guarda ningún dato de tarjeta** (no hay campos de tarjeta en la demo); cada método explica qué pasaría en la versión final. Aviso visible en todo el checkout: "Vista de demostración — no se cobra nada, no se envía ningún pago".
- Confirmar genera un número de pedido de demo (`IMP-AAAAMMDD-####`), muestra el checklist de `plan-pagos-envios.md` (pago confirmado → pieza verificada → empaque → guía → en camino → entregado) y vacía el carrito. Nada se cobra, nada se envía, ningún dato se guarda.

### 5. Qué se mantiene (reglas duras, sin regresiones)
- Paleta Obsidiana / Titanio / Marfil, tipografía Didone v1.7.1, intro de 2 s, enrutado en memoria v1.6.1 sin tocar (el carrito y el checkout son páginas propias del mismo sitio; `app.js` no se modificó).
- Sin Porsche, sin precio fijo de ATELIER, sin Ambient Lighting, sin 01/02/03/04 decorativos (los pasos 1/2/3 del checkout son funcionales, con nombre), sin flechas diagonales, sin "foto real", sin "Edgard", 2 piezas en Collection, G20 como "Estudio conceptual".

### QA v1.8 (2026-11-10, por script)
- 13 páginas + CSS/JS/robots.txt HTTP 200 en local; 0 enlaces internos rotos; 0 enlaces externos; 0 assets faltantes; un `<h1>` por página; `alt` en todas las imágenes; `node --check` OK en `app.js`, `liquid-glass.js` y `cart.js`.
- Cero cadenas prohibidas (Porsche, $250,000, Ambient Lighting, BimmerCode/BimmerLink/Carista, "Edgard", "foto real"/"generada").
- Lógica del carrito probada en Node con `localStorage` simulado: agregar ×2, límite de 2 por pieza, quitar uno, quitar línea, subtotal $21,500 + $9,900 = $31,400, envío CP 64000 = $0 y CP 01000 = $350, totales correctos, número de pedido con formato `IMP-20261110-####`.
- **Pendiente:** la vista previa `impare-v1-5-preview` no se pudo actualizar desde esta sesión (la herramienta `artifact.edit` no está disponible para este subagente; solo `restore`/`share`/`unshare`). El código fuente v1.8 está completo en `~/workspace/impare/v1.5/` y listo para aplicar a la vista previa con `artifact.edit`. Los clics en vivo en la vista previa (móvil y escritorio: agregar ambas piezas, cambiar cantidades, quitar una, checkout, formulario demo, pagar, confirmación + checklist, contador del carrito) quedan pendientes de esa aplicación. El render real a 320/390/768/1024/1440 y las métricas LCP/INP/CLS siguen sin poder medirse en este entorno.
- **Sigue pendiente (no en v1.8):** proveedor de pago real (Stripe / Mercado Pago / Conekta), tarifas reales de envío por peso/ciudad, inventario real por pieza, política de devoluciones escrita, contacto real durante la compra, guías y rastreo para el cliente.

## v1.7.1 — tipografía con voz propia, contraste de ATELIER medido, animación de vuelta (2026-11-10)

Mauricio: "el formato de las letras, hay algunas que no me gusta como se ve, muy genericas, y atelier tiene un fondo que hace que casi no se vea las letras, y ya no esta la animacion :(".

### 1. Tipografía — de genérica a editorial (sin fuentes externas)
- **Causa:** la pila era Iowan Old Style / Palatino / Georgia. En iOS cae a Palatino/Georgia y en Windows/Android directo a Georgia/Times: se ve como cualquier plantilla.
- **Arreglo:** pila de display Didone — Didot, Bodoni MT, Playfair Display, Iowan Old Style, Palatino, Georgia — sin descargas, sin Google Fonts, el sitio sigue autocontenido y rápido. En Apple se ve Didot (trazos gruesos/finos de alto contraste, inconfundible); en Windows, Bodoni MT. El cuerpo sigue siendo la sans del sistema, con tracking ajustado.
- **Oficio tipográfico, no solo otra fuente:** tracking de titulares -0.05em y línea 0.96, escala de display documentada, etiquetas eyebrow a 0.32em de tracking y peso 700, acento en itálica (el titular del hero ahora dice "El *carácter* se elige." con carácter en itálica Didone), wordmark IMPARE en Didot con 0.34em de tracking.
- **Escala de tipo (v1.7.1):** display h1 clamp(3.4rem, 8vw, 7.5rem)/0.96; h2 clamp(2.2rem, 4.4vw, 4.6rem)/1.02; h3 clamp(1.5rem, 2vw, 2.2rem)/1.12; cuerpo 16px/1.75, tracking -0.01em; eyebrow 0.68rem, 0.32em, 700; botones 0.72rem, 0.09em, 650. La misma escala en las 11 páginas.

### 2. Contraste de ATELIER — causa encontrada y medida (no adivinada)
- **Causa 1:** la etiqueta "Citas privadas · San Pedro" era Titanio 80% sobre Marfil = **3.12:1** (falla AA para texto pequeño). Era literalmente el texto que casi no se veía.
- **Causa 2:** el texto fino del formulario (".fine", "Prototipo: este formulario no envía…") usaba el gris claro de las secciones oscuras sobre Marfil = **2.95:1**, casi invisible. Además ".privacy-note" y ".form-response" no tenían ninguna regla CSS: el aviso de privacidad heredaba sin estilo y la respuesta de demostración nunca se mostraba aunque el JS añadiera ".show".
- **Arreglo:** etiquetas sobre Marfil ahora en bronce oscuro #534b43 = **7.4:1**; texto fino sobre Marfil en gris oscuro = **5.36:1**; ".privacy-note" y ".form-response" con estilo propio y ".form-response.show" visible. El enlace tranquilo de la banda Marfil de Inicio también pasaba de gris claro a Obsidiana.
- **Contraste medido (todos AA, 2026-11-10):** Marfil/Obsidiana 16.23:1; texto atenuado/Obsidiana 7.11:1; tenue/Obsidiana 5.51:1; Titanio/Obsidiana 7.56:1; Obsidiana/Marfil 16.23:1; bronce oscuro/Marfil 7.4:1; gris oscuro/Marfil 5.36:1; texto de botón Obsidiana/Titanio 7.56:1. El hero de ATELIER sigue siendo Marfil claro con texto Obsidiana: ninguna foto pelea con el texto.

### 3. Animación de ATELIER — de vuelta, sin atrapar a nadie
- **Causa:** la v1.7 eliminó la entrada fija de ATELIER y con ella toda la animación; quedó una página estática.
- **Arreglo:** entrada por etapas solo con CSS, sin overlay fijo y sin tocar pointer-events: el texto entra en cascada (0.05–0.44 s) y la foto se asienta con un leve zoom (1.03 → 1) en 1.1 s. La página es usable desde el primer cuadro; no hay nada que saltar ni nada que bloquee clics. Con prefers-reduced-motion la animación no existe. La intro del sitio de 2 s se mantiene intacta.

### QA v1.7.1 (2026-11-10, por script)
- 11 páginas + CSS/JS/robots.txt HTTP 200 en local; 0 enlaces internos rotos; 0 enlaces externos; 0 assets faltantes; un `<h1>` por página; `alt` en todas las imágenes; `node --check` OK en `app.js` y `liquid-glass.js`; cero cadenas prohibidas (Porsche, $250,000, Ambient Lighting, BimmerCode/BimmerLink/Carista, "Edgard", "foto real"/"generada").
- **Pendiente de la vista previa:** clics en vivo en móvil y escritorio confirmando que la animación de ATELIER se ve, no bloquea clics, y que la nueva tipografía (Didot/Bodoni) se renderiza en todas las páginas; el render real a 320/390/768/1024/1440 y las métricas LCP/INP/CLS siguen sin poder medirse en este entorno.

## v1.7 — rediseño centrado en la persona: "una casa, no un catálogo" (2026-11-10)

Mauricio, viendo la captura de ATELIER: "mmm solo esto, como que mmm? medio xd, parece que lo hizo un borracho jajaja". Su encargo: ver la página completa, investigar en internet qué quieren ver los clientes y los apasionados del automovilismo, entender a las personas, y hacer que abrir la página se sienta como estar en casa — intuitivo, rápido, sin perderse entre botones, fácil de entender — y sobre todo, una experiencia, no algo normal.

Investigación y auditoría completa: `~/workspace/impare/revision-v17.md` (fuentes: PledgeMC Automotive Growth Blueprint, Make Ready Auto, Fyresite, WDA Automotive, ThinkDMG, Cars.com Playbook cap. 4, CarThrottle, Vearah/BraBus).

### Lo que encontró la investigación
- El visitante llega preguntando: qué me dan, por qué cuesta lo que cuesta y qué pasa después. Si no se responde pronto, se va escéptico.
- El antes/después es el activo que más convierte, y debe ir al frente.
- Una visita, una tarea: encontrar el auto o el servicio y reservar el siguiente paso. Cada elemento debe apoyar esa meta, no competir con ella.
- Regla de 3 segundos: al entrar debe saber quién eres, qué ofreces y qué hacer ahora.
- Cada campo extra de un formulario reduce la conversión ~11%; los que convierten piden 3–4 campos.
- CTAs específicos ("qué recibo"), no genéricos ("Contáctanos").
- 60%+ del tráfico es móvil; 53% abandona si tarda más de 3 s.

### Auditoría brutal v1.6.2 (lo que estaba mal)
1. **ATELIER (P0):** DOS heroes seguidos con la misma foto y el título "ATELIER" dos veces; el texto peleaba con una foto ocupada (volante, luces, botones rojos); entrada fija de 4 s tapando todo, después de la intro del sitio de 2 s. Dos intros antes de leer una frase.
2. **Inicio:** 6 acciones compitiendo en una pantalla (2 botones de hero + 2 tarjetas split + 2 botones de retrofit). Las tarjetas split usaban fotos de producto fuera de Collection.
3. **Collection:** tres sistemas de navegación (selector de 4 pestañas + 3 enlaces por área + 3 selects de filtro) para mostrar 2 piezas.
4. **G20:** los accesorios escondidos tras 3 pestañas; 5 de 7 ítems decían "Fotografía pendiente".
5. **Fichas:** la misma incertidumbre repetida 4 veces ("Por confirmar" / "Por estudiar" / "Disponibilidad no confirmada") + 3 acordeones con lo mismo.
6. **Consulta:** una página que decía "Esta vista todavía no recibe consultas" con un hueco vacío de 36vh.
7. **General:** navegación repetida 3 veces por página; footer con lenguaje interno ("Studio v1.6.2 · Vista privada de prueba"); ningún camino claro.

### Qué cambió en v1.7
- **ATELIER reconstruido:** fuera la entrada fija y fuera la foto de fondo peleando con el texto. Hero claro en Marfil: texto a un lado, foto de cabina enmarcada al otro, con aire. Un solo CTA principal por pantalla ("Empezar la conversación"). Formulario de 7 campos → 5 (nombre, teléfono, tu BMW, correo opcional, idea; el presupuesto va dentro de la idea, si quieren). Aviso de privacidad corto, envío demo.
- **Inicio, un camino:** hero con un solo CTA principal ("Ver los autos") y un enlace tranquilo ("Ver las piezas"). Fuera las tarjetas split. La banda de retrofit ahora MUESTRA el antes/después con las dos fotos, no solo texto. Banda ATELIER en Marfil con un solo CTA. Camino: Inicio → Proyectos → Collection → ATELIER.
- **Collection simplificada:** fuera selector de zonas, fuera enlaces por área, fuera filtros. Dos piezas, una línea honesta, un CTA a ATELIER.
- **G20, todo visible:** fuera las pestañas; lista única por zonas (Exterior / Interior / Escapes), todo de un vistazo. Lo pendiente se dice una sola vez al final, en voz baja.
- **Fichas:** fuera los 3 acordeones y la línea duplicada de "por confirmar"; un solo CTA principal a ATELIER (con la pieza ya puesta en la idea vía `?pieza=`), y enlace tranquilo de vuelta.
- **Consulta:** deja de ser un callejón: nombra la pieza, dice qué sigue en 3 líneas y lleva a ATELIER con la pieza prellenada en el campo de la idea.
- **Footer:** fuera el "Studio v1.6.2 · Vista privada de prueba"; ahora "Citas privadas · San Pedro".
- **Limpieza:** eliminado todo el CSS/JS muerto de la entrada de ATELIER y del selector de zonas.
- **Se mantiene:** paleta Obsidiana/Titanio/Marfil, hero M4 rojo, antes/después X6, intro de 2 s, sistema de imagen, enrutado en memoria v1.6.1 (no se tocó), todas las reglas duras (sin IA, sin Porsche, sin $250,000, sin Ambient Lighting, sin 01/02/03/04, sin flechas diagonales, sin "foto real", sin "Edgard", 2 piezas en Collection, G20 como "Estudio conceptual", presupuesto libre, demo).

### QA v1.7 (2026-11-10, por script)
- 11 páginas HTTP 200 en local; 0 enlaces internos rotos; 0 enlaces externos; 0 assets faltantes; un `<h1>` por página; `alt` en todas las imágenes; `node --check` OK en `app.js` y `liquid-glass.js`.
- Cero cadenas prohibidas: Porsche, $250,000, Ambient Lighting, BimmerCode/BimmerLink/Carista, "Edgard", "foto real"/"generada", "Fotografía pendiente", "Studio v1", "atelier-entry", "zone-tab".
- Botones principales por página: Inicio 3 (uno por pantalla: hero, antes/después, ATELIER), ATELIER 2 (CTA + enviar), Collection 2, fichas 1, G20 1, consulta 1, Proyectos 0 (las tarjetas son el camino). Tamaño total 3.8 MB.
- **Pendiente de la vista previa:** clics en vivo en móvil y escritorio (las 5 secciones, ambas G20 y sus listas, ATELIER y su formulario de 5 campos con prellenado `?pieza=`, galería del volante, consulta) y confirmación visual de que el nuevo hero de ATELIER se lee limpio y no tapa nada. El render real a 320/390/768/1024/1440 y las métricas LCP/INP/CLS siguen sin poder medirse en este entorno.

## v1.6.2 — fotos de producto en su lugar, G20 rojo y blanco, ATELIER 1:1, intro a 2 s (2026-11-10)

Mauricio pidió: las fotos de producto solo en Collection; en Proyectos los dos
BMW 330i G20 (rojo y blanco) con una interfaz para ver todo lo hecho al auto;
la entrada de ATELIER estaba pixelada y debía ser más bonita y coherente, con un
acercamiento 1:1; y la intro de 3.5 s era larga, bajarla a 2 s.

### 1. Fotos de producto solo donde pertenecen
- **Inicio:** se quitó la sección de antes/después con las fotos de cabina del
  X6. Quedó solo una banda de texto («El volante G, en una cabina F.») con
  botones a la página del retrofit y a Proyectos. El hero sigue siendo el BMW
  M4 completo, no un producto.
- **La Firma:** se quitó la foto del volante en cabina; la página ahora es solo
  texto (principios con evidencia), sin fotografía de producto.
- **Proyectos (vista general):** ya no hay foto de cabina/volante. Las tarjetas
  muestran los dos G20 completos; el retrofit X6 quedó como tarjeta
  tipográfica («Antes · Después / Volante G en cabina F»).
- **ATELIER:** fuera la foto del volante de la entrada y del fondo del hero.
- Las fotos de producto quedan solo en Collection, en las fichas de volante y
  consola, en la página del retrofit X6 y en consulta (donde nombran la pieza),
  más dos miniaturas en las páginas G20 que enlazan a esas fichas.

### 2. Proyectos: dos BMW 330i G20, rojo y blanco
- Fotos de referencia, de licencia libre, descargadas de Pexels y verificadas
  visualmente, una por una:
  - **Rojo:** BMW M340i G20 rojo (Shivam Maurya, Pexels 7051333, 5920×4000).
    La placa delantera visible se difuminó (tratamiento estándar de
    privacidad); no queda ningún carácter legible. No se encontró ningún G20
    rojo de licencia libre sin placa visible; se documenta aquí en lugar de
    esconderlo.
  - **Blanco:** BMW Serie 3 G20 LCI blanco (Kostiantyn Zavhorodnii, Pexels
    34453317, 6240×4160), sin placa delantera visible. Segunda vista trasera
    del mismo auto (Pexels 34453321), con la placa trasera difuminada.
  - Rechazadas: E30 rojo clásico con placa (Pexels 790176, generación
    equivocada), BMW blanco F30 (Pexels 19892485, generación anterior, no G20)
    y BMW Serie 4 Gran Coupé blanco (Pexels 28284077, no es Serie 3).
  - Archivos: `assets/g20-rojo.webp`, `g20-blanco.webp`,
    `g20-blanco-trasera.webp` (1920 px + variantes 640/900/1280).
- Páginas nuevas `proyecto-g20-rojo.html` y `proyecto-g20-blanco.html`, con
  interfaz de accesorios por zonas (Exterior / Interior / Escapes, pestañas
  con teclado, mismo mecanismo que el selector de Collection): fascia estilo
  M2 Competition, rines, spoiler, volante M Competition de carbono (enlace a
  su ficha), consola M3 (enlace a su ficha), asientos M3 y escapes. Donde no
  hay fotografía de la pieza, se dice «Fotografía pendiente»; nunca se rellenó
  con IA ni con foto inventada.
- **Etiqueta honesta en ambas páginas y en la vista general: «Estudio
  conceptual».** Los dos G20 son los autos de demostración de los fundadores;
  lo que se muestra es la dirección del proyecto, no un trabajo terminado para
  un cliente. Las fotos de los autos son de referencia y se sustituyen por las
  del auto en cuanto estén disponibles.

### 3. ATELIER: entrada nítida y acercamiento 1:1
- **Causa del pixelado:** la entrada usaba `wheel-angle.webp` (764×1280,
  vertical) estirada a pantalla completa con `object-fit: cover`.
- **Arreglo:** nueva foto de cabina de BMW Serie 3 G20 con tablero digital
  (Kostiantyn Zavhorodnii, Pexels 34453314, 6240×4160), servida en 1920 px con
  variantes responsivas 640/900/1280 y `srcset` correcto. La misma foto
  sustituye el fondo del hero de ATELIER (antes `wheel-cabin.webp`).
- **Copy 1:1:** la entrada dice «Una conversación privada»; el hero invita a
  tomarse el tiempo y contar la idea «como se la contarías a alguien que
  entiende de autos», sin prisa, sin compromiso, sin precio fijo. Los pasos
  recalcan que la idea se lee con calma y se revisa en persona en San Pedro.
  Presupuesto en texto libre, aviso de privacidad y envío de demostración se
  mantienen.

### 4. Intro: 2 segundos
- Temporizador en `app.js` 3500 → 2000 ms y barra de progreso en CSS
  3.5 s → 2 s (la animación de letras, hasta 1.85 s, cabe dentro de los 2 s).
  Sigue siendo saltable (Entrar / Escape), una vez por sesión, y no aparece
  con `prefers-reduced-motion`.

### Estructura v1.6.2 (11 páginas HTML)
`index.html`, `collection.html`, `volante.html`, `consola.html`, `consulta.html`,
`proyectos.html`, `proyecto-retrofit-x6.html`, `proyecto-g20-rojo.html`,
`proyecto-g20-blanco.html`, `atelier.html`, `firma.html` + `styles.css`,
`media.css`, `app.js`, `liquid-glass.js`, `assets/` (12 fotos + 33 variantes
responsivas), `robots.txt`.

### QA v1.6.2 (2026-11-10, por script)
- 11 páginas HTTP 200 en local, más styles.css, media.css, app.js,
  liquid-glass.js y robots.txt; los 49 archivos de imagen sirven 200; 0
  enlaces internos rotos; 0 enlaces externos; un `<h1>` por página; todas las
  imágenes con `alt`; 0 desajustes de dimensiones declaradas (se corrigieron
  dos miniaturas en las páginas G20: 384×643 y 384×484); `node --check` OK en
  `app.js` y `liquid-glass.js`; 0 archivos huérfanos, 0 faltantes.
- Cero cadenas prohibidas en HTML/CSS/JS: Porsche, `$250,000`, Ambient
  Lighting, BimmerCode/BimmerLink/Carista, «Edgard», «foto real» / «generada».
- Intro: 2000 ms en JS y 2 s en CSS (coherentes).
- Fotos de producto verificadas por grep: solo en Collection, volante,
  consola, retrofit X6, consulta y miniaturas de las páginas G20.
- **Pendiente de la vista previa (probe del builder):** clics en vivo en
  móvil y escritorio — las 5 secciones, las dos páginas G20 y sus pestañas de
  accesorios, la entrada de ATELIER y su formulario, el selector de
  Collection, la galería y consulta; nitidez de la entrada de ATELIER a ancho
  de escritorio; intro de 2 s; y que el enrutado en memoria de la v1.6.1 no
  haya regresado (ningún botón debe llevar a Inicio salvo Inicio).
- **Discrepancia heredada de v1.6.1, sin resolver:** el hero de la vista
  previa es un M4 negro al atardecer; el del código fuente, un M4 rojo en
  carretera mojada. Hay que alinear uno con el otro antes de publicar.

## v1.6.1 — correcciones de Mauricio con capturas (2026-11-10)

Mauricio vio la vista previa v1.6 y reportó 3 problemas. Los 3 se corrigieron en
el código fuente (`~/workspace/impare/v1.5/`) y en la vista previa
`impare-v1-5-preview`.

### 1. Fuera toda la defensa de "foto real"
- Se eliminó por completo la sección de Inicio "CÓMO SE HIZO ESTA PÁGINA /
  Todo lo que ves es real. Cada fotografía de este sitio es una fotografía
  real…". En su lugar quedó solo el antes/después, con el título "El volante
  G, en una cabina F." y sin ninguna frase sobre autenticidad.
- Se eliminaron TODAS las etiquetas "Fotografía real" / "foto real" del sitio:
  hero, tarjetas de Collection, galerías, pie de fotos, meta descriptions y
  textos. Verificado con grep: cero ocurrencias de "real", "realidad" o
  "generada" en ningún `.html`, `.css` ni `.js` del sitio. Una página
  profesional no dice que sus fotos son reales: simplemente las muestra.

### 2. Hero nuevo: un BMW, no el volante
- El hero de Inicio ya no es el volante M. Ahora es un BMW M4 rojo, vista
  frontal completa, en carretera mojada — foto de Erik Mclean en Pexels
  (foto 9846158, 5136×3424, licencia libre), descargada y verificada
  visualmente: nítida, auto completo, sin placa delantera visible.
- Se descartó la otra candidata, un M4 blanco trasero (Pexels 16555016),
  porque su placa trasera dice "ZENTURNI".
- Archivos nuevos: `assets/hero-bmw.webp` (1920×1280) + variantes
  responsivas 640/900/1280. El titular "El carácter se elige." y la paleta
  Obsidiana / Titanio / Marfil no cambian. Las fotos del volante quedan solo
  en la ficha de Collection y en el proyecto del retrofit X6, donde pertenecen.

### 3. Botones que no funcionaban en la vista previa
- Diagnóstico: se lanzó `artifact.inspect` con reparación autorizada sobre
  `impare-v1-5-preview` (el reporte del inspector llega por separado). La
  hipótesis principal: la intro fija a pantalla completa (`z-index: 90`) o un
  error de JS en la conversión multipágina → rutas hash dejaba la intro
  cubriendo toda la vista y bloqueando todos los clics, o las rutas hash no
  resolvían. En el código fuente no hay error: `node --check` pasa en
  `app.js` y `liquid-glass.js`, y la intro se retira a los 3.5 s o con
  "Entrar"/Escape. La corrección definitiva en la vista previa es la del
  inspector; después se aplica el resto de la v1.6.1 con `artifact.edit`.
- Resultado de la inspección (2026-11-10, verificado en vivo por el probe
  del inspector): causa raíz doble — (1) la intro interceptaba todos los
  clics mientras estaba presente (solo se quitaba con temporizador JS) y
  (2) la navegación dependía solo del evento `hashchange`, que en el webview
  incrustado puede no dispararse; además el panel del menú móvil colapsaba
  a 17 px de ancho y quedaba tapado. Arreglos: intro con
  `pointer-events: none` (solo el botón Entrar recibe clics) y ocultado
  automático por CSS a los 3.7 s aunque falle el JS; clic delegado que
  intercepta enlaces internos, hace `pushState` y llama al render
  directamente; menú móvil en `position: fixed` a ancho completo.
- QA de botones (fuente, por script): 9 páginas HTTP 200, 0 enlaces internos
  rotos, 1 `<h1>` por página, `alt` en todas las imágenes, 0 cadenas
  prohibidas. La prueba de clic en vivo en la vista previa (escritorio y
  móvil) queda pendiente del resultado de la inspección.
- QA en vivo de la vista previa (probe del inspector, 2026-11-10): clic en
  Explorar Collection → Collection; Proyectos → tarjeta X6 → proyecto →
  volante; miniatura 2 de la galería cambió la foto; Ver consulta de pieza
  → consulta; Conocer Atelier → entrada ATELIER; formulario llenado y
  enviado mostró la respuesta de demostración; pestaña Rines mostró su
  panel; filtro Generación = BMW G actualizó el conteo (2 piezas); menú
  móvil abierto con enlaces de 290 px sin oclusión y La Firma navegó y
  cerró el menú. Auditoría automática: pass, sin errores de consola, sin
  imágenes rotas, sin desborde móvil. Solo quedan las etiquetas aria
  "Mostrar fotografía N" de la galería (no son texto visible).
- ⚠️ Discrepancia por resolver: el hero de la vista previa NO es el mismo
  que el del código fuente. El inspector puso un BMW M4 negro de frente, al
  atardecer, sin placa (Pexels, 1200 px, verificado en captura de
  escritorio). El código fuente tiene el M4 rojo frontal de Erik Mclean
  (Pexels 9846158, 5136×3424). Ambos son BMW reales sin placa visible, pero
  hay que alinear uno con el otro antes de publicar: o se copia el M4 negro
  a la fuente, o se cambia la vista previa al M4 rojo.

## v1.6 — lo que pidió Mauricio después de ver la v1.5 (2026-11-10)

Mauricio quedó impresionado con la v1.5 (calidad, multipágina, fotos, showroom) y
pidió llevarla al siguiente nivel. Esto es lo que cambió en v1.6, sobre la misma
base, sin tocar la v1.4 ni el repo.

### 1. Intro rediseñada: letras, no foto
- La intro ya no muestra el volante ni ningún auto como elemento principal.
  Fondo solo en la paleta aprobada (Obsidiana, con un halo tenue de Titanio) y
  **«IMPARE» animado letra por letra**, con «Automotive · Monterrey» entrando
  después y la barra de progreso de Titanio. Tranqui, no estridente.
- Sigue siendo de 3.5 s, una vez por sesión, con botón «Entrar» y Escape para
  saltarla, y no aparece con `prefers-reduced-motion`.

### 2. Collection recortada a lo que tiene foto real
- **Eliminadas, por ahora: rines, lip, difusor, asiento y multirradio**, con sus
  páginas de detalle (`rines.html`, `lip.html`, `difusor.html`, `asiento.html`,
  `multirradio.html`) y sus fotos de referencia. Vuelven cuando Edgard tenga
  fotografía real de cada pieza; no se rellenaron con IA ni con stock.
- Collection ahora tiene **2 piezas: Volante M Alcántara LCI y Consola central
  M Carbon**. Contador, filtros y enlaces actualizados (el filtro de área ya
  solo ofrece Interior; el de Retrofit sigue aplicando al volante).
- `consulta.html` solo nombra volante y consola.

### 3. Sin atribuciones a Edgard en la página
- Eliminados todos los «fotografía de Edgard», «foto de Edgard», «fotografiado
  por Edgard» y créditos similares de alt, pies de foto, descripciones y
  metadatos. La página es profesional: las fotos son simplemente el trabajo,
  sin decir quién las tomó. (Los fundadores solo aparecen donde el contexto
  aprobado lo requiere; La Firma no llevaba créditos de foto y no se le añadió
  ninguno.)

### 4. ATELIER: entrada de showroom
- La entrada de ATELIER ahora tiene animación de llegada: la foto real del
  volante BMW se asienta despacio, el velo se disuelve y el título entra por
  partes. Sigue siendo foto real de BMW (nunca Porsche), de 4 s y saltable.
- Se mantienen los 3 pasos de la experiencia y el formulario de presupuesto en
  texto libre, con aviso de privacidad y envío de demostración.

### 5. Selector de piezas (configurador, alcance honesto)
- Nuevo **selector por zonas en Collection: Interior, Rines, Fascia y
  Cajuela**, con pestañas accesibles (teclado, flechas, Home/End).
- Interior muestra las dos piezas reales (Volante, Consola) con enlace a su
  ficha. Rines, Fascia y Cajuela muestran «Próximamente — fotografía real
  pendiente» y **no llevan a ninguna pieza inventada**.
- **No hay modelo 3D real disponible, así que no se finge uno.** El selector
  es una guía visual 2D sobre fotografías reales, y la página lo dice
  explícitamente. Un verdadero modelo 3D necesita archivos 3D reales de
  Edgard, en una versión futura.

### Estructura v1.6 (9 páginas HTML)
`index.html`, `collection.html`, `volante.html`, `consola.html`, `consulta.html`,
`proyectos.html`, `proyecto-retrofit-x6.html`, `atelier.html`, `firma.html` +
`styles.css`, `media.css`, `app.js`, `liquid-glass.js`, `assets/` (8 fotos
reales + 21 variantes responsivas), `robots.txt`. Tamaño total: 1.8 MB.

### QA v1.6 (2026-11-10, por script)
- 9 páginas, todas HTTP 200 en local; 0 enlaces internos rotos (incluidas las
  URLs con `?pieza=` y `?area=`); 0 enlaces externos; un `<h1>` por página;
  todas las imágenes con `alt`; 0 desajustes de dimensiones declaradas.
- Cero cadenas prohibidas en HTML/CSS/JS: Porsche, `$250,000`, Ambient
  Lighting, BimmerCode/BimmerLink/Carista, «Edgard» en cualquier crédito de
  foto, y referencias a las páginas/fotos eliminadas (rines, lip, difusor,
  asiento, multirradio).
- CSS: solo los 3 hex aprobados (`#101215`, `#B7A187`, `#F2EEE8`).
  `node --check` OK en `app.js` y `liquid-glass.js`.
- Los 29 archivos de imagen en disco están referenciados; no quedan huérfanos.
- **NO verificado en vivo (sin navegador headless en este entorno):** render
  real a 320/390/768/1024/1440, desbordamiento cero, aspecto visual de la
  intro de letras y de la entrada de ATELIER, y métricas LCP/INP/CLS. Hace
  falta una revisión visual en navegador real antes de publicar.

### Pendiente (actualizado para v1.6)
1. Fotos reales de rines, fascia, cajuela, lip, difusor, asiento y multirradio
   para devolver esas piezas a Collection.
2. Foto real de los G20 rojo y blanco, o dejar Proyectos solo con estudios reales.
3. Método de contacto real y qué hace el formulario de ATELIER cuando deje de
   ser demo.
4. Dominio `impareautomotive.com` ($12.08/año, libre) y búsqueda oficial IMPI.
5. Terminar la subida de la base v1.4 a GitHub (assets binarios por web UI);
   después, cuando los fundadores aprueben v1.6, subir esta versión.
6. Revisión visual en navegador real antes de cualquier publicación.
7. Modelo 3D real del automóvil (archivos 3D de Edgard) para un configurador
   3D de verdad, en una versión futura.


## ⚠️ Orden de subida (instrucción del fundador)

La base v1.4 va a GitHub PRIMERO. Estado de v1.4 en el repo `Zamora344/IMPARE-automotive`:
archivos de texto ya publicados (commit `0d000807`); los assets binarios (fotos WebP +
video) aún necesitan la subida por la interfaz web de GitHub. **v1.5 no sustituye a
v1.4 hasta que esa base esté completa.** Esta carpeta local es el trabajo sobre esa
base, pendiente de revisión de los fundadores.

## Qué cambió vs v1.4

### Identidad y acabado (el "nuevo look")
- Paleta única y consolidada: Obsidiana `#101215`, Titanio cálido `#B7A187`,
  Marfil `#F2EEE8`. Todo lo demás es `color-mix()` de esos tres tokens.
  Los ~90 valores hex sueltos de v1.4 y las clases muertas de v1.3 están fuera.
- CSS reescrito en un solo sistema coherente: `styles.css` (19.8 KB) + `media.css`
  (3.7 KB). Se acabaron las 3 capas en conflicto.
- La página ya no es toda negra: la banda dividida (Collection / ATELIER) y la
  sección de reserva son de Marfil con tinta Obsidiana.
- Tipografía editorial con pila de sistema (Iowan Old Style / Palatino / Georgia),
  sin fuentes externas, sin librerías externas.
- Liquid Glass solo en la navegación flotante (`liquid-glass.js`, MIT), con
  fallback de blur y sin glass cuando hay `prefers-reduced-transparency`.

### Fotos reales — cero imágenes generadas
- **Eliminadas todas las fotos sospechosas de ser generadas o renders:**
  `g20-white`, `g20-red-concept` (parilla deformada), `front`, `rim-dark`,
  `seat`, `wheel-parts`, `wheel-concept`, `hero`, `rear`, `atelier-poster` y el
  vídeo `atelier-intro.mp4` (Porsche). También se eliminó el duplicado
  `diffuser.webp` / `exhaust.webp` (byte-idénticos) y con él el producto
  **Escape estilo M Performance** — Collection pasa de 8 a 7 piezas.
- **Solo fotos reales en v1.5 (10 archivos, 2.4 MB con variantes):**
  - De Edgard (Drive + v1.4): volante M Alcántara (ángulo, frontal, lateral,
    en cabina), consola M Carbon (2 fotos), par antes/después del retrofit
    G→F en X6.
  - De licencia libre (Pexels, verificadas por descarga directa): rin BMW
    oscuro (`rines.webp`, foto 9624578) y asiento BMW M2 (`asiento.webp`,
    foto 9182354). Se usan como **foto real de referencia** y así se dice en
    la página — no son la pieza concreta.
- Donde no hay foto real (lip frontal, difusor, rines multirradio) hay un
  marco limpio que dice **«Fotografía real pendiente»** — no se rellenó con
  nada generado. Esos tres huecos están listados abajo como pendientes.
- Proyectos: los dos G20 (rojo y blanco) eran imágenes generadas y se
  retiraron, junto con `proyecto-rojo.html` y `proyecto-blanco.html`. El único
  proyecto ahora es real: **Volante G en cabina F · X6** (`proyecto-retrofit-x6.html`),
  con el par antes/después de Edgard.

### P0 de la revisión v1.4 — todos cerrados
1. **Duplicado difusor/escape:** escape eliminado; difusor queda como referencia
   con foto pendiente.
2. **Porsche en ATELIER:** fuera todo el material Porsche (póster, fondo, vídeo).
   La entrada es ahora una foto real del volante M de Edgard.
3. **6 tarjetas sin destino:** las 5 piezas restantes tienen su propia página de
   detalle (`rines.html`, `lip.html`, `difusor.html`, `asiento.html`,
   `multirradio.html`) y `consulta.html` ahora lee `?pieza=` y nombra la pieza.
4. **G20 rojo borroso:** eliminado; Proyectos solo muestra trabajo real.
5. **Antes/después G→F:** implementado en Inicio y en su propia página de proyecto.
6. **CSS consolidado:** un solo sistema de tokens (ver arriba).

### Intro de 3–4 segundos (nuevo, pedido del fundador)
- Al abrir el sitio aparece una intro IMPARE a pantalla completa con foto real
  del volante, de **3.5 s**, con barra de progreso y botón **Entrar**.
  Se muestra **una sola vez por sesión** (`sessionStorage`); Escape también la
  cierra. Con `prefers-reduced-motion` no aparece.
- La entrada de ATELIER se mantiene como intro fotográfica de **4 s**
  (antes vídeo de 5 s), también saltable.

### ATELIER como experiencia (nuevo, pedido del fundador)
- Entrada a pantalla completa con fotografía real BMW + título ATELIER.
- Hero a pantalla completa con foto real de cabina BMW.
- Nueva sección **La experiencia** en tres pasos: comparte tu idea →
  revisión en persona en la oficina de San Pedro → un proyecto a tu medida.
- Formulario: presupuesto ahora es **texto libre** («tú dices desde dónde
  partes») — se eliminaron los rangos `$20k–$250k+` como precios. Sin precio
  fijo de $250,000 en ningún sitio. Sin backend; envío de demostración.
- **Aviso de privacidad añadido** al formulario (los datos solo se usarían
  para responder la solicitud; en esta vista no se envía ni guarda nada).

### Otras correcciones
- Todas las páginas dicen «Studio v1.5 · Vista privada de prueba».
- Footer con las 5 secciones en todas las páginas.
- La Firma ahora muestra los principios con evidencia (Originalidad, Precisión,
  Individualidad) en lugar de solo enunciarlos.
- Nueva sección en Inicio: «Todo lo que ves es real» — explica la política de
  fotografía y enlaza al antes/después.
- Sin numeraciones decorativas, sin flechas diagonales, sin «Ambient Lighting»,
  sin frases vacías («redefinimos el lujo», «sin límites»).

## Qué se mantuvo de v1.4
- Arquitectura: exactamente 5 secciones (INICIO, COLLECTION, PROYECTOS, ATELIER,
  LA FIRMA), multipage, navegación por página propia.
- Sistema de imagen que funcionaba: fotos de producto en `object-fit: contain`
  dentro de marcos fijos, `cover` solo para fotografía editorial, `srcset`
  responsivo, sin estirar ni recortar.
- Galería del volante (4 fotos reales, navegación con flechas/teclado),
  filtros de Collection (área / generación / tipo, con URL), menú móvil,
  `robots.txt` con `Disallow: /` (vista privada, `noindex`).
- Copy honesto: compatibilidad caso por caso, sin prometer botones M1/M2 por
  defecto, sin inventario, sin testimonios, sin precios definitivos, sin
  enlaces a proveedores ni detalles internos de implementación.
- `noindex,nofollow` en todas las páginas.

## Estructura entregada (14 páginas HTML)
`index.html`, `collection.html`, `volante.html`, `consola.html`, `rines.html`,
`lip.html`, `difusor.html`, `asiento.html`, `multirradio.html`, `consulta.html`,
`proyectos.html`, `proyecto-retrofit-x6.html`, `atelier.html`, `firma.html` +
`styles.css`, `media.css`, `app.js`, `liquid-glass.js`, `assets/` (10 fotos
reales + 26 variantes responsivas), `robots.txt`. Tamaño total: 2.5 MB.

## QA — auditoría completa (2026-11-10, antes de entregar)

**Verificado por script (0 fallos):**
- Las 14 páginas sirven HTTP 200; los 10 archivos de imagen y las 26 variantes
  responsivas sirven 200; ningún enlace interno roto; ningún enlace externo.
- Un solo `<h1>` por página; todas las imágenes tienen `alt`; ningún `<img>`
  con dimensiones declaradas distintas a las reales (21 imágenes, 0 desajustes —
  nada deformado).
- Cero cadenas prohibidas en HTML/CSS/JS: Porsche, BimmerCode/BimmerLink/Carista,
  `$250,000`, rangos de precio, «Ambient Lighting», frases vacías, referencias a
  los archivos eliminados (g20, hero, rear, front, rim-dark, seat, wheel-parts,
  wheel-concept, diffuser, exhaust, atelier-poster, atelier-intro).
- CSS: solo los 3 hex aprobados (`#101215`, `#B7A187`, `#F2EEE8`); sin
  `@import`, sin URLs externas, sin fuentes externas. `node --check` OK en
  `app.js` y `liquid-glass.js`.
- Contraste WCAG AA: Marfil/Obsidiana 16.23:1, Titanio/Obsidiana 7.56:1,
  texto tenue/Obsidiana 5.51:1 (se subió de 4.49 a 5.51 durante la auditoría),
  Obsidiana/Marfil 16.23:1, texto del botón sólido Obsidiana/Titanio 7.56:1.
- Objetivos táctiles: navegación 44 px, botones 48–50 px, campos 48–49 px,
  miniaturas de galería 64–85 px, enlaces de pie 44 px.
- Intro: 3.5 s en JS y barra CSS de 3.5 s (coherentes); entrada ATELIER 4 s.
  Formulario ATELIER probado (demo submit muestra el aviso); filtros de
  Collection y galería de fotos revisados en código; `consulta.html?pieza=`
  nombra la pieza en 7 valores.
- Peso: Inicio ≈ 190 KB en primera carga (HTML 5.7 KB + CSS 23.5 KB + JS
  16 KB + fotos responsivas ~146 KB). Sin vídeo pesado (el de 317 KB salió).

**NO se pudo verificar (sin navegador en este entorno — no se oculta):**
- Render real a 320 / 390 / 768 / 1024 / 1440 px, desbordamiento horizontal
  cero y aspecto visual: comprobado solo a nivel estático (rejillas con
  `minmax(0,1fr)`, `shell` con `calc(100% - clamp(...))`, sin anchos `100vw`
  ni fijos mayores que la ventana). **Hace falta una revisión visual en
  navegador real antes de publicar.**
- Métricas reales LCP / INP / CLS: no medibles sin navegador. Por peso y por
  no tener fuentes externas ni JS pesado, LCP < 2.5 s es plausible pero no
  medido.
- El efecto de refracción Liquid Glass solo existe en Chromium; en Safari y
  Firefox se ve el fallback de blur (diseñado para ello).

## Pendiente — decisiones de los fundadores
1. **Fotos reales que faltan (3 huecos con marco «pendiente»):** lip frontal,
   difusor trasero y rines multirradio. En cuanto Edgard tenga foto real de
   cada pieza, sustituye el marco.
2. **Foto real de los G20 rojo y blanco** para devolverlos a Proyectos, o
   dejar Proyectos solo con estudios reales.
3. **Método de contacto real** (WhatsApp / teléfono / correo) y qué hace el
   formulario de ATELIER cuando deje de ser demo.
4. **Dominio:** comprar `impareautomotive.com` ($12.08/año, libre) y publicar
   ahí, o seguir en Sites privado. Comprar el dominio no registra la marca.
5. **Marca IMPARE:** sigue pendiente la búsqueda oficial en IMPI (MARCia) para
   IMPARE y Zamcarlist; el nombre es provisional.
6. **Subida a GitHub:** primero terminar la base v1.4 (assets binarios por web
   UI); después, cuando los fundadores aprueben v1.5, subir esta versión.
7. **Revisión visual en navegador real** (ver «NO se pudo verificar» arriba)
   antes de cualquier publicación.
