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

## 3. Configure Environment

Copy the example file and edit it:

```bash
cp .env.example .env
```

Edit the `.env` file and add your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
SERVERS=Nysa,Valhalla,El Dorado
CHECK_INTERVAL=300000
```

## 4. Start Monitoring

```bash
bun start
```

The program will:
- Send an initial status message to Telegram
- Check the server every 5 minutes (or your configured interval)
- Send a notification when transfer availability changes

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
