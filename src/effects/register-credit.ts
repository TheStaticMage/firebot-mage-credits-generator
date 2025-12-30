import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { Trigger, TriggersObject } from '@crowbartools/firebot-custom-scripts-types/types/triggers';
import { currentStreamCredits } from '../credits-store';
import { firebot, logger } from '../main';
import { CreditedUser, CreditTypes } from '../types';

type registerCreditEffectParams = Record<string, never>;

const triggers: TriggersObject = {};
triggers["event"] = [
    'twitch:cheer',
    'combo-event:bits-combo', // https://github.com/TheStaticMage/firebot-combo-event
    'mage-kick-integration:kicks-gifted', // Kicks, like bits
    // 'extralife:donation', TODO support in future
    'streamelements:donation', // This is a tip not a donation in the traditional sense
    // 'streamlabs:donation', TODO support in future
    // 'streamlabs:eldonation', TODO support in future
    // 'TipeeeStream:donation', TODO support in future
    'twitch:charity-donation',
    'mage-kick-integration:follow',
    'twitch:follow',
    // 'streamelements:follow', TODO support in future
    // 'streamlabs:follow', TODO support in future
    'mage-kick-integration:community-subs-gifted',
    'twitch:community-subs-gifted',
    'mage-kick-integration:subs-gifted',
    'twitch:subs-gifted',
    'mage-kick-integration:raid', // Kick hosts
    'twitch:raid',
    'mage-kick-integration:sub',
    'twitch:sub',
    'twitch:gift-sub-upgraded',
    'mage-kick-integration:chat-message',
    'mage-kick-integration:viewer-arrived',
    'mage-youtube-integration:chat-message',
    'mage-youtube-integration:viewer-arrived',
    'twitch:chat-message',
    'twitch:viewer-arrived',
    "twitch:bits-powerup-message-effect",
    "twitch:bits-powerup-celebration",
    "twitch:bits-powerup-gigantified-emote"
];
triggers["manual"] = true;

export const registerCreditEffect: Firebot.EffectType<registerCreditEffectParams> = {
    definition: {
        id: "magecredits:register",
        name: "Credit Generator: Register event",
        description: "Register an event with the credits tracking system. This can register events such as cheers, donations, follows, gifts, raids, and subs based on the event metadata so that you do not need to specify parameters manually.",
        icon: "fad fa-comment-alt",
        categories: ["scripting"],
        triggers: triggers
    },
    optionsTemplate: `
        <eos-container>
            <div class="effect-info">
                This can register events such as cheers, donations, follows, gifts, raids, and subs based on the event metadata.
                If you want to specify parameters manually, use the 'Credit Generator: Register event manually' effect instead.
            </div>
        </eos-container>
    `,
    optionsController: () => {
        // No parameters needed for this effect
    },
    optionsValidator: () => {
        return [];
    },
    onTriggerEvent: async (event) => {
        registerCreditsEffectController.onTriggerEvent(event);
    }
};

