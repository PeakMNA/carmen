"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InventoryLocation,
  InventoryLocationType,
  LocationStatus,
  LOCATION_TYPE_LABELS,
  LOCATION_TYPE_DESCRIPTIONS,
} from "@/lib/types/location-management"
import { getActiveDeliveryPoints } from "@/lib/mock-data/inventory-locations"

interface GeneralTabProps {
  location: InventoryLocation
  isEditing: boolean
}

export function GeneralTab({ location, isEditing }: GeneralTabProps) {
  // Get all active delivery points for the lookup
  const deliveryPoints = useMemo(() => getActiveDeliveryPoints(), [])

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core location details and identification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Location Code</Label>
              {isEditing ? (
                <Input
                  id="code"
                  defaultValue={location.code}
                  maxLength={10}
                  className="font-mono uppercase"
                  placeholder="e.g., WH-001"
                />
              ) : (
                <p className="text-sm font-mono p-2 bg-muted rounded-md">{location.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  defaultValue={location.name}
                  maxLength={100}
                  placeholder="e.g., Main Warehouse"
                />
              ) : (
                <p className="text-sm p-2 bg-muted rounded-md">{location.name}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  defaultValue={location.description}
                  placeholder="Brief description of this location"
                  rows={3}
                />
              ) : (
                <p className="text-sm p-2 bg-muted rounded-md min-h-[60px]">
                  {location.description || 'No description'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Type & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Type & Status</CardTitle>
          <CardDescription>Location classification and operational status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Location Type</Label>
              {isEditing ? (
                <Select defaultValue={location.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(InventoryLocationType).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div>
                          <div className="font-medium">{LOCATION_TYPE_LABELS[type]}</div>
                          <div className="text-xs text-muted-foreground">
                            {LOCATION_TYPE_DESCRIPTIONS[type]}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-muted rounded-md">
                  <Badge variant="outline" className="mb-1">
                    {LOCATION_TYPE_LABELS[location.type]}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {LOCATION_TYPE_DESCRIPTIONS[location.type]}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select defaultValue={location.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending_setup">Pending Setup</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm p-2 bg-muted rounded-md capitalize">
                  {location.status.replace('_', ' ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Physical Count</Label>
              <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                {isEditing ? (
                  <>
                    <Switch
                      id="physicalCount"
                      defaultChecked={location.physicalCountEnabled}
                    />
                    <Label htmlFor="physicalCount" className="text-sm font-normal">
                      Enable physical count for this location
                    </Label>
                  </>
                ) : (
                  <span className="text-sm">
                    {location.physicalCountEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Delivery point and vendor assignments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryPoint">Delivery Point</Label>
              {isEditing ? (
                <Select defaultValue={location.deliveryPointId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery point" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryPoints.map((dp) => (
                      <SelectItem key={dp.id} value={dp.id}>
                        {dp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm p-2 bg-muted rounded-md">
                  {location.deliveryPointName || 'Not assigned'}
                </p>
              )}
            </div>

            {/* Consignment Vendor - Only shown for consignment type */}
            {location.type === InventoryLocationType.CONSIGNMENT && (
              <div className="space-y-2">
                <Label htmlFor="consignmentVendor">Consignment Vendor</Label>
                {isEditing ? (
                  <Select defaultValue={location.consignmentVendorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor-001">Premium Beverages Co.</SelectItem>
                      <SelectItem value="vendor-002">Royal Linen Services</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm p-2 bg-muted rounded-md">
                    {location.consignmentVendorName || 'Not assigned'}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Information */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
          <CardDescription>Record creation and modification history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created At</p>
              <p className="font-medium">
                {location.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p className="font-medium">{location.createdBy}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Updated At</p>
              <p className="font-medium">
                {location.updatedAt?.toLocaleDateString() || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Updated By</p>
              <p className="font-medium">{location.updatedBy || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
