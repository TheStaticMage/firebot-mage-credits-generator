import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { currentStreamCredits } from '../credits-store';
import { logger } from '../main';
import { CreditedUser, ReservedCreditTypes } from '../types';

type registerCustomCreditEffectParams = {
    creditType: string;
    username: string;
    userDisplayName?: string;
    profilePicUrl?: string;
    amount: string;
};

export const registerCustomCreditEffect: Firebot.EffectType<registerCustomCreditEffectParams> = {
    definition: {
        id: "magecredits:registerCustom",
        name: "Credit Generator: Register custom credit",
        description: "Register a custom credit with the credits tracking system. This is an advanced effect that allows you to track custom credit types.",
        icon: "fad fa-comment-alt",
        categories: ["scripting"]
    },
    optionsTemplate: `
        <eos-container>
            <eos-container header="Credit Type" style="margin-top: 10px;" pad-top="true">
                <p class="muted">The credit type cannot end with 'ByAmount', and cannot be any of the following reserved types: ${ReservedCreditTypes.sort().join(", ")}.</p>
                <firebot-input model="effect.creditType" placeholder-text="Enter credit type" />
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
                <p class="muted">This is a number, e.g. points won or money given. If a number isn't applicable, just enter 0. If the text or variable is not a number, 0 will be assumed.</p>
                <firebot-input model="effect.amount" placeholder-text="Enter amount" />
            </eos-container>
        </eos-container>
    `,
    optionsController: () => {
        // This effect does not require a specific options controller.
    },
    optionsValidator: (effect: registerCustomCreditEffectParams) => {
        // Unfortunately this function does not have access to the reserved
        // credit types, so we need to hardcode them here. This is not ideal,
        // but it is the only way to ensure that the reserved credit types are
        // checked against the custom credit type.
        const reservedCreditTypes = [
            'cheer',
            'donation',
            'existingAllSubs',
            'existingFollowers',
            'existingGiftedSubs',
            'existingGifters',
            'existingPaidSubs',
            'extralife',
            'follow',
            'gift',
            'moderator',
            'raid',
            'sub',
            'vip'
        ];

        const errors: string[] = [];
        if (!effect.creditType || !effect.creditType.trim()) {
            errors.push("No credit type provided.");
        }
        if (!effect.username || !effect.username.trim()) {
            errors.push("No username provided.");
        }
        if (!effect.amount || !effect.amount.trim()) {
            errors.push("No valid amount provided.");
        }
        if (effect.creditType && effect.creditType.trim()) {
            if (reservedCreditTypes.map(type => type.toLocaleLowerCase()).includes(effect.creditType.toLocaleLowerCase())) {
                errors.push(`The credit type "${effect.creditType}" is reserved and cannot be used as a custom credit type.`);
            }
            if (effect.creditType.trim().toLocaleLowerCase().endsWith("byamount")) {
                errors.push("Custom credit types cannot end with the reserved string 'ByAmount'.");
            }
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        if (!effect.creditType) {
            logger.error(`Invalid credit type provided.`);
            return;
        }

        const creditType = effect.creditType.trim();
        if (!creditType) {
            logger.error(`Invalid credit type provided.`);
            return;
        }

        // Double-checking this in case the optionsValidator drifts out of sync
        // with ReservedCreditTypes.
        if (ReservedCreditTypes.includes(creditType)) {
            logger.error(`The credit type "${creditType}" is reserved and cannot be used as a custom credit type.`);
            return;
        }

        if (!effect.username || !effect.username.trim()) {
            logger.error(`No username provided for custom credit type "${creditType}".`);
            return;
        }

        const amount = effect.amount && !isNaN(Number(effect.amount.trim())) ? Number(effect.amount.trim()) : 0;

        const entry: CreditedUser = {
            username: effect.username.trim(),
            amount: amount,
            userDisplayName: effect.userDisplayName?.trim() || effect.username.trim(),
            profilePicUrl: effect.profilePicUrl?.trim() || ""
        };

        currentStreamCredits.registerCustomCredit(creditType, entry);
    }
};
