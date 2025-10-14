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
import type { DetectedEvent } from '../../domain/events';
import { EventEvaluator } from '../../domain/EventEvaluator';

export class MonitorServerUseCase {
  private readonly eventEvaluator: EventEvaluator;

  constructor(
    private readonly scraper: IServerScraper,
    private readonly notificationService: INotificationService,
    private readonly stateRepository: IStateRepository,
    private readonly historyRepository: IHistoryRepository,
    private readonly config: IConfigService
  ) {
    this.eventEvaluator = new EventEvaluator();
  }

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

    // Evaluate events using configured triggers for this specific server
    const eventConfig = this.config.getEventConfiguration(serverName);
    const detectedEvents = this.eventEvaluator.evaluate(
      eventConfig.triggers,
      status,
      serverState.lastStatus
    );

    // Send notifications for detected events
    await this.notifyDetectedEvents(detectedEvents, status, state);

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

  private async notifyDetectedEvents(
    events: DetectedEvent[],
    currentStatus: ServerStatus,
    state: MonitorState
  ): Promise<void> {
    for (const event of events) {
      const notificationType = this.mapEventToNotificationType(event);
      
      const payload: NotificationPayload = {
        type: notificationType,
        serverName: event.serverName,
        message: event.message,
        data: currentStatus,
        timestamp: event.timestamp
      };

      const sent = await this.notificationService.send(payload);
      if (sent) {
        state.globalStats.totalNotificationsSent++;
        console.log(`📧 Notification sent: ${event.message}`);
      }
    }
  }

  private mapEventToNotificationType(event: DetectedEvent): NotificationType {
    // Map event types to notification types
    switch (event.trigger.type) {
      case 'transfer_to_change':
        return event.currentValue 
          ? NotificationType.TRANSFER_AVAILABLE 
          : NotificationType.TRANSFER_LOCKED;
      
      case 'server_status_change':
        return event.currentValue === ServerState.ONLINE
          ? NotificationType.SERVER_ONLINE
          : NotificationType.SERVER_OFFLINE;
      
      case 'queue_change':
        return NotificationType.QUEUE_THRESHOLD;
      
      default:
        return NotificationType.MONITORING_STARTED;
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
