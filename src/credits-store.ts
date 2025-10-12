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

    private blockedUsers = new Set<string>();

    getCreditKeys(): string[] {
        return Object.keys(this.data);
    }

    getCreditsForType(eventType: string): CreditedUser[] | null {
        if (this.data[eventType]) {
            return this.data[eventType].filter(
                creditedUser => !this.blockedUsers.has(creditedUser.username.toLowerCase())
            );
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

    clearCreditsByUser(username: string) {
        Object.keys(this.data).forEach((category) => {
            this.data[category] = this.data[category].filter(
                creditedUser => creditedUser.username.toLowerCase() !== username.toLowerCase()
            );
        });
    }

    blockCreditsByUser(username: string) {
        this.blockedUsers.add(username.toLowerCase());
    }

    unblockCreditsByUser(username: string) {
        this.blockedUsers.delete(username.toLowerCase());
    }

    isUserBlocked(username: string): boolean {
        return this.blockedUsers.has(username.toLowerCase());
    }
}

export const currentStreamCredits = new CreditsStore();
