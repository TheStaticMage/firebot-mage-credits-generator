// Mock the dependencies
const mockGetViewerByUsername = jest.fn();

jest.mock('../src/main', () => ({
    firebot: {
        modules: {
            viewerDatabase: {
                getViewerByUsername: mockGetViewerByUsername
            }
        }
    },
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    }
}));

import { registerCreditsEffectController } from '../src/effects/register-credit';
import { currentStreamCredits } from '../src/credits-store';
import { CreditTypes } from '../src/types';

describe('RegisterCreditsEffectController.onTriggerEvent - StreamElements Donation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear all credits before each test
        currentStreamCredits.clearAllCredits();
    });

    it('should register donation event and credit should be retrievable via getCreditsForType', async () => {
        // Mock viewer database response
        const mockUser = {
            username: 'donoruser',
            displayName: 'Donor User',
            profilePicUrl: 'https://example.com/donor.jpg'
        };
        mockGetViewerByUsername.mockResolvedValue(mockUser);

        // The expected credit that will be registered
        const expectedCredit = {
            username: 'donoruser',
            amount: 25.50,
            userDisplayName: 'Donor User',
            profilePicUrl: 'https://example.com/donor.jpg'
        };

        const event = {
            effect: {},
            trigger: {
                metadata: {
                    eventSource: { id: 'streamelements' },
                    event: { id: 'donation' },
                    eventData: {
                        from: 'donoruser',
                        donationAmount: 25.50
                    }
                }
            },
            sendDataToOverlay: jest.fn(),
            outputs: {},
            abortSignal: new AbortController().signal
        };

        // Execute the method under test
        await registerCreditsEffectController.onTriggerEvent(event as any);

        // Verify that the viewer database was called correctly
        expect(mockGetViewerByUsername).toHaveBeenCalledWith('donoruser');

        // Verify that the credit can be retrieved via getCreditsForType
        const retrievedCredits = currentStreamCredits.getCreditsForType(CreditTypes.DONATION);
        expect(retrievedCredits).not.toBeNull();
        expect(retrievedCredits).toHaveLength(1);

        if (retrievedCredits) {
            expect(retrievedCredits[0]).toEqual(expectedCredit);
        }
    });

    it('should handle a donor name with a space the maps to a username', async () => {
        // Mock viewer database response
        const mockUser = {
            username: 'donoruser',
            displayName: 'Donor User',
            profilePicUrl: 'https://example.com/donor.jpg'
        };
        mockGetViewerByUsername.mockResolvedValue(mockUser);

        // The expected credit that will be registered
        const expectedCredit = {
            username: 'donoruser',
            amount: 25.50,
            userDisplayName: 'Donor User',
            profilePicUrl: 'https://example.com/donor.jpg'
        };

        const event = {
            effect: {},
            trigger: {
                metadata: {
                    eventSource: { id: 'streamelements' },
                    event: { id: 'donation' },
                    eventData: {
                        from: 'Donor User', // Name with space
                        donationAmount: 25.50
                    }
                }
            },
            sendDataToOverlay: jest.fn(),
            outputs: {},
            abortSignal: new AbortController().signal
        };

        // Execute the method under test
        await registerCreditsEffectController.onTriggerEvent(event as any);

        // Verify that the viewer database was called correctly
        expect(mockGetViewerByUsername).toHaveBeenCalledWith('donoruser');

        // Verify that the credit can be retrieved via getCreditsForType
        const retrievedCredits = currentStreamCredits.getCreditsForType(CreditTypes.DONATION);
        expect(retrievedCredits).not.toBeNull();
        expect(retrievedCredits).toHaveLength(1);

        if (retrievedCredits) {
            expect(retrievedCredits[0]).toEqual(expectedCredit);
        }
    });

    it('should handle donation when user not found in database', async () => {
        // Mock viewer database to return null (user not found)
        mockGetViewerByUsername.mockResolvedValue(null);

        // The expected credit with best guess username
        const expectedCredit = {
            username: 'unknownuser',
            amount: 10.00,
            userDisplayName: 'unknownuser',
            profilePicUrl: ''
        };

        const event = {
            effect: {},
            trigger: {
                metadata: {
                    eventSource: { id: 'streamelements' },
                    event: { id: 'donation' },
                    eventData: {
                        from: 'unknownuser',
                        donationAmount: 10.00
                    }
                }
            },
            sendDataToOverlay: jest.fn(),
            outputs: {},
            abortSignal: new AbortController().signal
        };

        // Execute the method under test
        await registerCreditsEffectController.onTriggerEvent(event as any);

        // Verify that the viewer database was called
        expect(mockGetViewerByUsername).toHaveBeenCalledWith('unknownuser');

        // Verify that the credit can be retrieved via getCreditsForType
        const retrievedCredits = currentStreamCredits.getCreditsForType(CreditTypes.DONATION);
        expect(retrievedCredits).not.toBeNull();
        expect(retrievedCredits).toHaveLength(1);

        if (retrievedCredits) {
            expect(retrievedCredits[0]).toEqual(expectedCredit);
        }
    });

    it('should not register donation with missing from field', async () => {
        const event = {
            effect: {},
            trigger: {
                metadata: {
                    eventSource: { id: 'streamelements' },
                    event: { id: 'donation' },
                    eventData: {
                        donationAmount: 25.50
                        // from field missing
                    }
                }
            },
            sendDataToOverlay: jest.fn(),
            outputs: {},
            abortSignal: new AbortController().signal
        };

        // Execute the method under test
        await registerCreditsEffectController.onTriggerEvent(event as any);

        // Verify that no database call was made
        expect(mockGetViewerByUsername).not.toHaveBeenCalled();

        // Verify that no credit was registered
        const retrievedCredits = currentStreamCredits.getCreditsForType(CreditTypes.DONATION);
        expect(retrievedCredits).toEqual([]);
    });

    it('should not register donation with invalid amount', async () => {
        const event = {
            effect: {},
            trigger: {
                metadata: {
                    eventSource: { id: 'streamelements' },
                    event: { id: 'donation' },
                    eventData: {
                        from: 'donoruser',
                        donationAmount: 'invalid'
                    }
                }
            },
            sendDataToOverlay: jest.fn(),
            outputs: {},
            abortSignal: new AbortController().signal
        };

        // Execute the method under test
        await registerCreditsEffectController.onTriggerEvent(event as any);

        // Verify that no database call was made
        expect(mockGetViewerByUsername).not.toHaveBeenCalled();

        // Verify that no credit was registered
        const retrievedCredits = currentStreamCredits.getCreditsForType(CreditTypes.DONATION);
        expect(retrievedCredits).toEqual([]);
    });
});
