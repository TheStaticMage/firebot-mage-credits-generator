export interface Parameters {
    enumerateExistingFollowers?: boolean;
    enumerateExistingSubscribers?: boolean;
}

export enum CreditTypes {
    CHEER = "cheer",
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
    displayName: string;
    profilePicUrl: string;
}

export interface CreditedUserEntry {
    username: string;
    amount: number;
}

export interface CurrentStreamCredits {
    [CreditTypes.CHEER]: CreditedUserEntry[];
    [CreditTypes.DONATION]: CreditedUserEntry[];
    [CreditTypes.EXTRALIFE]: CreditedUserEntry[];
    [CreditTypes.FOLLOW]: CreditedUserEntry[];
    [CreditTypes.GIFT]: CreditedUserEntry[];
    [CreditTypes.MODERATOR]: CreditedUserEntry[];
    [CreditTypes.RAID]: CreditedUserEntry[];
    [CreditTypes.SUB]: CreditedUserEntry[];
    [CreditTypes.VIP]: CreditedUserEntry[];
}