class RegisterCreditsEffectController {
    async onTriggerEvent(event: {
        trigger: Trigger;
    }) {
        const trigger = event.trigger;

        const eventSource = trigger.metadata?.eventSource?.id;
        if (!eventSource) {
            logger.error(`registerCreditEffect: Invalid event source provided for trigger. metadata: ${JSON.stringify(trigger.metadata)}`);
            return;
        }

        const eventType = trigger.metadata?.event?.id;
        if (!eventType) {
            logger.error(`registerCreditEffect: Invalid event type provided for trigger. metadata: ${JSON.stringify(trigger.metadata)}`);
            return;
        }

        const eventSourceAndType = `${eventSource}:${eventType}`;

        switch (eventSourceAndType) {
            case 'combo-event:bits-combo':
            case 'mage-kick-integration:kicks-gifted':
            case 'twitch:cheer': {
                const username = trigger.metadata?.username;
                if (!username) {
                    logger.error(`registerCreditEffect: No username provided for trigger. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }
                currentStreamCredits.registerCredit(CreditTypes.CHEER, {
                    username: username,
                    amount: forceNumber(trigger.metadata?.eventData?.bits),
                    userDisplayName: username,
                    profilePicUrl: (trigger.metadata?.eventData?.profilePicUrl as string) || ""
                });
                logger.debug(`Registered cheer from ${eventSourceAndType} for user ${username} (${forceNumber(trigger.metadata?.eventData?.bits)}).`);
                break;
            }
            case 'twitch:bits-powerup-message-effect':
            case 'twitch:bits-powerup-celebration':
            case 'twitch:bits-powerup-gigantified-emote': {
                const username = trigger.metadata?.username;
                if (!username) {
                    logger.error(`registerCreditEffect: No username provided for bits powerup event. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }
                const bits = trigger.metadata?.eventData?.bits;
                if (bits == null || isNaN(Number(bits))) {
                    logger.error(`registerCreditEffect: No bits provided in the event data for bits powerup event. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }
                if (Number(bits) <= 0) {
                    logger.warn(`registerCreditEffect: Bits provided for bits powerup event is zero or negative. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                currentStreamCredits.registerCredit(CreditTypes.CHEER, {
                    username: username,
                    amount: forceNumber(bits),
                    userDisplayName: username,
                    profilePicUrl: (trigger.metadata?.eventData?.profilePicUrl as string) || ""
                });
                logger.debug(`Registered bits powerup event from ${eventSourceAndType} for user ${username} (${forceNumber(bits)}).`);
                break;
            }
            case 'streamelements:donation': {
                // This sends the donor's name but that's not necessarily a Twitch username.
                const donor = trigger.metadata?.eventData?.from as string;
                if (!donor) {
                    logger.error(`registerCreditEffect: No donor ('from') provided in the event data. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                const donationAmount = trigger.metadata?.eventData?.donationAmount;
                if (donationAmount == null || isNaN(Number(donationAmount))) {
                    logger.error(`registerCreditEffect: No donationAmount provided in the event data. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                let displayName = donor;
                let profilePicUrl = "";
                let username = donor.replace(/\s+/g, '').toLowerCase(); // Best guess at a username

                const { viewerDatabase } = firebot.modules;
                const user = await viewerDatabase.getViewerByUsername(username.replace(/\s+/g, '').toLowerCase());
                if (user) {
                    displayName = user.displayName || user.username || donor;
                    username = user.username || donor.replace(/\s+/g, '').toLowerCase();
                    profilePicUrl = user.profilePicUrl || "";
                } else {
                    logger.warn(`registerCreditEffect: User '${donor}' not found in Firebot user database. Registering donation event as best guess.`);
                }

                currentStreamCredits.registerCredit(CreditTypes.DONATION, {
                    username: username,
                    amount: forceNumber(donationAmount),
                    userDisplayName: displayName,
                    profilePicUrl: profilePicUrl
                });
                logger.debug(`Registered donation/tip from ${eventSourceAndType} for donor ${donor} (${forceNumber(donationAmount)}).`);
                break;
            }
            case 'twitch:charity-donation': {
                const username = trigger.metadata?.username;
                if (!username) {
                    logger.error(`registerCreditEffect: No username provided for charity donation. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                const donationAmount = trigger.metadata?.eventData?.donationAmount;
                if (donationAmount == null || isNaN(Number(donationAmount))) {
                    logger.error(`registerCreditEffect: No donationAmount provided in the event data for charity donation. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                const userDisplayName = trigger.metadata?.eventData?.userDisplayName || username;

                currentStreamCredits.registerCredit(CreditTypes.CHARITY_DONATION, {
                    username: username,
                    amount: forceNumber(donationAmount),
                    userDisplayName: userDisplayName as string,
                    profilePicUrl: (trigger.metadata?.eventData?.profilePicUrl as string) || ""
                });
                logger.debug(`Registered charity donation from ${eventSourceAndType} for user ${username} (${forceNumber(donationAmount)}).`);
                break;
            }
            case 'mage-kick-integration:follow':
            case 'twitch:follow': {
                const userName = (trigger.metadata.username) || (trigger.metadata.eventData?.username);
                const userDisplayName = (trigger.metadata.eventData?.userDisplayName) || userName;
                const profilePicUrl = (trigger.metadata.eventData?.profilePicUrl) || "";
                if (!userName) {
                    logger.error(`registerCreditEffect: No username provided for follow event. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                currentStreamCredits.registerCredit(CreditTypes.FOLLOW, {
                    username: userName as string,
                    userDisplayName: userDisplayName as string,
                    profilePicUrl: profilePicUrl as string,
                    amount: 0
                });
                logger.debug(`Registered follow from ${eventSourceAndType} for user ${userName as string}.`);
                break;
            }
            case 'mage-kick-integration:community-subs-gifted':
            case 'mage-kick-integration:subs-gifted':
            case 'twitch:community-subs-gifted':
            case 'twitch:subs-gifted': {
                const isAnonymous = trigger.metadata?.eventData?.isAnonymous as boolean;
                if (isAnonymous) {
                    logger.debug(`registerCreditEffect: Anonymous subs gifted event detected. No username to register.`);
                    return;
                }

                const username = trigger.metadata?.eventData?.gifterUsername as string;
                if (!username) {
                    logger.error(`registerCreditEffect: No gifter username provided for subs gifted event. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                currentStreamCredits.registerCredit(CreditTypes.GIFT, {
                    username: username,
                    userDisplayName: username,
                    profilePicUrl: (trigger.metadata?.eventData?.profilePicUrl as string) || "",
                    amount: forceNumber(trigger.metadata?.eventData?.subCount || 1)
                });
                logger.debug(`Registered subs gifted from ${eventSourceAndType} for user ${username} (${forceNumber(trigger.metadata?.eventData?.subCount || 1)}).`);
                break;
            }
            case 'mage-kick-integration:raid':
            case 'twitch:raid': {
                const username = trigger.metadata?.username;
                if (!username) {
                    logger.error(`registerCreditEffect: No username provided for trigger. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                currentStreamCredits.registerCredit(CreditTypes.RAID, {
                    username: username,
                    userDisplayName: username,
                    profilePicUrl: (trigger.metadata?.eventData?.profilePicUrl as string) || "",
                    amount: forceNumber(trigger.metadata?.eventData?.viewerCount)
                });
                logger.debug(`Registered raid from ${eventSourceAndType} for user ${username} (${forceNumber(trigger.metadata?.eventData?.viewerCount)}).`);
                break;
            }
            case 'mage-kick-integration:sub':
            case 'twitch:sub':
            case 'twitch:gift-sub-upgraded': {
                const username = trigger.metadata?.username;
                if (!username) {
                    logger.error(`registerCreditEffect: No username provided for trigger. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }
                const amount = Math.max(forceNumber(trigger.metadata?.eventData?.totalMonths), 1);
                currentStreamCredits.registerCredit(CreditTypes.SUB, {
                    username: username,
                    userDisplayName: username,
                    profilePicUrl: (trigger.metadata?.eventData?.profilePicUrl as string) || "",
                    amount: amount
                });
                logger.debug(`Registered subscription from ${eventSourceAndType} for user ${username} for ${amount} months.`);
                break;
            }
            case 'mage-kick-integration:chat-message':
            case 'mage-kick-integration:viewer-arrived':
            case 'mage-youtube-integration:chat-message':
            case 'mage-youtube-integration:viewer-arrived':
            case 'twitch:chat-message':
            case 'twitch:viewer-arrived': {
                const metadata = trigger.metadata;
                if (!metadata || !metadata.eventData || !metadata.eventData.chatMessage) {
                    logger.error(`registerCreditEffect: Missing metadata for viewer-arrived event.`);
                    return;
                }

                type partOfFirebotChatMessage = {
                    username: string;
                    userId: string;
                    userDisplayName?: string;
                    profilePicUrl?: string;
                    roles: string[];
                    isFounder?: boolean;
                    isBroadcaster?: boolean;
                    isBot?: boolean;
                    isMod?: boolean;
                    isSubscriber?: boolean;
                    isVip?: boolean;
                    isFirstChat?: boolean;
                }

                const chatMessage = metadata.eventData.chatMessage as partOfFirebotChatMessage;
                if (!chatMessage || !chatMessage.username) {
                    logger.error(`registerCreditEffect: Invalid chatMessage provided for chat-message/viewer-arrived event. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                const userEntry: CreditedUser = {
                    username: chatMessage.username,
                    userDisplayName: chatMessage.userDisplayName || chatMessage.username,
                    profilePicUrl: chatMessage.profilePicUrl || "",
                    amount: eventType === 'chat-message' ? 1 : 0 // Count chat messages
                };

                if (eventSource === 'mage-kick-integration') {
                    userEntry.username = chatMessage.username.endsWith("@kick") ? chatMessage.username : `${chatMessage.username}@kick`;
                    userEntry.userDisplayName = chatMessage.userDisplayName || userEntry.username.substring(0, userEntry.username.length - 5);
                }

                if (eventSource === 'mage-youtube-integration') {
                    userEntry.username = chatMessage.username.endsWith("@youtube") ? chatMessage.username : `${chatMessage.username}@youtube`;
                    userEntry.userDisplayName = chatMessage.userDisplayName || userEntry.username.substring(0, userEntry.username.length - 8);
                }

                if (chatMessage.roles.includes('vip') || chatMessage.isVip) {
                    currentStreamCredits.registerCredit(CreditTypes.VIP, userEntry);
                    logger.debug(`Registered VIP chat for user ${userEntry.username}.`);
                }

                if (chatMessage.roles.includes('mod') || chatMessage.isMod) {
                    currentStreamCredits.registerCredit(CreditTypes.MODERATOR, userEntry);
                    logger.debug(`Registered moderator chat for user ${userEntry.username}.`);
                }

                break;
            }
            default:
                logger.error(`registerCreditEffect: Unknown event type "${eventType}" provided for trigger. metadata: ${JSON.stringify(trigger.metadata)}`);
                return;
        }
    }
}

function forceNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}

export const registerCreditsEffectController = new RegisterCreditsEffectController();
