import { createFileRoute } from '@tanstack/react-router';

import { db } from '@/lib/db';

const headers = { 'Cache-Control': 'no-store' };

/**
 * Liveness check for the container and the hosting platform. It confirms the
 * database is reachable, and says nothing more, so a failure never leaks
 * connection details.
 */
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          // `query_timeout` is a supported pg option that `@types/pg` omits.
          const query = { text: 'SELECT 1', query_timeout: 5000 };
          await db.$client.query(query);
          return new Response('OK', { headers });
        } catch {
          return new Response('Unavailable', { status: 503, headers });
        }
      },
    },
  },
});
