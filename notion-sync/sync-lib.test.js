const { buildConfig, runSync } = require('./sync-lib');

describe('sync-lib', () => {
    describe('buildConfig', () => {
        it('should parse environment variables correctly and remove dashes from IDs', () => {
            const env = {
                NOTION_API_KEY: 'test_token_123',
                HARUCHI_PAGE_ID: 'page-123-456',
                XP_LOG_DB_ID: 'db-456-789'
            };

            const config = buildConfig(env);

            expect(config.token).toBe('test_token_123');
            expect(config.haruchiPageId).toBe('page123456');
            expect(config.xpLogDbId).toBe('db456789');
            // Assert default value for grantedProp
            expect(config.grantedProp).toBe('XP 지급됨');
        });

        it('should use NOTION_TOKEN as fallback for API key', () => {
            const env = {
                NOTION_TOKEN: 'fallback_token',
            };
            const config = buildConfig(env);
            expect(config.token).toBe('fallback_token');
        });
    });

    describe('runSync', () => {
        it('should throw an error when required properties are missing', async () => {
            const env = {
                NOTION_API_KEY: '',
                HARUCHI_PAGE_ID: '',
                XP_LOG_DB_ID: ''
            };
            await expect(runSync(env)).rejects.toThrow('필수 환경변수 없음: NOTION_API_KEY, HARUCHI_PAGE_ID, XP_LOG_DB_ID');
        });
    });
});
