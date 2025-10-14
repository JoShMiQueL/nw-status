/**
 * Event Evaluator - Detects changes based on configured triggers
 */

import type { AnyEventTrigger, DetectedEvent, ThresholdEventTrigger } from './events';
import { EventType, isThresholdTrigger } from './events';
import type { ServerStatus } from './types';
import { PopulationLevel } from './types';

export class EventEvaluator {
  /**
   * Evaluates all triggers and returns detected events
   */
  evaluate(
    triggers: AnyEventTrigger[],
    currentStatus: ServerStatus,
    previousStatus: ServerStatus | null
  ): DetectedEvent[] {
    const events: DetectedEvent[] = [];

    // Skip if no previous status (first check)
    if (!previousStatus) {
      return events;
    }

    for (const trigger of triggers) {
      if (!trigger.enabled) {
        continue;
      }

      const event = this.evaluateTrigger(trigger, currentStatus, previousStatus);
      if (event) {
        events.push(event);
      }
    }

    return events;
  }

  private evaluateTrigger(
    trigger: AnyEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    if (isThresholdTrigger(trigger)) {
      return this.evaluateThresholdTrigger(trigger, current, previous);
    }

    return this.evaluateSimpleTrigger(trigger, current, previous);
  }

  private evaluateSimpleTrigger(
    trigger: AnyEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    switch (trigger.type) {
      case EventType.SERVER_STATUS_CHANGE:
        return this.checkServerStatusChange(trigger, current, previous);

      case EventType.TRANSFER_TO_CHANGE:
        return this.checkTransferToChange(trigger, current, previous);

      case EventType.TRANSFER_FROM_CHANGE:
        return this.checkTransferFromChange(trigger, current, previous);

      case EventType.CHARACTER_CREATION_CHANGE:
        return this.checkCharacterCreationChange(trigger, current, previous);

      default:
        return null;
    }
  }

  private evaluateThresholdTrigger(
    trigger: ThresholdEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    switch (trigger.type) {
      case EventType.QUEUE_CHANGE:
        return this.checkQueueThreshold(trigger, current, previous);

      case EventType.POPULATION_CHANGE:
        return this.checkPopulationThreshold(trigger, current, previous);

      default:
        return null;
    }
  }

  // Simple trigger evaluators

  private checkServerStatusChange(
    trigger: AnyEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    if (current.status !== previous.status) {
      return {
        trigger,
        serverName: current.name,
        previousValue: previous.status,
        currentValue: current.status,
        message: `Server status changed from ${previous.status} to ${current.status}`,
        timestamp: new Date(),
      };
    }
    return null;
  }

  private checkTransferToChange(
    trigger: AnyEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    if (current.canTransferTo !== previous.canTransferTo) {
      const message = current.canTransferTo
        ? 'Server transfers are now OPEN ✅'
        : 'Server transfers are now CLOSED 🔒';

      return {
        trigger,
        serverName: current.name,
        previousValue: previous.canTransferTo,
        currentValue: current.canTransferTo,
        message,
        timestamp: new Date(),
      };
    }
    return null;
  }

  private checkTransferFromChange(
    trigger: AnyEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    if (current.canTransferFrom !== previous.canTransferFrom) {
      const message = current.canTransferFrom
        ? 'Transfers FROM this server are now OPEN ✅'
        : 'Transfers FROM this server are now CLOSED 🔒';

      return {
        trigger,
        serverName: current.name,
        previousValue: previous.canTransferFrom,
        currentValue: current.canTransferFrom,
        message,
        timestamp: new Date(),
      };
    }
    return null;
  }

  private checkCharacterCreationChange(
    trigger: AnyEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    if (current.canCreateCharacter !== previous.canCreateCharacter) {
      const message = current.canCreateCharacter
        ? 'Character creation is now OPEN ✅'
        : 'Character creation is now CLOSED 🔒';

      return {
        trigger,
        serverName: current.name,
        previousValue: previous.canCreateCharacter,
        currentValue: current.canCreateCharacter,
        message,
        timestamp: new Date(),
      };
    }
    return null;
  }

  // Threshold trigger evaluators

  private checkQueueThreshold(
    trigger: ThresholdEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    const { threshold, direction = 'both' } = trigger.options;
    const currentQueue = current.queue;
    const previousQueue = previous.queue;

    // Check if crossed threshold
    const crossedAbove = previousQueue < threshold && currentQueue >= threshold;
    const crossedBelow = previousQueue >= threshold && currentQueue < threshold;

    if (direction === 'above' && crossedAbove) {
      return {
        trigger,
        serverName: current.name,
        previousValue: previousQueue,
        currentValue: currentQueue,
        message: `Queue exceeded threshold: ${currentQueue.toLocaleString()} (threshold: ${threshold.toLocaleString()})`,
        timestamp: new Date(),
      };
    }

    if (direction === 'below' && crossedBelow) {
      return {
        trigger,
        serverName: current.name,
        previousValue: previousQueue,
        currentValue: currentQueue,
        message: `Queue dropped below threshold: ${currentQueue.toLocaleString()} (threshold: ${threshold.toLocaleString()})`,
        timestamp: new Date(),
      };
    }

    if (direction === 'both' && (crossedAbove || crossedBelow)) {
      const action = crossedAbove ? 'exceeded' : 'dropped below';
      return {
        trigger,
        serverName: current.name,
        previousValue: previousQueue,
        currentValue: currentQueue,
        message: `Queue ${action} threshold: ${currentQueue.toLocaleString()} (threshold: ${threshold.toLocaleString()})`,
        timestamp: new Date(),
      };
    }

    return null;
  }

  private checkPopulationThreshold(
    trigger: ThresholdEventTrigger,
    current: ServerStatus,
    previous: ServerStatus
  ): DetectedEvent | null {
    const { threshold, direction = 'both' } = trigger.options;

    // Convert population levels to numeric values for comparison
    const currentPop = this.populationToNumber(current.population);
    const previousPop = this.populationToNumber(previous.population);

    // Check if crossed threshold
    const crossedAbove = previousPop < threshold && currentPop >= threshold;
    const crossedBelow = previousPop >= threshold && currentPop < threshold;

    if (direction === 'above' && crossedAbove) {
      return {
        trigger,
        serverName: current.name,
        previousValue: previous.population,
        currentValue: current.population,
        message: `Population exceeded threshold: ${current.population} (threshold: ${threshold})`,
        timestamp: new Date(),
      };
    }

    if (direction === 'below' && crossedBelow) {
      return {
        trigger,
        serverName: current.name,
        previousValue: previous.population,
        currentValue: current.population,
        message: `Population dropped below threshold: ${current.population} (threshold: ${threshold})`,
        timestamp: new Date(),
      };
    }

    if (direction === 'both' && (crossedAbove || crossedBelow)) {
      const action = crossedAbove ? 'exceeded' : 'dropped below';
      return {
        trigger,
        serverName: current.name,
        previousValue: previous.population,
        currentValue: current.population,
        message: `Population ${action} threshold: ${current.population} (threshold: ${threshold})`,
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Converts population level to numeric value for threshold comparison
   */
  private populationToNumber(level: PopulationLevel): number {
    switch (level) {
      case PopulationLevel.LOW:
        return 1;
      case PopulationLevel.MEDIUM:
        return 2;
      case PopulationLevel.HIGH:
        return 3;
      case PopulationLevel.FULL:
        return 4;
      default:
        return 0;
    }
  }
}
