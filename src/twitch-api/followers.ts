import { HelixChannelFollower } from '@twurple/api';
import * as NodeCache from 'node-cache';
import { firebot, logger } from "../main";
import { CreditedUserEntry } from '../types';

const cache = new NodeCache({checkperiod: 3, stdTTL: 30});
const cacheKey = "twitchFollowers";

export async function getFollowers(): Promise<CreditedUserEntry[]> {
    if (!firebot.parameters.enumerateExistingFollowers) {
        logger.debug('getFollowers: Enumeration of existing followers is disabled, returning empty list');
        return [];
    }

    return await getFollowerListFromTwitch();
}

async function getFollowerListFromTwitch(): Promise<CreditedUserEntry[]> {
    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
        logger.debug(`getFollowerListFromTwitch: Found cached value for ${cacheKey}`);
        return cachedValue as CreditedUserEntry[];
    }

    logger.debug(`getFollowerListFromTwitch: No cached value for ${cacheKey}, fetching from Twitch API`);

    const broadcasterId = firebot.firebot.accounts.streamer.userId;
    const { twitchApi } = firebot.modules;
    const client = twitchApi.getClient();

    // Get the full follower list from twitch
    const request = client.channels.getChannelFollowersPaginated(broadcasterId);
    const followerUsernames = new Set<string>();
    try {
        let page: HelixChannelFollower[];
        while ((page = await request.getNext()).length) {
            for (const follower of page) {
                if (follower.userId === broadcasterId) {
                    continue; // Skip the broadcaster
                }
                followerUsernames.add(follower.userName);
            }
        }
    } catch (error) {
        logger.error('getFollowerListFromTwitch: Error fetching followers:', error);
        return [];
    }
    logger.debug(`getFollowerListFromTwitch: Found ${followerUsernames.size} followers.`);

    const result: CreditedUserEntry[] = [];
    for (const username of followerUsernames) {
        result.push({ username, amount: 0 });
    }

    // Cache and return the result
    cache.set(cacheKey, result);
    logger.debug(`getFollowerListFromTwitch: Cached value for ${cacheKey}`);
    return result;
}
