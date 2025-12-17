'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { ChevronLeft, Plus, X, Upload, Building, User, MapPin, Phone, Mail, FileText, Award, Globe, DollarSign, Star, Pencil, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Vendor } from '../../types'
import { vendorService } from '../../lib/services/vendor-service'

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

interface VendorFormData {
  name: string
  website: string
  businessType: string
  addresses: VendorAddress[]
  contacts: VendorContact[]
  companyRegistration: string
  taxId: string
  taxProfile: string
  preferredCurrency: string
  paymentTerms: string
  status: 'active' | 'inactive'
  certifications: VendorCertification[]
  languages: string[]
  notes: string
}

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
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  status: 'pending',
  documentUrl: '',
  notes: ''
})

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

const calculateCertificationStatus = (expiryDate: Date): CertificationStatus => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'expiring_soon'
  return 'active'
}

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

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateForInput = (date: Date): string => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

const initialFormData: VendorFormData = {
  name: '',
  website: '',
  businessType: '',
  addresses: [],
  contacts: [],
  companyRegistration: '',
  taxId: '',
  taxProfile: '',
  preferredCurrency: 'BHT',
  paymentTerms: '',
  status: 'active',
  certifications: [],
  languages: [],
  notes: ''
}

const businessTypes = [
  'Food & Beverage',
  'Hospitality Supplies',
  'Cleaning Services',
  'Linen Services',
  'Technology',
  'Furniture & Fixtures',
  'Security Services',
  'Maintenance Services',
  'Marketing & Advertising',
  'Professional Services',
  'Transportation',
  'Other'
]

const currencies = [
  'BHT', 'USD', 'CNY', 'SGD'
]

const paymentTermsOptions = [
  'Net 30', 'Net 60', 'Net 90', '2/10 Net 30', '1/15 Net 45', 'Due on Receipt', 'COD'
]

const commonLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
]

