import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { currentStreamCredits } from '../credits-store';
import { logger } from '../main';

type effectParams = {
    username: string;
};

export const unblockCreditsByUserEffect: Firebot.EffectType<effectParams> = {
    definition: {
        id: "magecredits:unblockCreditsByUser",
        name: "Credit Generator: Unblock Credits By User",
        description: "Removes any prior block on credits for a user.",
        icon: "fad fa-comment-alt",
        categories: ["scripting"]
    },
    optionsTemplate: `
        <eos-container style="padding-bottom: 10px;">
            <eos-container header="Username" style="margin-top: 10px;" pad-top="true">
                <firebot-input model="effect.username" placeholder-text="Enter username" />
            </eos-container>
        </eos-container>
    `,
    optionsController: () => {
        // This effect does not require a specific options controller.
    },
    optionsValidator: (effect): string[] => {
        const errors: string[] = [];
        if (!effect.username || effect.username.trim().length === 0) {
            errors.push("Username is required.");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;
        currentStreamCredits.unblockCreditsByUser(effect.username);
        logger.info(`Unblocked credits for user: ${effect.username}`);
    }
};
