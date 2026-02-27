# Issues Checklist

70 issues total across 3 audit reports. Duplicates across reports merged.

---

## Backend (API, Services, Database)

### Critical

- [x] `countNotesByBucket` fetches every note row into JS to count — should use SQL `GROUP BY` (`packages/db/src/queries/note-stats.ts:3`)
- [x] `buildDashboardRecent` issues up to 15 sequential `getNoteById` queries in a loop — should batch-fetch (`apps/api/src/services/dashboard/build-dashboard-content.ts:51-65`)
- [x] `ensureDefaultBuckets` middleware uses `.then()` with no `.catch()` — any Supabase error hangs all authenticated requests forever (`apps/api/src/middleware/ensure-buckets.ts:20-42`)

### High

- [x] `batchClassify` sends individual UPDATE queries in a loop instead of batching by `bucket_id` (`packages/db/src/queries/inbox.ts:67-76`)
- [x] `reevaluateInbox` makes up to 20 sequential LLM calls, re-fetching identical bucket/sample data each time (`apps/api/src/services/processors/reevaluate-inbox.ts:21-42`)
- [x] `detectConnections` creates connections sequentially instead of with `Promise.all` (`apps/api/src/services/processors/detect-connections.ts:18-20`)
- [x] `buildNoteRelations` has N+1 sequential `getNoteById` calls per connection (`apps/api/src/services/notes/build-note-relations.ts:26-53`)
- [x] `deleteBucket` runs one UPDATE per descendant bucket instead of using `.in()` (`packages/db/src/queries/para.ts:73-79`)
- [x] `buildDashboardAreas` calls `getBucketStats` (2 queries) per child bucket — should use pre-fetched data (`apps/api/src/services/dashboard/build-dashboard-areas.ts:20-27`)
- [x] `incrementViewCount` does read-then-write instead of atomic increment — race condition and wasted round-trip (`packages/db/src/queries/views.ts:36-53`)
- [x] `SummarizeResult` type referenced but never defined — should fail TypeScript compilation (`apps/api/src/services/processors/summarize-content.ts:33`)
- [x] `summarizeContent` returns `{ title, summary }` object but callers expect `string` — summaries stored as `[object Object]` (`apps/api/src/services/processors/summarize-content.ts:13-31`)
- [x] No request body size limit set — pre-extracted content over 100KB silently fails with 413 (`apps/api/src/server.ts:25`)
- [x] Async route handlers have no error wrapper — unhandled rejections hang requests and can crash the server (`apps/api/src/routes/notes.ts:28`, `apps/api/src/routes/dashboard.ts:10`)

### Medium

- [x] `findExistingNoteByContentHash` fetches all recent notes and hashes client-side — should store `content_hash` as a column (`packages/db/src/queries/dedup.ts:30-46`)
- [x] `hasPendingSuggestion` fetches all pending suggestions to check if one exists — should use targeted query (`packages/db/src/queries/suggestions.ts:48-58`)
- [x] `getSampleNoteTitles` fetches 200 notes globally then groups in JS — should use SQL window function (`packages/db/src/queries/note-stats.ts:32-54`)
- [x] Inbox pagination total includes suggestions but suggestions only appear on page 1 — last page may be empty (`apps/api/src/services/inbox/build-unified-feed.ts:38-40`)
- [x] In-memory Maps/Sets in API grow without bound (conversation store, para cache, initialized set) (`apps/api/src/services/conversation/conversation-store.ts`, `apps/api/src/services/para/para-cache.ts`, `apps/api/src/middleware/ensure-buckets.ts`)
- [x] Conversation store has no per-user eviction — inactive users accumulate forever (`apps/api/src/services/conversation/conversation-store.ts:5-6`)
- [x] `deleteOldConversationMessages` runs a cleanup query on every single message exchange (`apps/api/src/services/conversation/record-exchange.ts:44`)
- [x] Duplicate `capTitle` / `cleanArticleTitle` functions exist in both bot and API — should live in `packages/shared` (`apps/bot/src/extractors/cap-title.ts`, `apps/api/src/services/extractors/cap-title.ts`, `apps/api/src/services/extractors/extract-article.ts:100-102`)

### Low

