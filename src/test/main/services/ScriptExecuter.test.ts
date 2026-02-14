import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScriptExecuter, ExecutionContext } from '@/main/services/ScriptExecuter';

describe('ScriptExecuter', () => {
    let scriptExecuter: ScriptExecuter;

    beforeEach(() => {
        scriptExecuter = new ScriptExecuter();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return context unchanged if script is empty', () => {
        const context: ExecutionContext = {
            environment: { key: 'value' }
        };
        const result = scriptExecuter.execute('', context);
        expect(result).toEqual(context);
    });

    it('should allow getting environment variables', () => {
        const script = `
            const val = pm.environment.get('key');
            console.log(val);
        `;
        const context: ExecutionContext = {
            environment: { key: 'value' }
        };

        // Mock console.log to verify output if needed, but vm sandbox has its own console.
        // The implementation redirects console.log to the main console with [Script Log] prefix.
        const consoleSpy = vi.spyOn(console, 'log');

        scriptExecuter.execute(script, context);

        expect(consoleSpy).toHaveBeenCalledWith('[Script Log]', 'value');
        consoleSpy.mockRestore();
    });

    it('should allow setting environment variables', () => {
        const script = `
            pm.environment.set('newKey', 'newValue');
        `;
        const context: ExecutionContext = {
            environment: { key: 'value' }
        };

        const result = scriptExecuter.execute(script, context);

        expect(result.environment).toEqual({
            key: 'value',
            newKey: 'newValue'
        });
    });

    it('should expose response object if available', () => {
        const script = `
            const status = pm.response.code;
            const body = pm.response.json();
            pm.environment.set('status', status);
            pm.environment.set('bodyData', body.data);
        `;
        const context: ExecutionContext = {
            environment: {},
            response: {
                status: 200,
                statusText: 'OK',
                headers: {},
                data: JSON.stringify({ data: 'test' })
            }
        };

        const result = scriptExecuter.execute(script, context);

        expect(result.environment.status).toBe(200);
        expect(result.environment.bodyData).toBe('test');
    });

    it('should handle response.text()', () => {
        const script = `
            const text = pm.response.text();
            pm.environment.set('text', text);
        `;
        const context: ExecutionContext = {
            environment: {},
            response: {
                status: 200,
                statusText: 'OK',
                headers: {},
                data: { key: 'value' } // Object data
            }
        };

        const result = scriptExecuter.execute(script, context);
        expect(result.environment.text).toBe('{"key":"value"}');
    });

    it('should handle script errors gracefully', () => {
        const script = `
            throw new Error('Test Error');
        `;
        const context: ExecutionContext = {
            environment: {}
        };

        expect(() => scriptExecuter.execute(script, context)).toThrow('Script execution failed: Error: Test Error');
    });

    it('should handle response.json() with invalid json string', () => {
        const script = `
            try {
                const val = pm.response.json();
                pm.environment.set('val', String(val));
            } catch (e) {
                pm.environment.set('error', 'caught');
            }
        `;
        const context: ExecutionContext = {
            environment: {},
            response: {
                status: 200,
                data: '{ invalid json }' // String but not JSON
            }
        };
        const result = scriptExecuter.execute(script, context);
        expect(result.environment.val).toBe('null');
        expect(result.environment.error).toBeUndefined();
    });

    it('should handle response.text() with string data', () => {
        const script = `
            const val = pm.response.text();
            pm.environment.set('val', val);
        `;
        const context: ExecutionContext = {
            environment: {},
            response: {
                status: 200,
                data: 'plain text'
            }
        };
        const result = scriptExecuter.execute(script, context);
        expect(result.environment.val).toBe('plain text');
    });

    it('should handle console.warn and console.error', () => {
        const warnSpy = vi.spyOn(console, 'warn');
        const errorSpy = vi.spyOn(console, 'error');

        const script = `
            console.warn('warning');
            console.error('error');
        `;
        scriptExecuter.execute(script, { environment: {} });

        expect(warnSpy).toHaveBeenCalledWith('[Script Warn]', 'warning');
        expect(errorSpy).toHaveBeenCalledWith('[Script Error]', 'error');

        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('should prevent infinite loops with timeout', () => {
        const script = `
            while(true) {}
        `;
        const context: ExecutionContext = {
            environment: {}
        };

        expect(() => scriptExecuter.execute(script, context)).toThrow('Script execution timed out');
    });
});
