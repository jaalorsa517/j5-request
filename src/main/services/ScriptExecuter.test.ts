import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScriptExecuter, ExecutionContext } from './ScriptExecuter';

describe('ScriptExecuter', () => {
    let service: ScriptExecuter;

    beforeEach(() => {
        service = new ScriptExecuter();
    });

    it('should execute a simple script modifying environment', () => {
        const context: ExecutionContext = {
            environment: { old: 'value' }
        };
        const script = `
            pm.environment.set('newKey', 'newValue');
            const old = pm.environment.get('old');
            if (old === 'value') {
                pm.environment.set('check', 'passed');
            }
        `;

        const result = service.execute(script, context);

        expect(result.environment).toHaveProperty('newKey', 'newValue');
        expect(result.environment).toHaveProperty('check', 'passed');
        expect(result.environment).toHaveProperty('old', 'value');
    });

    it('should access response data in post-request script', () => {
        const context: ExecutionContext = {
            environment: {},
            response: {
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
                data: { success: true }
            }
        };
        const script = `
            if (pm.response.code === 200) {
                pm.environment.set('status', 'ok');
            }
            const body = pm.response.json();
            if (body.success) {
                pm.environment.set('bodySuccess', 'true');
            }
        `;

        const result = service.execute(script, context);

        expect(result.environment).toHaveProperty('status', 'ok');
        expect(result.environment).toHaveProperty('bodySuccess', 'true');
    });

    it('should handle script errors gracefully', () => {
        const context: ExecutionContext = { environment: {} };
        const script = `throw new Error('Boom');`;

        expect(() => service.execute(script, context)).toThrow('Script execution failed');
    });

    it('should timeout for long running scripts', () => {
        const context: ExecutionContext = { environment: {} };
        const script = `while(true) {}`;

        expect(() => service.execute(script, context)).toThrow();
    });

    it('should handle helper methods text() and json() correctly', () => {
        const context: ExecutionContext = {
            environment: {},
            response: {
                status: 200,
                data: '{"key": "value"}'
            }
        };
        const script = `
            const json = pm.response.json();
            pm.environment.set('jsonKey', json.key);
            
            const text = pm.response.text();
             pm.environment.set('textLen', text.length.toString());
        `;

        const result = service.execute(script, context);
        expect(result.environment.jsonKey).toBe('value');
        expect(result.environment.textLen).toBe('16'); // length of string
    });

    it('should prefix console logs from scripts', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const script = `
            console.log('test log');
            console.error('test error');
        `;
        service.execute(script, { environment: {} });

        expect(consoleSpy).toHaveBeenCalledWith('[Script Log]', 'test log');
        expect(errorSpy).toHaveBeenCalledWith('[Script Error]', 'test error');

        consoleSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('should ignore empty script gracefully', () => {
        const context: ExecutionContext = { environment: { key: 'val' } };
        const result = service.execute('', context);
        expect(result).toBe(context); // Should return same object if optimized, or similar
        expect(result.environment).toHaveProperty('key', 'val');
    });
});
