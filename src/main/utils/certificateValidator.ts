import fs from 'fs/promises';
import path from 'path';
import { SSLConfig } from '@/shared/types';

export async function validatePEMFormat(filePath: string): Promise<boolean> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        // Basic PEM validation: check for BEGIN/END block
        // It's a loose check, but sufficient for basic validation
        return content.includes('-----BEGIN') && content.includes('-----END');
    } catch {
        return false;
    }
}

export async function certificateExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function validateSSLConfig(config: SSLConfig, projectRoot: string): Promise<{ valid: boolean, errors: string[] }> {
    const errors: string[] = [];

    // Validate CA certs
    if (config.ca) {
        for (const caPath of config.ca) {
            const absolutePath = path.isAbsolute(caPath) ? caPath : path.join(projectRoot, caPath);
            if (!await certificateExists(absolutePath)) {
                errors.push(`CA Certificate not found: ${caPath}`);
                continue;
            }
            if (!await validatePEMFormat(absolutePath)) {
                errors.push(`Invalid PEM format for CA: ${caPath}`);
            }
        }
    }

    // Validate Client Cert
    if (config.clientCert) {
        const absolutePath = path.isAbsolute(config.clientCert) ? config.clientCert : path.join(projectRoot, config.clientCert);
        if (!await certificateExists(absolutePath)) {
            errors.push(`Client Certificate not found: ${config.clientCert}`);
        } else if (!await validatePEMFormat(absolutePath)) {
            errors.push(`Invalid PEM format for Client Certificate: ${config.clientCert}`);
        }
    }

    // Validate Client Key
    if (config.clientKey) {
        const absolutePath = path.isAbsolute(config.clientKey) ? config.clientKey : path.join(projectRoot, config.clientKey);
        if (!await certificateExists(absolutePath)) {
            errors.push(`Client Key not found: ${config.clientKey}`);
        } else if (!await validatePEMFormat(absolutePath)) {
            errors.push(`Invalid PEM format for Client Key: ${config.clientKey}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
