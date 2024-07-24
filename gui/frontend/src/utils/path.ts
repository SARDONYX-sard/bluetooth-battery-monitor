/**
 * Return parent path from argument path.
 * @param path
 * @returns
 */
export function getParent(path: string): string {
  if (path.endsWith('/') || path.endsWith('\\')) {
    return path;
  }
  // Deletes tailing part until / if path does not end with / or \
  return path.replace(/[/\\][^/\\]*$/, '');
}
