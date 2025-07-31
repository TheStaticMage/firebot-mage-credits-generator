import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { currentStreamCredits, logger } from '../main';

type effectParams = {
    all: boolean;
    builtInCategories: string[];
    customCategories: string;
};

export const clearCreditsEffect: Firebot.EffectType<effectParams> = {
    definition: {
        id: "magecredits:clearCredits",
        name: "Credit Generator: Clear Credits",
        description: "Clears the credits from one or more categories without needing to restart Firebot.",
        icon: "fad fa-comment-alt",
        categories: ["scripting"]
    },
    optionsTemplate: `
        <eos-container style="padding-bottom: 10px;">
            <eos-container header="Clear All Credits" style="margin-top: 10px;" pad-top="true">
                <p class="muted">This will clear all credits from the system, including built-in and custom categories.</p>
                <firebot-checkbox model="effect.all" label="Clear all credits" />
            </eos-container>

            <eos-container header="Built-in Categories" style="margin-top: 10px;" pad-top="true">
                <div ng-repeat="category in builtInCategories">
                    <firebot-checkbox model="selectedBuiltInCategories[category.key]" label="{{category.label}}" />
                </div>
            </eos-container>

            <eos-container header="Custom Categories" style="margin-top: 10px;" pad-top="true">
                <p class="muted">Enter custom category keys to clear. Separate multiple keys with spaces or commas. Keys are case sensitive!</p>
                <firebot-input
                    model="effect.customCategories"
                    placeholder-text="Enter custom category keys, separated by spaces or commas"
                    disable-variables="true"
                />
            </eos-container>
        </eos-container>
    `,
    optionsController: ($scope) => {
        if (!$scope.effect) {
            $scope.effect = {
                all: false,
                builtInCategories: [],
                customCategories: ""
            };
        }

        if (!$scope.effect.builtInCategories) {
            $scope.effect.builtInCategories = [];
        }

        if (!$scope.effect.customCategories) {
            $scope.effect.customCategories = "";
        }

        $scope.builtInCategories = [
            { key: "cheer", label: "Cheer" },
            { key: "donation", label: "Donation" },
            { key: "follow", label: "Follow" },
            { key: "gift", label: "Gift" },
            { key: "moderator", label: "Moderator" },
            { key: "raid", label: "Raid" },
            { key: "sub", label: "Sub" },
            { key: "vip", label: "VIP" }
        ];

        $scope.selectedBuiltInCategories = $scope.effect.builtInCategories.reduce<Record<string, boolean>>((acc: Record<string, boolean>, category: string) => {
            acc[category] = true;
            return acc;
        }, {});

        $scope.$watch('selectedBuiltInCategories', (newValue) => {
            $scope.effect.builtInCategories = Object.keys(newValue as Record<string, boolean>).filter(key => (newValue as Record<string, boolean>)[key]);
        }, true);
    },
    optionsValidator: (effect): string[] => {
        const errors: string[] = [];
        const builtInCategories = Object.values(effect.builtInCategories).filter(Boolean);
        const customCategories = effect.customCategories.split(/[\s,]+/).map(entry => entry.trim()).filter(entry => entry.length > 0);

        const keys = effect.all ? 1 : builtInCategories.length + customCategories.length;
        if (keys === 0) {
            errors.push("No categories selected to clear.");
        }

        const reservedCreditTypes = [
            'cheer',
            'donation',
            'existingAllSubs',
            'existingFollowers',
            'existingGiftedSubs',
            'existingGifters',
            'existingPaidSubs',
            'extralife',
            'follow',
            'gift',
            'moderator',
            'raid',
            'sub',
            'vip'
        ];
        for (const category of customCategories) {
            if (reservedCreditTypes.includes(category.toLocaleLowerCase())) {
                errors.push(`The category "${category}" is reserved and cannot be used as a custom category.`);
            }
            if (category.trim().toLocaleLowerCase().endsWith("byamount")) {
                errors.push("Custom categories cannot end with the reserved string 'ByAmount'.");
            }
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;

        // Determine which categories to clear
        let categoriesToClear: string[] = [];

        if (effect.all) {
            // Clear all built-in and custom categories
            categoriesToClear = Object.keys(currentStreamCredits);
        } else {
            categoriesToClear = [
                ...(Array.isArray(effect.builtInCategories) ? effect.builtInCategories : []),
                ...effect.customCategories.split(/[\s,]+/).map(entry => entry.trim()).filter(entry => entry.length > 0)
            ];
        }
        categoriesToClear = Array.from(new Set(categoriesToClear));

        // Clear credits for selected categories
        categoriesToClear.forEach((category) => {
            if (currentStreamCredits[category]) {
                currentStreamCredits[category] = [];
            }
        });

        logger.info(`Cleared credits for categories: ${categoriesToClear.join(", ")}`);
    }
};
