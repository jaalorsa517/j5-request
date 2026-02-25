import fs from 'fs/promises';
import path from 'path';
import { J5Environment } from '@/shared/types';
import { parseJson, serializeJson } from '@/shared/utils/json-helpers';
import { CryptoService } from '@/main/services/CryptoService';



export class EnvironmentManager {

    private cryptoService = new CryptoService();

    constructor() { }

    /**
     * Resolves variables in a string template using the provided environment map.
     * Supports nested variables (e.g. {{a}} calls {{b}}).
     */
    resolveVariables(template: string, variables: Record<string, string>): string {
        if (!template) return template;

        let result = template;
        let changed = true;
        let iterations = 0;
        const maxIterations = 10; // Prevent infinite loops

        while (changed && iterations < maxIterations) {
            changed = false;
            result = result.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, varName) => {
                if (Object.prototype.hasOwnProperty.call(variables, varName)) {
                    changed = true;
                    return variables[varName];
                }
                return match; // Keep unresolved variables as is
            });
            iterations++;
        }

        return result;
    }

    /**
     * Flattens an environment into a key-value pair map, considering only enabled variables.
     */
    flattenEnvironment(env: J5Environment): Record<string, string> {
        const result: Record<string, string> = {};
        env.variables.forEach(v => {
            if (v.enabled) {
                result[v.key] = v.value;
            }
        });
        return result;
    }

    async loadEnvironment(filePath: string, projectPath?: string): Promise<J5Environment> {
        const content = await fs.readFile(filePath, 'utf-8');
        const env = parseJson<J5Environment>(content);

        // Desencriptar variables secret si hay projectPath (no es globals)
        if (projectPath && this.hasEncryptedValues(env)) {
            const key = await this.getProjectKey(projectPath);
            if (!key) {
                throw new Error('MISSING_ENVIRONMENT_KEY: No se encontró la llave (environment.key) para este proyecto. Los secrets no pueden ser leídos.');
            }
            this.decryptEnvironment(env, key);
        }

        return env;
    }

    async saveEnvironment(filePath: string, env: J5Environment, projectPath?: string): Promise<void> {
        // Clonar para no mutar el original
        const envToSave: J5Environment = JSON.parse(JSON.stringify(env));

        // Encriptar variables secret si hay projectPath (no es globals)
        if (projectPath && this.hasSecretVariables(envToSave)) {
            const key = await this.getOrCreateProjectKey(projectPath);
            this.encryptEnvironment(envToSave, key);
        }

        const content = serializeJson(envToSave);
        await fs.writeFile(filePath, content, 'utf-8');
    }

    // --- Métodos de encriptación ---

    /**
     * Encripta las variables de tipo 'secret' en el environment.
     * Evita doble encriptación si el valor ya está encriptado.
     */
    private encryptEnvironment(env: J5Environment, key: Buffer): void {
        for (const variable of env.variables) {
            if (variable.type === 'secret' && !this.cryptoService.isEncrypted(variable.value)) {
                variable.value = this.cryptoService.encrypt(variable.value, key);
            }
        }
    }

    /**
     * Desencripta las variables con formato ENC[...] en el environment.
     */
    private decryptEnvironment(env: J5Environment, key: Buffer): void {
        for (const variable of env.variables) {
            if (this.cryptoService.isEncrypted(variable.value)) {
                try {
                    variable.value = this.cryptoService.decrypt(variable.value, key);
                } catch (e: any) {
                    throw new Error(`Error al desencriptar variable "${variable.key}": ${e.message}`);
                }
            }
        }
    }

    private hasSecretVariables(env: J5Environment): boolean {
        return env.variables.some(v => v.type === 'secret');
    }

    private hasEncryptedValues(env: J5Environment): boolean {
        return env.variables.some(v => this.cryptoService.isEncrypted(v.value));
    }

    // --- Gestión de llaves ---

    /**
     * Obtiene la llave de encriptación de un proyecto, o la crea si no existe.
     */
    async getOrCreateProjectKey(projectPath: string): Promise<Buffer> {
        const existing = await this.getProjectKey(projectPath);
        if (existing) return existing;

        const key = this.cryptoService.generateRandomKey();
        await this.saveProjectKey(projectPath, key);
        return key;
    }

    /**
     * Lee la llave de encriptación de un proyecto desde environment.key.
     */
    async getProjectKey(projectPath: string): Promise<Buffer | null> {
        const keyPath = path.join(projectPath, 'environment.key');
        try {
            const content = await fs.readFile(keyPath, 'utf-8');
            return Buffer.from(content.trim(), 'base64');
        } catch {
            return null;
        }
    }

    /**
     * Guarda la llave de encriptación en environment.key e intenta inyectarla en .gitignore.
     */
    async saveProjectKey(projectPath: string, key: Buffer): Promise<void> {
        const keyPath = path.join(projectPath, 'environment.key');
        const encodedKey = key.toString('base64');

        // Evitar sobrescritura de llave existente para evitar caos criptografico
        try {
            await fs.access(keyPath);
            return; // Ya existe, salimos (no destructivo)
        } catch {
            // Error significa inexistencia. Continuar 
        }

        await fs.writeFile(keyPath, encodedKey, 'utf-8');

        // Intentar agregar al .gitignore automaticaMENTE
        try {
            const gitignorePath = path.join(projectPath, '.gitignore');
            let content = '';
            try {
                content = await fs.readFile(gitignorePath, 'utf-8');
            } catch {
                // Si no existe, ignoramos (dependiendo del equipo querran crearlo o no)
                return;
            }
            if (!content.includes('environment.key')) {
                const prefix = content.endsWith('\n') || content === '' ? '' : '\n';
                await fs.writeFile(gitignorePath, `${content}${prefix}environment.key\n`, 'utf-8');
            }
        } catch (e) {
            // Ignorar errores del gitignore
        }
    }
}
