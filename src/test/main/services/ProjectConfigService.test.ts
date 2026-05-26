import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectConfigService, mergeSSLConfigs } from '@/main/services/ProjectConfigService';
import { SSLConfig } from '@/shared/types';
import fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises');

describe('ProjectConfigService', () => {
    let service: ProjectConfigService;
    const projectRoot = '/test/project';
    const configPath = path.join(projectRoot, '.j5project.json');

    beforeEach(() => {
        vi.clearAllMocks();
        service = new ProjectConfigService();
    });

    describe('loadProjectConfig', () => {
        it('should load and parse project config file', async () => {
            const mockConfig = { ssl: { rejectUnauthorized: false } };
            (fs.readFile as any).mockResolvedValue(JSON.stringify(mockConfig));

            const result = await service.loadProjectConfig(projectRoot);

            expect(fs.readFile).toHaveBeenCalledWith(configPath, 'utf-8');
            expect(result).toEqual(mockConfig);
        });

        it('should return null if file does not exist (ENOENT)', async () => {
            const error = new Error('File not found');
            (error as any).code = 'ENOENT';
            (fs.readFile as any).mockRejectedValue(error);

            const result = await service.loadProjectConfig(projectRoot);

            expect(result).toBeNull();
        });

        it('should log error and return null for other errors', async () => {
            const error = new Error('Permission denied');
            (error as any).code = 'EACCES';
            (fs.readFile as any).mockRejectedValue(error);
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const result = await service.loadProjectConfig(projectRoot);

            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('saveProjectConfig', () => {
        it('should stringify and save config to file', async () => {
            const mockConfig = { ssl: { ca: ['ca.pem'] } };
            (fs.writeFile as any).mockResolvedValue(undefined);

            await service.saveProjectConfig(projectRoot, mockConfig as any);

            expect(fs.writeFile).toHaveBeenCalledWith(
                configPath,
                JSON.stringify(mockConfig, null, 2),
                'utf-8'
            );
        });

        it('should log and throw error if save fails', async () => {
            const error = new Error('Disk full');
            (fs.writeFile as any).mockRejectedValue(error);
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(service.saveProjectConfig(projectRoot, {} as any)).rejects.toThrow('Disk full');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});

describe('mergeSSLConfigs', () => {
    const projectSSL: SSLConfig = {
        ca: ['project-ca.pem'],
        clientCert: 'project-cert.pem',
        clientKey: 'project-key.pem',
        rejectUnauthorized: true
    };

    it('should return request config if project config is undefined', () => {
        const requestSSL: SSLConfig = { ca: ['req.pem'] };
        expect(mergeSSLConfigs(undefined, requestSSL)).toEqual(requestSSL);
    });

    it('should return project config if request config is undefined', () => {
        expect(mergeSSLConfigs(projectSSL, undefined)).toEqual(projectSSL);
    });

    it('should override project config with request config values', () => {
        const requestSSL: SSLConfig = {
            ca: ['req-ca.pem'],
            rejectUnauthorized: false
        };

        const result = mergeSSLConfigs(projectSSL, requestSSL);

        expect(result).toEqual({
            ca: ['req-ca.pem'], // Overridden
            clientCert: 'project-cert.pem', // From project
            clientKey: 'project-key.pem', // From project
            rejectUnauthorized: false // Overridden
        });
    });

    it('should fallback to project values if request values are null/empty', () => {
        const requestSSL: SSLConfig = {
            ca: [], // Empty array
            clientCert: undefined
        };

        const result = mergeSSLConfigs(projectSSL, requestSSL);

        expect(result?.ca).toEqual(['project-ca.pem']);
        expect(result?.clientCert).toBe('project-cert.pem');
    });
});
