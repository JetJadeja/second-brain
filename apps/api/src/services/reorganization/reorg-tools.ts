import type { AnthropicTool } from '@second-brain/ai'

export const REORG_TOOLS: AnthropicTool[] = [
  {
    name: 'inspect_bucket',
    description:
      'Get detailed information about a specific bucket including all note titles and summaries. ' +
      'Use this when you need more context about what a bucket contains.',
    input_schema: {
      type: 'object' as const,
      properties: {
        bucket_id: {
          type: 'string',
          description: 'The ID of the bucket to inspect',
        },
      },
      required: ['bucket_id'],
    },
  },
  {
    name: 'get_bucket_activity',
    description:
      'Get activity stats for a bucket: note count, last capture date, and days since last note.',
    input_schema: {
      type: 'object' as const,
      properties: {
        bucket_id: {
          type: 'string',
          description: 'The ID of the bucket to check activity for',
        },
      },
      required: ['bucket_id'],
    },
  },
  {
    name: 'list_empty_buckets',
    description:
      'List all non-root buckets that have zero notes. Useful for identifying cleanup candidates.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
]
