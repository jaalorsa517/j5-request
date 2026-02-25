import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // GCM recommended IV length
const ENC_PREFIX = 'ENC[AES256_GCM:';
const ENC_SUFFIX = ']';

/**
 * Servicio de criptografía para encriptar/desencriptar variables de tipo 'secret'
 * en environment files locales del proyecto.
 * 
 * Formato de valor encriptado:
 * ENC[AES256_GCM:iv:<hex>:data:<hex>:tag:<hex>]
 */
export class CryptoService {

    /**
     * Genera una llave de encriptación criptográficamente fuerte de 256 bits.
     */
    generateRandomKey(): Buffer {
        return crypto.randomBytes(KEY_LENGTH);
    }

    /**
     * Encripta un valor en texto plano usando AES-256-GCM.
     * Retorna el formato: ENC[AES256_GCM:iv:<hex>:data:<hex>:tag:<hex>]
     */
    encrypt(plaintext: string, key: Buffer): string {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag();

        return `${ENC_PREFIX}iv:${iv.toString('hex')}:data:${encrypted}:tag:${tag.toString('hex')}${ENC_SUFFIX}`;
    }

    /**
     * Desencripta un valor en formato ENC[...] usando AES-256-GCM.
     * Valida automáticamente la integridad via authentication tag.
     */
    decrypt(encryptedValue: string, key: Buffer): string {
        const parsed = this.parseEncryptedValue(encryptedValue);
        if (!parsed) {
            throw new Error('Formato de valor encriptado inválido');
        }

        const { iv, data, tag } = parsed;

        const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));

        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Detecta si un valor tiene el formato encriptado ENC[...].
     */
    isEncrypted(value: string): boolean {
        return typeof value === 'string' && value.startsWith(ENC_PREFIX) && value.endsWith(ENC_SUFFIX);
    }

    /**
     * Parsea un valor encriptado en sus componentes (iv, data, tag).
     * Retorna null si el formato es inválido.
     */
    private parseEncryptedValue(value: string): { iv: string; data: string; tag: string } | null {
        if (!this.isEncrypted(value)) return null;

        // Extraer contenido entre ENC[AES256_GCM: y ]
        const inner = value.slice(ENC_PREFIX.length, -ENC_SUFFIX.length);

        // Formato esperado: iv:<hex>:data:<hex>:tag:<hex>
        const match = inner.match(/^iv:([0-9a-f]+):data:([0-9a-f]*):tag:([0-9a-f]+)$/i);
        if (!match) return null;

        return {
            iv: match[1],
            data: match[2],
            tag: match[3]
        };
    }
}
