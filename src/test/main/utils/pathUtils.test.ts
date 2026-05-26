import { describe, it, expect } from 'vitest';
import { resolveRelativePath, makeRelativePath } from '@/main/utils/pathUtils';
import path from 'path';

describe('pathUtils', () => {
    describe('resolveRelativePath', () => {
        it('should return the same path if it is already absolute', () => {
            const absolute = path.resolve('/absolute/path');
            expect(resolveRelativePath(absolute, '/root')).toBe(absolute);
        });

        it('should join relative path with project root', () => {
            const root = '/project/root';
            const relative = 'certs/ca.pem';
            const expected = path.join(root, relative);
            expect(resolveRelativePath(relative, root)).toBe(expected);
        });
    });

    describe('makeRelativePath', () => {
        it('should return relative path from absolute path and root', () => {
            const root = '/project/root';
            const absolute = '/project/root/src/file.ts';
            const expected = path.relative(root, absolute);
            expect(makeRelativePath(absolute, root)).toBe(expected);
        });
    });
});
