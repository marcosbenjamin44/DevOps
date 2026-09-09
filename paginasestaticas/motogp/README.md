# MotoGP Fan Hub

Sitio estático (HTML5 + CSS3 + JavaScript vanilla) sobre MotoGP. Este README
documenta las correcciones aplicadas a partir de `informe-auditoria-motogp.md`
y las decisiones tomadas en los puntos donde el informe pedía "documentar"
en lugar de un cambio de código.

## Cómo probar localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000/index.html
```

## Resumen de correcciones aplicadas

- **SEC-001** CSP estricta vía `<meta http-equiv="Content-Security-Policy">`
  en las 5 páginas (`script-src 'self'`, `style-src 'self'`, sin
  `unsafe-inline` — posible porque no quedan estilos ni scripts inline).
- **SEC-002** Se quitó `novalidate` del formulario de contacto; la
  validación nativa del navegador actúa como primera capa y el JS añade
  mensajes accesibles encima.
- **SEC-003** El video de YouTube usa un patrón *facade*: no se inserta el
  `<iframe>` hasta que el usuario pulsa "Reproducir", y sus permisos se
  redujeron a `autoplay; encrypted-media; picture-in-picture`.
- **SEC-004** Cabeceras de servidor (`X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS) en
  `_headers` (formato Netlify) y `.htaccess` (Apache), a aplicar según la
  plataforma de hosting elegida.
- **SEC-006/SEC-007** El mensaje de éxito del formulario sigue usando
  `textContent` (nunca `innerHTML`); las fechas `data-date` del calendario
  se validan con una expresión regular ISO antes de construir un `Date`.
- **SEC-008** Se eliminaron los `style` inline; ahora son las clases
  `.schedule-note` y `.aside-heading` en `styles.css`.
- **SEC-010** `<meta http-equiv="Permissions-Policy">` restringe cámara,
  micrófono y geolocalización en todas las páginas.
- **SEC-011/SEC-012** Se agregaron `robots.txt`, `sitemap.xml` y
  `<link rel="canonical">` por página.
- **SEC-013/REND-001** Todas las fotografías tienen una versión `.webp`
  (generada con Pillow, 20-50% más liviana) servida vía `<picture>` con
  respaldo `.jpg`; el fondo del hero usa `image-set()` con el mismo criterio.
- **SEC-014** `<link rel="preload">` para `styles.css` y, en `index.html`,
  para la imagen del hero.
- **SEC-015** Se quitó `scroll-behavior: smooth` global; solo el botón
  "volver arriba" anima el scroll, y respeta `prefers-reduced-motion`.
- **SEC-016/SEC-020** Favicon SVG (`assets/favicon.svg`) y
  `manifest.json` enlazados en el `<head>`.
- **SEC-017/SEO-001** Meta tags Open Graph y Twitter Card en cada página.
- **SEC-018** La pila tipográfica ahora empieza con `system-ui`.
- **SEC-021** `<script defer>` en las 5 páginas.
- **ACC-001** Al abrir el lightbox de la galería, el resto del documento
  (`header`, `main`, `footer`, botón "volver arriba") recibe
  `aria-hidden="true"` e `inert`, y se restauran al cerrar.
- **ACC-002** El botón de cerrar el lightbox se movió dentro del
  contenedor y creció a 44×44px.
- **ACC-003** El lightbox anuncia "Imagen X de N" (`aria-live="polite"`).
- **ACC-004** Al enviar el formulario con errores, aparece un resumen con
  `role="alert"` que enlaza a cada campo inválido.
- **ACC-006** Las "pills" de estado del calendario llevan
  `aria-label="Estado: ..."`.
- **RES-001/RES-002** Los breakpoints de navegación, layout de contacto y
  pie de página se alinearon a 800px para una transición consistente en
  tablets.
- **RES-003** El botón "volver arriba" respeta `env(safe-area-inset-*)`.
- **RES-004** La galería reduce el tamaño mínimo de columna en móviles en
  orientación landscape.

## Decisiones documentadas (sin cambio de código)

- **SEC-005 (SRI)** El sitio no carga librerías de CDN actualmente. Si se
  agrega una en el futuro, debe incluir siempre los atributos `integrity`
  y `crossorigin`.
- **SEC-009 (CSRF)** El formulario de contacto es una demo sin backend
  (`event.preventDefault()` siempre). El día que se conecte a un servidor,
  debe incorporar un token CSRF además de repetir la validación del lado
  del servidor.
- **SEO-002 (JSON-LD)** Se decidió **no** agregar `<script type="application/ld+json">`
  para no debilitar la CSP recién endurecida (`script-src 'self'` sin
  `unsafe-inline`/nonce, que también bloquearía los bloques JSON-LD
  inline). Si se necesita en el futuro, requiere servir el JSON-LD con un
  nonce generado por servidor o mover a un pipeline con hash de CSP.
- **REND-002 (minificación)** El propio informe señala que es aceptable
  omitirla en un sitio educativo; se mantiene el código legible.
- **Dominio canónico** `https://motogp-fan-hub.example.com/` es un
  marcador de posición usado en `canonical`, Open Graph, `robots.txt` y
  `sitemap.xml`. Debe reemplazarse por el dominio real al desplegar.

## Créditos

- Fotografías: Wikimedia Commons (licencias libres).
- Video: canal oficial de MotoGP en YouTube.
- MotoGP® es una marca registrada de Dorna Sports; este proyecto es
  educativo y no está afiliado oficialmente.