export default function NewVendorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<VendorFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [newLanguage, setNewLanguage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof VendorFormData] as object),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Certification management functions
  const openAddCertificationDialog = () => {
    setCertificationForm(createEmptyCertification())
    setEditingCertification(null)
    setCertificationDialogOpen(true)
  }

  const openEditCertificationDialog = (certification: VendorCertification) => {
    setCertificationForm({ ...certification })
    setEditingCertification(certification)
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
    const updatedCertification = {
      ...certificationForm,
      status: calculateCertificationStatus(certificationForm.expiryDate)
    }

    setFormData(prev => {
      if (editingCertification) {
        // Update existing certification
        return {
          ...prev,
          certifications: prev.certifications.map(c =>
            c.id === editingCertification.id ? updatedCertification : c
          )
        }
      } else {
        // Add new certification
        return {
          ...prev,
          certifications: [...prev.certifications, updatedCertification]
        }
      }
    })

    setCertificationDialogOpen(false)
    toast({
      title: "Success",
      description: editingCertification ? "Certification updated successfully" : "Certification added successfully"
    })
  }

  const deleteCertification = (certificationId: string) => {
    setDeleteTarget({ type: 'certification', id: certificationId })
    setDeleteConfirmOpen(true)
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }))
  }

  // Address management functions
  const openAddAddressDialog = () => {
    const newAddress = createEmptyAddress()
    // If no addresses yet, make this one primary
    if (formData.addresses.length === 0) {
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

    setFormData(prev => {
      let newAddresses: VendorAddress[]

      if (editingAddress) {
        // Update existing address
        newAddresses = prev.addresses.map(a =>
          a.id === editingAddress.id ? addressForm : a
        )
      } else {
        // Add new address
        newAddresses = [...prev.addresses, addressForm]
      }

      // If this address is set as primary, unset others
      if (addressForm.isPrimary) {
        newAddresses = newAddresses.map(a => ({
          ...a,
          isPrimary: a.id === addressForm.id
        }))
      }

      return { ...prev, addresses: newAddresses }
    })

    setAddressDialogOpen(false)
    toast({
      title: "Success",
      description: editingAddress ? "Address updated successfully" : "Address added successfully"
    })
  }

  const setPrimaryAddress = (addressId: string) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map(a => ({
        ...a,
        isPrimary: a.id === addressId
      }))
    }))
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
    // If no contacts yet, make this one primary
    if (formData.contacts.length === 0) {
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

    setFormData(prev => {
      let newContacts: VendorContact[]

      if (editingContact) {
        // Update existing contact
        newContacts = prev.contacts.map(c =>
          c.id === editingContact.id ? contactForm : c
        )
      } else {
        // Add new contact
        newContacts = [...prev.contacts, contactForm]
      }

      // If this contact is set as primary, unset others
      if (contactForm.isPrimary) {
        newContacts = newContacts.map(c => ({
          ...c,
          isPrimary: c.id === contactForm.id
        }))
      }

      return { ...prev, contacts: newContacts }
    })

    setContactDialogOpen(false)
    toast({
      title: "Success",
      description: editingContact ? "Contact updated successfully" : "Contact added successfully"
    })
  }

  const setPrimaryContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => ({
        ...c,
        isPrimary: c.id === contactId
      }))
    }))
    toast({
      title: "Success",
      description: "Primary contact updated"
    })
  }

  const deleteContact = (contactId: string) => {
    setDeleteTarget({ type: 'contact', id: contactId })
    setDeleteConfirmOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'address') {
      setFormData(prev => {
        const newAddresses = prev.addresses.filter(a => a.id !== deleteTarget.id)
        // If we deleted the primary and there are others, make first one primary
        if (newAddresses.length > 0 && !newAddresses.some(a => a.isPrimary)) {
          newAddresses[0].isPrimary = true
        }
        return { ...prev, addresses: newAddresses }
      })
      toast({ title: "Success", description: "Address deleted successfully" })
    } else if (deleteTarget.type === 'contact') {
      setFormData(prev => {
        const newContacts = prev.contacts.filter(c => c.id !== deleteTarget.id)
        // If we deleted the primary and there are others, make first one primary
        if (newContacts.length > 0 && !newContacts.some(c => c.isPrimary)) {
          newContacts[0].isPrimary = true
        }
        return { ...prev, contacts: newContacts }
      })
      toast({ title: "Success", description: "Contact deleted successfully" })
    } else if (deleteTarget.type === 'certification') {
      setFormData(prev => ({
        ...prev,
        certifications: prev.certifications.filter(c => c.id !== deleteTarget.id)
      }))
      toast({ title: "Success", description: "Certification deleted successfully" })
    }

    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Company name is required'
    if (!formData.businessType) newErrors.businessType = 'Business type is required'
    if (formData.contacts.length === 0) newErrors.contacts = 'At least one contact is required'
    if (formData.addresses.length === 0) newErrors.addresses = 'At least one address is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Get primary contact for backward compatibility
      const primaryContact = formData.contacts.find(c => c.isPrimary) || formData.contacts[0]
      const primaryAddress = formData.addresses.find(a => a.isPrimary) || formData.addresses[0]

      const vendorData = {
        name: formData.name,
        website: formData.website,
        businessType: formData.businessType,
        contactEmail: primaryContact?.email || '',
        contactPhone: primaryContact?.phone || '',
        address: primaryAddress ? {
          street: primaryAddress.addressLine1,
          city: primaryAddress.city,
          state: primaryAddress.province,
          postalCode: primaryAddress.postalCode,
          country: primaryAddress.country
        } : {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        addresses: formData.addresses,
        contacts: formData.contacts,
        companyRegistration: formData.companyRegistration,
        taxId: formData.taxId,
        taxProfile: formData.taxProfile,
        preferredCurrency: formData.preferredCurrency,
        paymentTerms: formData.paymentTerms,
        status: formData.status,
        // Convert certification objects to string names for API compatibility
        certifications: formData.certifications.map(c => c.name),
        languages: formData.languages,
        notes: formData.notes,
        createdBy: 'current-user-id',
        performanceMetrics: {
          responseRate: 0,
          averageResponseTime: 0,
          qualityScore: 0,
          onTimeDeliveryRate: 0,
          totalCampaigns: 0,
          completedSubmissions: 0,
          averageCompletionTime: 0
        }
      }

      // Create vendor through service
      const result = await vendorService.createVendor(vendorData, 'current-user-id')

      if (result.success) {
        toast({
          title: "Success",
          description: "Vendor created successfully!"
        })
        router.push('/vendor-management/manage-vendors')
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to create vendor'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create vendor. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/vendor-management/manage-vendors')
  }

  return (
    <div className="container mx-auto py-4 px-12">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={handleCancel}
          className="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to vendor list"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-semibold">Create New Vendor</h1>
      </div>

      {/* Form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Vendor Information
          </CardTitle>
          <CardDescription>
            Fill out the vendor details below. Required fields are marked with an asterisk (*)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter company name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                    <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessType && <p className="text-sm text-red-500">{errors.businessType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as 'active' | 'inactive')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Addresses Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Addresses *
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={openAddAddressDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Address
                  </Button>
                </div>
                {errors.addresses && <p className="text-sm text-red-500">{errors.addresses}</p>}

                {formData.addresses.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No addresses added yet</p>
                    <Button type="button" variant="link" onClick={openAddAddressDialog}>
                      Add your first address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.addresses.map((address) => (
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contacts Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contacts *
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={openAddContactDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Contact
                  </Button>
                </div>
                {errors.contacts && <p className="text-sm text-red-500">{errors.contacts}</p>}

                {formData.contacts.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No contacts added yet</p>
                    <Button type="button" variant="link" onClick={openAddContactDialog}>
                      Add your first contact
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.contacts.map((contact) => (
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>


            {/* Business Details Tab */}
            <TabsContent value="business" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyRegistration">Company Registration</Label>
                  <Input
                    id="companyRegistration"
                    placeholder="REG123456789"
                    value={formData.companyRegistration}
                    onChange={(e) => handleInputChange('companyRegistration', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    placeholder="12-3456789"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxProfile">Tax Profile</Label>
                  <Select value={formData.taxProfile} onValueChange={(value) => handleInputChange('taxProfile', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none-vat">None VAT (0%)</SelectItem>
                      <SelectItem value="vat">VAT (7%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredCurrency">Preferred Currency</Label>
                  <Select value={formData.preferredCurrency} onValueChange={(value) => handleInputChange('preferredCurrency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTermsOptions.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Additional Information Tab */}
            <TabsContent value="additional" className="space-y-6 mt-6">
              {/* Certifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Certifications
                  </h3>
                  <Button type="button" size="sm" onClick={openAddCertificationDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Certification
                  </Button>
                </div>

                {formData.certifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No certifications added yet</p>
                    <p className="text-sm">Click "Add Certification" to add vendor certifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.certifications.map((cert) => {
                      const statusInfo = getCertificationStatusBadge(cert.status)
                      const isExpired = cert.status === 'expired'
                      const isExpiringSoon = cert.status === 'expiring_soon'
                      return (
                        <div
                          key={cert.id}
                          className={`p-4 border rounded-lg ${
                            isExpired ? 'border-red-200 bg-red-50' :
                            isExpiringSoon ? 'border-yellow-200 bg-yellow-50' :
                            'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{cert.name}</span>
                                <Badge variant={statusInfo.variant} className={statusInfo.className}>
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>{cert.certificationType}</p>
                                <p>Issuer: {cert.issuer}</p>
                                {cert.certificateNumber && <p>Certificate #: {cert.certificateNumber}</p>}
                                <p>
                                  Valid: {formatDate(cert.issueDate)} - {formatDate(cert.expiryDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditCertificationDialog(cert)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCertification(cert.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Certification Statistics */}
                {formData.certifications.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {formData.certifications.filter(c => c.status === 'active').length}
                      </p>
                      <p className="text-sm text-green-600">Active</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-700">
                        {formData.certifications.filter(c => c.status === 'expiring_soon').length}
                      </p>
                      <p className="text-sm text-yellow-600">Expiring Soon</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-700">
                        {formData.certifications.filter(c => c.status === 'expired').length}
                      </p>
                      <p className="text-sm text-red-600">Expired</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-700">
                        {formData.certifications.length}
                      </p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Languages
                </h3>
                
                <div className="flex gap-2">
                  <Select value={newLanguage} onValueChange={setNewLanguage}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select or enter language" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonLanguages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addLanguage} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.languages.map(lang => (
                    <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                      {lang}
                      <button
                        type="button"
                        onClick={() => removeLanguage(lang)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the vendor..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? 'Creating...' : 'Create Vendor'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}