/**
 * JSON History Repository
 * Stores historical server status data using Bun's native file API
 */

import { join } from 'node:path';
import type { IHistoryRepository } from '../../domain/interfaces';
import type { ServerStatistics, ServerStatus, StatusHistoryEntry } from '../../domain/types';
import { ServerState } from '../../domain/types';

interface HistoryData {
  [serverName: string]: StatusHistoryEntry[];
}

export class JsonHistoryRepository implements IHistoryRepository {
  private readonly historyFile: string;
  private readonly maxHistoryEntries = 1000;

  constructor(filePath?: string) {
    this.historyFile = filePath || join(process.cwd(), 'data', 'history.json');
  }

  async saveStatus(status: ServerStatus): Promise<void> {
    try {
      const history = await this.loadHistory();

      if (!history[status.name]) {
        history[status.name] = [];
      }

      const entry: StatusHistoryEntry = {
        timestamp: status.timestamp,
        status: status.status,
        queue: status.queue,
        population: status.population,
        canTransferTo: status.canTransferTo,
      };

      // Initialize or get existing history
      const serverHistory = history[status.name] || [];
      serverHistory.push(entry);

      // Keep only last N entries
      if (serverHistory.length > this.maxHistoryEntries) {
        history[status.name] = serverHistory.slice(-this.maxHistoryEntries);
      } else {
        history[status.name] = serverHistory;
      }

      await this.saveHistory(history);
    } catch (error) {
      console.error('❌ Error saving history:', error instanceof Error ? error.message : error);
    }
  }

  async getHistory(serverName: string, limit: number = 100): Promise<ServerStatus[]> {
    try {
      const history = await this.loadHistory();
      const entries = history[serverName] || [];

      return entries
        .slice(-limit)
        .map((entry: StatusHistoryEntry) => this.entryToServerStatus(serverName, entry));
    } catch (error) {
      console.error('❌ Error loading history:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getStatistics(serverName: string): Promise<ServerStatistics | null> {
    try {
      const history = await this.loadHistory();
      const entries = history[serverName];

      if (!entries || entries.length === 0) {
        return null;
      }

      const queues = entries.map((e: StatusHistoryEntry) => e.queue);
      const onlineEntries = entries.filter(
        (e: StatusHistoryEntry) => e.status === ServerState.ONLINE
      );
      const transferAvailable = entries.filter((e: StatusHistoryEntry) => e.canTransferTo);

      const lastOnlineEntry = [...entries]
        .reverse()
        .find((e: StatusHistoryEntry) => e.status === ServerState.ONLINE);
      const lastOfflineEntry = entries.find(
        (e: StatusHistoryEntry) => e.status === ServerState.OFFLINE
      );

      return {
        serverName,
        totalChecks: entries.length,
        averageQueue: queues.reduce((a: number, b: number) => a + b, 0) / queues.length,
        maxQueue: Math.max(...queues),
        minQueue: Math.min(...queues),
        uptimePercentage: (onlineEntries.length / entries.length) * 100,
        transferAvailabilityPercentage: (transferAvailable.length / entries.length) * 100,
        lastOnline: lastOnlineEntry ? new Date(lastOnlineEntry.timestamp) : new Date(),
        lastOffline: lastOfflineEntry ? new Date(lastOfflineEntry.timestamp) : null,
        statusHistory: entries.slice(-50), // Last 50 entries
      };
    } catch (error) {
      console.error(
        '❌ Error calculating statistics:',
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }

  async clearHistory(serverName: string): Promise<void> {
    try {
      const history = await this.loadHistory();
      delete history[serverName];
      await this.saveHistory(history);
    } catch (error) {
      console.error('❌ Error clearing history:', error instanceof Error ? error.message : error);
    }
  }

  private async loadHistory(): Promise<HistoryData> {
    try {
      const file = Bun.file(this.historyFile);
      if (await file.exists()) {
        const data = await file.text();
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn(
        '⚠️ Could not load history file:',
        error instanceof Error ? error.message : error
      );
    }

    return {};
  }

  private async saveHistory(history: HistoryData): Promise<void> {
    try {
      await Bun.write(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error(
        '❌ Could not save history file:',
        error instanceof Error ? error.message : error
      );
    }
  }

  private entryToServerStatus(serverName: string, entry: StatusHistoryEntry): ServerStatus {
    return {
      name: serverName,
      status: entry.status,
      worldSet: '',
      region: '',
      population: entry.population,
      queue: entry.queue,
      waitTime: 'N/A',
      canTransferTo: entry.canTransferTo,
      canTransferFrom: false,
      canCreateCharacter: false,
      isFreshStart: false,
      isReturnToAeternum: false,
      timestamp: new Date(entry.timestamp),
    };
  }
}
