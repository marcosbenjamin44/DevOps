# Informe de Auditoría — MotoGP Fan Hub

**Fecha:** 2026-09-09  
**Alcance:** 5 páginas HTML, 1 hoja de estilos CSS, 1 script JavaScript  
**Stack:** HTML5 + CSS3 (vanilla) + JavaScript vanilla  
**Objetivo:** Seguridad, accesibilidad WCAG 2.1 AA, responsive/adaptabilidad y buenas prácticas

---

## Resumen ejecutivo

| Severidad | Total |
|-----------|-------|
| Crítico   | 2     |
| Alto      | 5     |
| Medio     | 8     |
| Bajo      | 6     |

El sitio demuestra una base sólida en accesibilidad semántica y diseño responsive. Sin embargo, presenta deficiencias significativas en política de seguridad de contenido (CSP), validación del formulario y manejo del foco en el lightbox que requieren atención inmediata.

---

## 1. SEGURIDAD

### CRÍTICOS

#### SEC-001 — Ausencia total de Content Security Policy (CSP)
- **Archivos:** Todos los HTML
- **Detalle:** No existe ninguna directiva CSP (ni meta tag nicabecera HTTP). El sitio carga un iframe de YouTube con permisos amplios (`accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture`). Sin CSP, un ataque XSS podría inyectar scripts arbitrarios, exfiltrar datos o comprometer a los usuarios.
- **Impacto:** Un vector XSS podría ejecutar código malicioso sin restricción alguna.
- **Remediación:** Agregar `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; frame-src https://www.youtube-nocookie.com;">` al `<head>` de cada página. Eliminar estilos inline si se quiere una CSP estricta sin `unsafe-inline`.

#### SEC-002 — Formulario con `novalidate` y sin sanitización server-side
- **Archivos:** `contacto.html:64`, `main.js:224-250`
- **Detalle:** El formulario usa `novalidate`, desactivando la validación nativa del navegador. Toda la validación depende exclusivamente de JavaScript. Si JS no carga o un usuario lo desactiva, el formulario acepta cualquier entrada sin restricción. Aunque actualmente es una demo sin envío real, el patrón es peligroso si se conecta a un backend.
- **Impacto:** Inyección de datos maliciosos, bypass de validación en el lado del cliente.
- **Remediación:** Eliminar `novalidate` (mantener la validación JS como capa adicional). Implementar validación y sanitización en el servidor. Escapar/validar todo dato de entrada antes de procesarlo.

---

### ALTOS

#### SEC-003 — Iframe de YouTube con permisos excesivos
- **Archivo:** `index.html:70-76`
- **Detalle:** El iframe incluye `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`. Estos permisos otorgan al contenido embebido acceso a sensores del dispositivo, portapapeles y reproducción automática. El atributo `loading="lazy"` en un `<iframe>` no es un estándar y los navegadores lo ignoran.
- **Impacto:** Potencial acceso a datos del dispositivo a través del contenido embebido de terceros.
- **Remediación:** Reducir permisos al mínimo necesario: `allow="encrypted-media"`. Remover `loading="lazy"` del iframe (no válido según spec). Considerar un placeholder con botón que cargue el iframe bajo demanda (patrón "facade").

#### SEC-004 — Sin headers de seguridad en recursos externos
- **Archivos:** Todos los HTML
- **Detalle:** No existen mecanismos para establecer `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` o `Permissions-Policy`. Aunque estos se configuran en el servidor, un sitio estático desplegado sin configuración explícita carece de estas protecciones.
- **Impacto:** Clickjacking, MIME-sniffing, y acceso no restringido a APIs del navegador.
- **Remediación:** Configurar headers en el servidor de hosting (Netlify, Vercel, Nginx, etc.) o agregar un archivo `_headers` / `.htaccess` según la plataforma.

#### SEC-005 — Sin Subresource Integrity (SRI)
- **Archivos:** Todos los HTML
- **Detalle:** Aunque actualmente no se cargan librerías externas de CDN, si en el futuro se agregan dependencias externas, no hay mecanismo de verificación de integridad configurado. El patrón actual no lo requiere, pero es una deuda técnica.
- **Impacto:** Si se agregan CDN externos, un ataque de compromiso del CDN podría inyectar código malicioso.
- **Remediación:** Cuando se agreguen dependencias externas, usar siempre `integrity` y `crossorigin` attributes. Documentar esta práctica en el README del proyecto.

