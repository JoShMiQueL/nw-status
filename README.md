# 🎮 New World Server Status Monitor v1.0.0

A professional server monitoring system for New World with multi-server support, statistics tracking, and flexible notifications.

## ✨ Features

### Core Monitoring
- 🔍 **Multi-server monitoring** - Track multiple servers simultaneously
- 📊 **Comprehensive server data** - Status, region, population, queue, wait time, transfer flags
- 🔔 **Smart notifications** - Telegram and Webhook support with change detection
- ⏱️ **Configurable intervals** - Set your own check frequency
- 💾 **Persistent state** - Survives restarts without duplicate notifications

### Advanced Features
- 📈 **Statistics tracking** - Historical data with uptime, queue analytics
- 📜 **History storage** - Keep track of server status over time
- 🏗️ **Clean architecture** - Layered design with SOLID principles

## Installation

Choose your preferred installation method:

### 🪟 Windows Executable (Easiest)

Download the latest `nw-monitor-windows-x64.zip` from [Releases](https://github.com/your-username/nw-status/releases):

1. Extract the ZIP file
2. Copy `.env.example` to `.env` and configure
3. Copy `config.example.json` to `config.json` and configure
4. Run `nw-monitor.exe`

**No dependencies required!** See [WINDOWS.md](WINDOWS.md) for detailed guide.

### 🐳 Docker (Recommended for Linux/Mac)

```bash
# Using docker-compose
docker-compose up -d

# Or using docker CLI (Docker Hub)
docker run -d \
  --name nw-monitor \
  -e TELEGRAM_BOT_TOKEN="your_token" \
  -e TELEGRAM_CHAT_IDS="your_chat_id" \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/data:/app/data \
  joshmiquel/nw-status:latest

# Or using GitHub Container Registry
docker run -d \
  --name nw-monitor \
  -e TELEGRAM_BOT_TOKEN="your_token" \
  -e TELEGRAM_CHAT_IDS="your_chat_id" \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/data:/app/data \
  ghcr.io/joshmiquel/nw-status:latest
```

See [DOCKER.md](DOCKER.md) for detailed guide.  
See [DOCKER_HUB_SETUP.md](DOCKER_HUB_SETUP.md) to deploy to Docker Hub.

### 📦 From Source

**Prerequisites:**
- [Bun](https://bun.sh) runtime installed
- Telegram bot token (get from [@BotFather](https://t.me/botfather))
- Your Telegram chat ID (get from [@userinfobot](https://t.me/userinfobot))

**Setup:**

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Telegram Bot

1. **Create a Telegram Bot:**
   - Open Telegram and search for [@BotFather](https://t.me/BotFather)
   - Send `/newbot` and follow the instructions
   - Copy the bot token you receive

2. **Get Your Chat ID:**
   - Search for [@userinfobot](https://t.me/userinfobot) on Telegram
   - Send `/start` to get your chat ID
   - Copy the ID number

3. **Start a conversation with your bot:**
   - Search for your bot on Telegram
   - Send `/start` to initiate the conversation

### 3. Configure the Application

#### A. Create Configuration File

Copy the example configuration file:

```bash
cp config.example.json config.json
```

Edit `config.json` to customize your monitoring:

```json
{
  "checkInterval": 300000,
  "features": {
    "statistics": true,
    "history": true
  },
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

#### B. Create Environment File (Credentials)

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your **sensitive credentials only**:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=987654321
WEBHOOK_URL=https://your-webhook.com/endpoint
```

## Usage

### Run the Monitor

```bash
bun start
```

Or with auto-reload during development:

```bash
bun dev
```

### Telegram Bot Commands

Once the monitor is running, you can interact with it via Telegram:

| Command | Description |
|---------|-------------|
| `/status` | Get current status of all monitored servers |
| `/help` | Show available commands |

**Example:**
```
/status
```

**Response:**
```
📊 Current Server Status

Nysa
   Status: Online
   Region: EU Central
   Population: High
   Queue: 245
   Wait Time: 15 min
   Transfer TO: ✅ Open
   Transfer FROM: 🔒 Locked
   Char Creation: ✅ Open
   Last Update: 10/14/2025, 4:45:23 PM

🕐 Global last check: 10/14/2025, 4:45:20 PM
📈 Total checks: 42
```

### Configuration Files

#### `config.json` - Application Configuration

All non-sensitive settings are configured here:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `servers` | `array` | List of server configurations | Required |
| `servers[].name` | `string` | Server name (must match nwdb.info) | Required |
| `servers[].enabled` | `boolean` | Whether to monitor this server | `true` |
| `servers[].description` | `string` | Optional description | - |
| `servers[].events` | `object` | Event configuration for this server | Required |
| `checkInterval` | `number` | Check interval in milliseconds | `300000` |
| `features.statistics` | `boolean` | Enable statistics tracking | `true` |
| `features.history` | `boolean` | Enable history storage | `true` |
| `storage.stateFile` | `string` | Path to state file | `"data/state.json"` |
| `storage.historyFile` | `string` | Path to history file | `"data/history.json"` |

**Note:** The file includes JSON Schema support for IDE autocomplete and validation.

#### `.env` - Sensitive Credentials

Only credentials are stored here:

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Your Telegram bot token from BotFather |
| `TELEGRAM_CHAT_IDS` | No | Whitelist of allowed chat IDs (comma-separated). If empty, bot is public. |
| `WEBHOOK_URL` | No | Optional webhook URL for custom integrations |

**TELEGRAM_CHAT_IDS Examples:**
- Single user: `TELEGRAM_CHAT_IDS=123456789`
- Multiple users: `TELEGRAM_CHAT_IDS=123456789,987654321,555555555`
- Public mode: `TELEGRAM_CHAT_IDS=` (empty or not set)

**Note:** Automatic notifications are sent to the first chat ID. All listed IDs can use bot commands.

| Variable | Required | Description |
|----------|----------|-------------|
| `STATE_FILE` | No | Override state file path from config.json |
| `HISTORY_FILE` | No | Override history file path from config.json |

## Event Configuration

The monitoring system uses a flexible event-based configuration that allows you to choose exactly which changes trigger notifications.

### Available Event Types

| Event Type | Description | Has Options |
|------------|-------------|-------------|
| `transfer_to_change` | Transfer TO server opens/closes | No |
| `transfer_from_change` | Transfer FROM server opens/closes | No |
| `server_status_change` | Server goes online/offline | No |
| `character_creation_change` | Character creation opens/closes | No |
| `queue_change` | Queue crosses threshold | Yes (threshold, direction) |
| `population_change` | Population crosses threshold | Yes (threshold, direction) |

### Configuration Format

Each server has its own event configuration. This allows different monitoring rules per server:

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
            "enabled": true,
            "description": "Optional description"
          }
        ]
      }
    }
  ]
}
```

### Event Options

#### Simple Events (No Options)
- `type`: Event type (see table above)
- `enabled`: `true` or `false` (default: `true`)
- `description`: Optional human-readable description

#### Threshold Events (Queue & Population)
- `type`: `queue_change` or `population_change`
- `enabled`: `true` or `false` (default: `true`)
- `options.threshold`: Numeric threshold value
- `options.direction`: `"above"`, `"below"`, or `"both"` (default: `"both"`)
- `description`: Optional human-readable description

### Configuration Examples

Edit your `config.json` file with these examples:

#### 1. Single server - transfer monitoring only
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

#### 2. Single server - multiple events
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
          },
          {
            "type": "server_status_change",
            "enabled": true
          }
        ]
      }
    }
  ]
}
```

#### 3. Queue threshold monitoring
```json
{
  "servers": [
    {
      "name": "Nysa",
      "enabled": true,
      "events": {
        "triggers": [
          {
            "type": "queue_change",
            "enabled": true,
            "options": {
              "threshold": 300,
              "direction": "both"
            },
            "description": "Notify when queue crosses 300"
          }
        ]
      }
    }
  ]
}
```

#### 4. Multiple servers - different events per server
```json
{
  "servers": [
    {
      "name": "Nysa",
      "enabled": true,
      "description": "Main server - full monitoring",
      "events": {
        "triggers": [
          {
            "type": "transfer_to_change",
            "enabled": true
          },
          {
            "type": "queue_change",
            "enabled": true,
            "options": {
              "threshold": 300,
              "direction": "both"
            }
          }
        ]
      }
    },
    {
      "name": "Valhalla",
      "enabled": true,
      "description": "Secondary server - transfers only",
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

#### 5. Disabled server (not monitored)
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
    },
    {
      "name": "El Dorado",
      "enabled": false,
      "description": "Temporarily disabled",
      "events": {
        "triggers": []
      }
    }
  ]
}
```

**Tip:** Use `config.example.json` as a starting point and the included JSON Schema for autocomplete in VS Code.

## How It Works

1. **Scraping**: Uses Puppeteer to fetch server status from nwdb.info
2. **Event Evaluation**: Compares current status with previous state
3. **Trigger Matching**: Checks configured triggers against detected changes
4. **Notifications**: Sends alerts via Telegram and/or webhooks for matched events
5. **Bot Commands**: Responds to Telegram commands like `/status` for on-demand info
6. **Persistence**: Saves state and history to JSON files
7. **Statistics**: Calculates uptime, queue averages, and more

## Output Example

```
🚀 New World Server Status Monitor
===================================
📡 Monitoring 2 server(s):
   - Nysa (3 active triggers)
   - Valhalla (1 active triggers)
⏱️  Check interval: 300s
===================================
🤖 Telegram bot commands enabled
   Available commands: /status, /help

📂 Loaded previous state
🔍 Checking Nysa...

📊 Server Status:
   Name: Nysa
   Status: Online
   Region: EU Central
   Population: High
   Queue: 7,136
   Wait Time: 1y 243d 16h 37m 50s
   Can Transfer: NO 🔒
   🔄 Return to Aeternum World

📊 Global Statistics:
   Total Servers: 3
   Total Checks: 42
   Monitoring Since: 10/13/2025, 7:00:00 PM
   Last Check: 10/13/2025, 9:30:00 PM
```

## Telegram Message Format

```
🎮 New World Server Status

Server: Nysa
Status: Online
Region: EU Central
World Set: Cross Play
Population: High
Queue: 4,090
Wait Time: 103d 17h 18m
Transfer: 🔒 Locked

🕐 Checked at: 10/13/2025, 5:48:00 PM
```

## Architecture

This project follows a **Clean Architecture** pattern with clear separation of concerns:

- **Domain Layer**: Business logic and interfaces
- **Application Layer**: Use cases and workflows
- **Infrastructure Layer**: External services (scraper, notifications, storage)
- **Configuration Layer**: Environment management

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Project Structure

```
src/
├── domain/              # Core business logic
│   ├── types.ts        # Domain types and enums
│   └── interfaces.ts   # Interface contracts
├── infrastructure/      # External implementations
│   ├── scraper/        # NWDBScraper
│   ├── notifications/  # Telegram, Webhook services
│   └── storage/        # State and history repositories
├── application/         # Use cases
│   └── use-cases/      # MonitorServer, GetStatistics
├── config/             # ConfigService
└── index.ts            # Application entry point
```

## Troubleshooting

### Bot not sending messages
- Ensure you've started a conversation with your bot on Telegram
- Verify your bot token and chat ID are correct
- Check that the bot has permission to send messages

### Server not found
- Verify the server name is spelled correctly (case-sensitive)
- Check that the server exists on [nwdb.info/server-status](https://nwdb.info/server-status)

### Protocol errors
- The scraper includes retry logic and proper browser lifecycle management
- If errors persist, increase CHECK_INTERVAL to reduce load

### Data not persisting
- Check that the `data/` directory can be created
- Verify file permissions for state and history files

## 🔄 CI/CD & Automation

This project includes GitHub Actions workflows for:

- **CI/CD Pipeline** - Automated testing and validation
- **Docker Build** - Container image building and publishing
- **Release Automation** - Automatic changelog and release creation
- **Security Analysis** - CodeQL security scanning
- **Dependency Updates** - Automated dependency management via Dependabot

See [`.github/WORKFLOWS.md`](.github/WORKFLOWS.md) for detailed documentation.

### Quick Start with Docker

```bash
# Pull from GitHub Container Registry
docker pull ghcr.io/your-username/nw-status:latest

# Run with environment variables
docker run -d \
  --name nw-monitor \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/.env:/app/.env:ro \
  -v $(pwd)/data:/app/data \
  ghcr.io/your-username/nw-status:latest
```

## Contributing

Contributions are welcome! Please follow the existing architecture patterns.

The CI pipeline will automatically:
- Run type checks and linting
- Validate configuration files
- Run tests (when available)

## License

MIT
