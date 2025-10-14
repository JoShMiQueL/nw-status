/**
 * Domain Interfaces - Contracts for infrastructure implementations
 */

import type { ServerStatus, MonitorState, NotificationPayload, ServerStatistics } from './types';

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
 * Interface for configuration management
 */
export interface IConfigService {
  get<T>(key: string): T;
  getServers(): string[];
  getCheckInterval(): number;
  isFeatureEnabled(feature: string): boolean;
}
