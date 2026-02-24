import type { AnthropicTool } from '@second-brain/ai'

export const AGENT_TOOLS: AnthropicTool[] = [
  {
    name: 'save_note',
    description:
      'Save content to the user\'s knowledge base. Use this when the user shares a thought, idea, URL, article, or any content they want to remember. Do NOT use this for conversational messages like greetings or questions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        content: {
          type: 'string',
          description: 'The text content, URL, or description to save',
        },
        source_type: {
          type: 'string',
          enum: ['thought', 'article', 'tweet', 'youtube', 'pdf', 'image', 'voice_memo'],
          description: 'Optional hint about the content type. If omitted, auto-detected.',
        },
      },
      required: ['content'],
    },
  },
  {
    name: 'search_notes',
    description:
      'Search the user\'s knowledge base by semantic query. Use this when the user asks to find, search for, or look up something in their notes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The search query text',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'show_inbox',
    description:
      'Show the user\'s inbox status and recent unclassified items. Use when they ask what\'s in their inbox, what\'s pending, or what needs organizing.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_bucket',
    description:
      'Create a new folder (project, area, or resource) in the user\'s PARA structure. Projects have goals/deadlines, areas are ongoing responsibilities, resources are topics of interest.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'The folder name (proper-cased, concise)',
        },
        type: {
          type: 'string',
          enum: ['project', 'area', 'resource'],
          description: 'The PARA type for this folder',
        },
        parent_name: {
          type: 'string',
          description: 'Name of the parent folder. If omitted, creates under the root container for the type.',
        },
        description: {
          type: 'string',
          description: 'A one-line description of what this folder is for. Helps with future classification.',
        },
      },
      required: ['name', 'type'],
    },
  },
  {
    name: 'move_note',
    description:
      'Move a note to a different folder. Use when the user wants to refile, move, or reclassify a note. Use note IDs from conversation history.',
    input_schema: {
      type: 'object' as const,
      properties: {
        note_id: {
          type: 'string',
          description: 'The UUID of the note to move',
        },
        target_path: {
          type: 'string',
          description: 'The target folder name or path (e.g., "Cars" or "Resources > Cars")',
        },
      },
      required: ['note_id', 'target_path'],
    },
  },
  {
    name: 'manage_bucket',
    description:
      'Rename, move, or delete a folder. Use when the user wants to restructure their folders. For delete, check note count first and ask the user what to do with the notes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: ['rename', 'move', 'delete'],
          description: 'The management action to perform',
        },
        bucket_name: {
          type: 'string',
          description: 'Name or path of the bucket to manage (e.g., "Cars" or "Resources > Cars")',
        },
        new_name: {
          type: 'string',
          description: 'New name for the bucket (rename only)',
        },
        new_parent_name: {
          type: 'string',
          description: 'Name of the new parent folder (move only)',
        },
      },
      required: ['action', 'bucket_name'],
    },
  },
  {
    name: 'finalize_onboarding',
    description:
      'Create the user\'s complete folder structure and finish onboarding. Only use this during onboarding, after you\'ve gathered enough information about the user\'s life, projects, and interests. Pass the full structure you\'ve designed.',
    input_schema: {
      type: 'object' as const,
      properties: {
        buckets: {
          type: 'array',
          description: 'The complete folder structure to create',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Folder name (proper-cased, concise)',
              },
              type: {
                type: 'string',
                enum: ['project', 'area', 'resource'],
                description: 'The PARA type',
              },
              parent_name: {
                type: 'string',
                description: 'Name of parent folder for nesting. Omit for top-level.',
              },
              description: {
                type: 'string',
                description: 'One-line description of what this folder is for.',
              },
            },
            required: ['name', 'type'],
          },
        },
      },
      required: ['buckets'],
    },
  },
]
