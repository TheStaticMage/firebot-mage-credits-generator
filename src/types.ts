export interface Parameters {
    enumerateExistingFollowers?: boolean;
    enumerateExistingSubscribers?: boolean;
    enableCustomCredits?: boolean;
}

export enum CreditTypes {
    CHEER = "cheer",
    CHARITY_DONATION = "charityDonation",
    DONATION = "donation",
    EXTRALIFE = "extralife",
    FOLLOW = "follow",
    GIFT = "gift",
    MODERATOR = "moderator",
    RAID = "raid",
    SUB = "sub",
    VIP = "vip",
}

export interface CreditedUser {
    username: string;
    amount: number;
    userDisplayName?: string;
    profilePicUrl?: string;
}

export interface CurrentStreamCredits {
    [CreditTypes.CHEER]: CreditedUser[];
    [CreditTypes.CHARITY_DONATION]: CreditedUser[];
    [CreditTypes.DONATION]: CreditedUser[];
    [CreditTypes.EXTRALIFE]: CreditedUser[];
    [CreditTypes.FOLLOW]: CreditedUser[];
    [CreditTypes.GIFT]: CreditedUser[];
    [CreditTypes.MODERATOR]: CreditedUser[];
    [CreditTypes.RAID]: CreditedUser[];
    [CreditTypes.SUB]: CreditedUser[];
    [CreditTypes.VIP]: CreditedUser[];
    [key: string]: CreditedUser[];
}

export const existingCategories = ['existingAllSubs', 'existingFollowers', 'existingGiftedSubs', 'existingGifters', 'existingPaidSubs'];

export const ReservedCreditTypes: string[] = [
    ...Object.values(CreditTypes),
    ...existingCategories
];
