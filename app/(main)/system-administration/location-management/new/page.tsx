"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LocationForm } from "../components/location-form"

export default function NewLocationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      console.log('Creating location:', data)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to the list page on success
      router.push('/system-administration/location-management')
    } catch (error) {
      console.error('Error creating location:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/system-administration/location-management')
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/system-administration/location-management')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Create New Location</h1>
          <p className="text-muted-foreground">
            Add a new inventory location to the system
          </p>
        </div>
      </div>

      {/* Form */}
      <LocationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
