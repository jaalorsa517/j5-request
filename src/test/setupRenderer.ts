import { vi, beforeEach } from 'vitest';

// Mock window.electron only if window exists (renderer tests)
if (typeof window !== 'undefined') {
    (window as any).electron = {
        ipcRenderer: {
            send: vi.fn(),
            on: vi.fn(),
            invoke: vi.fn(),
            removeListener: vi.fn(),
        },
    };
}

// Mock LocalStorage if needed (jsdom usually supports it, but ensure reset)
beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
        localStorage.clear();
    }
    vi.clearAllMocks();
});
