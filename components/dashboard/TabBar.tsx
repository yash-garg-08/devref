'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import type { Tab, ActiveTab } from '@/types'

// ── Preset colour palette ─────────────────────────────────────────────────────
const TAB_COLORS = [
  '#4f8ef7', '#56d986', '#e05c5c', '#f5a623',
  '#b47cf7', '#38c0c0', '#f76fa3', '#e0c060',
  '#a0c8ff', '#aaffcc',
]

interface TabBarProps {
  tabs: Tab[]
  activeTab: ActiveTab
  onSelect: (slug: ActiveTab) => void
  onDelete: (tab: Tab) => void
  onRename: (tab: Tab, newName: string) => Promise<void>
  onColorChange: (tab: Tab, color: string | null) => Promise<void>
  onAddTab: () => void
}

export default function TabBar({
  tabs,
  activeTab,
  onSelect,
  onDelete,
  onRename,
  onColorChange,
  onAddTab,
}: TabBarProps) {
  return (
    <nav className="flex items-center gap-1 px-8 py-4 border-b border-border overflow-x-auto flex-wrap">
      {/* All tab */}
      <TabItem
        label="All"
        active={activeTab === 'all'}
        onClick={() => onSelect('all')}
      />

      {/* Dynamic tabs */}
      {tabs.map((tab) => (
        <EditableTabItem
          key={tab.id}
          tab={tab}
          active={activeTab === tab.slug}
          onClick={() => onSelect(tab.slug)}
          onDelete={() => onDelete(tab)}
          onRename={(newName) => onRename(tab, newName)}
          onColorChange={(color) => onColorChange(tab, color)}
        />
      ))}

      {/* Add new tab */}
      <button
        onClick={onAddTab}
        className="px-3.5 py-1.5 rounded-md text-xs font-bold border border-dashed border-border text-muted hover:text-success hover:border-success transition-colors whitespace-nowrap tracking-wide"
      >
        ＋ New Tab
      </button>
    </nav>
  )
}

// ── Simple non-editable tab (used for "All") ─────────────────────────────────
function TabItem({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-1.5 rounded-md text-xs font-semibold border transition-all whitespace-nowrap tracking-wide',
        active
          ? 'bg-accent text-white border-accent'
          : 'border-transparent text-text hover:bg-surface2',
      )}
    >
      {label}
    </button>
  )
}

// ── Colour picker portal ──────────────────────────────────────────────────────
function ColorPickerPortal({
  currentColor,
  anchorRect,
  onSelect,
  onClose,
}: {
  currentColor: string | null
  anchorRect: DOMRect
  onSelect: (color: string | null) => void
  onClose: () => void
}) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid immediately closing from the right-click that opened it
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchorRect.bottom + 6,
    left: anchorRect.left,
    zIndex: 9999,
    background: 'rgb(var(--color-surface))',
    border: '1px solid rgb(var(--color-border))',
    borderRadius: '10px',
    padding: '10px 14px',
    boxShadow: 'var(--shadow-dropdown)',
    minWidth: '180px',
  }

  return createPortal(
    <div ref={popupRef} style={style}>
      <p
        style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgb(var(--color-muted))',
          marginBottom: '8px',
        }}
      >
        Tab Colour
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {TAB_COLORS.map((color) => (
          <button
            key={color}
            title={color}
            onClick={() => onSelect(color)}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: color,
              border: currentColor === color ? '3px solid rgb(var(--color-surface))' : '2px solid transparent',
              boxShadow: currentColor === color ? `0 0 0 2px ${color}` : 'none',
              cursor: 'pointer',
              transition: 'transform 0.1s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.25)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          />
        ))}
        {/* Clear / remove colour */}
        <button
          title="Remove colour"
          onClick={() => onSelect(null)}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: '2px dashed rgb(var(--color-muted))',
            background: 'rgb(var(--color-surface2))',
            color: 'rgb(var(--color-muted))',
            fontSize: '0.6rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'transform 0.1s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.25)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        >
          ✕
        </button>
      </div>
    </div>,
    document.body,
  )
}

