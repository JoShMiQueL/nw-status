# CI/CD Workflows

This project uses a two-stage CI/CD workflow based on `release-please-action`.

## Workflow Overview

### Stage 1: Version PR Creation (Automatic)

**Workflow**: `.github/workflows/release-please.yml`

**Trigger**: Push to `main`

**What it does**:
1. Analyzes commits since the last release
2. Determines version type based on Conventional Commits:
   - `feat:` → Minor version bump (0.1.0 → 0.2.0)
   - `fix:` → Patch version bump (0.1.0 → 0.1.1)
   - `feat!:` or `BREAKING CHANGE:` → Major version bump (0.1.0 → 1.0.0)
3. Creates/updates an automatic PR with:
   - Updated `package.json`
   - Updated `CHANGELOG.md`
   - Title: `chore(main): release nw-status vX.Y.Z`

**Required action**: Review and merge the PR manually when ready for release.

---

### Stage 2: Build and Publish (Automatic after merge)

**Workflow**: `.github/workflows/publish-release.yml`

**Trigger**: Tag creation `nw-status-v*` (happens automatically when release-please PR is merged)

**What it does**:

#### Job 1: Build Windows Executable
- Compiles the Windows `.exe` executable
- Creates a ZIP with the executable and configuration files
- Uploads the artifact for the release

#### Job 2: Build & Push Docker Images
- Builds multi-architecture Docker images (amd64, arm64)
- Publishes to GitHub Container Registry (ghcr.io)
- Publishes to Docker Hub (optional)
- Tags with:
  - `vX.Y.Z` (specific version)
  - `vX.Y` (minor version)
  - `vX` (major version)
  - `latest`

#### Job 3: Attach Artifacts to Release
- Attaches the Windows executable ZIP to the release created by release-please

---

## Complete Flow Example

1. **Developer commits to `main`**:
   ```bash
   git commit -m "feat: add new notification feature"
   git push origin main
   ```

2. **Release-Please creates/updates PR automatically**:
   - PR #X: "chore(main): release nw-status v0.2.0"
   - Contains: `package.json` (v0.2.0) and updated `CHANGELOG.md`

3. **Team reviews and merges the PR**:
   - Tag `nw-status-v0.2.0` is created automatically
   - Release v0.2.0 is created automatically by release-please (with CHANGELOG)

4. **Publish workflow triggers automatically**:
   - ✅ Compiles Windows executable
   - ✅ Builds and publishes Docker images
   - ✅ Attaches Windows ZIP to the existing release

5. **Release is ready**:
   - Release v0.2.0 is now public on GitHub with all artifacts

---

## Additional Workflows

### Manual Pre-release

**Workflow**: `.github/workflows/manual-prerelease.yml`

**Trigger**: Manual (workflow_dispatch)

Allows creating pre-releases manually (e.g., `v1.0.0-beta.1`) without going through the normal release-please flow.

### CI Tests

**Workflow**: `.github/workflows/ci.yml`

**Trigger**: Pull requests and push to `main`

Runs tests, linting, and type checking.

### CodeQL Security Scanning

**Workflow**: `.github/workflows/codeql.yml`

**Trigger**: Push to `main`, PRs, and weekly schedule

Code security analysis.

---

## Important Notes

- **Conventional Commits**: It's crucial to follow the convention so release-please calculates versions correctly
- **Automatic Releases**: release-please creates the release automatically when the version PR is merged
- **Docker Hub**: Requires configuring secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`
- **Tags**: Tags follow the format `nw-status-vX.Y.Z` (includes package name)
