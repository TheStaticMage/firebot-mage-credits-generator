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

const scriptVersion = '0.3.0';

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
        // Make sure we have a sufficiently recent version of Firebot.
        // We need https://github.com/crowbartools/Firebot/commit/39eb2629acc48daf03113db6fb44f5ebf2fe2062
        if (!runRequest || !runRequest.firebot || !runRequest.firebot.version) {
            throw new Error("Firebot version information is not available.");
        }

        const firebotVersion = runRequest.firebot.version;
        const firebotParts = firebotVersion.split('.');
        const majorVersion = parseInt(firebotParts[0], 10);
        const minorVersion = parseInt(firebotParts[1] || '0', 10);
        if (isNaN(majorVersion) || isNaN(minorVersion) || majorVersion < 5 || (majorVersion === 5 && minorVersion < 65)) {
            const { frontendCommunicator } = runRequest.modules;
            frontendCommunicator.send("error", `The installed version of Mage Credits Generator requires Firebot 5.65 or later. You are running Firebot ${firebotVersion}. Please update Firebot to use this plugin.`);
            return;
        }

        // Run everything else.
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
