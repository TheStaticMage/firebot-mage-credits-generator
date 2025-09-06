import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { currentStreamCredits } from '../credits-store';
import { logger } from '../main';
import { CreditedUser } from '../types';
import { registerBuiltInCredit } from './common';

type registerCreditBulkEffectParams = {
    eventClass: 'builtin' | 'custom';
    eventCustomType: string;
    eventType: string;
    data: string;
};

export const registerCreditBulkEffect: Firebot.EffectType<registerCreditBulkEffectParams> = {
    definition: {
        id: "magecredits:registerBulk",
        name: "Credit Generator: Register bulk credits",
        description: "Register multiple credits for a list of users.",
        icon: "fad fa-comment-alt",
        categories: ["scripting"],
        outputs: [
            {
                label: 'Credits registered',
                description: 'The number of credits registered.',
                defaultName: 'creditsRegistered'
            },
            {
                label: 'Credits failed',
                description: 'The number of credits that failed to register.',
                defaultName: 'creditsFailed'
            }
        ]
    },
    optionsTemplate: `
        <eos-container>
            <eos-container header="Event Type" style="margin-top: 10px;" pad-top="true">
                <firebot-radio-container>
                    <firebot-radio label="Built-In" model="effect.eventClass" value="'builtin'" />
                    <div ng-if="effect.eventClass === 'builtin'" style="margin-top: 10px; margin-bottom: 20px;">
                        <p class="muted">Select one of the built-in event types.</p>
                        <dropdown-select options="eventTypes" selected="effect.eventType"></dropdown-select>
                    </div>

                    <firebot-radio label="Custom" model="effect.eventClass" value="'custom'" />
                    <div ng-if="effect.eventClass === 'custom'" style="margin-top: 10px; margin-bottom: 10px;">
                        <p class="muted">Enter a custom event type. This can be any string, but should match the event type used elsewhere in your setup.</p>
                        <firebot-input model="effect.eventCustomType" placeholder-text="Enter custom event type" />
                    </div>
                </firebot-radio-container>
            </eos-container>

            <eos-container header="Data" style="margin-top: 10px;" pad-top="true">
                <p class="muted">Enter data in one of these formats (one per line):</p>
                <ul>
                    <li><strong>username</strong> - Username with amount=0.</li>
                    <li><strong>username,amount</strong> - Comma separated.</li>
                    <li><strong>username amount</strong> - Space separated.</li>
                    <li><strong>JSON</strong> - Array of "username" and "amount" properties.</li>
                </ul>
                <firebot-input model="effect.data" placeholder-text="Enter data" use-text-area="true" rows="4" cols="40" menu-position="under" />
            </eos-container>
        </eos-container>
    `,
    optionsController: ($scope: any) => {
        $scope.eventTypes = {
            "cheer": "Cheered",
            "donation": "Donated/Tipped",
            "extralife": "Extralife donation",
            "follow": "Followed",
            "gift": "Gifted sub(s)",
            "moderator": "Moderator chatted",
            "raid": "Raided",
            "sub": "Subscribed",
            "vip": "VIP chatted"
        };
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (!effect.eventClass) {
            errors.push("No event class selected.");
        }
        if (effect.eventClass === 'builtin' && !effect.eventType) {
            errors.push("No event type selected.");
        }
        if (effect.eventClass === 'custom' && !effect.eventCustomType) {
            errors.push("No custom event type provided.");
        }
        if (!effect.data) {
            errors.push("No data provided.");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        const eventClass = effect.eventClass;
        if (!eventClass) {
            logger.error(`Invalid event class provided.`);
            return {
                success: false, message: 'Invalid event class provided.'
            };
        }

        const usersAndAmounts: { username: string; amount: number }[] = [];
        let success = 0;
        let failed = 0;

        try {
            // Try to parse as JSON array of { username, amount }
            const parsed = JSON.parse(effect.data);
            if (Array.isArray(parsed)) {
                for (const obj of parsed) {
                    if (typeof obj.username === 'string' && typeof obj.amount === 'number') {
                        usersAndAmounts.push({ username: obj.username, amount: obj.amount });
                    } else {
                        failed++;
                    }
                }
            } else {
                throw new Error('Not an array');
            }
        } catch {
            // Not JSON, parse line by line
            const lines = effect.data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            for (const line of lines) {
                let username = '';
                let amount = 0;

                if (line.includes(',')) {
                    const [u, a] = line.split(',').map(s => s.trim());
                    username = u.trim();
                    amount = Number(a.trim()) || 0;
                } else if (line.match(/\s+/)) {
                    const parts = line.split(/\s+/).map(s => s.trim());
                    username = parts[0];
                    amount = Number(parts[1].trim()) || 0;
                } else { // Just username
                    username = line.trim();
                    amount = 0;
                }
                if (username) {
                    usersAndAmounts.push({ username, amount });
                } else {
                    failed++;
                }
            }
        }

        for (const item of usersAndAmounts) {
            const entry: CreditedUser = {
                username: item.username.trim(),
                amount: item.amount || 0,
                userDisplayName: item.username.trim(),
                profilePicUrl: ""
            };
            if (eventClass === 'builtin') {
                if (registerBuiltInCredit(entry, effect.eventType)) {
                    success++;
                } else {
                    logger.error(`Failed to register built-in credit for user ${item.username} with event type ${effect.eventType}`);
                    failed++;
                }
            } else {
                currentStreamCredits.registerCustomCredit(effect.eventCustomType, entry);
                success++;
            }
        }

        return {
            success: success > 0 || failed === 0,
            outputs: {
                creditsRegistered: success,
                creditsFailed: failed
            }
        };
    }
};
