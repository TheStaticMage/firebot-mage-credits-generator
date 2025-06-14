import { RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { registerCreditEffect } from './register-credit';
import { registerCreditManualEffect } from './register-credit-manual';

export function registerEffects(firebot: RunRequest<any>) {
    const { effectManager } = firebot.modules;
    effectManager.registerEffect(registerCreditEffect);
    effectManager.registerEffect(registerCreditManualEffect);
}
