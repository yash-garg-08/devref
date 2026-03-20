// ── Card type registry ────────────────────────────────────────────────────────
// Add new entries here to support more card types in the future.
// The UI will automatically pick them up.

export interface CardTypeDefinition {
  /** Stored in the DB `type` column, e.g. "code" | "ip-table" */
  id: string
  /** Short display name shown in the picker */
  label: string
  /** One-line description shown under the label */
  description: string
  /** Emoji / icon character shown in the picker tile */
  icon: string
  /** Initial `code` value written when the card is first created */
  defaultCode: string
  /** Which extra form fields to render (besides title which is always shown) */
  fields: CardField[]
}

export type CardField = 'code'   // extend here for future fields, e.g. 'url' | 'table'

export const CARD_TYPES: CardTypeDefinition[] = [
  {
    id: 'code',
    label: 'Command Card',
    description: 'Shell commands, code snippets, or any text reference',
    icon: '⌨',
    defaultCode: '',
    fields: ['code'],
  },
  {
    id: 'ip-table',
    label: 'IP Reference',
    description: 'A table of server names and their IP addresses',
    icon: '⬡',
    defaultCode: '[]',
    fields: [],          // no extra fields — starts as an empty table
  },
  // ── Add future types below ────────────────────────────────────────────────
  // {
  //   id: 'url-list',
  //   label: 'URL List',
  //   description: 'A curated list of bookmarked URLs',
  //   icon: '🔗',
  //   defaultCode: '[]',
  //   fields: [],
  // },
]

/** Look up a definition by id, falling back to the 'code' type */
export function getCardType(id: string): CardTypeDefinition {
  return CARD_TYPES.find((t) => t.id === id) ?? CARD_TYPES[0]
}
