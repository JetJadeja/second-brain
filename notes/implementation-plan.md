# The Second Brain — Implementation Plan

### Phase 1: From Scaffold to Functional Product

### February 19, 2026

---

## Master To-Do List

### Phase A: Database + Shared Types

- [x] A.1 — Database migration (6 enums, 10 tables, indexes, RLS policies, hybrid_search function, triggers)
- [x] A.2 — Supabase Storage bucket (`user-content`)
- [x] A.3 — Shared TypeScript types (enums, entity interfaces, ~25 API request/response types)
- [x] A.4 — Shared constants (`DEFAULT_PARA_BUCKETS`)
- [x] A.5 — Database client factory (service role + anon clients)
- [x] A.6 — CLAUDE.md updates
- [x] **Test Phase A** — typecheck, imports resolve, migration applies, triggers fire

### Phase B: API Auth + Core Endpoints

- [x] B.1 — Environment variables (`WEB_APP_URL`, `VITE_API_URL`)
- [x] B.2 — Auth middleware (validate Supabase JWT, attach userId)
- [x] B.3 — Default PARA bucket creation (4 buckets on first API call)
- [x] B.4 — PARA tree resolver + caching (bucket paths, invalidation)
- [x] B.5 — Database query functions (~30 functions: notes, PARA, inbox, connections, search, telegram, views, distillation)
- [x] B.6 — Dashboard endpoint (`GET /api/dashboard`)
- [x] B.7 — Inbox endpoints (list, classify, batch-classify, delete, archive)
- [x] B.8 — PARA endpoints (tree, bucket detail, create/update/delete)
- [x] B.9 — Note endpoints (detail, update, delete, connect)
- [x] B.10 — Link code endpoints (generate code, check link status)
- [x] B.11 — Suggestion endpoints (list pending, accept, dismiss)
- [x] B.12 — Route organization + CORS
- [x] **Test Phase B** — curl each endpoint with real JWT, full CRUD flows

### Phase C: Bot Core (Text + URLs)

- [x] C.1 — AI package (Claude wrapper, OpenAI wrapper, prompt templates, embedding function)
- [x] C.2 — Bot auth middleware (telegram_user_id → user_id lookup, 5-min cache)
- [x] C.3 — Bot commands (`/start`, `/link <CODE>`, `/help`)
- [x] C.4 — Message type detection (URL vs text vs attachment, separate URL from context)
- [x] C.5 — Shared `ExtractedContent` interface
- [x] C.6 — Web article extractor (fetch HTML → Readability → clean text)
- [x] C.7 — Plain text handler (save as thought)
- [x] C.8 — AI processing pipeline (embed + summarize + classify in parallel → save → detect connections)
- [x] C.9 — Receipt message (formatted Telegram reply)
- [x] C.10 — Receipt interactions (thumbs-up confirm, reply to correct)
- [x] C.11 — Telegram link edge cases
- [x] **Test Phase C** — link account, send URL, send text, verify note saved with all fields, receipt sent

### Phase D: Frontend Integration

- [x] D.1 — Package dependency wiring (`@second-brain/shared` in web)
- [x] D.2 — API client (JWT auto-attach, TanStack Query)
- [x] D.3 — Type migration (replace local types with shared, field name mapping)
- [x] D.4 — Delete mock data
- [x] D.5 — Update SourceIcon for all 11 content types
- [x] D.6 — Dashboard data wiring (InboxPulse, NoteGrid, AreaCard with real data)
- [x] D.7 — Left rail PARA tree (real data, inbox count badge, bucket navigation)
- [x] D.8 — New routes (`/inbox`, `/para/:bucketId`, `/notes/:noteId`, `/settings`)
- [x] D.9 — ParaPicker component (searchable bucket tree dropdown)
- [x] D.10 — Inbox view (queue mode + list mode with batch actions)
- [x] D.11 — PARA Bucket view (notes grid with sort/filter/date range)
- [x] D.12 — Note Detail view (content display by status, context panel, connections/backlinks)
- [] D.13 — Settings page (Telegram linking flow with code + polling)
- [ ] D.14 — Supabase Realtime (live inbox count updates)
- [ ] D.15 — UI polish (breadcrumbs, toasts with undo, Cmd+K hint)
- [ ] **Test Phase D** — full user flow: sign up → connect Telegram → capture → classify → browse → view note

### Phase E: Additional Bot Extractors

- [ ] E.1 — Tweet/thread extractor (research scraping approach)
- [ ] E.2 — Instagram reel extractor (yt-dlp + optional Vision description)
- [ ] E.3 — YouTube extractor (yt-dlp, transcript as content)
- [ ] E.4 — PDF extractor (pdf-parse, store in Storage)
- [ ] E.5 — Voice memo transcription (Whisper API)
- [ ] E.6 — Image description (Claude Vision API)
- [ ] E.7 — Remaining bot commands (`/inbox`, `/search`, `/new project|area`)
- [ ] **Test Phase E** — send each content type, verify extraction + fallbacks

DO NOT UNDER ANY CIRCUMSTANCES BEGIN IMPLEMENTING PHASES F AND G. DO NOT. WE HAVE MUCH MORE RESEARCH TO DO HERE BEFORE WE BEGIN!!!

### Phase F: Search

- [ ] F.1 — Answer synthesis prompt (Claude generates answers with citations)
- [ ] F.2 — Search API endpoint (`POST /api/search` — notes mode + answer mode)
- [ ] F.3 — Search modal UI (Cmd+K overlay, Notes tab + Answer tab, filters, keyboard nav)
- [ ] **Test Phase F** — search with results, search with filters, answer mode, empty state, Cmd+K

### Phase G: Background Jobs

- [ ] G.1 — Connection re-detection (retry failed embeddings, find new connections)
- [ ] G.2 — Organization suggestions (bucket splits, archive stale projects)
- [ ] G.3 — Link code cleanup (delete expired codes)
- [ ] **Test Phase G** — trigger each job, verify behavior

---

**Total: 57 items + 7 phase tests = 64 checkboxes**

---

## How to Use This Document

This plan is organized into 7 phases (A through G). Each phase is independently completable and testable. Dependencies between phases are noted upfront.

**For the implementing agent:** This plan describes WHAT to build and WHY, not HOW at the code level. You make the architectural and code-level decisions. When this plan says "build X," you decide the file structure, the function signatures, the error handling patterns. Follow the conventions in CLAUDE.md. When in doubt about a decision, the spec documents in `notes/` are the source of truth.

**Companion documents:**

- `notes/implementation-checklist.md` — exhaustive numbered checklist of every requirement
- `notes/tg-bot-implementation-corrected.md` — the corrected specification (primary source of truth)
- `notes/second-brain-ui-spec.md` — complete UI specification
- `notes/second-brain-technical-architecture.md` — architecture decisions
- `claude.md` — coding conventions and patterns (MUST follow)

---

## Key Architectural Decisions (Resolved Conflicts)

The spec documents had several conflicts that have been resolved. The implementing agent should be aware of these so they don't wonder about alternatives:

1. **Multi-user from the start** — The architecture doc mentioned single-user with `TELEGRAM_ALLOWED_USER_ID`. This was dropped. The codebase already has multi-user Supabase Auth. The schema uses `user_id` columns and RLS everywhere. The bot uses `telegram_links` for authentication.
2. **JSONB for `source` column** — The architecture doc had separate columns (`source_url`, `source_author`, `source_domain`). The spec uses a single JSONB column because different content types have wildly different metadata. No NULL column sprawl.
3. **JSONB for `key_points`** — The architecture doc had `TEXT[]`. The spec uses JSONB for future flexibility (rich structure like confidence scores).
4. **No `index_cards` table** — The architecture doc defined one for AI-generated bucket overviews. Dropped. Bucket stats are computed on-the-fly. If performance becomes an issue later, add a materialized view.
5. **Express 5** (not Hono) — Already installed in the codebase. Express 5 has automatic async error handling.
6. **Bun runtime** (not Node.js) — The spec references "Node.js" in places but the runtime is Bun. Express runs on Bun via its compatibility layer.

---

## Phase Dependencies

```
Phase A: Database + Shared Types
    ├──→ Phase B: API Auth + Core Endpoints
    │       └──→ Phase D: Frontend Integration
    │       └──→ Phase F: Search (also needs C)
    └──→ Phase C: Bot Core
            └──→ Phase E: Additional Extractors
            └──→ Phase F: Search (also needs B)

Phase G: Background Jobs (depends on B + C, lower priority)
```

