# Problem 1: Bot-to-Database Pipeline — Implementation Plan

## Master Checklist

- [x] A.1 — Add source_url migration
- [x] A.2 — Add source_url to Note type and CreateNoteInput
- [x] A.3 — Create dedup query function
- [x] A.4 — REFACTOR: Clean up A.1-A.3
- [x] B.1 — Create URL normalization utility
- [x] B.2 — Create content hash utility
- [x] B.3 — REFACTOR: Clean up B.1-B.2
- [x] C.1 — Add dedup check to saveNote
- [x] C.2 — Handle dedup in processNote and executeSaveNote
- [x] C.3 — Handle unique constraint violation gracefully
- [x] C.4 — REFACTOR + REVIEW: Phase C Complete
- [x] D.1 — Create update tracker
- [x] D.2 — Create per-user lock
- [x] D.3 — Integrate update tracker and user lock into agent handler
- [x] D.4 — REFACTOR: Clean up D.1-D.3
- [x] E.1 — Update detectMessageType to return all URLs
- [x] E.2 — Update agent handler for multi-link dispatch
- [x] E.3 — Update process-in-background for multi-link
- [x] E.4 — Update ChatResponse type for dedup awareness
- [x] E.5 — Build aggregated confirmation message formatter
- [x] E.6 — REFACTOR + REVIEW: Phase E Complete
- [x] F.1 — Remove duplicate URL_REGEX definitions
- [x] F.2 — REFACTOR + REVIEW: Problem 1 Complete

---

## Phase A: Database Foundation

The database is the last line of defense. Before adding any dedup logic at upper layers, we need the `source_url` column, the unique partial index, and a dedup query function. Everything else builds on this.

### A.1 — Add source_url migration

Create `supabase/migrations/00011_add_source_url.sql`. This migration:

1. Adds a `source_url TEXT` column to the `notes` table
2. Backfills existing notes by extracting `source->>'url'` where it exists and is non-empty
3. Creates a partial unique index `idx_notes_user_source_url` on `(user_id, source_url) WHERE source_url IS NOT NULL`
4. Adds a regular index for fast lookups during dedup checks

This is the safety net — even if all application-level dedup fails, the database won't accept two notes with the same URL for the same user.

Commit: "add source_url column and unique partial index to notes"

### A.2 — Add source_url to Note type and CreateNoteInput

Update the `Note` interface in `packages/shared/src/types/entities.ts` to include `source_url: string | null`. Update `CreateNoteInput` in `packages/db/src/queries/notes.ts` to accept an optional `source_url` field. This lets the pipeline explicitly set the source URL at creation time rather than relying on the JSONB `source` field.

Commit: "add source_url field to Note type and CreateNoteInput"

### A.3 — Create dedup query function

Create `packages/db/src/queries/dedup.ts` with two functions:

1. `findExistingNoteByUrl(userId: string, sourceUrl: string): Promise<Note | null>` — queries for an existing note with the same `source_url` for the given user. No time window — the unique constraint handles all-time dedup. Returns the existing note if found.

2. `findExistingNoteByContentHash(userId: string, contentHash: string, windowMinutes: number): Promise<Note | null>` — queries for an existing note with the same content hash within a time window. For non-URL content (thoughts, voice memos).

Export both from `packages/db/src/index.ts`.

Commit: "add dedup query functions for URL and content hash"

### A.4 — REFACTOR: Clean up A.1-A.3

Review files created/modified in A.1-A.3. Check file lengths. Verify the migration is clean SQL. Verify the types are consistent across `packages/shared` and `packages/db`. Run tree on affected directories.

Commit: "refactor database foundation for dedup"

---

## Phase B: URL Parsing & Normalization

A shared URL normalization utility that both the bot (multi-link extraction) and the API (dedup comparison) use. Without normalization, `https://example.com/article?utm_source=twitter` and `https://example.com/article` would be treated as different URLs.

### B.1 — Create URL normalization utility

Create `packages/shared/src/utils/normalize-url.ts` with a `normalizeUrl(url: string): string` function that:

