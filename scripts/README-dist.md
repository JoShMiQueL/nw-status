# 🎮 New World Server Monitor - Windows Edition

Monitor New World server status with Telegram notifications!

## 🚀 Quick Start

### 1. Setup Configuration

**Create `.env` file:**

Copy `.env.example` to `.env` and edit:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_IDS=your_chat_id_here
```

**Create `config.json` file:**

Copy `config.example.json` to `config.json` and edit:

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

### 2. Run

Double-click `nw-monitor.exe` or run from command line:

```cmd
nw-monitor.exe
```

## 📋 Requirements

- Windows 10/11 (64-bit)
- Internet connection
- Telegram bot token

## 🔧 Getting Telegram Credentials

1. **Bot Token:**
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` and follow instructions
   - Copy the token

2. **Chat ID:**
   - Message [@userinfobot](https://t.me/userinfobot) on Telegram
   - Copy your ID

## 📚 Documentation

Full documentation: https://github.com/your-username/nw-status

## 🆘 Troubleshooting

**"Windows protected your PC" warning:**
- Click "More info" → "Run anyway"
- This is normal for unsigned executables

**Missing token error:**
- Create `.env` file with your `TELEGRAM_BOT_TOKEN`

**Config not found:**
- Create `config.json` from `config.example.json`

## 💡 Tips

- Use `/status` command in Telegram to check server status
- Use `/help` to see available commands
- Monitor logs in the console window
- Data is saved in `data/` folder

## 📝 License

MIT License - See full repository for details
