# 🐳 Docker Hub Deployment Setup

Complete guide to deploy your Docker image to Docker Hub using GitHub Actions.

## 📋 Prerequisites

1. Docker Hub account ([Sign up here](https://hub.docker.com/signup))
2. GitHub repository with the project
3. 5 minutes of your time

---

## 🔐 Step 1: Create Docker Hub Access Token

1. **Login to Docker Hub:**
   - Go to [hub.docker.com](https://hub.docker.com/)
   - Click "Sign In"

2. **Navigate to Security Settings:**
   - Click your username (top right)
   - Select "Account Settings"
   - Go to "Security" tab

3. **Create New Access Token:**
   - Click "New Access Token"
   - **Description:** `github-actions-nw-status`
   - **Access permissions:** Select "Read, Write, Delete"
   - Click "Generate"

4. **Copy the Token:**
   - ⚠️ **IMPORTANT:** Copy the token immediately
   - It will only be shown once
   - Store it temporarily in a secure place

---

## 🔑 Step 2: Configure GitHub Secrets

1. **Go to your GitHub repository:**
   - Navigate to your repo on GitHub
   - Click "Settings" (top menu)

2. **Add Secrets:**
   - Go to "Secrets and variables" → "Actions"
   - Click "New repository secret"

3. **Add DOCKERHUB_USERNAME:**
   - Name: `DOCKERHUB_USERNAME`
   - Secret: Your Docker Hub username (e.g., `johndoe`)
   - Click "Add secret"

4. **Add DOCKERHUB_TOKEN:**
   - Click "New repository secret" again
   - Name: `DOCKERHUB_TOKEN`
   - Secret: Paste the token you copied earlier
   - Click "Add secret"

**Your secrets should look like this:**
```
DOCKERHUB_USERNAME = johndoe
DOCKERHUB_TOKEN = dckr_pat_xxxxxxxxxxxxxxxxxxxxx
```

---

## ⚙️ Step 3: Update Workflow Configuration

1. **Edit `.github/workflows/docker-hub.yml`:**

Find this line:
```yaml
DOCKERHUB_USERNAME: your-dockerhub-username
```

Replace with your actual Docker Hub username:
```yaml
DOCKERHUB_USERNAME: johndoe
```

2. **Commit and push:**
```bash
git add .github/workflows/docker-hub.yml
git commit -m "chore: configure docker hub username"
git push origin main
```

---

## 🚀 Step 4: Trigger First Build

### Option A: Push to main (Automatic)

```bash
# Make any change and push
git add .
git commit -m "feat: trigger docker build"
git push origin main
```

### Option B: Manual Trigger

1. Go to GitHub → Actions tab
2. Click "Docker Hub Deploy" workflow
3. Click "Run workflow"
4. Select branch (main)
5. Click "Run workflow"

---

## ✅ Step 5: Verify Deployment

1. **Check GitHub Actions:**
   - Go to Actions tab
   - Watch the "Docker Hub Deploy" workflow
   - Wait for green checkmark ✅

2. **Check Docker Hub:**
   - Go to [hub.docker.com](https://hub.docker.com/)
   - Navigate to your repositories
   - You should see `nw-status` with tags

3. **Test Pull:**
```bash
docker pull your-dockerhub-username/nw-status:latest
```

---

## 📦 Available Tags

After successful deployment, your image will have these tags:

```
your-dockerhub-username/nw-status:latest       # Latest from main
your-dockerhub-username/nw-status:main         # Main branch
your-dockerhub-username/nw-status:sha-abc123   # Specific commit
your-dockerhub-username/nw-status:v1.0.0       # Version tag (if tagged)
your-dockerhub-username/nw-status:1.0          # Major.minor
your-dockerhub-username/nw-status:1            # Major only
```

---

## 🔄 Automatic Deployments

Once configured, Docker images are automatically built and pushed when:

1. **Push to main branch:**
   ```bash
   git push origin main
   ```
   → Creates `latest` and `main` tags

2. **Create version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   → Creates `v1.0.0`, `1.0`, `1`, and `latest` tags

3. **Manual trigger:**
   - GitHub → Actions → Docker Hub Deploy → Run workflow

---

## 🌐 Update docker-compose.yml

Update your `docker-compose.yml` to use Docker Hub:

```yaml
services:
  nw-monitor:
    # Use Docker Hub image
    image: your-dockerhub-username/nw-status:latest
    # ... rest of config
```

---

## 📝 Update Documentation

Update these files with your Docker Hub username:

1. **docker-compose.yml:**
   ```yaml
   image: your-dockerhub-username/nw-status:latest
   ```

2. **DOCKER.md:**
   ```bash
   docker pull your-dockerhub-username/nw-status:latest
   ```

3. **README.md:**
   ```bash
   docker pull your-dockerhub-username/nw-status:latest
   ```

---

## 🎯 Multi-Platform Support

The workflow builds for multiple platforms:
- ✅ `linux/amd64` (Intel/AMD)
- ✅ `linux/arm64` (ARM, Apple Silicon, Raspberry Pi)

Users can pull the image on any platform:
```bash
# Works on x86_64, ARM64, Apple Silicon, etc.
docker pull your-dockerhub-username/nw-status:latest
```

---

## 🔍 Troubleshooting

### "unauthorized: authentication required"

**Problem:** Secrets not configured correctly

**Solution:**
1. Verify secrets in GitHub Settings → Secrets
2. Check secret names are exactly:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
3. Regenerate token if needed

---

### "denied: requested access to the resource is denied"

**Problem:** Token doesn't have write permissions

**Solution:**
1. Go to Docker Hub → Account Settings → Security
2. Delete old token
3. Create new token with "Read, Write, Delete" permissions
4. Update `DOCKERHUB_TOKEN` secret in GitHub

---

### Build succeeds but image not on Docker Hub

**Problem:** Push step failed silently

**Solution:**
1. Check Actions logs for errors
2. Verify Docker Hub repository exists
3. Check token hasn't expired

---

### "repository does not exist"

**Problem:** Repository not created on Docker Hub

**Solution:**
The repository is created automatically on first push. If it fails:
1. Manually create repository on Docker Hub
2. Name it exactly: `nw-status`
3. Set visibility (Public or Private)
4. Re-run workflow

---

## 🔐 Security Best Practices

1. **Use Access Tokens, not passwords**
   - ✅ Tokens can be revoked
   - ✅ Limited scope
   - ❌ Never use your Docker Hub password

2. **Limit token permissions**
   - Only grant "Read, Write, Delete"
   - Don't use admin tokens

3. **Rotate tokens regularly**
   - Regenerate every 6-12 months
   - Update GitHub secret

4. **Use repository secrets**
   - ✅ Repository-level secrets
   - ❌ Don't use environment secrets for tokens

---

## 💡 Tips

1. **Public vs Private:**
   - Public: Anyone can pull (free)
   - Private: Only you can pull (limited free tier)

2. **Image size:**
   - Current image: ~500MB (with Chromium)
   - Multi-stage build keeps it optimized

3. **Build time:**
   - First build: ~5-10 minutes
   - Subsequent builds: ~2-5 minutes (cached)

4. **Rate limits:**
   - Docker Hub has pull rate limits
   - Authenticated pulls: 200/6h
   - Anonymous pulls: 100/6h

---

## 📚 Additional Resources

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Actions Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [Docker Build Push Action](https://github.com/docker/build-push-action)

---

## ✅ Checklist

- [ ] Docker Hub account created
- [ ] Access token generated
- [ ] GitHub secrets configured (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`)
- [ ] Workflow file updated with username
- [ ] First build triggered
- [ ] Image verified on Docker Hub
- [ ] docker-compose.yml updated
- [ ] Documentation updated

---

## 🆘 Need Help?

If you encounter issues:

1. Check GitHub Actions logs
2. Verify secrets are correct
3. Check Docker Hub status page
4. Review this guide again
5. Create GitHub issue with error logs

**Common issues are usually:**
- Typo in secret names
- Token without write permissions
- Expired token
- Wrong username in workflow
