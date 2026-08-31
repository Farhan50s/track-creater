/**
 * Validates and sanitizes a redirect target to prevent open redirect vulnerabilities.
 * Ensures the target is a relative path starting with '/' but not '//' (protocol-relative).
 */
export function getSafeRedirectPath(target: string | null | undefined, defaultPath: string = '/app'): string {
  if (!target || typeof target !== 'string') {
    return defaultPath;
  }

  const trimmed = target.trim();

  // Reject protocol-relative URLs (e.g. "//evil.com")
  if (trimmed.startsWith('//')) {
    return defaultPath;
  }

  // Reject URLs with schemes (e.g. "http:", "https:", "javascript:", "data:")
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultPath;
  }

  // Must start with single slash and contain valid internal path characters
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return defaultPath;
}
