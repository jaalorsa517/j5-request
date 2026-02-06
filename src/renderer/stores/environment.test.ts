import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEnvironmentStore } from './environment';
import { J5Environment } from '../../shared/types';

describe('Environment Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        // Ensure window exists (it should in jsdom, but for safety or debug)
        if (typeof window === 'undefined') {
            (global as any).window = {};
        }

        // Mock electron APIs used in store
        (window as any).electron = {
            fs: {
                readFile: vi.fn(),
                writeFile: vi.fn(),
                saveFileDialog: vi.fn(),
                getGlobalsPath: vi.fn().mockResolvedValue('/mock/globals.json')
            }
        };
    });

    it('should initialize with default state', () => {
        const store = useEnvironmentStore();
        expect(store.activeEnvironment).toBeNull();
        expect(store.activeEnvironmentPath).toBeNull();
        expect(store.globals.name).toBe('Globals');
    });

    it('should create new environment', () => {
        const store = useEnvironmentStore();
        store.createNewEnvironment('Test Env');
        expect(store.activeEnvironment?.name).toBe('Test Env');
        expect(store.activeEnvironment?.variables).toEqual([]);
        expect(store.activeEnvironmentPath).toBeNull();
    });

    it('should compute current variables merging globals and active env', () => {
        const store = useEnvironmentStore();

        // Setup globals
        store.globals.variables = [
            { key: 'API_URL', value: 'https://api.dev', enabled: true, type: 'default' },
            { key: 'TOKEN', value: 'global-token', enabled: true, type: 'secret' }
        ];

        // Setup active environment
        store.createNewEnvironment('Prod');
        store.activeEnvironment!.variables = [
            { key: 'API_URL', value: 'https://api.prod', enabled: true, type: 'default' }
        ];

        const vars = store.currentVariables;
        expect(vars['API_URL']).toBe('https://api.prod'); // Overridden
        expect(vars['TOKEN']).toBe('global-token'); // Inherited
    });

    it('should ignore disabled variables', () => {
        const store = useEnvironmentStore();
        store.globals.variables = [
            { key: 'DISABLED_VAR', value: 'hidden', enabled: false, type: 'default' }
        ];

        expect(store.currentVariables['DISABLED_VAR']).toBeUndefined();
    });

    it('should load environment from file', async () => {
        const store = useEnvironmentStore();
        const mockEnv: J5Environment = {
            id: 'test-id',
            name: 'Loaded Env',
            variables: [{ key: 'KEY', value: 'VALUE', enabled: true, type: 'default' }]
        };

        const readFileSpy = vi.spyOn((window as any).electron.fs, 'readFile').mockResolvedValue(mockEnv);

        await store.loadEnvironmentFromFile('/path/to/env.json');

        expect(readFileSpy).toHaveBeenCalledWith('/path/to/env.json');
        expect(store.activeEnvironment).toEqual(mockEnv);
        expect(store.activeEnvironmentPath).toBe('/path/to/env.json');
    });

    it('should handle load errors gracefully', async () => {
        const store = useEnvironmentStore();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn((window as any).electron.fs, 'readFile').mockRejectedValue(new Error('Read failed'));

        await expect(store.loadEnvironmentFromFile('/bad/path')).rejects.toThrow('Read failed');
        expect(consoleSpy).toHaveBeenCalled();
    });
});
