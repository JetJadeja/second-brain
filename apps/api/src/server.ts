import express from 'express'
import cors from 'cors'
import { requireAuth } from './middleware/auth.js'
import { ensureDefaultBuckets } from './middleware/ensure-buckets.js'
import { dashboardRouter } from './routes/dashboard.js'
import { inboxRouter } from './routes/inbox.js'
import { paraRouter } from './routes/para.js'
import { notesRouter } from './routes/notes.js'
import { linkRouter } from './routes/link.js'
import { suggestionsRouter } from './routes/suggestions.js'
import { chatRouter } from './routes/chat.js'
import { requireInternalAuth } from './middleware/internal-auth.js'

const app = express()
const port = process.env['API_PORT'] || 3001

const allowedOrigins = [
  process.env['WEB_APP_URL'],
  'http://localhost:5173',
].filter(Boolean) as string[]

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Internal routes (bot-to-api) — must be before public auth middleware
app.use('/api/internal/chat', requireInternalAuth, chatRouter)

// All /api routes require auth + default bucket initialization
app.use('/api', requireAuth, ensureDefaultBuckets)

app.use('/api/dashboard', dashboardRouter)
app.use('/api/inbox', inboxRouter)
app.use('/api/para', paraRouter)
app.use('/api/notes', notesRouter)
app.use('/api/link', linkRouter)
app.use('/api/suggestions', suggestionsRouter)

app.listen(port, () => {
  console.log(`API server running on :${port}`)
})
