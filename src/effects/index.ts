import { RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { blockCreditsByUserEffect } from './block-by-user';
import { clearCreditsEffect } from './clear';
import { clearCreditsByUserEffect } from './clear-by-user';
import { generateCreditsEffect } from './generate';
import { registerCreditEffect } from './register-credit';
import { registerCreditBulkEffect } from './register-credit-bulk';
import { registerCreditManualEffect } from './register-credit-manual';
import { registerCustomCreditEffect } from './register-custom-credit';
import { writeDataFileEffect } from './write-data-file';

export function registerEffects(firebot: RunRequest<any>) {
    const { effectManager } = firebot.modules;
    effectManager.registerEffect(blockCreditsByUserEffect);
    effectManager.registerEffect(clearCreditsByUserEffect);
    effectManager.registerEffect(clearCreditsEffect);
    effectManager.registerEffect(generateCreditsEffect);
    effectManager.registerEffect(registerCreditBulkEffect);
    effectManager.registerEffect(registerCreditEffect);
    effectManager.registerEffect(registerCreditManualEffect);
    effectManager.registerEffect(writeDataFileEffect);

    if (firebot.parameters.enableCustomCredits) {
        // This is an advanced effect that allows users to register custom
        // credit types. It needs to be enabled in the parameters.
        effectManager.registerEffect(registerCustomCreditEffect);
    }
}
