import { describe, it, expect } from 'vitest';
import { CryptoService } from '@/main/services/CryptoService';

describe('CryptoService', () => {
    const service = new CryptoService();

    describe('encrypt() y decrypt()', () => {
        it('should encrypt and decrypt round-trip successfully', () => {
            const key = service.generateProjectKey('/test/project');
            const plaintext = 'my-secret-api-key-12345';

            const encrypted = service.encrypt(plaintext, key);
            const decrypted = service.decrypt(encrypted, key);

            expect(decrypted).toBe(plaintext);
            expect(encrypted).not.toBe(plaintext);
        });

        it('should produce different ciphertexts for same plaintext (random IV)', () => {
            const key = service.generateProjectKey('/test/project');
            const plaintext = 'same-value';

            const enc1 = service.encrypt(plaintext, key);
            const enc2 = service.encrypt(plaintext, key);

            expect(enc1).not.toBe(enc2); // Diferentes IVs
        });

        it('should handle empty string', () => {
            const key = service.generateProjectKey('/test/project');
            const encrypted = service.encrypt('', key);
            const decrypted = service.decrypt(encrypted, key);
            expect(decrypted).toBe('');
        });

        it('should handle special characters and unicode', () => {
            const key = service.generateProjectKey('/test/project');
            const plaintext = '¡Hola! 🔑 contraseña@#$%^&*()';
            const encrypted = service.encrypt(plaintext, key);
            const decrypted = service.decrypt(encrypted, key);
            expect(decrypted).toBe(plaintext);
        });

        it('should fail to decrypt with wrong key', () => {
            const key1 = service.generateProjectKey('/project/A');
            const key2 = service.generateProjectKey('/project/B');
            const encrypted = service.encrypt('secret', key1);

            expect(() => service.decrypt(encrypted, key2)).toThrow();
        });

        it('should throw on invalid encrypted format', () => {
            const key = service.generateProjectKey('/test');
            expect(() => service.decrypt('not-encrypted', key)).toThrow('Formato de valor encriptado inválido');
        });

        it('should throw on corrupted encrypted value', () => {
            const key = service.generateProjectKey('/test');
            const corrupted = 'ENC[AES256_GCM:iv:00:data:ff:tag:00]';
            expect(() => service.decrypt(corrupted, key)).toThrow();
        });
    });

    describe('isEncrypted()', () => {
        it('should return true for valid ENC format', () => {
            expect(service.isEncrypted('ENC[AES256_GCM:iv:abc:data:def:tag:123]')).toBe(true);
        });

        it('should return false for plain text', () => {
            expect(service.isEncrypted('my-api-key')).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(service.isEncrypted('')).toBe(false);
        });

        it('should return false for partial ENC prefix', () => {
            expect(service.isEncrypted('ENC[AES256_GCM:')).toBe(false);
        });

        it('should return false for non-string values', () => {
            expect(service.isEncrypted(null as any)).toBe(false);
            expect(service.isEncrypted(undefined as any)).toBe(false);
            expect(service.isEncrypted(123 as any)).toBe(false);
        });
    });

    describe('generateProjectKey()', () => {
        it('should be deterministic (same path → same key)', () => {
            const key1 = service.generateProjectKey('/home/user/project');
            const key2 = service.generateProjectKey('/home/user/project');
            expect(key1.equals(key2)).toBe(true);
        });

        it('should produce different keys for different paths', () => {
            const key1 = service.generateProjectKey('/project/A');
            const key2 = service.generateProjectKey('/project/B');
            expect(key1.equals(key2)).toBe(false);
        });

        it('should produce 32-byte keys (256 bits)', () => {
            const key = service.generateProjectKey('/test');
            expect(key.length).toBe(32);
        });
    });

    describe('obfuscateKey() y deobfuscateKey()', () => {
        it('should round-trip successfully', () => {
            const key = service.generateProjectKey('/test/project');
            const obfuscated = service.obfuscateKey(key);
            const recovered = service.deobfuscateKey(obfuscated);
            expect(recovered.equals(key)).toBe(true);
        });

        it('should produce different output than plain base64', () => {
            const key = service.generateProjectKey('/test');
            const obfuscated = service.obfuscateKey(key);
            const plainBase64 = key.toString('base64');
            expect(obfuscated).not.toBe(plainBase64);
        });
    });

    describe('backwards compatibility', () => {
        it('should not detect non-ENC values as encrypted', () => {
            expect(service.isEncrypted('https://api.example.com')).toBe(false);
            expect(service.isEncrypted('Bearer token123')).toBe(false);
            expect(service.isEncrypted('{"key": "value"}')).toBe(false);
        });
    });
});
