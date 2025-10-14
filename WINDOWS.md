# 🪟 Windows Executable Guide

Guide to run NW Server Monitor as a standalone Windows executable.

## 📦 Download

### From GitHub Releases

1. Go to [Releases](https://github.com/your-username/nw-status/releases)
2. Download the latest `nw-monitor-windows-x64.zip`
3. Extract to a folder of your choice

### What's Included

```
nw-monitor-windows-x64/
├── nw-monitor.exe          # Main executable
├── .env.example            # Environment template
├── config.example.json     # Configuration template
└── README.md               # Documentation
```

## 🚀 Quick Start

### 1. Setup Configuration

**Create `.env` file:**

```bash
# Copy the example
copy .env.example .env
```

Edit `.env` with your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_IDS=your_chat_id_here
```

**Create `config.json` file:**

```bash
# Copy the example
copy config.example.json config.json
```

Edit `config.json` with your servers:

```json
{
  "checkInterval": 300000,
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

### 2. Run the Monitor

**Double-click `nw-monitor.exe`** or run from command line:

```cmd
nw-monitor.exe
```

### 3. Verify It's Working

You should see output like:

```
🚀 Starting New World Server Monitor...
🤖 Telegram bot commands enabled (WHITELIST MODE)
   Allowed chat IDs: 123456789
   Available commands: /status, /help
✅ Monitoring servers: Nysa
⏰ Check interval: 5 minutes
```

## ⚙️ Configuration

### Environment Variables (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Your Telegram bot token from BotFather |
| `TELEGRAM_CHAT_IDS` | No | Comma-separated chat IDs (whitelist) |
| `WEBHOOK_URL` | No | Optional webhook URL |
| `CHECK_INTERVAL` | No | Override check interval (milliseconds) |
| `STATE_FILE` | No | Custom state file path |
| `HISTORY_FILE` | No | Custom history file path |

### Config File (config.json)

See [EVENTS_GUIDE.md](EVENTS_GUIDE.md) for detailed configuration options.

**Basic example:**

```json
{
  "checkInterval": 300000,
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

## 🔧 Advanced Usage

### Run as Background Process

**Using Task Scheduler:**

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., "At startup")
4. Action: Start a program
5. Program: `C:\path\to\nw-monitor.exe`
6. Start in: `C:\path\to\` (folder containing .exe)

### Run with Custom Config

```cmd
# Set custom paths via environment variables
set STATE_FILE=custom_state.json
set HISTORY_FILE=custom_history.json
nw-monitor.exe
```

### Multiple Instances

You can run multiple instances with different configs:

```
instance1/
├── nw-monitor.exe
├── .env
├── config.json
└── data/

instance2/
├── nw-monitor.exe
├── .env
├── config.json
└── data/
```

## 📊 Monitoring

### Check Status

Send `/status` to your Telegram bot to get current server status.

### View Logs

The executable outputs logs to the console. To save logs:

```cmd
nw-monitor.exe > logs.txt 2>&1
```

### Data Files

The monitor creates a `data/` folder with:

- `state.json` - Current state (prevents duplicate notifications)
- `history.json` - Historical data for statistics

## 🐛 Troubleshooting

### "Windows protected your PC" warning

This is normal for unsigned executables:

1. Click "More info"
2. Click "Run anyway"

**Why?** The executable isn't code-signed. It's safe - you can verify the source code on GitHub.

### Missing TELEGRAM_BOT_TOKEN error

**Solution:** Create `.env` file with your bot token:

```env
TELEGRAM_BOT_TOKEN=your_token_here
```

### Config file not found

**Solution:** Create `config.json` in the same folder as the .exe:

```cmd
copy config.example.json config.json
```

Then edit `config.json` with your settings.

### Chromium download issues

The executable includes Chromium. If you see download errors:

1. Check your internet connection
2. Check firewall settings
3. Try running as administrator (once)

### High memory usage

**Solution:** Reduce check frequency in `config.json`:

```json
{
  "checkInterval": 600000  // 10 minutes instead of 5
}
```

### Process won't stop

**Solution:** Use Task Manager:

1. Open Task Manager (Ctrl+Shift+Esc)
2. Find "nw-monitor.exe"
3. Right-click → End Task

## 🔄 Updates

### Manual Update

1. Download latest `nw-monitor-windows-x64.zip`
2. Extract and replace `nw-monitor.exe`
3. Keep your `.env` and `config.json` files
4. Restart the monitor

### Check for Updates

Visit the [Releases page](https://github.com/your-username/nw-status/releases) regularly.

## 🔐 Security

### Protect Your Credentials

- ✅ Keep `.env` file secure
- ✅ Don't share your bot token
- ✅ Use chat ID whitelist
- ❌ Don't commit `.env` to git

### Whitelist Configuration

**Single user:**
```env
TELEGRAM_CHAT_IDS=123456789
```

**Multiple users:**
```env
TELEGRAM_CHAT_IDS=123456789,987654321,555555555
```

**Public (anyone can use):**
```env
TELEGRAM_CHAT_IDS=
```

## 💡 Tips

1. **Run on startup** - Use Task Scheduler for automatic start
2. **Backup data** - Copy `data/` folder regularly
3. **Monitor logs** - Redirect output to a log file
4. **Test config** - Start with one server first
5. **Use whitelist** - Restrict bot access to your chat ID

## 📚 Additional Resources

- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
- [EVENTS_GUIDE.md](EVENTS_GUIDE.md) - Event configuration
- [README.md](README.md) - Full documentation

## 🆘 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review [QUICKSTART.md](QUICKSTART.md)
3. Check [GitHub Issues](https://github.com/your-username/nw-status/issues)
4. Create a new issue with:
   - Windows version
   - Error message
   - Steps to reproduce

## ⚡ Performance

**System Requirements:**
- Windows 10/11 (64-bit)
- 512 MB RAM minimum (1 GB recommended)
- 200 MB disk space
- Internet connection

**Resource Usage:**
- CPU: ~1-5% (during checks)
- RAM: ~100-200 MB
- Network: Minimal (only during checks)

## 🎯 Best Practices

1. **Start simple** - Monitor one server first
2. **Test notifications** - Verify Telegram works
3. **Adjust interval** - Balance between responsiveness and load
4. **Use events wisely** - Only enable events you need
5. **Keep updated** - Check for new releases monthly
