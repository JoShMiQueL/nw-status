/**
 * Configuration Service
 * Manages application configuration from config.json and .env
 */

import type { IConfigService, ServerConfiguration } from '../domain/interfaces';
import type { EventConfiguration, AnyEventTrigger } from '../domain/events';
import { EventType, DEFAULT_EVENT_CONFIG } from '../domain/events';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ServerConfig {
  name: string;
  enabled?: boolean;
  description?: string;
  events: EventConfiguration;
}

interface AppConfig {
  servers: ServerConfig[];
  checkInterval?: number;
  features?: {
    statistics?: boolean;
    history?: boolean;
  };
  storage?: {
    stateFile?: string;
    historyFile?: string;
  };
}

export class ConfigService implements IConfigService {
  private config: Map<string, any>;
  private appConfig: AppConfig;

  constructor(configPath: string = 'config.json') {
    this.config = new Map();
    this.appConfig = this.loadAppConfig(configPath);
    this.loadEnvConfig();
  }

  private loadAppConfig(configPath: string): AppConfig {
    const fullPath = join(process.cwd(), configPath);
    
    if (!existsSync(fullPath)) {
      console.warn(`⚠️  Config file not found: ${configPath}`);
      console.warn('   Using default configuration');
      return {
        servers: [{
          name: 'Nysa',
          enabled: true,
          events: DEFAULT_EVENT_CONFIG
        }],
        checkInterval: 300000,
        features: { statistics: true, history: true },
        storage: { stateFile: 'data/state.json', historyFile: 'data/history.json' }
      };
    }

    try {
      const content = readFileSync(fullPath, 'utf-8');
      const config = JSON.parse(content) as AppConfig;
      
      // Validate required fields
      if (!config.servers || !Array.isArray(config.servers) || config.servers.length === 0) {
        throw new Error('Invalid config: servers must be a non-empty array');
      }
      
      // Validate each server has required fields
      for (const server of config.servers) {
        if (!server.name || typeof server.name !== 'string') {
          throw new Error('Invalid config: each server must have a name');
        }
        if (!server.events || !server.events.triggers) {
          throw new Error(`Invalid config: server ${server.name} must have events.triggers`);
        }
      }

      return config;
    } catch (error) {
      console.error(`❌ Error loading config file: ${error}`);
      console.warn('   Using default configuration');
      return {
        servers: [{
          name: 'Nysa',
          enabled: true,
          events: DEFAULT_EVENT_CONFIG
        }],
        checkInterval: 300000,
        features: { statistics: true, history: true },
        storage: { stateFile: 'data/state.json', historyFile: 'data/history.json' }
      };
    }
  }

  get<T>(key: string): T {
    return this.config.get(key) as T;
  }

  getServers(): ServerConfiguration[] {
    return this.appConfig.servers
      .filter(server => server.enabled !== false)
      .map(server => ({
        name: server.name,
        enabled: server.enabled !== false,
        events: server.events
      }));
  }

  getCheckInterval(): number {
    return this.appConfig.checkInterval || 300000;
  }

  isFeatureEnabled(feature: string): boolean {
    const features = this.appConfig.features || {};
    if (feature === 'statistics') return features.statistics !== false;
    if (feature === 'history') return features.history !== false;
    return false;
  }

  getEventConfiguration(serverName: string): EventConfiguration {
    const server = this.appConfig.servers.find(s => s.name === serverName);
    if (!server) {
      console.warn(`⚠️  Server ${serverName} not found in config, using defaults`);
      return DEFAULT_EVENT_CONFIG;
    }
    return server.events;
  }

  private loadEnvConfig(): void {
    // Only load sensitive credentials from .env
    this.config.set('TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN);
    this.config.set('TELEGRAM_CHAT_IDS', process.env.TELEGRAM_CHAT_IDS);
    this.config.set('WEBHOOK_URL', process.env.WEBHOOK_URL);

    // Storage paths (with fallback to config.json)
    const storage = this.appConfig.storage || {};
    this.config.set('STATE_FILE', process.env.STATE_FILE || storage.stateFile || 'data/state.json');
    this.config.set('HISTORY_FILE', process.env.HISTORY_FILE || storage.historyFile || 'data/history.json');
  }
}
