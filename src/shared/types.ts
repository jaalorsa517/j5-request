export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type RequestBodyType = 'json' | 'form-data' | 'url-encoded' | 'raw';

export type J5RequestBody = {
    type: RequestBodyType;
    content: string | Record<string, any>;
};

export type J5Request = {
    id: string; // UUID or derived
    name: string;
    method: RequestMethod;
    url: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body?: J5RequestBody;
    preRequestScript?: string;
    postResponseScript?: string;
};

export type J5FileEntry = {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: J5FileEntry[];
};

export type J5Collection = {
    name: string;
    path: string;
    // Metadata for collection could go here in the future
};

export type GitStatus = {
    changed: string[];
    staged: string[];
    untracked: string[];
    current: string;
};

export type GitRepo = {
    path: string;
    branch: string;
};

export type J5EnvironmentVariable = {
    key: string;
    value: string;
    type: 'default' | 'secret';
    enabled: boolean;
};

export type J5Environment = {
    id: string;
    name: string;
    variables: J5EnvironmentVariable[];
};

export type RequestState = {
    id: string;
    name: string;
    method: RequestMethod;
    url: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body: string;
    bodyFormData: Record<string, string | { type: 'file', path: string }>;
    bodyType: 'json' | 'text' | 'xml' | 'form-data' | 'none';
    preRequestScript: string;
    postResponseScript: string;
};

export type ResponseState = {
    status: number;
    statusText: string;
    headers: Record<string, string | string[]>;
    time: number;
    size: number;
    body: string;
};

export type RequestTab = {
    id: string;
    name: string; // e.g. "GET /users" or "Untitled"
    filePath?: string; // Associated file path on disk
    request: RequestState;
    response: ResponseState | null;
    isDirty: boolean;
    originalState: string; // To track dirty state
};
