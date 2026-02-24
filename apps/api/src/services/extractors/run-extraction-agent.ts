import {
  callClaudeWithTools,
  buildExtractionAgentSystem,
  buildExtractionAgentUser,
  extractText,
  type AnthropicContentBlock,
  type AnthropicToolResultBlockParam,
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
  const system = buildExtractionAgentSystem()
  const userMessage = buildExtractionAgentUser(url)
  const messages = [{ role: 'user' as const, content: userMessage }]

  const response = await callClaudeWithTools({
    system,
    messages,
    tools: EXTRACTION_TOOLS,
    model: HAIKU_MODEL,
    maxTokens: 2048,
  })

  if (response.stop_reason !== 'tool_use') {
    throw new Error('Extraction agent did not call any tools')
  }

  const { toolResult, toolData } = await executeTools(response.content)

  const followUp = await callClaudeWithTools({
    system: '',
    messages: [
      ...messages,
      { role: 'assistant' as const, content: response.content },
      { role: 'user' as const, content: [toolResult] },
    ],
    tools: EXTRACTION_TOOLS,
    model: HAIKU_MODEL,
    maxTokens: 1024,
  })

  const agentText = extractText(followUp.content, 'first')
  return assembleResult(agentText, toolData)
}

async function executeTools(
  content: AnthropicContentBlock[],
): Promise<{ toolResult: AnthropicToolResultBlockParam; toolData: ExtractionToolResult }> {
  for (const block of content) {
    if (block.type === 'tool_use') {
      const toolData = await executeExtractionTool(
        block.name,
        block.input as Record<string, unknown>,
      )
      const toolResult: AnthropicToolResultBlockParam = {
        type: 'tool_result',
        tool_use_id: block.id,
        content: toolData.text,
      }
      return { toolResult, toolData }
    }
  }
  throw new Error('No tool_use block found in response')
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
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>
    return {
      title: typeof parsed['title'] === 'string' ? parsed['title'] : '',
      sourceType: typeof parsed['sourceType'] === 'string' ? parsed['sourceType'] : '',
      summary: typeof parsed['summary'] === 'string' ? parsed['summary'] : null,
    }
  } catch {
    console.error('[extractionAgent] Failed to parse agent JSON:', text.slice(0, 200))
    return null
  }
}

