import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { currentStreamCredits, firebot, logger } from '../main';
import { getFollowers } from '../twitch-api/followers';
import { getAllSubscribers, getGiftedSubscribers, getGifters, getPaidSubscribers } from '../twitch-api/subscribers';
import { CreditedUser, CreditedUserEntry, CreditTypes, existingCategories } from '../types';

export const creditedUserList: ReplaceVariable = {
    definition: {
        handle: 'creditedUserList',
        usage: 'creditedUserList[category]',
        description: 'Generates a list of credited users for the specified category.',
        examples: [
            {
                usage: 'creditedUserList[cheer]',
                description: 'Generates a list of Firebot user names who have cheered in the channel during this stream. This includes cheers and other forms of bits usage.'
            },
            {
                usage: 'creditedUserList[donation]',
                description: 'Generates a list of Firebot user names who have donated/tipped to the channel during this stream.'
            },
            {
                usage: 'creditedUserList[extralife]',
                description: 'Generates a list of Firebot user names who have donated during this stream to Extra Life.'
            },
            {
                usage: 'creditedUserList[existingAllSubs]',
                description: 'Generates a list of Firebot user names who are currently subscribers to the channel (whether gifted or paid).'
            },
            {
                usage: 'creditedUserList[existingFollowers]',
                description: 'Generates a list of Firebot user names who are currently following the channel.'
            },
            {
                usage: 'creditedUserList[existingGiftedSubs]',
                description: 'Generates a list of Firebot user names who are currently subscribers to the channel (gifted by someone else).'
            },
            {
                usage: 'creditedUserList[existingGifters]',
                description: 'Generates a list of Firebot user names who have gifted subscriptions to the channel that are currently active, sorted by name.'
            },
            {
                usage: 'creditedUserList[existingPaidSubs]',
                description: 'Generates a list of Firebot user names who are currently subscribed to the channel (paid themselves, not gifted).'
            },
            {
                usage: 'creditedUserList[follow]',
                description: 'Generates a list of Firebot user names who have followed the channel during this stream.'
            },
            {
                usage: 'creditedUserList[gift]',
                description: 'Generates a list of Firebot user names who have gifted subscriptions to the channel during this stream.'
            },
            {
                usage: 'creditedUserList[moderator]',
                description: 'Generates a list of Firebot user names who are moderators of the channel during this stream. Excludes streamer and bot.'
            },
            {
                usage: 'creditedUserList[raid]',
                description: 'Generates a list of Firebot user names who have raided the channel during this stream.'
            },
            {
                usage: 'creditedUserList[sub]',
                description: 'Generates a list of Firebot user names who have subscribed to the channel during this stream.'
            },
            {
                usage: 'creditedUserList[vip]',
                description: 'Generates a list of Firebot user names who are VIPs in the channel during this stream. Excludes streamer and bot.'
            },
            {
                usage: 'creditedUserList[some_custom_credit_type]',
                description: 'Generates a list of Firebot user names added for the specified custom credit type.'
            }
        ],
        possibleDataOutput: ["array"]
    },
    async evaluator(_, ...args: any[]): Promise<string[]> {
        if (args.length !== 1) {
            logger.error(`creditedUserList requires exactly one argument: the category of credited users. It was called with ${args.length} arguments.`);
            return [];
        }

        const category = args[0];

        const result = await getEntriesByCategory(category);
        if (!result) {
            logger.error(`creditedUserList: Invalid category '${category}'.`);
            return [];
        }

        if (category === 'existingGiftersByAmount') {
            const sortedEntries = collectAndSortByAmount(result);
            return sortedEntries.map(entry => entry.username);
        }

        const sortedEntries = collectAndSortByUsername(result);
        return sortedEntries.map(entry => entry.username);
    }
};

async function getEntriesByCategory(category: string): Promise<CreditedUserEntry[] | undefined> {
    const switchCategory = category.trim().toLocaleLowerCase().endsWith('byamount') ? category.trim().slice(0, -'byamount'.length) : category.trim();
    switch (switchCategory) {
        case CreditTypes.CHEER as string:
            return collectAndSort(currentStreamCredits[CreditTypes.CHEER], category);
        case CreditTypes.DONATION as string:
            return collectAndSort(currentStreamCredits[CreditTypes.DONATION], category);
        case CreditTypes.EXTRALIFE as string:
            return collectAndSort(currentStreamCredits[CreditTypes.EXTRALIFE], category);
        case CreditTypes.FOLLOW as string:
            return collectAndSort(currentStreamCredits[CreditTypes.FOLLOW], category);
        case CreditTypes.GIFT as string:
            return collectAndSort(currentStreamCredits[CreditTypes.GIFT], category);
        case CreditTypes.MODERATOR as string:
            return removeStreamerAndBot(collectAndSort(currentStreamCredits[CreditTypes.MODERATOR], category));
        case CreditTypes.RAID as string:
            return collectAndSort(currentStreamCredits[CreditTypes.RAID], category);
        case CreditTypes.SUB as string:
            return collectAndSort(currentStreamCredits[CreditTypes.SUB], category);
        case CreditTypes.VIP as string:
            return removeStreamerAndBot(collectAndSort(currentStreamCredits[CreditTypes.VIP], category));
        case 'existingAllSubs':
            return collectAndSort(await getAllSubscribers(), category);
        case 'existingFollowers':
            return collectAndSort(await getFollowers(), category);
        case 'existingGiftedSubs':
            return collectAndSort(await getGiftedSubscribers(), category);
        case 'existingGifters':
            return collectAndSort(await getGifters(), category);
        case 'existingPaidSubs':
            return collectAndSort(await getPaidSubscribers(), category);
        default:
            if (currentStreamCredits[switchCategory]) {
                return collectAndSort(currentStreamCredits[switchCategory], category);
            }

            logger.warn(`creditedUserList: Unknown category '${category}' provided.`);
            return [];
    }
};

