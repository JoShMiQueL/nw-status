/**
 * JSON State Repository
 * Persists monitor state to a JSON file using Bun's native file API
 */

import { join, dirname } from 'path';
import type { IStateRepository } from '../../domain/interfaces';
import type { MonitorState, ServerMonitorState } from '../../domain/types';

export class JsonStateRepository implements IStateRepository {
  private readonly stateFile: string;

  constructor(filePath?: string) {
    this.stateFile = filePath || join(process.cwd(), 'data', 'monitor-state.json');
  }

  async load(): Promise<MonitorState | null> {
    try {
      const file = Bun.file(this.stateFile);
      
      if (await file.exists()) {
        const data = await file.text();
        const parsed = JSON.parse(data);
        
        // Convert plain objects back to Map
        const servers = new Map<string, ServerMonitorState>();
        if (parsed.servers) {
          for (const [key, value] of Object.entries(parsed.servers)) {
            servers.set(key, value as ServerMonitorState);
          }
        }

        return {
          servers,
          globalStats: parsed.globalStats,
          lastCheckTime: new Date(parsed.lastCheckTime)
        };
      }
    } catch (error) {
      console.warn('⚠️ Could not load state file:', error instanceof Error ? error.message : error);
    }

    return null;
  }

  async save(state: MonitorState): Promise<void> {
    try {
      // Convert Map to plain object for JSON serialization
      const serializable = {
        servers: Object.fromEntries(state.servers),
        globalStats: state.globalStats,
        lastCheckTime: state.lastCheckTime.toISOString()
      };

      // Bun.write automatically creates parent directories
      await Bun.write(this.stateFile, JSON.stringify(serializable, null, 2));
    } catch (error) {
      console.error('❌ Could not save state file:', error instanceof Error ? error.message : error);
    }
  }

  async clear(): Promise<void> {
    try {
      const file = Bun.file(this.stateFile);
      if (await file.exists()) {
        await Bun.write(this.stateFile, '{}');
      }
    } catch (error) {
      console.error('❌ Could not clear state file:', error instanceof Error ? error.message : error);
    }
  }
}
