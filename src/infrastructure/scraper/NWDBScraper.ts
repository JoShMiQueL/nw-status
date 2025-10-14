/**
 * NWDB Scraper Implementation
 * Scrapes server status from nwdb.info
 */

import puppeteer, { type Browser, type Page } from 'puppeteer';
import type { IServerScraper } from '../../domain/interfaces';
import type { ServerStatus } from '../../domain/types';
import { ServerState, PopulationLevel } from '../../domain/types';

export class NWDBScraper implements IServerScraper {
  private browser: Browser | null = null;
  private readonly url = 'https://nwdb.info/server-status';
  private readonly maxRetries = 2;

  async fetchServerStatus(serverName: string): Promise<ServerStatus | null> {
    let browser: Browser | null = null;
    let page: Page | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`🔄 Retry attempt ${attempt}/${this.maxRetries} for ${serverName}...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        browser = await this.launchBrowser();
        page = await this.createPage(browser);
        
        await page.goto(this.url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        await page.waitForSelector('table.table tbody tr', { timeout: 45000 });

        const serverData = await this.extractServerData(page, serverName);

        await page.close();
        await browser.close();

        return serverData;
      } catch (error) {
        console.error(`❌ Error on attempt ${attempt}:`, error instanceof Error ? error.message : error);

        await this.cleanup(page, browser);

        if (attempt === this.maxRetries) {
          break;
        }
      }
    }

    console.error(`❌ Failed to fetch ${serverName} after all retries`);
    return null;
  }

  async fetchAllServers(): Promise<ServerStatus[]> {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      browser = await this.launchBrowser();
      page = await this.createPage(browser);

      await page.goto(this.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      await page.waitForSelector('table.table tbody tr', { timeout: 45000 });

      const servers = await this.extractAllServers(page);

      await page.close();
      await browser.close();

      return servers;
    } catch (error) {
      console.error('❌ Error fetching all servers:', error instanceof Error ? error.message : error);
      await this.cleanup(page, browser);
      return [];
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async launchBrowser(): Promise<Browser> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    return browser;
  }

  private async createPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    return page;
  }

  private async extractServerData(page: Page, serverName: string): Promise<ServerStatus | null> {
    const serverData = await page.evaluate((name: string) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));

      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));
        const serverNameCell = cells[1]?.textContent?.trim();

        if (serverNameCell === name) {
          const infoCell = cells[2];
          
          return {
            name: serverNameCell,
            status: cells[0]?.textContent?.trim() || '',
            worldSet: cells[3]?.textContent?.trim() || '',
            region: cells[4]?.textContent?.trim() || '',
            population: cells[5]?.textContent?.trim() || '',
            queue: cells[6]?.textContent?.trim() || '0',
            waitTime: cells[7]?.textContent?.trim() || 'N/A',
            canTransferTo: !infoCell?.querySelector('.flag-is-transfer-disabled'),
            canTransferFrom: !infoCell?.querySelector('.flag-is-transfer-from-disabled'),
            canCreateCharacter: !infoCell?.querySelector('.flag-is-character-creation-disabled'),
            isFreshStart: !!infoCell?.querySelector('.flag-is-fresh-start'),
            isReturnToAeternum: !!infoCell?.querySelector('.flag-is-return-to-aeternum')
          };
        }
      }

      return null;
    }, serverName);

    if (!serverData) {
      return null;
    }

    return this.parseServerData(serverData);
  }

  private async extractAllServers(page: Page): Promise<ServerStatus[]> {
    const serversData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const infoCell = cells[2];
        
        return {
          name: cells[1]?.textContent?.trim() || '',
          status: cells[0]?.textContent?.trim() || '',
          worldSet: cells[3]?.textContent?.trim() || '',
          region: cells[4]?.textContent?.trim() || '',
          population: cells[5]?.textContent?.trim() || '',
          queue: cells[6]?.textContent?.trim() || '0',
          waitTime: cells[7]?.textContent?.trim() || 'N/A',
          canTransferTo: !infoCell?.querySelector('.flag-is-transfer-disabled'),
          canTransferFrom: !infoCell?.querySelector('.flag-is-transfer-from-disabled'),
          canCreateCharacter: !infoCell?.querySelector('.flag-is-character-creation-disabled'),
          isFreshStart: !!infoCell?.querySelector('.flag-is-fresh-start'),
          isReturnToAeternum: !!infoCell?.querySelector('.flag-is-return-to-aeternum')
        };
      });
    });

    return serversData
      .filter(data => data.name)
      .map(data => this.parseServerData(data));
  }

  private parseServerData(rawData: any): ServerStatus {
    return {
      name: rawData.name,
      status: this.parseServerState(rawData.status),
      worldSet: rawData.worldSet,
      region: rawData.region,
      population: this.parsePopulation(rawData.population),
      queue: this.parseQueue(rawData.queue),
      waitTime: rawData.waitTime,
      canTransferTo: rawData.canTransferTo,
      canTransferFrom: rawData.canTransferFrom,
      canCreateCharacter: rawData.canCreateCharacter,
      isFreshStart: rawData.isFreshStart,
      isReturnToAeternum: rawData.isReturnToAeternum,
      timestamp: new Date()
    };
  }

  private parseServerState(status: string): ServerState {
    const normalized = status.toLowerCase();
    if (normalized.includes('online')) return ServerState.ONLINE;
    if (normalized.includes('offline')) return ServerState.OFFLINE;
    if (normalized.includes('maintenance')) return ServerState.MAINTENANCE;
    return ServerState.UNKNOWN;
  }

  private parsePopulation(population: string): PopulationLevel {
    const normalized = population.toLowerCase();
    if (normalized === 'low') return PopulationLevel.LOW;
    if (normalized === 'medium') return PopulationLevel.MEDIUM;
    if (normalized === 'high') return PopulationLevel.HIGH;
    if (normalized === 'full') return PopulationLevel.FULL;
    return PopulationLevel.UNKNOWN;
  }

  private parseQueue(queue: string): number {
    const cleaned = queue.replace(/,/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  private async cleanup(page: Page | null, browser: Browser | null): Promise<void> {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // Ignore
      }
    }

    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore
      }
    }
  }
}