- Lowercases the hostname
- Removes `www.` prefix
- Strips known tracking parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ref`, `fbclid`, `gclid`, `mc_cid`, `mc_eid`
- Strips trailing slashes from the path
- Sorts remaining query parameters alphabetically
- Returns the cleaned URL string

Also create a `extractUrlsFromText(text: string): string[]` function that extracts all URLs from text using regex, normalizes each one, and returns the array. This replaces the scattered `URL_REGEX` matches throughout the codebase.

Export from `packages/shared/src/utils/index.ts` and `packages/shared/src/index.ts`.

Commit: "add URL normalization and extraction utilities"

### B.2 — Create content hash utility

Create `packages/shared/src/utils/content-hash.ts` with a `computeContentHash(content: string): string` function that:

- Takes the first 500 characters of the content
- Computes a SHA-256 hash
- Returns the hex string

This is used for thought/voice memo dedup where there's no URL to compare.

Export from `packages/shared/src/utils/index.ts`.

Commit: "add content hash utility for non-URL dedup"

### B.3 — REFACTOR: Clean up B.1-B.2

Review the shared utils. Verify they're pure functions with no runtime dependencies. Verify exports are clean. Check file lengths. Run tree on `packages/shared/src/utils/`.

Commit: "refactor URL and content hash utilities"

---

## Phase C: API-Level Dedup

Modify the note saving pipeline to check for duplicates before creating a new note. This is the primary defense — catches duplicates from any source (bot, web, future clients). The dedup check runs BEFORE the expensive summarize/classify/embed pipeline when possible, and as a final gate before `createNote()` in all cases.

### C.1 — Add dedup check to saveNote

Modify `apps/api/src/services/processors/save-note.ts`:

1. Extract the source URL from `extracted.source` (the `url` property exists on ArticleSource, TweetSource, etc.)
2. Normalize it using `normalizeUrl()` from Phase B
3. Before calling `createNote()`, call `findExistingNoteByUrl(userId, normalizedUrl)`
4. If an existing note is found, return it directly without creating a new row — set a `deduplicated: true` flag on the result
5. If no existing note found, include `source_url: normalizedUrl` in the `createNote()` input
6. For non-URL content (thoughts, voice memos), compute content hash and call `findExistingNoteByContentHash()` with a 5-minute window

The `SaveNoteResult` interface needs a `deduplicated` boolean field so callers know the note already existed.

Commit: "add dedup check to note saving pipeline"

### C.2 — Handle dedup in processNote and executeSaveNote

Modify `apps/api/src/services/processors/process-note.ts` to propagate the `deduplicated` flag from `saveNote()` through `ProcessedNote`. When `deduplicated` is true, skip the fire-and-forget steps (detect connections, trigger reorganization) — they already ran for this note.

Modify `apps/api/src/services/tools/save-note.ts` (`executeSaveNote`) to propagate the `deduplicated` flag through `SaveNoteResult`. The agent LLM will see this in the tool response and can craft an appropriate message ("already captured" instead of "captured").

Commit: "propagate dedup flag through note processing pipeline"

### C.3 — Handle unique constraint violation gracefully

Modify `packages/db/src/queries/notes.ts` to catch unique constraint violations on `createNote()`. If the error message indicates a unique violation on `idx_notes_user_source_url`, query for the existing note and return it instead of throwing. This handles the race condition where the application-level check passes but two concurrent inserts hit the DB simultaneously.

Commit: "handle unique constraint violation gracefully in createNote"

### C.4 — REFACTOR + REVIEW: Phase C Complete

Review ALL files created/modified in Phase C. Verify:

- Every file does one thing and is under 120 lines
- The dedup flow is clear: check URL → check content hash → create note
- The deduplicated flag propagates cleanly through all layers
- No dead code, no commented-out code
- Run tree on affected directories

Commit: "finalize phase C — API-level dedup"

---

## Phase D: Bot-Level Idempotency

Prevent duplicate processing at the bot level. This is the cheapest defense — catches grammY re-deliveries and prevents wasted LLM calls. Two components: update_id tracking and per-user request serialization.

### D.1 — Create update tracker

Create `apps/bot/src/handlers/update-tracker.ts` with:

- `hasProcessed(updateId: number): boolean` — returns true if this update_id was seen recently
- `markProcessed(updateId: number): void` — marks this update_id as processed
- Internal: a Map<number, number> (updateId → timestamp) with lazy cleanup of entries older than 10 minutes

The pattern follows the existing `receipt-store.ts` and `user-cache.ts` in-memory stores.

Commit: "add update ID tracker for bot idempotency"

### D.2 — Create per-user lock

Create `apps/bot/src/handlers/user-lock.ts` with:

- `withUserLock<T>(userId: string, fn: () => Promise<T>): Promise<T>` — serializes execution per user
- Internal: a Map<string, Promise<void>> where each user's current Promise chains sequentially
- Timeout: if a lock holder takes more than 60 seconds, the next message proceeds anyway (log a warning)

This prevents concurrent agent instances for the same user. If user sends 3 messages rapidly, they queue and execute one at a time.

Commit: "add per-user request serialization lock"

### D.3 — Integrate update tracker and user lock into agent handler

Modify `apps/bot/src/handlers/agent-handler.ts`:

1. At the very top: check `hasProcessed(ctx.update.update_id)`. If true, return silently.
2. Call `markProcessed(ctx.update.update_id)`.
3. Wrap the entire handler body in `withUserLock(userId, async () => { ... })`.

The handler now: checks for duplicate update → acquires user lock → processes message → releases lock. Messages from different users still run concurrently. Messages from the same user are serialized.

Commit: "integrate update tracking and user lock into agent handler"

### D.4 — REFACTOR: Clean up D.1-D.3

Review files created/modified. Verify the update tracker and user lock match the existing in-memory store patterns (receipt-store, user-cache). Check that the agent handler is clean and under line limits. Run tree.

Commit: "refactor bot-level idempotency"

---

## Phase E: Multi-Link Handling

Change the bot to detect all URLs in a message and process each one independently. This fixes the data loss where only the first URL was saved.

### E.1 — Update detectMessageType to return all URLs

Modify `apps/bot/src/telegram/detect-message-type.ts`:

1. Add a new `DetectedMessages` type that wraps one or more `DetectedMessage` items
2. In the URL detection section, collect ALL urls from the regex match
3. Normalize each URL using `normalizeUrl()` from `packages/shared`
4. Return all of them — each as a separate `DetectedMessage` with the shared `userNote`
5. Keep the single-return interface for non-URL messages (attachments, thoughts)

The function signature changes from returning `DetectedMessage` to returning `DetectedMessage | DetectedMessage[]` (or a wrapper type). Callers need to handle the array case.

Commit: "detect all URLs in multi-link messages"

### E.2 — Update agent handler for multi-link dispatch

Modify `apps/bot/src/handlers/agent-handler.ts` to handle multi-link messages:

1. After detecting message type, check if the result is an array (multi-link)
2. If single link/attachment/thought: existing flow (unchanged)
3. If multi-link:
   a. Send ack: "on it — processing N links"
   b. For each URL: build a separate ChatRequest and call `sendChatMessage()` sequentially (within the user lock, so they don't interleave with other messages)
   c. Collect all results (successes, failures, dedup hits)
   d. Build an aggregated confirmation message
   e. Send the aggregated message

The aggregated confirmation format:
```
captured 3 links:
→ "Title 1" → Bucket A (suggested)
→ "Title 2" → inbox
→ "Title 3" — already captured
```

For any that failed:
```
→ "https://broken.url" — couldn't process
```

Commit: "handle multi-link messages with per-URL dispatch"

### E.3 — Update process-in-background for multi-link

Modify `apps/bot/src/handlers/process-in-background.ts` to accept an optional array of URLs for multi-link processing. The background processor already handles single messages — extend it to loop over URLs and aggregate results. The typing indicator continues through all URL processing.

Commit: "extend background processor for multi-link messages"

### E.4 — Update ChatResponse type for dedup awareness

Modify `packages/shared/src/types/chat.ts` to add a `deduplicated?: boolean` field to `ChatResponse`. When the API returns a deduplicated response, the bot can include "already captured" in the confirmation instead of "captured."

Also update `apps/api/src/routes/chat.ts` to pass through the deduplicated flag from the agent result.

Commit: "add dedup awareness to chat response type"

### E.5 — Build aggregated confirmation message formatter

Create `apps/bot/src/telegram/format-multi-link-result.ts` that takes an array of results (success with title/bucket, dedup hit, or failure) and formats them into the multi-link confirmation message. This keeps the formatting logic out of the agent handler.

Commit: "add multi-link confirmation message formatter"

### E.6 — REFACTOR + REVIEW: Phase E Complete

Review ALL files created/modified in Phase E. Verify:

- Every file does one thing and is under 120 lines
- Multi-link dispatch is clean and handles errors per-URL
- The confirmation messages are well-formatted
- No dead code from the old single-URL path
- Run tree on both `apps/bot/src/` and `packages/shared/src/`
- detectMessageType still works for single URLs, attachments, and thoughts

Commit: "finalize phase E — multi-link handling"

---

## Phase F: Final Integration & Cleanup

### F.1 — Remove duplicate URL_REGEX definitions

The codebase has `URL_REGEX` defined in multiple files: `detect-message-type.ts`, `needs-async.ts`, `save-note.ts` (tool). Replace all of them with the shared `extractUrlsFromText()` utility from Phase B. Each file should import from `@second-brain/shared` instead of defining its own regex.

Commit: "consolidate URL regex into shared utility"

### F.2 — REFACTOR + REVIEW: Problem 1 Complete

Final review of everything touched in this problem:

- Run tree on the entire codebase, compare to the state at the start
- Verify all new files follow naming conventions (kebab-case)
- Verify all new functions have explicit return types
- Verify no `any` types were introduced
- Check that the dedup pipeline is coherent end-to-end: bot (update tracking + user lock) → API (URL/content hash dedup) → DB (unique constraint)
- Verify multi-link flow works: detect all URLs → dispatch per URL → aggregate results → send confirmation
- Run typecheck
- Run lint

Commit: "finalize problem 1 — bot-to-database pipeline reliability"
