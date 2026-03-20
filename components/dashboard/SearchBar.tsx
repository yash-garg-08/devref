'use client'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3.5 py-2 w-72">
      <span className="text-muted text-base select-none">⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search commands, IPs, keys…"
        className="bg-transparent outline-none text-text text-sm font-sans w-full placeholder:text-muted"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-muted hover:text-text text-xs transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}
