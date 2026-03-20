'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { CARD_TYPES, type CardTypeDefinition } from '@/lib/cardTypes'
import type { Tab } from '@/types'

interface AddCardModalProps {
  tab: Tab | null          // null → closed
  onClose: () => void
  onConfirm: (type: string, title: string, code: string) => void
}

type Step = 'pick-type' | 'fill-form'

export default function AddCardModal({ tab, onClose, onConfirm }: AddCardModalProps) {
  const open = !!tab

  const [step, setStep]             = useState<Step>('pick-type')
  const [selectedType, setSelected] = useState<CardTypeDefinition>(CARD_TYPES[0])
  const [title, setTitle]           = useState('')
  const [code, setCode]             = useState('')
  const titleRef                    = useRef<HTMLInputElement>(null)

  // Reset state whenever the modal opens
  useEffect(() => {
    if (open) {
      setStep('pick-type')
      setSelected(CARD_TYPES[0])
      setTitle('')
      setCode('')
    }
  }, [open])

  // Focus title input when we advance to the form step
  useEffect(() => {
    if (step === 'fill-form') {
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [step])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (step === 'fill-form') setStep('pick-type')
        else onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, step, onClose])

  if (!open) return null

  function handleConfirm() {
    if (!title.trim()) return
    const finalCode = selectedType.fields.includes('code') ? code : selectedType.defaultCode
    onConfirm(selectedType.id, title.trim(), finalCode)
  }

  const canConfirm =
    title.trim().length > 0 &&
    (!selectedType.fields.includes('code') || code.trim().length > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-[480px] max-w-[94vw] rounded-xl bg-surface border border-border animate-slide-up overflow-hidden" style={{ boxShadow: 'var(--shadow-modal)' }}>

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            {step === 'fill-form' && (
              <button
                onClick={() => setStep('pick-type')}
                className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-text hover:bg-surface2 transition-colors text-xs mr-0.5"
                title="Back"
              >
                ←
              </button>
            )}
            <h2 className="text-base font-black text-text">
              {step === 'pick-type' ? 'Add Card' : `New ${selectedType.label}`}
            </h2>
          </div>
          {step === 'pick-type' && (
            <p className="text-xs text-muted mt-0.5">Choose the type of card to add to <strong className="text-text font-semibold">{tab?.name}</strong></p>
          )}
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5">

          {/* Step 1 — type picker */}
          {step === 'pick-type' && (
            <div className="grid grid-cols-2 gap-2.5">
              {CARD_TYPES.map((ct) => (
                <TypeTile
                  key={ct.id}
                  def={ct}
                  selected={selectedType.id === ct.id}
                  onSelect={() => setSelected(ct)}
                />
              ))}
            </div>
          )}

          {/* Step 2 — form fields */}
          {step === 'fill-form' && (
            <div className="space-y-3">
              {/* Title — always shown */}
              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  Card title
                </label>
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canConfirm) handleConfirm() }}
                  placeholder={selectedType.id === 'ip-table' ? 'e.g. Prod Servers, EU Region…' : 'e.g. SSH Tunnel, Docker Prune…'}
                  className="w-full bg-codebg border border-border rounded-md px-3 py-2 text-xs font-mono text-text outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Code — only for types that need it */}
              {selectedType.fields.includes('code') && (
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                    Command / content
                  </label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="# paste your command here"
                    className="w-full bg-codebg border border-border rounded-md px-3 py-2 text-xs font-mono text-text outline-none focus:border-accent transition-colors resize-y min-h-[110px] leading-relaxed"
                  />
                </div>
              )}

              {/* Info note for types with no extra fields */}
              {selectedType.fields.length === 0 && (
                <p className="text-[11px] text-muted leading-relaxed bg-surface2 border border-border/60 rounded-lg px-3 py-2.5">
                  {selectedType.id === 'ip-table'
                    ? 'The card will start empty — you can add server entries directly on the card once it\'s created.'
                    : 'You can fill in the content after the card is created.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-5 flex gap-2 justify-end">
          <button
            onClick={step === 'fill-form' ? () => setStep('pick-type') : onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface2 text-text hover:opacity-80 transition-opacity"
          >
            {step === 'fill-form' ? 'Back' : 'Cancel'}
          </button>

          {step === 'pick-type' ? (
            <button
              onClick={() => setStep('fill-form')}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-accent border border-accent text-white hover:opacity-85 transition-opacity"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-md text-white transition-opacity',
                canConfirm
                  ? 'bg-accent border border-accent hover:opacity-85'
                  : 'bg-accent/40 border border-accent/40 cursor-not-allowed',
              )}
            >
              Add Card
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Type picker tile ───────────────────────────────────────────────────────────
function TypeTile({
  def,
  selected,
  onSelect,
}: {
  def: CardTypeDefinition
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative text-left rounded-lg border px-4 py-3.5 transition-all cursor-pointer group',
        selected
          ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(79,142,247,0.4)]'
          : 'border-border bg-surface2 hover:border-border/80 hover:bg-surface2/80',
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center text-white text-[9px] font-bold leading-none">
          ✓
        </span>
      )}

      <div className="text-xl mb-2 leading-none">{def.icon}</div>
      <div className={cn('text-xs font-bold mb-0.5', selected ? 'text-accent' : 'text-text')}>
        {def.label}
      </div>
      <div className="text-[11px] text-muted leading-snug">{def.description}</div>
    </button>
  )
}
