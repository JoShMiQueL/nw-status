/**
 * Telegram Bot Service
 * Handles incoming commands from Telegram
 */

import type { MonitorState } from '../../domain/types';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
    };
    text?: string;
    date: number;
  };
}

export class TelegramBotService {
  private lastUpdateId: number = 0;
  private pollingInterval: Timer | null = null;
  private isPolling: boolean = false;
  private allowedChatIds: Set<string>;

  constructor(
    private readonly botToken: string | undefined,
    allowedChatIds: string | undefined,
    private readonly getState: () => MonitorState
  ) {
    // Parse comma-separated chat IDs into a Set
    this.allowedChatIds = new Set(
      allowedChatIds
        ?.split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0) || []
    );
  }

  /**
   * Start polling for bot commands
   */
  start(): void {
    if (!this.isConfigured()) {
      console.log('ℹ️  Telegram bot commands disabled (no credentials)');
      return;
    }

    if (this.allowedChatIds.size === 0) {
      console.log('🤖 Telegram bot commands enabled (PUBLIC MODE)');
      console.log('   ⚠️  No whitelist configured - anyone can use commands');
    } else {
      console.log('🤖 Telegram bot commands enabled (WHITELIST MODE)');
      console.log(`   Allowed chat IDs: ${Array.from(this.allowedChatIds).join(', ')}`);
    }
    console.log('   Available commands: /status, /help');

    this.isPolling = true;
    this.poll();
  }

  /**
   * Stop polling
   */
  stop(): void {
    this.isPolling = false;
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Check if bot is configured
   */
  isConfigured(): boolean {
    return !!this.botToken;
  }

  /**
   * Poll for updates
   */
  private async poll(): Promise<void> {
    if (!this.isPolling) return;

    try {
      const updates = await this.getUpdates();

      for (const update of updates) {
        await this.handleUpdate(update);
      }
    } catch (error) {
      console.error('❌ Error polling Telegram updates:', error);
    }

    // Continue polling every 2 seconds
    this.pollingInterval = setTimeout(() => this.poll(), 2000);
  }

  /**
   * Get updates from Telegram
   */
  private async getUpdates(): Promise<TelegramUpdate[]> {
    const url = `https://api.telegram.org/bot${this.botToken}/getUpdates`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offset: this.lastUpdateId + 1,
        timeout: 1,
        allowed_updates: ['message'],
      }),
    });

    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      this.lastUpdateId = data.result[data.result.length - 1].update_id;
      return data.result;
    }

    return [];
  }

  /**
   * Handle an update
   */
  private async handleUpdate(update: TelegramUpdate): Promise<void> {
    const message = update.message;
    if (!message || !message.text || !message.from) return;

    const chatId = message.chat.id.toString();

    // Check whitelist (if configured)
    if (this.allowedChatIds.size > 0 && !this.allowedChatIds.has(chatId)) {
      console.log(`⚠️  Ignored command from unauthorized chat: ${chatId}`);
      await this.sendMessage(
        message.chat.id,
        '🔒 Access denied. This bot is restricted to authorized users only.'
      );
      return;
    }

    const text = message.text.trim();
    const command = (text.split(' ')[0] || '').toLowerCase();
    const userName = message.from.first_name;

    console.log(`📨 Received command: ${command} from ${userName} (chat: ${chatId})`);

    switch (command) {
      case '/status':
        await this.handleStatusCommand(message.chat.id);
        break;
      case '/help':
      case '/start':
        await this.handleHelpCommand(message.chat.id);
        break;
      default:
        await this.sendMessage(
          message.chat.id,
          '❓ Unknown command. Use /help to see available commands.'
        );
    }
  }

  /**
   * Handle /status command
   */
  private async handleStatusCommand(chatId: number): Promise<void> {
    const state = this.getState();

    if (state.servers.size === 0) {
      await this.sendMessage(chatId, '⚠️ No servers are being monitored yet.');
      return;
    }

    let message = '📊 <b>Current Server Status</b>\n\n';

    for (const [serverName, serverState] of state.servers.entries()) {
      const status = serverState.lastStatus;

      if (!status) {
        message += `<b>${serverName}</b>\n`;
        message += '   Status: No data yet\n\n';
        continue;
      }

      const transferStatus = status.canTransferTo ? '✅ Open' : '🔒 Locked';
      const transferFromStatus = status.canTransferFrom ? '✅ Open' : '🔒 Locked';
      const charCreationStatus = status.canCreateCharacter ? '✅ Open' : '🔒 Locked';

      message += `<b>${serverName}</b>\n`;
      message += `   Status: ${status.status}\n`;
      message += `   Region: ${status.region}\n`;
      message += `   Population: ${status.population}\n`;
      message += `   Queue: ${status.queue.toLocaleString()}\n`;
      message += `   Wait Time: ${status.waitTime}\n`;
      message += `   Transfer TO: ${transferStatus}\n`;
      message += `   Transfer FROM: ${transferFromStatus}\n`;
      message += `   Char Creation: ${charCreationStatus}\n`;
      message += `   Last Update: ${status.timestamp.toLocaleString()}\n\n`;
    }

    message += `🕐 <i>Global last check: ${state.lastCheckTime.toLocaleString()}</i>\n`;
    message += `📈 Total checks: ${state.globalStats.totalChecksPerformed}`;

    await this.sendMessage(chatId, message);
  }

  /**
   * Handle /help command
   */
  private async handleHelpCommand(chatId: number): Promise<void> {
    const message = `
🤖 <b>New World Server Monitor Bot</b>

<b>Available Commands:</b>

/status - Get current status of all monitored servers
/help - Show this help message

<b>About:</b>
This bot monitors New World server status and sends automatic notifications when configured events occur (transfers, queue thresholds, etc.).

You'll receive notifications automatically based on your configuration in config.json.
    `.trim();

    await this.sendMessage(chatId, message);
  }

  /**
   * Send a message to a chat
   */
  private async sendMessage(chatId: number, text: string): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        console.log('✅ Bot response sent');
        return true;
      } else {
        console.error('❌ Telegram API error:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending bot message:', error);
      return false;
    }
  }
}
