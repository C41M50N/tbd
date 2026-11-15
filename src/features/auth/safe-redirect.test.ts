import { describe, expect, it } from 'vitest';

import { getSafeRedirect } from '@/features/auth/safe-redirect';

describe('getSafeRedirect', () => {
  it('keeps same-origin paths with their query and hash', () => {
    expect(getSafeRedirect('/notes/42?tab=edit#title')).toBe('/notes/42?tab=edit#title');
  });

  it('falls back when no redirect is given', () => {
    expect(getSafeRedirect(undefined)).toBe('/dashboard');
    expect(getSafeRedirect('')).toBe('/dashboard');
  });

  it.each([
    ['absolute URL', 'https://evil.com/phish'],
    ['protocol-relative URL', '//evil.com'],
    ['backslash', '/\\evil.com'],
    ['backslash then slash', '/\\/evil.com'],
    ['tab inside the slashes', '/\t/evil.com'],
    ['newline inside the slashes', '/\n/evil.com'],
    ['javascript: URL', 'javascript:alert(1)'],
  ])('rejects off-site targets (%s)', (_, redirectTo) => {
    expect(getSafeRedirect(redirectTo)).toBe('/dashboard');
  });
});