export const creditedUserListJSON: ReplaceVariable = {
    definition: {
        handle: 'creditedUserListJSON',
        usage: 'creditedUserListJSON',
        description: 'Generates a JSON string of credited users for the specified category (array). If a category is not provided, it will return an object containing all of the categories.',
        possibleDataOutput: ["text"],
        examples: [
            {
                usage: 'creditedUserListJSON',
                description: 'Example output: {"cheer":[{"username":"sub1","displayName":"Subscriber1","profilePicUrl":"https://example.com/sub1.jpg","amount":100}],"follower":[{"username":"sub2","displayName":"Subscriber2","profilePicUrl":"https://example.com/sub2.jpg","amount":1}]}'
            },
            {
                usage: 'creditedUserListJSON[cheer]',
                description: 'Example output: [{"username":"user1","displayName":"User1","profilePicUrl":"https://example.com/user1.jpg","amount":100},{"username":"user2","displayName":"User2","profilePicUrl":"https://example.com/user2.jpg","amount":50}]'
            }
        ]
    },
    async evaluator(_, ...args: any[]): Promise<string> {
        logger.debug(`creditedUserListJSON called with arguments: ${JSON.stringify(args)}`);
        if (args.length > 1) {
            logger.error(`creditedUserListJSON requires zero or one arguments. It was called with ${args.length} arguments.`);
            return "";
        }

        const results: Record<string, CreditedUserEntry[]> = {};
        const allCategories = Object.keys(currentStreamCredits).concat(existingCategories);
        for (const category of allCategories.sort()) {
            if (args.length === 1) {
                const switchCategory = args[0].trim().toLocaleLowerCase().endsWith('byamount') ? args[0].trim().slice(0, -'byamount'.length) : args[0].trim();
                if (category.trim().toLocaleLowerCase() !== switchCategory.toLocaleLowerCase()) {
                    continue;
                }
            }

            for (const suffix of ['ByAmount', '']) {
                const fullCategory = category + suffix;
                const users = await getEntriesByCategory(fullCategory);
                if (!users) {
                    logger.debug(`creditedUserListJSON: No users found for category '${fullCategory}'.`);
                    continue;
                }

                const userObjects = await Promise.all(users.map((entry: CreditedUserEntry) => getUserObject(entry)));
                const result = userObjects.filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

                // Twitch seems to have an inferiority complex or insecurity
                // about their competitor Kick, but I won't want anyone to get
                // banned on my account for showing the Kick logo on a Twitch
                // stream. But this workaround is Kick's fault anyway, since
                // their profile picture URLs are broken
                // (https://github.com/KickEngineering/KickDevDocs/issues/166)
                // so we will replace it with a Twitch default profile picture.
                for (const entry of result) {
                    if (entry.profilePicUrl === "https://kick.com/favicon.ico") {
                        entry.profilePicUrl = "https://static-cdn.jtvnw.net/user-default-pictures-uv/ead5c8b2-a4c9-4724-b1dd-9f00b46cbd3d-profile_image-300x300.png";
                    }
                }
                results[fullCategory] = result;
            }
        }
        return JSON.stringify(results, null, 2);
    }
};

function collectAndSort(entries: CreditedUserEntry[], category: string): CreditedUserEntry[] {
    if (!entries || entries.length === 0) {
        return [];
    }
    if (category.trim().toLocaleLowerCase().endsWith('byamount')) {
        return collectAndSortByAmount(entries);
    }
    return collectAndSortByUsername(entries);
}

function collectAndSortByAmount(entries: CreditedUserEntry[]): CreditedUserEntry[] {
    const sortedEntries = collectEntries(entries).sort((a, b) => b.amount - a.amount || a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));
    return sortedEntries.map(entry => ({ username: entry.username, amount: entry.amount }));
}

function collectAndSortByUsername(entries: CreditedUserEntry[]): CreditedUserEntry[] {
    const sortedEntries = collectEntries(entries).sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));
    return sortedEntries.map(entry => ({ username: entry.username, amount: entry.amount }));
}

function collectEntries(entries: CreditedUserEntry[]): CreditedUserEntry[] {
    if (!entries || entries.length === 0) {
        return [];
    }
    const entryMap: Record<string, number> = {};
    for (const entry of entries) {
        entryMap[entry.username] = (entryMap[entry.username] || 0) + (entry.amount || 0);
    }
    return Object.entries(entryMap).map(([username, amount]) => ({ username, amount }));
}

function removeStreamerAndBot(input: CreditedUserEntry[]): CreditedUserEntry[] {
    const streamer = firebot.firebot.accounts.streamer.username;
    const bot = firebot.firebot.accounts.bot.username;
    return input.filter(user => user.username !== streamer && user.username !== bot);
}

async function getUserObject(entry: CreditedUserEntry): Promise<CreditedUser | undefined> {
    const { userDb } = firebot.modules;
    const user = await userDb.getTwitchUserByUsername(entry.username);
    if (!user) {
        logger.warn(`creditedUserList: User not found in database: ${entry.username}`);
        return undefined;
    }
    return {
        username: user.username,
        displayName: user.displayName,
        profilePicUrl: user.profilePicUrl,
        amount: entry.amount || 0
    };
}
