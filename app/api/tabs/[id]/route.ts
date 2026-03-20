import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { UpdateTabPayload } from '@/types'

interface RouteParams {
  params: { id: string }
}

// PATCH /api/tabs/:id — rename, reorder, or change colour
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const body: UpdateTabPayload = await req.json()

    // Update fields the Prisma client knows about
    if (body.name !== undefined || body.order !== undefined) {
      await prisma.tab.update({
        where: { id: params.id },
        data: {
          ...(body.name  !== undefined && { name:  body.name.trim() }),
          ...(body.order !== undefined && { order: body.order }),
        },
      })
    }

    // `color` was added after the Prisma client was generated — use raw SQL
    if (body.color !== undefined) {
      if (body.color === null) {
        await prisma.$executeRawUnsafe(
          `UPDATE Tab SET color = NULL, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          params.id,
        )
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE Tab SET color = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          body.color,
          params.id,
        )
      }
    }

    // Fetch the updated tab (Prisma) and merge in color via raw SQL
    const tab = await prisma.tab.findUnique({
      where: { id: params.id },
      include: { cards: { orderBy: { order: 'asc' } } },
    })

    const colorRows = await prisma.$queryRawUnsafe<{ color: string | null }[]>(
      `SELECT color FROM Tab WHERE id = ?`,
      params.id,
    )
    const color = colorRows[0]?.color ?? null

    return NextResponse.json({ ...tab, color })
  } catch (error) {
    console.error('[PATCH /api/tabs/:id]', error)
    return NextResponse.json({ error: 'Failed to update tab' }, { status: 500 })
  }
}

// DELETE /api/tabs/:id — delete a tab and all its cards (cascade)
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await prisma.tab.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/tabs/:id]', error)
    return NextResponse.json({ error: 'Failed to delete tab' }, { status: 500 })
  }
}
