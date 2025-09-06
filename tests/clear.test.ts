// Mock the dependencies
const mockClearAllCredits = jest.fn();
const mockClearCredits = jest.fn();

jest.mock('../src/credits-store', () => ({
    currentStreamCredits: {
        clearAllCredits: mockClearAllCredits,
        clearCredits: mockClearCredits
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

import { clearCreditsEffect } from '../src/effects/clear';
import { CreditTypes } from '../src/types';

describe('clearCreditsEffect.onTriggerEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Clear all credits', () => {
        it('should clear all credits when all flag is true', async () => {
            const event = {
                effect: {
                    all: true,
                    builtInCategories: [],
                    customCategories: ""
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearAllCredits).toHaveBeenCalledTimes(1);
            expect(mockClearCredits).not.toHaveBeenCalled();
        });

        it('should not process other categories when all flag is true', async () => {
            const event = {
                effect: {
                    all: true,
                    builtInCategories: [CreditTypes.CHEER, CreditTypes.FOLLOW],
                    customCategories: "custom1,custom2"
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearAllCredits).toHaveBeenCalledTimes(1);
            expect(mockClearCredits).not.toHaveBeenCalled();
        });
    });

    describe('Clear specific categories', () => {
        it('should clear specified built-in categories only', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [CreditTypes.CHEER, CreditTypes.FOLLOW],
                    customCategories: ""
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([
                CreditTypes.CHEER,
                CreditTypes.FOLLOW
            ]);
            expect(mockClearAllCredits).not.toHaveBeenCalled();
        });

        it('should clear specified custom categories only', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [],
                    customCategories: "custom1,custom2"
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([
                "custom1",
                "custom2"
            ]);
            expect(mockClearAllCredits).not.toHaveBeenCalled();
        });

        it('should clear both built-in and custom categories', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [CreditTypes.SUB, CreditTypes.RAID],
                    customCategories: "birthday,anniversary"
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([
                CreditTypes.SUB,
                CreditTypes.RAID,
                "birthday",
                "anniversary"
            ]);
        });
    });

    describe('Custom categories parsing', () => {
        it('should handle comma-separated custom categories', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [],
                    customCategories: "custom1,custom2,custom3"
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([
                "custom1",
                "custom2",
                "custom3"
            ]);
        });

        it('should handle space-separated custom categories', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [],
                    customCategories: "custom1 custom2 custom3"
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([
                "custom1",
                "custom2",
                "custom3"
            ]);
        });

        it('should handle mixed separators and trim whitespace', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [],
                    customCategories: " custom1 , custom2,  custom3   custom4 "
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([
                "custom1",
                "custom2",
                "custom3",
                "custom4"
            ]);
        });

        it('should filter out empty entries', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [],
                    customCategories: "custom1,,custom2,  ,custom3"
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([
                "custom1",
                "custom2",
                "custom3"
            ]);
        });
    });

    describe('Edge cases', () => {
        it('should handle no categories specified', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [],
                    customCategories: ""
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([]);
            expect(mockClearAllCredits).not.toHaveBeenCalled();
        });

        it('should remove duplicate categories', async () => {
            const event = {
                effect: {
                    all: false,
                    builtInCategories: [CreditTypes.CHEER, CreditTypes.CHEER],
                    customCategories: "custom1,custom1,custom2"
                }
            };

            await clearCreditsEffect.onTriggerEvent(event as any);

            expect(mockClearCredits).toHaveBeenCalledWith([
                CreditTypes.CHEER,
                "custom1",
                "custom2"
            ]);
        });
    });
});
