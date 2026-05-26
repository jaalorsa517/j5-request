import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validatePEMFormat, certificateExists, validateSSLConfig } from '@/main/utils/certificateValidator';
import fs from 'fs/promises';

vi.mock('fs/promises');

describe('certificateValidator Exhaustive', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validatePEMFormat', () => {
        it('should return true for valid PEM', async () => {
            (fs.readFile as any).mockResolvedValue('-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----');
            expect(await validatePEMFormat('cert.pem')).toBe(true);
        });

        it('should return false for non-PEM content', async () => {
            (fs.readFile as any).mockResolvedValue('just text');
            expect(await validatePEMFormat('cert.pem')).toBe(false);
        });

        it('should return false on read error', async () => {
            (fs.readFile as any).mockRejectedValue(new Error('fail'));
            expect(await validatePEMFormat('cert.pem')).toBe(false);
        });
    });

    describe('certificateExists', () => {
        it('should return true if access succeeds', async () => {
            (fs.access as any).mockResolvedValue(undefined);
            expect(await certificateExists('f')).toBe(true);
        });

        it('should return false if access fails', async () => {
            (fs.access as any).mockRejectedValue(new Error());
            expect(await certificateExists('f')).toBe(false);
        });
    });

    describe('validateSSLConfig', () => {
        const root = '/root';

        it('validates mixed valid/invalid CA certs and absolute paths', async () => {
            const config = {
                ca: ['rel.pem', '/abs/cert.pem', 'missing.pem']
            };

            (fs.access as any).mockImplementation((p: string) => {
                if (p.includes('missing.pem')) return Promise.reject(new Error());
                return Promise.resolve();
            });

            (fs.readFile as any).mockImplementation((p: string) => {
                if (p.includes('rel.pem')) return Promise.resolve('-----BEGIN'); // Invalid (no END)
                return Promise.resolve('-----BEGIN-----END');
            });

            const res = await validateSSLConfig(config, root);
            expect(res.valid).toBe(false);
            expect(res.errors).toHaveLength(2); // One missing, one invalid PEM
        });

        it('validates client cert and key missing or invalid', async () => {
            const config = {
                clientCert: 'cert.pem',
                clientKey: 'key.pem'
            };

            // Case 1: Cert missing, Key invalid PEM
            (fs.access as any).mockImplementation((p: string) => {
                if (p.includes('cert.pem')) return Promise.reject(new Error());
                return Promise.resolve();
            });
            (fs.readFile as any).mockResolvedValue('invalid');

            const res = await validateSSLConfig(config, root);
            expect(res.errors[0]).toContain('Client Certificate not found');
            expect(res.errors[1]).toContain('Invalid PEM format for Client Key');

            // Case 2: Cert exists but invalid PEM, Key missing
            (fs.access as any).mockImplementation((p: string) => {
                if (p.includes('key.pem')) return Promise.reject(new Error());
                return Promise.resolve();
            });
            (fs.readFile as any).mockResolvedValue('invalid');
            const res2 = await validateSSLConfig(config, root);
            expect(res2.errors[0]).toContain('Invalid PEM format for Client Certificate');
            expect(res2.errors[1]).toContain('Client Key not found');
        });

        it('returns valid true if all checks pass', async () => {
            (fs.access as any).mockResolvedValue(undefined);
            (fs.readFile as any).mockResolvedValue('-----BEGIN-----END');
            const res = await validateSSLConfig({ ca: ['c'], clientCert: 'cc' }, root);
            expect(res.valid).toBe(true);
        });
    });
});