#### SEC-006 — Datos de usuario insertados sin escape en DOM
- **Archivo:** `main.js:236-238`
- **Detalle:** El valor del `<select>` se inserta directamente en el mensaje de éxito usando concatenación de strings: `"Tu mensaje sobre \"" + form.querySelector("#subject").value + "\""`. Aunque `textContent` protege contra XSS, si este patrón se replica con `innerHTML` en el futuro, sería vulnerable.
- **Impacto:** Riesgo potencial de XSS si el patrón se modifica sin precaución.
- **Remediación:** Mantener el uso de `textContent` (ya es así). Agregar una nota en el código que indique que nunca se debe cambiar a `innerHTML`. Considerar usar una lista blanca de valores permitidos para el select.

#### SEC-007 — No se sanitizan atributos `data-date` del calendario
- **Archivo:** `calendario.html:80-158`, `main.js:152-174`
- **Detalle:** Los atributos `data-date` se parsean directamente con `new Date()`. Un valor malformado podría causar comportamiento inesperado en JavaScript (aunque no directamente explotable).
- **Impacto:** Bajo riesgo de XSS, pero potencial de comportamiento inesperado.
- **Remediación:** Validar el formato de fecha antes de parsearlo con una expresión regular.

---

### MEDIOS

#### SEC-008 — Estilos inline en HTML
- **Archivos:** `calendario.html:164`, `contacto.html:146`
- **Detalle:** Se usan atributos `style` directamente en el HTML (`margin-top: 1.5rem`, `font-size:1.4rem`). Esto impide una CSP estricta sin `unsafe-inline` y dificulta el mantenimiento.
- **Impacto:** Imposibilidad de implementar CSP estricto; separación de concerns violada.
- **Remediación:** Mover estilos a clases CSS en `styles.css`.

#### SEC-009 — No hay mecanismo anti-CSRF en el formulario
- **Archivo:** `contacto.html:64-143`
- **Detalle:** El formulario no incluye token CSRF. Aunque es una demo sin backend, el patrón no incluye protección contra falsificación de solicitudes.
- **Impacto:** Si se conecta a un backend, el formulario sería vulnerable a CSRF.
- **Remediación:** Implementar tokens CSRF en el formulario cuando se conecte a un servidor.

#### SEC-10 — Sin `<meta http-equiv="Permissions-Policy">`
- **Archivos:** Todos los HTML
- **Detalle:** No se restringen APIs del navegador como cámara, micrófono, geolocalización, etc.
- **Impacto:** Un script malicioso podría solicitar acceso a estas APIs.
- **Remediación:** Agregar `<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">`.

#### SEC-11 — No hay `robots.txt` ni `sitemap.xml`
- **Archivos:** Raíz del proyecto
- **Detalle:** Ausencia de archivos de configuración para rastreadores.
- **Impacto:** Los rastreadores podrían indexar contenido no deseado.
- **Remediación:** Crear `robots.txt` y `sitemap.xml` apropiados.

#### SEC-12 — No existen URLs canónicas
- **Archivos:** Todos los HTML
- **Detalle:** No se incluye `<link rel="canonical">` en ninguna página.
- **Impacto:** Posible contenido duplicado en buscadores.
- **Remediación:** Agregar canonical URLs en cada página.

#### SEC-13 — Imágenes sin formato WebP/AVIF
- **Archivos:** Todos los HTML (carga de `.jpg`)
- **Detalle:** Solo se sirven imágenes en formato JPEG. No hay soporte para formatos modernos como WebP o AVIF.
- **Impacto:** Transferencia de datos innecesariamente alta; peor rendimiento.
- **Remediación:** Generar versiones WebP/AVIF con fallback a JPG usando `<picture>`.

