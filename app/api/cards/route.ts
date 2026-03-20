import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { CreateCardPayload } from '@/types'

// POST /api/cards — create a new card inside a tab
export async function POST(req: Request) {
  try {
    const body: CreateCardPayload = await req.json()

    if (!body.title?.trim() || !body.tabId) {
      return NextResponse.json(
        { error: 'title and tabId are required' },
        { status: 400 },
      )
    }

    const cardType = body.type ?? 'code'

    // Next order within the tab
    const maxOrder = await prisma.card.aggregate({
      where: { tabId: body.tabId },
      _max: { order: true },
    })
    const nextOrder = (maxOrder._max.order ?? 0) + 1

    // Create with fields the Prisma client knows about
    const card = await prisma.card.create({
      data: {
        title:    body.title.trim(),
        code:     body.code ?? '',
        tag:      body.tag ?? null,
        tagColor: body.tagColor ?? 'blue',
        order:    nextOrder,
        tabId:    body.tabId,
      },
    })

    // `type` was added after Prisma client generation — set it via raw SQL
    await prisma.$executeRawUnsafe(
      `UPDATE Card SET type = ? WHERE id = ?`,
      cardType,
      card.id,
    )

    return NextResponse.json({ ...card, type: cardType }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/cards]', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}
