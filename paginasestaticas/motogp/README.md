# MotoGP Fan Hub

Sitio estático (HTML5 + CSS3 + JavaScript vanilla) sobre MotoGP. Este README
documenta las correcciones aplicadas a partir de `informe-auditoria-motogp.md`
y las decisiones tomadas en los puntos donde el informe pedía "documentar"
en lugar de un cambio de código.

## Sitio publicado

https://marcosbenjamin44.github.io/DevOps/

## Cómo probar localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000/index.html
```

## Integración continua (GitHub Actions)

El workflow `.github/workflows/pages.yml` corre en cada push/PR a `main` y
tiene dos jobs:

1. **test** — valida el sitio antes de publicar nada:
   - `html-validate` (HTML5/semántica, config en `.htmlvalidate.json`)
   - `lychee` (enlaces y recursos internos rotos)
   - `pa11y-ci` (accesibilidad WCAG2AA sobre las 5 páginas servidas
     localmente, config en `.pa11yci.json`)
2. **deploy** — solo si `test` pasa y el push fue a `main`: publica
   `paginasestaticas/motogp` en GitHub Pages con
   `actions/upload-pages-artifact` + `actions/deploy-pages`.

Para que el job `deploy` funcione, la primera vez hay que activar en
GitHub **Settings → Pages → Build and deployment → Source: GitHub
Actions** (una sola vez; los despliegues siguientes son automáticos).

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
- **ACC-006** Se evaluó `aria-label` en las "pills" de estado, pero
  `html-validate` marcó `aria-label-misuse` (un `<span>` sin rol no admite
  nombre accesible por ARIA). Como el texto visible ya identifica el
  estado sin ambigüedad, se optó por no añadir el atributo.
- **Contraste (detectado por pa11y-ci/WCAG2AA)** El asterisco de "campo
  obligatorio" en el formulario tenía 3.21:1 sobre el fondo de la tarjeta
  (`--color-primary` sobre `--color-surface`); se cambió al mismo rojo que
  ya usan los mensajes de error (`#ff8a80`, 6.98:1).
- **Modelo de contenido HTML5 (detectado por html-validate)**
  - `galeria.html`: un `<button>` no puede contener un `<figure>`
    (`element-permitted-content`). Se cambió a
    `<figure class="gallery-item"><button class="gallery-item-trigger">…</button><figcaption>…</figcaption></figure>`.
  - `index.html`: el `<figcaption>` del video estaba fuera del `<figure>`
    que lo debía contener. Se envolvió el recuadro 16:9 en un `<div>`
    dentro del `<figure>`, dejando el `<figcaption>` como su último hijo.
  - `calendario.html`: `<div role="region">` se cambió por `<section>`
    nativo (`prefer-native-element`).
  - `galeria.html`: el `<img>` del lightbox tenía `src=""` (valor
    inválido) antes de que JS lo rellenara. Ahora apunta a
    `assets/img/placeholder.png` (PNG transparente de 1×1, 70 bytes).
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
- **Dominio canónico** `canonical`, Open Graph, `robots.txt` y
  `sitemap.xml` apuntan a `https://marcosbenjamin44.github.io/DevOps/`,
  la URL real de GitHub Pages para este repositorio.

## Créditos

- Fotografías: Wikimedia Commons (licencias libres).
- Video: canal oficial de MotoGP en YouTube.
- MotoGP® es una marca registrada de Dorna Sports; este proyecto es
  educativo y no está afiliado oficialmente.
