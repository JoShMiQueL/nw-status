# 🚀 Deployment Guide

Complete deployment guide for all platforms and methods.

## 📦 Deployment Options

### 1. Windows Executable (.exe)

**Best for:** Windows users who want a simple standalone application

**Pros:**
- ✅ No dependencies required
- ✅ Double-click to run
- ✅ Portable
- ✅ Easy to distribute

**Cons:**
- ❌ Windows only
- ❌ Manual updates

**Guide:** See [WINDOWS.md](WINDOWS.md)

---

### 2. Docker

**Best for:** Linux/Mac users, servers, and production deployments

**Pros:**
- ✅ Cross-platform
- ✅ Isolated environment
- ✅ Easy updates
- ✅ Resource limits
- ✅ Production-ready

**Cons:**
- ❌ Requires Docker installed
- ❌ Slightly more complex setup

**Guide:** See [DOCKER.md](DOCKER.md)

---

### 3. From Source

**Best for:** Developers and contributors

**Pros:**
- ✅ Latest features
- ✅ Easy to modify
- ✅ Full control

**Cons:**
- ❌ Requires Bun runtime
- ❌ Manual dependency management

**Guide:** See [QUICKSTART.md](QUICKSTART.md)

---

## 🏗️ Build Process

### Building Windows Executable

**Local build:**

```bash
# Install dependencies
bun install

# Build executable
bun run build:exe

# Output: dist/nw-monitor.exe + config files
```

**Automated build (GitHub Actions):**

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will:
# 1. Build .exe on Windows runner
# 2. Package with config files
# 3. Create GitHub Release
# 4. Upload nw-monitor-windows-x64.zip
```

---

### Building Docker Image

**Local build:**

```bash
# Build image
docker build -t nw-status:local .

# Run locally
docker run -d \
  --name nw-monitor \
  -e TELEGRAM_BOT_TOKEN="your_token" \
  -e TELEGRAM_CHAT_IDS="your_chat_id" \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/data:/app/data \
  nw-status:local
```

**Automated build (GitHub Actions):**

```bash
# Push to main branch
git push origin main

# GitHub Actions will:
# 1. Build Docker image
# 2. Push to ghcr.io
# 3. Tag with branch name and SHA
```

**Tagged release:**

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will:
# 1. Build Docker image
# 2. Push to ghcr.io with version tags
# 3. Create GitHub Release
```

---

## 🔄 CI/CD Pipeline

### Workflows Overview

```
┌─────────────────────────────────────────────────┐
│                   Push/PR                        │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐         ┌───▼────┐
    │   CI    │         │ Docker │
    │ Tests   │         │ Build  │
    └─────────┘         └────────┘
         │                   │
         │                   │
    ┌────▼───────────────────▼────┐
    │     Tag v*.*.* Push          │
    └──────────────┬───────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐         ┌───▼────┐
    │  Build  │         │ Docker │
    │  .exe   │         │ Release│
    └────┬────┘         └───┬────┘
         │                  │
         └────────┬─────────┘
                  │
            ┌─────▼─────┐
            │  GitHub   │
            │  Release  │
            └───────────┘
```

### Workflow Files

1. **`.github/workflows/ci.yml`**
   - Runs on: Push, PR
   - Jobs: Lint, Type Check, Tests, Build, Config Validation

2. **`.github/workflows/docker.yml`**
   - Runs on: Push to main, Tags
   - Jobs: Build and push Docker image

3. **`.github/workflows/release.yml`**
   - Runs on: Tags (v*.*.*)
   - Jobs: Build .exe, Create release with changelog

4. **`.github/workflows/codeql.yml`**
   - Runs on: Push, PR, Weekly
   - Jobs: Security analysis

5. **`.github/dependabot.yml`**
   - Runs: Weekly (npm), Monthly (actions)
   - Jobs: Dependency updates

---

## 🌐 Distribution

### GitHub Releases

**What's included:**

```
Release v1.0.0
├── nw-monitor-windows-x64.zip    # Windows executable
├── Source code (zip)              # Source code archive
├── Source code (tar.gz)           # Source code archive
└── Release notes                  # Auto-generated changelog
```

