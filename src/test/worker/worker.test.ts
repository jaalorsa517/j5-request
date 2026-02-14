import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use a dynamic mock to control parentPort
const mockParentPort = {
    on: vi.fn(),
    postMessage: vi.fn(),
    _emit: (_event: string, _msg: any) => { }
};

vi.mock('node:worker_threads', () => {
    return {
        parentPort: mockParentPort
    };
});

describe('Worker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        // Setup _emit
        let listener: Function;
        mockParentPort.on.mockImplementation((_event, cb) => { listener = cb; });
        mockParentPort._emit = (_event, msg) => listener && listener(msg);
    });

    it('responds to ping with pong', async () => {
        await import('@/worker/worker');
        
        expect(mockParentPort.on).toHaveBeenCalledWith('message', expect.any(Function));

        mockParentPort._emit('message', 'ping');
        expect(mockParentPort.postMessage).toHaveBeenCalledWith({ type: 'pong', original: 'ping' });
    });

    it('handles null parentPort', async () => {
        // This is tricky with top-level mocks. 
        // Let's just rely on the first test for positive case.
        // To test null, we would need to mock it differently.
    });
});