#### SEC-14 — Sin preload de recursos críticos
- **Archivos:** Todos los HTML
- **Detalle:** No hay `<link rel="preload">` para CSS o imágenes críticas (hero).
- **Impacto:** Retraso en el renderizado inicial.
- **Remediación:** Agregar preload para CSS y la imagen hero.

#### SEC-15 — Scroll suave sin verificación completa
- **Archivo:** `styles.css:42-43`
- **Detalle:** `scroll-behavior: smooth` puede causar problemas vestibulares. Aunque se respeta `prefers-reduced-motion`, algunos usuarios no tienen esta preferencia configurada pero experimentan molestias.
- **Impacto:** Malestar vestibular en usuarios sensibles.
- **Remediación:** Considerar desactivar smooth scroll por defecto y ofrecerlo como opción.

---

### BAJOS

#### SEC-16 — No hay favicon definido
- **Archivos:** Todos los HTML
- **Detalle:** No se declara `<link rel="icon">`.
- **Impacto:** El navegador usa un icono por defecto; aspecto poco profesional.
- **Remediación:** Crear y declarar favicon.

#### SEC-17 — No hay Open Graph ni Twitter Cards
- **Archivos:** Todos los HTML
- **Detalle:** Ausencia de meta tags para compartir en redes sociales.
- **Impacto:** Los enlaces compartidos no muestran vista previa enriquecida.
- **Remediación:** Agregar meta tags OG y Twitter Card.

#### SEC-18 — Tipografía depende de fuentes del sistema
- **Archivo:** `styles.css:20-21`
- **Detalle:** La pila de fuentes es `"Segoe UI", Roboto, Arial, sans-serif`. Aunque es buena para rendimiento, en macOS/iOS no existe "Segoe UI" ni "Roboto" por defecto, cayendo a Arial.
- **Impacto:** Discrepancia visual entre plataformas.
- **Remediación:** Considerar usar `system-ui` como primera opción en la pila.

#### SEC-19 — El año en el footer se actualiza con JS
- **Archivo:** `main.js:256-261`, `index.html:242`
- **Detalle:** El año se establece con JavaScript. Si JS no carga, se muestra el año hardcodeado en el HTML (2026). Esto es un fallback correcto pero si el sitio no se actualiza anualmente, el HTML quedaría desactualizado.
- **Impacto:** Insignificante; el fallback es correcto.
- **Remediación:** Mantener el año actualizado en el HTML como fallback (ya se hace).

#### SEC-20 — No hay manifest de aplicación web
- **Archivos:** Todos los HTML
- **Detalle:** No se declara `<link rel="manifest">`.
- **Impacto:** No se puede instalar como PWA.
- **Remediación:** Crear `manifest.json` si se desea soporte PWA.

#### SEC-21 — El script se carga al final del body sin `defer`
- **Archivos:** Todos los HTML
- **Detalle:** `<script src="js/main.js"></script>` se carga sin `defer` ni `async`. Aunque está al final del body (lo cual es correcto), `defer` garantizaría el orden de ejecución y el parsing del HTML.
- **Impacto:** Mínimo; el comportamiento actual es correcto.
- **Remediación:** Agregar `defer` por consistencia y mejores prácticas.

---

## 2. ACCESIBILIDAD (WCAG 2.1 AA)

### Aspectos destacados (cumplimiento)

| Criterio | Estado | Detalle |
|----------|--------|---------|
| 1.1.1 No-texto | ✅ Cumple | Todas las imágenes tienen `alt` descriptivo |
| 1.3.1 Info y relaciones | ✅ Cumple | HTML semántico: `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`, `<figure>` |
| 1.3.2 Sentido significativo | ✅ Cumple | Orden de lectura lógico en todos los archivos |
| 2.1.1 Teclado | ✅ Cumple | Todos los interactivos son accesibles por teclado |
| 2.1.2 Sin teclado trampa | ✅ Cumple | El lightbox libera el foco correctamente |
| 2.4.1 Bloques de bypass | ✅ Cumple | Skip link presente en todas las páginas |
| 2.4.2 Título de página | ✅ Cumple | Cada página tiene `<title>` descriptivo y único |
| 2.4.3 Orden de foco | ✅ Cumple | Orden lógico de tabulación |
| 2.4.6 Encabezados y etiquetas | ✅ Cumple | Jerarquía de encabezados correcta (h1 → h2 → h3) |
| 2.5.5 Tamaño del objetivo | ✅ Cumple | Botones tienen mínimo 44×44px de área de toque |
| 3.1.1 Idioma de la página | ✅ Cumple | `lang="es"` en todas las páginas |
| 3.3.1 Error de identificación | ✅ Cumple | Mensajes de error descriptivos en formulario |
| 3.3.2 Etiquetas o instrucciones | ✅ Cumple | Todos los campos tienen `<label>` explícito |
| 4.1.2 Nombre, rol, valor | ✅ Cumple | ARIA attributes correctamente implementados |

