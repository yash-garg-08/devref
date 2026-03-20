import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { UpdateCardPayload } from '@/types'

interface RouteParams {
  params: { id: string }
}

// PATCH /api/cards/:id — update title, code, tag, order, or move to another tab
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const body: UpdateCardPayload = await req.json()

    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        ...(body.title    !== undefined && { title:    body.title.trim() }),
        ...(body.code     !== undefined && { code:     body.code.trim() }),
        ...(body.tag      !== undefined && { tag:      body.tag }),
        ...(body.tagColor !== undefined && { tagColor: body.tagColor }),
        ...(body.order    !== undefined && { order:    body.order }),
        ...(body.tabId    !== undefined && { tabId:    body.tabId }),  // move card
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('[PATCH /api/cards/:id]', error)
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
  }
}

// DELETE /api/cards/:id — delete a single card
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await prisma.card.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/cards/:id]', error)
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
  }
}
