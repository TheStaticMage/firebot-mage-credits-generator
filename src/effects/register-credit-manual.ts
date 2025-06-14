import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { currentStreamCredits, logger } from '../main';
import { CreditTypes } from '../types';

type registerCreditManualEffectParams = {
    eventType: string;
    username: string;
    amount: number;
};

export const registerCreditManualEffect: Firebot.EffectType<registerCreditManualEffectParams> = {
    definition: {
        id: "magecredits:registerManual",
        name: "Credit Generator: Register event manually",
        description: "Register an event with the credits tracking system. You must provide the username and event type.",
        icon: "fad fa-comment-alt",
        categories: ["scripting"]
    },
    optionsTemplate: `
        <eos-container>
            <eos-container header="Event Type" style="margin-top: 10px;" pad-top="true">
                <dropdown-select options="eventTypes" selected="effect.eventType"></dropdown-select>
            </eos-container>

            <eos-container header="Username" style="margin-top: 10px;" pad-top="true">
                <firebot-input model="effect.username" placeholder-text="Enter username" />
            </eos-container>

            <eos-container header="Amount" style="margin-top: 10px;" pad-top="true">
                <firebot-input model="effect.amount" placeholder-text="Enter amount" />
            </eos-container>
        </eos-container>
    `,
    optionsController: ($scope: any) => {
        $scope.eventTypes = {
            "cheer": "Cheered",
            "donation": "Donated/Tipped",
            "extralife": "Extralife donation",
            "follow": "Followed",
            "gift": "Gifted sub(s)",
            "moderator": "Moderator chatted",
            "raid": "Raided",
            "sub": "Subscribed",
            "vip": "VIP chatted"
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.eventType) {
            errors.push("No event type selected.");
        }
        if (!effect.username) {
            errors.push("No username provided.");
        }
        if (!effect.amount) {
            errors.push("No amount provided.");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        const eventType = effect.eventType;
        if (!eventType) {
            logger.error(`Invalid event type provided.`);
            return;
        }

        switch (eventType) {
            case CreditTypes.CHEER as string:
                currentStreamCredits[CreditTypes.CHEER].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered cheer for user ${effect.username}`);
                break;
            case CreditTypes.DONATION as string:
                currentStreamCredits[CreditTypes.DONATION].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered donation/tip for user ${effect.username}`);
                break;
            case CreditTypes.EXTRALIFE as string:
                currentStreamCredits[CreditTypes.EXTRALIFE].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered Extralife donation for user ${effect.username}`);
                break;
            case CreditTypes.FOLLOW as string:
                currentStreamCredits[CreditTypes.FOLLOW].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered follow for user ${effect.username}`);
                break;
            case CreditTypes.GIFT as string:
                currentStreamCredits[CreditTypes.GIFT].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered gift for user ${effect.username}`);
                break;
            case CreditTypes.MODERATOR as string:
                currentStreamCredits[CreditTypes.MODERATOR].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered moderator for user ${effect.username}`);
                break;
            case CreditTypes.RAID as string:
                currentStreamCredits[CreditTypes.RAID].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered raid for user ${effect.username}`);
                break;
            case CreditTypes.SUB as string:
                currentStreamCredits[CreditTypes.SUB].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered sub for user ${effect.username}`);
                break;
            case CreditTypes.VIP as string:
                currentStreamCredits[CreditTypes.VIP].push({username: effect.username, amount: effect.amount || 0});
                logger.debug(`Registered VIP for user ${effect.username}`);
                break;
            default:
                logger.error(`Unknown event type "${eventType}" provided.`);
                return;
        }
    }
};
