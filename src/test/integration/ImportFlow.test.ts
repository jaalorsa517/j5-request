import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportService } from '@/main/services/ImportService';
import { FileSystemService } from '@/main/services/FileSystemService';
import fs from 'fs/promises';

// Functional mock for integration requirements
vi.mock('fs/promises', () => ({
    default: {
        writeFile: vi.fn().mockResolvedValue(undefined),
        readFile: vi.fn().mockResolvedValue('{}'),
        readdir: vi.fn().mockResolvedValue([]),
        mkdir: vi.fn().mockResolvedValue(undefined)
    }
}));

describe('Import Flow Definitive Integration', () => {
    let importService: ImportService;
    let fsService: FileSystemService;

    beforeEach(() => {
        vi.clearAllMocks();
        importService = new ImportService();
        fsService = new FileSystemService();
    });

    it('completes flow from cURL to disk', async () => {
        const curl = "curl http://api.com -d '{\"x\":1}'";
        const parsed = importService.parseCurl(curl);
        const savedPaths = await fsService.saveImportedRequests([parsed as any], '/tmp');
        
        expect(savedPaths).toHaveLength(1);
        expect(fs.writeFile).toHaveBeenCalled();
    });

    it('completes flow from Postman to disk', async () => {
        const postman = JSON.stringify({
            info: { schema: 'v2.1.0' },
            item: [{ name: 'Req', request: { url: 'u', method: 'GET' } }]
        });
        const parsed = importService.parsePostman(postman);
        const savedPaths = await fsService.saveImportedRequests(parsed, '/tmp');
        
        expect(savedPaths).toHaveLength(1);
        expect(fs.writeFile).toHaveBeenCalled();
    });
});
