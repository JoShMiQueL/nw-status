# 🎮 New World Server Status Monitor v2.0

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
- 🚨 **Queue alerts** - Get notified when queue exceeds threshold
- 🎯 **Feature flags** - Enable/disable features as needed
- 🏗️ **Clean architecture** - Layered design with SOLID principles

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- A Telegram bot token (get from [@BotFather](https://t.me/BotFather))
- Your Telegram chat ID (get from [@userinfobot](https://t.me/userinfobot))

## Setup

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

### 3. Create Environment File

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Telegram notifications
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=987654321

# Webhook notifications (optional)
WEBHOOK_URL=https://your-webhook.com/endpoint

# Servers to monitor (comma-separated)
SERVERS=Nysa,Valhalla,El Dorado

# Check interval (milliseconds)
CHECK_INTERVAL=300000

# Features
FEATURE_STATISTICS=true
FEATURE_HISTORY=true
FEATURE_QUEUE_ALERTS=false
QUEUE_THRESHOLD=1000
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

### Configuration Options

#### Required
- **`TELEGRAM_BOT_TOKEN`**: Your Telegram bot token from BotFather
- **`TELEGRAM_CHAT_ID`**: Your Telegram chat ID

#### Optional
- **`WEBHOOK_URL`**: Custom webhook endpoint for notifications
- **`SERVERS`**: Comma-separated list of servers to monitor
- **`CHECK_INTERVAL`**: Check interval in milliseconds (default: `300000` = 5 minutes)
- **`FEATURE_STATISTICS`**: Enable statistics tracking (default: `true`)
- **`FEATURE_HISTORY`**: Enable history storage (default: `true`)
- **`FEATURE_QUEUE_ALERTS`**: Enable queue threshold alerts (default: `false`)
- **`QUEUE_THRESHOLD`**: Queue size to trigger alert (default: `1000`)

## How It Works

1. **Scraping**: Uses Puppeteer to fetch server status from nwdb.info
2. **Monitoring**: Tracks multiple servers and detects status changes
3. **Notifications**: Sends alerts via Telegram and/or webhooks when:
   - Transfer availability changes (locked ↔ available)
   - Server goes online/offline
   - Queue exceeds threshold (if enabled)
4. **Persistence**: Saves state and history to JSON files
5. **Statistics**: Calculates uptime, queue averages, and more

## Output Example

```
🚀 New World Server Status Monitor
===================================
📡 Monitoring servers: Nysa, Valhalla, El Dorado
⏱️  Check interval: 300s
===================================

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

## Contributing

Contributions are welcome! Please follow the existing architecture patterns.

## License

MIT
