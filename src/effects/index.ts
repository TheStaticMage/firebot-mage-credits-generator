import { RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { registerCreditEffect } from './register-credit';
import { registerCreditManualEffect } from './register-credit-manual';
import { registerCustomCreditEffect } from './register-custom-credit';

export function registerEffects(firebot: RunRequest<any>) {
    const { effectManager } = firebot.modules;
    effectManager.registerEffect(registerCreditEffect);
    effectManager.registerEffect(registerCreditManualEffect);

    if (firebot.parameters.enableCustomCredits) {
        // This is an advanced effect that allows users to register custom
        // credit types. It needs to be enabled in the parameters.
        effectManager.registerEffect(registerCustomCreditEffect);
    }
}
