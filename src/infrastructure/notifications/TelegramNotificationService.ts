/**
 * Telegram Notification Service
 */

import type { INotificationService } from '../../domain/interfaces';
import type { NotificationPayload } from '../../domain/types';
import { NotificationType } from '../../domain/types';

export class TelegramNotificationService implements INotificationService {
  constructor(
    private readonly botToken: string | undefined,
    private readonly chatId: string | undefined
  ) {}

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('❌ Telegram credentials not configured');
      return false;
    }

    try {
      const message = this.formatMessage(payload);
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        console.log('✅ Telegram notification sent');
        return true;
      } else {
        console.error('❌ Telegram API error:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!(this.botToken && this.chatId);
  }

  private formatMessage(payload: NotificationPayload): string {
    const { type, serverName, data } = payload;
    const emoji = this.getEmojiForType(type);
    const transferStatus = data.canTransferTo ? '✅ Available' : '🔒 Locked';

    let header = '';
    switch (type) {
      case NotificationType.TRANSFER_AVAILABLE:
        header = '🎉 <b>Server Transfer Available!</b>';
        break;
      case NotificationType.TRANSFER_LOCKED:
        header = '⚠️ <b>Server Transfer Locked</b>';
        break;
      case NotificationType.SERVER_ONLINE:
        header = '✅ <b>Server Online</b>';
        break;
      case NotificationType.SERVER_OFFLINE:
        header = '❌ <b>Server Offline</b>';
        break;
      case NotificationType.QUEUE_THRESHOLD:
        header = '⏳ <b>Queue Alert</b>';
        break;
      case NotificationType.MONITORING_STARTED:
        header = '🔍 <b>Monitoring Started</b>';
        break;
      default:
        header = `${emoji} <b>Server Update</b>`;
    }

    return `
${header}

<b>Server:</b> ${serverName}
<b>Status:</b> ${data.status}
<b>Region:</b> ${data.region}
<b>World Set:</b> ${data.worldSet}
<b>Population:</b> ${data.population}
<b>Queue:</b> ${data.queue.toLocaleString()}
<b>Wait Time:</b> ${data.waitTime}
<b>Transfer:</b> ${transferStatus}

🕐 ${new Date().toLocaleString()}
    `.trim();
  }

  private getEmojiForType(type: NotificationType): string {
    const emojiMap: Record<NotificationType, string> = {
      [NotificationType.TRANSFER_AVAILABLE]: '🎉',
      [NotificationType.TRANSFER_LOCKED]: '⚠️',
      [NotificationType.SERVER_ONLINE]: '✅',
      [NotificationType.SERVER_OFFLINE]: '❌',
      [NotificationType.QUEUE_THRESHOLD]: '⏳',
      [NotificationType.MONITORING_STARTED]: '🔍',
      [NotificationType.ERROR]: '❌',
    };

    return emojiMap[type] || '📢';
  }
}
