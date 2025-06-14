import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { logger } from '../main';

// This could become part of core Firebot at some point, so this is "namespace"
// prefixed to avoid conflicts.
export const base64EncodeReplaceVariable: ReplaceVariable = {
    definition: {
        handle: 'creditedUserListBase64encode',
        usage: 'creditedUserListBase64encode[string]',
        description: 'Encodes a string in base64.',
        examples: [
            {
                usage: 'creditedUserListBase64encode["Hello, World!"]',
                description: 'Encodes the string "Hello, World!" in base64.'
            }
        ],
        possibleDataOutput: ['text']
    },
    async evaluator(_, ...args: any[]): Promise<string> {
        if (args.length < 1) {
            logger.error(`creditedUserListBase64encode requires at least one argument: the string to encode.`);
            return "";
        }

        const encoder = new TextEncoder();
        return btoa(String.fromCharCode(...encoder.encode(args[0])));
    }
};
