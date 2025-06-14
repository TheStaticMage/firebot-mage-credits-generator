import { RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { creditedUserList, creditedUserListJSON } from './credited-user-list';
import { sprintfReplaceVariable } from './sprintf';

export function registerReplacementVariables(firebot: RunRequest<any>) {
    const { replaceVariableManager } = firebot.modules;
    replaceVariableManager.registerReplaceVariable(creditedUserList);
    replaceVariableManager.registerReplaceVariable(creditedUserListJSON);
    replaceVariableManager.registerReplaceVariable(sprintfReplaceVariable);
}
