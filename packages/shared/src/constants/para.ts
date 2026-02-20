import type { ParaType } from '../types/enums.js'

export const DEFAULT_PARA_BUCKETS: ReadonlyArray<{ name: string; type: ParaType }> = [
  { name: 'Projects', type: 'project' },
  { name: 'Areas', type: 'area' },
  { name: 'Resources', type: 'resource' },
  { name: 'Archive', type: 'archive' },
]
