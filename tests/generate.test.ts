// Mock the dependencies
const mockCreditedUserListJSONEvaluator = jest.fn();
const mockGenerateCredits = jest.fn();
const mockServer = {
    generateCredits: mockGenerateCredits
};

jest.mock('../src/main', () => ({
    server: mockServer,
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    }
}));

jest.mock('../src/variables/credited-user-list', () => ({
    creditedUserListJSON: {
        evaluator: mockCreditedUserListJSONEvaluator
    }
}));

import { generateCreditsEffect } from '../src/effects/generate';

describe('generateCreditsEffect.onTriggerEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Set up default mock implementations
        mockCreditedUserListJSONEvaluator.mockResolvedValue('{"credits": "test"}');
        mockGenerateCredits.mockReturnValue('http://localhost:3000/credits');
    });

    describe('Successful credit generation', () => {
        it('should generate credits URL with minimal parameters', async () => {
            const event = {
                effect: {},
                trigger: { test: 'trigger' }
            };

            const result = await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith({ test: 'trigger' });
            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '',
                '',
                '',
                ''
            );
            expect(result).toEqual({
                success: true,
                outputs: {
                    creditsUrl: 'http://localhost:3000/credits'
                }
            });
        });

        it('should generate credits URL with custom config path', async () => {
            const event = {
                effect: {
                    configPath: '/path/to/config.js'
                },
                trigger: { test: 'data' }
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '/path/to/config.js',
                '',
                '',
                ''
            );
        });

        it('should generate credits URL with custom CSS path', async () => {
            const event = {
                effect: {
                    cssPath: '/path/to/style.css'
                },
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '',
                '/path/to/style.css',
                '',
                ''
            );
        });

        it('should generate credits URL with custom HTML path', async () => {
            const event = {
                effect: {
                    htmlPath: '/path/to/template.html'
                },
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '',
                '',
                '/path/to/template.html',
                ''
            );
        });

        it('should generate credits URL with custom script path', async () => {
            const event = {
                effect: {
                    scriptPath: '/path/to/script.js'
                },
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '',
                '',
                '',
                '/path/to/script.js'
            );
        });

        it('should generate credits URL with all custom paths', async () => {
            const event = {
                effect: {
                    configPath: '/config/custom.js',
                    cssPath: '/css/custom.css',
                    htmlPath: '/html/custom.html',
                    scriptPath: '/scripts/custom.js'
                },
                trigger: { complex: 'trigger' }
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith({ complex: 'trigger' });
            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '/config/custom.js',
                '/css/custom.css',
                '/html/custom.html',
                '/scripts/custom.js'
            );
        });
    });

    describe('Data handling', () => {
        it('should handle different JSON data from creditedUserListJSON', async () => {
            mockCreditedUserListJSONEvaluator.mockResolvedValue('{"different": "data"}');

            const event = {
                effect: {},
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"different": "data"}',
                '',
                '',
                '',
                ''
            );
        });

        it('should handle empty JSON data', async () => {
            mockCreditedUserListJSONEvaluator.mockResolvedValue('{}');

            const event = {
                effect: {},
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{}',
                '',
                '',
                '',
                ''
            );
        });

        it('should handle complex JSON data', async () => {
            const complexJson = JSON.stringify({
                credits: {
                    cheer: [{ username: 'user1', amount: 100 }],
                    follow: [{ username: 'user2', amount: 0 }]
                }
            });
            mockCreditedUserListJSONEvaluator.mockResolvedValue(complexJson);

            const event = {
                effect: {},
                trigger: { data: 'complex' }
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                complexJson,
                '',
                '',
                '',
                ''
            );
        });

        it('should handle different server response URLs', async () => {
            mockGenerateCredits.mockReturnValue('http://localhost:8080/custom-credits');

            const event = {
                effect: {},
                trigger: {}
            };

            const result = await generateCreditsEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: true,
                outputs: {
                    creditsUrl: 'http://localhost:8080/custom-credits'
                }
            });
        });
    });

    describe('Error handling', () => {
        it('should handle server not initialized', async () => {
            // Mock server as null
            const { server } = require('../src/main');
            const originalServer = server;
            require('../src/main').server = null;

            const event = {
                effect: {},
                trigger: {}
            };

            const result = await generateCreditsEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'Server is not initialized.'
            });
            expect(mockCreditedUserListJSONEvaluator).not.toHaveBeenCalled();
            expect(mockGenerateCredits).not.toHaveBeenCalled();

            // Restore original server
            require('../src/main').server = originalServer;
        });

        it('should handle creditedUserListJSON evaluation errors', async () => {
            mockCreditedUserListJSONEvaluator.mockRejectedValue(new Error('JSON evaluation failed'));

            const event = {
                effect: {},
                trigger: {}
            };

            const result = await generateCreditsEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'JSON evaluation failed'
            });
            expect(mockGenerateCredits).not.toHaveBeenCalled();
        });

        it('should handle server generateCredits errors', async () => {
            mockGenerateCredits.mockImplementation(() => {
                throw new Error('Server generation failed');
            });

            const event = {
                effect: {},
                trigger: {}
            };

            const result = await generateCreditsEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'Server generation failed'
            });
        });

        it('should handle non-Error objects thrown by server', async () => {
            mockGenerateCredits.mockImplementation(() => {
                const error: any = 'String error from server';
                throw error;
            });

            const event = {
                effect: {},
                trigger: {}
            };

            const result = await generateCreditsEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'String error from server'
            });
        });

        it('should handle null errors from server', async () => {
            mockGenerateCredits.mockImplementation(() => {
                const error: any = null;
                throw error;
            });

            const event = {
                effect: {},
                trigger: {}
            };

            const result = await generateCreditsEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'null'
            });
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined effect properties', async () => {
            const event = {
                effect: {
                    configPath: undefined,
                    cssPath: undefined,
                    htmlPath: undefined,
                    scriptPath: undefined
                },
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '',
                '',
                '',
                ''
            );
        });

        it('should handle null effect properties', async () => {
            const event = {
                effect: {
                    configPath: null,
                    cssPath: null,
                    htmlPath: null,
                    scriptPath: null
                },
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '',
                '',
                '',
                ''
            );
        });

        it('should handle empty string paths', async () => {
            const event = {
                effect: {
                    configPath: '',
                    cssPath: '',
                    htmlPath: '',
                    scriptPath: ''
                },
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '',
                '',
                '',
                ''
            );
        });

        it('should handle special characters in file paths', async () => {
            const event = {
                effect: {
                    configPath: '/path with spaces/config-file_test.js',
                    cssPath: '/css/style-with-dashes.css',
                    htmlPath: '/html/template_with_underscores.html',
                    scriptPath: '/scripts/custom script.js'
                },
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockGenerateCredits).toHaveBeenCalledWith(
                '{"credits": "test"}',
                '/path with spaces/config-file_test.js',
                '/css/style-with-dashes.css',
                '/html/template_with_underscores.html',
                '/scripts/custom script.js'
            );
        });

        it('should handle complex trigger data', async () => {
            const complexTrigger = {
                metadata: { eventSource: 'test', event: { id: 'follow' } },
                eventData: { username: 'testuser', amount: 100 },
                username: 'triggeruser'
            };

            const event = {
                effect: {},
                trigger: complexTrigger
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith(complexTrigger);
        });

        it('should handle empty trigger object', async () => {
            const event = {
                effect: {},
                trigger: {}
            };

            await generateCreditsEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith({});
        });
    });
});
