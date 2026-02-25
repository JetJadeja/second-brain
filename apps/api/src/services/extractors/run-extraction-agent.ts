import {
  runAgentLoop,
  buildExtractionAgentSystem,
  buildExtractionAgentUser,
  parseLlmJson,
} from '@second-brain/ai'
import type { ExtractedContent, NoteSource } from '@second-brain/shared'
import { EXTRACTION_TOOLS } from './extraction-tools.js'
import { executeExtractionTool, type ExtractionToolResult } from './handle-extraction-tools.js'

const HAIKU_MODEL = 'claude-haiku-4-5-20251001'

export interface ExtractionAgentResult {
  extracted: ExtractedContent
  summary: string | null
}

export async function runExtractionAgent(url: string): Promise<ExtractionAgentResult> {
  let lastToolData: ExtractionToolResult | null = null

  const result = await runAgentLoop({
    system: buildExtractionAgentSystem(),
    messages: [{ role: 'user' as const, content: buildExtractionAgentUser(url) }],
    tools: EXTRACTION_TOOLS,
    model: HAIKU_MODEL,
    maxTokens: 2048,
    maxTurns: 3,
    toolExecutor: async (name, input) => {
      const toolData = await executeExtractionTool(name, input)
      lastToolData = toolData
      return toolData.text
    },
  })

  if (!lastToolData) {
    throw new Error('Extraction agent did not call any tools')
  }

  return assembleResult(result.text, lastToolData)
}

function assembleResult(
  agentText: string,
  toolData: ExtractionToolResult,
): ExtractionAgentResult {
  const parsed = parseAgentJson(agentText)

  const extracted: ExtractedContent = {
    ...toolData.extracted,
    title: parsed?.title ?? toolData.extracted.title,
    sourceType: (parsed?.sourceType as NoteSource) ?? toolData.extracted.sourceType,
  }

  return {
    extracted,
    summary: parsed?.summary ?? null,
  }
}

interface AgentOutput {
  title: string
  sourceType: string
  summary: string | null
}

function parseAgentJson(text: string): AgentOutput | null {
  const parsed = parseLlmJson(text)
  if (!parsed) {
    console.error('[extractionAgent] Failed to parse agent JSON:', text.slice(0, 200))
    return null
  }
  return {
    title: typeof parsed['title'] === 'string' ? parsed['title'] : '',
    sourceType: typeof parsed['sourceType'] === 'string' ? parsed['sourceType'] : '',
    summary: typeof parsed['summary'] === 'string' ? parsed['summary'] : null,
  }
}
