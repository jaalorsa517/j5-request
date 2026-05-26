import * as yaml from 'js-yaml';

import type {
    ParsedRequest,
    ImportResult,
    ImportOptions,
    FormatDetectionResult,
} from '@/shared/import-types';
import type { J5Request, RequestMethod } from '@/shared/types';
import { randomUUID } from 'crypto';

/**
 * Servicio para importar requests desde diferentes formatos externos
 */
export class ImportService {
    /**
     * Detecta el formato de un contenido de forma automática
     */
    detectFormat(content: string): FormatDetectionResult {
        const trimmed = content.trim();

        // Detectar cURL (empieza con curl)
        if (trimmed.startsWith('curl ') || trimmed.startsWith('curl\n')) {
            return { format: 'curl', confidence: 0.95 };
        }

        // Detectar JSON (Postman o Insomnia collection)
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);

                // Detectar Postman collection (tiene campo "info" y "item")
                if (parsed.info && parsed.item && parsed.info.schema) {
                    return { format: 'postman', confidence: 0.9 };
                }

                // Detectar Insomnia (tiene campo "resources" o "_type": "export")
                if (parsed.resources || parsed._type === 'export') {
                    return { format: 'insomnia', confidence: 0.9 };
                }

                // Detectar OpenAPI (tiene "openapi" version field)
                if (parsed.openapi && parsed.paths) {
                    return { format: 'openapi', confidence: 0.95 };
                }
            } catch (e) {
                // No es JSON válido
            }
        }

        // Detectar YAML (OpenAPI en YAML)
        if (trimmed.includes('openapi:') || trimmed.includes('swagger:')) {
            return { format: 'openapi', confidence: 0.8 };
        }

        // Detectar JavaScript fetch
        if (trimmed.includes('fetch(') && (trimmed.includes('method:') || trimmed.includes('headers:'))) {
            return { format: 'fetch', confidence: 0.7 };
        }

        // Detectar PowerShell Invoke-WebRequest
        if (trimmed.includes('Invoke-WebRequest') || trimmed.includes('Invoke-RestMethod')) {
            return { format: 'powershell', confidence: 0.8 };
        }

        return { format: null, confidence: 0 };
    }

    /**
     * Parser para comandos cURL
     */
    parseCurl(curlCommand: string): ParsedRequest {
        try {
            // Regex para tokenizar respetando comillas simples y dobles
            const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
            const tokens: string[] = [];
            let match;
            while ((match = regex.exec(curlCommand)) !== null) {
                tokens.push(match[1] ?? match[2] ?? match[0]);
            }

            if (tokens.length > 0 && tokens[0] === 'curl') tokens.shift();

            let method: RequestMethod = 'GET';
            let url = '';
            const headers: Record<string, string> = {};
            let body: ParsedRequest['body'] | undefined;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];

                if (token.startsWith('-')) {
                    if (['--request', '-X'].includes(token)) {
                        if (i + 1 < tokens.length) method = tokens[++i].toUpperCase() as RequestMethod;
                    }
                    else if (['--header', '-H'].includes(token)) {
                        if (i + 1 < tokens.length) {
                            const h = tokens[++i];
                            const colonIndex = h.indexOf(':');
                            if (colonIndex !== -1) {
                                headers[h.substring(0, colonIndex).trim()] = h.substring(colonIndex + 1).trim();
                            }
                        }
                    }
                    else if (['--data', '--data-raw', '-d'].includes(token)) {
                        if (i + 1 < tokens.length) {
                            const d = tokens[++i];
                            try {
                                body = { type: 'json', content: JSON.parse(d) };
                            } catch {
                                body = { type: 'raw', content: d };
                            }
                            if (method === 'GET') method = 'POST';
                        }
                    }
                } else {
                    if (!url && (token.match(/^(https?:\/\/|localhost)/) || token.includes('.'))) {
                        url = token;
                    }
                }
            }

            if (!url) throw new Error("No URL found in cURL command");

            const queryParams: Record<string, string> = {};
            try {
                const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
                url = urlObj.origin + urlObj.pathname;
                urlObj.searchParams.forEach((value, key) => {
                    queryParams[key] = value;
                });
            } catch {
                // Invalid URL, keep raw
            }

            return {
                method,
                url,
                headers,
                queryParams,
                body,
            };
        } catch (error) {
            throw new Error(`Failed to parse cURL command: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parser para especificaciones OpenAPI
     */
    parseOpenAPI(spec: object | string): ParsedRequest[] {
        try {
            let parsedSpec: any;

            if (typeof spec === 'string') {
                try {
                    parsedSpec = JSON.parse(spec);
                } catch {
                    try {
                        parsedSpec = yaml.load(spec);
                    } catch (e) {
                        throw new Error("Invalid OpenAPI format: Must be valid JSON or YAML");
                    }
                }
            } else {
                parsedSpec = spec;
            }

            if (!parsedSpec || typeof parsedSpec !== 'object') {
                throw new Error("Invalid OpenAPI spec: Content is not a valid object");
            }

            const requests: ParsedRequest[] = [];
            const paths = parsedSpec.paths || {};
            const servers = parsedSpec.servers || [];
            const baseUrl = servers[0]?.url || 'http://localhost';

            for (const [path, pathItem] of Object.entries(paths)) {
                const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];

                for (const method of methods) {
                    const operation = (pathItem as any)[method];
                    if (!operation) continue;

                    const headers: Record<string, string> = {};
                    const queryParams: Record<string, string> = {};
                    let body: ParsedRequest['body'] | undefined;

                    // Extraer parámetros
                    if (operation.parameters) {
                        for (const param of operation.parameters) {
                            if (param.in === 'header') {
                                headers[param.name] = param.example || param.default || '';
                            } else if (param.in === 'query') {
                                queryParams[param.name] = param.example || param.default || '';
                            }
                        }
                    }

                    // Extraer body (requestBody)
                    if (operation.requestBody) {
                        const content = operation.requestBody.content;
                        if (content['application/json']) {
                            const schema = content['application/json'].schema;
                            const example = content['application/json'].example || schema?.example || {};
                            body = { type: 'json', content: example };
                        }
                    }

                    requests.push({
                        name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
                        method: method.toUpperCase() as RequestMethod,
                        url: `${baseUrl}${path}`,
                        headers,
                        queryParams,
                        body,
                        description: operation.description,
                    });
                }
            }

            return requests;
        } catch (error) {
            throw new Error(`Failed to parse OpenAPI spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parser para colecciones de Postman
     */
    parsePostman(collection: object | string): ParsedRequest[] {
        try {
            const parsed = typeof collection === 'string' ? JSON.parse(collection) : collection;
            if (!parsed || typeof parsed !== 'object') {
                throw new Error("Invalid Postman collection: Content is not a valid object");
            }

            const requests: ParsedRequest[] = [];

            const parseItem = (item: any) => {
                if (item.request) {
                    const req = item.request;
                    const url = typeof req.url === 'string' ? req.url : (req.url?.raw || '');

                    const headers: Record<string, string> = {};
                    if (req.header) {
                        if (Array.isArray(req.header)) {
                            for (const h of req.header) {
                                if (!h.disabled) {
                                    headers[h.key] = h.value;
                                }
                            }
                        } else if (typeof req.header === 'object') {
                            for (const [key, value] of Object.entries(req.header)) {
                                headers[key] = String(value);
                            }
                        }
                    }

                    const queryParams: Record<string, string> = {};
                    if (req.url?.query) {
                        for (const q of req.url.query) {
                            if (!q.disabled) {
                                queryParams[q.key] = q.value;
                            }
                        }
                    }

                    let body: ParsedRequest['body'] | undefined;
                    if (req.body) {
                        if (req.body.mode === 'raw') {
                            try {
                                const parsedBody = JSON.parse(req.body.raw);
                                body = { type: 'json', content: parsedBody };
                            } catch {
                                body = { type: 'raw', content: req.body.raw };
                            }
                        } else if (req.body.mode === 'formdata') {
                            const formData: Record<string, string> = {};
                            for (const field of req.body.formdata || []) {
                                if (!field.disabled) {
                                    formData[field.key] = field.value;
                                }
                            }
                            body = { type: 'form-data', content: formData };
                        }
                    }

                    requests.push({
                        name: item.name,
                        method: req.method as RequestMethod,
                        url,
                        headers,
                        queryParams,
                        body,
                    });
                }

                // Recursivamente procesar sub-items
                if (item.item) {
                    for (const subItem of item.item) {
                        parseItem(subItem);
                    }
                }
            };

            // Procesar todos los items
            if (parsed.item) {
                for (const item of parsed.item) {
                    parseItem(item);
                }
            }

            return requests;
        } catch (error) {
            throw new Error(`Failed to parse Postman collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parser para colecciones de Insomnia
     */
    parseInsomnia(collection: object | string): ParsedRequest[] {
        try {
            const parsed = typeof collection === 'string' ? JSON.parse(collection) : collection;
            if (!parsed || typeof parsed !== 'object') {
                throw new Error("Invalid Insomnia collection: Content is not a valid object");
            }

            const requests: ParsedRequest[] = [];

            // Insomnia export tiene un array de "resources"
            const resources = parsed.resources || [];

            for (const resource of resources) {
                // Solo procesar recursos de tipo "request"
                if (resource._type !== 'request') continue;

                const url = resource.url || '';
                const headers: Record<string, string> = {};

                // Parsear headers
                if (resource.headers && Array.isArray(resource.headers)) {
                    for (const header of resource.headers) {
                        if (!header.disabled && header.name) {
                            headers[header.name] = header.value || '';
                        }
                    }
                }

                // Extraer query params de la URL
                const queryParams: Record<string, string> = {};
                if (resource.parameters && Array.isArray(resource.parameters)) {
                    for (const param of resource.parameters) {
                        if (!param.disabled && param.name) {
                            queryParams[param.name] = param.value || '';
                        }
                    }
                }

                // Parsear body
                let body: ParsedRequest['body'] | undefined;
                if (resource.body) {
                    if (resource.body.mimeType === 'application/json' && resource.body.text) {
                        try {
                            const parsedBody = JSON.parse(resource.body.text);
                            body = { type: 'json', content: parsedBody };
                        } catch {
                            body = { type: 'raw', content: resource.body.text };
                        }
                    } else if (resource.body.text) {
                        body = { type: 'raw', content: resource.body.text };
                    }
                }

                requests.push({
                    name: resource.name || `${resource.method} ${url}`,
                    method: resource.method as RequestMethod,
                    url,
                    headers,
                    queryParams,
                    body,
                    description: resource.description,
                });
            }

            return requests;
        } catch (error) {
            throw new Error(`Failed to parse Insomnia collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parser para código JavaScript fetch
     */
    parseFetch(code: string): ParsedRequest {
        try {
            // Extraer URL
            const urlMatch = code.match(/fetch\s*\(\s*['"`]([^'"`]+)['"`]/);
            const url = urlMatch ? urlMatch[1] : '';

            // Extraer método (default GET)
            const methodMatch = code.match(/method\s*:\s*['"`](\w+)['"`]/i);
            const method = (methodMatch ? methodMatch[1].toUpperCase() : 'GET') as RequestMethod;

            // Extraer headers
            const headers: Record<string, string> = {};
            const headersBlockMatch = code.match(/headers\s*:\s*\{([^}]+)\}/s);
            if (headersBlockMatch) {
                const headersStr = headersBlockMatch[1];
                const headerMatches = headersStr.matchAll(/['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`]/g);
                for (const match of headerMatches) {
                    headers[match[1]] = match[2];
                }
            }

            // Extraer body
            let body: ParsedRequest['body'] | undefined;
            // Buscar JSON.stringify o objeto directo
            const bodyMatch = code.match(/body\s*:\s*(?:JSON\.stringify\s*\(\s*)?((?:\{[\s\S]*?\}|\[[\s\S]*?\]))/);

            if (bodyMatch) {
                try {
                    const bodyContent = bodyMatch[1];
                    // Intentar parsear como JSON
                    const parsedBody = JSON.parse(bodyContent);
                    body = { type: 'json', content: parsedBody };
                } catch {
                    // Si no es JSON válido, guardar como raw
                    body = { type: 'raw', content: bodyMatch[1] };
                }
            }

            // Query params desde URL
            const queryParams: Record<string, string> = {};
            try {
                const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
                urlObj.searchParams.forEach((value, key) => {
                    queryParams[key] = value;
                });
            } catch {
                // URL inválida, continuar sin query params
            }

            return {
                method,
                url: url.split('?')[0], // URL sin query params
                headers,
                queryParams,
                body,
            };
        } catch (error) {
            throw new Error(`Failed to parse fetch code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parser para código PowerShell
     */
    parsePowerShell(code: string): ParsedRequest {
        try {
            // Extraer URL (-Uri)
            const uriMatch = code.match(/-Uri\s+['"`]?([^'"`\s]+)['"`]?/i);
            const url = uriMatch ? uriMatch[1] : '';

            // Extraer método (-Method)
            const methodMatch = code.match(/-Method\s+['"`]?(\w+)['"`]?/i);
            const method = (methodMatch ? methodMatch[1].toUpperCase() : 'GET') as RequestMethod;

            // Extraer headers (-Headers)
            const headers: Record<string, string> = {};
            const headersMatch = code.match(/-Headers\s+@\{([^}]+)\}/s);
            if (headersMatch) {
                const headersStr = headersMatch[1];
                const headerPairs = headersStr.matchAll(/['"`]([^'"`]+)['"`]\s*=\s*['"`]([^'"`]+)['"`]/g);
                for (const match of headerPairs) {
                    headers[match[1]] = match[2];
                }
            }

            // Extraer body (-Body)
            let body: ParsedRequest['body'] | undefined;
            // Soporta comillas simples o dobles como delimitadores
            const bodyMatch = code.match(/-Body\s+(['"])(.+?)\1/i);
            if (bodyMatch) {
                const bodyContent = bodyMatch[2];
                // Intentar parsear como JSON
                try {
                    const parsedBody = JSON.parse(bodyContent);
                    body = { type: 'json', content: parsedBody };
                } catch {
                    body = { type: 'raw', content: bodyContent };
                }
            }

            // Query params desde URL
            const queryParams: Record<string, string> = {};
            try {
                const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
                urlObj.searchParams.forEach((value, key) => {
                    queryParams[key] = value;
                });
            } catch {
                // URL inválida
            }

            return {
                method,
                url: url.split('?')[0],
                headers,
                queryParams,
                body,
            };
        } catch (error) {
            throw new Error(`Failed to parse PowerShell code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Convierte un ParsedRequest al formato J5Request
     */
    convertToJ5Request(parsed: ParsedRequest): J5Request {
        return {
            id: randomUUID(),
            name: parsed.name || `${parsed.method} ${parsed.url}`,
            method: parsed.method,
            url: parsed.url,
            headers: parsed.headers,
            params: parsed.queryParams,
            body: parsed.body ? {
                type: parsed.body.type === 'raw' ? 'raw' : parsed.body.type,
                content: parsed.body.content,
            } : undefined,
            preRequestScript: '',
            postResponseScript: '',
        };
    }

    /**
     * Importa desde contenido (clipboard o archivo)
     */
    async importFromContent(
        content: string,
        options: ImportOptions = {}
    ): Promise<ImportResult> {
        const errors: string[] = [];
        const warnings: string[] = [];
        const requests: J5Request[] = [];

        try {
            // Detectar formato si no se especificó
            let format = options.format;
            if (!format) {
                const detection = this.detectFormat(content);
                if (!detection.format) {
                    throw new Error('Could not detect format automatically. Please specify format manually.');
                }
                format = detection.format;
                if (detection.confidence < 0.8) {
                    warnings.push(`Format detection confidence is low (${(detection.confidence * 100).toFixed(0)}%). Results may be incorrect.`);
                }
            }

            // Parsear según el formato
            let parsed: ParsedRequest[] = [];
            switch (format) {
                case 'curl':
                    parsed = [this.parseCurl(content)];
                    break;
                case 'openapi':
                    parsed = this.parseOpenAPI(content);
                    break;
                case 'postman':
                    parsed = this.parsePostman(content);
                    break;
                case 'insomnia':
                    parsed = this.parseInsomnia(content);
                    break;
                case 'fetch':
                    parsed = [this.parseFetch(content)];
                    break;
                case 'powershell':
                    parsed = [this.parsePowerShell(content)];
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // Convertir a J5Request
            for (const p of parsed) {
                try {
                    requests.push(this.convertToJ5Request(p));
                } catch (error) {
                    errors.push(`Failed to convert request "${p.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            return {
                success: errors.length === 0,
                requests,
                errors,
                warnings,
            };
        } catch (error) {
            errors.push(error instanceof Error ? error.message : 'Unknown error');
            return {
                success: false,
                requests,
                errors,
                warnings,
            };
        }
    }
}

// Singleton export
export const importService = new ImportService();
