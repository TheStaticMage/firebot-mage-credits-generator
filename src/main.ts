import { Firebot, RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { Logger } from '@crowbartools/firebot-custom-scripts-types/types/modules/logger';
import { registerEffects } from "./effects";
import { Parameters } from './types';
import { registerReplacementVariables } from "./variables";
import { Server } from './server/server';
import { registerEvents } from './events';

export let firebot: RunRequest<any>;
export let logger: Logger;
export let server: Server | null = null;

const scriptVersion = '0.2.3';

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
        server = new Server();
        server.start();
        registerEffects(runRequest);
        registerEvents();
        registerReplacementVariables(runRequest);
    }
};

export default script;
