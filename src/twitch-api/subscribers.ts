import { HelixSubscription } from '@twurple/api';
import * as NodeCache from 'node-cache';
import { firebot, logger } from "../main";
import { CreditedUser } from '../types';

const cache = new NodeCache({checkperiod: 3, stdTTL: 30});
const cacheTwitchSubscriberKey = "twitchSubscribers";

interface cacheValue {
    gifters: Record<string, number>;
    allSubscribers: string[];
    giftedSubscribers: string[];
    paidSubscribers: string[];
}

export async function getGifters(): Promise<CreditedUser[]> {
    const subscriberLists = await getSubscriberListsFromTwitch();
    if (!subscriberLists) {
        logger.warn('getGifters: No subscriber lists found');
        return [];
    }

    const result: CreditedUser[] = [];
    for (const [username, amount] of Object.entries(subscriberLists.gifters)) {
        result.push({ username: username, amount: amount });
    }
    return result;
}

export async function getAllSubscribers(): Promise<CreditedUser[]> {
    const subscriberLists = await getSubscriberListsFromTwitch();
    if (!subscriberLists) {
        logger.warn('getAllSubscribers: No subscriber lists found');
        return [];
    }

    const result: CreditedUser[] = [];
    for (const username of subscriberLists.allSubscribers) {
        result.push({ username: username, amount: 1 });
    }
    return result;
}

export async function getGiftedSubscribers(): Promise<CreditedUser[]> {
    const subscriberLists = await getSubscriberListsFromTwitch();
    if (!subscriberLists) {
        logger.warn('getGiftedSubscribers: No subscriber lists found');
        return [];
    }

    const result: CreditedUser[] = [];
    for (const username of subscriberLists.giftedSubscribers) {
        result.push({ username: username, amount: 1 });
    }
    return result;
}

export async function getPaidSubscribers(): Promise<CreditedUser[]> {
    const subscriberLists = await getSubscriberListsFromTwitch();
    if (!subscriberLists) {
        logger.warn('getPaidSubscribers: No subscriber lists found');
        return [];
    }

    const result: CreditedUser[] = [];
    for (const username of subscriberLists.paidSubscribers) {
        result.push({ username: username, amount: 1 });
    }
    logger.debug(`getPaidSubscribers: Found ${result.length} paid subscribers.`);
    return result;
}

async function getSubscriberListsFromTwitch(): Promise<cacheValue | undefined> {
    if (!firebot.parameters.enumerateExistingSubscribers) {
        logger.warn('getSubscriberListsFromTwitch: Enumeration of existing subscribers is disabled');
        return undefined;
    }

    const cachedValue = cache.get(cacheTwitchSubscriberKey);
    if (cachedValue) {
        logger.debug(`getSubscriberListsFromTwitch: Returning cached value for ${cacheTwitchSubscriberKey}`);
        return cachedValue as cacheValue;
    }

    logger.debug(`getSubscriberListsFromTwitch: No cached value for ${cacheTwitchSubscriberKey}, fetching from Twitch API`);

    const broadcasterId = firebot.firebot.accounts.streamer.userId;
    const { twitchApi } = firebot.modules;
    const client = twitchApi.getClient();

    // Get the full subscriber list from twitch
    const request = client.subscriptions.getSubscriptionsPaginated(broadcasterId);
    const gifters: Record<string, number> = {};
    const allSubscribers = new Set<string>();
    const giftedSubscribers = new Set<string>();
    const paidSubscribers = new Set<string>();

    try {
        let page: HelixSubscription[];
        while ((page = await request.getNext()).length) {
            for (const subscriber of page) {
                if (subscriber.userId === broadcasterId) {
                    continue; // Skip the broadcaster
                }

                if (subscriber.gifterName) {
                    gifters[subscriber.gifterName] = (gifters[subscriber.gifterName] || 0) + 1;
                    giftedSubscribers.add(subscriber.userName);
                } else {
                    paidSubscribers.add(subscriber.userName);
                }
                allSubscribers.add(subscriber.userName);
            }
        }
    } catch (error) {
        logger.error('getSubscriberListsFromTwitch: Error fetching subscribers:', error);
        return undefined;
    }

    // Cache and return the result
    const result: cacheValue = {
        gifters,
        allSubscribers: Array.from(allSubscribers),
        giftedSubscribers: Array.from(giftedSubscribers),
        paidSubscribers: Array.from(paidSubscribers)
    };
    cache.set(cacheTwitchSubscriberKey, result);
    logger.debug(`getSubscriberListsFromTwitch: Found ${Object.keys(result.gifters).length} gifters, ${result.giftedSubscribers.length} gifted subscribers, and ${result.paidSubscribers.length} subscribers.`);
    return result;
}
