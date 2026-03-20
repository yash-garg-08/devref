import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { uniqueSlug } from '@/lib/utils'
import type { CreateTabPayload } from '@/types'

// GET /api/tabs — fetch all tabs with their cards
export async function GET() {
  try {
    const tabs = await prisma.tab.findMany({
      orderBy: { order: 'asc' },
      include: {
        cards: { orderBy: { order: 'asc' } },
      },
    })

    // Prisma client was generated before the `type` column (Card) and `color`
    // column (Tab) were added, so we fetch them via raw SQL and merge them in.
    let typeMap: Record<string, string> = {}
    try {
      const rows = await prisma.$queryRawUnsafe<{ id: string; type: string }[]>(
        'SELECT id, type FROM Card'
      )
      typeMap = Object.fromEntries(rows.map((r) => [r.id, r.type ?? 'code']))
    } catch (e) {
      console.warn('[GET /api/tabs] type column fetch failed, defaulting all to "code"', e)
    }

    let colorMap: Record<string, string | null> = {}
    try {
      const rows = await prisma.$queryRawUnsafe<{ id: string; color: string | null }[]>(
        'SELECT id, color FROM Tab'
      )
      colorMap = Object.fromEntries(rows.map((r) => [r.id, r.color ?? null]))
    } catch (e) {
      console.warn('[GET /api/tabs] color column fetch failed', e)
    }

    const enriched = tabs.map((tab) => ({
      ...tab,
      color: colorMap[tab.id] ?? null,
      cards: tab.cards.map((card) => ({
        ...card,
        type: typeMap[card.id] ?? 'code',
      })),
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('[GET /api/tabs]', error)
    return NextResponse.json({ error: 'Failed to fetch tabs' }, { status: 500 })
  }
}

// POST /api/tabs — create a new tab
export async function POST(req: Request) {
  try {
    const body: CreateTabPayload = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Tab name is required' }, { status: 400 })
    }

    // Calculate the next order value
    const maxOrder = await prisma.tab.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? 0) + 1

    const tab = await prisma.tab.create({
      data: {
        name: body.name.trim(),
        slug: uniqueSlug(body.name),
        order: nextOrder,
        isBuiltIn: false,
      },
      include: { cards: true },
    })

    return NextResponse.json(tab, { status: 201 })
  } catch (error) {
    console.error('[POST /api/tabs]', error)
    return NextResponse.json({ error: 'Failed to create tab' }, { status: 500 })
  }
}
