import { ReplaceVariable } from '@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager';
import { currentStreamCredits, firebot, logger } from '../main';
import { getFollowers } from '../twitch-api/followers';
import { getAllSubscribers, getGiftedSubscribers, getGifters, getPaidSubscribers } from '../twitch-api/subscribers';
import { CreditedUser, CreditedUserEntry, CreditTypes } from '../types';

const categories: string[] = [
    CreditTypes.CHEER as string,
    CreditTypes.DONATION as string,
    CreditTypes.EXTRALIFE as string,
    'existingAllSubs',
    'existingFollowers',
    'existingGiftedSubs',
    'existingGifters',
    'existingGiftersByAmount',
    'existingPaidSubs',
    CreditTypes.FOLLOW as string,
    CreditTypes.GIFT as string,
    CreditTypes.MODERATOR as string,
    CreditTypes.RAID as string,
    CreditTypes.SUB as string,
    CreditTypes.VIP as string
];

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
                usage: 'creditedUserList[existingGiftersByAmount]',
                description: 'Generates a list of Firebot user names who have gifted subscriptions to the channel that are currently active, sorted by amount.'
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
    switch (category) {
        case CreditTypes.CHEER as string:
            return collectAndSortByUsername(currentStreamCredits[CreditTypes.CHEER]);
        case CreditTypes.DONATION as string:
            return collectAndSortByUsername(currentStreamCredits[CreditTypes.DONATION]);
        case CreditTypes.EXTRALIFE as string:
            return collectAndSortByUsername(currentStreamCredits[CreditTypes.EXTRALIFE]);
        case CreditTypes.FOLLOW as string:
            return collectAndSortByUsername(currentStreamCredits[CreditTypes.FOLLOW]);
        case CreditTypes.GIFT as string:
            return collectAndSortByUsername(currentStreamCredits[CreditTypes.GIFT]);
        case CreditTypes.MODERATOR as string:
            return removeStreamerAndBot(collectAndSortByUsername(currentStreamCredits[CreditTypes.MODERATOR]));
        case CreditTypes.RAID as string:
            return collectAndSortByUsername(currentStreamCredits[CreditTypes.RAID]);
        case CreditTypes.SUB as string:
            return collectAndSortByUsername(currentStreamCredits[CreditTypes.SUB]);
        case CreditTypes.VIP as string:
            return removeStreamerAndBot(collectAndSortByUsername(currentStreamCredits[CreditTypes.VIP]));
        case 'existingAllSubs':
            return collectAndSortByUsername(await getAllSubscribers());
        case 'existingFollowers':
            return collectAndSortByUsername(await getFollowers());
        case 'existingGiftedSubs':
            return collectAndSortByUsername(await getGiftedSubscribers());
        case 'existingGifters':
            return collectAndSortByUsername(await getGifters());
        case 'existingGiftersByAmount':
            return collectAndSortByAmount(await getGifters());
        case 'existingPaidSubs':
            return collectAndSortByUsername(await getPaidSubscribers());
        default:
            logger.error(`creditedUserList: Invalid category '${category}' provided. Valid categories are: ${categories.join(', ')}`);
            return [];
    }
}

export const creditedUserListJSON: ReplaceVariable = {
    definition: {
        handle: 'creditedUserListJSON',
        usage: 'creditedUserListJSON',
        description: `Generates a JSON string of credited users for the specified category (array). If a category is not provided, it will return an object containing all of the categories. Categories include: ${categories.join(', ')}.`,
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

        if (args.length === 1) {
            const category = args[0];
            if (!categories.includes(category)) {
                logger.error(`creditedUserListJSON: Invalid category '${category}' provided. Valid categories are: ${categories.join(', ')}`);
                return "";
            }

            const users = await getEntriesByCategory(category);
            if (!users) {
                logger.error(`creditedUserListJSON: No users found for category '${category}'.`);
                return "";
            }

            const userObjects = await Promise.all(users.map((entry: CreditedUserEntry) => getUserObject(entry)));
            const result = userObjects.filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
            return JSON.stringify(result, null, 2);
        }

        const results: Record<string, CreditedUserEntry[]> = {};
        for (const category of categories) {
            const users = await getEntriesByCategory(category);
            if (!users) {
                logger.error(`creditedUserListJSON: No users found for category '${category}'.`);
                return "";
            }

            const userObjects = await Promise.all(users.map((entry: CreditedUserEntry) => getUserObject(entry)));
            const result = userObjects.filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
            results[category] = result;
        }
        return JSON.stringify(results, null, 2);
    }
};

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
