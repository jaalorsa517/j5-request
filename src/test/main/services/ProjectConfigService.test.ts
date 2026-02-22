import { describe, it, expect } from 'vitest';
import { mergeSSLConfigs } from '@/main/services/ProjectConfigService';
import { SSLConfig } from '@/shared/types';

describe('ProjectConfigService', () => {
    describe('mergeSSLConfigs', () => {
        it('should return undefined if both configs are undefined', () => {
            expect(mergeSSLConfigs(undefined, undefined)).toBeUndefined();
        });

        it('should return project config if request config is undefined', () => {
            const projectSSL: SSLConfig = { rejectUnauthorized: false };
            expect(mergeSSLConfigs(projectSSL, undefined)).toEqual(projectSSL);
        });

        it('should return request config if project config is undefined', () => {
            const requestSSL: SSLConfig = { rejectUnauthorized: true };
            expect(mergeSSLConfigs(undefined, requestSSL)).toEqual(requestSSL);
        });

        it('should override project config with request config', () => {
            const projectSSL: SSLConfig = {
                rejectUnauthorized: true,
                ca: ['root-ca.pem'],
                clientCert: 'client.pem'
            };
            const requestSSL: SSLConfig = {
                rejectUnauthorized: false,
                clientCert: 'override-client.pem',
                ca: [] // this triggers fallback to project CA based on new rules
            };

            const merged = mergeSSLConfigs(projectSSL, requestSSL);

            expect(merged).toEqual({
                rejectUnauthorized: false,
                ca: ['root-ca.pem'], // From project due to empty array rule
                clientCert: 'override-client.pem', // From request
                clientKey: undefined // Not present in either
            });
        });

        it('should prefer request properties (even undefined/null explicitly?? NO)', () => {
            // mergeSSLConfigs implementation uses ?? for coalescing.
            // ca: requestSSL.ca ?? projectSSL.ca
            // So if requestSSL.ca is undefined, uses projectSSL.ca

            const projectSSL: SSLConfig = { ca: ['ca.pem'] };
            const requestSSL: SSLConfig = { rejectUnauthorized: false }; // ca undefined

            expect(mergeSSLConfigs(projectSSL, requestSSL)?.ca).toEqual(['ca.pem']);
        });
    });
});
