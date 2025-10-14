/**
 * Domain Interfaces - Contracts for infrastructure implementations
 */

import type { EventConfiguration } from './events';
import type { MonitorState, NotificationPayload, ServerStatistics, ServerStatus } from './types';

/**
 * Interface for scraping server status from external sources
 */
export interface IServerScraper {
  fetchServerStatus(serverName: string): Promise<ServerStatus | null>;
  fetchAllServers(): Promise<ServerStatus[]>;
  close(): Promise<void>;
}

/**
 * Interface for sending notifications through different channels
 */
export interface INotificationService {
  send(payload: NotificationPayload): Promise<boolean>;
  isConfigured(): boolean;
}

/**
 * Interface for persisting application state
 */
export interface IStateRepository {
  load(): Promise<MonitorState | null>;
  save(state: MonitorState): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Interface for storing historical data
 */
export interface IHistoryRepository {
  saveStatus(status: ServerStatus): Promise<void>;
  getHistory(serverName: string, limit?: number): Promise<ServerStatus[]>;
  getStatistics(serverName: string): Promise<ServerStatistics | null>;
  clearHistory(serverName: string): Promise<void>;
}

/**
 * Server configuration with individual events
 */
export interface ServerConfiguration {
  name: string;
  enabled: boolean;
  events: EventConfiguration;
}

/**
 * Interface for configuration management
 */
export interface IConfigService {
  get<T>(key: string): T;
  getServers(): ServerConfiguration[];
  getCheckInterval(): number;
  isFeatureEnabled(feature: string): boolean;
  getEventConfiguration(serverName: string): EventConfiguration;
}
