import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvironmentManager } from '@/main/services/EnvironmentManager';
import fs from 'fs/promises';

// Mock fs/promises with all needed methods as functional spies
vi.mock('fs/promises', () => ({
    default: {
        readFile: vi.fn().mockResolvedValue('{"id":"1","variables":[]}'),
        writeFile: vi.fn().mockResolvedValue(undefined),
        access: vi.fn().mockResolvedValue(undefined),
        mkdir: vi.fn().mockResolvedValue(undefined),
        readdir: vi.fn().mockResolvedValue([])
    }
}));

describe('EnvironmentManager Final Fix', () => {
    let envManager: EnvironmentManager;

    beforeEach(() => {
        vi.clearAllMocks();
        envManager = new EnvironmentManager();
    });

    it('resolves variables with precedence', () => {
        const env = { v: '1', over: 'new' };
        const text = '{{v}} {{over}} {{none}}';
        const res = envManager.resolveVariables(text, env);
        expect(res).toBe('1 new {{none}}');
    });

    it('loads environment and handles JSON parse', async () => {
        (fs.readFile as any).mockResolvedValueOnce('{"name": "test", "variables": []}');
        const res = await envManager.loadEnvironment('/path.json');
        expect(res.name).toBe('test');
    });

    it('saves environment and handles project keys', async () => {
        const env = { id: '1', name: 'E', variables: [{ key: 's', value: 'v', type: 'secret' as any, enabled: true }] };
        
        // Mock getOrCreateProjectKey to return a valid 32-byte key
        vi.spyOn(envManager, 'getOrCreateProjectKey').mockResolvedValue(Buffer.alloc(32));
        
        await envManager.saveEnvironment('/path.json', env, '/project');
        expect(fs.writeFile).toHaveBeenCalled();
    });

    it('flattens environment correctly', () => {
        const env = {
            id: '1', name: 'E', variables: [
                { key: 'a', value: '1', enabled: true, type: 'default' as any },
                { key: 'b', value: '2', enabled: false, type: 'default' as any }
            ]
        };
        const flattened = envManager.flattenEnvironment(env);
        expect(flattened.a).toBe('1');
        expect(flattened.b).toBeUndefined();
    });
});
