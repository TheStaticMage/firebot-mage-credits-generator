// Mock the dependencies
const mockRegisterCredit = jest.fn();
const mockGetTwitchUserByUsername = jest.fn();

jest.mock('../src/credits-store', () => ({
    currentStreamCredits: {
        registerCredit: mockRegisterCredit
    }
}));

jest.mock('../src/main', () => ({
    firebot: {
        modules: {
            userDb: {
                getTwitchUserByUsername: mockGetTwitchUserByUsername
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
import { CreditTypes } from '../src/types';

describe('registerCreditsEffectController.onTriggerEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRegisterCredit.mockReturnValue(true);
        mockGetTwitchUserByUsername.mockResolvedValue({
            username: 'testuser',
            displayName: 'Test User',
            profilePicUrl: 'https://example.com/pic.jpg',
            twitchRoles: []
        });
    });

    describe('Error handling - missing metadata', () => {
        it('should handle missing eventSource', async () => {
            const event = {
                trigger: {
                    metadata: {
                        event: { id: 'cheer' }
                        // eventSource missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should handle missing event type', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' }
                        // event missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should handle missing metadata entirely', async () => {
            const event = {
                trigger: {
                    // metadata missing
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });
    });

    describe('Twitch cheer events', () => {
        it('should register basic cheer event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'cheer' },
                        username: 'cheeruser',
                        eventData: { bits: 100 }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.CHEER,
                {
                    username: 'cheeruser',
                    amount: 100,
                    userDisplayName: 'cheeruser',
                    profilePicUrl: ''
                }
            );
        });

        it('should handle cheer with zero bits', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'cheer' },
                        username: 'zerouser',
                        eventData: { bits: 0 }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.CHEER,
                {
                    username: 'zerouser',
                    amount: 0,
                    userDisplayName: 'zerouser',
                    profilePicUrl: ''
                }
            );
        });

        it('should handle cheer with missing username', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'cheer' },
                        eventData: { bits: 100 }
                        // username missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should handle cheer with invalid bits as 0', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'cheer' },
                        username: 'invaliduser',
                        eventData: { bits: 'invalid' }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.CHEER,
                {
                    username: 'invaliduser',
                    amount: 0,
                    userDisplayName: 'invaliduser',
                    profilePicUrl: ''
                }
            );
        });
    });

    describe('Bits powerup events', () => {
        it('should register bits powerup message effect', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'bits-powerup-message-effect' },
                        username: 'powerupuser',
                        eventData: { bits: 250 }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.CHEER,
                {
                    username: 'powerupuser',
                    amount: 250,
                    userDisplayName: 'powerupuser',
                    profilePicUrl: ''
                }
            );
        });

        it('should register bits powerup celebration', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'bits-powerup-celebration' },
                        username: 'celebrateuser',
                        eventData: { bits: 500 }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.CHEER,
                {
                    username: 'celebrateuser',
                    amount: 500,
                    userDisplayName: 'celebrateuser',
                    profilePicUrl: ''
                }
            );
        });

        it('should register bits powerup gigantified emote', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'bits-powerup-gigantified-emote' },
                        username: 'giganticuser',
                        eventData: { bits: 1000 }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.CHEER,
                {
                    username: 'giganticuser',
                    amount: 1000,
                    userDisplayName: 'giganticuser',
                    profilePicUrl: ''
                }
            );
        });

        it('should not register bits powerup with missing username', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'bits-powerup-celebration' },
                        eventData: { bits: 100 }
                        // username missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should not register bits powerup with invalid bits', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'bits-powerup-celebration' },
                        username: 'testuser',
                        eventData: { bits: 'invalid' }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should not register bits powerup with zero or negative bits', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'bits-powerup-celebration' },
                        username: 'testuser',
                        eventData: { bits: 0 }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });
    });

    describe('Follow events', () => {
        it('should register Twitch follow event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'follow' },
                        username: 'followeruser',
                        eventData: {
                            userDisplayName: 'Follower Display',
                            profilePicUrl: 'https://example.com/follower.jpg'
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.FOLLOW,
                {
                    username: 'followeruser',
                    userDisplayName: 'Follower Display',
                    profilePicUrl: 'https://example.com/follower.jpg',
                    amount: 0
                }
            );
        });

        it('should register Kick follow event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'mage-kick-integration' },
                        event: { id: 'follow' },
                        username: 'kickfollower',
                        eventData: {
                            username: 'kickfollower',
                            userDisplayName: 'Kick Follower',
                            profilePicUrl: 'https://kick.com/pic.jpg'
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.FOLLOW,
                {
                    username: 'kickfollower',
                    userDisplayName: 'Kick Follower',
                    profilePicUrl: 'https://kick.com/pic.jpg',
                    amount: 0
                }
            );
        });

        it('should handle follow with minimal data', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'follow' },
                        username: 'simpleuser'
                        // eventData missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.FOLLOW,
                {
                    username: 'simpleuser',
                    userDisplayName: 'simpleuser',
                    profilePicUrl: '',
                    amount: 0
                }
            );
        });

        it('should not register follow with missing username', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'follow' }
                        // username missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });
    });

    describe('Unknown event types', () => {
        it('should not register unknown event types', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'unknown' },
                        event: { id: 'unknownevent' },
                        username: 'testuser'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should not register known source with unknown event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'unknownevent' },
                        username: 'testuser'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });
    });

    describe('Subscription events', () => {
        it('should register Twitch subscription event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'sub' },
                        username: 'subscriber'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.SUB,
                {
                    username: 'subscriber',
                    userDisplayName: 'subscriber',
                    profilePicUrl: '',
                    amount: 0
                }
            );
        });

        it('should register Kick subscription event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'mage-kick-integration' },
                        event: { id: 'sub' },
                        username: 'kicksubscriber'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.SUB,
                {
                    username: 'kicksubscriber',
                    userDisplayName: 'kicksubscriber',
                    profilePicUrl: '',
                    amount: 0
                }
            );
        });

        it('should register gift sub upgraded event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'gift-sub-upgraded' },
                        username: 'upgrader'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.SUB,
                {
                    username: 'upgrader',
                    userDisplayName: 'upgrader',
                    profilePicUrl: '',
                    amount: 0
                }
            );
        });

        it('should not register subscription with missing username', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'sub' }
                        // username missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });
    });

    describe('Gifted subscription events', () => {
        it('should register Twitch community subs gifted', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'community-subs-gifted' },
                        eventData: {
                            gifterUsername: 'gifter',
                            isAnonymous: false,
                            subCount: 5
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.GIFT,
                {
                    username: 'gifter',
                    userDisplayName: 'gifter',
                    profilePicUrl: '',
                    amount: 5
                }
            );
        });

        it('should register Twitch single sub gifted', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'subs-gifted' },
                        eventData: {
                            gifterUsername: 'singlegifter',
                            isAnonymous: false,
                            subCount: 1
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.GIFT,
                {
                    username: 'singlegifter',
                    userDisplayName: 'singlegifter',
                    profilePicUrl: '',
                    amount: 1
                }
            );
        });

        it('should register Kick community subs gifted', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'mage-kick-integration' },
                        event: { id: 'community-subs-gifted' },
                        eventData: {
                            gifterUsername: 'kickgifter',
                            isAnonymous: false,
                            subCount: 3
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.GIFT,
                {
                    username: 'kickgifter',
                    userDisplayName: 'kickgifter',
                    profilePicUrl: '',
                    amount: 3
                }
            );
        });

        it('should register Kick single sub gifted', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'mage-kick-integration' },
                        event: { id: 'subs-gifted' },
                        eventData: {
                            gifterUsername: 'kicksinglegifter',
                            isAnonymous: false
                            // subCount missing, should default to 1
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.GIFT,
                {
                    username: 'kicksinglegifter',
                    userDisplayName: 'kicksinglegifter',
                    profilePicUrl: '',
                    amount: 1
                }
            );
        });

        it('should not register anonymous gifted subs', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'community-subs-gifted' },
                        eventData: {
                            gifterUsername: 'anonymousgifter',
                            isAnonymous: true,
                            subCount: 5
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should not register gifted subs with missing gifter username', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'subs-gifted' },
                        eventData: {
                            isAnonymous: false,
                            subCount: 2
                            // gifterUsername missing
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });
    });

    describe('Raid events', () => {
        it('should register Twitch raid event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'raid' },
                        username: 'raider',
                        eventData: {
                            viewerCount: 42
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.RAID,
                {
                    username: 'raider',
                    userDisplayName: 'raider',
                    profilePicUrl: '',
                    amount: 42
                }
            );
        });

        it('should register Kick raid event', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'mage-kick-integration' },
                        event: { id: 'raid' },
                        username: 'kickraider',
                        eventData: {
                            viewerCount: 15
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.RAID,
                {
                    username: 'kickraider',
                    userDisplayName: 'kickraider',
                    profilePicUrl: '',
                    amount: 15
                }
            );
        });

        it('should handle raid with zero viewer count', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'raid' },
                        username: 'smallraider',
                        eventData: {
                            viewerCount: 0
                        }
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.RAID,
                {
                    username: 'smallraider',
                    userDisplayName: 'smallraider',
                    profilePicUrl: '',
                    amount: 0
                }
            );
        });

        it('should handle raid with missing viewer count', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'raid' },
                        username: 'unknownraider'
                        // eventData missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.RAID,
                {
                    username: 'unknownraider',
                    userDisplayName: 'unknownraider',
                    profilePicUrl: '',
                    amount: 0
                }
            );
        });

        it('should not register raid with missing username', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'raid' },
                        eventData: {
                            viewerCount: 50
                        }
                        // username missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });
    });

    describe('Viewer arrived events (VIP and Moderator detection)', () => {
        it('should register VIP when viewer has VIP role', async () => {
            mockGetTwitchUserByUsername.mockResolvedValue({
                username: 'vipuser',
                displayName: 'VIP User',
                profilePicUrl: 'https://example.com/vip.jpg',
                twitchRoles: ['vip']
            });

            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'viewer-arrived' },
                        username: 'vipuser'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockGetTwitchUserByUsername).toHaveBeenCalledWith('vipuser');
            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.VIP,
                {
                    username: 'vipuser',
                    userDisplayName: 'VIP User',
                    profilePicUrl: 'https://example.com/vip.jpg',
                    amount: 0
                }
            );
        });

        it('should register moderator when viewer has mod role', async () => {
            mockGetTwitchUserByUsername.mockResolvedValue({
                username: 'moduser',
                displayName: 'Mod User',
                profilePicUrl: 'https://example.com/mod.jpg',
                twitchRoles: ['mod']
            });

            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'viewer-arrived' },
                        username: 'moduser'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockGetTwitchUserByUsername).toHaveBeenCalledWith('moduser');
            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.MODERATOR,
                {
                    username: 'moduser',
                    userDisplayName: 'Mod User',
                    profilePicUrl: 'https://example.com/mod.jpg',
                    amount: 0
                }
            );
        });

        it('should register both VIP and moderator when viewer has both roles', async () => {
            mockGetTwitchUserByUsername.mockResolvedValue({
                username: 'supervipmod',
                displayName: 'Super VIP Mod',
                profilePicUrl: 'https://example.com/supervipmod.jpg',
                twitchRoles: ['vip', 'mod']
            });

            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'viewer-arrived' },
                        username: 'supervipmod'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockGetTwitchUserByUsername).toHaveBeenCalledWith('supervipmod');
            expect(mockRegisterCredit).toHaveBeenCalledTimes(2);
            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.VIP,
                {
                    username: 'supervipmod',
                    userDisplayName: 'Super VIP Mod',
                    profilePicUrl: 'https://example.com/supervipmod.jpg',
                    amount: 0
                }
            );
            expect(mockRegisterCredit).toHaveBeenCalledWith(
                CreditTypes.MODERATOR,
                {
                    username: 'supervipmod',
                    userDisplayName: 'Super VIP Mod',
                    profilePicUrl: 'https://example.com/supervipmod.jpg',
                    amount: 0
                }
            );
        });

        it('should not register anything when viewer has no special roles', async () => {
            mockGetTwitchUserByUsername.mockResolvedValue({
                username: 'regularuser',
                displayName: 'Regular User',
                profilePicUrl: 'https://example.com/regular.jpg',
                twitchRoles: []
            });

            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'viewer-arrived' },
                        username: 'regularuser'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockGetTwitchUserByUsername).toHaveBeenCalledWith('regularuser');
            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should handle viewer with undefined twitchRoles', async () => {
            mockGetTwitchUserByUsername.mockResolvedValue({
                username: 'noroleuser',
                displayName: 'No Role User',
                profilePicUrl: 'https://example.com/norole.jpg'
                // twitchRoles is undefined
            });

            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'viewer-arrived' },
                        username: 'noroleuser'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockGetTwitchUserByUsername).toHaveBeenCalledWith('noroleuser');
            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should not register viewer-arrived when user not found in database', async () => {
            mockGetTwitchUserByUsername.mockResolvedValue(null);

            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'viewer-arrived' },
                        username: 'unknownviewer'
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockGetTwitchUserByUsername).toHaveBeenCalledWith('unknownviewer');
            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });

        it('should not register viewer-arrived with missing username', async () => {
            const event = {
                trigger: {
                    metadata: {
                        eventSource: { id: 'twitch' },
                        event: { id: 'viewer-arrived' }
                        // username missing
                    }
                }
            };

            await registerCreditsEffectController.onTriggerEvent(event as any);

            expect(mockGetTwitchUserByUsername).not.toHaveBeenCalled();
            expect(mockRegisterCredit).not.toHaveBeenCalled();
        });
    });
});
