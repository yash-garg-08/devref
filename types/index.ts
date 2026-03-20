// ── Core domain types ────────────────────────────────────────────────────────

export type TagColor = 'blue' | 'green' | 'red' | 'orange' | 'purple'

export interface Card {
  id: string
  title: string
  code: string
  type: string           // 'code' | 'ip-table'
  tag: string | null
  tagColor: TagColor | null
  order: number
  tabId: string
  createdAt: string
  updatedAt: string
}

export interface Tab {
  id: string
  name: string
  slug: string
  color: string | null        // hex colour for the tab pill, e.g. "#4f8ef7"
  order: number
  isBuiltIn: boolean
  cards: Card[]
  createdAt: string
  updatedAt: string
}

// ── API request / response shapes ────────────────────────────────────────────

export interface CreateTabPayload {
  name: string
}

export interface UpdateTabPayload {
  name?: string
  order?: number
  color?: string | null       // null clears the colour
}

export interface CreateCardPayload {
  title: string
  code: string
  type?: string           // 'code' | 'ip-table' | future types; defaults to 'code'
  tag?: string
  tagColor?: TagColor
  tabId: string
}

export interface UpdateCardPayload {
  title?: string
  code?: string
  tag?: string
  tagColor?: TagColor
  order?: number
  tabId?: string              // used for "move card to another tab"
}

// ── UI state types ────────────────────────────────────────────────────────────

export type ActiveTab = string   // tab slug or 'all'

export interface ModalState {
  open: boolean
  type: 'delete-tab' | 'rename-tab' | 'add-tab' | 'add-card' | 'move-card' | null
  payload?: unknown
}
