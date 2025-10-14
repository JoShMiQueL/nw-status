# Release Process

This project uses **Release Please** for automated releases.

## How it works

### Automatic Releases (Production)

1. **Make changes** following [Conventional Commits](https://www.conventionalcommits.org/)
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "chore: update dependencies"
   ```

2. **Push to main** (via PR merge)
   ```bash
   git push origin main
   ```

3. **Release Please creates a PR** automatically with:
   - Updated `CHANGELOG.md`
   - Bumped version in `package.json`
   - Release notes

4. **Review and merge the Release PR**
   - Once merged, Release Please will:
     - Create a GitHub Release
     - Create a git tag
     - Trigger builds (Windows .exe + Docker images)

### Manual Pre-releases (Beta/Alpha/RC)

For testing versions before production:

1. Go to **Actions** → **Manual Pre-release**
2. Click **Run workflow**
3. Enter version: `1.0.0-beta.1` (or `-alpha.1`, `-rc.1`)
4. Click **Run workflow**

This will:
- ✅ Create a pre-release tag
- ✅ Build Windows executable
- ✅ Create GitHub pre-release
- ❌ NOT publish Docker images
- ❌ NOT update CHANGELOG

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature (triggers MINOR version bump)
- `fix:` - Bug fix (triggers PATCH version bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking change (triggers MAJOR version bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` - No version bump

### Examples

```bash
# Minor version bump (1.0.0 → 1.1.0)
git commit -m "feat: add server monitoring dashboard"

# Patch version bump (1.0.0 → 1.0.1)
git commit -m "fix: resolve notification delivery issue"

# Major version bump (1.0.0 → 2.0.0)
git commit -m "feat!: redesign configuration format"

# No version bump
git commit -m "chore: update dependencies"
git commit -m "docs: improve README"
```

## Version Numbering

- **Stable releases**: `1.0.0`, `1.1.0`, `2.0.0`
- **Pre-releases**: `1.0.0-beta.1`, `1.0.0-rc.2`

## What Gets Built

### Stable Release (from main)
- ✅ Windows executable (.exe)
- ✅ Docker images (GHCR + Docker Hub)
- ✅ GitHub Release (public)
- ✅ CHANGELOG updated

### Pre-release (manual)
- ✅ Windows executable (.exe)
- ✅ GitHub Pre-release
- ❌ Docker images
- ❌ CHANGELOG updated

## Troubleshooting

### Release Please PR not created

Check that:
- Commits follow Conventional Commits format
- At least one commit triggers a version bump (`feat:`, `fix:`, etc.)
- Previous Release Please PR is merged

### Build failed

Check:
- All tests pass
- Dependencies are up to date
- Secrets are configured (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)