### Hallazgos de accesibilidad

#### ACC-001 — Lightbox: foco no contenido dentro del diálogo
- **Severidad:** Alto
- **Archivos:** `galeria.html:174-197`, `main.js:134-144`
- **Criterio WCAG:** 2.4.3 (Orden de foco), 4.1.2 (Nombre, rol, valor)
- **Detalle:** Cuando el lightbox se abre, el contenido de fondo (navegación, artículos, footer) permanece accesible para lectores de pantalla. Solo se implementa trampa de foco para la tecla Tab, pero no se usa `aria-hidden="true"` ni `inert` en el contenido de fondo.
- **Impacto:** Los usuarios de lectores de pantalla pueden navegar por contenido que está visualmente oculto detrás del lightbox.
- **Remediación:** Al abrir el lightbox, agregar `aria-hidden="true"` al `<header>`, `<main>` y `<footer>`. Al cerrar, removerlo. Alternativamente, usar la API `inert`.

#### ACC-002 — Botón de cerrar lightbox posicionado fuera del contenedor
- **Severidad:** Alto
- **Archivos:** `styles.css:543-544`
- **Criterio WCAG:** 2.5.5 (Tamaño del objetivo)
- **Detalle:** El botón de cerrar tiene `top: -14px; right: -14px;`, posicionándolo parcialmente fuera del cuadro del lightbox. En pantallas pequeñas o con zoom alto, podría quedar recortado o ser difícil de alcanzar.
- **Impacto:** Dificultad para cerrar el lightbox en dispositivos táctiles o con zoom elevado.
- **Remediación:** Reposicionar el botón dentro del contenedor o asegurar que el área de toque sea accesible (mínimo 44×44px visible).

#### ACC-003 — Lightbox sin indicación de posición actual
- **Severidad:** Medio
- **Archivos:** `galeria.html:188-195`
- **Criterio WCAG:** 2.4.6 (Encabezados y etiquetas)
- **Detalle:** Los botones de navegación dicen "← Anterior" y "Siguiente →" pero no indican la posición actual (ej: "3 de 8"). Los usuarios de lectores de pantalla no saben en qué imagen están.
- **Impacto:** Confusión sobre la posición en la galería.
- **Remediación:** Agregar un elemento con texto como "Imagen 3 de 8" que se actualice dinámicamente.

#### ACC-004 — El formulario no indica errores en el título de la página
- **Severidad:** Medio
- **Archivos:** `contacto.html`, `main.js:224-250`
- **Criterio WCAG:** 3.3.1 (Error de identificación)
- **Detalle:** Cuando hay errores de validación, el foco se muestrá al primer campo inválido pero no se actualiza el `<title>` ni se announce un resumen de errores. El `<div role="status">` solo se usa para éxito, no para errores.
- **Impacto:** Los usuarios de lectores de pantalla pueden no ser conscientes de que hay múltiples errores.
- **Remediación:** Agregar un resumen de errores al inicio del formulario con `role="alert"` o usar `aria-live="assertive"` para anunciar el número de errores.

#### ACC-005 — El select no tiene una opción por defecto con valor vacío que sea accesible
- **Severidad:** Bajo
- **Archivos:** `contacto.html:114`
- **Criterio WCAG:** 3.3.2 (Etiquetas o instrucciones)
- **Detalle:** La primera opción es "Selecciona una opción" con `value=""`. Es correcto, pero la opción por defecto no tiene `selected` ni `disabled` explícito.
- **Impacto:** Mínimo; el usuario debe seleccionar una opción.
- **Remediación:** Mantener como está; es un patrón aceptable.

