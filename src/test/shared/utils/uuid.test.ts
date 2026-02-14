import { describe, it, expect, vi } from 'vitest';
import { generateUUID } from '@/shared/utils/uuid';

describe('uuid utils', () => {
    it('should use crypto.randomUUID if available', () => {
        const mockUUID = '12345678-1234-1234-1234-1234567890ab';
        const spy = vi.fn().mockReturnValue(mockUUID);
        
        vi.stubGlobal('crypto', {
            randomUUID: spy
        });

        const result = generateUUID();
        expect(result).toBe(mockUUID);
        expect(spy).toHaveBeenCalled();

        vi.unstubAllGlobals();
    });

    it('should use fallback if crypto.randomUUID is not available', () => {
        vi.stubGlobal('crypto', undefined);

        const result = generateUUID();
        // Basic UUID v4 format check: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        
        vi.unstubAllGlobals();
    });
});
