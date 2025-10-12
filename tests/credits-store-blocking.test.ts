import { CreditsStore } from '../src/credits-store';
import { CreditedUser, CreditTypes } from '../src/types';

describe('CreditsStore blocking and clearing', () => {
    let store: CreditsStore;
    const userA: CreditedUser = { username: 'Alice', userDisplayName: 'Alice', profilePicUrl: '', amount: 1 };
    const userB: CreditedUser = { username: 'Bob', userDisplayName: 'Bob', profilePicUrl: '', amount: 2 };
    const userC: CreditedUser = { username: 'Charlie', userDisplayName: 'Charlie', profilePicUrl: '', amount: 3 };

    beforeEach(() => {
        store = new CreditsStore();
        store.registerCredit(CreditTypes.VIP, userA);
        store.registerCredit(CreditTypes.VIP, userB);
        store.registerCredit(CreditTypes.VIP, userC);
    });

    it('clearCreditsByUser removes all credits for a user', () => {
        store.clearCreditsByUser('Bob');
        const credits = store.getCreditsForType(CreditTypes.VIP);
        expect(credits?.map(u => u.username)).toEqual(['Alice', 'Charlie']);
    });

    it('blockCreditsByUser hides user from getCreditsForType', () => {
        store.blockCreditsByUser('Charlie');
        const credits = store.getCreditsForType(CreditTypes.VIP);
        expect(credits?.map(u => u.username)).toEqual(['Alice', 'Bob']);
    });

    it('isUserBlocked returns true for blocked user', () => {
        store.blockCreditsByUser('Alice');
        expect(store.isUserBlocked('Alice')).toBe(true);
        expect(store.isUserBlocked('Bob')).toBe(false);
    });

    it('blocked user is not returned by getCreditsForType after blocking', () => {
        store.blockCreditsByUser('Alice');
        store.blockCreditsByUser('Bob');
        const credits = store.getCreditsForType(CreditTypes.VIP);
        expect(credits?.map(u => u.username)).toEqual(['Charlie']);
    });
});
