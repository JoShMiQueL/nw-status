/**
 * Configuration Service
 * Manages application configuration from environment variables
 */

import type { IConfigService } from '../domain/interfaces';

export class ConfigService implements IConfigService {
  private config: Map<string, any>;

  constructor() {
    this.config = new Map();
    this.loadConfig();
  }

  get<T>(key: string): T {
    return this.config.get(key) as T;
  }

  getServers(): string[] {
    const serversEnv = this.get<string>('SERVERS');
    if (!serversEnv) {
      return ['Nysa']; // Default server
    }
    return serversEnv.split(',').map(s => s.trim()).filter(Boolean);
  }

  getCheckInterval(): number {
    return this.get<number>('CHECK_INTERVAL') || 300000;
  }

  isFeatureEnabled(feature: string): boolean {
    const key = `FEATURE_${feature.toUpperCase()}`;
    return this.get<string>(key) === 'true';
  }

  private loadConfig(): void {
    // Telegram
    this.config.set('TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN);
    this.config.set('TELEGRAM_CHAT_ID', process.env.TELEGRAM_CHAT_ID);

    // Webhook
    this.config.set('WEBHOOK_URL', process.env.WEBHOOK_URL);

    // Monitoring
    this.config.set('SERVERS', process.env.SERVERS);
    this.config.set('CHECK_INTERVAL', parseInt(process.env.CHECK_INTERVAL || '300000'));

    // Features
    this.config.set('FEATURE_STATISTICS', process.env.FEATURE_STATISTICS || 'true');
    this.config.set('FEATURE_HISTORY', process.env.FEATURE_HISTORY || 'true');
    this.config.set('FEATURE_QUEUE_ALERTS', process.env.FEATURE_QUEUE_ALERTS || 'false');
    this.config.set('QUEUE_THRESHOLD', parseInt(process.env.QUEUE_THRESHOLD || '1000'));

    // Storage
    this.config.set('STATE_FILE', process.env.STATE_FILE);
    this.config.set('HISTORY_FILE', process.env.HISTORY_FILE);
  }
}
