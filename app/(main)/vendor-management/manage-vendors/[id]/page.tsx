'use client'

import { Suspense, useState } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import DetailPageTemplate from '@/components/templates/DetailPageTemplate'
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, 
         AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, 
         AlertDialogAction } from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MapPin, Phone, Award, Calendar, FileText, ChevronLeft, Printer, Plus, Star, Pencil, Trash2, Mail, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Vendor } from '../../types'
import { mockVendors } from '../../lib/mock-data'
import { updateVendor, deleteVendor } from '../actions'
import { vendorService } from '../../lib/services/vendor-service'
import VendorDeletionDialog from '../../components/VendorDeletionDialog'
import VendorPricelistsSection from './sections/vendor-pricelists-section'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VendorAddress {
  id: string
  label: string
  addressLine1: string
  addressLine2?: string
  subDistrict?: string
  district?: string
  city: string
  province: string
  postalCode: string
  country: string
  isPrimary: boolean
}

interface VendorContact {
  id: string
  name: string
  title: string
  email: string
  phone: string
  isPrimary: boolean
}

type CertificationStatus = 'active' | 'expired' | 'expiring_soon' | 'pending'

interface VendorCertification {
  id: string
  name: string
  certificationType: string
  issuer: string
  certificateNumber?: string
  issueDate: Date
  expiryDate: Date
  status: CertificationStatus
  documentUrl?: string
  notes?: string
}

// Certification types for selection
const certificationTypes = [
  'ISO 9001 - Quality Management',
  'ISO 14001 - Environmental Management',
  'ISO 22000 - Food Safety Management',
  'ISO 45001 - Occupational Health & Safety',
  'HACCP - Hazard Analysis Critical Control Points',
  'GMP - Good Manufacturing Practice',
  'Halal Certification',
  'Kosher Certification',
  'Organic Certification',
  'Fair Trade Certification',
  'FDA Approved',
  'CE Marking',
  'Business License',
  'Trade License',
  'Import/Export License',
  'Other'
]

const createEmptyAddress = (): VendorAddress => ({
  id: crypto.randomUUID(),
  label: '',
  addressLine1: '',
  addressLine2: '',
  subDistrict: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
  country: '',
  isPrimary: false
})

const createEmptyContact = (): VendorContact => ({
  id: crypto.randomUUID(),
  name: '',
  title: '',
  email: '',
  phone: '',
  isPrimary: false
})

const createEmptyCertification = (): VendorCertification => ({
  id: crypto.randomUUID(),
  name: '',
  certificationType: '',
  issuer: '',
  certificateNumber: '',
  issueDate: new Date(),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year from now
  status: 'pending',
  documentUrl: '',
  notes: ''
})

// Calculate certification status based on expiry date
const calculateCertificationStatus = (expiryDate: Date): CertificationStatus => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'expiring_soon'
  return 'active'
}

// Get status badge variant and label
const getCertificationStatusBadge = (status: CertificationStatus): { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, className: string } => {
  switch (status) {
    case 'active':
      return { variant: 'default', label: 'Active', className: 'bg-green-100 text-green-800 hover:bg-green-100' }
    case 'expired':
      return { variant: 'destructive', label: 'Expired', className: '' }
    case 'expiring_soon':
      return { variant: 'secondary', label: 'Expiring Soon', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' }
    case 'pending':
      return { variant: 'outline', label: 'Pending', className: '' }
    default:
      return { variant: 'outline', label: 'Unknown', className: '' }
  }
}

// Format date for display
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date for input field (YYYY-MM-DD)
const formatDateForInput = (date: Date): string => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Format address in international Asian format (bottom-up: specific to general)
const formatAddress = (address: VendorAddress): string => {
  const parts: string[] = []

  // Address lines (most specific)
  if (address.addressLine1) parts.push(address.addressLine1)
  if (address.addressLine2) parts.push(address.addressLine2)

  // Sub-district and District
  if (address.subDistrict) parts.push(address.subDistrict)
  if (address.district) parts.push(address.district)

  // City and Province
  if (address.city) parts.push(address.city)
  if (address.province) parts.push(address.province)

  // Postal code and Country (most general)
  if (address.postalCode) parts.push(address.postalCode)
  if (address.country) parts.push(address.country)

  return parts.filter(Boolean).join(', ')
}

// Format short address for compact display
const formatShortAddress = (address: VendorAddress): string => {
  const parts: string[] = []
  if (address.addressLine1) parts.push(address.addressLine1)
  if (address.city) parts.push(address.city)
  if (address.province) parts.push(address.province)
  if (address.postalCode) parts.push(address.postalCode)
  return parts.filter(Boolean).join(', ')
}

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<VendorDetailSkeleton />}>
      <VendorDetail id={params.id} />
    </Suspense>
  )
}