**Critical path:** A → B → D (gets the web app functional with real data)
**Parallel path:** A → C → E (gets the bot capturing content)
**Convergence:** F requires both B and C (search needs API endpoints + notes with embeddings)

---

## Phase A: Database + Shared Types

**Goal:** The database schema exists and is applied. Shared TypeScript types and constants are defined and importable by all packages. The database client is ready for use.

**Blocks:** Everything. No other phase can start without this.

**Checklist items covered:** #1–73, #135, #143, #250–253

### A.1 Database Migration

Create a single SQL migration file that defines the complete initial schema. This is the foundation of the entire system. Everything in Part 1 of the spec goes in here.

**What to build:**

1. **Extensions:** Enable `vector` (pgvector) and `pg_trgm`. The `tsvector` type is built into Postgres and needs no extension.

2. **Custom enum types (6 total):**
   - `para_type` — 4 values: project, area, resource, archive
   - `note_source` — 11 values: article, tweet, thread, reel, image, pdf, voice_memo, thought, youtube, document, other
   - `distillation_status` — 4 values: raw, key_points, distilled, evergreen
   - `connection_type` — 2 values: explicit, ai_detected
   - `suggestion_type` — 6 values: split_bucket, merge_notes, archive_project, reclassify_note, create_sub_bucket, link_notes
   - `suggestion_status` — 3 values: pending, accepted, dismissed

3. **Tables (10 total), each with columns, constraints, indexes, and RLS policies:**

   **`telegram_links`** — Maps Supabase auth users to Telegram accounts. One-to-one relationship enforced by UNIQUE on both user_id and telegram_user_id. Index on telegram_user_id for bot lookup performance. RLS: users can SELECT, INSERT, DELETE their own link.

   **`link_codes`** — Short-lived 6-character codes for the Telegram linking flow. UNIQUE on code. Indexes on code (for bot lookup) and user_id (for cleanup). RLS: users can SELECT and INSERT their own codes. The code behavior (expiry, single-use, invalidation of previous codes) is enforced at the application layer, not in the schema.

   **`para_buckets`** — PARA organizational tree with infinite nesting via self-referential parent_id. CASCADE delete on parent means deleting a parent removes all descendants. Indexes on user_id, parent_id, and (user_id, type). RLS: users can do ALL operations on their own buckets. The type-matching constraint (child type matches root ancestor type) is enforced at the application layer.

   **`notes`** — The core entity. This is the most complex table. Key columns:
   - Content fields: title (required), original_content, ai_summary, key_points (JSONB array), distillation, user_note
   - Source fields: source_type (enum), source (JSONB — flexible per content type)
   - Classification fields: bucket_id (FK to para_buckets, ON DELETE SET NULL), ai_suggested_bucket, ai_confidence, is_classified, is_original_thought, tags (TEXT array)
   - Search vectors: embedding (vector(1536)), fts (tsvector, GENERATED ALWAYS AS — combining title, original_content, ai_summary, distillation, user_note)
   - Activity: view_count, last_viewed_at, connection_count (denormalized, updated by trigger)
   - Timestamps: captured_at, created_at, updated_at

   **Critical design decisions baked into the schema:**
   - `is_classified = false` is the authoritative inbox flag (not `bucket_id IS NULL`)
   - `source` is JSONB, not separate columns — different content types have wildly different metadata
   - `key_points` is JSONB (not TEXT[]) to allow richer structure later
   - `connection_count` is denormalized for fast display, updated via trigger

   **Indexes (10 total):** HNSW on embedding for vector similarity search, GIN on fts for full-text search, GIN trgm on title for fuzzy matching, plus 7 query indexes covering user_id, bucket_id, is_classified, distillation_status, captured_at, source_type, and tags.

   RLS: users can do ALL operations on their own notes.

   **`note_connections`** — Links between notes. Directional in storage (source_id → target_id) but queried bidirectionally. UNIQUE on (source_id, target_id) prevents duplicates. Includes user_id for RLS. Similarity score stored for AI-detected connections. Indexes on user_id, source_id, target_id.

   **`distillation_history`** — Version history for note distillations. Every time a distillation changes, the previous version is archived here. Index on (note_id, created_at DESC) for retrieving history in order.

   **`syntheses`** — AI-generated synthesis documents. Source notes tracked via source_note_ids (UUID array). Optional bucket_id for classification.

   **`suggestions`** — AI-generated organizational suggestions. Payload is JSONB (flexible per suggestion type). Status tracks lifecycle: pending → accepted/dismissed.

   **`search_log`** — Tracks user searches. Mode constrained by CHECK to 'notes' or 'answer'. Index on (user_id, created_at DESC).

   **`note_views`** — Individual view events for notes. Used to compute "recently viewed" on the dashboard and to drive distillation nudges.

4. **Hybrid search function:** `hybrid_search()` — a Postgres function that combines full-text search (tsvector) and semantic search (pgvector) using Reciprocal Rank Fusion (RRF). Key details:
   - Takes user_id as first parameter (data isolation)
   - SECURITY DEFINER (bypasses RLS since it needs to read notes)
   - Accepts 5 optional filter parameters: bucket_id, source_type, distillation_status, date range (after/before)
   - Returns full note data plus similarity score and combined rank_score
   - The SQL for this function is provided exactly in the spec — use it as-is
   - This function must ONLY be called from the API backend, never exposed directly

5. **Trigger functions (2) and triggers (3):**
   - `update_updated_at()` — sets updated_at = now() before UPDATE. Applied to both `notes` and `para_buckets`.
   - `update_connection_count()` — increments/decrements connection_count on both notes when a connection is inserted/deleted. Uses GREATEST to prevent negative counts. Applied to `note_connections`.

6. **Every table must have RLS enabled and appropriate policies.** The spec provides the exact policies for each table. Every table uses `auth.uid() = user_id` as the condition.

**Testing this step:**

- Apply the migration to a local Supabase instance
- Verify all 10 tables exist with correct columns and types
- Verify all indexes exist
- Verify the hybrid_search function can be called (even with empty data)
- Verify RLS policies are active
- Verify triggers fire correctly (insert a note, update it, check updated_at changed; insert a connection, check connection_count on both notes)

### A.2 Supabase Storage

Create a storage bucket named `user-content` for storing files (PDFs, voice memos, images, thumbnails).

**Path structure:** `{user_id}/{note_id}/{filename}`

**RLS:** Users can only access files under their own user_id prefix. Research the cleanest way to set this up with Supabase Storage policies — this may be done through the Supabase dashboard or via SQL policies on the storage.objects table.

### A.3 Shared TypeScript Types

Populate the empty `packages/shared` package with all type definitions that are shared across the monorepo. Currently `packages/shared/src/types/index.ts` and `packages/shared/src/constants/index.ts` are empty exports.

**What to build:**

1. **Enum types and const arrays** — For each database enum, create a `const` array (for runtime use and iteration) and derive the type from it. This pattern (`['a', 'b'] as const` + `type X = typeof arr[number]`) gives you both runtime values and compile-time types from a single source.

   Types needed: ParaType, NoteSource, DistillationStatus, ConnectionType, SuggestionType, SuggestionStatus. The exact values for each are specified in the database enums (Part 1 of the spec).

2. **Entity interfaces** — TypeScript interfaces matching the database table shapes. These represent the "raw" data as it comes from the database:
   - ParaBucket, Note, NoteConnection, Suggestion, Synthesis, TelegramLink
   - Distillation history doesn't need its own entity type for now (it's only used internally)
   - Timestamps are `string` (ISO format from Postgres)
   - UUIDs are `string`
   - The `source` field on Note is `Record<string, unknown>`
   - The `key_points` field on Note is `string[]` (parsed from JSONB)

