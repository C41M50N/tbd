import { redirect } from '@tanstack/react-router';

import { getSafeRedirect } from './safe-redirect';
import { getSession } from './session';

export async function requireSession(redirectTo: string) {
  const session = await getSession();

  if (!session) {
    throw redirect({
      to: '/login',
      search: { redirect: getSafeRedirect(redirectTo) },
    });
  }

  return session;
}
