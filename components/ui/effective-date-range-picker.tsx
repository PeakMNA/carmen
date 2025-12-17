"use client"

/**
 * Effective Date Range Picker Component
 *
 * Specialized date range picker for price list effective dates with:
 * - Required start date (cannot be in past)
 * - Optional end date (null = open-ended)
 * - "Open-ended" toggle option
 * - Date range validation (end >= start)
 * - Visual feedback for validation errors
 *
 * Created: 2025-11-17 - Per ARC-2410-001
 */

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Infinity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export interface EffectiveDateRange {
  startDate: Date
  endDate?: Date | null
}

interface EffectiveDateRangePickerProps {
  value: EffectiveDateRange | undefined
  onChange: (value: EffectiveDateRange | undefined) => void
  className?: string
  disabled?: boolean
  error?: string
  startLabel?: string
  endLabel?: string
  openEndedLabel?: string
  placeholder?: string
}

export function EffectiveDateRangePicker({
  value,
  onChange,
  className,
  disabled = false,
  error,
  startLabel = "Effective Start Date",
  endLabel = "Effective End Date (optional)",
  openEndedLabel = "Open-ended (no end date)",
  placeholder = "Select effective date range"
}: EffectiveDateRangePickerProps) {
  const [isOpenEnded, setIsOpenEnded] = React.useState(value?.endDate === null || value?.endDate === undefined)
  const [startDate, setStartDate] = React.useState<Date | undefined>(value?.startDate)
  const [endDate, setEndDate] = React.useState<Date | undefined>(value?.endDate || undefined)
  const [startPopoverOpen, setStartPopoverOpen] = React.useState(false)
  const [endPopoverOpen, setEndPopoverOpen] = React.useState(false)

  // Validation
  const today = React.useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const startDateError = React.useMemo(() => {
    if (!startDate) return null
    if (startDate < today) return "Start date cannot be in the past"
    return null
  }, [startDate, today])

  const endDateError = React.useMemo(() => {
    if (!endDate || !startDate || isOpenEnded) return null
    if (endDate < startDate) return "End date must be on or after start date"
    return null
  }, [endDate, startDate, isOpenEnded])

  const hasError = !!error || !!startDateError || !!endDateError

  // Handle open-ended toggle
  const handleOpenEndedChange = (checked: boolean) => {
    setIsOpenEnded(checked)
    if (checked) {
      setEndDate(undefined)
      if (startDate) {
        onChange({ startDate, endDate: null })
      }
    }
  }

  // Handle start date change
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      onChange({
        startDate: date,
        endDate: isOpenEnded ? null : endDate
      })
    }
    setStartPopoverOpen(false)
  }

  // Handle end date change
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    if (startDate) {
      onChange({
        startDate,
        endDate: date || null
      })
    }
    setEndPopoverOpen(false)
  }

  return (
    <div className={cn("grid gap-4", className)}>
      {/* Start Date */}
      <div className="grid gap-2">
        <Label htmlFor="start-date" className="flex items-center gap-2">
          {startLabel}
          <span className="text-destructive">*</span>
        </Label>
        <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              id="start-date"
              variant={startDateError ? "destructive" : "outline"}
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground",
                hasError && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartDateChange}
              disabled={(date) => date < today}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {startDateError && (
          <p className="text-sm text-destructive">{startDateError}</p>
        )}
      </div>

      {/* Open-ended checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="open-ended"
          checked={isOpenEnded}
          onCheckedChange={handleOpenEndedChange}
          disabled={disabled}
        />
        <Label
          htmlFor="open-ended"
          className="text-sm font-normal flex items-center gap-2 cursor-pointer"
        >
          {openEndedLabel}
          {isOpenEnded && <Infinity className="h-4 w-4 text-muted-foreground" />}
        </Label>
      </div>

      {/* End Date (only if not open-ended) */}
      {!isOpenEnded && (
        <div className="grid gap-2">
          <Label htmlFor="end-date">{endLabel}</Label>
          <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant={endDateError ? "destructive" : "outline"}
                disabled={disabled || !startDate}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                  endDateError && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Select end date (optional)</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateChange}
                disabled={(date) => {
                  if (!startDate) return true
                  return date < startDate
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {endDateError && (
            <p className="text-sm text-destructive">{endDateError}</p>
          )}
        </div>
      )}

      {/* External error message */}
      {error && !startDateError && !endDateError && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Helper text */}
      <p className="text-sm text-muted-foreground">
        {isOpenEnded
          ? "Price list will remain effective indefinitely from the start date"
          : "Price list will be valid from start date until end date"}
      </p>
    </div>
  )
}
