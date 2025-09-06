// Mock the dependencies
const mockRegisterCustomCredit = jest.fn();

jest.mock('../src/credits-store', () => ({
    currentStreamCredits: {
        registerCustomCredit: mockRegisterCustomCredit
    }
}));

jest.mock('../src/main', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    }
}));

import { registerCustomCreditEffect } from '../src/effects/register-custom-credit';

describe('registerCustomCreditEffect.onTriggerEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Valid registrations', () => {
        it('should register a basic custom credit with minimal data', async () => {
            const event = {
                effect: {
                    creditType: "birthday",
                    username: "testuser",
                    amount: "100"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "birthday",
                {
                    username: "testuser",
                    amount: 100,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should register a custom credit with all optional fields', async () => {
            const event = {
                effect: {
                    creditType: "anniversary",
                    username: "celebrant",
                    userDisplayName: "Celebration User",
                    profilePicUrl: "https://example.com/pic.jpg",
                    amount: "25.50"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "anniversary",
                {
                    username: "celebrant",
                    amount: 25.50,
                    userDisplayName: "Celebration User",
                    profilePicUrl: "https://example.com/pic.jpg"
                }
            );
        });

        it('should handle numeric amount as string', async () => {
            const event = {
                effect: {
                    creditType: "special",
                    username: "specialuser",
                    amount: "42"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "special",
                {
                    username: "specialuser",
                    amount: 42,
                    userDisplayName: "specialuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should handle decimal amount as string', async () => {
            const event = {
                effect: {
                    creditType: "milestone",
                    username: "milestoneuser",
                    amount: "123.45"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "milestone",
                {
                    username: "milestoneuser",
                    amount: 123.45,
                    userDisplayName: "milestoneuser",
                    profilePicUrl: ""
                }
            );
        });
    });

    describe('Data processing', () => {
        it('should trim whitespace from creditType', async () => {
            const event = {
                effect: {
                    creditType: "  customtype  ",
                    username: "testuser",
                    amount: "0"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "customtype",
                {
                    username: "testuser",
                    amount: 0,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should trim whitespace from username', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "  spaceduser  ",
                    amount: "0"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "spaceduser",
                    amount: 0,
                    userDisplayName: "spaceduser",
                    profilePicUrl: ""
                }
            );
        });

        it('should trim whitespace from userDisplayName', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser",
                    userDisplayName: "  Display Name  ",
                    amount: "0"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: 0,
                    userDisplayName: "Display Name",
                    profilePicUrl: ""
                }
            );
        });

        it('should trim whitespace from profilePicUrl', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser",
                    profilePicUrl: "  https://example.com/pic.jpg  ",
                    amount: "0"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: 0,
                    userDisplayName: "testuser",
                    profilePicUrl: "https://example.com/pic.jpg"
                }
            );
        });

        it('should trim whitespace from amount', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser",
                    amount: "  42.5  "
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: 42.5,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should use username as userDisplayName when userDisplayName is not provided', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "simpleuser",
                    amount: "0"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "simpleuser",
                    amount: 0,
                    userDisplayName: "simpleuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should use empty string for profilePicUrl when not provided', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser",
                    amount: "5"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: 5,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });
    });

    describe('Amount handling', () => {
        it('should handle zero amount', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser",
                    amount: "0"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: 0,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should handle negative amounts', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser",
                    amount: "-50"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: -50,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should handle invalid amount as 0', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser",
                    amount: "not-a-number"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: 0,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should handle empty amount as 0', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser",
                    amount: ""
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: 0,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should handle undefined amount as 0', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "testuser"
                    // amount not provided
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "testuser",
                    amount: 0,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });
    });

    describe('Error handling', () => {
        it('should not register when creditType is missing', async () => {
            const event = {
                effect: {
                    username: "testuser",
                    amount: "100"
                    // creditType not provided
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).not.toHaveBeenCalled();
        });

        it('should not register when creditType is empty string', async () => {
            const event = {
                effect: {
                    creditType: "",
                    username: "testuser",
                    amount: "100"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).not.toHaveBeenCalled();
        });

        it('should not register when creditType is only whitespace', async () => {
            const event = {
                effect: {
                    creditType: "   ",
                    username: "testuser",
                    amount: "100"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).not.toHaveBeenCalled();
        });

        it('should not register when username is missing', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    amount: "100"
                    // username not provided
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).not.toHaveBeenCalled();
        });

        it('should not register when username is empty string', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "",
                    amount: "100"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).not.toHaveBeenCalled();
        });

        it('should not register when username is only whitespace', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "   ",
                    amount: "100"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('should handle very large amounts', async () => {
            const event = {
                effect: {
                    creditType: "hugecustom",
                    username: "biguser",
                    amount: "999999.99"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "hugecustom",
                {
                    username: "biguser",
                    amount: 999999.99,
                    userDisplayName: "biguser",
                    profilePicUrl: ""
                }
            );
        });

        it('should handle special characters in creditType', async () => {
            const event = {
                effect: {
                    creditType: "special-event_2024",
                    username: "testuser",
                    amount: "10"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "special-event_2024",
                {
                    username: "testuser",
                    amount: 10,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                }
            );
        });

        it('should handle special characters in username', async () => {
            const event = {
                effect: {
                    creditType: "custom",
                    username: "user_with-special.chars",
                    amount: "10"
                }
            };

            await registerCustomCreditEffect.onTriggerEvent(event as any);

            expect(mockRegisterCustomCredit).toHaveBeenCalledWith(
                "custom",
                {
                    username: "user_with-special.chars",
                    amount: 10,
                    userDisplayName: "user_with-special.chars",
                    profilePicUrl: ""
                }
            );
        });
    });
});
