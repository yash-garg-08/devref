'use client'

import { useState, useRef, useEffect } from 'react'

interface CodeBlockProps {
  code: string
  onSave: (newCode: string) => Promise<void>
}

export default function CodeBlock({ code, onSave }: CodeBlockProps) {
  const [editing, setEditing]   = useState(false)
  const [value, setValue]       = useState(code)
  const [saving, setSaving]     = useState(false)
  const [copied, setCopied]     = useState(false)
  const textareaRef             = useRef<HTMLTextAreaElement>(null)

  // Keep local value in sync if parent updates the code prop
  useEffect(() => { setValue(code) }, [code])

  // Auto-grow textarea
  useEffect(() => {
    if (editing && textareaRef.current) {
      const ta = textareaRef.current
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
    }
  }, [editing, value])

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(value)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="relative rounded-md border border-border bg-codebg overflow-hidden">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {editing ? (
          <>
            <button
              onClick={() => { setEditing(false); setValue(code) }}
              className="px-2 py-0.5 text-xxs font-semibold rounded border border-danger/50 text-danger bg-surface2 hover:border-danger transition-colors"
            >
              ✕ cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-2 py-0.5 text-xxs font-semibold rounded border border-success/50 text-success bg-surface2 hover:border-success transition-colors disabled:opacity-50"
            >
              {saving ? 'saving…' : '✓ save'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-0.5 text-xxs font-semibold rounded border border-border text-muted bg-surface2 hover:text-warning hover:border-warning transition-colors"
            >
              ✎ edit
            </button>
            <button
              onClick={handleCopy}
              className="px-2 py-0.5 text-xxs font-semibold rounded border border-border text-muted bg-surface2 hover:text-accent hover:border-accent transition-colors"
            >
              {copied ? '✓ copied' : 'copy'}
            </button>
          </>
        )}
      </div>

      {editing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          className="w-full bg-transparent font-mono text-xs text-text leading-relaxed p-3 pt-9 outline-none resize-none min-h-[80px]"
          autoFocus
        />
      ) : (
        <pre className="p-3 pt-9 overflow-x-auto">
          <code className="font-mono text-xs leading-relaxed whitespace-pre" style={{ color: 'rgb(var(--color-codetext))' }}>
            {code}
          </code>
        </pre>
      )}
    </div>
  )
}
