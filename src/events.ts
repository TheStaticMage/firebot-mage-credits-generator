import { EventSource } from '@crowbartools/firebot-custom-scripts-types/types/modules/event-manager';
import { firebot, logger } from './main';

const eventSource: EventSource = {
    id: 'mage-credits-generator',
    name: 'Mage Credits Generator',
    events: [
        {
            id: 'credits-ended',
            name: "Credits Ended",
            description: "Fires when the credits animation ends."
        }
    ]
};

export function registerEvents() {
    const { eventManager } = firebot.modules;
    eventManager.registerEventSource(eventSource);
}

export function emitEvent(
    sourceId: string,
    eventId: string,
    meta: Record<string, unknown>,
    isManual?: boolean
): void {
    logger.debug(`Emitting event: ${eventId} from source: ${sourceId} with metadata: ${JSON.stringify(meta)}`);
    const { eventManager } = firebot.modules;
    eventManager.triggerEvent(sourceId, eventId, meta, isManual);
}
