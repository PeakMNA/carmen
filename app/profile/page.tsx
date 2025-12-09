"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Building, Bell, Lock, LogOut, ClipboardCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PersonIcon } from "@radix-ui/react-icons"
import { useUser } from "@/lib/context/simple-user-context"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUserContext } = useUser()

  const [notifications, setNotifications] = useState(true)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  // Inventory counting preferences from user context
  const showSystemQuantity = user?.context?.showSystemQuantity ?? true

  const handleShowSystemQuantityChange = (checked: boolean) => {
    updateUserContext({ showSystemQuantity: checked })
  }

  // Mock business units
  const businessUnits = [
    { id: "1", name: "Grand Hotel - Main Kitchen", location: "New York" },
    { id: "2", name: "Grand Hotel - Restaurant", location: "New York" },
    { id: "3", name: "Seaside Resort - Main Kitchen", location: "Miami" },
    { id: "4", name: "Seaside Resort - Pool Bar", location: "Miami" },
    { id: "5", name: "Mountain Lodge - Restaurant", location: "Denver" },
  ]

  const handleLogout = () => {
    // Simulate logout
    router.push("/")
  }

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <PersonIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>John Smith</CardTitle>
                <CardDescription>john.smith@grandhotel.com</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Smith" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="john.smith@grandhotel.com" readOnly />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue="Kitchen Manager" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Business Unit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="business-unit">Current Business Unit</Label>
                <Select defaultValue="1">
                  <SelectTrigger id="business-unit">
                    <SelectValue placeholder="Select business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        <div className="flex flex-col">
                          <span>{unit.name}</span>
                          <span className="text-xs text-muted-foreground">{unit.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex flex-col gap-1">
                  <span>Push Notifications</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Receive alerts for approvals and deliveries
                  </span>
                </Label>
                <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Inventory Counting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showSystemQuantity" className="flex flex-col gap-1">
                  <span>Show System Quantity</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Display system quantities during physical counts and spot checks
                  </span>
                </Label>
                <Switch
                  id="showSystemQuantity"
                  checked={showSystemQuantity}
                  onCheckedChange={handleShowSystemQuantityChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When disabled, you can perform &quot;blind counts&quot; without seeing the expected system quantities. This can help ensure more accurate and unbiased counting.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/change-password">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={() => setLogoutDialogOpen(true)}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout Confirmation</DialogTitle>
            <DialogDescription>Are you sure you want to logout? Any unsaved work will be lost.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
