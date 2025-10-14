/**
 * Get Statistics Use Case
 * Retrieves and displays server statistics
 */

import type { IHistoryRepository } from '../../domain/interfaces';
import type { ServerStatistics } from '../../domain/types';

export class GetStatisticsUseCase {
  constructor(private readonly historyRepository: IHistoryRepository) {}

  async execute(serverName: string): Promise<ServerStatistics | null> {
    const stats = await this.historyRepository.getStatistics(serverName);

    if (!stats) {
      console.log(`⚠️  No statistics available for ${serverName}`);
      return null;
    }

    this.displayStatistics(stats);
    return stats;
  }

  async executeAll(serverNames: string[]): Promise<Map<string, ServerStatistics>> {
    const statsMap = new Map<string, ServerStatistics>();

    console.log('\n📈 Server Statistics Summary\n');
    console.log('='.repeat(80));

    for (const serverName of serverNames) {
      const stats = await this.historyRepository.getStatistics(serverName);
      if (stats) {
        statsMap.set(serverName, stats);
        this.displayCompactStatistics(stats);
      }
    }

    console.log('='.repeat(80));

    return statsMap;
  }

  private displayStatistics(stats: ServerStatistics): void {
    console.log('\n📈 Server Statistics');
    console.log('='.repeat(60));
    console.log(`Server: ${stats.serverName}`);
    console.log(`Total Checks: ${stats.totalChecks}`);
    console.log(`Uptime: ${stats.uptimePercentage.toFixed(2)}%`);
    console.log(`Transfer Availability: ${stats.transferAvailabilityPercentage.toFixed(2)}%`);
    console.log(`\nQueue Statistics:`);
    console.log(`  Average: ${Math.round(stats.averageQueue).toLocaleString()}`);
    console.log(`  Max: ${stats.maxQueue.toLocaleString()}`);
    console.log(`  Min: ${stats.minQueue.toLocaleString()}`);
    console.log(`\nLast Online: ${stats.lastOnline.toLocaleString()}`);
    if (stats.lastOffline) {
      console.log(`Last Offline: ${stats.lastOffline.toLocaleString()}`);
    }
    console.log('='.repeat(60));
  }

  private displayCompactStatistics(stats: ServerStatistics): void {
    console.log(
      `${stats.serverName.padEnd(20)} | ` +
      `Checks: ${String(stats.totalChecks).padStart(5)} | ` +
      `Uptime: ${stats.uptimePercentage.toFixed(1).padStart(5)}% | ` +
      `Transfer: ${stats.transferAvailabilityPercentage.toFixed(1).padStart(5)}% | ` +
      `Avg Queue: ${String(Math.round(stats.averageQueue)).padStart(6)}`
    );
  }
}
