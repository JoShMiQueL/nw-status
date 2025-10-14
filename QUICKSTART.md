# Quick Start Guide

## 1. Install Dependencies

```bash
bun install
```

## 2. Get Telegram Credentials

### Create a Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the **bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Get Your Chat ID
1. Search for `@userinfobot` on Telegram
2. Send `/start` command
3. Copy your **chat ID** (a number like: `987654321`)

### Start Conversation with Your Bot
1. Search for your bot on Telegram (the name you gave it)
2. Send `/start` to initiate the conversation

## 3. Configure Application

### A. Create config.json

Copy and edit the configuration file:

```bash
cp config.example.json config.json
```

Edit `config.json`:

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

### B. Create .env (Credentials Only)

Copy and edit the environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Telegram credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Optional: Customize Events

See `EVENTS_GUIDE.md` for detailed examples. Quick configs:

**Queue threshold monitoring:**
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
            }
          }
        ]
      }
    }
  ]
}
```

## 4. Start Monitoring

```bash
bun start
```

The program will:
- Check the server every 5 minutes (or your configured interval)
- Send notifications based on your configured events
- Save state to avoid duplicate notifications on restart

## 5. Stop Monitoring

Press `Ctrl+C` to stop the program gracefully.

## Troubleshooting

**Bot not sending messages?**
- Make sure you started a conversation with your bot
- Verify your bot token and chat ID are correct

**Server not found?**
- Check the server name spelling (case-sensitive)
- Visit https://nwdb.info/server-status to verify the server exists

**Browser errors?**
- The first run downloads Chromium (this is normal)
- Make sure you have enough disk space
