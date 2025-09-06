import { registerCreditBulkEffect } from '../src/effects/register-credit-bulk';
import { CreditsStore } from '../src/credits-store';
import { CreditTypes } from '../src/types';

// Mock the logger
jest.mock('../src/main', () => ({
    logger: {
        error: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    }
}));

// Mock the common module to use our test CreditsStore instance
let testCreditsStore: CreditsStore;

jest.mock('../src/effects/common', () => ({
    registerBuiltInCredit: jest.fn((entry, eventType) => {
        return testCreditsStore.registerCredit(eventType, entry);
    })
}));

// Mock the credits-store module to use our test instance
jest.mock('../src/credits-store', () => ({
    CreditsStore: jest.requireActual('../src/credits-store').CreditsStore,
    get currentStreamCredits() {
        return testCreditsStore;
    }
}));

// Helper to create a mock event
const createMockEvent = (effectParams: any) => ({
    effect: effectParams,
    trigger: {} as any,
    sendDataToOverlay: jest.fn(),
    abortSignal: new AbortController().signal
});

describe('registerCreditBulkEffect.onTriggerEvent', () => {
    beforeEach(() => {
        testCreditsStore = new CreditsStore();
        jest.clearAllMocks();
    });

    describe('Built-in credit types', () => {
        it('should register users with amounts for cheer events (comma-separated)', async () => {
            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.CHEER,
                data: 'user1,100\nuser2,50\nuser3,25'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(3); // Fixed: only count during registration
            expect(result.outputs.creditsFailed).toBe(0);

            const cheerCredits = testCreditsStore.getCreditsForType(CreditTypes.CHEER);
            expect(cheerCredits).toHaveLength(3);
            expect(cheerCredits).toEqual([
                { username: 'user1', amount: 100, userDisplayName: 'user1', profilePicUrl: '' },
                { username: 'user2', amount: 50, userDisplayName: 'user2', profilePicUrl: '' },
                { username: 'user3', amount: 25, userDisplayName: 'user3', profilePicUrl: '' }
            ]);
        });

        it('should register users with amounts for follow events (space-separated)', async () => {
            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.FOLLOW,
                data: 'follower1 1\nfollower2 1\nfollower3 1'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(3);
            expect(result.outputs.creditsFailed).toBe(0);

            const followCredits = testCreditsStore.getCreditsForType(CreditTypes.FOLLOW);
            expect(followCredits).toHaveLength(3);
            expect(followCredits).toEqual([
                { username: 'follower1', amount: 1, userDisplayName: 'follower1', profilePicUrl: '' },
                { username: 'follower2', amount: 1, userDisplayName: 'follower2', profilePicUrl: '' },
                { username: 'follower3', amount: 1, userDisplayName: 'follower3', profilePicUrl: '' }
            ]);
        });

        it('should register users without amounts (username only)', async () => {
            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.SUB,
                data: 'subscriber1\nsubscriber2\nsubscriber3'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(3);
            expect(result.outputs.creditsFailed).toBe(0);

            const subCredits = testCreditsStore.getCreditsForType(CreditTypes.SUB);
            expect(subCredits).toHaveLength(3);
            expect(subCredits).toEqual([
                { username: 'subscriber1', amount: 0, userDisplayName: 'subscriber1', profilePicUrl: '' },
                { username: 'subscriber2', amount: 0, userDisplayName: 'subscriber2', profilePicUrl: '' },
                { username: 'subscriber3', amount: 0, userDisplayName: 'subscriber3', profilePicUrl: '' }
            ]);
        });

        it('should register users from JSON format', async () => {
            const jsonData = JSON.stringify([
                { username: 'user1', amount: 500 },
                { username: 'user2', amount: 250 },
                { username: 'user3', amount: 100 }
            ]);

            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.DONATION,
                data: jsonData
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(3);
            expect(result.outputs.creditsFailed).toBe(0);

            const donationCredits = testCreditsStore.getCreditsForType(CreditTypes.DONATION);
            expect(donationCredits).toHaveLength(3);
            expect(donationCredits).toEqual([
                { username: 'user1', amount: 500, userDisplayName: 'user1', profilePicUrl: '' },
                { username: 'user2', amount: 250, userDisplayName: 'user2', profilePicUrl: '' },
                { username: 'user3', amount: 100, userDisplayName: 'user3', profilePicUrl: '' }
            ]);
        });
    });

    describe('Custom credit types', () => {
        it('should register users for custom event types', async () => {
            const event = createMockEvent({
                eventClass: 'custom',
                eventCustomType: 'my-custom-event',
                data: 'customuser1,10\ncustomuser2,20'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(2);
            expect(result.outputs.creditsFailed).toBe(0);

            const customCredits = testCreditsStore.getCreditsForType('my-custom-event');
            expect(customCredits).toHaveLength(2);
            expect(customCredits).toEqual([
                { username: 'customuser1', amount: 10, userDisplayName: 'customuser1', profilePicUrl: '' },
                { username: 'customuser2', amount: 20, userDisplayName: 'customuser2', profilePicUrl: '' }
            ]);
        });

        it('should create new category for custom event types', async () => {
            const event = createMockEvent({
                eventClass: 'custom',
                eventCustomType: 'special-event',
                data: 'specialuser1'
            });

            // Verify the category doesn't exist initially
            expect(testCreditsStore.getCreditsForType('special-event')).toBeNull();

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(1);
            expect(result.outputs.creditsFailed).toBe(0);

            // Verify the category was created
            const specialCredits = testCreditsStore.getCreditsForType('special-event');
            expect(specialCredits).toHaveLength(1);
            expect(specialCredits).toEqual([
                { username: 'specialuser1', amount: 0, userDisplayName: 'specialuser1', profilePicUrl: '' }
            ]);
        });
    });

    describe('Error handling', () => {
        it('should return error when no event class is provided', async () => {
            const event = createMockEvent({
                eventType: CreditTypes.CHEER,
                data: 'user1,100'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid event class provided.');
        });

        it('should handle invalid JSON gracefully', async () => {
            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.CHEER,
                data: '{ invalid json'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(1);
            expect(result.outputs.creditsFailed).toBe(0);

            // Should fall back to line-by-line parsing
            const cheerCredits = testCreditsStore.getCreditsForType(CreditTypes.CHEER);
            expect(cheerCredits).toHaveLength(1);
            expect(cheerCredits?.[0].username).toBe('{'); // First part before space
        });

        it('should handle mixed valid and invalid entries', async () => {
            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.CHEER,
                data: 'validuser1,100\n\n  \nvaliduser2,50\n'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(2);
            expect(result.outputs.creditsFailed).toBe(0);

            const cheerCredits = testCreditsStore.getCreditsForType(CreditTypes.CHEER);
            expect(cheerCredits).toHaveLength(2);
            expect(cheerCredits).toEqual([
                { username: 'validuser1', amount: 100, userDisplayName: 'validuser1', profilePicUrl: '' },
                { username: 'validuser2', amount: 50, userDisplayName: 'validuser2', profilePicUrl: '' }
            ]);
        });

        it('should handle invalid JSON array objects', async () => {
            const jsonData = JSON.stringify([
                { username: 'user1', amount: 100 },
                { invalidEntry: 'missing username' },
                { username: 'user2', amount: 50 }
            ]);

            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.CHEER,
                data: jsonData
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(2);
            expect(result.outputs.creditsFailed).toBe(1);

            const cheerCredits = testCreditsStore.getCreditsForType(CreditTypes.CHEER);
            expect(cheerCredits).toHaveLength(2);
            expect(cheerCredits).toEqual([
                { username: 'user1', amount: 100, userDisplayName: 'user1', profilePicUrl: '' },
                { username: 'user2', amount: 50, userDisplayName: 'user2', profilePicUrl: '' }
            ]);
        });
    });

    describe('Data format handling', () => {
        it('should handle numbers correctly for amounts', async () => {
            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.CHEER,
                data: 'user1,100.50\nuser2,abc\nuser3,0\nuser4,-5'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(4);
            expect(result.outputs.creditsFailed).toBe(0);

            const cheerCredits = testCreditsStore.getCreditsForType(CreditTypes.CHEER);
            expect(cheerCredits).toHaveLength(4);
            expect(cheerCredits).toEqual([
                { username: 'user1', amount: 100.5, userDisplayName: 'user1', profilePicUrl: '' },
                { username: 'user2', amount: 0, userDisplayName: 'user2', profilePicUrl: '' }, // NaN becomes 0
                { username: 'user3', amount: 0, userDisplayName: 'user3', profilePicUrl: '' },
                { username: 'user4', amount: -5, userDisplayName: 'user4', profilePicUrl: '' }
            ]);
        });

        it('should trim whitespace from usernames', async () => {
            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.SUB,
                data: '  spaced_user1  \n\t  spaced_user2\t\n   spaced_user3   '
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);
            expect(result.outputs.creditsRegistered).toBe(3);
            expect(result.outputs.creditsFailed).toBe(0);

            const subCredits = testCreditsStore.getCreditsForType(CreditTypes.SUB);
            expect(subCredits).toHaveLength(3);
            expect(subCredits).toEqual([
                { username: 'spaced_user1', amount: 0, userDisplayName: 'spaced_user1', profilePicUrl: '' },
                { username: 'spaced_user2', amount: 0, userDisplayName: 'spaced_user2', profilePicUrl: '' },
                { username: 'spaced_user3', amount: 0, userDisplayName: 'spaced_user3', profilePicUrl: '' }
            ]);
        });
    });

    describe('Store isolation', () => {
        it('should not affect other credit types when registering', async () => {
            // Pre-populate some data
            testCreditsStore.registerCredit(CreditTypes.FOLLOW, {
                username: 'existing_follower',
                amount: 0,
                userDisplayName: 'existing_follower',
                profilePicUrl: ''
            });

            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.CHEER,
                data: 'new_cheerer,100'
            });

            const result = await registerCreditBulkEffect.onTriggerEvent(event) as any;

            expect(result.success).toBe(true);

            // Check that follow credits are unchanged
            const followCredits = testCreditsStore.getCreditsForType(CreditTypes.FOLLOW);
            expect(followCredits).toHaveLength(1);
            expect(followCredits?.[0].username).toBe('existing_follower');

            // Check that cheer credits were added
            const cheerCredits = testCreditsStore.getCreditsForType(CreditTypes.CHEER);
            expect(cheerCredits).toHaveLength(1);
            expect(cheerCredits?.[0].username).toBe('new_cheerer');
        });

        it('should maintain separate counts for each test', async () => {
            const event = createMockEvent({
                eventClass: 'builtin',
                eventType: CreditTypes.SUB,
                data: 'test_user'
            });

            await registerCreditBulkEffect.onTriggerEvent(event);

            const subCredits = testCreditsStore.getCreditsForType(CreditTypes.SUB);
            expect(subCredits).toHaveLength(1);

            // This test should start with a clean store due to beforeEach
            expect(testCreditsStore.getCreditsForType(CreditTypes.CHEER)).toEqual([]);
        });
    });
});
