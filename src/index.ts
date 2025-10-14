#!/usr/bin/env bun
/**
 * New World Server Status Monitor
 * Main application entry point
 */

import { ConfigService } from './config/ConfigService';
import { NWDBScraper } from './infrastructure/scraper/NWDBScraper';
import { TelegramNotificationService } from './infrastructure/notifications/TelegramNotificationService';
import { WebhookNotificationService } from './infrastructure/notifications/WebhookNotificationService';
import { CompositeNotificationService } from './infrastructure/notifications/CompositeNotificationService';
import { TelegramBotService } from './infrastructure/bot/TelegramBotService';
import { JsonStateRepository } from './infrastructure/storage/JsonStateRepository';
import { JsonHistoryRepository } from './infrastructure/storage/JsonHistoryRepository';
import { MonitorServerUseCase } from './application/use-cases/MonitorServerUseCase';
import { GetStatisticsUseCase } from './application/use-cases/GetStatisticsUseCase';
import type { MonitorState } from './domain/types';

class ServerMonitorApp {
  private config: ConfigService;
  private scraper: NWDBScraper;
  private notificationService: CompositeNotificationService;
  private botService: TelegramBotService;
  private stateRepository: JsonStateRepository;
  private historyRepository: JsonHistoryRepository;
  private monitorUseCase: MonitorServerUseCase;
  private statsUseCase: GetStatisticsUseCase;
  private state: MonitorState;
  private intervalId: Timer | null = null;

  constructor() {
    this.config = new ConfigService();
    this.scraper = new NWDBScraper();
    
    // Setup notification services
    const chatIds = this.config.get<string>('TELEGRAM_CHAT_IDS');
    const firstChatId = chatIds?.split(',')[0]?.trim(); // Use first chat ID for notifications
    
    const telegram = new TelegramNotificationService(
      this.config.get('TELEGRAM_BOT_TOKEN'),
      firstChatId
    );
    
    const webhook = new WebhookNotificationService(
      this.config.get('WEBHOOK_URL')
    );
    
    this.notificationService = new CompositeNotificationService([telegram, webhook]);
    
    // Setup bot service
    this.botService = new TelegramBotService(
      this.config.get('TELEGRAM_BOT_TOKEN'),
      this.config.get('TELEGRAM_CHAT_IDS'),
      () => this.state
    );
    
    // Setup repositories
    this.stateRepository = new JsonStateRepository(this.config.get('STATE_FILE'));
    this.historyRepository = new JsonHistoryRepository(this.config.get('HISTORY_FILE'));
    
    // Setup use cases
    this.monitorUseCase = new MonitorServerUseCase(
      this.scraper,
      this.notificationService,
      this.stateRepository,
      this.historyRepository,
      this.config
    );
    
    this.statsUseCase = new GetStatisticsUseCase(this.historyRepository);
    
    // Initialize state
    this.state = {
      servers: new Map(),
      globalStats: {
        totalServersMonitored: 0,
        totalChecksPerformed: 0,
        totalNotificationsSent: 0,
        monitoringStartTime: new Date()
      },
      lastCheckTime: new Date()
    };
  }

  async start(): Promise<void> {
    console.log('🚀 New World Server Status Monitor');
    console.log('===================================');
    const servers = this.config.getServers();
    console.log(`📡 Monitoring ${servers.length} server(s):`);
    servers.forEach(server => {
      const triggerCount = server.events.triggers.filter(t => t.enabled).length;
      console.log(`   - ${server.name} (${triggerCount} active triggers)`);
    });
    console.log(`⏱️  Check interval: ${this.config.getCheckInterval() / 1000}s`);
    console.log('===================================\n');

    // Load previous state
    const savedState = await this.stateRepository.load();
    if (savedState) {
      this.state = savedState;
      console.log('📂 Loaded previous state');
    }

    // Update server count
    this.state.globalStats.totalServersMonitored = servers.length;

    // Check notification services
    if (!this.notificationService.isConfigured()) {
      console.warn('⚠️  Warning: No notification services configured');
      console.warn('   Set TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID or WEBHOOK_URL in .env\n');
    }

    // Setup graceful shutdown
    this.setupShutdownHandlers();

    // Start bot service
    this.botService.start();

    // Initial check
    await this.checkAllServers();

    // Setup periodic checks
    this.intervalId = setInterval(
      () => this.checkAllServers(),
      this.config.getCheckInterval()
    );
  }

  private async checkAllServers(): Promise<void> {
    const servers = this.config.getServers();
    
    for (const server of servers) {
      try {
        await this.monitorUseCase.execute(server.name, this.state);
      } catch (error) {
        console.error(`❌ Error monitoring ${server.name}:`, error);
      }
    }

    // Display statistics if enabled
    if (this.config.isFeatureEnabled('statistics')) {
      await this.displayGlobalStats();
    }
  }

  private async displayGlobalStats(): Promise<void> {
    console.log('\n📊 Global Statistics:');
    console.log(`   Total Servers: ${this.state.globalStats.totalServersMonitored}`);
    console.log(`   Total Checks: ${this.state.globalStats.totalChecksPerformed}`);
    console.log(`   Monitoring Since: ${this.state.globalStats.monitoringStartTime.toLocaleString()}`);
    console.log(`   Last Check: ${this.state.lastCheckTime.toLocaleString()}\n`);
  }

  private setupShutdownHandlers(): void {
    const shutdown = async () => {
      console.log('\n\n👋 Shutting down...');
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      
      this.botService.stop();
      await this.scraper.close();
      console.log('💾 State saved');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}

// Start the application
const app = new ServerMonitorApp();
app.start().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
