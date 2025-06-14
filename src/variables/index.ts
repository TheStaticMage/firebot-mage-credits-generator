import { RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { base64EncodeReplaceVariable } from './base64encode';
import { creditedUserList, creditedUserListJSON } from './credited-user-list';

export function registerReplacementVariables(firebot: RunRequest<any>) {
    const { replaceVariableManager } = firebot.modules;
    replaceVariableManager.registerReplaceVariable(base64EncodeReplaceVariable);
    replaceVariableManager.registerReplaceVariable(creditedUserList);
    replaceVariableManager.registerReplaceVariable(creditedUserListJSON);
}
