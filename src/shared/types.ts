export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type RequestBodyType = 'json' | 'form-data' | 'url-encoded' | 'raw';

export interface J5RequestBody {
    type: RequestBodyType;
    content: string | Record<string, any>;
}

export interface J5Request {
    id: string; // UUID or derived
    name: string;
    method: RequestMethod;
    url: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body?: J5RequestBody;
    preRequestScript?: string;
    postResponseScript?: string;
}

export interface J5FileEntry {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: J5FileEntry[];
}

export interface J5Collection {
    name: string;
    path: string;
    // Metadata for collection could go here in the future
}

export interface GitStatus {
    changed: string[];
    staged: string[];
    untracked: string[];
    current: string;
}

export interface GitRepo {
    path: string;
    branch: string;
}

export interface J5EnvironmentVariable {
    key: string;
    value: string;
    type: 'default' | 'secret';
    enabled: boolean;
}

export interface J5Environment {
    id: string;
    name: string;
    variables: J5EnvironmentVariable[];
}
