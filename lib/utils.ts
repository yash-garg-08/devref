import type { TagColor } from '@/types'

// ── String helpers ────────────────────────────────────────────────────────────

/** Convert a tab name to a URL-safe slug */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Ensure a slug is unique by appending a timestamp suffix if needed */
export function uniqueSlug(base: string): string {
  return `${slugify(base)}-${Date.now()}`
}

// ── Tag colour helpers ────────────────────────────────────────────────────────

const TAG_CLASSES: Record<TagColor, string> = {
  blue:   'bg-accent/10 text-accent',
  green:  'bg-success/10 text-success',
  red:    'bg-danger/10 text-danger',
  orange: 'bg-warning/10 text-warning',
  purple: 'bg-purple/10 text-purple',
}

export function tagClass(color: TagColor | null | undefined): string {
  return TAG_CLASSES[color ?? 'blue'] ?? TAG_CLASSES.blue
}

// ── Misc ──────────────────────────────────────────────────────────────────────

/** Simple cn() helper (no clsx dependency needed) */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
