# 🐳 Docker Deployment Guide

Complete guide to run NW Server Monitor using Docker.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Create configuration files:**

```bash
# Copy environment template
cp .env.docker .env

# Copy config template
cp config.example.json config.json
```

2. **Choose your registry in `docker-compose.yml`:**

```yaml
# Option A: Docker Hub (easier, public)
image: joshmiquel/nw-status:latest

# Option B: GitHub Container Registry
image: ghcr.io/joshmiquel/nw-status:latest
```

2. **Edit `.env` with your credentials:**

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_IDS=your_chat_id_here
```

3. **Edit `config.json` with your servers:**

```json
{
  "servers": [
    {
      "name": "Nysa",
      "enabled": true,
      "events": {
        "triggers": [
          {
            "type": "transfer_to_change",
            "enabled": true
          }
        ]
      }
    }
  ]
}
```

4. **Start the container:**

```bash
docker-compose up -d
```

5. **Check logs:**

```bash
docker-compose logs -f
```

### Option 2: Docker CLI

**From Docker Hub:**
```bash
# Pull the image
docker pull joshmiquel/nw-status:latest

# Create data directory
mkdir -p data

# Run container
docker run -d \
  --name nw-monitor \
  --restart unless-stopped \
  -e TELEGRAM_BOT_TOKEN="your_bot_token" \
  -e TELEGRAM_CHAT_IDS="your_chat_id" \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/data:/app/data \
  joshmiquel/nw-status:latest
```

**From GitHub Container Registry:**
```bash
# Pull the image
docker pull ghcr.io/joshmiquel/nw-status:latest

# Run container
docker run -d \
  --name nw-monitor \
  --restart unless-stopped \
  -e TELEGRAM_BOT_TOKEN="your_bot_token" \
  -e TELEGRAM_CHAT_IDS="your_chat_id" \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/data:/app/data \
  ghcr.io/joshmiquel/nw-status:latest
```

## ⚙️ Configuration

### Environment Variables

All configuration can be done via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | - | Your Telegram bot token |
| `TELEGRAM_CHAT_IDS` | No | - | Comma-separated chat IDs (whitelist) |
| `WEBHOOK_URL` | No | - | Optional webhook URL |
| `CHECK_INTERVAL` | No | 300000 | Check interval in milliseconds |
| `STATE_FILE` | No | data/state.json | State file path |
| `HISTORY_FILE` | No | data/history.json | History file path |

### Config File

Mount your `config.json` to `/app/config.json`:

```yaml
volumes:
  - ./config.json:/app/config.json:ro
```

### Data Persistence

Mount a volume for data persistence:

```yaml
volumes:
  - ./data:/app/data
```

## 🔧 Docker Compose Configuration

### Basic Setup

```yaml
version: '3.8'

services:
  nw-monitor:
    image: ghcr.io/your-username/nw-status:latest
    container_name: nw-server-monitor
    restart: unless-stopped
    
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_IDS=${TELEGRAM_CHAT_IDS}
    
    volumes:
      - ./config.json:/app/config.json:ro
      - ./data:/app/data
```

### Advanced Setup with Resource Limits

```yaml
version: '3.8'

services:
  nw-monitor:
    image: ghcr.io/your-username/nw-status:latest
    container_name: nw-server-monitor
    restart: unless-stopped
    
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_IDS=${TELEGRAM_CHAT_IDS}
      - CHECK_INTERVAL=300000
    
    volumes:
      - ./config.json:/app/config.json:ro
      - ./data:/app/data
    
    # Security
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - SYS_ADMIN  # Required for Chromium
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    
    # Logging
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 📊 Management Commands

### Start/Stop

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart
```

### Logs

```bash
# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Update

```bash
# Pull latest image
docker-compose pull

# Restart with new image
docker-compose up -d
```

### Health Check

```bash
# Check container status
docker-compose ps

# Check health
docker inspect nw-server-monitor --format='{{.State.Health.Status}}'
```

## 🔍 Troubleshooting

### Container won't start

**Check logs:**
```bash
docker-compose logs
```

**Common issues:**
- Missing `TELEGRAM_BOT_TOKEN`
- Invalid `config.json`
- Permission issues with volumes

### Chromium errors

**Solution:** Ensure SYS_ADMIN capability is enabled:
```yaml
cap_add:
  - SYS_ADMIN
```

### Out of memory

**Increase memory limit:**
```yaml
deploy:
  resources:
    limits:
      memory: 2G
```

### Data not persisting

**Check volume mount:**
```bash
docker-compose down
docker volume ls
docker-compose up -d
```

## 🏗️ Building Custom Image

If you want to build your own image:

```bash
# Build
docker build -t nw-status:custom .

# Run
docker run -d \
  --name nw-monitor \
  -e TELEGRAM_BOT_TOKEN="your_token" \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/data:/app/data \
  nw-status:custom
```

## 🔐 Security Best Practices

1. **Use read-only config:**
   ```yaml
   - ./config.json:/app/config.json:ro
   ```

2. **Drop unnecessary capabilities:**
   ```yaml
   cap_drop:
     - ALL
   cap_add:
     - SYS_ADMIN  # Only what's needed
   ```

3. **Use secrets for sensitive data:**
   ```yaml
   secrets:
     - telegram_token
   ```

4. **Limit resources:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 1G
   ```

5. **Enable health checks:**
   ```yaml
   healthcheck:
     test: ["CMD", "pgrep", "-f", "bun"]
     interval: 5m
   ```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

## 💡 Tips

1. **Use `.env` file for secrets** - Don't commit it to git
2. **Monitor resource usage** - Use `docker stats nw-server-monitor`
3. **Regular updates** - Pull latest image weekly
4. **Backup data** - Backup the `data/` directory regularly
5. **Check logs** - Monitor for errors or warnings

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify configuration files
3. Check GitHub Issues
4. Review [QUICKSTART.md](QUICKSTART.md) for setup help