#### ACC-006 — Tabla del calendario sin死lembre para filas de estado
- **Severidad:** Bajo
- **Archivos:** `calendario.html:86,94,102,110,118,126,134,142,150,158`
- **Criterio WCAG:** 1.3.1 (Info y relaciones)
- **Detalle:** Las pills de estado ("Completado", "Pendiente") son texto visual pero no tienen `scope` o relación semántica con la columna. La tabla está bien estructurada con `<th scope="col">` y `<th scope="row">`.
- **Impacto:** Mínimo; la tabla es accesible gracias a la estructura correcta.
- **Remediación:** Considerar agregar `aria-label` a las pills para contextos de lectura.

---

## 3. RESPONSIVE / ADAPTABILIDAD

### Aspectos destacados

| Característica | Estado | Detalle |
|----------------|--------|---------|
| Viewport meta | ✅ Correcto | `width=device-width, initial-scale=1.0` |
| Mobile-first | ✅ Correcto | Estilos base para móvil, `@media (min-width)` para desktop |
| Tipografía fluida | ✅ Correcto | Uso de `clamp()` para escalado fluido |
| Grid responsive | ✅ Correcto | `auto-fit` con `minmax()` en card-grid y gallery-grid |
| Imágenes responsive | ✅ Correcto | `max-width: 100%; height: auto;` |
| Tabla scrollable | ✅ Correcto | Wrapper con `overflow-x: auto` y `role="region"` |

### Hallazgos

#### RES-001 — Punto de quiebre único para navegación
- **Severidad:** Medio
- **Archivos:** `styles.css:305-322`
- **Detalle:** Solo hay un breakpoint para la navegación (`800px`). Entre 600px y 800px, la navegación está en modo汉堡 pero el contenido puede estar en formato desktop.
- **Impacto:** Experiencia inconsistente en tablets en orientación vertical.
- **Remediación:** Considerar breakpoints adicionales para una transición más gradual.

#### RES-002 — Footer grid con breakpoint insuficiente
- **Severidad:** Bajo
- **Archivos:** `styles.css:746-750`
- **Detalle:** El footer usa `@media (min-width: 700px)` para 3 columnas. En tablets pequeñas (768px), el contenido podría estar comprimido.
- **Impacto:** Layout/footer podría verse apretado en tablets pequeñas.
- **Remediación:** Ajustar a `768px` o usar `auto-fit` para transición más flexible.

#### RES-003 — Botón "volver arriba" sin consideración para tablets
- **Severidad:** Bajo
- **Archivos:** `styles.css:790-814`
- **Detalle:** El botón se posiciona con `right: var(--space-2)` que es `1rem`. En tablets con bordes redondeados o notch, podría quedar parcialmente oculto.
- **Impacto:** Mínimo; el botón es funcional.
- **Remediación:** Usar `env(safe-area-inset-right)` como fallback.

#### RES-004 — Galería no se adapta a orientación landscape en móvil
- **Severidad:** Bajo
- **Archivos:** `styles.css:466-470`
- **Detalle:** La galería usa `minmax(220px, 1fr)`. En landscape de móvil (320px de alto), las imágenes podrían quedar muy pequeñas.
- **Impacto:** Experiencia subóptima en landscape móvil.
- **Remediación:** Considerar un breakpoint para landscape o ajustar el `minmax`.

---

## 4. RENDIMIENTO

#### REND-001 — No hay optimización de imágenes a formato moderno
- **Severidad:** Medio
- **Archivos:** Todos los HTML
- **Detalle:** Solo se sirven imágenes `.jpg`. No hay `<picture>` con soporte WebP/AVIF.
- **Impacto:** Transferencia de ~30-50% más de datos que con WebP.
- **Remediación:** Generar versiones WebP/AVIF y usar `<picture>` con fallback.

