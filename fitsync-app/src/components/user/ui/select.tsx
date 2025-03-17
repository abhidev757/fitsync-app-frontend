"use client"

import type React from "react"
import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

const Select = ({ value, children, placeholder, className }: SelectProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d9ff00] focus:ring-offset-2 focus:ring-offset-[#121212]",
          className,
        )}
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-700 bg-[#1a1a1a] p-1 shadow-lg">
          {children}
        </div>
      )}
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  onClick?: (value: string) => void
}

const SelectItem = ({ value, children, className, onClick }: SelectItemProps) => {
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-white outline-none hover:bg-gray-700 focus:bg-gray-700",
        className,
      )}
      onClick={() => onClick?.(value)}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Check className="h-4 w-4" />
      </span>
      {children}
    </button>
  )
}

export { Select, SelectItem }

