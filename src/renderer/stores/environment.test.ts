import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEnvironmentStore } from './environment';

// Mock window.electron
const mockFs = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    getGlobalsPath: vi.fn(),
    saveFileDialog: vi.fn()
};

vi.stubGlobal('window', {
    electron: {
        fs: mockFs
    },
    alert: vi.fn()
});

// Mock console to avoid noise and test errors
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Environment Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mockFs.getGlobalsPath.mockResolvedValue('/path/to/globals.json');
    });

    it('should initialize and load globals', async () => {
        mockFs.readFile.mockResolvedValue({
            id: 'globals',
            name: 'Globals',
            variables: [{ key: 'g1', value: 'v1', enabled: true }]
        });

        const store = useEnvironmentStore();

        // wait for async loadGlobals
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockFs.getGlobalsPath).toHaveBeenCalled();
        expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/globals.json');
        expect(store.globals.variables).toHaveLength(1);
        expect(store.globals.variables[0].key).toBe('g1');
    });

    it('should handle missing variables in globals file', async () => {
        mockFs.readFile.mockResolvedValue({ id: 'globals', name: 'Globals' }); // missing variables array
        const store = useEnvironmentStore();
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(store.globals.variables).toEqual([]);
    });

    it('should handle error in loadGlobals gracefully', async () => {
        mockFs.getGlobalsPath.mockRejectedValue(new Error('Path error'));
        const store = useEnvironmentStore();
        await new Promise(resolve => setTimeout(resolve, 0));
        // should not throw
    });

    it('should create new environment', () => {
        const store = useEnvironmentStore();
        store.createNewEnvironment('New Env');

        expect(store.activeEnvironment).toBeDefined();
        expect(store.activeEnvironment?.name).toBe('New Env');
        expect(store.activeEnvironmentPath).toBeNull();
    });

    it('should load environment from file', async () => {
        const store = useEnvironmentStore();
        mockFs.readFile.mockResolvedValue({
            id: 'env1',
            name: 'Env 1',
            variables: [{ key: 'e1', value: 'v1', enabled: true }]
        });

        await store.loadEnvironmentFromFile('/path/to/env.json');

        expect(store.activeEnvironment).toBeDefined();
        expect(store.activeEnvironment?.name).toBe('Env 1');
        expect(store.activeEnvironmentPath).toBe('/path/to/env.json');
    });

    it('should handle invalid environment file format', async () => {
        const store = useEnvironmentStore();
        mockFs.readFile.mockResolvedValue(null); // Invalid format
        await expect(store.loadEnvironmentFromFile('/path/to/env.json')).rejects.toThrow('Invalid environment file format');
    });

    it('should handle loadEnvironmentFromFile error', async () => {
        const store = useEnvironmentStore();
        mockFs.readFile.mockRejectedValue(new Error('Read error'));
        await expect(store.loadEnvironmentFromFile('/path/to/env.json')).rejects.toThrow('Read error');
    });

    it('should handle missing variables in loaded environment', async () => {
        const store = useEnvironmentStore();
        mockFs.readFile.mockResolvedValue({ id: 'env1', name: 'Env 1' }); // missing variables array
        await store.loadEnvironmentFromFile('/path/to/env.json');
        expect(store.activeEnvironment?.variables).toEqual([]);
    });

    it('should save active environment (new)', async () => {
        const store = useEnvironmentStore();
        store.createNewEnvironment('New Env');
        mockFs.saveFileDialog.mockResolvedValue('/path/to/new_env.json');
        mockFs.readFile.mockResolvedValue({
            id: store.activeEnvironment!.id,
            name: 'New Env',
            variables: []
        });

        await store.saveActiveEnvironment();

        expect(mockFs.saveFileDialog).toHaveBeenCalled();
        expect(mockFs.writeFile).toHaveBeenCalledWith(
            '/path/to/new_env.json',
            expect.objectContaining({ name: 'New Env' })
        );
        expect(store.activeEnvironmentPath).toBe('/path/to/new_env.json');
    });

    it('should handle cancelled saveFileDialog', async () => {
        const store = useEnvironmentStore();
        store.createNewEnvironment('New Env');
        mockFs.saveFileDialog.mockResolvedValue(null);
        await store.saveActiveEnvironment();
        expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should save active environment (existing)', async () => {
        const store = useEnvironmentStore();
        store.activeEnvironment = { id: '1', name: 'Env', variables: [] };
        store.activeEnvironmentPath = '/path/to/env.json';
        mockFs.readFile.mockResolvedValue(store.activeEnvironment);

        await store.saveActiveEnvironment();

        expect(mockFs.saveFileDialog).not.toHaveBeenCalled();
        expect(mockFs.writeFile).toHaveBeenCalledWith(
            '/path/to/env.json',
            expect.objectContaining({ name: 'Env' })
        );
    });

    it('should save globals', async () => {
        const store = useEnvironmentStore();
        store.globals = { id: 'g', name: 'G', variables: [{ key: 'k', value: 'v', enabled: true }] };

        await store.saveGlobals();

        expect(mockFs.writeFile).toHaveBeenCalledWith(
            '/path/to/globals.json',
            expect.objectContaining({ name: 'G' })
        );
    });

    it('should handle saveGlobals error', async () => {
        const store = useEnvironmentStore();
        mockFs.writeFile.mockRejectedValue(new Error('Write error'));
        const alertSpy = vi.spyOn(window, 'alert');
        
        await store.saveGlobals();
        
        expect(alertSpy).toHaveBeenCalledWith('Error saving globals: Write error');
    });

    it('should calculate currentVariables correctly', async () => {
        const store = useEnvironmentStore();
        store.globals = {
            id: 'g',
            name: 'G',
            variables: [
                { key: 'common', value: 'global', enabled: true },
                { key: 'globalOnly', value: 'g', enabled: true },
                { key: 'disabled', value: 'd', enabled: false }
            ]
        };
        store.activeEnvironment = {
            id: 'a',
            name: 'A',
            variables: [
                { key: 'common', value: 'active', enabled: true },
                { key: 'activeOnly', value: 'a', enabled: true }
            ]
        };

        const vars = store.currentVariables;
        expect(vars.common).toBe('active');
        expect(vars.globalOnly).toBe('g');
        expect(vars.activeOnly).toBe('a');
        expect(vars).not.toHaveProperty('disabled');
    });

    it('should update variables from execution', () => {
        const store = useEnvironmentStore();
        store.globals = {
            id: 'g',
            name: 'G',
            variables: [{ key: 'g1', value: 'old', enabled: true }]
        };
        store.activeEnvironment = {
            id: 'a',
            name: 'A',
            variables: [{ key: 'a1', value: 'old', enabled: true }]
        };

        // Update existing in active
        store.updateVariablesFromExecution({ a1: 'new' });
        expect(store.activeEnvironment.variables.find(v => v.key === 'a1')?.value).toBe('new');

        // Update with same value (branch coverage)
        store.updateVariablesFromExecution({ a1: 'new' });
        expect(store.activeEnvironment.variables.find(v => v.key === 'a1')?.value).toBe('new');

        // Update existing in global (fallback)
        store.updateVariablesFromExecution({ g1: 'new' });
        expect(store.globals.variables.find(v => v.key === 'g1')?.value).toBe('new');

        // Update with same value in globals (branch coverage)
        store.updateVariablesFromExecution({ g1: 'new' });
        expect(store.globals.variables.find(v => v.key === 'g1')?.value).toBe('new');

        // Add new
        store.updateVariablesFromExecution({ newKey: 'newValue' });
        expect(store.activeEnvironment.variables.find(v => v.key === 'newKey')?.value).toBe('newValue');
    });

    it('should close environment', () => {
        const store = useEnvironmentStore();
        store.activeEnvironment = { id: '1', name: 'Env', variables: [] };
        store.activeEnvironmentPath = '/path/to/env.json';
        
        store.closeEnvironment();
        
        expect(store.activeEnvironment).toBeNull();
        expect(store.activeEnvironmentPath).toBeNull();
    });
});