### GitHub Container Registry

**Available tags:**

```bash
# Latest from main branch
ghcr.io/username/nw-status:latest

# Specific version
ghcr.io/username/nw-status:v1.0.0
ghcr.io/username/nw-status:1.0

# Specific commit
ghcr.io/username/nw-status:sha-abc123
```

---

## 📋 Release Checklist

### Before Release

- [ ] Update version in `package.json`
- [ ] Test locally on Windows
- [ ] Test Docker build
- [ ] Update CHANGELOG (if manual)
- [ ] Review documentation

### Create Release

```bash
# 1. Commit all changes
git add .
git commit -m "chore: prepare release v1.0.0"

# 2. Create tag
git tag v1.0.0

# 3. Push
git push origin main
git push origin v1.0.0

# 4. Wait for GitHub Actions
# - Check Actions tab for progress
# - Verify builds succeed

# 5. Verify Release
# - Check Releases page
# - Download and test .exe
# - Test Docker image
```

### After Release

- [ ] Test Windows .exe download
- [ ] Test Docker image pull
- [ ] Verify documentation links
- [ ] Announce release (if applicable)

---

## 🔐 Security

### Secrets Configuration

Required secrets in GitHub repository:

```
Settings > Secrets and variables > Actions
```

**Required:**
- `GITHUB_TOKEN` - Auto-provided by GitHub

**Optional:**
- Custom deployment secrets (if needed)

### Container Registry Permissions

```
Settings > Actions > General > Workflow permissions
```

Enable:
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

---

## 🐛 Troubleshooting

### Windows Build Fails

**Issue:** Bun compile fails on Windows runner

**Solution:**
```yaml
# Ensure Windows runner is used
runs-on: windows-latest

# Check Bun version
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: 1.3.0
```

### Docker Build Fails

**Issue:** Chromium dependencies missing

**Solution:**
```dockerfile
# Ensure all dependencies are installed
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    # ... other deps
```

### Release Not Created

**Issue:** Tag pushed but no release

**Solution:**
- Check Actions tab for errors
- Verify tag format: `v*.*.*`
- Check workflow permissions

### Docker Image Not Pushed

**Issue:** Build succeeds but image not in registry

**Solution:**
- Check workflow permissions
- Verify GITHUB_TOKEN has write access
- Check registry URL format

---

## 📊 Monitoring Deployments

### Check Build Status

```bash
# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch live
gh run watch
```

### Check Docker Image

```bash
# List tags
docker pull ghcr.io/username/nw-status:latest
docker images | grep nw-status

# Inspect image
docker inspect ghcr.io/username/nw-status:latest
```

### Check Release

```bash
# List releases
gh release list

# View specific release
gh release view v1.0.0

# Download assets
gh release download v1.0.0
```

---

## 💡 Best Practices

### Versioning

Use [Semantic Versioning](https://semver.org/):

- `v1.0.0` - Major release
- `v1.1.0` - Minor release (new features)
- `v1.0.1` - Patch release (bug fixes)

### Tagging

```bash
# Annotated tags (recommended)
git tag -a v1.0.0 -m "Release v1.0.0"

# Lightweight tags
git tag v1.0.0
```

### Changelog

Auto-generated from commits:

```bash
# Good commit messages
feat: add new feature
fix: resolve bug
chore: update dependencies
docs: improve documentation
```

### Testing

Before release:

```bash
# Test Windows build locally
bun run build:exe
cd dist
./nw-monitor.exe

# Test Docker build locally
docker build -t nw-status:test .
docker run --rm nw-status:test
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Bun Documentation](https://bun.sh/docs)
- [Semantic Versioning](https://semver.org/)

---

## 🆘 Support

For deployment issues:

1. Check this guide
2. Review workflow logs in Actions tab
3. Check [GitHub Issues](https://github.com/username/nw-status/issues)
4. Create new issue with:
   - Deployment method
   - Error logs
   - Steps to reproduce
