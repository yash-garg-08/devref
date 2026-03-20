'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  title: string
  message?: string
  danger?: boolean
  confirmLabel?: string
  cancelLabel?: string
  children?: React.ReactNode       // extra form fields
  onConfirm: () => void
  onClose: () => void
}

export default function Modal({
  open,
  title,
  message,
  danger = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  children,
  onConfirm,
  onClose,
}: ModalProps) {
  const boxRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={boxRef}
        className={cn(
          'w-[440px] max-w-[92vw] rounded-xl bg-surface border p-6 shadow-2xl animate-slide-up',
          danger ? 'border-danger/40 shadow-[0_0_0_1px_rgba(224,92,92,0.15),0_20px_60px_rgba(0,0,0,0.6)]'
                 : 'border-border shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
        )}
      >
        <h2 className={cn('text-base font-black mb-1', danger ? 'text-danger' : 'text-text')}>{title}</h2>

        {message && (
          <p
            className="text-xs text-muted mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}

        {children && <div className="mb-4 space-y-3">{children}</div>}

        <div className="flex gap-2 justify-end mt-5">
          {cancelLabel && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface2 text-text hover:opacity-80 transition-opacity"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-1.5 text-xs font-semibold rounded-md text-white transition-opacity hover:opacity-85',
              danger ? 'bg-danger border border-danger' : 'bg-accent border border-accent',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reusable field components for use inside Modal ───────────────────────────

export function ModalInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && (
        <label className="block text-xxs font-semibold text-muted uppercase tracking-widest mb-1">
          {label}
        </label>
      )}
      <input
        className="w-full bg-codebg border border-border rounded-md px-3 py-2 text-xs font-mono text-text outline-none focus:border-accent transition-colors"
        {...props}
      />
    </div>
  )
}

export function ModalTextarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div>
      {label && (
        <label className="block text-xxs font-semibold text-muted uppercase tracking-widest mb-1">
          {label}
        </label>
      )}
      <textarea
        className="w-full bg-codebg border border-border rounded-md px-3 py-2 text-xs font-mono text-text outline-none focus:border-accent transition-colors resize-y min-h-[110px] leading-relaxed"
        {...props}
      />
    </div>
  )
}

export function ModalSelect({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      {label && (
        <label className="block text-xxs font-semibold text-muted uppercase tracking-widest mb-1">
          {label}
        </label>
      )}
      <select
        className="w-full bg-codebg border border-border rounded-md px-3 py-2 text-xs font-mono text-text outline-none focus:border-accent transition-colors cursor-pointer appearance-none"
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface2">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
