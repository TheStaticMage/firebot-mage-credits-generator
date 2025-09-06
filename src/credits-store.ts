import { CreditedUser, CreditTypes, CurrentStreamCredits } from './types';

export class CreditsStore {
    private data: CurrentStreamCredits = {
        [CreditTypes.CHEER]: new Array<CreditedUser>(),
        [CreditTypes.DONATION]: new Array<CreditedUser>(),
        [CreditTypes.EXTRALIFE]: new Array<CreditedUser>(),
        [CreditTypes.FOLLOW]: new Array<CreditedUser>(),
        [CreditTypes.GIFT]: new Array<CreditedUser>(),
        [CreditTypes.MODERATOR]: new Array<CreditedUser>(),
        [CreditTypes.RAID]: new Array<CreditedUser>(),
        [CreditTypes.SUB]: new Array<CreditedUser>(),
        [CreditTypes.VIP]: new Array<CreditedUser>()
    };

    getCreditKeys(): string[] {
        return Object.keys(this.data);
    }

    getCreditsForType(eventType: string): CreditedUser[] | null {
        if (this.data[eventType]) {
            return this.data[eventType];
        }
        return null;
    }

    /**
     * Register a credit for a specific event type
     * @param eventType - The type of credit event (built-in or custom)
     * @param creditedUser - The user to credit
     * @returns true if successful, false if the built-in event type is invalid
     */
    registerCredit(eventType: string, creditedUser: CreditedUser): boolean {
        // Check if it's a built-in credit type
        const builtInTypes = Object.values(CreditTypes) as string[];
        if (builtInTypes.includes(eventType)) {
            // It's a built-in type
            const creditType = eventType as CreditTypes;
            this.data[creditType].push(creditedUser);
            return true;
        }
        return false;
    }

    registerCustomCredit(eventType: string, creditedUser: CreditedUser) {
        if (!this.data[eventType]) {
            this.data[eventType] = [];
        }
        this.data[eventType].push(creditedUser);
    }

    clearCredits(categories: string[]) {
        categories.forEach((category) => {
            if (this.data[category]) {
                this.data[category] = [];
            }
        });
    }

    clearAllCredits() {
        Object.keys(this.data).forEach((category) => {
            this.data[category] = [];
        });
    }
}

export const currentStreamCredits = new CreditsStore();
