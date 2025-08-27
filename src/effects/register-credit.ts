import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { Effects } from '@crowbartools/firebot-custom-scripts-types/types/effects';
import { currentStreamCredits, firebot, logger } from '../main';
import { CreditTypes } from '../types';

type registerCreditEffectParams = Record<string, never>;

const triggers: Effects.TriggersObject = {};
triggers["event"] = [
    'twitch:cheer',
    // 'extralife:donation', TODO support in future
    'streamelements:donation',
    // 'streamlabs:donation', TODO support in future
    // 'streamlabs:eldonation', TODO support in future
    // 'TipeeeStream:donation', TODO support in future
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
            case 'twitch:cheer': {
                const username = trigger.metadata?.username;
                if (!username) {
                    logger.error(`registerCreditEffect: No username provided for trigger. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }
                currentStreamCredits[CreditTypes.CHEER].push({username: username, amount: forceNumber(trigger.metadata?.eventData?.bits)});
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

                currentStreamCredits[CreditTypes.CHEER].push({username: username, amount: forceNumber(bits)});
                logger.debug(`Registered bits powerup event from ${eventSourceAndType} for user ${username} (${forceNumber(bits)}).`);
                break;
            }
            case 'streamelements:donation': {
                const donor = trigger.metadata?.eventData?.from as string;
                if (!donor) {
                    logger.error(`registerCreditEffect: No from provided in the event data. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                const donationAmount = trigger.metadata?.eventData?.donationAmount;
                if (donationAmount == null || isNaN(Number(donationAmount))) {
                    logger.error(`registerCreditEffect: No donationAmount provided in the event data. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                const { userDb } = firebot.modules;
                const user = await userDb.getTwitchUserByUsername(donor);
                if (user == null) {
                    logger.warn(`registerCreditEffect: User '${donor}' not found in Firebot user database. Cannot register donation/tip event.`);
                    return;
                }

                currentStreamCredits[CreditTypes.DONATION].push({username: user.username, amount: forceNumber(donationAmount)});
                logger.debug(`Registered donation/tip from ${eventSourceAndType} for user ${user.username} (${forceNumber(donationAmount)}).`);
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

                currentStreamCredits[CreditTypes.FOLLOW].push({username: userName as string, userDisplayName: userDisplayName as string, profilePicUrl: profilePicUrl as string, amount: 0});
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

                currentStreamCredits[CreditTypes.GIFT].push({username: username, amount: forceNumber(trigger.metadata?.eventData?.subCount || 1)});
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

                currentStreamCredits[CreditTypes.RAID].push({username: username, amount: forceNumber(trigger.metadata?.eventData?.viewerCount)});
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
                currentStreamCredits[CreditTypes.SUB].push({username: username, amount: 0});
                logger.debug(`Registered subscription from ${eventSourceAndType} for user ${username}.`);
                break;
            }
            case 'twitch:viewer-arrived': {
                const username = trigger.metadata?.username;
                if (!username) {
                    logger.error(`registerCreditEffect: No username provided for viewer-arrived event. metadata: ${JSON.stringify(trigger.metadata)}`);
                    return;
                }

                const { userDb } = firebot.modules;
                const user = await userDb.getTwitchUserByUsername(username);
                if (user == null) {
                    logger.warn(`registerCreditEffect: User '${username}' not found in Firebot user database. Cannot register viewer-arrived event.`);
                    return;
                }

                if (user.twitchRoles?.includes('vip')) {
                    currentStreamCredits[CreditTypes.VIP].push({username: user.username, amount: 0});
                    logger.debug(`Registered VIP chat for user ${username}.`);
                }

                if (user.twitchRoles?.includes('mod')) {
                    currentStreamCredits[CreditTypes.MODERATOR].push({username: user.username, amount: 0});
                    logger.debug(`Registered moderator chat for user ${username}.`);
                }

                break;
            }
            default:
                logger.error(`registerCreditEffect: Unknown event type "${eventType}" provided for trigger. metadata: ${JSON.stringify(trigger.metadata)}`);
                return;
        }
    }
};

function forceNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}