3. **API request/response types** — The contracts between frontend and backend. These are the shapes that the API endpoints accept and return. The spec defines ALL of them in Part 2.3 (`api.ts`). There are approximately 25 types covering:
   - Dashboard: DashboardResponse, DashboardInboxItem, DashboardNote, DashboardArea
   - Inbox: InboxResponse, InboxItem, ClassifyRequest, BatchClassifyRequest
   - PARA: ParaTreeNode, ParaTreeResponse, BucketDetailResponse, BucketNote, CreateBucketRequest, UpdateBucketRequest
   - Notes: NoteDetailResponse, UpdateNoteRequest, ConnectNotesRequest
   - Search: SearchRequest, SearchNotesResponse, SearchResult, SearchAnswerResponse
   - Link: LinkCodeResponse, LinkStatusResponse
   - Suggestions: SuggestionsResponse

   **Important detail:** API responses use `snake_case` field names (matching Postgres column names). The frontend consumes snake_case directly — there is no camelCase transformation layer. This is an explicit design decision from the spec.

4. **Barrel exports** — Update `types/index.ts` to re-export all from enums, entities, and api files.

### A.4 Shared Constants

Create the default PARA bucket definitions:

**DEFAULT_PARA_BUCKETS** — An array of 4 objects: `{ name: 'Projects', type: 'project' }`, `{ name: 'Areas', type: 'area' }`, `{ name: 'Resources', type: 'resource' }`, `{ name: 'Archive', type: 'archive' }`. Used by the API when creating default buckets for new users.

Update `constants/index.ts` to re-export.

### A.5 Database Client

Create the Supabase client factory in `packages/db`. This provides the database connection used by the API and bot.

**Two client variants needed:**

- **Service role client** — Uses `SUPABASE_SERVICE_ROLE_KEY`. Bypasses RLS. Used by the API server and bot for all database operations. Data isolation is enforced by always filtering on user_id.
- **Anon client** — Uses `SUPABASE_ANON_KEY`. Respects RLS. Used by the frontend for Supabase Auth and Realtime subscriptions (NOT for data queries — those go through the API).

Update `packages/db/src/index.ts` to export the client factory.

### A.6 CLAUDE.md Updates

Update `claude.md` to reflect the multi-user bot architecture:

- Remove the reference to `TELEGRAM_ALLOWED_USER_ID` env var
- Add description of the `telegram_links` table and link code flow for bot authentication
- Add note about `SUPABASE_SERVICE_ROLE_KEY` usage (API and bot bypass RLS, enforce isolation via user_id filtering)
- Update the environment variables section

**Testing Phase A as a whole:**

- Run `bun typecheck` — shared types compile without errors
- Import `@second-brain/shared` in each app — verify it resolves
- Create a Supabase client with the service role key — verify it connects
- Run the migration — verify schema is applied

---

## Phase B: API Auth + Core Endpoints

**Goal:** The API server serves real data. All CRUD endpoints work. The frontend can fetch from it.

**Depends on:** Phase A

**Checklist items covered:** #80–82, #95–124, #129–134, #136–142, #247–248

### B.1 Environment Variables

Add two new variables to `.env.example`:

- `WEB_APP_URL` — The URL of the web app (e.g., `http://localhost:5173`). Used by the bot to tell users where to generate link codes.
- `VITE_API_URL` — The API base URL for the frontend (e.g., `http://localhost:3001`). Used by the web app's API client.

Also add these to the actual `.env` file for development.

### B.2 Auth Middleware

Build authentication middleware for the Express API. Every endpoint except `GET /health` requires a valid Supabase JWT.

**Behavior:**

1. Extract the token from the `Authorization: Bearer <token>` header
2. Call `supabase.auth.getUser(token)` using the service role client to validate the token and extract the user
3. If the token is missing or invalid → respond with 401
4. If valid → attach the `userId` (UUID string) to the request object and call `next()`

**Critical architecture note:** The API uses the service role Supabase client for ALL database operations. This bypasses RLS entirely. Data isolation is enforced programmatically — every query function takes a userId parameter and filters by it. This is simpler than trying to create per-request Supabase clients with the user's JWT.

**Decision for the implementer:** Research the cleanest way to type the `userId` on the Express request object. Options include extending the Request type, using a custom property, or using `res.locals`. Pick whichever pattern is cleanest and most type-safe.

### B.3 Default PARA Bucket Creation

When a user makes their first authenticated API call and has no `para_buckets` rows, automatically create the 4 default top-level containers (Projects, Areas, Resources, Archive).

**Implementation approach:** This can be a middleware that runs after auth, or a utility function called at the start of relevant endpoints. The check is simple: `SELECT COUNT(*) FROM para_buckets WHERE user_id = $1`. If 0, insert the 4 defaults from `DEFAULT_PARA_BUCKETS` in the shared constants.

**This runs once per user, ever.** After the first API call, the user always has at least these 4 buckets. The check is cheap (count against an indexed column) so it's fine to run on every request or on relevant endpoints.

### B.4 PARA Tree Resolver + Caching

Several endpoints need to compute a `bucket_path` — a human-readable string like "Areas/DeFi/Protocol Research" — by walking up the parent_id chain. Several endpoints also need the full PARA tree with note counts.

**Build a service that:**

1. Fetches all para_buckets for a user in a single query
2. Builds the tree in memory (parent → children relationships)
3. Computes bucket_path for any bucket by walking up to the root
4. Caches the tree per user (the PARA structure changes rarely)
5. Invalidates the cache when buckets are created, updated, or deleted

**This is used by:** dashboard endpoint (areas section, bucket paths), inbox endpoint (suggested bucket paths), note detail endpoint (bucket path), PARA tree endpoint, and search results (bucket paths).

### B.5 Database Query Functions

Build typed query functions in `packages/db`. Each function takes a userId parameter and returns typed results.

**Organize by domain.** Research the cleanest file structure — the spec suggests separate files per domain (notes, para, inbox, connections, search, telegram, views) but the implementer should decide the structure that best follows CLAUDE.md conventions.

**Functions needed (grouped by domain):**

**Notes:**

- Get note by ID (with user_id check)
- Get recent notes for user (with pagination, filtering)
- Create note (from bot capture)
- Update note fields (partial update)
- Delete note
- Increment view count + update last_viewed_at
- Get notes by bucket_id (with pagination, sorting, filtering by source_type and distillation_status)
- Count notes per bucket (for tree)

**PARA Buckets:**

- Get all buckets for user
- Get bucket by ID
- Create bucket
- Update bucket
- Delete bucket (handle notes becoming unclassified)
- Count user's buckets (for default creation check)

**Inbox:**

- Get unclassified notes (paginated, sorted)
- Count unclassified notes
- Classify note (set bucket_id, is_classified = true)
- Batch classify (transaction)
- Archive note (move to Archive bucket, set is_classified)

**Connections:**

- Get connections for a note (both directions)
- Create connection
- Find similar notes by embedding (cosine distance query)

**Search:**

- Wrapper around the hybrid_search RPC function
- Insert search log entry

**Telegram:**

- Look up user_id by telegram_user_id
- Create telegram_link
- Delete telegram_link
- Create link_code
- Find valid link_code by code string (not expired, not used)
- Mark link_code as used
- Invalidate previous codes for user

**Views:**

- Insert note_view
- Get recently viewed notes for user

**Distillation:**

- Insert distillation_history entry

### B.6 Dashboard Endpoint

`GET /api/dashboard` — Returns all data for the dashboard in a single API call.

**Response shape:** `DashboardResponse` (defined in shared types)

**Computation details:**

1. **inbox.count** — Count of notes where `user_id = $1 AND is_classified = false`

2. **inbox.recent** — Last 5 unclassified notes ordered by `captured_at DESC`. Each item includes: id, title, ai_summary, source_type, source (JSONB), ai_suggested_bucket (UUID), ai_suggested_bucket_path (computed string like "Areas/DeFi"), captured_at

3. **recent_and_relevant** — A merged, deduplicated list of:
   - Recently captured notes (last 7 days, where is_classified = true)
   - Recently viewed notes (last 7 days, from note_views table)
   - Deduplicate by note ID (a note can be both recently captured and recently viewed)
   - For MVP, skip AI-surfaced "revisit" suggestions
   - Each item includes: id, title, ai_summary, distillation, source_type, source, bucket_id, bucket_path, distillation_status, captured_at, connection_count

4. **areas** — Query para_buckets that are children of the top-level "Projects" and "Areas" containers. For each:
   - Count notes in that bucket (and its descendants)
   - Find most recent captured_at among those notes
   - Compute health: growing (capture in last 14 days), stable (14-28 days), stagnant (28+ days or no captures)
   - Include children sub-buckets with their note counts

