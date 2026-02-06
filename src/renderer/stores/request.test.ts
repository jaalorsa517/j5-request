import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRequestStore } from './request';
import { J5Request } from '../../shared/types';

describe('Request Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        // Ensure window exists
        if (typeof window === 'undefined') {
            (global as any).window = {};
        }

        (window as any).electron = {
            request: {
                execute: vi.fn()
            }
        };
    });

    it('should initialize with default values', () => {
        const store = useRequestStore();
        expect(store.method).toBe('GET');
        expect(store.url).toBe('');
        expect(store.bodyType).toBe('json');
        expect(store.isDirty).toBe(false);
    });

    it('should load request from file', () => {
        const store = useRequestStore();
        const request: J5Request = {
            id: '123',
            name: 'Test Req',
            method: 'POST',
            url: 'https://api.test',
            headers: { 'Content-Type': 'application/json' },
            params: { 'q': 'search' },
            body: { type: 'json', content: JSON.stringify({ key: 'value' }) },
            preRequestScript: 'console.log("pre")',
            postResponseScript: 'console.log("post")'
        };

        store.loadFromFile(request);

        expect(store.id).toBe('123');
        expect(store.name).toBe('Test Req');
        expect(store.method).toBe('POST');
        expect(store.url).toBe('https://api.test');
        expect(store.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(store.params).toEqual({ 'q': 'search' });
        expect(store.body).toBe(JSON.stringify({ key: 'value' })); // store unpacks content string
        expect(store.preRequestScript).toBe('console.log("pre")');
        expect(store.isDirty).toBe(false);
    });

    it('should detect dirty state when modified', () => {
        const store = useRequestStore();
        const request: J5Request = {
            id: '1', name: 'R', method: 'GET', url: 'http://t.com', headers: {}, params: {}
        };
        store.loadFromFile(request);
        expect(store.isDirty).toBe(false);

        store.method = 'POST';
        expect(store.isDirty).toBe(true);
    });

    it('should execute request successfully', async () => {
        const store = useRequestStore();
        store.url = 'https://api.test';
        store.method = 'GET';

        const mockResponse = {
            success: true,
            response: {
                status: 200,
                statusText: 'OK',
                headers: {},
                data: { success: true },
                time: 100
            }
        };

        (window as any).electron.request.execute.mockResolvedValue(mockResponse);

        await store.execute();

        expect((window as any).electron.request.execute).toHaveBeenCalled();
        expect(store.response).not.toBeNull();
        expect(store.response?.status).toBe(200);
        expect(store.isLoading).toBe(false);
    });

    it('should handle execution failure', async () => {
        const store = useRequestStore();
        const mockError = {
            success: false,
            error: 'Network Error',
            executionTime: 0
        };

        (window as any).electron.request.execute.mockResolvedValue(mockError);

        await store.execute();

        expect(store.response?.status).toBe(0);
        expect(store.response?.body).toBe('Network Error');
    });
});