// ── Tab dropdown menu (portal) ────────────────────────────────────────────────
function TabDropdown({
  anchorRect,
  currentColor,
  onRename,
  onColor,
  onDelete,
  onClose,
}: {
  anchorRect: DOMRect
  currentColor: string | null
  onRename: () => void
  onColor: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [onClose])

  const style: React.CSSProperties = {
    position: 'fixed',
    top:  anchorRect.bottom + 6,
    left: anchorRect.left,
    zIndex: 9999,
    boxShadow: 'var(--shadow-dropdown)',
  }

  const itemBase = 'flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left rounded-md transition-colors'

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="min-w-[140px] rounded-lg border border-border bg-surface p-1 animate-slide-up"
    >
      <button
        onClick={() => { onRename(); onClose() }}
        className={`${itemBase} text-text hover:bg-surface2`}
      >
        <span className="text-muted">✎</span> Rename
      </button>
      <button
        onClick={() => { onColor(); onClose() }}
        className={`${itemBase} text-text hover:bg-surface2`}
      >
        <span className="text-muted">◉</span> Color
        {currentColor && (
          <span
            className="ml-auto w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: currentColor }}
          />
        )}
      </button>
      <div className="my-1 border-t border-border/60" />
      <button
        onClick={() => { onDelete(); onClose() }}
        className={`${itemBase} text-danger hover:bg-danger/10`}
      >
        <span>✕</span> Delete
      </button>
    </div>,
    document.body,
  )
}

// ── Editable tab ──────────────────────────────────────────────────────────────
function EditableTabItem({
  tab,
  active,
  onClick,
  onDelete,
  onRename,
  onColorChange,
}: {
  tab: Tab
  active: boolean
  onClick: () => void
  onDelete: () => void
  onRename: (newName: string) => Promise<void>
  onColorChange: (color: string | null) => void
}) {
  const [renaming, setRenaming]         = useState(false)
  const [draft, setDraft]               = useState(tab.name)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownAnchor, setDropdownAnchor] = useState<DOMRect | null>(null)
  const [showPicker, setShowPicker]     = useState(false)
  const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null)
  const inputRef                        = useRef<HTMLInputElement>(null)
  const tabRef                          = useRef<HTMLDivElement>(null)
  const menuBtnRef                      = useRef<HTMLButtonElement>(null)

  function startRename() {
    setDraft(tab.name)
    setRenaming(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  async function commitRename() {
    const name = draft.trim() || tab.name
    setRenaming(false)
    if (name !== tab.name) await onRename(name)
  }

  function openDropdown(e: React.MouseEvent) {
    e.stopPropagation()
    if (menuBtnRef.current) setDropdownAnchor(menuBtnRef.current.getBoundingClientRect())
    setDropdownOpen(true)
  }

  function openColorPicker() {
    if (tabRef.current) setPickerAnchor(tabRef.current.getBoundingClientRect())
    setShowPicker(true)
  }

  // When a custom colour is set:
  //   active   → solid fill + white text
  //   inactive → subtle tinted background + coloured border + coloured text
  const colorStyle: React.CSSProperties = tab.color
    ? {
        borderColor: tab.color,
        color: active ? '#fff' : tab.color,
        backgroundColor: active
          ? tab.color
          : `${tab.color}28`,   // ~16 % opacity tint so the colour reads immediately
      }
    : {}

  return (
    <>
      <div
        ref={tabRef}
        className={cn(
          'group relative flex items-center gap-1 px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-all whitespace-nowrap tracking-wide cursor-pointer select-none',
          !tab.color && (active
            ? 'bg-accent text-white border-accent'
            : 'border-transparent text-text hover:bg-surface2'),
          tab.color && 'hover:brightness-110',
        )}
        style={colorStyle}
        onClick={() => { if (!renaming) onClick() }}
      >
        {renaming ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter')  { e.preventDefault(); inputRef.current?.blur() }
              if (e.key === 'Escape') { setRenaming(false); setDraft(tab.name) }
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent outline-none border-b border-white/40 min-w-[60px] w-auto"
            style={{ width: `${Math.max(draft.length, 6) * 8}px` }}
            autoFocus
          />
        ) : (
          <span>{tab.name}</span>
        )}

        {/* ⋯ menu trigger — appears on hover */}
        {!renaming && (
          <button
            ref={menuBtnRef}
            onClick={openDropdown}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 w-4 h-4 flex items-center justify-center rounded text-[11px] leading-none hover:bg-white/10 transition-all ml-0.5"
            title="Tab options"
          >
            ···
          </button>
        )}
      </div>

      {/* Dropdown */}
      {dropdownOpen && dropdownAnchor && (
        <TabDropdown
          anchorRect={dropdownAnchor}
          currentColor={tab.color}
          onRename={() => { startRename() }}
          onColor={openColorPicker}
          onDelete={onDelete}
          onClose={() => setDropdownOpen(false)}
        />
      )}

      {/* Colour picker portal */}
      {showPicker && pickerAnchor && (
        <ColorPickerPortal
          currentColor={tab.color}
          anchorRect={pickerAnchor}
          onSelect={(color) => { onColorChange(color); setShowPicker(false) }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
