import { currentStreamCredits } from "../credits-store";
import { logger } from "../main";
import { CreditedUser } from "../types";

export function registerBuiltInCredit(entry: CreditedUser, eventType: string): boolean {
    const success = currentStreamCredits.registerCredit(eventType, entry);
    if (success) {
        logger.debug(`Registered ${eventType}: ${JSON.stringify(entry)}`);
    } else {
        logger.error(`Unknown event type "${eventType}" provided.`);
    }
    return success;
}
