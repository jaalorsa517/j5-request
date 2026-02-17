import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportService } from '@/main/services/ImportService';
import { FileSystemService } from '@/main/services/FileSystemService';
import fs from 'fs/promises';


// Mock fs/promises
vi.mock('fs/promises', () => ({
    default: {
        mkdir: vi.fn(),
        writeFile: vi.fn(),
        access: vi.fn(),
        // mocks extras necesarios para FileSystemService
        readdir: vi.fn(),
        rm: vi.fn(),
        readFile: vi.fn(),
        rename: vi.fn(),
    }
}));

describe('Import Flow Integration', () => {
    let importService: ImportService;
    let fsService: FileSystemService;

    beforeEach(() => {
        importService = new ImportService();
        fsService = new FileSystemService();
        vi.clearAllMocks();
    });

    it('should complete full flow: detect -> parse (cURL) -> convert -> save', async () => {
        // 1. Input content (cURL)
        const content = `curl -X POST https://api.com/users -H "Content-Type: application/json" -d '{"name":"Test User"}'`;

        // 2. Detect
        const detection = importService.detectFormat(content);
        expect(detection.format).toBe('curl');

        // 3. Parse & Convert (Simulating IPC orchestration)
        const parsed = importService.parseCurl(content);
        const j5Request = importService.convertToJ5Request(parsed);
        const requests = [j5Request];

        expect(requests).toHaveLength(1);
        expect(requests[0].method).toBe('POST');
        expect(requests[0].url).toBe('https://api.com/users');
        expect(requests[0].headers).toHaveProperty('Content-Type', 'application/json');

        // 4. Save
        const targetDir = '/tmp/import-test';
        // Mock fs behavior
        (fs.mkdir as any).mockResolvedValue(undefined);
        (fs.access as any).mockRejectedValue(new Error('File not found')); // Simulate no file conflict

        const savedPaths = await fsService.saveImportedRequests(requests, targetDir);

        expect(savedPaths).toHaveLength(1);

        // Verify file content was written appropriately
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringMatching(/POST-.*\.j5request/), // Filename pattern
            expect.stringContaining('"name": "Test User"'), // Content check
            'utf-8'
        );
    });

    it('should complete full flow: parse (OpenAPI) -> convert -> save batch', async () => {
        // 1. Input content (OpenAPI JSON)
        const content = JSON.stringify({
            openapi: '3.0.0',
            paths: {
                '/users': {
                    get: { summary: 'List Users' },
                    post: { summary: 'Create User' }
                }
            }
        });

        // 2. Detect
        const detection = importService.detectFormat(content);
        expect(detection.format).toBe('openapi');

        // 3. Parse & Convert
        const parsedList = importService.parseOpenAPI(content);
        const requests = parsedList.map(p => importService.convertToJ5Request(p));

        expect(requests).toHaveLength(2); // GET and POST

        // 4. Save
        const targetDir = '/tmp/import-test';
        (fs.mkdir as any).mockResolvedValue(undefined);
        (fs.access as any).mockRejectedValue(new Error('File not found'));

        const savedPaths = await fsService.saveImportedRequests(requests, targetDir);

        expect(savedPaths).toHaveLength(2);
        expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });
});