function VendorDetail({ id }: { id: string }) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(mockVendors.find(v => v.id === id) || null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Initialize addresses from vendor data or create from legacy single address
  const getInitialAddresses = (): VendorAddress[] => {
    if (!vendor) return []
    // Check if vendor has new addresses array
    if ((vendor as any).addresses?.length > 0) {
      return (vendor as any).addresses
    }
    // Convert legacy single address to array
    if (vendor.address?.street) {
      return [{
        id: crypto.randomUUID(),
        label: 'Main',
        addressLine1: vendor.address.street,
        addressLine2: '',
        subDistrict: '',
        district: '',
        city: vendor.address.city,
        province: vendor.address.state,
        postalCode: vendor.address.postalCode,
        country: vendor.address.country,
        isPrimary: true
      }]
    }
    return []
  }

  // Initialize contacts from vendor data or create from legacy contact fields
  const getInitialContacts = (): VendorContact[] => {
    if (!vendor) return []
    // Check if vendor has new contacts array
    if ((vendor as any).contacts?.length > 0) {
      return (vendor as any).contacts
    }
    // Convert legacy contact fields to array
    if (vendor.contactEmail) {
      return [{
        id: crypto.randomUUID(),
        name: 'Primary Contact',
        title: '',
        email: vendor.contactEmail,
        phone: vendor.contactPhone || '',
        isPrimary: true
      }]
    }
    return []
  }

  // Initialize certifications from vendor data
  const getInitialCertifications = (): VendorCertification[] => {
    if (!vendor) return []
    // Check if vendor has certifications array with full objects
    if ((vendor as any).certificationDetails?.length > 0) {
      return (vendor as any).certificationDetails.map((cert: any) => ({
        ...cert,
        issueDate: new Date(cert.issueDate),
        expiryDate: new Date(cert.expiryDate),
        status: calculateCertificationStatus(new Date(cert.expiryDate))
      }))
    }
    // Convert legacy string array to certification objects
    if (vendor.certifications && vendor.certifications.length > 0) {
      return vendor.certifications.map((certName: string) => ({
        id: crypto.randomUUID(),
        name: certName,
        certificationType: 'Other',
        issuer: 'Unknown',
        certificateNumber: '',
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'active' as CertificationStatus,
        documentUrl: '',
        notes: 'Migrated from legacy data'
      }))
    }
    return []
  }

  // Address and contact arrays state
  const [addresses, setAddresses] = useState<VendorAddress[]>(getInitialAddresses)
  const [contacts, setContacts] = useState<VendorContact[]>(getInitialContacts)
  const [certifications, setCertifications] = useState<VendorCertification[]>(getInitialCertifications)

  // Address dialog state
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<VendorAddress | null>(null)
  const [addressForm, setAddressForm] = useState<VendorAddress>(createEmptyAddress())

  // Contact dialog state
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null)
  const [contactForm, setContactForm] = useState<VendorContact>(createEmptyContact())

  // Certification dialog state
  const [certificationDialogOpen, setCertificationDialogOpen] = useState(false)
  const [editingCertification, setEditingCertification] = useState<VendorCertification | null>(null)
  const [certificationForm, setCertificationForm] = useState<VendorCertification>(createEmptyCertification())

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'address' | 'contact' | 'certification', id: string } | null>(null)

  if (!vendor) return notFound()

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => setIsEditing(false)

  const handleSave = async () => {
    if (!vendor) return

    const result = await updateVendor(vendor)
    
    if (!result.success) {
      const errorMessage = typeof result.error === 'string' ? result.error : "Failed to update vendor"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Vendor updated successfully"
    })
    
    setIsEditing(false)
    router.refresh()
  }

  const handleDeleteClick = () => {
    setDeletionDialogOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!vendor) return

    const result = await deleteVendor(vendor.id)
    
    if (!result.success) {
      const errorMessage = typeof result.error === 'string' ? result.error : "Failed to delete vendor"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Vendor deleted successfully"
    })
    router.push('/vendor-management/manage-vendors')
  }

  const handleFieldChange = (name: string, value: any) => {
    setVendor(prev => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }

  // Address management functions
  const openAddAddressDialog = () => {
    const newAddress = createEmptyAddress()
    if (addresses.length === 0) {
      newAddress.isPrimary = true
    }
    setAddressForm(newAddress)
    setEditingAddress(null)
    setAddressDialogOpen(true)
  }

  const openEditAddressDialog = (address: VendorAddress) => {
    setAddressForm({ ...address })
    setEditingAddress(address)
    setAddressDialogOpen(true)
  }

  const handleAddressFormChange = (field: keyof VendorAddress, value: string | boolean) => {
    setAddressForm(prev => ({ ...prev, [field]: value }))
  }

  const saveAddress = () => {
    if (!addressForm.addressLine1.trim() || !addressForm.city.trim() || !addressForm.country.trim()) {
      toast({
        title: "Validation Error",
        description: "Address Line 1, City, and Country are required.",
        variant: "destructive"
      })
      return
    }

    let newAddresses: VendorAddress[]

    if (editingAddress) {
      newAddresses = addresses.map(a =>
        a.id === editingAddress.id ? addressForm : a
      )
    } else {
      newAddresses = [...addresses, addressForm]
    }

    if (addressForm.isPrimary) {
      newAddresses = newAddresses.map(a => ({
        ...a,
        isPrimary: a.id === addressForm.id
      }))
    }

    setAddresses(newAddresses)
    setAddressDialogOpen(false)
    toast({
      title: "Success",
      description: editingAddress ? "Address updated successfully" : "Address added successfully"
    })
  }

  const setPrimaryAddress = (addressId: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isPrimary: a.id === addressId
    })))
    toast({
      title: "Success",
      description: "Primary address updated"
    })
  }

  const deleteAddress = (addressId: string) => {
    setDeleteTarget({ type: 'address', id: addressId })
    setDeleteConfirmOpen(true)
  }

  // Contact management functions
  const openAddContactDialog = () => {
    const newContact = createEmptyContact()
    if (contacts.length === 0) {
      newContact.isPrimary = true
    }
    setContactForm(newContact)
    setEditingContact(null)
    setContactDialogOpen(true)
  }

  const openEditContactDialog = (contact: VendorContact) => {
    setContactForm({ ...contact })
    setEditingContact(contact)
    setContactDialogOpen(true)
  }

  const handleContactFormChange = (field: keyof VendorContact, value: string | boolean) => {
    setContactForm(prev => ({ ...prev, [field]: value }))
  }

  const saveContact = () => {
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and Email are required.",
        variant: "destructive"
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      })
      return
    }

    let newContacts: VendorContact[]

    if (editingContact) {
      newContacts = contacts.map(c =>
        c.id === editingContact.id ? contactForm : c
      )
    } else {
      newContacts = [...contacts, contactForm]
    }

    if (contactForm.isPrimary) {
      newContacts = newContacts.map(c => ({
        ...c,
        isPrimary: c.id === contactForm.id
      }))
    }

    setContacts(newContacts)
    setContactDialogOpen(false)
    toast({
      title: "Success",
      description: editingContact ? "Contact updated successfully" : "Contact added successfully"
    })
  }

  const setPrimaryContact = (contactId: string) => {
    setContacts(prev => prev.map(c => ({
      ...c,
      isPrimary: c.id === contactId
    })))
    toast({
      title: "Success",
      description: "Primary contact updated"
    })
  }

  const deleteContact = (contactId: string) => {
    setDeleteTarget({ type: 'contact', id: contactId })
    setDeleteConfirmOpen(true)
  }

  // Certification CRUD functions
  const openAddCertificationDialog = () => {
    setEditingCertification(null)
    setCertificationForm(createEmptyCertification())
    setCertificationDialogOpen(true)
  }

  const openEditCertificationDialog = (certification: VendorCertification) => {
    setEditingCertification(certification)
    setCertificationForm({ ...certification })
    setCertificationDialogOpen(true)
  }

  const handleCertificationFormChange = (field: keyof VendorCertification, value: string | Date) => {
    setCertificationForm(prev => {
      const updated = { ...prev, [field]: value }
      // Auto-calculate status when expiry date changes
      if (field === 'expiryDate') {
        updated.status = calculateCertificationStatus(value as Date)
      }
      return updated
    })
  }

  const saveCertification = () => {
    if (!certificationForm.name.trim() || !certificationForm.certificationType || !certificationForm.issuer.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, Type, and Issuer are required.",
        variant: "destructive"
      })
      return
    }

    // Update status based on expiry date
    const updatedCertification: VendorCertification = {
      ...certificationForm,
      status: calculateCertificationStatus(certificationForm.expiryDate)
    }

    let newCertifications: VendorCertification[]

    if (editingCertification) {
      newCertifications = certifications.map(c =>
        c.id === editingCertification.id ? updatedCertification : c
      )
    } else {
      newCertifications = [...certifications, updatedCertification]
    }

    setCertifications(newCertifications)
    setCertificationDialogOpen(false)
    setEditingCertification(null)
    setCertificationForm(createEmptyCertification())

    toast({
      title: "Success",
      description: editingCertification ? "Certification updated successfully" : "Certification added successfully"
    })
  }

  const deleteCertification = (certificationId: string) => {
    setDeleteTarget({ type: 'certification', id: certificationId })
    setDeleteConfirmOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'address') {
      let newAddresses = addresses.filter(a => a.id !== deleteTarget.id)
      if (newAddresses.length > 0 && !newAddresses.some(a => a.isPrimary)) {
        newAddresses[0].isPrimary = true
      }
      setAddresses(newAddresses)
      toast({ title: "Success", description: "Address deleted successfully" })
    } else if (deleteTarget.type === 'contact') {
      let newContacts = contacts.filter(c => c.id !== deleteTarget.id)
      if (newContacts.length > 0 && !newContacts.some(c => c.isPrimary)) {
        newContacts[0].isPrimary = true
      }
      setContacts(newContacts)
      toast({ title: "Success", description: "Contact deleted successfully" })
    } else if (deleteTarget.type === 'certification') {
      const newCertifications = certifications.filter(c => c.id !== deleteTarget.id)
      setCertifications(newCertifications)
      toast({ title: "Success", description: "Certification deleted successfully" })
    }

    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  const handleStatusToggle = async (checked: boolean) => {
    if (!vendor) return
    
    const newStatus: 'active' | 'inactive' = checked ? 'active' : 'inactive'
    const updatedVendor = { ...vendor, status: newStatus }
    
    try {
      setVendor(updatedVendor)
      // In a real app, you would call an API here
      // await updateVendorStatus(vendor.id, newStatus)
      
      toast({
        title: "Status Updated",
        description: `Vendor has been marked as ${newStatus}.`,
      })
    } catch (error) {
      // Revert the change if API call fails
      setVendor(vendor)
      toast({
        title: "Error",
        description: "Failed to update vendor status.",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const actionButtons = (
    <>
      {isEditing ? (
        <div className="flex gap-2">
          <Button 
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={handleEdit}
            className="bg-primary hover:bg-primary/90"
          >
            Edit Vendor
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDeleteClick}
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Delete Vendor
          </Button>
        </div>
      )}
    </>
  )

  // Get primary address and contact from arrays
  const primaryAddress = addresses.find(a => a.isPrimary) || addresses[0]
  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0]

  // Custom title component with back button, company name, and status
  const customTitle = (
    <div className="flex items-center gap-4">
      <button 
        onClick={() => router.push('/vendor-management/manage-vendors')}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Back to vendor list"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>
      <h1 className="text-2xl font-semibold">{vendor.name}</h1>
      <Badge 
        variant="secondary"
        className={`text-xs px-2 py-1 ${
          vendor.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
        }`}
      >
        {vendor.status === 'active' ? 'Active' : 'Inactive'}
      </Badge>
      <Switch
        id="vendor-status"
        checked={vendor.status === 'active'}
        onCheckedChange={handleStatusToggle}
        disabled={isEditing}
      />
    </div>
  )

  const content = (
    <>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Primary Address</p>
                    <p className="text-sm text-muted-foreground">
                      {primaryAddress ? formatShortAddress(primaryAddress) : "No address provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Primary Contact</p>
                    <p className="text-sm text-muted-foreground">
                      {primaryContact ? `${primaryContact.name} - ${primaryContact.email}${primaryContact.phone ? ` (${primaryContact.phone})` : ''}` : "No contact provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Registration & Tax</p>
                    <p className="text-sm text-muted-foreground">
                      Reg: {vendor.companyRegistration || 'N/A'} | Tax ID: {vendor.taxId || 'N/A'}
                      {vendor.taxRate !== undefined && (
                        <span className="ml-2 inline-flex items-center">
                          | Tax: {vendor.taxRate}%
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Established</p>
                    <p className="text-sm text-muted-foreground">
                      {vendor.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-3 mb-2">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Vendor Rating</p>
                <p className="text-2xl font-bold">{(vendor.performanceMetrics.qualityScore/20).toFixed(1)}/5</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricelists">Price Lists</TabsTrigger>
          <TabsTrigger value="contacts">Contacts & Addresses</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
              <CardDescription>General information about the vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <p className="text-sm text-muted-foreground">{vendor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Business Type</label>
                  <p className="text-sm text-muted-foreground">{vendor.businessType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax configuration section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>Tax identification and rate configuration for this vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tax ID</label>
                  <Input
                    placeholder="Enter Tax ID"
                    value={vendor.taxId || ''}
                    onChange={e => isEditing && handleFieldChange('taxId', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Profile</label>
                  {isEditing ? (
                    <Select 
                      value={vendor.taxProfile || ''} 
                      onValueChange={value => {
                        handleFieldChange('taxProfile', value)
                        // Auto-set tax rate based on profile
                        if (value === 'none-vat') {
                          handleFieldChange('taxRate', 0)
                        } else if (value === 'vat') {
                          handleFieldChange('taxRate', 7)
                        } else if (value === 'gst') {
                          handleFieldChange('taxRate', 10)
                        } else if (value === 'sales-tax') {
                          handleFieldChange('taxRate', 8.5)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none-vat">None VAT</SelectItem>
                        <SelectItem value="vat">VAT (Thailand)</SelectItem>
                        <SelectItem value="gst">GST (Singapore/Australia)</SelectItem>
                        <SelectItem value="sales-tax">Sales Tax (USA)</SelectItem>
                        <SelectItem value="custom">Custom Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {vendor.taxProfile === 'none-vat' ? 'None VAT' : 
                         vendor.taxProfile === 'vat' ? 'VAT (Thailand)' :
                         vendor.taxProfile === 'gst' ? 'GST (Singapore/Australia)' :
                         vendor.taxProfile === 'sales-tax' ? 'Sales Tax (USA)' :
                         vendor.taxProfile === 'custom' ? 'Custom Rate' :
                         'Not set'}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={vendor.taxRate || ''}
                      onChange={e => handleFieldChange('taxRate', parseFloat(e.target.value) || 0)}
                      disabled={!isEditing}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {vendor.taxRate !== undefined ? `${vendor.taxRate}%` : 'Not set'}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Registration</label>
                  {isEditing ? (
                    <Input
                      placeholder="Enter registration number"
                      value={vendor.companyRegistration || ''}
                      onChange={e => handleFieldChange('companyRegistration', e.target.value)}
                      disabled={!isEditing}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{vendor.companyRegistration || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        
        {/* Contacts & Addresses Tab */}
        <TabsContent value="contacts" className="space-y-4">
          {/* Addresses Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Addresses
                  </CardTitle>
                  <CardDescription>All registered addresses for this vendor</CardDescription>
                </div>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={openAddAddressDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Address
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No addresses registered</p>
                  {isEditing && (
                    <Button type="button" variant="link" onClick={openAddAddressDialog}>
                      Add your first address
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg ${address.isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {address.isPrimary && (
                              <Badge variant="default" className="bg-blue-600">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            {address.label && (
                              <Badge variant="outline">{address.label}</Badge>
                            )}
                          </div>
                          <p className="font-medium">{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p className="text-sm text-muted-foreground">{address.addressLine2}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {[address.subDistrict, address.district].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {[address.city, address.province, address.postalCode].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.country}</p>
                        </div>
                        {isEditing && (
                          <div className="flex items-center gap-1">
                            {!address.isPrimary && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPrimaryAddress(address.id)}
                                title="Set as primary"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditAddressDialog(address)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contacts Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contacts
                  </CardTitle>
                  <CardDescription>All contacts associated with this vendor</CardDescription>
                </div>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={openAddContactDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Contact
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No contacts registered</p>
                  {isEditing && (
                    <Button type="button" variant="link" onClick={openAddContactDialog}>
                      Add your first contact
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 border rounded-lg ${contact.isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {contact.isPrimary && (
                              <Badge variant="default" className="bg-blue-600">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            {contact.title && (
                              <Badge variant="outline">{contact.title}</Badge>
                            )}
                          </div>
                          <p className="font-medium">{contact.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </span>
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex items-center gap-1">
                            {!contact.isPrimary && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPrimaryContact(contact.id)}
                                title="Set as primary"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditContactDialog(contact)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteContact(contact.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Certifications
                  </CardTitle>
                  <CardDescription>Vendor certifications and compliance documents</CardDescription>
                </div>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={openAddCertificationDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Certification
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {certifications.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No certifications registered</p>
                  {isEditing && (
                    <Button type="button" variant="link" onClick={openAddCertificationDialog}>
                      Add your first certification
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {certifications.map((certification) => {
                    const statusBadge = getCertificationStatusBadge(certification.status)
                    return (
                      <div
                        key={certification.id}
                        className={`p-4 border rounded-lg ${
                          certification.status === 'expired' ? 'border-red-300 bg-red-50' :
                          certification.status === 'expiring_soon' ? 'border-yellow-300 bg-yellow-50' :
                          'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                {statusBadge.label}
                              </Badge>
                              <Badge variant="outline">{certification.certificationType}</Badge>
                            </div>
                            <p className="font-medium text-lg">{certification.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Issued by: {certification.issuer}
                            </p>
                            {certification.certificateNumber && (
                              <p className="text-sm text-muted-foreground">
                                Certificate #: {certification.certificateNumber}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Issued: {formatDate(certification.issueDate)}</span>
                              <span>Expires: {formatDate(certification.expiryDate)}</span>
                            </div>
                            {certification.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                {certification.notes}
                              </p>
                            )}
                          </div>
                          {isEditing && (
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditCertificationDialog(certification)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCertification(certification.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          {certifications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {certifications.filter(c => c.status === 'active').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {certifications.filter(c => c.status === 'expiring_soon').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {certifications.filter(c => c.status === 'expired').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Expired</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {certifications.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Price Lists Tab */}
        <TabsContent value="pricelists">
          <VendorPricelistsSection vendorId={id} vendorName={vendor.name} />
        </TabsContent>
        
      </Tabs>

      <VendorDeletionDialog
        vendor={vendor}
        isOpen={deletionDialogOpen}
        onClose={() => setDeletionDialogOpen(false)}
        onDeleted={handleDeleteConfirmed}
      />

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add Address'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress ? 'Update the address details below.' : 'Enter the address details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="addressLabel">Label (e.g., Headquarters, Warehouse)</Label>
              <Input
                id="addressLabel"
                placeholder="Enter address label"
                value={addressForm.label}
                onChange={(e) => handleAddressFormChange('label', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                placeholder="Building/Unit number, Street name"
                value={addressForm.addressLine1}
                onChange={(e) => handleAddressFormChange('addressLine1', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="Floor, Suite, Additional details"
                value={addressForm.addressLine2}
                onChange={(e) => handleAddressFormChange('addressLine2', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subDistrict">Sub-District / Tambon</Label>
                <Input
                  id="subDistrict"
                  placeholder="e.g., Silom"
                  value={addressForm.subDistrict}
                  onChange={(e) => handleAddressFormChange('subDistrict', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District / Amphoe</Label>
                <Input
                  id="district"
                  placeholder="e.g., Bang Rak"
                  value={addressForm.district}
                  onChange={(e) => handleAddressFormChange('district', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressCity">City *</Label>
                <Input
                  id="addressCity"
                  placeholder="e.g., Bangkok"
                  value={addressForm.city}
                  onChange={(e) => handleAddressFormChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressProvince">Province / State</Label>
                <Input
                  id="addressProvince"
                  placeholder="e.g., Bangkok"
                  value={addressForm.province}
                  onChange={(e) => handleAddressFormChange('province', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressPostalCode">Postal Code</Label>
                <Input
                  id="addressPostalCode"
                  placeholder="e.g., 10500"
                  value={addressForm.postalCode}
                  onChange={(e) => handleAddressFormChange('postalCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressCountry">Country *</Label>
                <Input
                  id="addressCountry"
                  placeholder="e.g., Thailand"
                  value={addressForm.country}
                  onChange={(e) => handleAddressFormChange('country', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="addressPrimary"
                checked={addressForm.isPrimary}
                onChange={(e) => handleAddressFormChange('isPrimary', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="addressPrimary" className="text-sm font-normal">
                Set as primary address
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddressDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveAddress}>
              {editingAddress ? 'Update' : 'Add'} Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update the contact details below.' : 'Enter the contact details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Name *</Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  value={contactForm.name}
                  onChange={(e) => handleContactFormChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactTitle">Title</Label>
                <Input
                  id="contactTitle"
                  placeholder="Sales Manager"
                  value={contactForm.title}
                  onChange={(e) => handleContactFormChange('title', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="john@company.com"
                value={contactForm.email}
                onChange={(e) => handleContactFormChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={contactForm.phone}
                onChange={(e) => handleContactFormChange('phone', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="contactPrimary"
                checked={contactForm.isPrimary}
                onChange={(e) => handleContactFormChange('isPrimary', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="contactPrimary" className="text-sm font-normal">
                Set as primary contact
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveContact}>
              {editingContact ? 'Update' : 'Add'} Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog open={certificationDialogOpen} onOpenChange={setCertificationDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingCertification ? 'Edit Certification' : 'Add Certification'}
            </DialogTitle>
            <DialogDescription>
              {editingCertification ? 'Update the certification details below.' : 'Enter the certification details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="certName">Certification Name *</Label>
              <Input
                id="certName"
                placeholder="e.g., ISO 9001:2015 Quality Management"
                value={certificationForm.name}
                onChange={(e) => handleCertificationFormChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certType">Certification Type *</Label>
              <Select
                value={certificationForm.certificationType}
                onValueChange={(value) => handleCertificationFormChange('certificationType', value)}
              >
                <SelectTrigger id="certType">
                  <SelectValue placeholder="Select certification type" />
                </SelectTrigger>
                <SelectContent>
                  {certificationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certIssuer">Issuing Authority *</Label>
                <Input
                  id="certIssuer"
                  placeholder="e.g., SGS, TÜV, Bureau Veritas"
                  value={certificationForm.issuer}
                  onChange={(e) => handleCertificationFormChange('issuer', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certNumber">Certificate Number</Label>
                <Input
                  id="certNumber"
                  placeholder="e.g., CERT-2410-12345"
                  value={certificationForm.certificateNumber}
                  onChange={(e) => handleCertificationFormChange('certificateNumber', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certIssueDate">Issue Date *</Label>
                <Input
                  id="certIssueDate"
                  type="date"
                  value={formatDateForInput(certificationForm.issueDate)}
                  onChange={(e) => handleCertificationFormChange('issueDate', new Date(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certExpiryDate">Expiry Date *</Label>
                <Input
                  id="certExpiryDate"
                  type="date"
                  value={formatDateForInput(certificationForm.expiryDate)}
                  onChange={(e) => handleCertificationFormChange('expiryDate', new Date(e.target.value))}
                />
              </div>
            </div>
            {certificationForm.expiryDate && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                {(() => {
                  const statusInfo = getCertificationStatusBadge(calculateCertificationStatus(certificationForm.expiryDate))
                  return (
                    <Badge variant={statusInfo.variant} className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                  )
                })()}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="certDocUrl">Document URL</Label>
              <Input
                id="certDocUrl"
                type="url"
                placeholder="https://example.com/certificate.pdf"
                value={certificationForm.documentUrl}
                onChange={(e) => handleCertificationFormChange('documentUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certNotes">Notes</Label>
              <textarea
                id="certNotes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Additional notes about this certification..."
                value={certificationForm.notes}
                onChange={(e) => handleCertificationFormChange('notes', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCertificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveCertification}>
              {editingCertification ? 'Update' : 'Add'} Certification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  return (
    <DetailPageTemplate
      title={customTitle}
      actionButtons={actionButtons}
      content={content}
    />
  )
}

function VendorDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button and title skeleton */}
      <div className="flex items-center mb-6">
        <Skeleton className="h-6 w-6 rounded-full mr-4" />
        <Skeleton className="h-8 w-[250px]" />
      </div>
      
      {/* Summary Card Skeleton */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-[400px] mb-4" />
      
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-[140px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
