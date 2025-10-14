/**
 * Webhook Notification Service
 * Sends notifications to custom webhook endpoints
 */

import type { INotificationService } from '../../domain/interfaces';
import type { NotificationPayload } from '../../domain/types';

export class WebhookNotificationService implements INotificationService {
  constructor(private readonly webhookUrl: string | undefined) {}

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!this.isConfigured() || !this.webhookUrl) {
      console.error('❌ Webhook URL not configured');
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: payload.type,
          server: payload.serverName,
          message: payload.message,
          data: payload.data,
          timestamp: payload.timestamp.toISOString(),
        }),
      });

      if (response.ok) {
        console.log('✅ Webhook notification sent');
        return true;
      } else {
        console.error('❌ Webhook error:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending webhook notification:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!this.webhookUrl;
  }
}
