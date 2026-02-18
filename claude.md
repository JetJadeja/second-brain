# The Second Brain

AI-powered personal knowledge management system. Capture via Telegram bot, retrieve via web app with semantic search and AI synthesis.

## Architecture

Turborepo monorepo, all TypeScript, Bun runtime and package manager.

```
apps/
  web/          → React (Vite) frontend — browse, search, distill notes
  api/          → Express backend — serves web app API, orchestrates AI pipelines
  bot/          → Telegram capture bot (grammY) — intake and classify content
packages/
  shared/       → Types, constants, Zod schemas — zero external deps
  db/           → Supabase client, typed queries, migrations
  ai/           → LLM wrappers (Claude for thinking, OpenAI for embeddings), prompt templates
supabase/       → Supabase project config, migrations, edge functions
```

**Dependency rules:** `shared` has no external deps. `web` NEVER imports `db` or `ai` directly — it goes through the API. `bot` and `api` both import `db` and `ai`. All apps import `shared`.

## Stack

- **Runtime/PM:** Bun (NOT node, NOT pnpm, NOT npm)
- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Zustand
- **Backend:** Express on Bun with tsx
- **Bot:** grammY (NOT Telegraf)
- **Database:** Supabase (Postgres + pgvector + pg_trgm)
- **AI:** Anthropic Claude for reasoning/synthesis, OpenAI ONLY for embeddings (text-embedding-3-small, 1536 dims)
- **Validation:** Zod everywhere — shared schemas in `packages/shared`

## Commands

```bash
# From repo root
bun install                          # Install all deps
bun dev                              # Start all apps (turbo dev)
bun run build                        # Build all apps
bun run typecheck                    # Type check everything
bun run lint                         # Lint everything

# Workspace-specific (IMPORTANT: use --cwd, NOT --filter for bun)
bun add  --cwd apps/web         # Add dep to web app
bun add  --cwd apps/api         # Add dep to API
bun add  --cwd apps/bot         # Add dep to bot
bun add  --cwd packages/shared  # Add dep to shared package

# Individual apps
bun run --cwd apps/web dev           # Vite dev server (:5173)
bun run --cwd apps/api dev           # API server (:3001)
bun run --cwd apps/bot dev           # Bot (long-polling)

# Database
bunx supabase start                  # Local Supabase (needs Docker)
bunx supabase db push                # Push migrations
bunx supabase gen types typescript --local > packages/db/src/types/database.ts
```

## Code Conventions

- ES modules everywhere. No CommonJS, no `require()`.
- Strict TypeScript. No `any` — use `unknown` and narrow.
- All shared types live in `packages/shared/src/types/`. Import as `@second-brain/shared`.
- Zod schemas are the source of truth for data shapes. Types are inferred with `z.infer<>`.
- Use `async/await`, never raw `.then()` chains.
- Error handling: always wrap external API calls (Supabase, OpenAI, Anthropic) in try/catch. Never let unhandled promises crash the bot or API.
- Prefer named exports. Default exports only for React page components.

## Database

Supabase Postgres with extensions: `pgvector`, `pg_trgm`, full-text search via `tsvector`.

**The `notes` table is the core entity.** Key columns:

- `embedding vector(1536)` — semantic search via OpenAI embeddings
- `fts tsvector` — generated column for full-text keyword search
- `bucket_id` → references `para_buckets` (PARA classification)
- `distillation_status` — enum: raw → key_points → distilled → evergreen

**Search uses a hybrid approach:** The `hybrid_search()` Postgres function combines semantic (pgvector), keyword (tsvector), and fuzzy (pg_trgm) results using Reciprocal Rank Fusion. See `packages/db/src/functions/hybrid_search.sql`.

IMPORTANT: When modifying the notes table or search function, always test with the Supabase local instance first. Never push schema changes directly to production.

## AI Pipeline

Two providers, two jobs:

1. **OpenAI** — ONLY for generating embeddings (`text-embedding-3-small`). Input text → output 1536 floats. Used on capture and on search queries.
2. **Anthropic Claude** — ALL reasoning tasks: classification, summarization, synthesis, answering, distillation assist, metadata parsing.

Prompts live in `packages/ai/src/prompts/`. Each prompt is a function that takes structured input and returns the prompt string. Do not hardcode prompts inline.

## Bot Capture Flow

When the bot receives a message:

1. Detect message type (URL, text, voice, image, PDF)
2. Parse user context if present ("this is for my project car" → match against PARA structure)
3. Extract content (Readability for articles, Whisper for voice, etc.)
4. In parallel: generate AI summary, extract tags, generate embedding, classify into PARA
5. Insert note to DB with `is_classified = false` (inbox)
6. Send receipt back to user in Telegram

IMPORTANT: The bot must parse user context BEFORE running the AI classifier. The user's explicit intent ("put this in DeFi") overrides AI classification.

## Gotchas

- **Bun workspace installs:** `bun add pkg --filter=app` does NOT work. Use `bun add pkg --cwd apps/app` instead.
- **Supabase types:** After any schema change, regenerate types: `bunx supabase gen types typescript --local > packages/db/src/types/database.ts`
- **Embedding model consistency:** YOU MUST use the same embedding model (text-embedding-3-small) for both storing and querying. Mixing models produces meaningless results.
- **pgvector index:** The HNSW index on the embedding column uses `vector_cosine_ops`. All similarity queries must use cosine distance (`<=>`).
- **Bot single-user:** The bot checks `TELEGRAM_ALLOWED_USER_ID` and ignores messages from anyone else. This is a personal tool, not a multi-tenant app.
- **Turbo cache:** If you see stale behavior after changing shared packages, run `bun run build` from root to rebuild, or `rm -rf node_modules/.cache/turbo`.

## Tailwind CSS v4

Using Tailwind v4 with the `@tailwindcss/vite` plugin. No `tailwind.config.ts` — all configuration is done in CSS.

- CSS entry point: `apps/web/src/index.css` with `@import "tailwindcss";`
- Custom theme values go in `index.css` using `@theme { }` blocks
- No `tailwind.config.ts` or `postcss.config.js` needed — the Vite plugin handles everything

## File Naming

- TypeScript files: `kebab-case.ts` (e.g., `metadata-parser.ts`, `hybrid-search.ts`)
- React components: `PascalCase.tsx` (e.g., `NoteCard.tsx`, `SearchOverlay.tsx`)
- Test files: colocated, `*.test.ts` suffix
- SQL migrations: `YYYYMMDDHHMMSS_description.sql`

## Environment Variables

See `.env.example` for the full list. Critical ones:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (for embeddings only)
- `ANTHROPIC_API_KEY` (for Claude — classification, synthesis, etc.)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USER_ID`
