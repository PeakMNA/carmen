'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronRight, ChevronLeft, MapPin } from 'lucide-react'
import { Location } from '@/lib/types'
import { mockLocations } from '@/lib/mock-data'

interface LocationAssignmentProps {
  assignedLocationIds: string[]
  onAssignedLocationsChange: (locationIds: string[]) => void
}

export function LocationAssignment({ assignedLocationIds, onAssignedLocationsChange }: LocationAssignmentProps) {
  const [availableSearch, setAvailableSearch] = useState('')
  const [assignedSearch, setAssignedSearch] = useState('')
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])

  // Split locations into available and assigned
  const availableLocations = useMemo(() => {
    return mockLocations.filter(location => !assignedLocationIds.includes(location.id))
  }, [assignedLocationIds])

  const assignedLocations = useMemo(() => {
    return mockLocations.filter(location => assignedLocationIds.includes(location.id))
  }, [assignedLocationIds])

  // Filter locations based on search
  const filteredAvailable = useMemo(() => {
    if (!availableSearch) return availableLocations
    const query = availableSearch.toLowerCase()
    return availableLocations.filter(location =>
      location.name.toLowerCase().includes(query) ||
      location.type.toLowerCase().includes(query)
    )
  }, [availableLocations, availableSearch])

  const filteredAssigned = useMemo(() => {
    if (!assignedSearch) return assignedLocations
    const query = assignedSearch.toLowerCase()
    return assignedLocations.filter(location =>
      location.name.toLowerCase().includes(query) ||
      location.type.toLowerCase().includes(query)
    )
  }, [assignedLocations, assignedSearch])

  // Handle location assignment (move to assigned)
  const handleAssign = () => {
    const newAssigned = [...assignedLocationIds, ...selectedAvailable]
    onAssignedLocationsChange(newAssigned)
    setSelectedAvailable([])
  }

  // Handle location removal (move to available)
  const handleRemove = () => {
    const newAssigned = assignedLocationIds.filter(id => !selectedAssigned.includes(id))
    onAssignedLocationsChange(newAssigned)
    setSelectedAssigned([])
  }

  // Toggle selection in available list
  const toggleAvailableSelection = (locationId: string) => {
    setSelectedAvailable(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    )
  }

  // Toggle selection in assigned list
  const toggleAssignedSelection = (locationId: string) => {
    setSelectedAssigned(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    )
  }

  // Helper function to get location type color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hotel: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      restaurant: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      warehouse: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      office: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      kitchen: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      store: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    }
    return colors[type] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }

  const LocationListItem = ({
    location,
    isSelected,
    onToggle
  }: {
    location: Location
    isSelected: boolean
    onToggle: (locationId: string) => void
  }) => {
    return (
      <label
        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors border ${
          isSelected
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
        }`}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(location.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          {/* Location Name with Icon */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(location.type)}`}>
              <MapPin className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {location.name}
            </p>
          </div>

          {/* Location Details */}
          <div className="ml-10 space-y-1">
            {/* Type Badge */}
            <Badge variant="outline" className="text-xs capitalize">
              {location.type}
            </Badge>
          </div>
        </div>
      </label>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
      {/* Assigned Locations Pane (Left - Currently Assigned) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Assigned Locations
            </h3>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
              <Checkbox
                checked={selectedAssigned.length === filteredAssigned.length && filteredAssigned.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAssigned(filteredAssigned.map(l => l.id))
                  } else {
                    setSelectedAssigned([])
                  }
                }}
                className="h-3.5 w-3.5"
              />
              Select All
            </label>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search assigned..."
              value={assignedSearch}
              onChange={(e) => setAssignedSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="p-3 space-y-1 h-96 overflow-y-auto">
          {filteredAssigned.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No locations assigned
            </p>
          ) : (
            filteredAssigned.map(location => (
              <LocationListItem
                key={location.id}
                location={location}
                isSelected={selectedAssigned.includes(location.id)}
                onToggle={toggleAssignedSelection}
              />
            ))
          )}
        </div>
      </div>

      {/* Action Buttons (Center) */}
      <div className="flex flex-col items-center justify-center gap-3">
        <Button
          type="button"
          size="icon"
          onClick={handleAssign}
          disabled={selectedAvailable.length === 0}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={handleRemove}
          disabled={selectedAssigned.length === 0}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Available Locations Pane (Right) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Available Locations
            </h3>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
              <Checkbox
                checked={selectedAvailable.length === filteredAvailable.length && filteredAvailable.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAvailable(filteredAvailable.map(l => l.id))
                  } else {
                    setSelectedAvailable([])
                  }
                }}
                className="h-3.5 w-3.5"
              />
              Select All
            </label>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search locations..."
              value={availableSearch}
              onChange={(e) => setAvailableSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="p-3 space-y-1 h-96 overflow-y-auto">
          {filteredAvailable.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No locations available
            </p>
          ) : (
            filteredAvailable.map(location => (
              <LocationListItem
                key={location.id}
                location={location}
                isSelected={selectedAvailable.includes(location.id)}
                onToggle={toggleAvailableSelection}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