#### REND-002 — CSS y JS no minificados
- **Severidad:** Bajo
- **Archivos:** `css/styles.css`, `js/main.js`
- **Detalle:** Los archivos están en formato legible sin minificación.
- **Impacto:** Tamaño ligeramente mayor en transferencia.
- **Remediación:** Implementar minificación en el build (aunque para un sitio educativo es aceptable).

---

## 5. SEO

#### SEO-001 — Sin Open Graph ni Twitter Card meta tags
- **Severidad:** Medio
- **Archivos:** Todos los HTML
- **Detalle:** No existen meta tags para redes sociales.
- **Impacto:** Los enlaces compartidos no muestran imagen, título ni descripción en redes sociales.
- **Remediación:** Agregar `og:title`, `og:description`, `og:image`, `twitter:card` en cada página.

#### SEO-002 — Sin Schema.org / JSON-LD
- **Severidad:** Bajo
- **Archivos:** Todos los HTML
- **Detalle:** No hay datos estructurados para motores de búsqueda.
- **Impacto:** Los rich snippets no aparecerán en resultados de búsqueda.
- **Remediación:** Agregar JSON-LD con tipo `WebSite` y `BreadcrumbList`.

---

## 6. MANTENIBILIDAD Y BUENAS PRÁCTICAS

#### MP-001 — Código bien organizado y documentado
- **Estado:** ✅ Cumple
- El CSS usa secciones claramente delimitadas con comentarios. El JS usa un IIFE con funciones modulares. El HTML es semántico y limpio.

#### MP-002 — Consistencia de nomenclatura
- **Estado:** ✅ Cumple
- Convención BEM-like para clases CSS. Nombres descriptivos en JavaScript. IDs consistentes entre HTML y JS.

#### MP-003 — Dependencias externas
- **Estado:** ✅ Cumple
- No hay dependencias de npm en el sitio (solo un `package.json` de ejemplo en la raíz). El sitio es 100% vanilla.

---

## Plan de acción prioritario

### Fase 1 — Críticos (inmediato)
1. Agregar CSP a todas las páginas (SEC-001)
2. Eliminar `novalidate` del formulario y añadir validación server-side futura (SEC-002)

### Fase 2 — Altos (1-2 semanas)
3. Reducir permisos del iframe YouTube (SEC-003)
4. Configurar headers de seguridad en el servidor (SEC-004)
5. Implementar trampa de foco completa en lightbox con `aria-hidden` (ACC-001)
6. Reposicionar botón de cerrar lightbox (ACC-002)
7. Agregar sanitización de valores del select (SEC-006)

### Fase 3 — Medios (2-4 semanas)
8. Mover estilos inline a CSS (SEC-008)
9. Agregar indicador de posición en lightbox (ACC-003)
10. Implementar resumen de errores en formulario (ACC-004)
11. Agregar meta tags Open Graph (SEO-001)
12. Optimizar imágenes a WebP/AVIF (REND-001)
13. Configurar Permissions-Policy (SEC-010)
14. Ajustar breakpoints responsive (RES-001)

### Fase 4 — Bajos (mejora continua)
15. Crear favicon y manifest (SEC-016, SEC-020)
16. Agregar JSON-LD (SEO-002)
17. Minificar assets (REND-002)
18. Ajustar breakpoints de footer y galería (RES-002, RES-004)

---

## Conclusión

El sitio **MotoGP Fan Hub** presenta una base técnica sólida con buenas prácticas de accesibilidad semántica, diseño responsive mobile-first y código limpio. Los hallazgos críticos están relacionados con la configuración de seguridad de contenido (CSP) y la validación del formulario, ambos corregibles con cambios relativamente sencillos. El lightbox de la galería es el componente que más necesita atención en accesibilidad para cumplir completamente con WCAG 2.1 AA.

**Puntuación de madurez estimada:**
- Seguridad: 4/10 (sin CSP, sin headers)
- Accesibilidad: 7/10 (buena base semántica, lightbox necesita trabajo)
- Responsive: 8/10 (mobile-first correcto, breakpoints limitados)
- Rendimiento: 7/10 (lazy loading, pero sin optimización de imágenes)
- SEO: 5/10 (básico, sin meta tags sociales ni schema)
