import handler from './game.js';
import { jest } from '@jest/globals';

describe('game API handler', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { method: 'GET', query: {} };
        res = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should return 405 for methods other than GET and POST', async () => {
        req.method = 'PUT';

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(405);
        expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('should return empty logs if credentials are not set for getLogs action', async () => {
        req.query.action = 'getLogs';

        const originalEnv = process.env;
        process.env = { ...originalEnv, NOTION_API_KEY: '', HARUCHI_PAGE_ID: '', XP_LOG_DB_ID: '' };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ logs: [] });

        process.env = originalEnv;
    });

    it('should return 0 totalExp and source no_token if NOTION_API_KEY is not set for getXp action', async () => {
        req.query.action = 'getXp';

        const originalEnv = process.env;
        process.env = { ...originalEnv, NOTION_API_KEY: '', HARUCHI_PAGE_ID: 'some-id' };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ totalExp: 0, source: 'no_token' });

        process.env = originalEnv;
    });

    it('should return 0 totalExp and source no_page_id if HARUCHI_PAGE_ID is not set for getXp action', async () => {
        req.query.action = 'getXp';

        const originalEnv = process.env;
        process.env = { ...originalEnv, NOTION_API_KEY: 'some-token', HARUCHI_PAGE_ID: '' };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ totalExp: 0, source: 'no_page_id' });

        process.env = originalEnv;
    });

    it('should return 400 for unknown actions', async () => {
        req.query.action = 'unknown_action';

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unknown action' });
    });
});
