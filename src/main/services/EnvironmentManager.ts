import fs from 'fs/promises';
import { J5Environment, J5EnvironmentVariable } from '../../shared/types';
import { parseJson, serializeJson } from '../../shared/utils/json-helpers';

export class EnvironmentManager {

    /**
     * Resolves variables in a string template using the provided environment map.
     * Supports nested variables (e.g. {{a}} calls {{b}}).
     */
    resolveVariables(template: string, variables: Record<string, string>): string {
        if (!template) return template;

        let result = template;
        let changed = true;
        let iterations = 0;
        const maxIterations = 10; // Prevent infinite loops

        while (changed && iterations < maxIterations) {
            changed = false;
            result = result.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, varName) => {
                if (Object.prototype.hasOwnProperty.call(variables, varName)) {
                    changed = true;
                    return variables[varName];
                }
                return match; // Keep unresolved variables as is
            });
            iterations++;
        }

        return result;
    }

    /**
     * Flattens an environment into a key-value pair map, considering only enabled variables.
     */
    flattenEnvironment(env: J5Environment): Record<string, string> {
        const result: Record<string, string> = {};
        env.variables.forEach(v => {
            if (v.enabled) {
                result[v.key] = v.value;
            }
        });
        return result;
    }

    async loadEnvironment(filePath: string): Promise<J5Environment> {
        const content = await fs.readFile(filePath, 'utf-8');
        return parseJson<J5Environment>(content);
    }

    async saveEnvironment(filePath: string, env: J5Environment): Promise<void> {
        // TODO: Handle secrets separation (RF-10) in future.
        const content = serializeJson(env);
        await fs.writeFile(filePath, content, 'utf-8');
    }
}
