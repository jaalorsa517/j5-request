import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSystemStore } from './system';

describe('System Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should have correct initial state', () => {
        const store = useSystemStore();
        expect(store.workerStatus).toBe('Unknown');
        expect(store.mainStatus).toBe('Connected');
    });

    it('should update worker status', () => {
        const store = useSystemStore();
        store.setWorkerStatus('Active');
        expect(store.workerStatus).toBe('Active');
    });
});
