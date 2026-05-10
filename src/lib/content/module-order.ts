export const MODULE_ORDER = [
  'welcome',
  'mission',
  'global-reach',
  'charter-membership',
  'fleet',
  'sustainability',
  'private-aviation-market',
  'aircraft-types',
  'lead-qualification',
  'whatsapp-communication',
  'scenarios',
] as const

export type ModuleSlug = typeof MODULE_ORDER[number]

export function isModuleSlug(s: string): s is ModuleSlug {
  return (MODULE_ORDER as readonly string[]).includes(s)
}

export function nextModuleSlug(current: ModuleSlug): ModuleSlug | null {
  const idx = MODULE_ORDER.indexOf(current)
  return idx >= 0 && idx < MODULE_ORDER.length - 1 ? MODULE_ORDER[idx + 1] : null
}
