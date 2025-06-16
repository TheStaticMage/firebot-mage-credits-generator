import { Firebot, RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { Logger } from '@crowbartools/firebot-custom-scripts-types/types/modules/logger';
import { registerEffects } from "./effects";
import { CreditedUserEntry, CreditTypes, CurrentStreamCredits, Parameters } from './types';
import { registerReplacementVariables } from "./variables";

export const currentStreamCredits: CurrentStreamCredits = {
    [CreditTypes.CHEER]: new Array<CreditedUserEntry>(),
    [CreditTypes.DONATION]: new Array<CreditedUserEntry>(),
    [CreditTypes.EXTRALIFE]: new Array<CreditedUserEntry>(),
    [CreditTypes.FOLLOW]: new Array<CreditedUserEntry>(),
    [CreditTypes.GIFT]: new Array<CreditedUserEntry>(),
    [CreditTypes.MODERATOR]: new Array<CreditedUserEntry>(),
    [CreditTypes.RAID]: new Array<CreditedUserEntry>(),
    [CreditTypes.SUB]: new Array<CreditedUserEntry>(),
    [CreditTypes.VIP]: new Array<CreditedUserEntry>()
};

export let firebot: RunRequest<any>;
export let logger: Logger;

const scriptVersion = '0.0.1';

const script: Firebot.CustomScript<Parameters> = {
    getScriptManifest: () => {
        return {
            name: 'Mage Credits Generator',
            description: 'Track support for the channel and acknowledge it with a credits display.',
            author: 'The Static Mage',
            version: scriptVersion,
            firebotVersion: '5'
        };
    },
    getDefaultParameters: () => {
        return {
            enumerateExistingFollowers: {
                type: "boolean",
                title: "Enumerate Existing Followers",
                description: "The script will enumerate existing followers and add them to the credits data output.",
                default: false,
                tip: "You can speed up the script by disabling this option if you don't need to enumerate existing followers."
            },
            enumerateExistingSubscribers: {
                type: "boolean",
                title: "Enumerate Existing Subscribers",
                description: "The script will enumerate existing subscribers (and gifters) and add them to the credits data output.",
                default: true,
                tip: "You can speed up the script by disabling this option if you don't need to enumerate existing subscribers (and gifters)."
            },
            enableCustomCredits: {
                type: "boolean",
                title: "Enable Custom Credit Types",
                description: "Enable the 'Register custom credit' effect so that you can register custom credit types in addition to the built-in credit types.",
                default: false,
                tip: "This enables an advanced effect allowing you to track custom credit types. Requires Firebot restart to take effect."
            }
        };
    },
    run: (runRequest) => {
        firebot = runRequest;
        logger = runRequest.modules.logger;
        registerEffects(runRequest);
        registerReplacementVariables(runRequest);
    }
};

export default script;
