# NOTES

## Stack substitutions vs. the preferred list

- ~~SQLite (via better-sqlite3) instead of PostgreSQL~~ — since resolved: the
  stack now runs Postgres + `node-postgres` everywhere (local via Docker
  Compose, see `docker-compose.yml`; hosted for deployment). The original
  semantic-gap note still applies: Postgres has partial unique indexes SQLite
  lacked, but that's moot here since the design uses a single row per
  `(user_id, post_id)` with an `is_active` flag rather than needing one.
- **Next.js App Router route handlers instead of a separate Elysia server.** The
  brief explicitly calls this an acceptable shape ("a single Next.js app with route
  handlers is perfectly fine"). Kept the layering (business logic / API / client)
  as separate modules regardless, so switching to a standalone API server later
  would mostly mean moving `app/api/**/route.ts` handlers into Elysia routes and
  keeping everything in `lib/` untouched.
- Everything else (TypeScript strict, React 19, React Query v5, Zod, Vitest) matches
  the preferred list.

## Key design decisions

**Schema / no-duplicate-active-saves guarantee.** `saved_posts` is one row per
`(user_id, post_id)`, enforced with a DB-level `UNIQUE(user_id, post_id)`
constraint, plus an `is_active` boolean instead of deleting on un-save. Un-save
flips the flag; re-save flips it back (`reactivate`). This means the DB itself
guarantees "no duplicate active saves" — there's structurally only one row per
pair, so there's nothing to de-duplicate. Saving/un-saving never inserts a second
row; see `db/schema.ts`.

**Where idempotency/reactivation logic lives.** `lib/save-posts.ts` is a pure
function, `decideSaveTransition(currentState, action) -> decision`, with **zero**
DB or HTTP dependency — it's a state table (none/active/inactive × save/unsave ->
create/reactivate/deactivate/noop), unit-tested directly. `lib/save-posts-service.ts`
is the thin layer that fetches the current row, asks the pure function what to do,
and executes it. This is the split the brief's architecture diagram calls for:
business logic is testable without spinning up a database.

**Where auth/authorization live.** `lib/auth.ts` reads `x-user-id` / `x-role`
headers — unverified, per "authentication may be stubbed." `lib/authorization.ts`
holds the actual access-control checks (enrollment lookup, moderator bypass).
Every route handler runs the same sequence: authenticate (401) → look up the
resource (404 if missing) → authorize against it (403) → only then touch business
logic. Existence is checked before authorization because you need the post's
`course_id` in hand before you can ask whether the caller is enrolled in it — see
the resolved discussion on 404-vs-403 ordering.

**How hasSaved/savesCount are fetched efficiently.** Neither field is a stored
column — both are computed from `saved_posts` at query time, in two queries total
per page (`lib/hydrate-saves.ts`): one aggregate `COUNT(*) GROUP BY post_id` for
`savesCount` across all posts on the page, one `WHERE user_id = :me` lookup for
`hasSaved`. This avoids N+1 queries when hydrating a feed or saved-list page,
regardless of page size.

**Client cache / optimistic updates.** `lib/query-keys.ts` is the single source
of truth for cache key shape (`["posts","feed",courseId]`, `["posts","saved",userId]`)
so no component can typo a key and silently desync the cache. `lib/hooks.ts`'s
`useToggleSave` patches both the feed cache and the saved-list cache optimistically
in `onMutate`, rolls back via a snapshot in `onError`, and reconciles with
`invalidateQueries` in `onSettled` regardless of outcome.

**Auth stub in the UI.** There's no real login — `CurrentUserProvider`
(`lib/current-user-context.tsx`) lets you switch between the four seeded accounts
via a dropdown, and every API call attaches that account's id/role as headers.
This is a demo affordance only; it is not part of the forum's authorization
surface (see `app/api/users/route.ts`'s comment).

## Trade-offs / descoped given the time box

- **No likes/views/comments.** The brief says "build enough forum to make Saved
  Posts meaningful" — posts, courses, enrollments, and the save relationship are
  the meaningful surface for this feature; like/view/comment counts don't affect
  any Saved Posts requirement, so they're omitted rather than half-built.
- **Pagination is offset/limit, not cursor-based.** Simpler to implement and test
  correctly in the time available; fine at this data scale. A cursor
  (`created_at`+`id`) would be the production choice to avoid skip/duplicate rows
  under concurrent inserts. The API supported `limit`/`offset` from the start, but
  the frontend originally never requested more than the first page — fixed by
  switching `useFeed`/`useSavedList` to React Query's `useInfiniteQuery`
  (`lib/hooks.ts`) with a "Load more" button (`components/LoadMoreButton.tsx`).
- **No optimistic-lock / retry-on-conflict for the `create` race.** Two concurrent
  first-time saves from the same user could theoretically both read "no existing
  row" and both attempt to insert. This was noted as a moot risk back when the
  driver was `better-sqlite3` (single-threaded, synchronous per request); now
  that the app runs on `node-postgres` (async, pooled connections), the race
  window is real, not just theoretical. The DB's unique constraint on
  `(user_id, post_id)` still prevents a duplicate *active* save from landing,
  but the losing request would currently surface as an unhandled insert error
  instead of resolving gracefully. Should switch to `INSERT ... ON CONFLICT DO
  UPDATE` (an upsert) instead of the current decide-then-write two-step — see
  "What I'd do with another day" below.
- **`invalidateQueries` after every mutation, rather than fully hand-patching every
  affected cache entry.** Simpler and less bug-prone than manually keeping N cache
  entries in sync; costs one extra background request per save/un-save.
- **i18n is a small hand-rolled catalog + `Intl.PluralRules`**, not a full library
  (next-intl, etc.). The requirement is "message catalog, 2 locales, correct
  pluralization" — `Intl.PluralRules` gets pluralization right per-locale without
  pulling in routing/middleware machinery a library would add.
- **Course/user switchers are dropdowns, not real navigation/auth.** Acceptable
  per "please don't build a full identity/login system."

## What I'd do with another day

- Switch the `save` write path to a true DB-level upsert (`onConflictDoUpdate`) so
  the unique constraint — not request ordering — is what prevents duplicate active
  saves, and add a concurrency test (parallel save requests) to prove it. More
  pressing now than when this was written, since the SQLite -> Postgres move
  (below) made the race window real instead of theoretical.
- Cursor-based pagination for the feed and saved list.
- ~~Move to Postgres + Docker Compose~~ — done (see `docker-compose.yml`,
  `db/schema.ts`). Still worth adding a migration CI check.
- Add likes/views/comments if the interview conversation suggests they matter to
  the broader product surface.
- Expand the i18n catalog to cover any UI text that's currently only in English
  as a fallback (there shouldn't be any left, but worth an audit pass).
