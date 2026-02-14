import { describe, it, expect } from 'vitest';
import { serializeJson, parseJson } from './json-helpers';

describe('json-helpers', () => {
    describe('serializeJson', () => {
        it('should sort keys recursively and add newline', () => {
            const data = {
                b: 2,
                a: {
                    d: 4,
                    c: 3
                }
            };
            const result = serializeJson(data);
            const expected = JSON.stringify({
                a: {
                    c: 3,
                    d: 4
                },
                b: 2
            }, null, 2) + '\n';
            
            expect(result).toBe(expected);
            // Check key order in string
            const lines = result.split('\n');
            expect(lines[1]).toContain('"a"');
            expect(lines[5]).toContain('"b"');
        });

        it('should handle arrays and null', () => {
            const data = {
                z: [3, 1, 2],
                y: null,
                x: 10
            };
            const result = serializeJson(data);
            expect(result).toContain('"z": [\n    3,\n    1,\n    2\n  ]');
            expect(result).toContain('"y": null');
        });
    });

    describe('parseJson', () => {
        it('should parse valid JSON', () => {
            const json = '{"a": 1}';
            expect(parseJson(json)).toEqual({ a: 1 });
        });

        it('should throw error on invalid JSON', () => {
            const json = '{invalid}';
            expect(() => parseJson(json)).toThrow('Failed to parse JSON');
        });
    });
});
