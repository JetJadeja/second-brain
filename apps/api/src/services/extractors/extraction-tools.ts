import type { AnthropicTool } from '@second-brain/ai'

export const EXTRACTION_TOOLS: AnthropicTool[] = [
  {
    name: 'fetch_url',
    description:
      'Fetch a web page URL and extract its text content using Readability. ' +
      'Works best on articles, blog posts, newsletters, and static HTML pages. ' +
      'Returns the page title, extracted text, author, and domain.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description: 'The URL to fetch and parse',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'fetch_tweet',
    description:
      'Fetch tweet content from a Twitter/X URL. ' +
      'Returns the tweet text, author handle, thread content if applicable, ' +
      'and any quoted tweet content.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description: 'The Twitter/X tweet URL',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'fetch_video_metadata',
    description:
      'Fetch metadata for a video URL (YouTube, Instagram, etc.) using yt-dlp. ' +
      'Returns title, description, channel, thumbnail, and transcript if available.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description: 'The video URL (YouTube, Instagram, etc.)',
        },
      },
      required: ['url'],
    },
  },
]
