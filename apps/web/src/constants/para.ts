export const PARA_COLORS = {
  projects: '#EE4540',
  areas: '#5B8A72',
  resources: '#C87533',
  archive: '#564A52',
  inbox: '#EE4540',
} as const

export type ParaCategory = keyof typeof PARA_COLORS
