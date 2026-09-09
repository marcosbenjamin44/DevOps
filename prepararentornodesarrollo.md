# Preparar entorno de desarrollo para Claude Code + OpenCode + GitHub Actions + despliegues

Este documento te sirve como base para preparar un entorno de desarrollo profesional para proyectos web, con:

- Claude Code como asistente de desarrollo
- OpenCode como auditor/validador de seguridad y calidad
- pruebas automatizadas
- auditoría de seguridad
- subida de código a GitHub
- CI/CD con GitHub Actions
- despliegue a GitHub Pages para sitios estáticos
- despliegue a un servidor gratuito para apps dinámicas con backend y base de datos

---

## 1. Requisitos previos

Necesitarás lo siguiente instalado en tu equipo:

- Windows 10/11 o Linux/macOS
- Git
- Node.js LTS (recomendado 20.x o 22.x)
- npm o pnpm
- VS Code
- Cuenta en GitHub
- Cuenta en Render, Railway o Vercel (según el tipo de despliegue)

Verifica que todo esté instalado:

```bash
git --version
node --version
npm --version
```

Si no están instalados, instala primero Git y Node.js.

---

## 2. Instalar Git y configurar GitHub

### Instalar Git

Windows:

```powershell
winget install --id Git.Git -e
```

### Configurar identidad

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tuemail@ejemplo.com"
```

### Crear un repositorio

```bash
git init
```

O clonar un repositorio existente:

```bash
git clone https://github.com/tuusuario/tu-repo.git
```

---

## 3. Instalar Node.js y un gestor de paquetes

### Opción recomendada

Instala Node.js LTS desde la página oficial:

- https://nodejs.org/

Después comprueba:

```bash
node -v
npm -v
```

Si quieres usar pnpm:

```bash
npm install -g pnpm
```

---

## 4. Instalar Claude Code como desarrollador

Claude Code es una herramienta útil para trabajar como copiloto de desarrollo en terminal o en flujo de código. La instalación puede variar según la distribución oficial o el proveedor que utilices, pero normalmente se realiza a través de npm.

### Instalación base

```bash
npm install -g @anthropic-ai/claude-code
```

Si tu entorno usa una variante o instalación específica del proveedor, sigue la documentación oficial que te indique la herramienta que estés utilizando. La idea general es:

1. Instalar el CLI
2. Iniciar sesión con tu cuenta
3. Configurar el proyecto
4. Usar Claude Code para:
   - generar código
   - refactorizar
   - escribir tests
   - documentar
   - ayudarte con depuración

### Verificar que funciona

```bash
claude --help
```

### Flujo recomendado de trabajo con Claude Code

```bash
cd tu-proyecto
claude
```

Usa Claude Code para:

- crear el boilerplate inicial
- generar componentes o servicios
- crear tests unitarios y de integración
- revisar errores de lint
- proponer soluciones de arquitectura
- preparar la documentación del proyecto

> Recomendación: usa Claude Code como herramienta de desarrollo, no como sustituto de revisión humana. Siempre debe verificarse con tests, lint y auditoría.

---

## 5. Instalar OpenCode como auditor / validador de seguridad

OpenCode debe funcionar como una capa de auditoría y validación antes de aceptar cambios. Su objetivo es revisar:

- seguridad
- dependencias
- vulnerabilidades
- calidad de código
- cumplimiento de buenas prácticas
- revisión de secretos y tokens

### Instalación base

La forma exacta depende de la distribución o paquete oficial que uses. En muchos entornos se instala con npm:

```bash
npm install -g opencode-ai
```

O según el comando oficial que indique tu proveedor.

### Verificación

```bash
opencode --help
```

### Uso recomendado

Antes de hacer push a GitHub, ejecuta:

```bash
opencode audit
```

O bien:

```bash
opencode review
```

Dependiendo de cómo esté implementado en tu instalación. La auditoría debe comprobar:

- secretos hardcodeados
- variables de entorno expuestas
- dependencias vulnerables
- código potencialmente inseguro
- uso incorrecto de APIs o tokens
- buenas prácticas de seguridad

> La auditoría no reemplaza la revisión humana. Es una capa extra antes del merge y del despliegue.

---

## 6. Configurar un entorno de desarrollo limpio

### Instalar extensiones recomendadas en VS Code

- GitHub Pull Requests
- ESLint
- Prettier
- Live Server
- Markdown All in One
- GitLens
- Docker
- GitHub Actions
- REST Client

### Configurar la terminal

Usa PowerShell, Git Bash o WSL2 si trabajas con Linux en Windows.

Para proyectos con Node.js, lo ideal es:

```bash
npm init -y
```

Y luego:

```bash
npm install
```

---

## 7. Preparar el proyecto base

Crear estructura básica:

```bash
mkdir mi-proyecto
cd mi-proyecto
npm init -y
```

Estructura sugerida:

```text
mi-proyecto/
├── .github/
│   └── workflows/
├── src/
├── tests/
├── public/
├── .gitignore
├── package.json
├── README.md
├── .env.example
└── .github/dependabot.yml
```

### Configurar .gitignore

```gitignore
node_modules/
.env
.env.local
.env.production
coverage/
dist/
build/
.DS_Store
```

---

## 8. Reglas de pruebas y calidad

Antes de subir a GitHub debes validar lo siguiente:

### 1. Instalación

```bash
npm install
```

### 2. Lint

```bash
npm run lint
```

### 3. Tests

```bash
npm test
```

### 4. Build o compilación

```bash
npm run build
```

### 5. Auditoría de dependencias

```bash
npm audit --audit-level=high
```

Si usas Python:

```bash
pip install safety
safety check
```

Si usas otros ecosistemas:

- pip-audit para Python
- osv-scanner para dependencias
- trufflehog para secretos
- gitleaks para escaneo de secretos

---

## 9. Seguridad recomendada

### 9.1. Secretos

Nunca subas a GitHub:

- tokens de API
- claves de AWS
- claves JWT
- credenciales de BD
- claves SSH
- tokens de servicios externos

Usa:

- variables de entorno (.env)
- GitHub Secrets
- servicios de secretos gestionados

### 9.2. Escaneo de secretos

Instalar gitleaks:

```bash
npm install -g gitleaks
```

O con Docker:

```bash
docker run --rm -v "$PWD:/src" zricethezav/gitleaks:latest detect --source /src --no-git -v
```

### 9.3. Verificación de dependencias

```bash
npm audit --audit-level=high
```

### 9.4. Revisión de imágenes y contenedores

Si usas Docker:

```bash
docker build -t mi-app .
docker scan mi-app
```

### 9.5. Buenas prácticas

- no hardcodear credenciales
- usar variables de entorno
- rotar tokens periódicamente
- activar MFA en GitHub
- habilitar protección de ramas
- exigir PRs con revisores

---

## 10. Flujo recomendado: Claude Code + OpenCode + GitHub

El flujo ideal es:

1. Claude Code crea o modifica código
2. Ejecutas tests y lint localmente
3. OpenCode audita la seguridad y calidad
4. Si pasa, haces commit
5. Haz push a GitHub
6. GitHub Actions valida automáticamente
7. Si todo pasa, el código se fusiona a main
8. Se despliega automáticamente

### Ejemplo básico de flujo local

```bash
npm install
npm run lint
npm test
npm run build
npm audit --audit-level=high
opencode audit
```

Si todo está correcto:

```bash
git add .
git commit -m "feat: preparar entorno y validaciones" 
git push origin main
```

> El objetivo es que Claude Code genere código, pero no haga push a producción sin validación previa y revisión de seguridad.

---

## 11. Configurar GitHub y protección de ramas

En GitHub:

- crea el repositorio
- activa protección de la rama principal
- exige Pull Request
- exige estado de comprobación exitoso de GitHub Actions
- habilita dependabot para actualizaciones de dependencias
- habilita secret scanning
- habilita push protection

Opciones recomendadas:

- main como rama principal
- pull request obligatorio
- revisión de al menos 1 colaborador
- verificar que el workflow de CI/CD pase antes del merge

---

## 12. Crear CI/CD con GitHub Actions

### 12.1. Workflow para Node.js / app web

Crea `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run tests
        run: npm test -- --runInBand

      - name: Build app
        run: npm run build

      - name: Audit dependencies
        run: npm audit --audit-level=high

      - name: Security scan
        run: npx gitleaks detect --source . --no-git --verbose || true
