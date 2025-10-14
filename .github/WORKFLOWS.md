# 🔄 GitHub Actions Workflows

Este proyecto utiliza varios workflows de GitHub Actions para automatización y CI/CD.

## 📋 Workflows Disponibles

### 1. **CI (Continuous Integration)** 
**Archivo:** `.github/workflows/ci.yml`  
**Trigger:** Push y Pull Requests a `main` y `develop`

**Tareas:**
- ✅ Lint y Type Check de TypeScript
- ✅ Ejecución de tests
- ✅ Verificación de build
- ✅ Validación de archivos de configuración JSON

**Uso:**
```bash
# Se ejecuta automáticamente en cada push/PR
git push origin main
```

---

### 2. **Docker Build**
**Archivo:** `.github/workflows/docker.yml`  
**Trigger:** Push a `main` y tags `v*`

**Tareas:**
- 🐳 Construye imagen Docker
- 📦 Publica a GitHub Container Registry (ghcr.io)
- 🏷️ Etiqueta con versión y SHA

**Uso:**
```bash
# Publicar nueva versión
git tag v1.0.0
git push origin v1.0.0

# Pull de la imagen
docker pull ghcr.io/tu-usuario/nw-status:latest
```

---

### 3. **Release Automation**
**Archivo:** `.github/workflows/release.yml`  
**Trigger:** Tags con formato `v*.*.*`, Manual (workflow_dispatch)

**Tareas:**
- 🪟 Compila ejecutable de Windows (.exe)
- 📦 Empaqueta con archivos de configuración
- 📝 Genera changelog automático
- 🚀 Crea GitHub Release
- 📋 Incluye instrucciones de instalación

**Uso:**
```bash
# Crear nueva release
git tag v1.0.0
git push origin v1.0.0

# El workflow automáticamente:
# 1. Compila .exe en Windows
# 2. Crea release con changelog
# 3. Adjunta nw-monitor-windows-x64.zip
```

**Ejecución manual:**
```bash
# Desde GitHub: Actions > Release > Run workflow
```

---

### 4. **CodeQL Security Analysis**
**Archivo:** `.github/workflows/codeql.yml`  
**Trigger:** Push, PR, y semanalmente (lunes)

**Tareas:**
- 🔒 Análisis de seguridad del código
- 🐛 Detección de vulnerabilidades
- 📊 Reportes en Security tab

**Uso:**
```bash
# Se ejecuta automáticamente
# Ver resultados en: GitHub > Security > Code scanning alerts
```

---

### 5. **Dependabot**
**Archivo:** `.github/dependabot.yml`  
**Trigger:** Semanal (lunes) para npm, mensual para actions

**Tareas:**
- 📦 Actualiza dependencias npm
- 🔄 Actualiza GitHub Actions
- 🤖 Crea PRs automáticos

**Uso:**
```bash
# Automático - revisa y aprueba los PRs de Dependabot
# Los PRs aparecen en la pestaña Pull Requests
```

---

## 🚀 Configuración Inicial

### 1. Habilitar GitHub Container Registry

Para publicar imágenes Docker:

1. Ve a **Settings** > **Actions** > **General**
2. En "Workflow permissions", selecciona:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

### 2. Habilitar CodeQL

1. Ve a **Settings** > **Code security and analysis**
2. Habilita **CodeQL analysis**

### 3. Configurar Secrets (si es necesario)

Si necesitas desplegar a servicios externos:

```bash
# Settings > Secrets and variables > Actions > New repository secret
DEPLOY_TOKEN=tu_token_aqui
```

---

## 📊 Badges para README

Añade estos badges a tu `README.md`:

```markdown
![CI](https://github.com/tu-usuario/nw-status/workflows/CI/badge.svg)
![Docker](https://github.com/tu-usuario/nw-status/workflows/Docker%20Build/badge.svg)
![CodeQL](https://github.com/tu-usuario/nw-status/workflows/CodeQL/badge.svg)
```

---

## 🔧 Personalización

### Cambiar frecuencia de Dependabot

Edita `.github/dependabot.yml`:

```yaml
schedule:
  interval: "daily"  # daily, weekly, monthly
  day: "monday"      # Para weekly
```

### Añadir más validaciones al CI

Edita `.github/workflows/ci.yml`:

```yaml
- name: Run custom checks
  run: |
    bun run custom-check
    bun run security-audit
```

### Despliegue automático

Crea `.github/workflows/deploy.yml` para desplegar a tu servidor:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: |
          # Tu script de despliegue
```

---

## 🐛 Troubleshooting

### El workflow de Docker falla

**Problema:** Error de permisos al publicar imagen

**Solución:**
```bash
# Verifica que los permisos de workflow están habilitados
Settings > Actions > General > Workflow permissions
```

### CodeQL tarda mucho

**Problema:** El análisis es lento

**Solución:**
```yaml
# Reduce la frecuencia en codeql.yml
schedule:
  - cron: '0 0 * * 0'  # Solo domingos
```

### Tests fallan en CI pero funcionan localmente

**Problema:** Diferencias de entorno

**Solución:**
```yaml
# Añade variables de entorno en ci.yml
env:
  NODE_ENV: test
  CI: true
```

---

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Docker Build Action](https://github.com/docker/build-push-action)
