import { firebot } from "./main";

function getTwitchDefaultProfilePic(): string {
    const imageIds = [
        "ead5c8b2-a4c9-4724-b1dd-9f00b46cbd3d-profile_image-300x300.png", // Pink
        "998f01ae-def8-11e9-b95c-784f43822e80-profile_image-300x300.png", // Blue
        "215b7342-def9-11e9-9a66-784f43822e80-profile_image-300x300.png", // Orange
        "ebb84563-db81-4b9c-8940-64ed33ccfc7b-profile_image-300x300.png", // Green
        "ce57700a-def9-11e9-842d-784f43822e80-profile_image-300x300.png", // Lime
        "75305d54-c7cc-40d1-bb9c-91fbe85943c7-profile_image-300x300.png" // Yellow

    ];
    return `https://static-cdn.jtvnw.net/user-default-pictures-uv/${imageIds[Math.floor(Math.random() * imageIds.length)]}`;
}

function getKickDefaultProfilePic(): string {
    const randomNum = Math.floor(Math.random() * 6) + 1;
    return `https://kick.com/img/default-profile-pictures/default-avatar-${randomNum}.webp`;
}

function getYouTubeDefaultProfilePic(): string {
    return getTwitchDefaultProfilePic(); // For now...
}

enum Platform {
    TWITCH = "twitch",
    KICK = "kick",
    YOUTUBE = "youtube"
}

function detectPlatform(username: string): Platform {
    if (username.endsWith("@kick")) {
        return Platform.KICK;
    }
    if (username.endsWith("@youtube")) {
        return Platform.YOUTUBE;
    }
    return Platform.TWITCH;
}

function isValidProfilePicUrl(url: string): boolean {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return false;
    }
    if (url === "https://kick.com/favicon.ico") {
        return false;
    }
    return true;
}

type FailedLookupCacheEntry = {
    timestamp: number;
    result: string;
}

class ProfilePictureCache {
    private cache = new Map<string, string>();
    private failedLookupCache = new Map<string, FailedLookupCacheEntry>();
    private readonly FAILED_LOOKUP_SUPPRESSION_MS = 5000;

    updateProfilePicture(username: string, profilePicUrl: string): void {
        if (!username || !profilePicUrl) {
            return;
        }
        if (isValidProfilePicUrl(profilePicUrl)) {
            this.cache.set(username.toLowerCase(), profilePicUrl);
        }
    }

    getProfilePicture(username: string): string | undefined {
        if (!username) {
            return undefined;
        }
        return this.cache.get(username.toLowerCase());
    }

    clearCache(): void {
        this.cache.clear();
        this.failedLookupCache.clear();
    }

    async getProfilePictureWithFallback(username: string): Promise<string> {
        const cached = this.getProfilePicture(username);
        if (cached) {
            return cached;
        }

        const platform = detectPlatform(username);

        if (platform === Platform.TWITCH) {
            const normalizedUsername = username.toLowerCase();
            const now = Date.now();
            const lastFailedLookup = this.failedLookupCache.get(normalizedUsername);

            if (lastFailedLookup && (now - lastFailedLookup.timestamp) < this.FAILED_LOOKUP_SUPPRESSION_MS) {
                return lastFailedLookup.result;
            }

            try {
                const { viewerDatabase } = firebot.modules;
                const viewer = await viewerDatabase.getViewerByUsername(normalizedUsername);

                if (viewer?.profilePicUrl) {
                    this.updateProfilePicture(normalizedUsername, viewer.profilePicUrl);
                    return viewer.profilePicUrl;
                }
            } catch {
                // Viewer database lookup failed, continue to default
            }

            const result = getTwitchDefaultProfilePic();
            this.failedLookupCache.set(normalizedUsername, { timestamp: now, result });
            return result;
        }

        switch (platform) {
            case Platform.KICK:
                return getKickDefaultProfilePic();
            case Platform.YOUTUBE:
                return getYouTubeDefaultProfilePic();
            default:
                return getTwitchDefaultProfilePic();
        }
    }
}

export const profilePictureCache = new ProfilePictureCache();
export { getTwitchDefaultProfilePic };
