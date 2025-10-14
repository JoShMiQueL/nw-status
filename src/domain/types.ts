/**
 * Domain Types - Core business entities
 */

export interface ServerStatus {
  name: string;
  status: ServerState;
  worldSet: string;
  region: string;
  population: PopulationLevel;
  queue: number;
  waitTime: string;
  canTransferTo: boolean;
  canTransferFrom: boolean;
  canCreateCharacter: boolean;
  isFreshStart: boolean;
  isReturnToAeternum: boolean;
  timestamp: Date;
}

export enum ServerState {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  MAINTENANCE = 'Maintenance',
  UNKNOWN = 'Unknown',
}

export enum PopulationLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  FULL = 'Full',
  UNKNOWN = '???',
}

export interface ServerStatistics {
  serverName: string;
  totalChecks: number;
  averageQueue: number;
  maxQueue: number;
  minQueue: number;
  uptimePercentage: number;
  transferAvailabilityPercentage: number;
  lastOnline: Date;
  lastOffline: Date | null;
  statusHistory: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  timestamp: Date;
  status: ServerState;
  queue: number;
  population: PopulationLevel;
  canTransferTo: boolean;
}

export interface MonitorState {
  servers: Map<string, ServerMonitorState>;
  globalStats: GlobalStatistics;
  lastCheckTime: Date;
}

export interface ServerMonitorState {
  serverName: string;
  lastStatus: ServerStatus | null;
  lastTransferStatus: boolean | null;
  statistics: ServerStatistics;
}

export interface GlobalStatistics {
  totalServersMonitored: number;
  totalChecksPerformed: number;
  totalNotificationsSent: number;
  monitoringStartTime: Date;
}

export interface NotificationPayload {
  type: NotificationType;
  serverName: string;
  message: string;
  data: ServerStatus;
  timestamp: Date;
}

export enum NotificationType {
  TRANSFER_AVAILABLE = 'transfer_available',
  TRANSFER_LOCKED = 'transfer_locked',
  SERVER_ONLINE = 'server_online',
  SERVER_OFFLINE = 'server_offline',
  QUEUE_THRESHOLD = 'queue_threshold',
  MONITORING_STARTED = 'monitoring_started',
  ERROR = 'error',
}
