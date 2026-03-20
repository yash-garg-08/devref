'use client'

import { useState, useRef, useEffect } from 'react'
import { tagClass } from '@/lib/utils'
import type { Card } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────
interface IpEntry {
  id: string
  name: string
  ip: string
}

function parseEntries(code: string): IpEntry[] {
  try {
    const parsed = JSON.parse(code)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return []
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface IpReferenceCardProps {
  card: Card
  tabColor?: string | null
  onUpdateCode: (cardId: string, newCode: string) => Promise<void>
  onRenameCard: (cardId: string, newTitle: string) => Promise<void>
  onMoveCard: (card: Card) => void
  onDeleteCard: (card: Card) => void
}

export default function IpReferenceCard({
  card,
  tabColor,
  onUpdateCode,
  onRenameCard,
  onMoveCard,
  onDeleteCard,
}: IpReferenceCardProps) {
  const [entries, setEntries]     = useState<IpEntry[]>(() => parseEntries(card.code))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftIp, setDraftIp]     = useState('')
  const [adding, setAdding]       = useState(false)
  const [newName, setNewName]     = useState('')
  const [newIp, setNewIp]         = useState('')

  // Card title rename
  const [renaming, setRenaming]     = useState(false)
  const [titleDraft, setTitleDraft] = useState(card.title)
  const titleInputRef  = useRef<HTMLInputElement>(null)
  const titleMirrorRef = useRef<HTMLSpanElement>(null)
  const nameInputRef   = useRef<HTMLInputElement>(null)
  const newNameRef     = useRef<HTMLInputElement>(null)

  // Keep title input width in sync with the hidden mirror span
  useEffect(() => {
    if (renaming && titleInputRef.current && titleMirrorRef.current) {
      titleInputRef.current.style.width = titleMirrorRef.current.offsetWidth + 'px'
    }
  }, [titleDraft, renaming])

  // ── Persistence ─────────────────────────────────────────────────────────────
  async function saveEntries(updated: IpEntry[]) {
    setEntries(updated)
    await onUpdateCode(card.id, JSON.stringify(updated))
  }

  // ── Row edit ─────────────────────────────────────────────────────────────────
  function startEdit(entry: IpEntry) {
    setEditingId(entry.id)
    setDraftName(entry.name)
    setDraftIp(entry.ip)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }

  async function commitEdit() {
    if (!editingId) return
    const updated = entries.map((e) =>
      e.id === editingId
        ? { ...e, name: draftName.trim() || e.name, ip: draftIp.trim() || e.ip }
        : e,
    )
    setEditingId(null)
    await saveEntries(updated)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function deleteEntry(id: string) {
    await saveEntries(entries.filter((e) => e.id !== id))
  }

  // ── Add row ──────────────────────────────────────────────────────────────────
  async function commitAdd() {
    if (!newName.trim() || !newIp.trim()) return
    const entry: IpEntry = { id: genId(), name: newName.trim(), ip: newIp.trim() }
    await saveEntries([...entries, entry])
    setAdding(false)
    setNewName('')
    setNewIp('')
  }

  // ── Card title rename ────────────────────────────────────────────────────────
  async function commitRename() {
    const t = titleDraft.trim() || card.title
    setRenaming(false)
    if (t !== card.title) await onRenameCard(card.id, t)
  }

  // ── Shared input styles ──────────────────────────────────────────────────────
  const cellInput =
    'bg-surface border border-accent rounded px-2 py-0.5 text-xs text-text outline-none w-full'

  return (
    <div className="group/card rounded-xl bg-surface border border-border overflow-hidden hover:border-accent hover:shadow-[0_4px_20px_rgba(79,142,247,0.12)] transition-all duration-200" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* ── Header ── */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: tabColor ? `linear-gradient(135deg, ${tabColor}55 0%, ${tabColor}22 60%, transparent 100%)` : 'rgb(var(--color-surface2))' }}>
        {/* Title */}
        {renaming ? (
          <div className="relative">
            {/* Hidden mirror span — same styles as the input, used to measure natural text width */}
            <span
              ref={titleMirrorRef}
              aria-hidden
              className="invisible absolute pointer-events-none text-xxs font-bold uppercase tracking-widest px-1.5 py-0.5 whitespace-pre"
            >
              {titleDraft || 'x'}
            </span>
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter')  { e.preventDefault(); titleInputRef.current?.blur() }
                if (e.key === 'Escape') { setRenaming(false); setTitleDraft(card.title) }
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
              onClick={() => {
                setTitleDraft(card.title)
                setRenaming(true)
                setTimeout(() => titleInputRef.current?.focus(), 0)
              }}
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

      {/* ── Body — IP table ── */}
      <div className="p-4">
        <table className="w-full border-collapse" style={{ fontSize: '14px' }}>
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-1.5 pr-4 text-muted font-semibold uppercase tracking-wider text-xxs w-1/2">
                Server
              </th>
              <th className="text-left py-1.5 pr-2 text-muted font-semibold uppercase tracking-wider text-xxs">
                IP / Address
              </th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) =>
              editingId === entry.id ? (
                /* ── Edit row ── */
                <tr key={entry.id} className="border-b border-border/30">
                  <td className="py-1.5 pr-3">
                    <input
                      ref={nameInputRef}
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter')  commitEdit()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className={cellInput}
                      placeholder="Server name"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      value={draftIp}
                      onChange={(e) => setDraftIp(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter')  commitEdit()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className={`${cellInput} font-mono`}
                      placeholder="192.168.x.x"
                    />
                  </td>
                  <td className="py-1.5 pl-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={commitEdit}
                        className="text-success hover:opacity-80 text-sm leading-none px-1"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-muted hover:text-danger text-sm leading-none px-1"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                /* ── Display row ── */
                <tr
                  key={entry.id}
                  className="group/row border-b border-border/30 last:border-0 hover:bg-surface2/50 transition-colors"
                >
                  <td className="py-2 pr-4 text-text">{entry.name}</td>
                  <td className="py-2 pr-2 font-mono text-success">{entry.ip}</td>
                  <td className="py-2 pl-1">
                    <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-muted hover:text-accent text-xs leading-none px-1"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-muted hover:text-danger text-sm leading-none px-1"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}

            {/* ── Add row ── */}
            {adding && (
              <tr className="border-t border-border/40">
                <td className="pt-2 pr-3">
                  <input
                    ref={newNameRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')  commitAdd()
                      if (e.key === 'Escape') { setAdding(false); setNewName(''); setNewIp('') }
                    }}
                    className={cellInput}
                    placeholder="Server name"
                    autoFocus
                  />
                </td>
                <td className="pt-2 pr-2">
                  <input
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')  commitAdd()
                      if (e.key === 'Escape') { setAdding(false); setNewName(''); setNewIp('') }
                    }}
                    className={`${cellInput} font-mono`}
                    placeholder="192.168.x.x"
                  />
                </td>
                <td className="pt-2 pl-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={commitAdd}
                      className="text-success hover:opacity-80 text-sm leading-none px-1"
                      title="Add"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => { setAdding(false); setNewName(''); setNewIp('') }}
                      className="text-muted hover:text-danger text-sm leading-none px-1"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add IP button */}
        {!adding && (
          <button
            onClick={() => {
              setAdding(true)
              setTimeout(() => newNameRef.current?.focus(), 0)
            }}
            className="mt-3 text-xxs font-semibold text-muted hover:text-success transition-colors border border-dashed border-border hover:border-success rounded px-3 py-1"
          >
            + Add IP
          </button>
        )}
      </div>
    </div>
  )
}
