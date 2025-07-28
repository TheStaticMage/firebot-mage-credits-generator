import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { firebot, logger } from '../main';
import { base64EncodeReplaceVariable } from '../variables/base64encode';
import { creditedUserListJSON } from '../variables/credited-user-list';

type effectParams = {
    filepath: string;
};

export const writeDataFileEffect: Firebot.EffectType<effectParams> = {
    definition: {
        id: "magecredits:writeDataFile",
        name: "Credit Generator: Write data file",
        description: "Write data to a file for the credits tracking system.",
        icon: "fad fa-comment-alt",
        categories: ["scripting"]
    },
    optionsTemplate: `
        <eos-container header="File">
            <file-chooser model="effect.filepath" options="{ filters: [ {name:'JavaScript',extensions:['js']}, {name:'All Files',extensions:['*']} ]}"></file-chooser>
        </eos-container>
    `,
    optionsController: () => {
        // This effect does not require a specific options controller.
    },
    optionsValidator: (effect: effectParams) => {
        const errors = [];
        if (effect.filepath == null || effect.filepath === "") {
            errors.push("Please select a text file to write to.");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect, trigger } = event;
        const { fs } = firebot.modules;

        const header = `// File maintained by Firebot -- DO NOT EDIT\n`;
        const jsonData = await creditedUserListJSON.evaluator(trigger);
        const data = await base64EncodeReplaceVariable.evaluator(trigger, jsonData as string);
        const content = `${header}\nconst data = "${data}";\n`;

        try {
            fs.writeFileSync(effect.filepath, content, 'utf8');
            logger.info(`Data successfully written to ${effect.filepath}`);
            return { success: true };
        } catch (error) {
            const errorMsg = (error instanceof Error) ? error.message : String(error);
            logger.error(`Failed to write data to ${effect.filepath}: ${errorMsg}`);
            return { success: false, error: errorMsg };
        }
    }
};
