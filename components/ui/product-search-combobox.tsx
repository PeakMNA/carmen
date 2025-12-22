"use client"

/**
 * Product Search Combobox Component
 *
 * Searchable dropdown for selecting products from a list
 * Displays products in "CODE - NAME" format
 * Uses Command component for better focus handling in dialogs
 *
 * Created: 2025-11-17
 * Updated: 2025-12-20
 */

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import type { Product } from "@/lib/types"

interface ProductSearchComboboxProps {
  products: Product[]
  value?: Product | null
  onChange: (product: Product | null) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function ProductSearchCombobox({
  products,
  value,
  onChange,
  label = "Product",
  placeholder = "Search products...",
  required = false,
  disabled = false,
  className
}: ProductSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Format product for display: "CODE - NAME"
  const formatProduct = (product: Product) => {
    return `${product.productCode} - ${product.productName}`
  }

  // Get display value
  const displayValue = value ? formatProduct(value) : ""

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-10 font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {displayValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[500px] p-0"
          align="start"
          sideOffset={4}
          style={{ zIndex: 9999 }}
        >
          <Command shouldFilter={true}>
            <CommandInput placeholder="Search by code or name..." />
            <CommandList>
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                {products.map((product) => {
                  const isSelected = value?.id === product.id
                  const displayText = formatProduct(product)

                  return (
                    <CommandItem
                      key={product.id}
                      value={displayText}
                      onSelect={() => {
                        onChange(isSelected ? null : product)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{displayText}</span>
                        {product.description && (
                          <span className="text-xs text-muted-foreground">
                            {product.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
