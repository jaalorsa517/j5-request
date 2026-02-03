import vm from 'vm';

export interface ExecutionContext {
    environment: Record<string, string>;
    response?: any; // Expecting Axios-like structure: { status, statusText, headers, data }
}

export class ScriptExecuter {
    execute(scriptCode: string, context: ExecutionContext): ExecutionContext {
        const timeout = 500; // 500ms timeout per requirements

        if (!scriptCode || !scriptCode.trim()) {
            return context;
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
                console.log('[ScriptExecuter] Logic check | Status:', context.response.status, 'Text:', context.response.statusText);
                return {
                    code: context.response.status,
                    status: context.response.status,
                    statusText: context.response.statusText,
                    headers: context.response.headers,
                    body: context.response.data,
                    // Helper methods
                    json: () => {
                        if (typeof context.response.data === 'string') {
                            try { return JSON.parse(context.response.data); } catch { return null; }
                        }
                        return context.response.data;
                    },
                    text: () => {
                        if (typeof context.response.data === 'object') {
                            return JSON.stringify(context.response.data);
                        }
                        return String(context.response.data);
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
        } catch (error) {
            throw new Error(`Script execution failed: ${error}`);
        }

        return {
            environment: envCopy,
            response: context.response
        };
    }
}
