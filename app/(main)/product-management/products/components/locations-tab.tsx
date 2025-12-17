import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { PlusIcon, TrashIcon, X, Tag, ChevronDown, Settings, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface LocationAssignment {
  id: string
  locationId: string
  locationName: string
  locationCode: string
  shelfId: string
  shelfName: string
  minQuantity: number
  maxQuantity: number
  reorderPoint: number
  parLevel: number
  tags?: string[]
}

interface LocationTag {
  id: string
  name: string
  color: string
  locationId: string
}

interface Shelf {
  id: string
  name: string
  code: string
  locationId: string
}

interface LocationsTabProps {
  isEditing: boolean
  locations?: LocationAssignment[]
  onAddLocation?: (location: LocationAssignment) => void
  onUpdateLocation?: (id: string, updates: Partial<LocationAssignment>) => void
  onRemoveLocation?: (id: string) => void
}

// Mock data for available locations
const availableLocations = [
  { id: 'LOC1', name: 'Main Kitchen', code: 'MK-001' },
  { id: 'LOC2', name: 'Dry Storage', code: 'DS-001' },
  { id: 'LOC3', name: 'Cold Storage', code: 'CS-001' },
  { id: 'LOC4', name: 'Bar Storage', code: 'BS-001' },
  { id: 'LOC5', name: 'Prep Kitchen', code: 'PK-001' },
]

// Mock data for available shelves per location
const availableShelves: Shelf[] = [
  // Main Kitchen shelves
  { id: 'SH1-1', name: 'Shelf A1', code: 'MK-A1', locationId: 'LOC1' },
  { id: 'SH1-2', name: 'Shelf A2', code: 'MK-A2', locationId: 'LOC1' },
  { id: 'SH1-3', name: 'Shelf B1', code: 'MK-B1', locationId: 'LOC1' },
  // Dry Storage shelves
  { id: 'SH2-1', name: 'Rack 1', code: 'DS-R1', locationId: 'LOC2' },
  { id: 'SH2-2', name: 'Rack 2', code: 'DS-R2', locationId: 'LOC2' },
  { id: 'SH2-3', name: 'Rack 3', code: 'DS-R3', locationId: 'LOC2' },
  { id: 'SH2-4', name: 'Floor Storage', code: 'DS-FL', locationId: 'LOC2' },
  // Cold Storage shelves
  { id: 'SH3-1', name: 'Freezer Shelf 1', code: 'CS-F1', locationId: 'LOC3' },
  { id: 'SH3-2', name: 'Freezer Shelf 2', code: 'CS-F2', locationId: 'LOC3' },
  { id: 'SH3-3', name: 'Chiller Shelf 1', code: 'CS-C1', locationId: 'LOC3' },
  { id: 'SH3-4', name: 'Chiller Shelf 2', code: 'CS-C2', locationId: 'LOC3' },
  // Bar Storage shelves
  { id: 'SH4-1', name: 'Top Shelf', code: 'BS-T1', locationId: 'LOC4' },
  { id: 'SH4-2', name: 'Middle Shelf', code: 'BS-M1', locationId: 'LOC4' },
  { id: 'SH4-3', name: 'Bottom Shelf', code: 'BS-B1', locationId: 'LOC4' },
  // Prep Kitchen shelves
  { id: 'SH5-1', name: 'Prep Station 1', code: 'PK-P1', locationId: 'LOC5' },
  { id: 'SH5-2', name: 'Prep Station 2', code: 'PK-P2', locationId: 'LOC5' },
]

// Available tag colors for creating new tags
const tagColorOptions = [
  { value: 'bg-red-100 text-red-700', label: 'Red', preview: 'bg-red-100' },
  { value: 'bg-blue-100 text-blue-700', label: 'Blue', preview: 'bg-blue-100' },
  { value: 'bg-green-100 text-green-700', label: 'Green', preview: 'bg-green-100' },
  { value: 'bg-amber-100 text-amber-700', label: 'Amber', preview: 'bg-amber-100' },
  { value: 'bg-purple-100 text-purple-700', label: 'Purple', preview: 'bg-purple-100' },
  { value: 'bg-pink-100 text-pink-700', label: 'Pink', preview: 'bg-pink-100' },
  { value: 'bg-teal-100 text-teal-700', label: 'Teal', preview: 'bg-teal-100' },
  { value: 'bg-orange-100 text-orange-700', label: 'Orange', preview: 'bg-orange-100' },
  { value: 'bg-cyan-100 text-cyan-700', label: 'Cyan', preview: 'bg-cyan-100' },
  { value: 'bg-indigo-100 text-indigo-700', label: 'Indigo', preview: 'bg-indigo-100' },
  { value: 'bg-lime-100 text-lime-700', label: 'Lime', preview: 'bg-lime-100' },
  { value: 'bg-violet-100 text-violet-700', label: 'Violet', preview: 'bg-violet-100' },
]

// Initial predefined tags grouped by location
const initialTags: LocationTag[] = [
  // Main Kitchen tags
  { id: 'TAG-MK-1', name: 'High Priority', color: 'bg-red-100 text-red-700', locationId: 'LOC1' },
  { id: 'TAG-MK-2', name: 'Daily Use', color: 'bg-blue-100 text-blue-700', locationId: 'LOC1' },
  { id: 'TAG-MK-3', name: 'Prep Required', color: 'bg-amber-100 text-amber-700', locationId: 'LOC1' },
  { id: 'TAG-MK-4', name: 'Chef Special', color: 'bg-purple-100 text-purple-700', locationId: 'LOC1' },
  // Dry Storage tags
  { id: 'TAG-DS-1', name: 'Bulk Item', color: 'bg-green-100 text-green-700', locationId: 'LOC2' },
  { id: 'TAG-DS-2', name: 'Long Shelf Life', color: 'bg-teal-100 text-teal-700', locationId: 'LOC2' },
  { id: 'TAG-DS-3', name: 'Heavy Item', color: 'bg-orange-100 text-orange-700', locationId: 'LOC2' },
  { id: 'TAG-DS-4', name: 'Fragile', color: 'bg-pink-100 text-pink-700', locationId: 'LOC2' },
  // Cold Storage tags
  { id: 'TAG-CS-1', name: 'Frozen', color: 'bg-cyan-100 text-cyan-700', locationId: 'LOC3' },
  { id: 'TAG-CS-2', name: 'Chilled', color: 'bg-sky-100 text-sky-700', locationId: 'LOC3' },
  { id: 'TAG-CS-3', name: 'Perishable', color: 'bg-rose-100 text-rose-700', locationId: 'LOC3' },
  { id: 'TAG-CS-4', name: 'Temperature Sensitive', color: 'bg-indigo-100 text-indigo-700', locationId: 'LOC3' },
  // Bar Storage tags
  { id: 'TAG-BS-1', name: 'Spirits', color: 'bg-amber-100 text-amber-700', locationId: 'LOC4' },
  { id: 'TAG-BS-2', name: 'Mixers', color: 'bg-lime-100 text-lime-700', locationId: 'LOC4' },
  { id: 'TAG-BS-3', name: 'Garnish', color: 'bg-emerald-100 text-emerald-700', locationId: 'LOC4' },
  { id: 'TAG-BS-4', name: 'Premium', color: 'bg-yellow-100 text-yellow-700', locationId: 'LOC4' },
  // Prep Kitchen tags
  { id: 'TAG-PK-1', name: 'Pre-Cut', color: 'bg-violet-100 text-violet-700', locationId: 'LOC5' },
  { id: 'TAG-PK-2', name: 'Marinating', color: 'bg-fuchsia-100 text-fuchsia-700', locationId: 'LOC5' },
  { id: 'TAG-PK-3', name: 'Ready to Cook', color: 'bg-green-100 text-green-700', locationId: 'LOC5' },
  { id: 'TAG-PK-4', name: 'Batch Prep', color: 'bg-blue-100 text-blue-700', locationId: 'LOC5' },
]

export function LocationsTab({
  isEditing,
  locations = [],
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation
}: LocationsTabProps) {
  const [selectedLocation, setSelectedLocation] = React.useState('')
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [minQuantity, setMinQuantity] = React.useState('')
  const [maxQuantity, setMaxQuantity] = React.useState('')
  const [reorderPoint, setReorderPoint] = React.useState('')
  const [parLevel, setParLevel] = React.useState('')

  // State for available tags (can be modified by user)
  const [availableTags, setAvailableTags] = React.useState<LocationTag[]>(initialTags)

  // State for tag management dialog
  const [isTagManagementOpen, setIsTagManagementOpen] = React.useState(false)
  const [newTagName, setNewTagName] = React.useState('')
  const [newTagColor, setNewTagColor] = React.useState(tagColorOptions[0].value)
  const [newTagLocation, setNewTagLocation] = React.useState('')

  // Helper to get tag color by tag name and location
  const getTagColor = (tagName: string, locationId: string) => {
    const tag = availableTags.find(t => t.name === tagName && t.locationId === locationId)
    return tag?.color || 'bg-gray-100 text-gray-700'
  }

  // Handle creating a new tag
  const handleCreateTag = () => {
    if (!newTagName.trim() || !newTagLocation) return

    const newTag: LocationTag = {
      id: `TAG-${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
      locationId: newTagLocation
    }

    setAvailableTags(prev => [...prev, newTag])

    // Reset form
    setNewTagName('')
    setNewTagColor(tagColorOptions[0].value)
    setNewTagLocation('')
  }

  // Handle deleting a tag from available tags
  const handleDeleteAvailableTag = (tagId: string) => {
    const tagToDelete = availableTags.find(t => t.id === tagId)
    if (!tagToDelete) return

    // Remove from available tags
    setAvailableTags(prev => prev.filter(t => t.id !== tagId))

    // Also remove from any assignments that have this tag
    locations.forEach(assignment => {
      if (assignment.tags?.includes(tagToDelete.name)) {
        onUpdateLocation?.(assignment.id, {
          tags: assignment.tags.filter(t => t !== tagToDelete.name)
        })
      }
    })
  }

  // Reset tags when location changes
  React.useEffect(() => {
    setSelectedTags([])
  }, [selectedLocation])

  const handleAddLocation = () => {
    if (!selectedLocation) return

    const location = availableLocations.find(loc => loc.id === selectedLocation)
    if (!location) return

    const newAssignment: LocationAssignment = {
      id: `${location.id}-${Date.now()}`,
      locationId: location.id,
      locationName: location.name,
      locationCode: location.code,
      shelfId: '',
      shelfName: '',
      minQuantity: Number(minQuantity) || 0,
      maxQuantity: Number(maxQuantity) || 0,
      reorderPoint: Number(reorderPoint) || 0,
      parLevel: Number(parLevel) || 0,
      tags: selectedTags
    }

    onAddLocation?.(newAssignment)

    // Reset form
    setSelectedLocation('')
    setSelectedTags([])
    setMinQuantity('')
    setMaxQuantity('')
    setReorderPoint('')
    setParLevel('')
  }

  // Helper function to get shelves for a specific location
  const getShelvesForLocation = (locationId: string) => {
    return availableShelves.filter(shelf => shelf.locationId === locationId)
  }

  // Helper function to get tags for a specific location
  const getTagsForLocation = (locationId: string) => {
    return availableTags.filter(tag => tag.locationId === locationId)
  }

  // Handle adding a tag to an assignment
  const handleAddTag = (assignmentId: string, tagName: string) => {
    const assignment = locations.find(l => l.id === assignmentId)
    if (!assignment) return

    const currentTags = assignment.tags || []
    if (!currentTags.includes(tagName)) {
      onUpdateLocation?.(assignmentId, { tags: [...currentTags, tagName] })
    }
  }

  // Handle removing a tag from an assignment
  const handleRemoveTag = (assignmentId: string, tagName: string) => {
    const assignment = locations.find(l => l.id === assignmentId)
    if (!assignment) return

    const currentTags = assignment.tags || []
    onUpdateLocation?.(assignmentId, { tags: currentTags.filter(t => t !== tagName) })
  }

  const unassignedLocations = availableLocations.filter(
    loc => !locations.some(assignment => assignment.locationId === loc.id)
  )

  return (
    <div className="space-y-6">
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Add Location Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              <div className="col-span-2">
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedLocations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                      disabled={!selectedLocation}
                    >
                      {selectedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedTags.slice(0, 2).map(tagName => (
                            <Badge key={tagName} variant="secondary" className="text-xs">
                              {tagName}
                            </Badge>
                          ))}
                          {selectedTags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{selectedTags.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select tags</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search tags..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No tags found.</CommandEmpty>
                        <CommandGroup heading={selectedLocation ? `Tags for ${availableLocations.find(l => l.id === selectedLocation)?.name}` : 'Select a location first'}>
                          {selectedLocation && getTagsForLocation(selectedLocation).map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => {
                                setSelectedTags(prev =>
                                  prev.includes(tag.name)
                                    ? prev.filter(t => t !== tag.name)
                                    : [...prev, tag.name]
                                )
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedTags.includes(tag.name) ? 'bg-primary border-primary' : 'border-input'}`}>
                                  {selectedTags.includes(tag.name) && (
                                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <Badge variant="secondary" className={`text-xs ${tag.color}`}>
                                  {tag.name}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Min Qty"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max Qty"
                  value={maxQuantity}
                  onChange={(e) => setMaxQuantity(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Reorder Point"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(e.target.value)}
                />
              </div>
              <div>
                <Button
                  onClick={handleAddLocation}
                  disabled={!selectedLocation}
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assigned Locations</CardTitle>
            {isEditing && (
              <Dialog open={isTagManagementOpen} onOpenChange={setIsTagManagementOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Tags
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Manage Location Tags</DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto space-y-6 py-4">
                    {/* Create New Tag Form */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <Label className="text-sm font-medium">Create New Tag</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="tagName" className="text-xs text-muted-foreground">Tag Name</Label>
                          <Input
                            id="tagName"
                            placeholder="Enter tag name"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tagColor" className="text-xs text-muted-foreground">Color</Label>
                          <Select value={newTagColor} onValueChange={setNewTagColor}>
                            <SelectTrigger id="tagColor">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded ${tagColorOptions.find(c => c.value === newTagColor)?.preview}`} />
                                  {tagColorOptions.find(c => c.value === newTagColor)?.label}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {tagColorOptions.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded ${color.preview}`} />
                                    {color.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tagLocation" className="text-xs text-muted-foreground">Location</Label>
                          <Select value={newTagLocation} onValueChange={setNewTagLocation}>
                            <SelectTrigger id="tagLocation">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLocations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim() || !newTagLocation}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Tag
                      </Button>
                    </div>

                    {/* Existing Tags by Location */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Existing Tags by Location</Label>
                      {availableLocations.map((location) => {
                        const locationTags = getTagsForLocation(location.id)
                        if (locationTags.length === 0) return null
                        return (
                          <div key={location.id} className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              {location.name}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {locationTags.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="secondary"
                                  className={`${tag.color} pr-1 flex items-center gap-1`}
                                >
                                  {tag.name}
                                  <button
                                    onClick={() => handleDeleteAvailableTag(tag.id)}
                                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                                    title="Delete tag"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                      {availableTags.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tags created yet. Use the form above to create your first tag.
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Min Qty</TableHead>
                <TableHead className="text-right">Max Qty</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead className="text-right">PAR Level</TableHead>
                {isEditing && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assignment.locationName}</div>
                      <div className="text-sm text-muted-foreground">{assignment.locationCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Tags Section */}
                    <div className="flex flex-wrap gap-1 items-center">
                        {/* Display existing tags */}
                        {(assignment.tags || []).map((tagName) => (
                          <Badge
                            key={tagName}
                            variant="secondary"
                            className={`text-xs ${getTagColor(tagName, assignment.locationId)} ${isEditing ? 'pr-1' : ''}`}
                          >
                            {tagName}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveTag(assignment.id, tagName)}
                                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}

                        {/* Add Tag Button (Edit Mode Only) */}
                        {isEditing && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs border-dashed"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                Add Tag
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[220px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search tags..." className="h-9" />
                                <CommandList>
                                  <CommandEmpty>No tags found.</CommandEmpty>
                                  <CommandGroup heading={`Tags for ${assignment.locationName}`}>
                                    {getTagsForLocation(assignment.locationId)
                                      .filter(tag => !(assignment.tags || []).includes(tag.name))
                                      .map((tag) => (
                                        <CommandItem
                                          key={tag.id}
                                          value={tag.name}
                                          className="cursor-pointer flex items-center justify-between"
                                        >
                                          <div
                                            className="flex-1"
                                            onClick={() => handleAddTag(assignment.id, tag.name)}
                                          >
                                            <Badge
                                              variant="secondary"
                                              className={`text-xs ${tag.color}`}
                                            >
                                              {tag.name}
                                            </Badge>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleDeleteAvailableTag(tag.id)
                                            }}
                                            className="p-1 hover:bg-destructive/10 rounded ml-2"
                                            title="Delete tag"
                                          >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                          </button>
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )}

                        {/* Empty state when no tags */}
                        {(!assignment.tags || assignment.tags.length === 0) && !isEditing && (
                          <span className="text-xs text-muted-foreground">No tags</span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={assignment.minQuantity}
                        onChange={(e) => onUpdateLocation?.(assignment.id, { minQuantity: Number(e.target.value) })}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      assignment.minQuantity
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={assignment.maxQuantity}
                        onChange={(e) => onUpdateLocation?.(assignment.id, { maxQuantity: Number(e.target.value) })}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      assignment.maxQuantity
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={assignment.reorderPoint}
                        onChange={(e) => onUpdateLocation?.(assignment.id, { reorderPoint: Number(e.target.value) })}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      assignment.reorderPoint
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={assignment.parLevel}
                        onChange={(e) => onUpdateLocation?.(assignment.id, { parLevel: Number(e.target.value) })}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      assignment.parLevel
                    )}
                  </TableCell>
                  {isEditing && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveLocation?.(assignment.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {locations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isEditing ? 7 : 6} className="text-center text-muted-foreground">
                    No locations assigned
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 