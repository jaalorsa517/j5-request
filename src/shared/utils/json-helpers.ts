/**
 * Sorts object keys recursively to ensure deterministic JSON output.
 * This is crucial for RNF-01 (Human-Readable Git diffs).
 */
function sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }

    return Object.keys(obj)
        .sort()
        .reduce((result: Record<string, any>, key) => {
            result[key] = sortObjectKeys(obj[key]);
            return result;
        }, {});
}

/**
 * Serializes a J5 request (or any object) to a formatted, key-sorted JSON string.
 */
export function serializeJson(data: any): string {
    const sortedData = sortObjectKeys(data);
    return JSON.stringify(sortedData, null, 2) + '\n';
}

/**
 * Parses a JSON string safely.
 */
export function parseJson<T>(content: string): T {
    try {
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to parse JSON: ${error}`);
    }
}
