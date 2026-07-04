# Community Forum — Saved Posts

A small forum slice (courses, posts, enrollments) plus an end-to-end bookmark
("Saved Posts") feature. See [NOTES.md](./NOTES.md) for design decisions and
trade-offs.

## Stack

TypeScript (strict), Next.js App Router (route handlers as the API), Postgres +
Drizzle ORM, React Query v5, Zod, Vitest. See NOTES.md for why Next.js route
handlers were used instead of Elysia.

## Setup

Requires Docker (for a local Postgres instance).

```bash
npm install

# start Postgres in the background (creates both the dev and test databases)
npm run db:up

# create the schema
npm run db:migrate

# seed courses, users, enrollments, posts, and a few pre-existing saves
npm run db:seed

# start the app
npm run dev
```

Open http://localhost:3000.

There's no real login — use the "Viewing as" dropdown in the nav bar to switch
between the seeded accounts (Alice, Bob, Carol are students with different
course enrollments; Morgan is a moderator). Every API request attaches the
selected account's id/role as `x-user-id`/`x-role` headers, which the server
reads as a stubbed identity (see NOTES.md).

By default the app connects to `postgres://postgres:postgres@localhost:5432/saved_posts`
(matching `docker-compose.yml`). Set `DATABASE_URL` to point at a different
database, e.g. a hosted Postgres instance for deployment.

## Tests

```bash
npm test
```

Runs both the pure business-logic unit tests (`lib/__tests__`) and the API
tests (`tests/api.test.ts`), which cover authorization boundaries (401/403/404)
and the save/un-save happy path against a real Postgres database (the
`saved_posts_test` database created by `npm run db:up`, kept separate from dev
data).

## Other scripts

```bash
npm run db:up          # start the local Postgres container (Docker Compose)
npm run db:down        # stop it
npm run db:generate    # regenerate a Drizzle migration after editing db/schema.ts
npx tsc --noEmit       # type-check
```