**Performance consideration:** This endpoint does multiple queries. Consider whether they can be parallelized (they're independent of each other). The bucket_path computation uses the cached PARA tree from B.4.

### B.7 Inbox Endpoints

**`GET /api/inbox`** — Paginated list of unclassified notes.

- Query params: `page` (default 1), `limit` (default 20), `sort` (default 'captured_at_desc')
- Returns: InboxResponse (items, total, page, limit)
- Each item includes related_notes (top 3 most similar classified notes by embedding, if the inbox item has an embedding)

**`POST /api/inbox/:noteId/classify`** — Classify a single inbox item.

- Body: `{ bucket_id: string }` (validated with Zod)
- Sets `bucket_id = body.bucket_id` and `is_classified = true`
- Verify the bucket_id exists and belongs to this user
- Return the updated note or a success response

**`POST /api/inbox/batch-classify`** — Classify multiple items at once.

- Body: `{ classifications: [{ note_id: string, bucket_id: string }] }`
- Execute in a single database transaction
- Validate all note_ids belong to this user and all bucket_ids are valid
- Return success count

**`DELETE /api/inbox/:noteId`** — Permanently delete a note.

- Verify the note belongs to this user
- Delete the note (cascade handles connections)

**`POST /api/inbox/:noteId/archive`** — Send directly to Archive.

- Find the user's Archive top-level bucket
- Set `bucket_id` to the Archive bucket, `is_classified = true`

### B.8 PARA Endpoints

**`GET /api/para/tree`** — Returns the full PARA tree.

- Response: ParaTreeResponse (array of ParaTreeNode, each with children recursively)
- Each node includes: id, name, type, parent_id, is_active, sort_order, note_count, children[]
- Use the cached tree from B.4

**`GET /api/para/:bucketId`** — Bucket detail with paginated notes.

- Query params: `page`, `limit`, `sort`, `filter_source_type`, `filter_status`
- Response: BucketDetailResponse
- Includes bucket metadata (name, type, path, counts for total/distilled/evergreen, children) plus paginated notes

**`POST /api/para/buckets`** — Create a new bucket.

- Body: CreateBucketRequest (name, type, parent_id, optional description)
- **Validation:**
  - Name is non-empty and max 100 characters
  - parent_id is a valid bucket owned by this user
  - The type must match the root ancestor's type (walk up the parent chain to find the root — if root is "Areas" (type: area), the new child must be type: area)
- After creation, invalidate the PARA tree cache for this user

**`PATCH /api/para/buckets/:bucketId`** — Update a bucket.

- Body: UpdateBucketRequest (optional: name, parent_id, sort_order, is_active, description)
- Verify the bucket belongs to this user
- If parent_id is changing, validate the type still matches
- Invalidate tree cache

**`DELETE /api/para/buckets/:bucketId`** — Delete a bucket and all descendants.

- **Critical behavior:** Notes inside the deleted bucket(s) become unclassified. Set `bucket_id = NULL` and `is_classified = false` for all notes in the bucket and its descendants before deleting.
- The cascade delete on para_buckets handles removing child buckets.
- Invalidate tree cache
- **This is destructive** — the frontend should show a confirmation dialog before calling this.

### B.9 Note Endpoints

**`GET /api/notes/:noteId`** — Full note detail + context.

- Response: NoteDetailResponse
- Includes:
  - Full note data (all content fields, classification, tags, timestamps, etc.)
  - bucket_path (computed)
  - related_notes: connections (both AI-detected and explicit) with note title, summary, similarity score, bucket_path, connection_type
  - backlinks: notes that link TO this note (via note_connections where target_id = this note)
- **Side effects:** Increment view_count, update last_viewed_at on the note, insert a note_views row. These side effects should not block the response — fire them asynchronously if possible.

**`PATCH /api/notes/:noteId`** — Update note fields.

- Body: UpdateNoteRequest (optional: title, bucket_id, tags, distillation, distillation_status, key_points)
- Verify the note belongs to this user
- **Distillation handling:** If `distillation` or `distillation_status` is changing:
  - Insert the PREVIOUS distillation and status into `distillation_history` before overwriting
  - If the note had an embedding generated from pre-distillation content, consider whether to regenerate it (the embedding should reflect the most important representation of the note)
- If `bucket_id` is changing, verify the target bucket belongs to this user. If setting a bucket, also set `is_classified = true`.

**`DELETE /api/notes/:noteId`** — Permanently delete a note.

- Cascade handles connections. Verify ownership.

**`POST /api/notes/:noteId/connect`** — Create an explicit connection.

- Body: ConnectNotesRequest (`{ target_note_id: string }`)
- Verify both notes belong to this user
- Create a note_connections row with type = 'explicit'
- The trigger will update connection_count on both notes

### B.10 Link Code Endpoints

**`POST /api/link-code`** — Generate a Telegram linking code.

- Before generating, invalidate any previous unused codes for this user (set used = true or delete them)
- Generate a 6-character uppercase alphanumeric code
- **Character set:** Exclude ambiguous characters: 0, O, 1, I, L. Use only: A-H, J-K, M-N, P-Z, 2-9
- Set expiry to 10 minutes from now
- Insert into link_codes table
- Response: LinkCodeResponse (`{ code, expires_at }`)

**`GET /api/link-status`** — Check if user's Telegram is linked.

- Query telegram_links for this user's user_id
- Response: LinkStatusResponse (`{ linked: boolean, telegram_username?: string }`)

### B.11 Suggestion Endpoints

**`GET /api/suggestions`** — Get pending suggestions.

- Query suggestions where user_id = $1 and status = 'pending'
- Response: SuggestionsResponse (array of suggestions with id, type, payload, created_at)

**`POST /api/suggestions/:id/accept`** — Accept and execute a suggestion.

- Verify the suggestion belongs to this user
- Based on suggestion type and payload, execute the corresponding action:
  - `split_bucket` → create new sub-bucket(s) and move relevant notes
  - `merge_notes` → merge note content
  - `archive_project` → move project to archive
  - `reclassify_note` → change note's bucket
  - `create_sub_bucket` → create a new child bucket
  - `link_notes` → create note connections
- Set suggestion status to 'accepted'
- **For MVP:** The accept logic can be simplified — just mark as accepted. Full execution can be added incrementally.

**`POST /api/suggestions/:id/dismiss`** — Dismiss a suggestion.

- Verify ownership
- Set status to 'dismissed'

### B.12 Route Organization

Research and decide how to organize the API routes. The spec suggests grouping by domain (dashboard.ts, inbox.ts, para.ts, notes.ts, link.ts, suggestions.ts). Each route file should contain thin handlers that:

1. Extract and validate the request body/params with Zod
2. Call a service function
3. Return the response

Keep business logic in service functions, HTTP logic in route handlers. Follow the CLAUDE.md conventions for this separation.

**Mount all routes in server.ts** with appropriate prefixes (/api/dashboard, /api/inbox, etc.).

**Add CORS middleware** to allow requests from the frontend origin (`WEB_APP_URL` or localhost:5173 in development).

**Testing Phase B:**

- Hit each endpoint with curl/Postman using a real Supabase JWT
- Create a user, verify default PARA buckets are created on first call
- Create buckets, verify tree endpoint returns correct structure
- Create notes, verify they appear in inbox
- Classify notes, verify they move out of inbox
- Fetch dashboard, verify all three zones return correct data
- Generate a link code, verify it exists in the database

---

## Phase C: Bot Core (Text + URLs)

**Goal:** The Telegram bot receives messages, authenticates users, extracts content from text and URLs, runs the AI processing pipeline, saves notes, and sends receipt messages. This phase covers plain text (thoughts) and web articles. Other content types come in Phase E.

**Depends on:** Phase A

**Checklist items covered:** #85–86, #88–91, #144–149, #154–161, #171–203

### C.1 AI Package

Before building the bot, populate the `packages/ai` package with the provider wrappers, prompt templates, and embedding function that both the bot and API will use.

**Provider wrappers:**

1. **Anthropic (Claude) wrapper** — A thin wrapper around the `@anthropic-ai/sdk` client. Provides a function that accepts a prompt (or message array) and returns the Claude response. Handles API key initialization, error handling, and retry logic. Claude is used for ALL reasoning tasks (summarization, classification, answer synthesis).

2. **OpenAI wrapper** — A thin wrapper around the `openai` SDK client. Provides a function to generate embeddings. OpenAI is used ONLY for embeddings — never for reasoning. Model: `text-embedding-3-small` (1536 dimensions).

**Prompt templates (functions, not hardcoded strings):**

3. **Summarize prompt** — Takes note title, original_content, source_type, and optionally user_note. Returns a prompt string that asks Claude to generate a 2-3 sentence summary. The summary should capture the core insight, not just describe what the content is about.

4. **Classify prompt** — Takes the user's full PARA tree (with bucket names, types, and UUIDs), the note's content/title/summary/source_type, and the user's user_note text. Returns a prompt string that asks Claude to:
   - Suggest which bucket this note belongs in (return the bucket UUID)
   - Provide a confidence score (0-1)
   - Suggest tags
   - Determine if this is an original thought vs external content
   - **Critical rule:** If the user provided context text (user_note), that context ALWAYS takes priority over content analysis. "For the perp book" means the note goes to the Perp Exchange Book bucket regardless of what the article is actually about.
   - The output must be parseable (JSON format in the response)

5. **User context extraction / metadata prompt** — Takes the raw message text and the PARA tree. Returns a prompt that asks Claude to separate the URL/content from the user's context text, and match any mentioned topics/projects to existing buckets.

**Embedding function:**

6. **Generate embedding** — Takes text input (title + content + user_note, concatenated), truncates to the model's token limit (8191 tokens for text-embedding-3-small), calls the OpenAI embeddings API, returns the 1536-dimensional vector.
   - Error handling: If the API call fails, return null (not throw). The caller decides what to do (the note gets saved without an embedding, which means it's still findable via full-text search).

**Update the barrel export** (`packages/ai/src/index.ts`) to re-export the public API.

### C.2 Bot Security / Auth Middleware

Every incoming Telegram message must be verified against the `telegram_links` table to identify the Second Brain user.

**Build a middleware that:**

1. Extracts the sender's `telegram_user_id` from the incoming grammY context
2. Looks up this ID in the `telegram_links` table using the service role Supabase client
3. If no match → reply with a message like: "I don't recognize this Telegram account. Connect it to your Second Brain at [WEB_APP_URL]." Stop processing.
4. If match → attach the `user_id` to the context and proceed to the next handler

**Performance:** Cache the telegram_user_id → user_id mapping in memory with a 5-minute TTL. This avoids a database query on every single message. Use a simple Map with timestamps, or a lightweight cache utility. Invalidate on unlink.

**This middleware runs on ALL message handlers and most command handlers** (except /start and /link, which need to work for unlinked users).

### C.3 Bot Commands

Update and build the following commands:

**`/start`** (UPDATE existing) — Currently says "Second Brain bot is running." Update to:

- If user is linked: "Welcome back! Send me anything — links, thoughts, images — and I'll save it to your second brain."
- If user is not linked: "Welcome! To get started, connect your Telegram account: 1) Go to [WEB_APP_URL]/settings 2) Click 'Connect Telegram' 3) Send me `/link YOUR_CODE`"

**`/link <CODE>`** (NEW) — Links a Telegram account to a Second Brain user.

- Parse the code from the command arguments
- If no code provided → "Please include your link code. Example: `/link A7K2M9`"
- Look up the code in link_codes table
- If code not found or already used → "Invalid code. Please generate a new one from [WEB_APP_URL]/settings"
- If code expired → "This code has expired. Please generate a new one."
- Check if this telegram_user_id is already linked → "This Telegram account is already linked to a Second Brain."
- If all valid → create telegram_links row, mark code as used
- Reply: "Your Telegram is connected! Send me anything and I'll save it to your second brain."

**`/help`** (NEW) — Show available commands and usage tips.

- List all commands with brief descriptions
- Include tips: "Just send me a link, thought, image, or voice memo. I'll save it and organize it for you."

### C.4 Message Type Detection

When a user sends a non-command message, the bot needs to determine what kind of content it contains.

**Detection logic (priority order):**

1. Check for attachments first: document → check if PDF; photo → image; voice → voice_memo; video → video (Phase E)
2. If no attachment, scan the message text for URLs
3. If URL found, classify by domain:
   - twitter.com or x.com → tweet (or thread if URL pattern suggests it)
   - instagram.com → reel
   - youtube.com or youtu.be → youtube
   - Any other URL → article
4. If no URL and no attachment → thought (plain text, original thought)

**Critical: URL + surrounding text separation.** A message like "https://some-article.com this is great for the perp book" contains BOTH:

- The URL (content to extract)
- Context text "this is great for the perp book" (user_note)

The detector must separate these. The URL goes to the content extractor. The surrounding text becomes `user_note` on the note.

**Forwarded messages:** Detect based on the forwarded content (check for URLs, attachments, etc.).

**Output of detection:** A structured object containing: detected source_type, the URL (if any), the user_note text (if any), and any attachments.

### C.5 Shared Extractor Output Shape

All content extractors (article, tweet, reel, YouTube, PDF, voice, image, plain text) must output a common shape — an `ExtractedContent` object containing: title, content (the main text), sourceType (NoteSource), source (the JSONB metadata object), and optionally thumbnailUrl and mediaUrls. Define this as a TypeScript interface in the bot codebase (or in a shared location if it makes sense).

**The `source` JSONB must follow the per-content-type structures defined in the spec (Section 1.2.4).** Reference table:

- **article:** `{ url, domain, thumbnail_url, author }`
- **tweet:** `{ url, domain: "x.com", author_handle }`
- **thread:** `{ url, domain: "x.com", author_handle, tweet_count }`
- **reel:** `{ url, domain: "instagram.com", thumbnail_url, media_description }`
- **youtube:** `{ url, domain: "youtube.com", thumbnail_url, channel }`
- **pdf:** `{ filename, page_count, storage_path }`
- **voice_memo:** `{ storage_path, duration_seconds }`
- **image:** `{ storage_path, media_description }`
- **thought:** `{}`
- **document:** `{ filename }`

Each extractor is responsible for populating its specific source JSONB according to this table.

### C.6 Web Article Extractor

For URLs classified as articles (anything that's not Twitter, Instagram, YouTube).

**Process:**

1. Fetch the HTML from the URL
2. Parse with jsdom to create a DOM
3. Run @mozilla/readability on the DOM
4. Extract: title, clean text content, author (if available), lead image URL

**Output:** An extracted content object with title, content, source_type: 'article', and source JSONB with url, domain, thumbnail_url, author.

**Error handling (each case needs a different user-facing message):**

- Fetch fails (network error) → "Couldn't load this page. Saved the URL."
- 404 response → "This link appears broken (404). Saved the URL anyway."
- Timeout (>10 seconds) → "The page took too long to load. Saved the URL."
- Readability fails (JS-rendered page, no content) → "Couldn't extract content from this page. Saved the URL."
- Paywall detected (very short content, known paywall domains) → "This might be behind a paywall. Saved what I could."

**In ALL error cases, the note still gets saved** — with the URL in the source JSONB, even if original_content is empty. The note ALWAYS gets saved. This is a core design principle.

### C.7 Plain Text Handler

When the user sends plain text with no URL or attachment.

**Behavior:**

- `original_content` = the message text
- `source_type` = 'thought'
- `is_original_thought` = true
- `source` = `{}` (empty JSONB)
- Title will be AI-generated during the classification step (first line or a short summary)

### C.8 AI Processing Pipeline

After content extraction, every note goes through the AI processing pipeline. This is the heart of the capture flow.

**Pipeline steps (run in parallel where possible):**

1. **Generate embedding** (OpenAI) — From the extracted title + content + user_note. This runs independently.

2. **Generate AI summary** (Claude) — From the extracted content. 2-3 sentences. This runs independently.

3. **Parse user context + classify into PARA** (Claude) — This needs the PARA tree (fetch once, cache), the content, and the user_note. Returns: suggested_bucket_id, confidence, reasoning, suggested_tags, is_original_thought.

**Steps 1, 2, and 3 can run in parallel.** They don't depend on each other.

**After all three complete:**

4. **Save the note to the database** — Combine all the extracted and processed data into a single note insert. Set:
   - title, original_content, source_type, source JSONB from extraction
   - ai_summary from step 2
   - embedding from step 1
   - user_note from message detection
   - Classification fields based on confidence:
     - Confidence >= 0.85 → set `bucket_id` to suggested bucket, `ai_suggested_bucket` to same, `is_classified = false` (user still confirms)
     - Confidence < 0.85 → set `ai_suggested_bucket` only, `bucket_id = NULL`
     - Confidence < 0.4 → set `ai_suggested_bucket = NULL`
   - tags from classifier
   - is_original_thought from classifier (or forced true for thoughts/voice_memos)
   - distillation_status = 'raw'
   - captured_at = now

5. **Detect connections** (runs AFTER note is saved, asynchronously) — Query the top 5 most similar notes by cosine distance (excluding the new note itself). For any with similarity > 0.78, create a note_connections row with type = 'ai_detected'. This runs in the background — the user gets their receipt immediately.

**Error handling at each step:**

- Embedding fails → save note without embedding (still findable via full-text search). The note should be flagged for retry — the daily connection re-detection job (Phase G.1) will attempt to generate embeddings for notes that are missing them.
- Summary fails → save note with ai_summary = NULL
- Classification fails → save note to inbox with ai_suggested_bucket = NULL
- **The note ALWAYS gets saved.** Partial AI processing failure never prevents the note from being captured.

### C.9 Receipt Message

After the note is saved, send a formatted receipt back to the user in Telegram.

**Format:**

```
Saved to Inbox

"[Title]"

Summary: [AI summary, 2-3 sentences]

Suggested: [bucket path, e.g., "Areas/DeFi/Protocol Research"]
Related: [N] notes on [topic]
Tags: #tag1 #tag2 #tag3

React with 👍 to confirm placement, or reply to adjust.
```

**Variations:**

- If no suggested bucket (low confidence): omit the "Suggested:" line, show "I'm not sure where this belongs."
- If no related notes: omit the "Related:" line
- If AI summary failed: show "Processing summary..." or a truncated original content snippet

**Before sending the receipt:** Send a typing indicator or a preliminary message like "Processing your capture..." so the user knows the bot received their message (the AI pipeline takes a few seconds).

### C.10 Receipt Interactions

**Thumbs-up reaction:** When the user reacts with 👍 to the receipt message:

- Set `is_classified = true` on the note
- Set `bucket_id = ai_suggested_bucket` (if it had a suggestion)
- Reply: "Classified to [bucket path]"
- If there was no suggestion, the thumbs-up is ignored (they need to reply with a bucket)

**Reply with correction:** When the user replies to the receipt message with text:

- Treat the reply text as new user_note/context
- Re-run the classification step with the additional context
- Update the note's ai_suggested_bucket and tags
- Send an updated receipt

### C.11 Telegram Link Edge Cases (Bot Side)

These edge cases are handled in the bot auth middleware and /link command:

- User sends /link without a code → "Please include your link code. Example: /link A7K2M9"
- Expired code → "This code has expired. Generate a new one at [WEB_APP_URL]/settings"
- Already linked Telegram account → "This Telegram account is already linked to a Second Brain."
- Unlinked user sends content (not /start or /link) → "I don't recognize this account. Connect at [WEB_APP_URL]/settings"

**Testing Phase C:**

- Start the bot, send /start as an unlinked user — verify it shows link instructions
- Link a Telegram account using a code — verify telegram_links row is created
- Send a URL to the bot — verify:
  - Article content is extracted
  - AI summary is generated
  - Embedding is generated
  - Classification is attempted
  - Note appears in the database with all fields populated
  - Receipt message is sent
- Send plain text — verify it's saved as a thought with is_original_thought = true
- React with 👍 — verify the note gets classified
- Send a URL with context text — verify the user_note is separated and influences classification

---

## Phase D: Frontend Integration

**Goal:** The web app shows real data from the API. Mock data is gone. Users can browse their knowledge base, process their inbox, view notes, and manage settings.

**Depends on:** Phase B

**Checklist items covered:** #74–79, #83–84, #87, #92–94, #204–246, #249

### D.1 Package Dependency Wiring

Add `@second-brain/shared` as a dependency in `apps/web/package.json`. This allows the frontend to import shared types directly.

### D.2 API Client

Build a thin API client wrapper that all frontend API calls go through.

**What it does:**

- Reads the API base URL from environment (`VITE_API_URL`, defaults to `http://localhost:3001`)
- For every request, reads the current Supabase session JWT from the auth store and attaches it as `Authorization: Bearer <token>`
- Provides typed methods or a generic fetch wrapper
- Handles common error patterns (401 → redirect to login, network errors → show error toast)

**Decision for implementer:** Decide whether to use raw fetch, a library like ky, or TanStack Query's fetch wrapper. CLAUDE.md says "API calls go through typed hook wrappers (e.g., TanStack Query), never raw fetch in components." The web app already has TanStack dependencies available. Consider using TanStack Query for data fetching with the API client as the underlying fetcher.

### D.3 Type Migration

Replace the frontend's local types with shared types from `@second-brain/shared`.

**What to do:**

1. Update `apps/web/src/lib/types.ts` — Replace local type definitions with re-exports from `@second-brain/shared`. Keep this file as a convenience re-export so components don't need to import from the package path directly.
2. Delete the old type definitions (ParaBucket, Note, InboxItem from the current types.ts)
3. Update every component that imports types to use the new shapes

**Key field mapping changes that will affect components:**

- `Note.excerpt` → No longer a field. Compute from: `distillation || ai_summary || original_content?.slice(0, 200)`
- `Note.bucketName` / `Note.bucketType` → replaced by `bucket_path` (string like "Areas/DeFi")
- `Note.sourceDomain` → `source.domain` (JSONB access)
- `Note.capturedAt` (camelCase) → `captured_at` (snake_case from API)
- `InboxItem.suggestedBucket` (string) → `ai_suggested_bucket_path` (string)
- `InboxItem.summary` → `ai_summary`
- `ParaBucket.noteCount` → `note_count`

**Remove the env variable `TELEGRAM_ALLOWED_USER_ID`** from `.env.example` (item #249).

### D.4 Delete Mock Data

Delete `apps/web/src/lib/mock-data.ts` entirely. All data will come from the API.

### D.5 Update SourceIcon Component

Add the missing source types to `SourceIcon.tsx`. Currently handles 7 types. Needs to handle all 11:

- Add: `thread` (MessageSquare icon), `youtube` (Play icon), `image` (Image icon), `other` (Paperclip icon)

### D.6 Dashboard Data Wiring

Update `Home.tsx` (the dashboard page) to fetch from `GET /api/dashboard` instead of using mock data.

**Changes needed:**

- Fetch dashboard data on mount (or use TanStack Query)
- Pass real data to InboxPulse, NoteGrid, and AreaCard components
- Handle loading state (skeleton or spinner while data loads)
- Handle error state (show error message if API fails)
- Handle empty state (new user with no notes)

**Update each dashboard component for the new data shapes:**

- `InboxPulse.tsx` — Wire up the "Confirm" button to call `POST /api/inbox/:noteId/classify` with the suggested bucket. Wire up "Change" to open the ParaPicker (from D.11). When confirmed, animate the card out and decrement the count.
- `InboxCard.tsx` — Update props to match `DashboardInboxItem` shape (ai_suggested_bucket_path instead of suggestedBucket, etc.)
- `NoteCard.tsx` — Update props to match `DashboardNote` shape
- `NoteGrid.tsx` — Accept real data, handle empty state
- `AreaCard.tsx` — Update props to match `DashboardArea` shape (note_count, last_capture_at, health, children)

### D.7 Left Rail PARA Tree

Update `LeftRail.tsx` to fetch the PARA tree from `GET /api/para/tree` instead of mock data.

**Changes:**

- Fetch PARA tree on mount
- Render the tree dynamically (currently it's hardcoded mock sections)
- Show real inbox count badge (from the dashboard data or a separate count)
- Wire up the "+" buttons on section headers to create new buckets (calls `POST /api/para/buckets`)
- Clicking a bucket navigates to `/para/:bucketId`

### D.8 New Routes

Add the following routes to `App.tsx`:

- `/inbox` → Inbox view
- `/para/:bucketId` → PARA Bucket view
- `/notes/:noteId` → Note detail view
- `/settings` → Settings page
- `/search` → Search view (or this could be a Cmd+K modal overlay instead of a route)

All new routes should be wrapped in `ProtectedRoute` (already exists).

### D.9 ParaPicker Component

Build a reusable ParaPicker component used whenever the user needs to classify or move a note.

**Appearance:** A dropdown/popover showing the full PARA tree.
**Features:**

- Searchable — type to filter the tree
- Click to select a bucket
- "New Project" / "New Area" at the bottom for inline creation
- Used in: InboxCard confirm, InboxQueue change, Note detail reclassify, batch actions

### D.10 Inbox View

Build the full inbox processing interface with two sub-modes.

**Queue Mode (default):**

- Shows one inbox item at a time, large and readable
- Displays: source type indicator, title (large), AI summary, full original content (collapsible), source metadata, AI-suggested tags, related notes from knowledge base
- Action bar at bottom: Confirm (with suggested bucket), Change (opens ParaPicker), Archive, Delete
- Progress indicator at top ("3 of 12")
- Keyboard shortcuts: Enter/→ = Confirm, Tab = Change, A = Archive, D = Delete (with confirmation), ← = Previous
- When confirming, the next item slides in smoothly
- When all items are processed, show empty state

**List Mode:**

- Toggle at top to switch between Queue and List
- Traditional list showing all inbox items as rows
- Columns: title, AI summary snippet, suggested classification, date captured, source type icon
- Checkboxes for multi-select
- When items are selected, show a batch action bar: "Confirm all as [suggested]", "Move all to...", "Archive all", "Delete all"

**Empty State:** When inbox is at 0:

- Clean illustration/icon
- "You're all caught up."
- "Items you capture via Telegram will appear here."

### D.11 PARA Bucket View

Build the view for browsing notes within a specific bucket.

**Layout:** Stacked vertically — bucket header with stats → sort/filter bar → note grid

**Bucket header:**

- Bucket name and type (e.g., "DeFi · Area")
- Stats: note count, distilled count, evergreen count
- Children sub-buckets (clickable to navigate)

**Sort bar:** Dropdown with options: Recent (default), Last opened, By distillation status, By connections, Alphabetical

**Filter chips:** Toggleable filters for content type (All, Articles, Tweets, etc.), distillation status (All, Raw, Key Points, Distilled, Evergreen), and date range (All time, This week, This month, Last 3 months)

**Scoped search:** A search bar that searches only within this bucket. For MVP, this can filter the current results client-side. Full scoped search (with the hybrid_search function) comes in Phase F.

**Note grid:** Responsive grid of note cards (3 columns on wide, 2 medium, 1 narrow). Each card shows title, excerpt, distillation status dot, capture date, source icon, connection count. Click opens Note detail view.

### D.12 Note Detail View

Build the full note detail view with a context panel.

**Main content area (left):**

The content display varies based on distillation status:

- **Raw:** Show AI summary prominently at top, then full original content below
- **Key Points:** Show key points as bullet list, then original content in a collapsible section
- **Distilled/Evergreen:** Show distillation text prominently, then original content collapsed

**Header:**

- Title (editable — click to edit, save on blur/enter)
- Source line: "[source icon] [source domain/URL] · Captured: [date]"
- PARA location as breadcrumb tag (clickable to navigate, editable via ParaPicker to reclassify)
- Tags row (AI-generated chips, editable — add with "+", remove with "×")

**Distillation bar:** A horizontal progress indicator showing the 4 stages (Raw → Key Points → Distilled → Evergreen). The current stage is highlighted. Clicking a stage is a no-op for now (Distillation Mode is Phase G).

**Context panel (right, collapsible):**

- **Related Notes:** AI-detected similar notes with title, similarity indicator, bucket path. "Link this" action to create explicit connection.
- **Backlinks:** Notes that link TO this note
- **Source Metadata:** Original URL (clickable), author, date captured, content type

### D.13 Settings Page

Build a settings page accessible from the left rail or user menu.

**Telegram Connection section:**

- If not linked: Show "Connect Telegram" button
  - On click: call `POST /api/link-code` to generate a code
  - Display the code prominently with instructions: "Send `/link [CODE]` to @SecondBrainBot on Telegram"
  - Poll `GET /api/link-status` every 3-5 seconds until linked, then update the UI
- If linked: Show "Connected as @[telegram_username]" with a "Disconnect" button
  - Disconnect calls the API to delete the telegram_links row

### D.14 Supabase Realtime

Set up Supabase Realtime subscriptions for live updates.

**Subscribe to:**

- `notes` table: INSERT events where `is_classified = false` → update inbox count on dashboard and left rail badge
- `notes` table: UPDATE events where `is_classified` changes → update inbox displays

**Where:** In a custom hook or in the dashboard/layout components. Subscribe on mount, unsubscribe on unmount.

### D.15 UI Polish

**Breadcrumb navigation:** Add a breadcrumb trail at the top of the main content area showing the current location (e.g., "Dashboard > Areas > DeFi > [Note title]"). Each segment is clickable.

**Toast notifications:** Add a toast system for action feedback:

- "Note saved to Areas/DeFi" (after classifying)
- "3 notes archived"
- "Note deleted"
- Include "Undo" action where applicable (classify, archive)
- Toast appears in bottom-right, auto-dismiss after 3-4 seconds

**Cmd+K search shortcut:** Register a global keyboard listener for Cmd+K (or Ctrl+K) that opens the search modal. Show a subtle "⌘K" hint next to the Search item in the left rail.

**Testing Phase D:**

- Full user flow: sign up → see empty dashboard → connect Telegram → capture content via bot → see it appear on dashboard → classify from inbox → browse in PARA view → view note detail
- Test all CRUD operations: create/rename/delete buckets, classify/archive/delete notes
- Test real-time: capture a note via bot while dashboard is open, verify inbox count updates
- Test ParaPicker in all contexts (inbox card, queue mode, note detail)
- Test keyboard shortcuts (Cmd+K, inbox queue shortcuts)
- Test empty states and error states

---

## Phase E: Additional Bot Extractors

**Goal:** The bot handles all content types, not just text and articles.

**Depends on:** Phase C

**Checklist items covered:** #150–153, #162–170

### E.1 Tweet/Thread Extractor

**Challenge:** Twitter/X API access is unreliable and expensive. This extractor needs a scraping approach.

**Research task:** Investigate current options for extracting tweet content programmatically. Options include:

- `rettiwt-api` — a reverse-engineered Twitter API library
- Nitter instances — alternative Twitter frontends that can be scraped
- Custom scraping solution
- FXTwitter/FixupX API — community APIs that provide tweet data

**What to extract:** Tweet text, author handle, author display name, media URLs (images/videos), thread content (for multi-tweet threads), engagement metrics (optional).

**Thread detection:** If the URL points to a tweet that's part of a thread (multiple tweets by the same author in reply to themselves), extract the full thread and store the combined text.

**Source JSONB:** `{ url, domain: "x.com", author_handle, tweet_count (for threads) }`

**Fallback:** If extraction fails entirely, store the URL only and tell the user: "Couldn't extract tweet content. Saved the link."

### E.2 Instagram Reel Extractor

**Tool:** `yt-dlp` (CLI tool) — call via `Bun.spawn()` or Node.js child_process.

**Process:**

1. Run `yt-dlp --dump-json <url>` to get metadata (title, description, thumbnail URL, channel)
2. Download the thumbnail
3. Store thumbnail in Supabase Storage
4. Optionally: send the thumbnail to Claude Vision API for a content description (useful since reel content is visual)

**Source JSONB:** `{ url, domain: "instagram.com", thumbnail_url (storage path), media_description (from Vision API) }`

**Fallback:** If yt-dlp fails, store URL only.

### E.3 YouTube Extractor

**Tool:** `yt-dlp`

**Process:**

1. Run `yt-dlp --dump-json <url>` to get metadata
2. Extract: title, description, channel name, thumbnail URL
3. If subtitles/captions are available, extract them as transcript text
4. Store transcript as original_content (this makes the video's content searchable)

**Source JSONB:** `{ url, domain: "youtube.com", thumbnail_url, channel }`

**Note:** The transcript can be very long. Consider truncating to a reasonable length for the embedding input.

### E.4 PDF Extractor

**Library:** `pdf-parse`

**Process:**

1. Download the PDF from Telegram (grammY provides file download helpers)
2. Store the original PDF in Supabase Storage (`user-content/{user_id}/{note_id}/{filename}`)
3. Extract text using pdf-parse
4. If text extraction yields very little content → the PDF may be scanned images. Flag to user: "This PDF appears to be scanned images. Saved the file but couldn't extract text."

**Source JSONB:** `{ filename, page_count, storage_path }`

### E.5 Voice Memo Transcription

**Service:** OpenAI Whisper API

**Process:**

1. Download the voice message from Telegram (.ogg format)
2. Store the audio file in Supabase Storage
3. Send to Whisper API for transcription
4. Set `original_content` = transcription text
5. Auto-set `is_original_thought = true` (voice memos are personal thoughts)

**Source JSONB:** `{ storage_path, duration_seconds }`

**Error handling:** If Whisper fails, store the audio file and tell the user: "Couldn't transcribe your voice memo. Saved the audio file."

### E.6 Image Description

**Service:** Claude Vision API

**Process:**

1. Download the image from Telegram
2. Store in Supabase Storage
3. Send to Claude Vision with a prompt like: "Describe this image in detail. What does it show? What text is visible?"
4. Set `original_content` = Claude's description
5. Title = AI-generated from the description

**Source JSONB:** `{ storage_path, media_description (from Vision) }`

### E.7 Remaining Bot Commands

**`/inbox`** — Show inbox status.

- Reply with: "You have [N] items in your inbox."
- Show the last 3 items (title, source type, when captured)
- Include a link to the web app inbox view

**`/search <query>`** — Quick semantic search.

- Generate embedding for the query
- Find top 3 most similar notes
- Reply with: title, 1-line excerpt, bucket path for each
- Include a link to the full search in the web app

**`/new project <name>`** / **`/new area <name>`** — Create new PARA buckets.

- Parse the bucket name from the command arguments
- Create a new para_buckets row as a child of the appropriate top-level container (Projects or Areas)
- Reply: "Created project '[name]'" or "Created area '[name]'"

**Testing Phase E:**

- Send each content type to the bot: tweet URL, Instagram reel URL, YouTube URL, PDF file, voice memo, image
- Verify correct extraction for each type
- Verify graceful fallbacks when extraction fails
- Test /inbox, /search, and /new commands
- Verify all content types show up correctly in the web app

---

## Phase F: Search

**Goal:** Hybrid search works end-to-end. Users can search their knowledge base in Notes mode (browse results) and Answer mode (AI-synthesized answer).

**Depends on:** Phase B (API endpoints), Phase C (notes with embeddings in the database)

**Checklist items covered:** #125–128, #200, #237–241

### F.1 Answer Synthesis Prompt

Build the answer synthesis prompt template in `packages/ai/src/prompts/answer.ts`.

**Input:** The user's query, an array of search results (with titles, content, summaries, distillations, is_original_thought flags), and optionally the PARA tree for context.

**Output prompt asks Claude to:**

- Synthesize a coherent answer from the user's notes
- Write in second person ("Your understanding of...", "Your most developed thinking is on...")
- Use numbered citations [1], [2], [3] referencing specific notes
- Distinguish between the user's original thoughts and external captures (original thoughts carry more weight)
- Identify gaps: if the user's knowledge base doesn't fully answer the question, explicitly say what's missing
- Handle edge cases: no relevant notes, sparse results, cross-area discoveries

**Response format:** The Claude response must be parseable — the text with citations, plus structured citation data (which note each [N] refers to), plus an array of identified gaps.

### F.2 Search API Endpoint

`POST /api/search` — The central search endpoint.

**Request body:** SearchRequest (query, mode: 'notes' | 'answer', optional filters, optional limit)

**Notes mode flow:**

1. Generate an embedding for the query text using OpenAI
2. Call the `hybrid_search()` Postgres function with: the query text (for keyword matching), the query embedding (for semantic matching), the user_id, and any filters
3. For each result, compute an excerpt: prefer distillation > ai_summary > truncated original_content (first 200 chars)
4. Return SearchNotesResponse (results array with id, title, excerpt, source_type, source, distillation_status, bucket_id, bucket_path, captured_at, connection_count, similarity, rank_score)

**Answer mode flow:**

1. Run the same hybrid search as Notes mode, but fetch top 15 results
2. Send the results to Claude using the answer synthesis prompt (F.1)
3. Parse Claude's response to extract:
   - The answer text with inline [N] citations
   - Citation mapping (which [N] maps to which note_id)
   - Knowledge gaps
4. Return SearchAnswerResponse (answer text, citations array, gaps array, source_notes array)

**Search logging:** After returning results, insert a row into search_log with the query, mode, and result count. This can run asynchronously (don't block the response).

### F.3 Search Modal UI

Build the search modal, accessible via Cmd+K from anywhere in the app.

**Layout:** An overlay modal (centered, ~65% width, ~80% height). Background dims. Focus immediately in the search input.

**Two tabs:** "Notes" and "Answer" at the top of the results area.

**Notes mode display:** A list of results, each showing:

- Source icon + title (bolded)
- 2-line excerpt with matched terms highlighted
- Metadata row: distillation status dot, PARA location tag, capture date, connection count
- Click to open note detail view

**Answer mode display:**

- Loading state: step-by-step progress ("Searching your knowledge base...", "Found N relevant notes", "Synthesizing across M sources...")
- Answer text with inline [N] citations (clickable — navigate to the cited note)
- Source notes list below the answer (clickable)
- Action buttons: "Open sources"

**Filter chips:** Below the search input, filters for content type, PARA bucket, time range, distillation status.

**Keyboard navigation:** Arrow keys to move through results, Enter to open.

**Automatic mode detection:** If the query reads like a question ("what do I know about...", "how does..."), auto-select the Answer tab. If it reads like keywords, auto-select Notes. User can always switch manually.

**Testing Phase F:**

- Search for content that exists → verify results appear ranked correctly
- Test with filters → verify they narrow results
- Test Answer mode → verify synthesized answer with correct citations
- Test with no results → verify empty state message
- Test Cmd+K → verify modal opens from any view
- Test keyboard navigation in search results

---

## Phase G: Background Jobs (Lower Priority)

**Goal:** Automated maintenance tasks that run periodically.

**Depends on:** Phase B, Phase C

**Checklist items covered:** #254–256

### G.1 Connection Re-detection

**Frequency:** Daily (or triggered manually)

**What it does:**

1. Find notes that have no embedding (embedding generation failed during capture)
2. Attempt to generate embeddings for them
3. For notes that get new embeddings, scan for connections with existing notes
4. Also useful as the knowledge base grows — new notes may connect to old ones that weren't similar enough before

**Implementation:** A function in the API that can be called via a cron endpoint or a scheduled task. For MVP, this can be a simple `GET /api/admin/reindex` endpoint (protected by a secret or admin auth).

### G.2 Organization Suggestions

**Frequency:** Daily

**What it does:**

1. For buckets with 30+ notes, run embedding clustering analysis and suggest splits if distinct clusters emerge
2. Check for stale projects (6+ weeks with no new captures) → suggest archiving
3. Check for notes that might fit better in recently created sub-buckets → suggest reclassification

**Output:** Insert rows into the `suggestions` table, which are surfaced via `GET /api/suggestions`.

### G.3 Link Code Cleanup

**Frequency:** Hourly

**What it does:** Delete expired, unused link_codes older than 1 hour. Simple cleanup to prevent table bloat.

---

## Validation Notes

### Checklist Coverage

Every checklist item (1–256) is addressed in this plan:

- Phase A: #1–73, #135, #143, #250–253
- Phase B: #80–82, #95–124, #129–134, #136–142, #247–248
- Phase C: #85–86, #88–91, #144–149, #154–161, #171–203
- Phase D: #74–79, #83–84, #87, #92–94, #204–246, #249
- Phase E: #150–153, #162–170
- Phase F: #125–128, #200, #237–241
- Phase G: #254–256

### Items Explicitly Not in This Plan (Post-Phase 1)

Checklist items #257–273 are Phase G+ features documented in the checklist but NOT part of this implementation plan:

- Distillation mode (split-screen editor)
- Synthesis flow (save to knowledge base)
- Graph view
- Review dashboard
- "Ask about this note" feature
- PARA bucket Index Card (AI-generated overview)
- Mini-graph toggle
- Drag and drop reordering
- Search follow-up questions
- Smart batch detection
- Responsive mobile layout

These are documented for future planning but are explicitly out of scope.

---

_Implementation Plan v1.0_
_Created: February 19, 2026_
_Phases: A through G (7 phases)_
_Checklist items covered: 256 of 256 in-scope items_
