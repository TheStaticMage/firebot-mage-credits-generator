import { CreditsStore } from '../src/credits-store';
import { CreditTypes, CreditedUser } from '../src/types';

jest.mock('../src/profile-picture-cache', () => ({
    profilePictureCache: {
        updateProfilePicture: jest.fn(),
        getProfilePicture: jest.fn(),
        clearCache: jest.fn(),
        getProfilePictureWithFallback: jest.fn()
    }
}));

describe('CreditsStore', () => {
    let creditsStore: CreditsStore;

    // Test data helpers
    const createTestUser = (username: string, amount = 100): CreditedUser => ({
        username,
        amount,
        userDisplayName: `Display${username}`,
        profilePicUrl: `https://example.com/pic/${username}.jpg`
    });

    beforeEach(() => {
        creditsStore = new CreditsStore();
    });

    describe('constructor', () => {
        it('should initialize with empty arrays for all built-in credit types', () => {
            const keys = creditsStore.getCreditKeys();
            const expectedKeys = Object.values(CreditTypes);

            // Should have all built-in credit types
            expectedKeys.forEach((type) => {
                expect(keys).toContain(type);
                expect(creditsStore.getCreditsForType(type)).toEqual([]);
            });
        });

        it('should initialize exactly 10 built-in credit types', () => {
            const keys = creditsStore.getCreditKeys();
            expect(keys).toHaveLength(10);
        });
    });

    describe('getCreditKeys', () => {
        it('should return all credit type keys', () => {
            const keys = creditsStore.getCreditKeys();
            expect(keys).toEqual(expect.arrayContaining(Object.values(CreditTypes)));
        });

        it('should include custom credit types after they are added', () => {
            const customType = 'customEvent';
            const user = createTestUser('testuser');

            creditsStore.registerCustomCredit(customType, user);
            const keys = creditsStore.getCreditKeys();

            expect(keys).toContain(customType);
        });
    });

    describe('getCreditsForType', () => {
        it('should return empty array for valid built-in credit types', () => {
            const credits = creditsStore.getCreditsForType(CreditTypes.CHEER);
            expect(credits).toEqual([]);
        });

        it('should return null for non-existent credit types', () => {
            const credits = creditsStore.getCreditsForType('nonexistent');
            expect(credits).toBeNull();
        });

        it('should return credits array for custom types after creation', () => {
            const customType = 'customEvent';
            const user = createTestUser('testuser');

            creditsStore.registerCustomCredit(customType, user);
            const credits = creditsStore.getCreditsForType(customType);

            expect(credits).toEqual([user]);
        });
    });

    describe('registerCredit', () => {
        it('should register credit for built-in types and return true', () => {
            const user = createTestUser('cheeruser', 500);
            const result = creditsStore.registerCredit(CreditTypes.CHEER, user);

            expect(result).toBe(true);
            const credits = creditsStore.getCreditsForType(CreditTypes.CHEER);
            expect(credits).toContain(user);
            expect(credits).toHaveLength(1);
        });

        it('should register multiple credits for the same type', () => {
            const user1 = createTestUser('user1', 100);
            const user2 = createTestUser('user2', 200);

            creditsStore.registerCredit(CreditTypes.SUB, user1);
            creditsStore.registerCredit(CreditTypes.SUB, user2);

            const credits = creditsStore.getCreditsForType(CreditTypes.SUB);
            expect(credits).toHaveLength(2);
            expect(credits).toContain(user1);
            expect(credits).toContain(user2);
        });

        it('should work with all built-in credit types', () => {
            const user = createTestUser('testuser');

            Object.values(CreditTypes).forEach((type) => {
                const result = creditsStore.registerCredit(type, user);
                expect(result).toBe(true);

                const credits = creditsStore.getCreditsForType(type);
                expect(credits).toContain(user);
            });
        });

        it('should return false for non-built-in types', () => {
            const user = createTestUser('testuser');
            const result = creditsStore.registerCredit('customType', user);

            expect(result).toBe(false);
            const credits = creditsStore.getCreditsForType('customType');
            expect(credits).toBeNull();
        });

        it('should preserve user data exactly as provided', () => {
            const user: CreditedUser = {
                username: 'testuser',
                amount: 250,
                userDisplayName: 'Test User Display',
                profilePicUrl: 'https://example.com/pic.jpg'
            };

            creditsStore.registerCredit(CreditTypes.DONATION, user);
            const credits = creditsStore.getCreditsForType(CreditTypes.DONATION);

            expect(credits?.[0]).toEqual(user);
        });
    });

    describe('registerCustomCredit', () => {
        it('should create new category for custom credit type', () => {
            const customType = 'birthdayEvent';
            const user = createTestUser('birthdayuser');

            creditsStore.registerCustomCredit(customType, user);

            const keys = creditsStore.getCreditKeys();
            expect(keys).toContain(customType);

            const credits = creditsStore.getCreditsForType(customType);
            expect(credits).toContain(user);
        });

        it('should add to existing custom category', () => {
            const customType = 'specialEvent';
            const user1 = createTestUser('user1');
            const user2 = createTestUser('user2');

            creditsStore.registerCustomCredit(customType, user1);
            creditsStore.registerCustomCredit(customType, user2);

            const credits = creditsStore.getCreditsForType(customType);
            expect(credits).toHaveLength(2);
            expect(credits).toContain(user1);
            expect(credits).toContain(user2);
        });

        it('should not interfere with built-in credit types', () => {
            const builtInUser = createTestUser('builtinuser');
            const customUser = createTestUser('customuser');

            creditsStore.registerCredit(CreditTypes.FOLLOW, builtInUser);
            creditsStore.registerCustomCredit('custom', customUser);

            const builtInCredits = creditsStore.getCreditsForType(CreditTypes.FOLLOW);
            const customCredits = creditsStore.getCreditsForType('custom');

            expect(builtInCredits).toHaveLength(1);
            expect(builtInCredits).toContain(builtInUser);
            expect(customCredits).toHaveLength(1);
            expect(customCredits).toContain(customUser);
        });
    });

    describe('clearCredits', () => {
        beforeEach(() => {
            // Set up test data
            creditsStore.registerCredit(CreditTypes.CHEER, createTestUser('cheeruser'));
            creditsStore.registerCredit(CreditTypes.FOLLOW, createTestUser('followuser'));
            creditsStore.registerCredit(CreditTypes.SUB, createTestUser('subuser'));
            creditsStore.registerCustomCredit('custom1', createTestUser('custom1user'));
            creditsStore.registerCustomCredit('custom2', createTestUser('custom2user'));
        });

        it('should clear specified built-in credit categories', () => {
            creditsStore.clearCredits([CreditTypes.CHEER, CreditTypes.FOLLOW]);

            expect(creditsStore.getCreditsForType(CreditTypes.CHEER)).toEqual([]);
            expect(creditsStore.getCreditsForType(CreditTypes.FOLLOW)).toEqual([]);
            expect(creditsStore.getCreditsForType(CreditTypes.SUB)).toHaveLength(1);
        });

        it('should clear specified custom credit categories', () => {
            creditsStore.clearCredits(['custom1']);

            expect(creditsStore.getCreditsForType('custom1')).toEqual([]);
            expect(creditsStore.getCreditsForType('custom2')).toHaveLength(1);
        });

        it('should clear mixed built-in and custom categories', () => {
            creditsStore.clearCredits([CreditTypes.CHEER, 'custom1']);

            expect(creditsStore.getCreditsForType(CreditTypes.CHEER)).toEqual([]);
            expect(creditsStore.getCreditsForType('custom1')).toEqual([]);
            expect(creditsStore.getCreditsForType(CreditTypes.FOLLOW)).toHaveLength(1);
            expect(creditsStore.getCreditsForType('custom2')).toHaveLength(1);
        });

        it('should ignore non-existent categories', () => {
            creditsStore.clearCredits(['nonexistent', CreditTypes.CHEER]);

            expect(creditsStore.getCreditsForType(CreditTypes.CHEER)).toEqual([]);
            expect(creditsStore.getCreditsForType(CreditTypes.FOLLOW)).toHaveLength(1);
        });

        it('should handle empty array input', () => {
            creditsStore.clearCredits([]);

            // Nothing should be cleared
            expect(creditsStore.getCreditsForType(CreditTypes.CHEER)).toHaveLength(1);
            expect(creditsStore.getCreditsForType(CreditTypes.FOLLOW)).toHaveLength(1);
            expect(creditsStore.getCreditsForType('custom1')).toHaveLength(1);
        });
    });

    describe('clearAllCredits', () => {
        beforeEach(() => {
            // Set up test data
            creditsStore.registerCredit(CreditTypes.CHEER, createTestUser('cheeruser'));
            creditsStore.registerCredit(CreditTypes.FOLLOW, createTestUser('followuser'));
            creditsStore.registerCredit(CreditTypes.SUB, createTestUser('subuser'));
            creditsStore.registerCustomCredit('custom1', createTestUser('custom1user'));
            creditsStore.registerCustomCredit('custom2', createTestUser('custom2user'));
        });

        it('should clear all built-in and custom credit categories', () => {
            creditsStore.clearAllCredits();

            // Check all built-in types are empty
            Object.values(CreditTypes).forEach((type) => {
                expect(creditsStore.getCreditsForType(type)).toEqual([]);
            });

            // Check custom types are empty
            expect(creditsStore.getCreditsForType('custom1')).toEqual([]);
            expect(creditsStore.getCreditsForType('custom2')).toEqual([]);
        });

        it('should preserve category structure after clearing', () => {
            const keysBefore = creditsStore.getCreditKeys();
            creditsStore.clearAllCredits();
            const keysAfter = creditsStore.getCreditKeys();

            expect(keysAfter.sort()).toEqual(keysBefore.sort());
        });

        it('should allow new registrations after clearing all', () => {
            creditsStore.clearAllCredits();

            const newUser = createTestUser('newuser');
            creditsStore.registerCredit(CreditTypes.CHEER, newUser);
            creditsStore.registerCustomCredit('newcustom', newUser);

            expect(creditsStore.getCreditsForType(CreditTypes.CHEER)).toContain(newUser);
            expect(creditsStore.getCreditsForType('newcustom')).toContain(newUser);
        });
    });

    describe('integration scenarios', () => {
        it('should handle complex workflow with multiple operations', () => {
            // Register various credits
            const cheerUser = createTestUser('cheeruser', 500);
            const followUser = createTestUser('followuser', 0);
            const customUser = createTestUser('customuser', 250);

            creditsStore.registerCredit(CreditTypes.CHEER, cheerUser);
            creditsStore.registerCredit(CreditTypes.FOLLOW, followUser);
            creditsStore.registerCustomCredit('birthday', customUser);

            // Verify state
            expect(creditsStore.getCreditKeys()).toHaveLength(11); // 10 built-in + 1 custom
            expect(creditsStore.getCreditsForType(CreditTypes.CHEER)).toHaveLength(1);
            expect(creditsStore.getCreditsForType('birthday')).toHaveLength(1);

            // Clear some categories
            creditsStore.clearCredits([CreditTypes.CHEER]);
            expect(creditsStore.getCreditsForType(CreditTypes.CHEER)).toEqual([]);
            expect(creditsStore.getCreditsForType(CreditTypes.FOLLOW)).toHaveLength(1);
            expect(creditsStore.getCreditsForType('birthday')).toHaveLength(1);

            // Add more credits
            creditsStore.registerCredit(CreditTypes.SUB, createTestUser('subuser'));
            creditsStore.registerCustomCredit('birthday', createTestUser('birthday2'));

            expect(creditsStore.getCreditsForType(CreditTypes.SUB)).toHaveLength(1);
            expect(creditsStore.getCreditsForType('birthday')).toHaveLength(2);
        });

        it('should maintain data isolation between different CreditsStore instances', () => {
            const store1 = new CreditsStore();
            const store2 = new CreditsStore();

            const user1 = createTestUser('user1');
            const user2 = createTestUser('user2');

            store1.registerCredit(CreditTypes.CHEER, user1);
            store2.registerCredit(CreditTypes.CHEER, user2);

            expect(store1.getCreditsForType(CreditTypes.CHEER)).toHaveLength(1);
            expect(store1.getCreditsForType(CreditTypes.CHEER)).toContain(user1);
            expect(store1.getCreditsForType(CreditTypes.CHEER)).not.toContain(user2);

            expect(store2.getCreditsForType(CreditTypes.CHEER)).toHaveLength(1);
            expect(store2.getCreditsForType(CreditTypes.CHEER)).toContain(user2);
            expect(store2.getCreditsForType(CreditTypes.CHEER)).not.toContain(user1);
        });
    });
});
