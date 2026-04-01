import http from 'http';
import https from 'https';
import { URL } from 'url';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import fsPromises from 'fs/promises';
import { J5Request, SSLConfig } from '@/shared/types';
import { ScriptExecuter, ExecutionContext } from '@/main/services/ScriptExecuter';
import { EnvironmentManager } from '@/main/services/EnvironmentManager';
import { resolveRelativePath } from '@/main/utils/pathUtils';

export type ExecutionResult = {
    success: boolean;
    response?: any;
    error?: string;
    environment: Record<string, string>;
    executionTime: number;
};

class NativeHttpClient {
    async request(config: {
        method: string;
        url: string;
        headers: Record<string, string>;
        params: Record<string, string>;
        data: any;
        httpsAgent?: https.Agent;
    }): Promise<any> {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(config.url);
            
            // Add params to URL
            Object.entries(config.params).forEach(([key, value]) => {
                parsedUrl.searchParams.append(key, value);
            });

            const isHttps = parsedUrl.protocol === 'https:';
            const transport = isHttps ? https : http;

            const options: any = {
                method: config.method.toUpperCase(),
                headers: { ...config.headers },
                agent: isHttps ? config.httpsAgent : undefined,
            };

            // Handle Body
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
                const chunks: any[] = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const responseData = buffer.toString();
                    
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        headers: res.headers,
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

    constructor() {
        this.scriptExecuter = new ScriptExecuter();
        this.envManager = new EnvironmentManager();
        this.httpClient = new NativeHttpClient();
    }

    async executeRequest(request: J5Request, environment: Record<string, string>, projectRoot?: string): Promise<ExecutionResult> {
        const startTime = Date.now();
        let currentEnv = { ...environment };

        try {
            // 1. Pre-request Script
            if (request.preRequestScript) {
                const context: ExecutionContext = { environment: currentEnv };
                const result = this.scriptExecuter.execute(request.preRequestScript, context);
                currentEnv = result.environment;
            }

            // 2. Resolve Variables
            const resolvedUrl = this.envManager.resolveVariables(request.url, currentEnv);

            const resolvedHeaders: Record<string, string> = {};
            for (const [key, value] of Object.entries(request.headers)) {
                resolvedHeaders[key] = this.envManager.resolveVariables(value, currentEnv);
            }

            const resolvedParams: Record<string, string> = {};
            for (const [key, value] of Object.entries(request.params)) {
                resolvedParams[key] = this.envManager.resolveVariables(value, currentEnv);
            }

            // Body resolution
            let resolvedData: any = null;
            if (request.body) {
                if (request.body.type === 'json' && typeof request.body.content === 'string') {
                    const resolvedBodyStr = this.envManager.resolveVariables(request.body.content, currentEnv);
                    try {
                        resolvedData = JSON.parse(resolvedBodyStr);
                    } catch {
                        resolvedData = resolvedBodyStr; // Failback to string if invalid
                    }
                } else if (request.body.type === 'form-data' && typeof request.body.content === 'object') {
                    const formData = new FormData();

                    for (const [key, value] of Object.entries(request.body.content)) {
                        if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'file') {
                            const filePath = (value as any).path;
                            if (filePath) {
                                const resolvedPath = this.envManager.resolveVariables(filePath, currentEnv);
                                try {
                                    formData.append(key, createReadStream(resolvedPath));
                                } catch (e) {
                                    console.error(`Failed to read file ${resolvedPath}`, e);
                                }
                            }
                        } else {
                            const resolvedValue = this.envManager.resolveVariables(String(value), currentEnv);
                            formData.append(key, resolvedValue);
                        }
                    }
                    resolvedData = formData;
                } else if (typeof request.body.content === 'string') {
                    resolvedData = this.envManager.resolveVariables(request.body.content, currentEnv);
                } else {
                    resolvedData = request.body.content;
                }
            }

            // 3. Prepare Config
            let httpsAgent = undefined;
            if (request.sslConfig) {
                const agentOptions = await this.loadSSLCertificates(request.sslConfig, projectRoot);
                httpsAgent = new https.Agent(agentOptions);
            }

            // 4. Execute Request
            const response = await this.httpClient.request({
                method: request.method,
                url: resolvedUrl,
                headers: resolvedHeaders,
                params: resolvedParams,
                data: resolvedData,
                httpsAgent: httpsAgent
            });

            const executionTime = Date.now() - startTime;

            // 5. Post-response Script
            if (request.postResponseScript) {
                const context: ExecutionContext = {
                    environment: currentEnv,
                    response: response
                };
                const result = this.scriptExecuter.execute(request.postResponseScript, context);
                currentEnv = result.environment;
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
                executionTime: executionTime
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Unknown error',
                environment: currentEnv,
                executionTime: Date.now() - startTime
            };
        }
    }

    private async loadSSLCertificates(config: SSLConfig, projectRoot?: string): Promise<https.AgentOptions> {
        const agentOptions: https.AgentOptions = {};

        if (config.rejectUnauthorized !== undefined) {
            agentOptions.rejectUnauthorized = config.rejectUnauthorized;
        }

        const resolve = (p: string) => {
            if (!projectRoot) return p;
            return resolveRelativePath(p, projectRoot);
        };

        try {
            if (config.ca && config.ca.length > 0) {
                const caCerts: Buffer[] = [];
                for (const caPath of config.ca) {
                    const absolutePath = resolve(caPath);
                    const content = await fsPromises.readFile(absolutePath);
                    caCerts.push(content);
                }
                agentOptions.ca = caCerts;
            }

            if (config.clientCert) {
                const absolutePath = resolve(config.clientCert);
                agentOptions.cert = await fsPromises.readFile(absolutePath);
            }

            if (config.clientKey) {
                const absolutePath = resolve(config.clientKey);
                agentOptions.key = await fsPromises.readFile(absolutePath);
            }
        } catch (e: any) {
            console.error("Error loading SSL certificates", e);
            throw new Error(`Failed to load SSL certificates: ${e.message}`);
        }

        return agentOptions;
    }
}
