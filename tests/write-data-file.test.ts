// Mock the dependencies
const mockWriteFileSync = jest.fn();
const mockCreditedUserListJSONEvaluator = jest.fn();
const mockBase64EncodeEvaluator = jest.fn();

jest.mock('../src/main', () => ({
    firebot: {
        modules: {
            fs: {
                writeFileSync: mockWriteFileSync
            }
        }
    },
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

jest.mock('../src/variables/base64encode', () => ({
    base64EncodeReplaceVariable: {
        evaluator: mockBase64EncodeEvaluator
    }
}));

import { writeDataFileEffect } from '../src/effects/write-data-file';

describe('writeDataFileEffect.onTriggerEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Set up default mock implementations
        mockCreditedUserListJSONEvaluator.mockResolvedValue('{"credits": "test"}');
        mockBase64EncodeEvaluator.mockResolvedValue('base64encodeddata');
    });

    describe('Successful file writing', () => {
        it('should write data file successfully', async () => {
            const event = {
                effect: {
                    filepath: '/path/to/test/file.js'
                },
                trigger: { mockTrigger: true }
            };

            const result = await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith({ mockTrigger: true });
            expect(mockBase64EncodeEvaluator).toHaveBeenCalledWith({ mockTrigger: true }, '{"credits": "test"}');
            expect(mockWriteFileSync).toHaveBeenCalledWith(
                '/path/to/test/file.js',
                '// File maintained by Firebot -- DO NOT EDIT\n\nconst data = "base64encodeddata";\n',
                'utf8'
            );
            expect(result).toEqual({ success: true });
        });

        it('should handle different file paths', async () => {
            const event = {
                effect: {
                    filepath: '/different/path/credits.js'
                },
                trigger: { test: 'trigger' }
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockWriteFileSync).toHaveBeenCalledWith(
                '/different/path/credits.js',
                '// File maintained by Firebot -- DO NOT EDIT\n\nconst data = "base64encodeddata";\n',
                'utf8'
            );
        });

        it('should handle different JSON data', async () => {
            mockCreditedUserListJSONEvaluator.mockResolvedValue('{"different": "data"}');
            mockBase64EncodeEvaluator.mockResolvedValue('differentbase64data');

            const event = {
                effect: {
                    filepath: '/path/to/file.js'
                },
                trigger: { data: 'test' }
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith({ data: 'test' });
            expect(mockBase64EncodeEvaluator).toHaveBeenCalledWith({ data: 'test' }, '{"different": "data"}');
            expect(mockWriteFileSync).toHaveBeenCalledWith(
                '/path/to/file.js',
                '// File maintained by Firebot -- DO NOT EDIT\n\nconst data = "differentbase64data";\n',
                'utf8'
            );
        });
    });

    describe('Data processing', () => {
        it('should correctly format the file content', async () => {
            mockCreditedUserListJSONEvaluator.mockResolvedValue('{"test": "json"}');
            mockBase64EncodeEvaluator.mockResolvedValue('testbase64encoded');

            const event = {
                effect: {
                    filepath: '/test/file.js'
                },
                trigger: {}
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            const expectedContent =
                '// File maintained by Firebot -- DO NOT EDIT\n\n' +
                'const data = "testbase64encoded";\n';

            expect(mockWriteFileSync).toHaveBeenCalledWith(
                '/test/file.js',
                expectedContent,
                'utf8'
            );
        });

        it('should handle empty JSON data', async () => {
            mockCreditedUserListJSONEvaluator.mockResolvedValue('{}');
            mockBase64EncodeEvaluator.mockResolvedValue('emptybase64');

            const event = {
                effect: {
                    filepath: '/empty/file.js'
                },
                trigger: {}
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockBase64EncodeEvaluator).toHaveBeenCalledWith({}, '{}');
            expect(mockWriteFileSync).toHaveBeenCalledWith(
                '/empty/file.js',
                '// File maintained by Firebot -- DO NOT EDIT\n\nconst data = "emptybase64";\n',
                'utf8'
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
            mockBase64EncodeEvaluator.mockResolvedValue('complexbase64data');

            const event = {
                effect: {
                    filepath: '/complex/file.js'
                },
                trigger: { complex: true }
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith({ complex: true });
            expect(mockBase64EncodeEvaluator).toHaveBeenCalledWith({ complex: true }, complexJson);
        });
    });

    describe('Error handling', () => {
        it('should handle file system write errors', async () => {
            const fsError = new Error('Permission denied');
            mockWriteFileSync.mockImplementation(() => {
                throw fsError;
            });

            const event = {
                effect: {
                    filepath: '/forbidden/file.js'
                },
                trigger: {}
            };

            const result = await writeDataFileEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'Permission denied'
            });
        });

        it('should handle non-Error objects thrown by file system', async () => {
            mockWriteFileSync.mockImplementation(() => {
                const error: any = 'String error';
                throw error;
            });

            const event = {
                effect: {
                    filepath: '/error/file.js'
                },
                trigger: {}
            };

            const result = await writeDataFileEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'String error'
            });
        });

        it('should handle null/undefined errors', async () => {
            mockWriteFileSync.mockImplementation(() => {
                const error: any = null;
                throw error;
            });

            const event = {
                effect: {
                    filepath: '/null-error/file.js'
                },
                trigger: {}
            };

            const result = await writeDataFileEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'null'
            });
        });

        it('should handle creditedUserListJSON evaluation errors', async () => {
            mockCreditedUserListJSONEvaluator.mockRejectedValue(new Error('JSON evaluation failed'));

            const event = {
                effect: {
                    filepath: '/test/file.js'
                },
                trigger: {}
            };

            const result = await writeDataFileEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'JSON evaluation failed'
            });
            expect(mockWriteFileSync).not.toHaveBeenCalled();
        });

        it('should handle base64 encoding errors', async () => {
            mockCreditedUserListJSONEvaluator.mockResolvedValue('{"test": "data"}');
            mockBase64EncodeEvaluator.mockRejectedValue(new Error('Base64 encoding failed'));

            const event = {
                effect: {
                    filepath: '/test/file.js'
                },
                trigger: {}
            };

            const result = await writeDataFileEffect.onTriggerEvent(event as any);

            expect(result).toEqual({
                success: false,
                error: 'Base64 encoding failed'
            });
            expect(mockWriteFileSync).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('should handle special characters in file paths', async () => {
            const event = {
                effect: {
                    filepath: '/path with spaces/file-with-dashes_and_underscores.js'
                },
                trigger: {}
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockWriteFileSync).toHaveBeenCalledWith(
                '/path with spaces/file-with-dashes_and_underscores.js',
                expect.any(String),
                'utf8'
            );
        });

        it('should handle very long base64 data', async () => {
            const longBase64 = 'a'.repeat(10000);
            mockBase64EncodeEvaluator.mockResolvedValue(longBase64);

            const event = {
                effect: {
                    filepath: '/test/file.js'
                },
                trigger: {}
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockWriteFileSync).toHaveBeenCalledWith(
                '/test/file.js',
                `// File maintained by Firebot -- DO NOT EDIT\n\nconst data = "${longBase64}";\n`,
                'utf8'
            );
        });

        it('should handle empty trigger object', async () => {
            const event = {
                effect: {
                    filepath: '/test/file.js'
                },
                trigger: {}
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith({});
            expect(mockBase64EncodeEvaluator).toHaveBeenCalledWith({}, '{"credits": "test"}');
        });

        it('should handle trigger with complex data', async () => {
            const complexTrigger = {
                metadata: { eventSource: 'test' },
                eventData: { amount: 100 },
                username: 'testuser'
            };

            const event = {
                effect: {
                    filepath: '/test/file.js'
                },
                trigger: complexTrigger
            };

            await writeDataFileEffect.onTriggerEvent(event as any);

            expect(mockCreditedUserListJSONEvaluator).toHaveBeenCalledWith(complexTrigger);
            expect(mockBase64EncodeEvaluator).toHaveBeenCalledWith(complexTrigger, '{"credits": "test"}');
        });
    });
});
