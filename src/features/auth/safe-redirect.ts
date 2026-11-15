const FALLBACK_REDIRECT = '/dashboard';
const PLACEHOLDER_ORIGIN = 'https://placeholder.invalid';

// Only same-origin paths are allowed, so a crafted login link cannot send the user to another site.
// Resolving with the URL parser catches tricks like `/\evil.com` that browsers treat as `//evil.com`.
export function getSafeRedirect(redirectTo?: string): string {
  if (!redirectTo) {
    return FALLBACK_REDIRECT;
  }

  try {
    const url = new URL(redirectTo, PLACEHOLDER_ORIGIN);

    if (url.origin !== PLACEHOLDER_ORIGIN) {
      return FALLBACK_REDIRECT;
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return FALLBACK_REDIRECT;
  }
}
