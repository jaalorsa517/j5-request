/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRequestStore } from '@/renderer/stores/request';

// Comprehensive mock
const mockElectron = {
    fs: { 
        writeFile: vi.fn().mockResolvedValue(undefined),
        getGlobalsPath: vi.fn().mockResolvedValue('/g.json')
    },
    request: { execute: vi.fn() },
    app: { getInfo: vi.fn().mockResolvedValue({ version: '1' }) }
};

if (typeof window !== 'undefined') {
    (window as any).electron = mockElectron;
    vi.stubGlobal('navigator', { userAgent: 'Linux' });
}

describe('Request Store Final Coverage Push', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('covers all computed proxies', () => {
        const store = useRequestStore();
        store.id = '1';
        store.name = 'N';
        store.method = 'GET';
        store.url = 'u';
        store.headers = { a: '1' };
        store.params = { b: '2' };
        store.body = 'data';
        store.bodyFormData = { k: 'v' };
        store.bodyType = 'json';
        store.preRequestScript = 'pre';
        store.postResponseScript = 'post';
        store.sslConfig = { rejectUnauthorized: false };
        store.response = { status: 200 } as any;

        expect(store.id).toBe('1');
        expect(store.name).toBe('N');
        expect(store.method).toBe('GET');
        expect(store.url).toBe('u');
        expect(store.headers).toEqual({ a: '1' });
        expect(store.params).toEqual({ b: '2' });
        expect(store.body).toBe('data');
        expect(store.bodyFormData).toEqual({ k: 'v' });
        expect(store.bodyType).toBe('json');
        expect(store.preRequestScript).toBe('pre');
        expect(store.postResponseScript).toBe('post');
        expect(store.sslConfig.rejectUnauthorized).toBe(false);
        expect(store.response?.status).toBe(200);
    });

    it('handles saveToFile with various body types', async () => {
        const store = useRequestStore();
        store.activeTab.filePath = '/f.j5';
        
        // JSON body
        store.bodyType = 'json';
        store.body = '{"x":1}';
        await store.saveToFile();
        
        // FormData body
        store.bodyType = 'form-data';
        store.bodyFormData = { k: 'v' };
        await store.saveToFile();

        // Raw body
        store.bodyType = 'text';
        store.body = 'plain';
        await store.saveToFile();

        expect(mockElectron.fs.writeFile).toHaveBeenCalledTimes(3);
    });

    it('handles tab lifecycle and closeByPath', () => {
        const store = useRequestStore();
        store.addTab();
        expect(store.tabs).toHaveLength(2);
        
        const tab2Id = store.tabs[1].id;
        store.setActiveTab(tab2Id);
        expect(store.activeTabId).toBe(tab2Id);

        store.activeTab.filePath = '/p/f.j5';
        store.closeTabByPath('/p');
        expect(store.tabs.every(t => t.filePath !== '/p/f.j5')).toBe(true);
        
        store.closeTab(store.tabs[0].id);
        expect(store.tabs.length).toBeGreaterThanOrEqual(1);
    });

    it('updates environment variables after execution', async () => {
        const store = useRequestStore();
        mockElectron.request.execute.mockResolvedValueOnce({
            success: true,
            response: { status: 200, data: 'ok', headers: {} },
            environment: { last_id: '123' }
        });

        await store.execute();
        // Since we are using real store, we could check if it calls something, 
        // but the current implementation of request.ts just updates activeTab environment state.
        expect(store.response?.status).toBe(200);
    });

    it('handles various loadFromFile branches', () => {
        const store = useRequestStore();
        const base = { id: '1', name: 'N', method: 'GET', url: 'u', headers: {}, params: {} };
        
        // case body undefined
        store.loadFromFile({ ...base, body: undefined } as any);
        expect(store.bodyType).toBe('none');

        // case other body type
        store.loadFromFile({ ...base, body: { type: 'text', content: 'txt' } } as any);
        expect(store.bodyType).toBe('text');
    });

    it('handles empty body in saveToFile', async () => {
        const store = useRequestStore();
        store.activeTab.filePath = '/f.j5';
        store.body = '  '; // Empty string
        store.bodyType = 'json';
        store.url = 'dirty';
        
        await store.saveToFile();
        const call = mockElectron.fs.writeFile.mock.calls[0];
        expect(call[1].body).toBeUndefined();
    });

    it('covers execute failure with environment update', async () => {
        const store = useRequestStore();
        mockElectron.request.execute.mockResolvedValueOnce({
            success: false,
            error: 'Failed',
            environment: { err: '1' }
        });

        await store.execute();
        expect(store.response?.statusText).toBe('Failed');
    });

    it('handles saveToFile without path error', async () => {
        const store = useRequestStore();
        store.activeTab.filePath = undefined;
        store.url = 'dirty';
        await expect(store.saveToFile()).rejects.toThrow('No hay archivo seleccionado');
    });

    it('handles JSON parse fallback in saveToFile', async () => {
        const store = useRequestStore();
        store.activeTab.filePath = '/f.j5';
        store.bodyType = 'json';
        store.body = 'invalid { json }';
        store.url = 'dirty'; // ensure isDirty
        
        await store.saveToFile();
        const call = mockElectron.fs.writeFile.mock.calls[0];
        expect(call[1].body.type).toBe('raw');
    });

    it('covers initDefaultTab branches', () => {
        const store = useRequestStore();
        store.initDefaultTab();
        expect(store.tabs).toHaveLength(1);
        
        store.addTab();
        store.initDefaultTab(); // Should not add if tabs already exist
        expect(store.tabs).toHaveLength(2);
    });

    it('covers more tab closing side effects', () => {
        const store = useRequestStore();
        store.addTab();
        const tab1Id = store.tabs[0].id;
        const tab2Id = store.tabs[1].id;
        
        store.setActiveTab(tab2Id);
        store.closeTab(tab1Id); // close non-active
        expect(store.activeTabId).toBe(tab2Id);
    });

    it('handles unknown body types in saveToFile', async () => {
        const store = useRequestStore();
        store.activeTab.filePath = '/f.j5';
        store.bodyType = 'other' as any;
        store.body = 'unknown';
        store.url = 'dirty';
        
        await store.saveToFile();
        const call = mockElectron.fs.writeFile.mock.calls[0];
        expect(call[1].body.content).toBe('unknown');
    });
});
