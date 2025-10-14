/**
 * Composite Notification Service
 * Sends notifications through multiple channels
 */

import type { INotificationService } from '../../domain/interfaces';
import type { NotificationPayload } from '../../domain/types';

export class CompositeNotificationService implements INotificationService {
  constructor(private readonly services: INotificationService[]) {}

  async send(payload: NotificationPayload): Promise<boolean> {
    const configuredServices = this.services.filter(s => s.isConfigured());

    if (configuredServices.length === 0) {
      console.warn('⚠️ No notification services configured');
      return false;
    }

    const results = await Promise.allSettled(
      configuredServices.map(service => service.send(payload))
    );

    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value === true
    ).length;

    return successCount > 0;
  }

  isConfigured(): boolean {
    return this.services.some(s => s.isConfigured());
  }
}