```

### 12.2. Workflow para despliegue a GitHub Pages

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 12.3. Configuración de GitHub Pages

En GitHub:

- ve a Settings > Pages
- selecciona GitHub Actions
- habilita el despliegue desde Actions

Esto funciona muy bien para páginas estáticas como:

- landing pages
- blogs estáticos
- portfolios
- sitios HTML/CSS/JS
- apps generadas con Vite, Astro, Next.js en modo estático

---

## 13. Despliegue para sitios estáticos: GitHub Pages

GitHub Pages es la mejor opción cuando tu proyecto es estático.

### Cuándo usar GitHub Pages

Usa GitHub Pages si tu web:

- no necesita backend
- no requiere login real
- no usa base de datos
- puede servir archivos HTML/CSS/JS estáticos

### Ejemplo de uso

- sitio personal
- documentación
- landing page
- portafolio
- micrositio

### Beneficios

- gratis
- fácil de conectar con GitHub
- buena para proyectos pequeños y documentación

---

## 14. Despliegue para sitios dinámicos con backend y base de datos

Si tu proyecto necesita:

- API REST o GraphQL
- backend en Node.js, Python, PHP, Java, .NET
- base de datos PostgreSQL, MySQL, MongoDB
- autenticación
- sesiones
- almacenamiento de archivos
- jobs en segundo plano

entonces GitHub Pages no es suficiente.

### Recomendación gratuita para apps dinámicas

La opción que recomiendo en la mayoría de casos es Render.

### ¿Por qué Render?

- tiene plan gratuito útil para proyectos pequeños
- permite desplegar backend
- admite PostgreSQL gratis o de bajo coste
- fácil integración con GitHub
- despliegue automático desde repositorio
- buen equilibrio para proyectos personales o MVPs

### Otras opciones gratuitas o de bajo coste

- Railway: muy cómodo para apps y bases de datos
- Fly.io: útil y potente
- Vercel: excelente para frontend y APIs serverless
- Supabase: ideal para bases de datos y autenticación

### Recomendación práctica

- Frontend estático: GitHub Pages
- Frontend + API + BD: Render o Railway
- Serverless + funciones: Vercel o Netlify
- Base de datos: Supabase, Neon o Render Postgres

---

## 15. Recomendación final de arquitectura

### Sitio totalmente estático

- GitHub Pages
- GitHub Actions
- dominio propio opcional

### Proyecto con backend y base de datos

- GitHub para repositorio
- GitHub Actions para CI/CD
- Render para backend
- Supabase o Render Postgres para base de datos
- variables de entorno en servicios seguros

### Ejemplo de flujo completo

```text
Claude Code -> desarrolla y corrige
OpenCode -> auditoría y seguridad
GitHub -> repositorio central
GitHub Actions -> build + tests + lint + audit
GitHub Pages -> despliegue estático
Render/Railway -> despliegue dinámico
```

---

## 16. Checklist de entrega antes de subir a GitHub

Antes de hacer el push final, comprueba:

- [ ] Node.js y npm funcionando
- [ ] Dependencias instaladas
- [ ] Variables de entorno sin secretos reales
- [ ] Archivos sensibles en .gitignore
- [ ] Tests ejecutados correctamente
- [ ] Lint ejecutado correctamente
- [ ] Build compilando sin errores
- [ ] npm audit sin vulnerabilidades críticas
- [ ] OpenCode audit realizado
- [ ] GitHub Actions configurado
- [ ] Ramas protegidas habilitadas
- [ ] No hay tokens ni claves en el repositorio

---

## 17. Comandos finales recomendados

### Inicializar proyecto

```bash
npm init -y
npm install
```

### Validación local

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

### Auditoría

```bash
opencode audit
```

### Subida a GitHub

```bash
git add .
git commit -m "feat: app ready for CI/CD"
git push origin main
```

---

## 18. Resumen ejecutivo

Para preparar tu entorno de desarrollo de forma profesional:

1. Instala Git, Node.js, npm y VS Code
2. Instala Claude Code como asistente de desarrollo
3. Instala OpenCode como auditor de seguridad y calidad
4. Configura pruebas y lint locales
5. Añade seguridad con escaneo de secretos y auditoría de dependencias
6. Haz push a GitHub con protección de ramas
7. Ejecuta CI/CD con GitHub Actions
8. Publica sitios estáticos en GitHub Pages
9. Para apps dinámicas con backend y BD, usa Render o Railway

---

## 19. Recomendación final del autor

Si estás empezando y quieres una solución clara, sensata y gratuita para proyectos pequeños:

- Usa GitHub Pages para páginas estáticas
- Usa Render para backend y base de datos dinámica
- Usa GitHub Actions para automatización y validación
- Usa Claude Code para acelerar desarrollo
- Usa OpenCode como auditor de seguridad

Esto te da un flujo de trabajo profesional, seguro y escalable sin depender de infraestructuras complejas desde el inicio.