- [x] Dashboard endpoint has 3 sequential waterfall stages that could be parallel (`apps/api/src/routes/dashboard.ts:13-28`)
- [x] Conversation store uses `Array.shift()` for trimming (O(n) per insert) (`apps/api/src/services/conversation/conversation-store.ts:11-13`)
- [x] `Math.random()` used for link code generation instead of `crypto.randomInt()` (`apps/api/src/routes/link.ts:17`)
- [x] Fire-and-forget DB writes (view counts, conversation messages, connections) have no retry mechanism (`apps/api/src/services/conversation/record-exchange.ts:41-42`)
- [ ] `express.json()` has no Content-Type validation — wrong Content-Type yields confusing Zod errors (`apps/api/src/server.ts:25`)

---

## Telegram Bot

### Critical

- [x] User cache not invalidated on unlink — bot serves stale auth for up to 5 minutes, allowing notes on wrong account (`apps/bot/src/middleware/user-cache.ts:26`, `apps/api/src/routes/link.ts:49-52`)

### High

- [x] `capTitle` called but never imported in `extract-pdf.ts` — runtime crash on every PDF extraction (`apps/bot/src/extractors/extract-pdf.ts:34`)
- [x] Race condition in link code validation — TOCTOU between checking `used` flag and marking used (`apps/bot/src/handlers/link.ts:24-47`)

### Medium

- [x] In-memory Maps in bot grow without bound (user cache, receipt store, update tracker) (`apps/bot/src/middleware/user-cache.ts`, `apps/bot/src/handlers/receipt-store.ts`, `apps/bot/src/handlers/update-tracker.ts`)
- [x] `getBucketPath` fetches ALL buckets to resolve one path — no caching like the API has (`apps/bot/src/handlers/resolve-bucket-path.ts:9`)
- [x] Multi-link processing is sequential — three links means three back-to-back extraction pipelines (`apps/bot/src/handlers/agent-handler.ts:76-91`)

### Low

- [x] `invalidateUser` is exported but never called anywhere — dead code (`apps/bot/src/middleware/user-cache.ts:26-28`)
- [x] Stickers, GIFs, contacts, locations silently fall through as empty text — no user feedback (`apps/bot/src/telegram/detect-message-type.ts`)
- [x] No graceful shutdown handler — in-flight messages lost on SIGTERM (`apps/bot/src/index.ts`)

---

## UI (Frontend)

### Critical

- [x] Missing `@keyframes shrink` — delete confirmation countdown bar in BatchToolbar has no animation (`apps/web/src/features/inbox/components/BatchToolbar.tsx:70`)
- [x] `--warning` CSS variable used in 5+ components but never defined — warning text renders invisible (`apps/web/src/features/review/components/ReviewHeader.tsx:18`, `ProjectCheckSection.tsx:41`, `AreaBalanceSection.tsx:46`, `TelegramSettingsCard.tsx:14`)

### High

- [x] `hover:bg-surface-250` references nonexistent color — hover states broken on AskAnswer and FilterRow (`apps/web/src/features/command-palette/components/AskAnswer.tsx:40`, `FilterRow.tsx:79`)
- [x] `hover:border-ember-200` references nonexistent ember shade — annotation nudge button has no hover feedback (`apps/web/src/pages/DashboardPage.tsx:65`)
- [x] NoteActions "Move" button has empty `onClick` — fully styled but does nothing (`apps/web/src/features/note-detail/components/NoteActions.tsx:45`)
- [x] DashboardEmptyState "Send your first capture" button has no `onClick` handler (`apps/web/src/features/dashboard/components/DashboardEmptyState.tsx:24`)
- [x] DashboardSuggestionChips are all non-functional buttons with no handlers (`apps/web/src/features/dashboard/components/DashboardSuggestionChips.tsx:13`)
- [x] SidebarParaSection "Create" (+) button has no `onClick` handler (`apps/web/src/components/layout/SidebarParaSection.tsx:69`)
- [x] "Delete account" rendered as plain `<p>` text, not an interactive element (`apps/web/src/features/settings/components/AccountCard.tsx:32`)

### Medium

