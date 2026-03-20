TanStack Start + Better Auth + Drizzle Starter

A practical starter for building a TanStack Start app with authentication, database ORM, and modern styling.

## Who this is for

- Devs evaluating TanStack Start with a real auth + DB setup
- Teams that want a clean foundation without a heavy UI kit
- Anyone who wants type-safe routing, typed data loaders, and a straightforward auth flow

## What is included

- TanStack Start + Router file-based routing
- TanStack Query (installed, not used by default to keep the template lean)
- Better Auth with Google provider and server handler route
- Drizzle ORM schema + migrations wiring for PostgreSQL
- Tailwind CSS v4 setup
- Protected routes + login flow

## Quick start

```bash
bun install
bun run dev
```

## Environment variables

Create a `.env.local` file in the project root (see `.env.schema`):

```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`.env.schema` is the source of truth for env vars and is used by varlock to generate `env.d.ts`.

## Auth setup

- Auth handler lives at `/api/auth/*`.
- Update your OAuth callback URLs to match your local and production origins (for Google: `http://localhost:3000/api/auth/callback/google`).
- Server auth code is in `src/features/auth/server.ts`.
- Client auth code is in `src/features/auth/client.ts`.

## Database + Drizzle

The schema entry point is `src/lib/db/schema.ts`.

```bash
bunx varlock run -- drizzle-kit generate
bunx varlock run -- drizzle-kit migrate
```

## Scripts

- Dev server: `bun run dev`
- Production build: `bun run build`
- Tests: `bun run test`

## Project structure

- `src/features/auth`: auth server/client/session helpers
- `src/lib/db`: Drizzle client + schema
- `src/lib/tanstack-query`: TanStack Query client setup
- `src/routes`: file-based routes (including protected routes)
- `src/styles.css`: Tailwind setup

## Next steps

- Setup Shadcn/ui: `bunx --bun shadcn@latest init`
- Add your own routes in `src/routes`
- Add additional OAuth providers in `src/features/auth/server.ts`
- Create your app schema in `src/lib/db/schema.ts`

## Learn more

- TanStack Start: https://tanstack.com/start
- TanStack Router: https://tanstack.com/router
- TanStack Query: https://tanstack.com/query
- Better Auth: https://better-auth.com
- Drizzle ORM: https://orm.drizzle.team
- Tailwind CSS: https://tailwindcss.com
