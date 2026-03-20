import { prisma } from '@/lib/db'
import Dashboard from '@/components/dashboard/Dashboard'
import type { Tab } from '@/types'

// Fetch all tabs + cards server-side on every request
// Switch to `export const revalidate = 60` for ISR if you prefer
export const dynamic = 'force-dynamic'

async function getTabs(): Promise<Tab[]> {
  const tabs = await prisma.tab.findMany({
    orderBy: { order: 'asc' },
    include: { cards: { orderBy: { order: 'asc' } } },
  })

  // Prisma client predates the `color` (Tab) and `type` (Card) columns —
  // fetch them via raw SQL and merge in, exactly like GET /api/tabs does.
  let colorMap: Record<string, string | null> = {}
  try {
    const rows = await prisma.$queryRawUnsafe<{ id: string; color: string | null }[]>(
      'SELECT id, color FROM Tab'
    )
    colorMap = Object.fromEntries(rows.map((r) => [r.id, r.color ?? null]))
  } catch {}

  let typeMap: Record<string, string> = {}
  try {
    const rows = await prisma.$queryRawUnsafe<{ id: string; type: string }[]>(
      'SELECT id, type FROM Card'
    )
    typeMap = Object.fromEntries(rows.map((r) => [r.id, r.type ?? 'code']))
  } catch {}

  const enriched = tabs.map((tab) => ({
    ...tab,
    color: colorMap[tab.id] ?? null,
    cards: tab.cards.map((card) => ({
      ...card,
      type: typeMap[card.id] ?? 'code',
    })),
  }))

  // Prisma returns Date objects; serialise to strings for the client
  return JSON.parse(JSON.stringify(enriched)) as Tab[]
}

export default async function HomePage() {
  const tabs = await getTabs()

  return <Dashboard initialTabs={tabs} />
}