- [x] Review + settings features (17 files, 84 occurrences) use raw `var()` CSS references instead of Tailwind classes used everywhere else (`features/review/components/`, `features/settings/components/`)
- [x] Hardcoded Tailwind colors (`red-500`, `green-500`, `amber-500`) instead of design tokens (`danger`, `success`) in 7 files (`BatchToolbar.tsx`, `BucketHeader.tsx`, `CreateBucketForm.tsx`, `InboxEmptyState.tsx`, `GraphControls.tsx`, `DeleteBucketDialog.tsx`, `NoteActions.tsx`)
- [x] 30+ hardcoded `text-[Npx]` font sizes bypassing typography utilities (`NoteTitle.tsx`, `OriginalContent.tsx`, `IndexCard.tsx`, `NoteCard.tsx`, `SuggestedBucketChip.tsx`)
- [x] `text-title-sm` (nonexistent class) used instead of `font-title-sm` (`InboxNoteRow.tsx:74`, `CreateBucketForm.tsx:42`)
- [x] NoteMetadata hardcodes `ParaDot type="area"` regardless of actual bucket type (`apps/web/src/features/note-detail/components/NoteMetadata.tsx:39`)
- [x] ContextPanel hardcoded `w-[300px]` with no responsive behavior — breaks on small screens (`apps/web/src/features/note-detail/components/ContextPanel.tsx:27`)
- [x] NoteDetailSkeleton hardcodes same 300px panel with no collapse toggle (`apps/web/src/features/note-detail/components/NoteDetailSkeleton.tsx:40`)
- [x] GraphCanvas `onWheel` calls `preventDefault` without `passive: false` — fails to prevent scrolling (`apps/web/src/features/graph/components/GraphCanvas.tsx:109-112`)
- [x] NodeSlideOver close button uses raw HTML entity instead of Lucide `X` icon like every other close button (`apps/web/src/features/graph/components/NodeSlideOver.tsx:23`)
- [x] GraphControls filter buttons lack `aria-label` — invisible to screen readers (`apps/web/src/features/graph/components/GraphControls.tsx:39-46`)
- [x] SidebarFooter avatar is a `<div>` with `cursor-pointer` and `aria-label` but not a button — not focusable or keyboard-accessible (`apps/web/src/components/layout/SidebarFooter.tsx:46-50`)
- [x] AskContent silently swallows follow-up errors with empty `catch` block (`apps/web/src/features/command-palette/components/AskContent.tsx:57-58`)
- [x] Graph simulation tick runs on every animation frame even after simulation settles — continuous 60fps re-renders (`apps/web/src/features/graph/hooks/useGraphSimulation.ts:36-39`)
- [x] GraphCanvas creates new handler functions on every render (~60fps) — GC pressure (`apps/web/src/features/graph/components/GraphCanvas.tsx:92-118`)
- [x] No route-level code splitting — all pages bundled and loaded upfront (`apps/web/src/app/router.tsx:1-13`)

### Low

- [x] InboxSkeleton uses shadcn animation classes instead of design system animations (`apps/web/src/features/inbox/components/InboxSkeleton.tsx:6`)
- [x] GraphView filter shortcuts (`1-4`) conflict with navigation shortcuts and fire when typing in inputs (`apps/web/src/features/graph/components/GraphView.tsx:58-61`)
- [x] `@ts-expect-error` in NoteDetailSkeleton to pass `style` prop that likely doesn't work (`apps/web/src/features/note-detail/components/NoteDetailSkeleton.tsx:32`)
- [x] BucketHeader "Move to..." dropdown item has no `onClick` handler (`apps/web/src/features/bucket/components/BucketHeader.tsx:69-70`)
- [x] CommandList has unreachable commands (`/new`, `/theme dark`, `/theme light`, `/help`) that fall through to `default: break` (`apps/web/src/features/command-palette/components/CommandList.tsx:62-65`)
- [x] AskAnswer "Synthesize" and "Open all sources" buttons wired to `() => {}` (`apps/web/src/features/command-palette/components/AskAnswer.tsx:31-43`)
- [x] Toast `onDismiss` in useEffect deps may cause timer resets if not memoized (`apps/web/src/components/shared/Toast.tsx:34-49`)
- [x] `hover:bg-[var(--ember-500)]/10` opacity modifier may not work with arbitrary `var()` values (`ConnectionSection.tsx:31`, `OrphanSection.tsx:36`, `ProjectCheckSection.tsx:49`, `DistillationSection.tsx:34`)
