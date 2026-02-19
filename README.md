# Second Brain

AI-powered personal knowledge management system. Capture anything via Telegram, retrieve it instantly with semantic search, and synthesize your accumulated knowledge into new thinking.

## Architecture

Turborepo monorepo, all TypeScript, Bun runtime.

```
apps/
  web/          React (Vite) frontend — browse, search, distill notes
  api/          Express backend — API, AI pipelines
  bot/          Telegram capture bot (grammY)
packages/
  shared/       Types, constants, Zod schemas
  db/           Supabase client, typed queries, migrations
  ai/           LLM wrappers, prompt templates
```

## Stack

- **Runtime:** Bun
- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Zustand
- **Backend:** Express on Bun
- **Bot:** grammY
- **Database:** Supabase (Postgres + pgvector + pg_trgm)
- **AI:** Claude for reasoning/synthesis, OpenAI for embeddings
- **Validation:** Zod

## Getting Started

```bash
bun install          # Install all deps
cp .env.example .env # Configure environment variables
bun dev              # Start all apps in parallel
```

### Environment Variables

See `.env.example`. You'll need:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (embeddings only)
- `ANTHROPIC_API_KEY` (Claude — classification, synthesis, etc.)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USER_ID`

### Individual Apps

```bash
bun run --cwd apps/web dev    # Vite dev server (:5173)
bun run --cwd apps/api dev    # API server (:3001)
bun run --cwd apps/bot dev    # Bot (long-polling)
```

### Database

```bash
bunx supabase start           # Local Supabase (needs Docker)
bunx supabase db push          # Push migrations
```

## How It Works

**Capture:** Send anything to the Telegram bot — articles, tweets, voice memos, PDFs, raw thoughts. The bot extracts content, generates an AI summary, creates embeddings, and classifies it into your PARA structure (Projects, Areas, Resources, Archive).

**Retrieve:** The web app provides hybrid search combining semantic (pgvector), keyword (tsvector), and fuzzy (pg_trgm) matching via Reciprocal Rank Fusion. Ask a question, get relevant notes.

**Synthesize:** Claude processes your notes through a distillation pipeline (raw → key points → distilled → evergreen), connecting ideas across your knowledge base.

## License

Private project.
