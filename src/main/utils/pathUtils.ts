import path from 'path';

export function resolveRelativePath(relativePath: string, projectRoot: string): string {
    if (path.isAbsolute(relativePath)) {
        return relativePath;
    }
    return path.join(projectRoot, relativePath);
}

export function makeRelativePath(absolutePath: string, projectRoot: string): string {
    return path.relative(projectRoot, absolutePath);
}
