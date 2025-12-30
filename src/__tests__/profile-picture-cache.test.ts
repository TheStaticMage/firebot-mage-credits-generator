const mockViewerDatabase = {
    getViewerByUsername: jest.fn()
};

jest.mock('../../src/main', () => ({
    firebot: {
        modules: {
            viewerDatabase: mockViewerDatabase
        }
    }
}));

import { profilePictureCache, getTwitchDefaultProfilePic } from '../profile-picture-cache';

describe('ProfilePictureCache', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        profilePictureCache.clearCache();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('updateProfilePicture', () => {
        it('should cache valid HTTP URL', () => {
            profilePictureCache.updateProfilePicture('testuser', 'http://example.com/pic.jpg');
            expect(profilePictureCache.getProfilePicture('testuser')).toBe('http://example.com/pic.jpg');
        });

        it('should cache valid HTTPS URL', () => {
            profilePictureCache.updateProfilePicture('testuser', 'https://example.com/pic.jpg');
            expect(profilePictureCache.getProfilePicture('testuser')).toBe('https://example.com/pic.jpg');
        });

        it('should not cache invalid URL', () => {
            profilePictureCache.updateProfilePicture('testuser', 'not-a-url');
            expect(profilePictureCache.getProfilePicture('testuser')).toBeUndefined();
        });

        it('should not cache Kick favicon', () => {
            profilePictureCache.updateProfilePicture('testuser', 'https://kick.com/favicon.ico');
            expect(profilePictureCache.getProfilePicture('testuser')).toBeUndefined();
        });

        it('should normalize username to lowercase', () => {
            profilePictureCache.updateProfilePicture('TestUser', 'https://example.com/pic.jpg');
            expect(profilePictureCache.getProfilePicture('testuser')).toBe('https://example.com/pic.jpg');
            expect(profilePictureCache.getProfilePicture('TESTUSER')).toBe('https://example.com/pic.jpg');
        });
    });

    describe('getProfilePicture', () => {
        it('should return undefined for unknown user', () => {
            expect(profilePictureCache.getProfilePicture('unknownuser')).toBeUndefined();
        });

        it('should return cached profile picture', () => {
            profilePictureCache.updateProfilePicture('testuser', 'https://example.com/pic.jpg');
            expect(profilePictureCache.getProfilePicture('testuser')).toBe('https://example.com/pic.jpg');
        });
    });

    describe('getProfilePictureWithFallback', () => {
        describe('Twitch users', () => {
            it('should return cached profile picture if available', async () => {
                const cachedUrl = 'https://example.com/cached.jpg';
                profilePictureCache.updateProfilePicture('twitchuser', cachedUrl);

                const result = await profilePictureCache.getProfilePictureWithFallback('twitchuser');
                expect(result).toBe(cachedUrl);
                expect(mockViewerDatabase.getViewerByUsername).not.toHaveBeenCalled();
            });

            it('should query viewer database when not cached', async () => {
                const dbUrl = 'https://example.com/db.jpg';
                mockViewerDatabase.getViewerByUsername.mockResolvedValue({
                    username: 'twitchuser',
                    profilePicUrl: dbUrl
                });

                const result = await profilePictureCache.getProfilePictureWithFallback('twitchuser');
                expect(result).toBe(dbUrl);
                expect(mockViewerDatabase.getViewerByUsername).toHaveBeenCalledWith('twitchuser');
                expect(profilePictureCache.getProfilePicture('twitchuser')).toBe(dbUrl);
            });

            it('should return default when viewer not in database', async () => {
                mockViewerDatabase.getViewerByUsername.mockResolvedValue(undefined);

                const result = await profilePictureCache.getProfilePictureWithFallback('unknownuser');
                expect(result).toMatch(/^https:\/\/static-cdn\.jtvnw\.net\/user-default-pictures-uv\//);
                expect(mockViewerDatabase.getViewerByUsername).toHaveBeenCalledWith('unknownuser');
            });

            it('should return default when viewer has no profile picture URL', async () => {
                mockViewerDatabase.getViewerByUsername.mockResolvedValue({
                    username: 'twitchuser',
                    profilePicUrl: null
                });

                const result = await profilePictureCache.getProfilePictureWithFallback('twitchuser');
                expect(result).toMatch(/^https:\/\/static-cdn\.jtvnw\.net\/user-default-pictures-uv\//);
            });

            it('should suppress viewer database lookups for 5 seconds after failure', async () => {
                mockViewerDatabase.getViewerByUsername.mockResolvedValue(undefined);

                const result1 = await profilePictureCache.getProfilePictureWithFallback('suppresseduser');
                expect(mockViewerDatabase.getViewerByUsername).toHaveBeenCalledTimes(1);

                jest.advanceTimersByTime(3000);

                const result2 = await profilePictureCache.getProfilePictureWithFallback('suppresseduser');
                expect(mockViewerDatabase.getViewerByUsername).toHaveBeenCalledTimes(1);

                expect(result1).toBe(result2);
            });

            it('should allow viewer database lookup after 5 seconds', async () => {
                mockViewerDatabase.getViewerByUsername.mockResolvedValue(undefined);

                await profilePictureCache.getProfilePictureWithFallback('retryuser');
                expect(mockViewerDatabase.getViewerByUsername).toHaveBeenCalledTimes(1);

                jest.advanceTimersByTime(5000);

                await profilePictureCache.getProfilePictureWithFallback('retryuser');
                expect(mockViewerDatabase.getViewerByUsername).toHaveBeenCalledTimes(2);
            });

            it('should handle viewer database errors gracefully', async () => {
                mockViewerDatabase.getViewerByUsername.mockRejectedValue(new Error('Database error'));

                const result = await profilePictureCache.getProfilePictureWithFallback('erroruser');
                expect(result).toMatch(/^https:\/\/static-cdn\.jtvnw\.net\/user-default-pictures-uv\//);
            });
        });

        describe('Kick users', () => {
            it('should return Kick default for Kick users without database lookup', async () => {
                const result = await profilePictureCache.getProfilePictureWithFallback('kickuser@kick');
                expect(result).toMatch(/^https:\/\/kick\.com\/img\/default-profile-pictures\/default-avatar-\d\.webp$/);
                expect(mockViewerDatabase.getViewerByUsername).not.toHaveBeenCalled();
            });

            it('should return cached profile picture for Kick users', async () => {
                const cachedUrl = 'https://example.com/kick.jpg';
                profilePictureCache.updateProfilePicture('kickuser@kick', cachedUrl);

                const result = await profilePictureCache.getProfilePictureWithFallback('kickuser@kick');
                expect(result).toBe(cachedUrl);
                expect(mockViewerDatabase.getViewerByUsername).not.toHaveBeenCalled();
            });
        });

        describe('YouTube users', () => {
            it('should return Twitch default for YouTube users without database lookup', async () => {
                const result = await profilePictureCache.getProfilePictureWithFallback('youtubeuser@youtube');
                expect(result).toMatch(/^https:\/\/static-cdn\.jtvnw\.net\/user-default-pictures-uv\//);
                expect(mockViewerDatabase.getViewerByUsername).not.toHaveBeenCalled();
            });

            it('should return cached profile picture for YouTube users', async () => {
                const cachedUrl = 'https://example.com/youtube.jpg';
                profilePictureCache.updateProfilePicture('youtubeuser@youtube', cachedUrl);

                const result = await profilePictureCache.getProfilePictureWithFallback('youtubeuser@youtube');
                expect(result).toBe(cachedUrl);
                expect(mockViewerDatabase.getViewerByUsername).not.toHaveBeenCalled();
            });
        });
    });

    describe('getTwitchDefaultProfilePic', () => {
        it('should return a valid Twitch default profile picture URL', () => {
            const result = getTwitchDefaultProfilePic();
            expect(result).toMatch(/^https:\/\/static-cdn\.jtvnw\.net\/user-default-pictures-uv\//);
        });
    });
});
