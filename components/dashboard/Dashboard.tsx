'use client'

import { useState, useMemo, useCallback } from 'react'
import TabBar from './TabBar'
import SearchBar from './SearchBar'
import CommandCard from './CommandCard'
import IpReferenceCard from './IpReferenceCard'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import AddCardModal from './AddCardModal'
import type { Tab, Card, ActiveTab } from '@/types'

// Detect ip-table cards even if the API `type` field isn't populated yet
function isIpTable(card: Card): boolean {
  if (card.type === 'ip-table') return true
  try {
    const parsed = JSON.parse(card.code)
    if (Array.isArray(parsed) && parsed.length > 0 && 'name' in parsed[0] && 'ip' in parsed[0]) {
      return true
    }
  } catch {}
  return false
}

interface DashboardProps {
  initialTabs: Tab[]
}

export default function Dashboard({ initialTabs }: DashboardProps) {
  const [tabs, setTabs]           = useState<Tab[]>(initialTabs)
  const [activeTab, setActiveTab] = useState<ActiveTab>('all')
  const [search, setSearch]       = useState('')

  // ── Modal state ──────────────────────────────────────────────────────────
  const [addTabOpen, setAddTabOpen]     = useState(false)
  const [newTabName, setNewTabName]     = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Tab | null>(null)

  const [addCardTab, setAddCardTab] = useState<Tab | null>(null)

  // Move card modal
  const [moveCardTarget, setMoveCardTarget] = useState<Card | null>(null)
  const [moveCardDestId, setMoveCardDestId] = useState('')

  // Delete card modal
  const [deleteCardTarget, setDeleteCardTarget] = useState<Card | null>(null)

  // ── Derived: visible cards ────────────────────────────────────────────────
  const visibleCards = useMemo(() => {
    const q = search.toLowerCase()
    const allCards = tabs.flatMap((t) => t.cards)

    let cards: Card[] =
      activeTab === 'all'
        ? allCards
        : tabs.find((t) => t.slug === activeTab)?.cards ?? []

    if (q) {
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.tag?.toLowerCase().includes(q),
      )
    }

    return cards
  }, [tabs, activeTab, search])

  // ── Tab CRUD ─────────────────────────────────────────────────────────────
  async function handleAddTab() {
    if (!newTabName.trim()) return
    const res = await fetch('/api/tabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTabName.trim() }),
    })
    if (res.ok) {
      const tab: Tab = await res.json()
      setTabs((prev) => [...prev, tab])
      setActiveTab(tab.slug)
    }
    setAddTabOpen(false)
    setNewTabName('')
  }

  async function handleDeleteTab(tab: Tab) {
    const res = await fetch(`/api/tabs/${tab.id}`, { method: 'DELETE' })
    if (res.ok) {
      setTabs((prev) => prev.filter((t) => t.id !== tab.id))
      if (activeTab === tab.slug) setActiveTab('all')
    }
    setDeleteTarget(null)
  }

  async function handleRenameTab(tab: Tab, newName: string) {
    const res = await fetch(`/api/tabs/${tab.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    if (res.ok) {
      const updated: Tab = await res.json()
      setTabs((prev) => prev.map((t) => (t.id === tab.id ? updated : t)))
    }
  }

  async function handleColorTab(tab: Tab, color: string | null) {
    // Optimistic update — show colour change instantly in the UI
    setTabs((prev) =>
      prev.map((t) => (t.id === tab.id ? { ...t, color } : t)),
    )
    // Persist to DB; on failure roll back to the original colour
    const res = await fetch(`/api/tabs/${tab.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color }),
    })
    if (!res.ok) {
      setTabs((prev) =>
        prev.map((t) => (t.id === tab.id ? { ...t, color: tab.color } : t)),
      )
    }
  }

  // ── Card CRUD ─────────────────────────────────────────────────────────────
  async function handleAddCard(type: string, title: string, code: string) {
    if (!addCardTab) return
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, code, tabId: addCardTab.id }),
    })
    if (res.ok) {
      const card: Card = await res.json()
      setTabs((prev) =>
        prev.map((t) =>
          t.id === addCardTab.id ? { ...t, cards: [...t.cards, card] } : t,
        ),
      )
    }
    setAddCardTab(null)
  }

  const handleUpdateCode = useCallback(async (cardId: string, newCode: string) => {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: newCode }),
    })
    if (res.ok) {
      setTabs((prev) =>
        prev.map((t) => ({
          ...t,
          cards: t.cards.map((c) => (c.id === cardId ? { ...c, code: newCode } : c)),
        })),
      )
    }
  }, [])

  const handleRenameCard = useCallback(async (cardId: string, newTitle: string) => {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    if (res.ok) {
      setTabs((prev) =>
        prev.map((t) => ({
          ...t,
          cards: t.cards.map((c) => (c.id === cardId ? { ...c, title: newTitle } : c)),
        })),
      )
    }
  }, [])

  async function handleDeleteCard() {
    if (!deleteCardTarget) return
    const res = await fetch(`/api/cards/${deleteCardTarget.id}`, { method: 'DELETE' })
    if (res.ok) {
      setTabs((prev) =>
        prev.map((t) => ({
          ...t,
          cards: t.cards.filter((c) => c.id !== deleteCardTarget.id),
        })),
      )
    }
    setDeleteCardTarget(null)
  }

  async function handleMoveCard() {
    if (!moveCardTarget || !moveCardDestId) return
    const fromTabId = moveCardTarget.tabId
    const toTabId   = moveCardDestId
    if (fromTabId === toTabId) { setMoveCardTarget(null); return }

    const res = await fetch(`/api/cards/${moveCardTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabId: toTabId }),
    })
    if (res.ok) {
      const movedCard = { ...moveCardTarget, tabId: toTabId }
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === fromTabId) return { ...t, cards: t.cards.filter((c) => c.id !== movedCard.id) }
          if (t.id === toTabId)   return { ...t, cards: [...t.cards, movedCard] }
          return t
        }),
      )
    }
    setMoveCardTarget(null)
    setMoveCardDestId('')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const currentTab = tabs.find((t) => t.slug === activeTab)

  // Options for the "move card" select — all tabs except the card's current tab
  const moveDestOptions = tabs
    .filter((t) => moveCardTarget && t.id !== moveCardTarget.tabId)
    .map((t) => ({ value: t.id, label: t.name }))

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm border-b border-border px-8 py-4 flex items-center justify-between shadow-[0_1px_0_rgba(255,255,255,0.04)]">
        <h1 className="text-xl font-black tracking-tight">
          Dev<span className="text-accent">Ref</span>
          <span className="text-muted font-normal text-sm ml-2.5">— Yash</span>
        </h1>
        <SearchBar value={search} onChange={setSearch} />
      </header>

      {/* Tab bar */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onSelect={(slug) => { setSearch(''); setActiveTab(slug) }}
        onDelete={(tab) => setDeleteTarget(tab)}
        onRename={handleRenameTab}
        onColorChange={handleColorTab}
        onAddTab={() => setAddTabOpen(true)}
      />

      {/* Main content */}
      <main className="px-8 py-6">
        {visibleCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[240px] text-muted">
            <p className="text-sm mb-4">
              {search ? `No results for "${search}"` : 'This tab is empty.'}
            </p>
            {!search && currentTab && (
              <button
                onClick={() => setAddCardTab(currentTab)}
                className="px-4 py-2 text-xs font-semibold rounded-md border border-dashed border-border hover:border-success hover:text-success transition-colors"
              >
                + Add Command Card
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {visibleCards.map((card) => {
              const moveCardProps = {
                onMoveCard: (c: Card) => {
                  setMoveCardTarget(c)
                  const first = tabs.find((t) => t.id !== c.tabId)
                  if (first) setMoveCardDestId(first.id)
                },
              }
              return isIpTable(card) ? (
                <IpReferenceCard
                  key={card.id}
                  card={card}
                  onUpdateCode={handleUpdateCode}
                  onRenameCard={handleRenameCard}
                  onDeleteCard={(c) => setDeleteCardTarget(c)}
                  {...moveCardProps}
                />
              ) : (
                <CommandCard
                  key={card.id}
                  card={card}
                  onUpdateCode={handleUpdateCode}
                  onRenameCard={handleRenameCard}
                  onDeleteCard={(c) => setDeleteCardTarget(c)}
                  {...moveCardProps}
                />
              )
            })}
            {/* Add card CTA at the bottom of non-all, non-search views */}
            {!search && activeTab !== 'all' && currentTab && (
              <button
                onClick={() => setAddCardTab(currentTab)}
                className="flex items-center justify-center min-h-[120px] rounded-xl border-2 border-dashed border-border text-muted text-sm font-semibold hover:border-success hover:text-success transition-colors"
              >
                + Add Command Card
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Modals ── */}

      {/* Add tab */}
      <Modal
        open={addTabOpen}
        title="＋ New Tab"
        confirmLabel="Create Tab"
        onClose={() => { setAddTabOpen(false); setNewTabName('') }}
        onConfirm={handleAddTab}
      >
        <ModalInput
          label="Tab name"
          placeholder="e.g. Docker, CI/CD, Scripts…"
          value={newTabName}
          onChange={(e) => setNewTabName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddTab() }}
          autoFocus
        />
      </Modal>

      {/* Delete tab confirmation */}
      <Modal
        open={!!deleteTarget}
        title="Delete tab?"
        message={`Remove <strong>"${deleteTarget?.name}"</strong> and all its commands? This is permanent.`}
        danger
        confirmLabel="Delete"
        cancelLabel="Keep it"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteTab(deleteTarget)}
      />

      {/* Add card — type picker + form */}
      <AddCardModal
        tab={addCardTab}
        onClose={() => setAddCardTab(null)}
        onConfirm={handleAddCard}
      />

      {/* Delete card confirmation */}
      <Modal
        open={!!deleteCardTarget}
        title="Delete card?"
        message={`Remove <strong>"${deleteCardTarget?.title}"</strong>? This is permanent.`}
        danger
        confirmLabel="Delete"
        cancelLabel="Keep it"
        onClose={() => setDeleteCardTarget(null)}
        onConfirm={handleDeleteCard}
      />

      {/* Move card */}
      <Modal
        open={!!moveCardTarget}
        title="⇄ Move Card"
        message={moveCardTarget ? `Move <strong>"${moveCardTarget.title}"</strong> to:` : ''}
        confirmLabel="Move"
        onClose={() => { setMoveCardTarget(null); setMoveCardDestId('') }}
        onConfirm={handleMoveCard}
      >
        {moveDestOptions.length > 0 ? (
          <ModalSelect
            label="Destination tab"
            options={moveDestOptions}
            value={moveCardDestId}
            onChange={(e) => setMoveCardDestId(e.target.value)}
          />
        ) : (
          <p className="text-xs text-muted">
            No other tabs available. Create a new tab first.
          </p>
        )}
      </Modal>
    </>
  )
}
