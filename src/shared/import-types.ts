import type { RequestMethod, J5Request } from './types';

// Formatos de importación soportados
export type ImportFormat =
    | 'curl'
    | 'openapi'
    | 'postman'
    | 'insomnia'
    | 'fetch'
    | 'powershell';

// Modelo intermedio para representar un request parseado desde cualquier formato
export type ParsedRequest = {
    name?: string;
    method: RequestMethod;
    url: string;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    body?: {
        type: 'json' | 'form-data' | 'url-encoded' | 'raw';
        content: string | Record<string, any>;
    };
    description?: string;
};

// Resultado de la importación
export type ImportResult = {
    success: boolean;
    requests: J5Request[];
    errors: string[];
    warnings: string[];
};

// Opciones para la importación
export type ImportOptions = {
    format?: ImportFormat; // Si no se especifica, se detecta automáticamente
    targetDirectory?: string; // Directorio donde guardar los archivos generados
    namePrefix?: string; // Prefijo opcional para los nombres de archivo generados
};

// Detección de formato
export type FormatDetectionResult = {
    format: ImportFormat | null;
    confidence: number; // 0-1, qué tan seguro está de la detección
};
