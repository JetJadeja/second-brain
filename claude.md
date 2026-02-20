# Second Brain

Personal knowledge management. Telegram bot captures content, web app organizes it. Supabase backend, React frontend, Express API, grammY bot.

## Commands

```bash
bun dev          # all apps (web :5173, api :3001, bot)
bun build        # build all
bun typecheck    # type check
bun lint         # eslint
bun test         # all tests
```

## Architecture

```
apps/web         → React + Vite frontend
apps/api         → Express API server
apps/bot         → grammY Telegram bot
packages/shared  → types, schemas, constants (ZERO runtime deps)
packages/db      → Supabase client, typed queries
packages/ai      → LLM calls, prompts, embeddings
```

**Dependency rules:** `apps/*` → `packages/*` only. Never cross-import between apps or packages importing apps.

## Code Philosophy

**Small files, single purpose.** A file does one thing. If it needs a helper, that helper gets its own file.

- ~80-120 lines per file. 150+ means split it. 200+ is never acceptable.
- ~30 lines per function. Longer means extract smaller functions.
- Name files after what they do: `classify-note.ts`, `extract-article.ts`. Never `utils.ts` or `helpers.ts`.
- Group by feature/domain, not by type.

**Types and exports:**

- Types live in `packages/shared`. Import everywhere.
- Named exports only. No default exports.
- Explicit return types on exported functions.
- Never `any`. Use `unknown` and narrow.
- Zod schemas at API boundaries. Infer types: `type Note = z.infer<typeof NoteSchema>`.

**Errors:**

- Never swallow silently. Handle meaningfully or re-throw with context.
- External calls WILL fail. Every LLM/embedding/extraction call needs a fallback. The note always gets saved.

## Patterns

**API routes:** Thin handlers. Validate with Zod, call service, return response. Business logic in services, HTTP logic in handlers.

**Database:** No raw SQL in app code. Typed query functions in `packages/db`. Always pass `user_id`.

**React:** Small components (<100 lines JSX). Logic in custom hooks. API calls through typed wrappers, never raw fetch.

**Bot:** grammY middleware pattern. Users link their Telegram account through the web app settings page (generates a 6-char link code via `link_codes` table, user sends `/link CODE` to the bot, bot creates a `telegram_links` row). On every message, the bot looks up `telegram_user_id` → `user_id` via `telegram_links` (cached 5-min TTL). Unlinked users can only use `/start` and `/link`.

**Data isolation:** The API and bot use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) for all database operations. Data isolation is enforced programmatically — every query function takes a `userId` parameter and filters by it. RLS is the safety net, not the strategy.

## Gotchas

- `pgvector` distance: `<=>` (lower = more similar). Similarity: `1 - (a <=> b)`.
- `notes.fts` is GENERATED ALWAYS AS. Never write to it.
- `bucket_id = NULL` means inbox. `is_classified = false` is authoritative.
- Embeddings: OpenAI `text-embedding-3-small` (1536 dims). Classification: Claude.
- `notes.source` is JSONB with different fields per content type.
- Service role key: API and bot only. Never expose to frontend.

## Naming

- Files: `kebab-case.ts`
- Types: `PascalCase`
- Functions/vars: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- DB columns: `snake_case`
- Routes: `/api/kebab-case`

## Environment Variables

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase connection. Service role key is backend-only.
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Vite-prefixed for frontend.
`OPENAI_API_KEY` — Embeddings only (text-embedding-3-small).
`ANTHROPIC_API_KEY` — All reasoning (summarize, classify, answer synthesis).
`TELEGRAM_BOT_TOKEN` — grammY bot.
`API_PORT` (3001), `WEB_PORT` (5173), `WEB_APP_URL`, `VITE_API_URL` — App config.

## Docs

Implementation details: `notes/implementation-plan.md`
