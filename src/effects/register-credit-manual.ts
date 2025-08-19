import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { currentStreamCredits, logger } from '../main';
import { CreditedUser, CreditTypes } from '../types';

type registerCreditManualEffectParams = {
    eventType: string;
    username: string;
    userDisplayName?: string;
    profilePicUrl?: string;
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

            <eos-container header="User Display Name" style="margin-top: 10px;" pad-top="true">
                <firebot-input model="effect.userDisplayName" placeholder-text="Enter user display name" />
            </eos-container>

            <eos-container header="User Profile Picture URL" style="margin-top: 10px;" pad-top="true">
                <firebot-input model="effect.profilePicUrl" placeholder-text="Enter user profile picture URL" />
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

        const entry: CreditedUser = {
            username: effect.username.trim(),
            amount: effect.amount || 0,
            userDisplayName: effect.userDisplayName?.trim() || effect.username.trim(),
            profilePicUrl: effect.profilePicUrl?.trim() || ""
        };

        switch (eventType) {
            case CreditTypes.CHEER as string:
                currentStreamCredits[CreditTypes.CHEER].push(entry);
                logger.debug(`Registered cheer: ${JSON.stringify(entry)}`);
                break;
            case CreditTypes.DONATION as string:
                currentStreamCredits[CreditTypes.DONATION].push(entry);
                logger.debug(`Registered donation/tip: ${JSON.stringify(entry)}`);
                break;
            case CreditTypes.EXTRALIFE as string:
                currentStreamCredits[CreditTypes.EXTRALIFE].push(entry);
                logger.debug(`Registered Extralife donation: ${JSON.stringify(entry)}`);
                break;
            case CreditTypes.FOLLOW as string:
                currentStreamCredits[CreditTypes.FOLLOW].push(entry);
                logger.debug(`Registered follow: ${JSON.stringify(entry)}`);
                break;
            case CreditTypes.GIFT as string:
                currentStreamCredits[CreditTypes.GIFT].push(entry);
                logger.debug(`Registered gift: ${JSON.stringify(entry)}`);
                break;
            case CreditTypes.MODERATOR as string:
                currentStreamCredits[CreditTypes.MODERATOR].push(entry);
                logger.debug(`Registered moderator: ${JSON.stringify(entry)}`);
                break;
            case CreditTypes.RAID as string:
                currentStreamCredits[CreditTypes.RAID].push(entry);
                logger.debug(`Registered raid: ${JSON.stringify(entry)}`);
                break;
            case CreditTypes.SUB as string:
                currentStreamCredits[CreditTypes.SUB].push(entry);
                logger.debug(`Registered sub: ${JSON.stringify(entry)}`);
                break;
            case CreditTypes.VIP as string:
                currentStreamCredits[CreditTypes.VIP].push(entry);
                logger.debug(`Registered VIP: ${JSON.stringify(entry)}`);
                break;
            default:
                logger.error(`Unknown event type "${eventType}" provided.`);
                return;
        }
    }
};
