import vm from 'vm';
import { ExecutionContext, ScriptResult } from '@/shared/types';

export class ScriptExecuter {
    execute(scriptCode: string, context: ExecutionContext): ScriptResult {
        const timeout = 500; // 500ms timeout per requirements

        if (!scriptCode || !scriptCode.trim()) {
            return { success: true, environment: context.environment };
        }

        // Clone environment so we don't mutate input directly until done
        const envCopy = { ...context.environment };

        // Define PM API
        const pm = {
            environment: {
                get: (key: string) => envCopy[key],
                set: (key: string, value: string) => {
                    envCopy[key] = value;
                }
            },
            response: (() => {
                if (!context.response) return undefined;
                const response = context.response;
                return {
                    code: response.status,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    body: response.data,
                    // Helper methods
                    json: () => {
                        if (typeof response.data === 'string') {
                            try { return JSON.parse(response.data); } catch { return null; }
                        }
                        return response.data;
                    },
                    text: () => {
                        if (typeof response.data === 'object') {
                            return JSON.stringify(response.data);
                        }
                        return String(response.data);
                    }
                };
            })()
        };

        const sandbox = {
            pm,
            console: {
                log: (...args: any[]) => console.log('[Script Log]', ...args),
                error: (...args: any[]) => console.error('[Script Error]', ...args),
                warn: (...args: any[]) => console.warn('[Script Warn]', ...args)
            }
        };

        vm.createContext(sandbox);

        try {
            vm.runInContext(scriptCode, sandbox, {
                timeout: timeout,
                displayErrors: true
            });
            return {
                success: true,
                environment: envCopy
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || String(error)
            };
        }
    }
}
