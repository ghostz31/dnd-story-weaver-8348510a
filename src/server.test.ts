import { describe, it, expect, vi } from 'vitest';
import { createServer } from './server';

// Mock dependencies
vi.mock('express', () => {
    const expressMock = () => ({
        use: vi.fn(),
        get: vi.fn(),
        listen: vi.fn((port, callback) => callback && callback()),
    });
    // @ts-ignore
    expressMock.static = vi.fn(() => 'static-middleware');
    return {
        default: expressMock
    };
});

vi.mock('vite', () => ({
    createServer: vi.fn(() => ({
        middlewares: {}
    }))
}));

describe('Server', () => {
    it('should export createServer function', () => {
        expect(createServer).toBeDefined();
        expect(typeof createServer).toBe('function');
    });

    it('should initialize server without crashes', async () => {
        // This is a smoke test to ensure the logic runs through with mocks
        await expect(createServer()).resolves.not.toThrow();
    });
});
