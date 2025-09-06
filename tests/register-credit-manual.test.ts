// Mock the dependencies
const mockRegisterBuiltInCredit = jest.fn();

jest.mock('../src/effects/common', () => ({
    registerBuiltInCredit: mockRegisterBuiltInCredit
}));

jest.mock('../src/main', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    }
}));

import { registerCreditManualEffect } from '../src/effects/register-credit-manual';
import { CreditTypes } from '../src/types';

describe('registerCreditManualEffect.onTriggerEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Valid registrations', () => {
        it('should register a basic credit with minimal data', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.CHEER,
                    username: "testuser",
                    amount: 100
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "testuser",
                    amount: 100,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                },
                CreditTypes.CHEER
            );
        });

        it('should register a credit with all optional fields', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.DONATION,
                    username: "donor123",
                    userDisplayName: "Donor Display Name",
                    profilePicUrl: "https://example.com/pic.jpg",
                    amount: 25.50
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "donor123",
                    amount: 25.50,
                    userDisplayName: "Donor Display Name",
                    profilePicUrl: "https://example.com/pic.jpg"
                },
                CreditTypes.DONATION
            );
        });

        it('should register all built-in credit types', async () => {
            const allTypes = Object.values(CreditTypes);

            for (const creditType of allTypes) {
                const event = {
                    effect: {
                        eventType: creditType,
                        username: `user_${creditType}`,
                        amount: 10
                    }
                };

                await registerCreditManualEffect.onTriggerEvent(event as any);

                expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                    {
                        username: `user_${creditType}`,
                        amount: 10,
                        userDisplayName: `user_${creditType}`,
                        profilePicUrl: ""
                    },
                    creditType
                );
            }

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledTimes(allTypes.length);
        });
    });

    describe('Data processing', () => {
        it('should trim whitespace from username', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.FOLLOW,
                    username: "  spaceduser  ",
                    amount: 0
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "spaceduser",
                    amount: 0,
                    userDisplayName: "spaceduser",
                    profilePicUrl: ""
                },
                CreditTypes.FOLLOW
            );
        });

        it('should trim whitespace from userDisplayName', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.SUB,
                    username: "testuser",
                    userDisplayName: "  Display Name  ",
                    amount: 0
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "testuser",
                    amount: 0,
                    userDisplayName: "Display Name",
                    profilePicUrl: ""
                },
                CreditTypes.SUB
            );
        });

        it('should trim whitespace from profilePicUrl', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.VIP,
                    username: "vipuser",
                    profilePicUrl: "  https://example.com/pic.jpg  ",
                    amount: 0
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "vipuser",
                    amount: 0,
                    userDisplayName: "vipuser",
                    profilePicUrl: "https://example.com/pic.jpg"
                },
                CreditTypes.VIP
            );
        });

        it('should use username as userDisplayName when userDisplayName is not provided', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.MODERATOR,
                    username: "moduser",
                    amount: 0
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "moduser",
                    amount: 0,
                    userDisplayName: "moduser",
                    profilePicUrl: ""
                },
                CreditTypes.MODERATOR
            );
        });

        it('should use empty string for profilePicUrl when not provided', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.GIFT,
                    username: "giftuser",
                    amount: 5
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "giftuser",
                    amount: 5,
                    userDisplayName: "giftuser",
                    profilePicUrl: ""
                },
                CreditTypes.GIFT
            );
        });

        it('should handle zero amount', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.RAID,
                    username: "raider",
                    amount: 0
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "raider",
                    amount: 0,
                    userDisplayName: "raider",
                    profilePicUrl: ""
                },
                CreditTypes.RAID
            );
        });

        it('should handle undefined amount as 0', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.EXTRALIFE,
                    username: "extralifeuser"
                    // amount not provided
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "extralifeuser",
                    amount: 0,
                    userDisplayName: "extralifeuser",
                    profilePicUrl: ""
                },
                CreditTypes.EXTRALIFE
            );
        });
    });

    describe('Error handling', () => {
        it('should not register when eventType is missing', async () => {
            const event = {
                effect: {
                    username: "testuser",
                    amount: 100
                    // eventType not provided
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).not.toHaveBeenCalled();
        });

        it('should not register when eventType is empty string', async () => {
            const event = {
                effect: {
                    eventType: "",
                    username: "testuser",
                    amount: 100
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).not.toHaveBeenCalled();
        });

        it('should not register when eventType is null', async () => {
            const event = {
                effect: {
                    eventType: null,
                    username: "testuser",
                    amount: 100
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('should handle empty string values gracefully', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.CHEER,
                    username: "",
                    userDisplayName: "",
                    profilePicUrl: "",
                    amount: 100
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "",
                    amount: 100,
                    userDisplayName: "",
                    profilePicUrl: ""
                },
                CreditTypes.CHEER
            );
        });

        it('should handle negative amounts', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.CHEER,
                    username: "testuser",
                    amount: -50
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "testuser",
                    amount: -50,
                    userDisplayName: "testuser",
                    profilePicUrl: ""
                },
                CreditTypes.CHEER
            );
        });

        it('should handle very large amounts', async () => {
            const event = {
                effect: {
                    eventType: CreditTypes.DONATION,
                    username: "bigdonor",
                    amount: 999999.99
                }
            };

            await registerCreditManualEffect.onTriggerEvent(event as any);

            expect(mockRegisterBuiltInCredit).toHaveBeenCalledWith(
                {
                    username: "bigdonor",
                    amount: 999999.99,
                    userDisplayName: "bigdonor",
                    profilePicUrl: ""
                },
                CreditTypes.DONATION
            );
        });
    });
});
