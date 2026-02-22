import { validatePEMFormat, certificateExists, validateSSLConfig } from '@/main/utils/certificateValidator';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs/promises';


// Mock fs/promises
vi.mock('fs/promises', () => ({
    default: {
        readFile: vi.fn(),
        access: vi.fn()
    },
    readFile: vi.fn(),
    access: vi.fn()
}));

describe('certificateValidator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validatePEMFormat', () => {
        it('should return true for valid PEM content', async () => {
            const validPEM = '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAg...\n-----END CERTIFICATE-----';
            (fs.readFile as any).mockResolvedValue(validPEM);

            const isValid = await validatePEMFormat('/path/to/cert.pem');
            expect(isValid).toBe(true);
        });

        it('should return false for invalid PEM content', async () => {
            const invalidPEM = 'just some random text';
            (fs.readFile as any).mockResolvedValue(invalidPEM);

            const isValid = await validatePEMFormat('/path/to/invalid.pem');
            expect(isValid).toBe(false);
        });

        it('should return false if reading file fails', async () => {
            (fs.readFile as any).mockRejectedValue(new Error('File not found'));

            const isValid = await validatePEMFormat('/path/to/missing.pem');
            expect(isValid).toBe(false);
        });
    });

    describe('certificateExists', () => {
        it('should return true if file exists', async () => {
            (fs.access as any).mockResolvedValue(true);
            const exists = await certificateExists('/path/to/file');
            expect(exists).toBe(true);
        });

        it('should return false if file check fails', async () => {
            (fs.access as any).mockRejectedValue(new Error('Not found'));
            const exists = await certificateExists('/path/to/file');
            expect(exists).toBe(false);
        });
    });

    describe('validateSSLConfig', () => {
        it('should return valid if no config provided options', async () => {
            const result = await validateSSLConfig({}, '/root');
            expect(result.valid).toBe(true);
        });

        it('should validate CA certs presence and format', async () => {
            (fs.access as any).mockResolvedValue(true);
            (fs.readFile as any).mockResolvedValue('-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----');

            const result = await validateSSLConfig({ ca: ['ca.pem'] }, '/root');
            expect(result.valid).toBe(true);
        });

        it('should return errors for missing CA certs', async () => {
            (fs.access as any).mockRejectedValue(new Error('Not found'));

            const result = await validateSSLConfig({ ca: ['missing.pem'] }, '/root');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('CA Certificate not found: missing.pem');
        });

        it('should valid client cert and key', async () => {
            (fs.access as any).mockResolvedValue(true);
            (fs.readFile as any).mockResolvedValue('-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'); // Reusing mock simple check

            const result = await validateSSLConfig({
                clientCert: 'cert.pem',
                clientKey: 'key.pem'
            }, '/root');
            expect(result.valid).toBe(true);
        });
    });
});
