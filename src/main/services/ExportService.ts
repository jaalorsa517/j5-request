import { J5Request } from '../../shared/types';
import { OpenAPIMetadata } from '../../shared/types/export';
import { clipboard } from 'electron';
import fs from 'fs/promises';
import { OpenAPIV3 } from 'openapi-types';

export class ExportService {

    constructor() { }

    /**
     * Generates a cURL command from a J5Request
     */
    public generateCurl(request: J5Request): string {
        // Warn if request has scripts
        if (this.hasScripts(request)) {
            console.warn(this.getScriptWarning('cURL'));
        }

        let command = `curl -X ${request.method} '${request.url}'`;

        // Headers
        if (request.headers) {
            Object.entries(request.headers).forEach(([key, value]) => {
                const headerValue = String(value);
                if (headerValue.trim() !== '') {
                    command += ` -H '${key}: ${this.escapeShell(headerValue)}'`;
                }
            });
        }

        // Body
        if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
            if (request.body.type === 'json') {
                if (!this.hasHeader(request.headers, 'Content-Type')) {
                    command += ` -H 'Content-Type: application/json'`;
                }
                const content = typeof request.body.content === 'string'
                    ? request.body.content
                    : JSON.stringify(request.body.content);
                if (content) {
                    command += ` -d '${this.escapeShell(content)}'`;
                }
            } else if (request.body.type === 'raw') {
                // Try to guess content type if not provided, or default to text/plain? 
                // cURL doesn't enforce, but nice to have.
                const content = request.body.content as string;
                if (content) {
                    command += ` -d '${this.escapeShell(content)}'`;
                }
            } else if (request.body.type === 'form-data') {
                if (request.body.content && typeof request.body.content === 'object') {
                    Object.entries(request.body.content).forEach(([key, val]) => {
                        // TODO: Handle file paths carefully
                        if (typeof val === 'string') {
                            command += ` -F '${key}=${this.escapeShell(val)}'`;
                        } else if (typeof val === 'object' && val !== null && 'path' in val) {
                            // Assuming J5FormDataValue structure might change, but typically file upload in curl is @path
                            const fileVal = val as any;
                            command += ` -F '${key}=@${this.escapeShell(fileVal.path)}'`;
                        }
                    });
                }
            }
        }

        // Validation: Ensure no unescaped single quotes remain
        this.validateCurlCommand(command);

