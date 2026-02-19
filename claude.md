Second Brain

Personal knowledge management system. Telegram bot captures content, web app organizes/retrieves it. Supabase (Postgres + pgvector) backend, React frontend, Express API, grammY bot.

## Commands

- `bun dev` — starts all apps (web :5173, api :3001, bot)
- `bun build` — build all packages
- `bun typecheck` — type check everything
- `bun lint` — eslint across monorepo
- `bun format` — prettier across monorepo
- `bun test` — run all tests

## Architecture Map

- `apps/web` — React + Vite frontend
- `apps/api` — Express/Hono API server
- `apps/bot` — grammY Telegram bot
- `packages/shared` — types, constants, validation schemas (ZERO runtime deps)
- `packages/db` — Supabase client, typed queries, migrations
- `packages/ai` — LLM calls, prompt templates, embedding generation

**Dependency rules:** `apps/*` → `packages/*`. Never `packages/*` → `apps/*`. Never `apps/*` → `apps/*`. `packages/shared` has zero external deps.

## Code Patterns — READ THIS CAREFULLY

### File Size and Separation

**One concern per file. No exceptions.**

- A file should do ONE thing. If you're writing a function and it needs a helper, that helper goes in its own file.
- **Max ~80-120 lines per file.** If a file is approaching 150+ lines, split it. No file should ever exceed 200 lines. Ever.
- Name files after what they do: `classify-note.ts`, `extract-article.ts`, `parse-user-context.ts`. Not `utils.ts`, `helpers.ts`, `misc.ts`.
- Group files by feature/domain, not by type. `search/hybrid-search.ts`, `search/generate-answer.ts` — NOT `services/search.ts` with everything jammed in.

### Functions

- **One function, one job.** A function that extracts content AND classifies it is two functions.
- **Max ~30 lines per function.** If it's longer, break it into smaller functions with clear names.
- Pure functions wherever possible. Given the same input, return the same output.
- Name functions as verbs: `classifyNote()`, `extractArticle()`, `generateEmbedding()`. Not `noteClassifier()` or `articleExtraction()`.
- Always use explicit return types. Never rely on inference for exported functions.

### Types

- Define types in `packages/shared`. Import everywhere.
- Never use `any`. If you're tempted, use `unknown` and narrow.
- Use discriminated unions for content types, not `type: string` with runtime checks.
- Prefer `interface` for object shapes, `type` for unions and computed types.
- Zod schemas in `packages/shared` for runtime validation at API boundaries. Infer types from schemas: `type Note = z.infer<typeof NoteSchema>`.

### Imports and Exports

- Named exports only. No default exports anywhere. Default exports make refactoring harder and grep less useful.
- Every directory that acts as a module gets a barrel `index.ts` that re-exports the public API. Internal files are NOT re-exported.
- Import from the barrel, not from internal files: `import { classifyNote } from '@/ai'` not `import { classifyNote } from '@/ai/services/classification/classify-note'`.

### Error Handling

- Never swallow errors silently. Every catch block either handles it meaningfully or re-throws with context.
- Use typed error results, not thrown exceptions, for expected failures: `Result<T, E>` pattern or similar.
- LLM calls WILL fail. Embedding API WILL fail. Content extraction WILL fail. Every external call needs a fallback path. The note ALWAYS gets saved, even if processing partially fails.
- Log errors with structured data (note ID, user ID, step that failed), not just the error message.

### API Routes

- Thin route handlers. Extract body, validate with Zod, call a service function, return response. Nothing else in the handler.
- Service functions contain business logic. Route handlers contain HTTP logic. Never mix them.
- Every endpoint validates input with Zod. No trusting the client.
- Always scope queries by `user_id`. Never return another user's data. RLS is the safety net, not the strategy.

### Database Queries

- No raw SQL strings in application code. Use typed query functions in `packages/db`.
- One query function per operation: `getNoteById()`, `getInboxNotes()`, `classifyNote()`.
- Always pass `user_id` as a parameter. Even though RLS protects us, explicit scoping is defense in depth.

### React (Frontend)

- Components are small. If a component has more than ~100 lines of JSX, split it.
- Custom hooks for any logic that isn't pure rendering. `useInbox()`, `useDashboard()`, `useSearch()`.
- Co-locate hooks, types, and helpers next to the components that use them.
- State management with Zustand or similar — not prop drilling. But don't put everything in global state. Local state first, lift only when needed.
- API calls go through typed hook wrappers (e.g., TanStack Query), never raw `fetch` in components.

### Naming

- Files: `kebab-case.ts`
- Types/interfaces: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Database columns: `snake_case`
- API routes: `/api/kebab-case`

### Testing

- Test the behavior, not the implementation. If you refactor internals and tests break, the tests were bad.
- Service functions get unit tests. API routes get integration tests.
- Mock external services (LLM, embedding API, Supabase) at the boundary, not deep inside.

## Gotchas

- Supabase service role key bypasses RLS. Only use in bot and API server. NEVER in frontend code.
- `pgvector` cosine distance operator is `<=>` (lower = more similar). Convert to similarity: `1 - (a <=> b)`.
- grammY uses middleware pattern like Express. Message handlers are middleware.
- The `notes.fts` column is auto-generated (GENERATED ALWAYS AS). Never try to write to it directly.
- `bucket_id = NULL` means inbox. `is_classified = false` is the authoritative inbox flag.
- Embeddings use OpenAI `text-embedding-3-small` (1536 dims). Classification/synthesis uses Claude (Anthropic API).

## When Reading Docs

The implementation guide is at `docs/IMPLEMENTATION.md`. Read it for schema details, capture pipeline flow, and API specs. Don't guess — the answers are in there.
