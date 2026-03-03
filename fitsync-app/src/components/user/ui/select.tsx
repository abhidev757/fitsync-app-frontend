"use client"

import type React from "react"
import { useState, useRef, useEffect, createContext, useContext } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

// ── Context ──────────────────────────────────────────────────────
interface SelectContextValue {
  value: string
  onSelect: (value: string) => void
}
const SelectContext = createContext<SelectContextValue>({ value: "", onSelect: () => {} })

// ── Select ───────────────────────────────────────────────────────
interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

const Select = ({ value, onValueChange, children, placeholder, className }: SelectProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (selected: string) => {
    onValueChange(selected)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value, onSelect: handleSelect }}>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d9ff00] focus:ring-offset-2 focus:ring-offset-[#121212]",
            className,
          )}
        >
          {value || <span className="text-gray-400">{placeholder}</span>}
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-700 bg-[#1a1a1a] p-1 shadow-lg">
            {children}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  )
}

// ── SelectItem ───────────────────────────────────────────────────
interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const { value: selected, onSelect } = useContext(SelectContext)
  const isSelected = selected === value

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-white outline-none hover:bg-gray-700 focus:bg-gray-700",
        isSelected && "bg-gray-700",
        className,
      )}
      onClick={() => onSelect(value)}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-[#d9ff00]" />}
      </span>
      {children}
    </button>
  )
}

export { Select, SelectItem }
