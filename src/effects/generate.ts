import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { logger, server } from '../main';
import { creditedUserListJSON } from '../variables/credited-user-list';

type effectParams = {
    configPath: string;
    cssPath: string;
    htmlPath: string;
    scriptPath: string;
};

export const generateCreditsEffect: Firebot.EffectType<effectParams> = {
    definition: {
        id: "magecredits:generateCredits",
        name: "Credit Generator: Generate Credits",
        description: "Returns a URL that can be used in a browser source to roll the credits.",
        icon: "fad fa-comment-alt",
        categories: ["scripting"],
        outputs: [
            {
                label: "Credits URL",
                description: "The URL to the generated credits display (set this as your OBS browser source URL).",
                defaultName: "creditsUrl"
            }
        ]
    },
    optionsTemplate: `
        <eos-container header="Custom Configuration">
            <div class="input-group" style="margin-bottom: 10px;">
                <p class="muted">Optional: Path to a custom JavaScript file to configure the elements in the credits display.</p>
                <file-chooser model="effect.configPath" options="{ filters: [ {name:'JavaScript',extensions:['js']}, {name:'All Files',extensions:['*']} ]}"></file-chooser>
            </div>
        </eos-container>

        <eos-container header="Custom Style Sheet">
            <div class="input-group" style="margin-bottom: 10px;">
                <p class="muted">Optional: Path to a custom CSS file to style the credits display.</p>
                <file-chooser model="effect.cssPath" options="{ filters: [ {name:'CSS',extensions:['css']}, {name:'All Files',extensions:['*']} ]}"></file-chooser>
            </div>
        </eos-container>

        <eos-container header="Custom HTML Template">
            <div class="input-group" style="margin-bottom: 10px;">
                <p class="muted">Optional: Path to a custom HTML file to use as the credits display template.</p>
                <file-chooser model="effect.htmlPath" options="{ filters: [ {name:'HTML',extensions:['html']}, {name:'All Files',extensions:['*']} ]}"></file-chooser>
            </div>
        </eos-container>

        <eos-container header="Custom Script">
            <div class="input-group" style="margin-bottom: 10px;">
                <p class="muted">Optional: Path to a custom JavaScript file to add functionality to the credits display.</p>
                <file-chooser model="effect.scriptPath" options="{ filters: [ {name:'JavaScript',extensions:['js']}, {name:'All Files',extensions:['*']} ]}"></file-chooser>
            </div>
        </eos-container>
    `,
    optionsController: () => {
        // No specific options controller needed for this effect.
    },
    onTriggerEvent: async (event) => {
        const { effect, trigger } = event;

        if (!server) {
            logger.error("Server is not initialized.");
            return { success: false, error: "Server is not initialized." };
        }

        try {
            const jsonData = await creditedUserListJSON.evaluator(trigger);
            const resultUrl = server.generateCredits(jsonData as string, effect.configPath ?? '', effect.cssPath ?? '', effect.htmlPath ?? '', effect.scriptPath ?? '');
            logger.info(`Credits URL generated: ${resultUrl}`);
            return {
                success: true,
                outputs: {
                    creditsUrl: resultUrl
                }
            };
        } catch (error) {
            const errorMsg = (error instanceof Error) ? error.message : String(error);
            logger.error(`Error generating credits URL: ${errorMsg}`);
            return { success: false, error: errorMsg };
        }
    }
};