        return command;
    }

    /**
     * Validates that a cURL command has proper shell escaping
     */
    private validateCurlCommand(command: string): void {
        // Check for potentially dangerous patterns
        // After proper escaping, we should not have unescaped single quotes in problematic positions
        // This is a basic check - the escapeShell method should handle most cases

        // Count single quotes - should be even (pairs)
        const singleQuoteCount = (command.match(/'/g) || []).length;
        if (singleQuoteCount % 2 !== 0) {
            console.warn('cURL command may have unbalanced quotes:', command);
        }
    }

    /**
     * Helper to escape single quotes for shell
     */
    private escapeShell(str: string): string {
        // En bash, ' se escapa cerrando comillas, poniendo \', y abriendo de nuevo: ' -> '\''
        return str.replace(/'/g, "'\\''");
    }

    private hasHeader(headers: Record<string, string | number | boolean | undefined> | undefined, key: string): boolean {
        if (!headers) return false;
        return Object.keys(headers).some(k => k.toLowerCase() === key.toLowerCase());
    }

    /**
     * Checks if a request has pre/post-request scripts
     */
    private hasScripts(request: J5Request): boolean {
        return !!(request.preRequestScript || request.postResponseScript);
    }

    /**
     * Generates a warning message for requests with scripts
     */
    private getScriptWarning(format: string): string {
        return `⚠️  Note: Pre/post-request scripts are not supported in ${format} format and will not be included in the export.`;
    }

    // Placeholders for other methods functionality
    public generateFetch(request: J5Request): string {
        // Warn if request has scripts
        if (this.hasScripts(request)) {
            console.warn(this.getScriptWarning('Fetch'));
        }

        const options: any = {
            method: request.method,
            headers: request.headers || {},
        };

        if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
            if (request.body.type === 'json') {
                if (request.body.content) {
                    options.body = typeof request.body.content === 'string'
                        ? request.body.content
                        : JSON.stringify(request.body.content);

                    if (!this.hasHeader(options.headers, 'Content-Type')) {
                        options.headers['Content-Type'] = 'application/json';
                    }
                }
            } else if (request.body.type === 'raw') {
                if (request.body.content) {
                    options.body = String(request.body.content);
                }
            } else if (request.body.type === 'form-data') {
                // Fetch uses FormData object, but for code generation we might need to simulate it construction
                // This is tricky to generate as pure JS without context of browser vs node
                // Let's generate browser-compatible code
                /* 
                   const formData = new FormData();
                   formData.append('key', 'value');
                   ...
                   options.body = formData;
                */
                // Return complex string
                let code = `const url = '${request.url}';\n`;

                if (request.body.content && typeof request.body.content === 'object' && Object.keys(request.body.content).length > 0) {
                    code += `const formData = new FormData();\n`;
                    Object.entries(request.body.content).forEach(([key, val]) => {
                        if (typeof val === 'string') {
                            code += `formData.append('${key}', '${val}');\n`;
                        } else {
                            // File placeholder
                            code += `// formData.append('${key}', fileInput.files[0], '${(val as any).path}'); // File upload\n`;
                        }
                    });
                    options.body = 'FORM_DATA_PLACEHOLDER';
                }

                // If headers has Content-Type, remove it because browser sets it with boundary
                // But wait, user might have set it manually. 
                // Usually manual Content-Type breaks form-data fetch. 
                // Let's filter it out if present?
                // For now, simple serialization of options
                const optionsStr = JSON.stringify(options, null, 2).replace('"FORM_DATA_PLACEHOLDER"', 'formData');
                return code + `\nfetch(url, ${optionsStr});`;
            }
        }

        const optionsStr = JSON.stringify(options, null, 2);
        return `fetch('${request.url}', ${optionsStr});`;
    }

    public generatePowerShell(request: J5Request): string {
        // Warn if request has scripts
        if (this.hasScripts(request)) {
            console.warn(this.getScriptWarning('PowerShell'));
        }

        let command = `Invoke-WebRequest -Uri "${request.url}" -Method ${request.method}`;

        // Headers
        if (request.headers && Object.keys(request.headers).length > 0) {
            const headersList: string[] = [];
            Object.entries(request.headers).forEach(([key, value]) => {
                headersList.push(`'${key}' = '${String(value)}'`);
            });
            command += ` -Headers @{ ${headersList.join('; ')} }`;
        }

        // Body
        if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
            if (request.body.type === 'json' && request.body.content) {
                const content = typeof request.body.content === 'string'
                    ? request.body.content
                    : JSON.stringify(request.body.content);
                // PowerShell escaping for double quotes inside strings is ... tricky.
                // Simple approach: replace " with `"
                const escapedContent = content.replace(/"/g, '`"');
                command += ` -Body "${escapedContent}"`;
                // ContentType parameter is often cleaner than header for json
                // But header works too.
                if (!this.hasHeader(request.headers, 'Content-Type')) {
                    command += ` -ContentType "application/json"`;
                }
            } else if (request.body.type === 'raw') {
                const content = String(request.body.content || '').replace(/"/g, '`"');
                command += ` -Body "${content}"`;
            }
            // Form data in PowerShell is complex (-Form), skipping for MVP/Task definition implied simple generation
        }

        return command;
    }
    public generatePostmanCollection(requests: J5Request[]): object {
        const collection = {
            info: {
                name: 'Exported from J5 Request',
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            },
            item: requests.map(req => {
                const item: any = {
                    name: req.name,
                    request: {
                        method: req.method,
                        header: this.queryHeadersToPostman(req.headers),
                        url: {
                            raw: req.url,
                            // Postman URL parsing omitted for brevity, raw usually works
                            protocol: req.url.split('://')[0],
                            host: req.url.split('://')[1]?.split('/')[0].split('.'),
                            path: req.url.split('://')[1]?.split('/').slice(1)
                        }
                    }
                };

                if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
                    if (req.body.type === 'json' && req.body.content) {
                        item.request.body = {
                            mode: 'raw',
                            raw: typeof req.body.content === 'string'
                                ? req.body.content
                                : JSON.stringify(req.body.content, null, 2),
                            options: {
                                raw: {
                                    language: 'json'
                                }
                            }
                        };
                    } else if (req.body.type === 'raw' && req.body.content) {
                        item.request.body = {
                            mode: 'raw',
                            raw: String(req.body.content)
                        };
                    } else if (req.body.type === 'form-data' && req.body.content) {
                        item.request.body = {
                            mode: 'formdata',
                            formdata: Object.entries(req.body.content).map(([key, val]) => {
                                if (typeof val === 'string') {
                                    return { key, value: val, type: 'text' };
                                } else {
                                    return { key, src: (val as any).path, type: 'file' };
                                }
                            })
                        };
                    }
                }

                return item;
            })
        };

        // Validation: Ensure JSON is valid by serializing and parsing
        this.validateJSON(collection, 'Postman Collection');

        return collection;
    }

    private queryHeadersToPostman(headers?: Record<string, string | number | boolean>): any[] {
        if (!headers) return [];
        return Object.entries(headers).map(([key, value]) => ({
            key,
            value: String(value),
            type: 'text'
        }));
    }

    public generateInsomniaCollection(requests: J5Request[]): object {
        // Insomnia export format v4 (simplified)
        const resources = requests.map(req => {
            const bodyCtx: any = {};

            if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
                if (req.body.type === 'json' && req.body.content) {
                    bodyCtx.mimeType = 'application/json';
                    bodyCtx.text = typeof req.body.content === 'string'
                        ? req.body.content
                        : JSON.stringify(req.body.content, null, 2);
                } else if (req.body.type === 'raw' && req.body.content) {
                    bodyCtx.mimeType = 'text/plain';
                    bodyCtx.text = String(req.body.content);
                } else if (req.body.type === 'form-data' && req.body.content) {
                    bodyCtx.mimeType = 'multipart/form-data';
                    bodyCtx.params = Object.entries(req.body.content).map(([key, val]) => {
                        if (typeof val === 'string') {
                            return { name: key, value: val };
                        } else {
                            return { name: key, fileName: (val as any).path, type: 'file' };
                        }
                    });
                }
            }

            const headers = req.headers ? Object.entries(req.headers).map(([name, value]) => ({
                name,
                value: String(value)
            })) : [];

            return {
                _id: 'req_' + Math.random().toString(36).substr(2, 9),
                _type: 'request',
                parentId: 'wrk_1', // Placeholder workspace ID
                name: req.name,
                method: req.method,
                url: req.url,
                body: bodyCtx,
                parameters: [],
                headers: headers,
                authentication: {},
                metaSortKey: -1600000000000,
                isPrivate: false,
                settingStoreCookies: true,
                settingSendCookies: true,
                settingDisableRenderRequestBody: false,
                settingEncodeUrl: true,
                settingRebuildPath: true,
                settingFollowRedirects: 'global'
            };
        });

        const workspace = {
            _id: 'wrk_1',
            _type: 'workspace',
            parentId: null,
            name: 'J5 Request Export',
            description: 'Exported from J5 Request',
            scope: 'collection'
        };

        const collection = {
            _type: 'export',
            __export_format: 4,
            __export_date: new Date().toISOString(),
            __export_source: 'j5-request:v1.0.0',
            resources: [workspace, ...resources]
        };

        // Validation: Ensure JSON is valid
        this.validateJSON(collection, 'Insomnia Collection');

        return collection;
    }

    public generateOpenAPI(requests: J5Request[], metadata: OpenAPIMetadata): object {
        const paths: OpenAPIV3.PathsObject = {};
        const hasAnyScripts = requests.some(req => this.hasScripts(req));

        requests.forEach(req => {
            try {
                // Parse URL to get path
                // This is simplistic, assumes valid full URL
                const urlObj = new URL(req.url);
                const path = urlObj.pathname;

                if (!paths[path]) {
                    paths[path] = {};
                }

                const operation: OpenAPIV3.OperationObject = {
                    summary: req.name,
                    responses: {
                        '200': {
                            description: 'Success'
                        }
                    }
                };

                // Add note if this request has scripts
                if (this.hasScripts(req)) {
                    operation.description = '⚠️  Note: This request originally had pre/post-request scripts that are not included in this OpenAPI export.';
                }

                // Headers/Params could be inferred here but simplified for now

                // Request Body
                if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
                    if (req.body.type === 'json') {
                        operation.requestBody = {
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        example: req.body.content
                                    }
                                }
                            }
                        };
                    }
                    // Add other types if needed
                }

                const method = req.method.toLowerCase() as OpenAPIV3.HttpMethods;
                (paths[path] as any)[method] = operation;

            } catch (e) {
                console.warn('Skipping invalid URL for OpenAPI export:', req.url);
            }
        });

        // Build description with script warning if needed
        let description = metadata.description || '';
        if (hasAnyScripts) {
            description += (description ? '\n\n' : '') + '⚠️  Note: Some requests in this specification originally had pre/post-request scripts that are not included in this export.';
        }

        const spec: OpenAPIV3.Document = {
            openapi: '3.0.0',
            info: {
                title: metadata.title,
                version: metadata.version,
                description: description
            },
            servers: metadata.serverUrl ? [{ url: metadata.serverUrl }] : [],
            paths: paths
        };

        // Validation: Ensure OpenAPI spec is valid
        this.validateOpenAPI(spec);

        return spec;
    }

    public async exportToClipboard(content: string): Promise<void> {
        clipboard.writeText(content);
    }

    public async exportToFile(content: string, filePath: string): Promise<void> {
        await fs.writeFile(filePath, content, 'utf-8');
    }

    /**
     * Validates JSON by attempting to serialize and parse it
     */
    private validateJSON(obj: object, context: string): void {
        try {
            const serialized = JSON.stringify(obj);
            JSON.parse(serialized);
        } catch (e: any) {
            console.error(`Invalid JSON in ${context}:`, e.message);
            throw new Error(`Generated ${context} contains invalid JSON: ${e.message}`);
        }
    }

    /**
     * Validates OpenAPI spec structure
     */
    private validateOpenAPI(spec: object): void {
        // Basic validation - ensure required fields exist
        const apiSpec = spec as any;

        if (!apiSpec.openapi) {
            throw new Error('OpenAPI spec missing "openapi" version field');
        }

        if (!apiSpec.info || !apiSpec.info.title || !apiSpec.info.version) {
            throw new Error('OpenAPI spec missing required "info" fields (title, version)');
        }

        if (!apiSpec.paths || typeof apiSpec.paths !== 'object') {
            throw new Error('OpenAPI spec missing or invalid "paths" object');
        }

        // Validate JSON structure
        this.validateJSON(spec, 'OpenAPI Specification');
    }
}
