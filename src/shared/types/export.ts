export enum ExportFormat {
    CURL = 'curl',
    FETCH = 'fetch',
    POWERSHELL = 'powershell',
    POSTMAN = 'postman',
    INSOMNIA = 'insomnia',
    OPENAPI = 'openapi'
}

export interface OpenAPIMetadata {
    title: string;
    version: string;
    serverUrl?: string;
    description?: string;
}

export interface ExportResult {
    content: string | object;
    format: ExportFormat;
    filename?: string;
}
