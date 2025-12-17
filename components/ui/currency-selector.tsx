"use client"

/**
 * Currency Selector Component
 *
 * Dropdown for selecting currency with ISO 4217 codes
 * Features:
 * - Search/filter functionality
 * - Common currencies prioritized at top
 * - Displays currency code and symbol
 * - Supports custom currency list or defaults to common currencies
 *
 * Created: 2025-11-17 - Per ARC-2410-001
 */

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface Currency {
  code: string
  name: string
  symbol: string
}

// Common currencies used in hospitality industry
const DEFAULT_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
]

interface CurrencySelectorProps {
  value?: string
  onChange: (value: string) => void
  currencies?: Currency[]
  disabled?: boolean
  className?: string
  placeholder?: string
  emptyText?: string
}

export function CurrencySelector({
  value,
  onChange,
  currencies = DEFAULT_CURRENCIES,
  disabled = false,
  className,
  placeholder = "Select currency...",
  emptyText = "No currency found."
}: CurrencySelectorProps) {
  const [open, setOpen] = React.useState(false)

  const selectedCurrency = currencies.find(currency => currency.code === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          {selectedCurrency ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedCurrency.code}</span>
              <span className="text-muted-foreground">
                {selectedCurrency.symbol} - {selectedCurrency.name}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {currencies.map((currency) => (
              <CommandItem
                key={currency.code}
                value={`${currency.code} ${currency.name}`}
                onSelect={() => {
                  onChange(currency.code)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === currency.code ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-medium min-w-[3rem]">{currency.code}</span>
                  <span className="text-muted-foreground text-sm min-w-[2rem]">
                    {currency.symbol}
                  </span>
                  <span className="text-sm">{currency.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Simple currency display (read-only)
 */
export function CurrencyDisplay({
  code,
  className
}: {
  code: string
  className?: string
}) {
  const currency = DEFAULT_CURRENCIES.find(c => c.code === code)

  if (!currency) {
    return <span className={className}>{code}</span>
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="font-medium">{currency.code}</span>
      <span className="text-muted-foreground text-sm">
        {currency.symbol}
      </span>
    </span>
  )
}
