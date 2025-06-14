import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { logger } from '../main';
import { sprintf } from 'sprintf-js';

export const sprintfReplaceVariable: ReplaceVariable = {
    definition: {
        handle: 'sprintf',
        usage: 'sprintf[template, ...values]',
        description: 'Formats a string using the specified template and values.',
        examples: [
            {
                usage: 'sprintf["Hello, %s!", "World"]',
                description: 'Formats the string "Hello, World!" using the template and value provided.'
            },
            {
                usage: 'sprintf["%d + %d = %d", 2, 3, 5]',
                description: 'Formats the string "2 + 3 = 5" using the template and values provided.'
            },
            {
                usage: 'sprintf["%s tipped $%0.2f", "Alice", 5]',
                description: 'Formats the string "Alice tipped $5.00" using the template and values provided.'
            }
        ],
        possibleDataOutput: ['text']
    },
    async evaluator(_, ...args: any[]): Promise<string> {
        if (args.length < 1) {
            logger.error(`sprintf requires at least one argument: the template string.`);
            return "";
        }

        return sprintf(args[0], ...args.slice(1));
    }
};
