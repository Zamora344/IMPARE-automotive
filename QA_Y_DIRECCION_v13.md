# IMPARE · UX/QA · v1.3 · 3 noviembre 2026

## Decisión creativa

Esta iteración pasa de un prototipo en una sola página con anclas a un **sitio estático multipágina** con enlaces convencionales: Inicio, Collection, Proyectos, ATELIER y La Firma. La navegación no depende de JavaScript. Se conserva Obsidiana + Marfil + Titanio cálido, con uso moderado del acento. El inicio evita una intro bloqueante; la entrada independiente de ATELIER conserva un video de 5 s con salida automática y opción de omitirlo.

## Qué se depuró

- Menos tarjetas decorativas, flechas, numeraciones y textos reiterados.
- Collection ahora presenta tres áreas visuales y un catálogo BMW con filtros sencillos por generación F/G y área.
- Cada área enlaza a su propio filtro por URL, sin forzar al visitante a seleccionar un modelo exacto.
- Volante M Alcántara LCI y consola M Carbon muestran fotografías reales facilitadas por Edgard.
- Fotos de producto usan `object-fit: contain`; las editoriales tienen recorte intencional.
- Proyectos presenta solo dos G20 ilustrativos (rojo/blanco), identificados como conceptos hasta contar con las fotografías originales.
- La ficha del volante ofrece una explicación breve sobre G→F, pero evita enlaces y detalles internos de proveedores. Las aplicaciones requieren validación real, no se anuncian como universales.
- ATELIER mantiene su única función comercial: solicitar una conversación/cita privada. El formulario del prototipo no transmite ni guarda datos.

## QA ejecutado

**432 comprobaciones aprobadas, 0 fallas en la batería final.** Se inspeccionaron diez vistas HTML a anchuras 320, 390, 768, 1024 y 1440 px mediante Chromium, con el HTML, CSS, JS y recursos cargados como documentos de prueba. Se revisaron ausencia de desbordamiento horizontal, errores de ejecución, navegación con cinco secciones, rutas y archivos locales, visualización de imágenes, filtros de Collection, galería del volante, apertura del menú móvil y respuesta del formulario demostrativo. Se comprobó independientemente que la capa introductoria de ATELIER se oculta tras 5.45 segundos en el navegador.

**Límite de las pruebas:** el navegador automatizado de este entorno bloquea `file://` y `localhost`, por lo que se cargó cada HTML como documento independiente; no se pudo realizar un recorrido extremo a extremo por URL HTTP real. La integridad de enlaces se revisó estáticamente, pero el despliegue real y Safari/iPhone quedan pendientes. Esto no certifica compatibilidad vehicular, seguridad de pagos, licencias de marca ni disponibilidad comercial.

## Estado

**Aprobado para demostración privada y despliegue de prueba controlado. No aprobado para lanzamiento comercial público.** La versión contiene `noindex,nofollow` y `robots.txt` por prudencia, pero eso **no restringe el acceso**: debe configurarse protección por contraseña/acceso en el hosting si el material no debe ser público.

## Prioridades siguientes

1. Conectar hosting y obtener URL HTTPS con control de acceso; revisar en los dispositivos reales de los fundadores.
2. Sustituir G20 conceptuales por fotografías originales de Edgard, y decidir wordmark y sistema gráfico registrable.
3. Unificar fotos de cada producto, documentar referencia OEM, estado y compatibilidad verificable.
4. Decidir el motor de inventario, formularios y pagos antes de una tienda operativa.
5. Resolver viabilidad jurídica de IMPARE y la denominación ATELIER antes de la difusión pública.
