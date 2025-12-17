"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Unit } from "@/lib/types"

const unitSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol must be 10 characters or less"),
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
  category: z.enum(["weight", "volume", "length", "count", "time", "temperature", "serving"], {
    required_error: "Please select a unit category",
  }),
  isActive: z.boolean().default(true),
})

type UnitFormValues = z.infer<typeof unitSchema>

interface UnitFormProps {
  unit?: Unit
  onSuccess: (data: UnitFormValues) => void
  onCancel: () => void
}

export function UnitForm({ unit, onSuccess, onCancel }: UnitFormProps) {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      symbol: unit?.symbol || "",
      name: unit?.name || "",
      category: unit?.category || "weight",
      isActive: unit?.isActive ?? true,
    },
  })

  function onSubmit(data: UnitFormValues) {
    console.log(data)
    onSuccess(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                A short identifier for the unit (e.g., kg, L, pc)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The full name of the unit (e.g., Kilogram, Liter, Piece)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="length">Length</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="serving">Serving</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The measurement category this unit belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Whether this unit is active and can be used in the system
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  )
} 