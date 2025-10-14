/**
 * Event System - Configurable triggers and event definitions
 */

/**
 * Available event types that can be monitored
 */
export enum EventType {
  SERVER_STATUS_CHANGE = 'server_status_change',
  TRANSFER_TO_CHANGE = 'transfer_to_change',
  TRANSFER_FROM_CHANGE = 'transfer_from_change',
  QUEUE_CHANGE = 'queue_change',
  POPULATION_CHANGE = 'population_change',
  CHARACTER_CREATION_CHANGE = 'character_creation_change',
}

/**
 * Base interface for all event triggers
 */
export interface EventTrigger {
  type: EventType;
  enabled: boolean;
}

/**
 * Simple trigger without options (binary state change)
 */
export interface SimpleEventTrigger extends EventTrigger {
  type:
    | EventType.SERVER_STATUS_CHANGE
    | EventType.TRANSFER_TO_CHANGE
    | EventType.TRANSFER_FROM_CHANGE
    | EventType.CHARACTER_CREATION_CHANGE;
}

/**
 * Trigger with threshold options (numeric value monitoring)
 */
export interface ThresholdEventTrigger extends EventTrigger {
  type: EventType.QUEUE_CHANGE | EventType.POPULATION_CHANGE;
  options: {
    threshold: number;
    direction?: 'above' | 'below' | 'both'; // Default: 'both'
  };
}

/**
 * Union type for all trigger types
 */
export type AnyEventTrigger = SimpleEventTrigger | ThresholdEventTrigger;

/**
 * Event configuration for the application
 */
export interface EventConfiguration {
  triggers: AnyEventTrigger[];
}

/**
 * Detected event result
 */
export interface DetectedEvent {
  trigger: AnyEventTrigger;
  serverName: string;
  previousValue: string | number | boolean;
  currentValue: string | number | boolean;
  message: string;
  timestamp: Date;
}

/**
 * Type guard to check if trigger has threshold options
 */
export function isThresholdTrigger(trigger: AnyEventTrigger): trigger is ThresholdEventTrigger {
  return trigger.type === EventType.QUEUE_CHANGE || trigger.type === EventType.POPULATION_CHANGE;
}

/**
 * Helper to create a simple trigger
 */
export function createSimpleTrigger(
  type: SimpleEventTrigger['type'],
  enabled: boolean = true
): SimpleEventTrigger {
  return { type, enabled };
}

/**
 * Helper to create a threshold trigger
 */
export function createThresholdTrigger(
  type: ThresholdEventTrigger['type'],
  threshold: number,
  direction: 'above' | 'below' | 'both' = 'both',
  enabled: boolean = true
): ThresholdEventTrigger {
  return {
    type,
    enabled,
    options: { threshold, direction },
  };
}

/**
 * Default event configuration
 */
export const DEFAULT_EVENT_CONFIG: EventConfiguration = {
  triggers: [
    createSimpleTrigger(EventType.TRANSFER_TO_CHANGE, true),
    createSimpleTrigger(EventType.SERVER_STATUS_CHANGE, true),
  ],
};
