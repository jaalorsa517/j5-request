import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScriptExecuter, ExecutionContext } from './ScriptExecuter';

describe('ScriptExecuter', () => {
    let scriptExecuter: ScriptExecuter;

    beforeEach(() => {
        scriptExecuter = new ScriptExecuter();
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
