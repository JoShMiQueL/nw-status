/**
 * Monitor Server Use Case
 * Core business logic for monitoring server status
 */

import type {
  IServerScraper,
  INotificationService,
  IStateRepository,
  IHistoryRepository,
  IConfigService
} from '../../domain/interfaces';
import type { ServerStatus, MonitorState, ServerMonitorState, NotificationPayload } from '../../domain/types';
import { NotificationType, ServerState } from '../../domain/types';

export class MonitorServerUseCase {
  constructor(
    private readonly scraper: IServerScraper,
    private readonly notificationService: INotificationService,
    private readonly stateRepository: IStateRepository,
    private readonly historyRepository: IHistoryRepository,
    private readonly config: IConfigService
  ) {}

  async execute(serverName: string, state: MonitorState): Promise<void> {
    console.log(`🔍 Checking ${serverName}...`);

    const status = await this.scraper.fetchServerStatus(serverName);

    if (!status) {
      console.log(`⚠️  ${serverName} not found or error occurred`);
      return;
    }

    // Display status
    this.displayStatus(status);

    // Save to history if feature enabled
    if (this.config.isFeatureEnabled('history')) {
      await this.historyRepository.saveStatus(status);
    }

    // Get or create server state
    let serverState = state.servers.get(serverName);
    if (!serverState) {
      serverState = this.createInitialServerState(serverName);
      state.servers.set(serverName, serverState);
    }

    // Check for changes and send notifications
    await this.checkAndNotify(status, serverState);

    // Update state
    serverState.lastStatus = status;
    serverState.lastTransferStatus = status.canTransferTo;

    // Update statistics
    if (this.config.isFeatureEnabled('statistics')) {
      await this.updateStatistics(serverState);
    }

    // Update global stats
    state.globalStats.totalChecksPerformed++;
    state.lastCheckTime = new Date();

    // Save state
    await this.stateRepository.save(state);
  }

  private async checkAndNotify(status: ServerStatus, serverState: ServerMonitorState): Promise<void> {
    const lastStatus = serverState.lastStatus;
    const lastTransferStatus = serverState.lastTransferStatus;

    // First check
    if (lastTransferStatus === null) {
      await this.sendNotification({
        type: NotificationType.MONITORING_STARTED,
        serverName: status.name,
        message: 'Monitoring started',
        data: status,
        timestamp: new Date()
      });
      return;
    }

    // Transfer status changed
    if (lastTransferStatus !== status.canTransferTo) {
      const type = status.canTransferTo
        ? NotificationType.TRANSFER_AVAILABLE
        : NotificationType.TRANSFER_LOCKED;

      await this.sendNotification({
        type,
        serverName: status.name,
        message: status.canTransferTo
          ? 'Server is now available for transfer'
          : 'Server is now locked for transfer',
        data: status,
        timestamp: new Date()
      });
    }

    // Server status changed
    if (lastStatus && lastStatus.status !== status.status) {
      if (status.status === ServerState.ONLINE && lastStatus.status !== ServerState.ONLINE) {
        await this.sendNotification({
          type: NotificationType.SERVER_ONLINE,
          serverName: status.name,
          message: 'Server is now online',
          data: status,
          timestamp: new Date()
        });
      } else if (status.status === ServerState.OFFLINE) {
        await this.sendNotification({
          type: NotificationType.SERVER_OFFLINE,
          serverName: status.name,
          message: 'Server is offline',
          data: status,
          timestamp: new Date()
        });
      }
    }

    // Queue threshold alert
    if (this.config.isFeatureEnabled('queue_alerts')) {
      const threshold = this.config.get<number>('QUEUE_THRESHOLD');
      if (status.queue >= threshold && (!lastStatus || lastStatus.queue < threshold)) {
        await this.sendNotification({
          type: NotificationType.QUEUE_THRESHOLD,
          serverName: status.name,
          message: `Queue exceeded threshold: ${status.queue}`,
          data: status,
          timestamp: new Date()
        });
      }
    }
  }

  private async sendNotification(payload: NotificationPayload): Promise<void> {
    const sent = await this.notificationService.send(payload);
    if (sent) {
      // Increment notification counter (would need to pass state here)
    }
  }

  private displayStatus(status: ServerStatus): void {
    console.log('\n📊 Server Status:');
    console.log(`   Name: ${status.name}`);
    console.log(`   Status: ${status.status}`);
    console.log(`   Region: ${status.region}`);
    console.log(`   Population: ${status.population}`);
    console.log(`   Queue: ${status.queue.toLocaleString()}`);
    console.log(`   Wait Time: ${status.waitTime}`);
    console.log(`   Can Transfer: ${status.canTransferTo ? 'YES ✅' : 'NO 🔒'}`);
    
    if (status.isFreshStart) {
      console.log(`   🆕 Fresh Start World`);
    }
    if (status.isReturnToAeternum) {
      console.log(`   🔄 Return to Aeternum World`);
    }
  }

  private createInitialServerState(serverName: string): ServerMonitorState {
    return {
      serverName,
      lastStatus: null,
      lastTransferStatus: null,
      statistics: {
        serverName,
        totalChecks: 0,
        averageQueue: 0,
        maxQueue: 0,
        minQueue: 0,
        uptimePercentage: 0,
        transferAvailabilityPercentage: 0,
        lastOnline: new Date(),
        lastOffline: null,
        statusHistory: []
      }
    };
  }

  private async updateStatistics(serverState: ServerMonitorState): Promise<void> {
    const stats = await this.historyRepository.getStatistics(serverState.serverName);
    if (stats) {
      serverState.statistics = stats;
    }
  }
}
