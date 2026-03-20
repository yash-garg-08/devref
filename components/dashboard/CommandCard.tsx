'use client'

import { useState, useRef, useEffect } from 'react'
import { tagClass } from '@/lib/utils'
import type { Card } from '@/types'
import CodeBlock from './CodeBlock'

interface CommandCardProps {
  card: Card
  tabColor?: string | null
  onUpdateCode: (cardId: string, newCode: string) => Promise<void>
  onRenameCard: (cardId: string, newTitle: string) => Promise<void>
  onMoveCard: (card: Card) => void
  onDeleteCard: (card: Card) => void
}

export default function CommandCard({
  card,
  tabColor,
  onUpdateCode,
  onRenameCard,
  onMoveCard,
  onDeleteCard,
}: CommandCardProps) {
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft]       = useState(card.title)
  const inputRef                = useRef<HTMLInputElement>(null)
  const mirrorRef               = useRef<HTMLSpanElement>(null)

  // Keep input width in sync with the hidden mirror span (accurate for any font/tracking)
  useEffect(() => {
    if (renaming && inputRef.current && mirrorRef.current) {
      inputRef.current.style.width = mirrorRef.current.offsetWidth + 'px'
    }
  }, [draft, renaming])

  function startRename() {
    setDraft(card.title)
    setRenaming(true)
    setTimeout(() => { inputRef.current?.select() }, 0)
  }

  async function commitRename() {
    const newTitle = draft.trim() || card.title
    setRenaming(false)
    if (newTitle !== card.title) await onRenameCard(card.id, newTitle)
  }

  return (
    <div className="group/card rounded-xl bg-surface border border-border overflow-hidden hover:border-accent hover:shadow-[0_4px_20px_rgba(79,142,247,0.12)] transition-all duration-200" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Card header */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: tabColor ? `linear-gradient(135deg, ${tabColor}55 0%, ${tabColor}22 60%, transparent 100%)` : 'rgb(var(--color-surface2))' }}>

        {/* Title — click pencil button to rename */}
        {renaming ? (
          <div className="relative">
            {/* Hidden mirror span — same styles as the input, used to measure natural text width */}
            <span
              ref={mirrorRef}
              aria-hidden
              className="invisible absolute pointer-events-none text-xxs font-bold uppercase tracking-widest px-1.5 py-0.5 whitespace-pre"
            >
              {draft || 'x'}
            </span>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter')  { e.preventDefault(); inputRef.current?.blur() }
                if (e.key === 'Escape') { setRenaming(false); setDraft(card.title) }
              }}
              className="text-xxs font-bold uppercase tracking-widest bg-surface border border-accent rounded px-1.5 py-0.5 text-text outline-none"
              style={{ minWidth: '80px' }}
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: tabColor ?? 'rgb(var(--color-text))' }}>
              {card.title}
            </span>
            <button
              onClick={startRename}
              className="opacity-0 group-hover/card:opacity-100 text-xs text-muted hover:text-accent transition-all leading-none"
              title="Rename card"
            >
              ✎
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Action buttons — slide in on card hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => onMoveCard(card)}
              className="text-xxs font-semibold px-2 py-0.5 rounded border border-border text-muted hover:text-success hover:border-success hover:bg-success/10 transition-all"
              title="Move to another tab"
            >
              ⇄ move
            </button>
            <button
              onClick={() => onDeleteCard(card)}
              className="text-xxs font-semibold px-2 py-0.5 rounded border border-border text-muted hover:text-danger hover:border-danger hover:bg-danger/10 transition-all"
              title="Delete card"
            >
              ✕ delete
            </button>
          </div>

          {card.tag && (
            <>
              <span className="w-px h-3 bg-border/60" />
              <span className={`text-xxs font-semibold px-2 py-0.5 rounded ${tagClass(card.tagColor)}`}>
                {card.tag}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <CodeBlock
          code={card.code}
          onSave={(newCode) => onUpdateCode(card.id, newCode)}
        />
      </div>
    </div>
  )
}
