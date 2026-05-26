import { describe, it, expect, beforeEach } from 'vitest';
import { ScriptExecuter } from '@/main/services/ScriptExecuter';
import { ExecutionContext } from '@/shared/types';

describe('ScriptExecuter Logic Final', () => {
    let executer: ScriptExecuter;

    beforeEach(() => {
        executer = new ScriptExecuter();
    });

    it('successfully sets environment variables', () => {
        const context: ExecutionContext = { environment: { foo: 'old' } };
        const script = 'pm.environment.set("foo", "bar")';
        const result = executer.execute(script, context);

        expect(result.success).toBe(true);
        expect(result.environment?.foo).toBe('bar');
    });

    it('can access environment variables', () => {
        const context: ExecutionContext = { environment: { foo: 'bar' } };
        const script = 'const v = pm.environment.get("foo"); pm.environment.set("res", v + "!")';
        const result = executer.execute(script, context);

        expect(result.success).toBe(true);
        expect(result.environment?.res).toBe('bar!');
    });

    it('handles response object correctly', () => {
        const context: ExecutionContext = {
            environment: {},
            response: {
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
                data: '{"id": 123}'
            }
        };
        const script = `
            pm.environment.set("status", pm.response.status);
            pm.environment.set("body", pm.response.text());
            const data = pm.response.json();
            pm.environment.set("data_id", String(data.id));
        `;
        const result = executer.execute(script, context);

        expect(result.success).toBe(true);
        expect(result.environment?.status).toBe(200);
        expect(result.environment?.body).toContain('123');
        expect(result.environment?.data_id).toBe('123');
    });

    it('handles JSON parse errors in response helper', () => {
        const context: ExecutionContext = {
            environment: {},
            response: { status: 200, statusText: 'OK', headers: {}, data: 'invalid' }
        };
        const script = 'pm.environment.set("data", pm.response.json())';
        const result = executer.execute(script, context);
        expect(result.environment?.data).toBeNull();
    });

    it('handles non-string response data in helpers', () => {
        const context: ExecutionContext = {
            environment: {},
            response: { status: 200, statusText: 'OK', headers: {}, data: { x: 1 } }
        };
        const script = 'pm.environment.set("data", pm.response.json().x); pm.environment.set("txt", pm.response.text())';
        const result = executer.execute(script, context);
        expect(result.environment?.data).toBe(1);
        expect(result.environment?.txt).toBe('{"x":1}');
    });

    it('catches execution errors', () => {
        const result = executer.execute('throw new Error("fail")', { environment: {} });
        expect(result.success).toBe(false);
        expect(result.error).toContain('fail');
    });
});
