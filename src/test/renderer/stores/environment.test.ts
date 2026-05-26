/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEnvironmentStore } from '@/renderer/stores/environment';

// Hoist mocks to ensure they are available during store initialization
const { mockFs } = vi.hoisted(() => ({
    mockFs: {
        getGlobalsPath: vi.fn().mockResolvedValue('/mock/globals.json'),
        readFile: vi.fn().mockResolvedValue({ id: 'g', variables: [] }),
        writeFile: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('@/renderer/stores/file-system', () => ({
    useFileSystemStore: vi.fn(() => ({
        currentPath: '/project'
    }))
}));

if (typeof window !== 'undefined') {
    (window as any).electron = { fs: mockFs };
}

describe('Environment Store Definitive Integration', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mockFs.readFile.mockResolvedValue({ id: 'g', variables: [] });
    });

    it('initializes and manages environments', async () => {
        const store = useEnvironmentStore();
        store.createNewEnvironment('New Env');
        expect(store.activeEnvironment?.name).toBe('New Env');
        
        store.closeEnvironment();
        expect(store.activeEnvironment).toBeNull();
    });

    it('resolves variables from globals and active env', () => {
        const store = useEnvironmentStore();
        store.globals.variables = [{ key: 'g', value: '1', enabled: true, type: 'default' }];
        store.createNewEnvironment('E');
        store.activeEnvironment!.variables = [{ key: 'e', value: '2', enabled: true, type: 'default' }];
        
        const resolved = store.currentVariables;
        expect(resolved.g).toBe('1');
        expect(resolved.e).toBe('2');
    });

    it('updates variables from execution results', () => {
        const store = useEnvironmentStore();
        store.globals.variables = [{ key: 'v', value: 'old', enabled: true, type: 'default' }];
        
        store.updateVariablesFromExecution({ v: 'new', new: 'val' });
        expect(store.globals.variables.find(x => x.key === 'v')?.value).toBe('new');
        expect(store.globals.variables.find(x => x.key === 'new')).toBeDefined();
    });
});
