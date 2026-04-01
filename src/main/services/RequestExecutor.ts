import { J5Request, ExecutionResult, ExecutionContext } from '@/shared/types';
import { ScriptExecuter } from '@/main/services/ScriptExecuter';
import { EnvironmentManager } from '@/main/services/EnvironmentManager';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import FormData from 'form-data';
import fsPromises from 'fs/promises';
import { resolveRelativePath } from '@/main/utils/pathUtils';

export class NativeHttpClient {
    async request(config: {
        method: string;
        url: string;
        headers: Record<string, string>;
        data?: any;
        sslConfig?: {
            clientCert?: string;
            clientKey?: string;
            ca?: string[];
            rejectUnauthorized?: boolean;
        };
        projectRoot?: string;
    }): Promise<{ status: number; statusText: string; headers: any; data: any }> {
        const parsedUrl = new URL(config.url);
        const isHttps = parsedUrl.protocol === 'https:';
        const transport = isHttps ? https : http;

        const options: any = {
            method: config.method,
            headers: { ...config.headers },
            rejectUnauthorized: config.sslConfig?.rejectUnauthorized !== false,
        };

        if (isHttps && config.sslConfig) {
            const root = config.projectRoot;
            if (config.sslConfig.ca && config.sslConfig.ca.length > 0) {
                try {
                    const caCerts = await Promise.all(
                        config.sslConfig.ca.map(p => fsPromises.readFile(root ? resolveRelativePath(p, root) : p))
                    );
                    options.ca = caCerts;
                } catch (error: any) {
                    throw new Error(`Failed to load SSL certificates (CA): ${error.message}`);
                }
            }
            if (config.sslConfig.clientCert) {
                try {
                    const p = config.sslConfig.clientCert;
                    options.cert = await fsPromises.readFile(root ? resolveRelativePath(p, root) : p);
                } catch (error: any) {
                    throw new Error(`Failed to load SSL certificates (Cert): ${error.message}`);
                }
            }
            if (config.sslConfig.clientKey) {
                try {
                    const p = config.sslConfig.clientKey;
                    options.key = await fsPromises.readFile(root ? resolveRelativePath(p, root) : p);
                } catch (error: any) {
                    throw new Error(`Failed to load SSL certificates (Key): ${error.message}`);
                }
            }
        }

        return new Promise((resolve, reject) => {
            let bodyData: any = null;
            if (config.data) {
                if (config.data instanceof FormData) {
                    const formHeaders = config.data.getHeaders();
                    Object.assign(options.headers, formHeaders);
                    bodyData = config.data;
                } else if (typeof config.data === 'object') {
                    bodyData = JSON.stringify(config.data);
                    options.headers['Content-Type'] = 'application/json';
                    options.headers['Content-Length'] = Buffer.byteLength(bodyData);
                } else {
                    bodyData = String(config.data);
                    options.headers['Content-Length'] = Buffer.byteLength(bodyData);
                }
            }

            const req = transport.request(parsedUrl, options, (res) => {
                res.on('error', (err) => {
                    reject(err);
                });
                const chunks: any[] = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const responseData = buffer.toString();
                    
                    resolve({
                        status: res.statusCode || 0,
                        statusText: res.statusMessage || '',
                        headers: res.headers as any,
                        data: responseData
                    });
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            if (bodyData) {
                if (bodyData instanceof FormData) {
                    bodyData.pipe(req);
                } else {
                    req.write(bodyData);
                    req.end();
                }
            } else {
                req.end();
            }
        });
    }
}

export class RequestExecutor {
    private scriptExecuter: ScriptExecuter;
    private envManager: EnvironmentManager;
    private httpClient: NativeHttpClient;

    constructor(scriptExecuter?: ScriptExecuter, envManager?: EnvironmentManager, httpClient?: any) {
        this.scriptExecuter = scriptExecuter || new ScriptExecuter();
        this.envManager = envManager || new EnvironmentManager();
        this.httpClient = httpClient || new NativeHttpClient();
    }

    async executeRequest(request: J5Request, environment: Record<string, string>, projectRoot?: string): Promise<ExecutionResult> {
        const startTime = Date.now();
        let currentEnv = { ...environment };

        const reqHeaders = request.headers || {};
        const reqParams = request.params || {};

        try {
            // 1. Pre-request Script
            if (request.preRequestScript) {
                const context: ExecutionContext = { environment: currentEnv };
                const result = this.scriptExecuter.execute(request.preRequestScript, context);
                if (result.success === false) {
                    return {
                        success: false,
                        error: `Pre-request Script Error: ${result.error}`,
                        executionTime: Date.now() - startTime
                    };
                }
                if (result.environment) {
                    currentEnv = result.environment;
                }
            }

            // 2. Resolve Variables
            let resolvedUrl = this.envManager.resolveVariables(request.url, currentEnv);

            const resolvedHeaders: Record<string, string> = {};
            for (const [key, value] of Object.entries(reqHeaders)) {
                resolvedHeaders[key] = this.envManager.resolveVariables(value, currentEnv);
            }

            const resolvedParams: Record<string, string> = {};
            for (const [key, value] of Object.entries(reqParams)) {
                resolvedParams[key] = this.envManager.resolveVariables(value, currentEnv);
            }

            if (Object.keys(resolvedParams).length > 0) {
                const urlObj = new URL(resolvedUrl);
                for (const [key, value] of Object.entries(resolvedParams)) {
                    urlObj.searchParams.append(key, value);
                }
                resolvedUrl = urlObj.toString();
            }

            let resolvedData: any = null;
            if (request.body) {
                if (request.body.type === 'json' && typeof request.body.content === 'string') {
                    const resolvedBodyStr = this.envManager.resolveVariables(request.body.content, currentEnv);
                    try {
                        resolvedData = JSON.parse(resolvedBodyStr);
                    } catch {
                        resolvedData = resolvedBodyStr;
                    }
                } else if (request.body.type === 'form-data' && typeof request.body.content === 'object') {
                    const formData = new FormData();
                    for (const [key, value] of Object.entries(request.body.content)) {
                        if (typeof value === 'object' && value !== null && 'type' in value && (value as any).type === 'file') {
                            try {
                                const fileContent = await fsPromises.readFile((value as any).path);
                                formData.append(key, fileContent, { filename: (value as any).name || 'file' });
                            } catch (e) {
                                console.error('Error attaching file:', e);
                            }
                        } else {
                            formData.append(key, this.envManager.resolveVariables(String(value), currentEnv));
                        }
                    }
                    resolvedData = formData;
                } else if (request.body.content) {
                    resolvedData = this.envManager.resolveVariables(String(request.body.content), currentEnv);
                }
            }

            // 3. Execute HTTP Request
            const response = await this.httpClient.request({
                method: request.method,
                url: resolvedUrl,
                headers: resolvedHeaders,
                data: resolvedData,
                sslConfig: request.sslConfig,
                projectRoot
            });

            const executionTime = Date.now() - startTime;

            // 4. Post-response Script
            if (request.postResponseScript) {
                const context: ExecutionContext = { 
                    environment: currentEnv,
                    response: {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        data: response.data
                    }
                };
                const postResult = this.scriptExecuter.execute(request.postResponseScript, context);
                if (postResult.success === false) {
                    return {
                        success: false,
                        error: `Post-response Script Error: ${postResult.error}`,
                        executionTime: Date.now() - startTime
                    };
                }
                if (postResult.environment) {
                    currentEnv = postResult.environment;
                }
            }

            return {
                success: true,
                response: {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    data: response.data,
                    time: executionTime
                },
                environment: currentEnv,
                executionTime
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Error desconocido',
                executionTime: Date.now() - startTime
            };
        }
    }
}
