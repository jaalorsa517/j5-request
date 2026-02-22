import fs from 'fs/promises';
import path from 'path';
import { ProjectConfig, SSLConfig } from '@/shared/types';

const CONFIG_FILENAME = '.j5project.json';

export class ProjectConfigService {

    async loadProjectConfig(projectRoot: string): Promise<ProjectConfig | null> {
        const configPath = path.join(projectRoot, CONFIG_FILENAME);
        try {
            const content = await fs.readFile(configPath, 'utf-8');
            return JSON.parse(content) as ProjectConfig;
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                console.error(`Failed to load project config at ${configPath}:`, error);
            }
            return null;
        }
    }

    async saveProjectConfig(projectRoot: string, config: ProjectConfig): Promise<void> {
        const configPath = path.join(projectRoot, CONFIG_FILENAME);
        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Failed to save project config at ${configPath}:`, error);
            throw error;
        }
    }
}

export function mergeSSLConfigs(projectSSL: SSLConfig | undefined, requestSSL: SSLConfig | undefined): SSLConfig | undefined {
    if (!projectSSL) return requestSSL;
    if (!requestSSL) return projectSSL;

    return {
        ca: (requestSSL.ca && requestSSL.ca.length > 0) ? requestSSL.ca : projectSSL.ca,
        clientCert: requestSSL.clientCert ?? projectSSL.clientCert,
        clientKey: requestSSL.clientKey ?? projectSSL.clientKey,
        rejectUnauthorized: requestSSL.rejectUnauthorized ?? projectSSL.rejectUnauthorized,
    };
}
