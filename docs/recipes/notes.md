# Worked recipe: authenticated notes

This recipe turns the Router + Query conventions into a small vertical slice. It keeps the starter runtime lean while showing the important boundaries:

- server functions authenticate and validate untrusted input;
- database functions receive the authenticated user ID and include it in every read, update, and delete predicate;
- the feature owns its query keys, options, and cache helpers;
- mutations reconcile only the notes list instead of invalidating the router.

The snippets assume the starter's `@/` alias and existing auth middleware. Add the files below, export the schema, and generate a migration before using the route.

## 1. Define the table

Create `src/lib/db/note-schema.ts`:

```ts
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { user } from '@/lib/db/auth-schema';

export const noteTable = pgTable(
  'note',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('note_user_id_idx').on(table.userId)],
);
```

Export it from `src/lib/db/schema.ts`, then generate and apply the migration:

```ts
export * from './auth-schema';
export * from './note-schema';
```

```bash
bun run db:generate
bun run db:migrate
```

## 2. Keep ownership in the database predicates

Create `src/features/notes/server.ts`. These functions accept a trusted `userId`; they never accept one from client input. Notice that both mutations match on `userId` and `id`. Fetching by ID first and mutating by ID alone would introduce a cross-user race and makes the security invariant easier to lose during refactors.

```ts
import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { noteTable } from '@/lib/db/note-schema';

function ownedNote(userId: string, noteId: string) {
  return and(eq(noteTable.userId, userId), eq(noteTable.id, noteId));
}

export function listMyNotes(userId: string) {
  return db.select().from(noteTable).where(eq(noteTable.userId, userId)).orderBy(desc(noteTable.updatedAt));
}

export async function createMyNote(input: { userId: string; body: string }) {
  const [note] = await db.insert(noteTable).values(input).returning();
  return note;
}

export async function updateMyNote(input: { userId: string; noteId: string; body: string }) {
  const [note] = await db
    .update(noteTable)
    .set({ body: input.body })
    .where(ownedNote(input.userId, input.noteId))
    .returning();

  if (!note) throw new Error('Note not found');
  return note;
}

export async function deleteMyNote(input: { userId: string; noteId: string }) {
  const [note] = await db.delete(noteTable).where(ownedNote(input.userId, input.noteId)).returning();

  if (!note) throw new Error('Note not found');
  return note;
}
```

Returning the same not-found error for a missing note and another user's note avoids revealing whether another user's ID exists.

## 3. Authenticate and validate the server boundary

Create `src/features/notes/api.ts`:

```ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { requireAuthMiddleware } from '@/features/auth/middleware';
import { createMyNote, deleteMyNote, listMyNotes, updateMyNote } from '@/features/notes/server';

const noteBodySchema = z.object({
  body: z.string().trim().min(1).max(2_000),
});

const noteIdSchema = z.object({
  noteId: z.string().uuid(),
});

export const listNotes = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(({ context: { auth } }) => listMyNotes(auth.userId));

export const createNote = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .validator(noteBodySchema)
  .handler(({ context: { auth }, data }) => createMyNote({ userId: auth.userId, body: data.body }));

export const updateNote = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .validator(noteIdSchema.extend(noteBodySchema.shape))
  .handler(({ context: { auth }, data }) =>
    updateMyNote({ userId: auth.userId, noteId: data.noteId, body: data.body }),
  );

export const deleteNote = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .validator(noteIdSchema)
  .handler(({ context: { auth }, data }) => deleteMyNote({ userId: auth.userId, noteId: data.noteId }));
```

The client controls only `noteId` and `body`. The authenticated user ID comes from middleware after validation of the session.

## 4. Let the feature own Query behavior

Create `src/features/notes/queries.ts`:

```ts
import { queryOptions } from '@tanstack/react-query';

import { listNotes } from '@/features/notes/api';

export type Notes = Awaited<ReturnType<typeof listNotes>>;
export type Note = Notes[number];

export const notesListQueryKey = ['notes', 'list'] as const;

export function notesQueryOptions() {
  return queryOptions({
    queryKey: notesListQueryKey,
    queryFn: () => listNotes(),
  });
}

export function upsertNote(notes: Notes | undefined, next: Note): Notes {
  const withoutNext = notes?.filter((note) => note.id !== next.id) ?? [];
  return [next, ...withoutNext].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function removeNote(notes: Notes | undefined, noteId: string): Notes {
  return notes?.filter((note) => note.id !== noteId) ?? [];
}
```

Keeping the key and list transformations here gives routes, components, prefetching, and mutations one shared cache contract.

## 5. Reconcile the cache after mutations

Create `src/features/notes/use-note-actions.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createNote, deleteNote, updateNote } from '@/features/notes/api';
import { notesListQueryKey, removeNote, type Notes, upsertNote } from '@/features/notes/queries';

export function useNoteActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (body: string) => createNote({ data: { body } }),
    onSuccess: (note) => {
      queryClient.setQueryData<Notes>(notesListQueryKey, (notes) => upsertNote(notes, note));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { noteId: string; body: string }) => updateNote({ data: input }),
    onSuccess: (note) => {
      queryClient.setQueryData<Notes>(notesListQueryKey, (notes) => upsertNote(notes, note));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => deleteNote({ data: { noteId } }),
    onSuccess: (note) => {
      queryClient.setQueryData<Notes>(notesListQueryKey, (notes) => removeNote(notes, note.id));
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
```

Each server mutation returns the canonical database row, so `setQueryData` can update exactly one known cache entry. If a later mutation affects unknown or filtered lists, use a targeted `invalidateQueries({ queryKey: ['notes'] })` instead.

## 6. Connect Router preloading to Query

Create a protected route such as `src/routes/_protected/notes.tsx`:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { notesQueryOptions } from '@/features/notes/queries';

export const Route = createFileRoute('/_protected/notes')({
  context: () => ({ notesQueryOptions: notesQueryOptions() }),
  loader: ({ context }) => context.queryClient.ensureQueryData(context.notesQueryOptions),
  component: NotesRoute,
});

function NotesRoute() {
  const { notesQueryOptions } = Route.useRouteContext();
  const { data: notes } = useSuspenseQuery(notesQueryOptions);

  return (
    <main>
      <h1>Notes</h1>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.body}</li>
        ))}
      </ul>
    </main>
  );
}
```

The loader starts the request during navigation and SSR. `useSuspenseQuery` reads the same cache entry, and the mutation hooks keep that entry current without a broad router refresh. Add the form and buttons appropriate to your UI by calling the three mutations from `useNoteActions()`.

## Security checklist

- Never accept `userId` in a server-function validator.
- Apply `requireAuthMiddleware` to every notes server function, including reads.
- Include `userId` in every select, update, and delete predicate.
- Validate IDs and bounded text at the server boundary.
- Return a single not-found response for missing and non-owned records.
- Use a per-request `QueryClient` for SSR, as configured in `src/router.tsx`, so authenticated cache data is not shared between requests.
