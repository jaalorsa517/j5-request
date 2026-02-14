import axios, { AxiosRequestConfig, Method } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { J5Request } from '@/shared/types';
import { ScriptExecuter, ExecutionContext } from '@/main/services/ScriptExecuter';
import { EnvironmentManager } from '@/main/services/EnvironmentManager';

export type ExecutionResult = {
    success: boolean;
    response?: any;
    error?: string;
    environment: Record<string, string>;
    executionTime: number;
};

export class RequestExecutor {
    private scriptExecuter: ScriptExecuter;
    private envManager: EnvironmentManager;

    constructor() {
        this.scriptExecuter = new ScriptExecuter();
        this.envManager = new EnvironmentManager();
    }

    async executeRequest(request: J5Request, environment: Record<string, string>): Promise<ExecutionResult> {
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
                    // Use 'form-data' package for Node.js environments
                    const formData = new FormData();

                    for (const [key, value] of Object.entries(request.body.content)) {
                        if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'file') {
                            // Handle file
                            const filePath = (value as any).path;
                            if (filePath) {
                                // Resolve path variables just in case? Usually paths are absolute from picker but user might type invalid path
                                const resolvedPath = this.envManager.resolveVariables(filePath, currentEnv);
                                try {
                                    formData.append(key, createReadStream(resolvedPath));
                                } catch (e) {
                                    console.error(`Failed to read file ${resolvedPath}`, e);
                                    // Optionally append error or skip
                                }
                            }
                        } else {
                            // Handle text
                            const resolvedValue = this.envManager.resolveVariables(String(value), currentEnv);
                            formData.append(key, resolvedValue);
                        }
                    }
                    resolvedData = formData;

                    // Fix for axios with form-data in Node: explicitly get headers including boundary
                    const formHeaders = formData.getHeaders();
                    // Merge with existing headers
                    resolvedHeaders['Content-Type'] = formHeaders['content-type'];

                } else if (typeof request.body.content === 'string') {
                    resolvedData = this.envManager.resolveVariables(request.body.content, currentEnv);
                } else {
                    resolvedData = request.body.content;
                }
            }

            // 3. Prepare Config
            const config: AxiosRequestConfig = {
                method: request.method as Method,
                url: resolvedUrl,
                headers: resolvedHeaders,
                params: resolvedParams,
                data: resolvedData,
                validateStatus: () => true, // Don't throw on 4xx/5xx
                transformResponse: [(data) => data] // Don't parse JSON automatically, we want raw first
            };

            // 4. Execute Request
            const response = await axios(config);

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
}
