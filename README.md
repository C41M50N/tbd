**T**anStack Start + **B**etter Auth + **D**rizzle Starter

A practical starter for building a TanStack Start app with authentication, database ORM, and modern styling.

## Who this is for

- Devs evaluating TanStack Start with a real auth + DB setup
- Teams that want a clean foundation without a heavy UI kit
- Anyone who wants type-safe routing, typed data loaders, and a straightforward auth flow

## What is included

- TanStack Start + Router file-based routing
- Server-rendered public pages, client-rendered app routes (see `docs/tech-stack/tanstack-start-router.md`)
- TanStack Query wired into router SSR (not used by default to keep the template lean)
- Better Auth with Google provider and server handler route
- Drizzle ORM schema + migrations wiring for PostgreSQL
- Tailwind CSS v4 setup
- Portless local HTTPS URLs for dev (`https://tbd.localhost`)
- Oxlint for linting
- Oxfmt for formatting
- Protected routes + login flow

## Quick start

Install [Node.js 24 or newer](https://nodejs.org/en/download) and [Bun](https://bun.sh). `bun run` respects Vite's `node` shebang, so the dev server and build run on Node; `.nvmrc` selects the right version for nvm users (`nvm install && nvm use`).

```bash
bun install
bun run dev
```

Installing also points Git at `.githooks`, where a pre-commit hook formats and lint-fixes the staged files.

The dev script runs Vite through `portless`, so the app is available at `https://tbd.localhost` instead of a fixed `localhost:<port>` URL. On first run, `portless` may prompt to trust its local certificate and start the local proxy.

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
- Update your OAuth callback URLs to match your local and production origins (for Google locally: `https://tbd.localhost/api/auth/callback/google`).
- Server auth code is in `src/features/auth/server.ts`.
- Client auth code is in `src/features/auth/client.ts`.
- Server function auth middleware is in `src/features/auth/middleware.ts`.

## Database + Drizzle

The schema entry point is `src/lib/db/schema.ts`.

```bash
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
```

## Scripts

- Dev server: `bun run dev`
- All checks (format, lint, typecheck, test): `bun run check`
- Production build: `bun run build`
- Production server: `bun run start`
- Lint: `bun run lint`
- Lint with fixes: `bun run lint:fix`
- Format: `bun run fmt`
- Format (check only): `bun run fmt:check`
- Tests: `bun run test`
- Generate Drizzle migrations: `bun run db:generate`
- Run Drizzle migrations: `bun run db:migrate`
- Push schema changes: `bun run db:push`
- Open Drizzle Studio: `bun run db:studio`

`db:generate` writes a new migration under `drizzle/`. Run it only when you have intentionally changed the schema, and commit the result; `db:migrate` applies committed migrations.

Linting is configured in `.oxlintrc.json` and formatting is configured in `.oxfmtrc.json`.

## Deployment

Build and run the provider-neutral Docker image with the environment variables
from `.env.schema`:

```bash
varlock run -- docker build \
  --build-arg DATABASE_URL \
  --build-arg BETTER_AUTH_SECRET \
  --build-arg BETTER_AUTH_URL \
  --build-arg GOOGLE_CLIENT_ID \
  --build-arg GOOGLE_CLIENT_SECRET \
  -t tbd .
docker run --env-file .env.local -p 3000:3000 tbd
```

The image runs the TanStack Start server with `srvx`, serves the built client
assets, listens on the provider-supplied `PORT` (default `3000`), and includes
an HTTP health check against `/api/health`, which confirms the database is
reachable and returns `200` or `503` without connection details. Varlock validates required variables during both the
image build and server startup. Run migrations before each release with
`bun run db:migrate` in the release environment.

### Recommended: Railway

Railway is the recommended host. Rather than shipping a provisioning script,
hand the setup to your coding agent once you have a Railway account and the
CLI installed:

> Set up Railway IaC (`.railway/railway.ts`) for this project. Build from the
> Dockerfile, run `bun run db:migrate` as the pre-deploy command, health check
> `/api/health`, restart on failure, and add every variable from `.env.schema` as a
> service variable.

Then review with `railway config plan` and apply.

## Project structure

- `src/features/auth`: auth server/client/session/middleware helpers
- `src/lib/db`: Drizzle client + schema
- `src/lib/errors.ts`: `UserFacingError` and `withUserFacingErrors` for server functions, so only intended messages reach the client
- `src/routes/api/health.ts`: database-aware health check used by the Docker image and the host
- `src/router.tsx`: router setup, including TanStack Query SSR integration
- `src/routes`: file-based routes (including protected routes)
- `src/styles.css`: Tailwind setup
- `docs/tech-stack`: stack notes and conventions
- `docs/recipes`: worked examples that can be copied into the starter when needed

## Next steps

- Setup Shadcn/ui: `bunx --bun shadcn@latest init`
- Deploy: tell your agent to set up Railway IaC for this project (see
  [Recommended: Railway](#recommended-railway))
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
- Portless: https://portless.sh
- Oxlint: https://oxc.rs/docs/guide/usage/linter.html
- Oxfmt: https://oxc.rs/docs/guide/usage/formatter.html
