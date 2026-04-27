'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  VendorPriceManagement,
  NotificationSettings,
  VENDOR_STATUSES,
  DEFAULT_CURRENCIES
} from '@/lib/types/vendor-price-management';

export default function NewVendorPage() {
  const router = useRouter();
  
  // State for form data
  const [formData, setFormData] = useState<Partial<VendorPriceManagement>>({
    baseVendorId: '',
    priceCollectionPreferences: {
      preferredCurrency: 'USD',
      defaultLeadTime: 7,
      communicationLanguage: 'en-US',
      notificationPreferences: {
        emailReminders: true,
        reminderFrequency: 'weekly',
        escalationEnabled: false,
        escalationDays: 3,
        preferredContactTime: '09:00'
      }
    },
    assignedCategories: [],
    status: 'active',
    createdBy: 'current-user' // In a real app, get from auth context
  });
  
  // State for available vendors and categories
  const [availableVendors, setAvailableVendors] = useState<{ id: string; name: string }[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  
  // State for form submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Fetch available vendors and categories
  useEffect(() => {
    // In a real app, fetch from API
    setAvailableVendors([
      { id: 'vendor-001', name: 'Office Supplies Inc.' },
      { id: 'vendor-002', name: 'Tech Solutions Ltd.' },
      { id: 'vendor-003', name: 'Furniture Warehouse' },
      { id: 'vendor-004', name: 'Global Electronics' },
      { id: 'vendor-005', name: 'Paper Products Co.' }
    ]);
    
    setAvailableCategories([
      'office-supplies',
      'furniture',
      'electronics',
      'it-equipment',
      'software',
      'paper-products',
      'printing',
      'office-equipment',
      'storage',
      'computer-accessories',
      'cables',
      'stationery',
      'ergonomic-accessories',
      'peripherals',
      'cleaning-supplies',
      'breakroom',
      'networking'
    ]);
  }, []);
  
  // Handle form input change
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      // Handle nested fields
      if (field.includes('.')) {
        const parts = field.split('.');
        let current: any = updated;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = value;
      } else {
        updated[field as keyof typeof updated] = value;
      }
      
      return updated;
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
      handleInputChange('assignedCategories', [...selectedCategories, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
      handleInputChange('assignedCategories', selectedCategories.filter(c => c !== category));
    }
  };
  
  // Add new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    const formattedCategory = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (availableCategories.includes(formattedCategory)) {
      // Category already exists, just select it
      if (!selectedCategories.includes(formattedCategory)) {
        handleCategoryChange(formattedCategory, true);
      }
    } else {
      // Add new category
      setAvailableCategories(prev => [...prev, formattedCategory]);
      handleCategoryChange(formattedCategory, true);
    }
    
    setNewCategory('');
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.baseVendorId) {
      errors.baseVendorId = 'Vendor ID is required';
    }
    
    if (!formData.priceCollectionPreferences?.preferredCurrency) {
      errors['priceCollectionPreferences.preferredCurrency'] = 'Preferred currency is required';
    }
    
    if (formData.priceCollectionPreferences?.defaultLeadTime === undefined || 
        formData.priceCollectionPreferences.defaultLeadTime < 0) {
      errors['priceCollectionPreferences.defaultLeadTime'] = 'Default lead time must be a non-negative number';
    }
    
    if (!formData.priceCollectionPreferences?.communicationLanguage) {
      errors['priceCollectionPreferences.communicationLanguage'] = 'Communication language is required';
    }
    
    const notificationPrefs = formData.priceCollectionPreferences?.notificationPreferences;
    
    if (notificationPrefs?.escalationEnabled && 
        (notificationPrefs.escalationDays === undefined || notificationPrefs.escalationDays < 1)) {
      errors['priceCollectionPreferences.notificationPreferences.escalationDays'] = 'Escalation days must be at least 1';
    }
    
    if (notificationPrefs?.preferredContactTime && 
        !/^([01]\d|2[0-3]):([0-5]\d)$/.test(notificationPrefs.preferredContactTime)) {
      errors['priceCollectionPreferences.notificationPreferences.preferredContactTime'] = 'Invalid time format (use HH:MM)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/price-management/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        if (data.errors) {
          // Format validation errors from API
          const apiErrors: Record<string, string> = {};
          data.errors.forEach((err: { path: string; message: string }) => {
            apiErrors[err.path] = err.message;
          });
          setValidationErrors(apiErrors);
          throw new Error('Please fix the validation errors');
        } else {
          throw new Error(data.message || 'Failed to create vendor');
        }
      }
      
      // Redirect to vendor details page
      router.push(`/vendor-management/vendors/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating vendor');
      console.error('Error creating vendor:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Vendor</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/vendor-management/vendors')}
        >
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic vendor information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseVendorId">
                  Vendor ID <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.baseVendorId}
                  onValueChange={(value) => handleInputChange('baseVendorId', value)}
                >
                  <SelectTrigger id="baseVendorId" className={validationErrors.baseVendorId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.baseVendorId && (
                  <p className="text-sm text-red-500">{validationErrors.baseVendorId}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Assigned Categories</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category, checked === true)
                        }
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Add new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleAddCategory}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Price Collection Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Price Collection Preferences</CardTitle>
              <CardDescription>
                Configure how this vendor submits pricing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredCurrency">
                  Preferred Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priceCollectionPreferences?.preferredCurrency}
                  onValueChange={(value) => 
                    handleInputChange('priceCollectionPreferences.preferredCurrency', value)
                  }
                >
                  <SelectTrigger 
                    id="preferredCurrency"
                    className={validationErrors['priceCollectionPreferences.preferredCurrency'] ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors['priceCollectionPreferences.preferredCurrency'] && (
                  <p className="text-sm text-red-500">
                    {validationErrors['priceCollectionPreferences.preferredCurrency']}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultLeadTime">
                  Default Lead Time (days) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="defaultLeadTime"
                  type="number"
                  min="0"
                  value={formData.priceCollectionPreferences?.defaultLeadTime}
                  onChange={(e) => 
                    handleInputChange('priceCollectionPreferences.defaultLeadTime', parseInt(e.target.value))
                  }
                  className={validationErrors['priceCollectionPreferences.defaultLeadTime'] ? 'border-red-500' : ''}
                />
                {validationErrors['priceCollectionPreferences.defaultLeadTime'] && (
                  <p className="text-sm text-red-500">
                    {validationErrors['priceCollectionPreferences.defaultLeadTime']}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="communicationLanguage">
                  Communication Language <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priceCollectionPreferences?.communicationLanguage}
                  onValueChange={(value) => 
                    handleInputChange('priceCollectionPreferences.communicationLanguage', value)
                  }
                >
                  <SelectTrigger 
                    id="communicationLanguage"
                    className={validationErrors['priceCollectionPreferences.communicationLanguage'] ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                    <SelectItem value="ja-JP">Japanese</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors['priceCollectionPreferences.communicationLanguage'] && (
                  <p className="text-sm text-red-500">
                    {validationErrors['priceCollectionPreferences.communicationLanguage']}
                  </p>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Notification Preferences</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailReminders"
                    checked={formData.priceCollectionPreferences?.notificationPreferences?.emailReminders}
                    onCheckedChange={(checked) => 
                      handleInputChange('priceCollectionPreferences.notificationPreferences.emailReminders', checked === true)
                    }
                  />
                  <label
                    htmlFor="emailReminders"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable email reminders
                  </label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                  <Select
                    value={formData.priceCollectionPreferences?.notificationPreferences?.reminderFrequency}
                    onValueChange={(value) => 
                      handleInputChange('priceCollectionPreferences.notificationPreferences.reminderFrequency', value)
                    }
                  >
                    <SelectTrigger id="reminderFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="escalationEnabled"
                    checked={formData.priceCollectionPreferences?.notificationPreferences?.escalationEnabled}
                    onCheckedChange={(checked) => 
                      handleInputChange('priceCollectionPreferences.notificationPreferences.escalationEnabled', checked === true)
                    }
                  />
                  <label
                    htmlFor="escalationEnabled"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable escalation
                  </label>
                </div>
                
                {formData.priceCollectionPreferences?.notificationPreferences?.escalationEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="escalationDays">Escalation Days</Label>
                    <Input
                      id="escalationDays"
                      type="number"
                      min="1"
                      value={formData.priceCollectionPreferences?.notificationPreferences?.escalationDays}
                      onChange={(e) => 
                        handleInputChange('priceCollectionPreferences.notificationPreferences.escalationDays', parseInt(e.target.value))
                      }
                      className={validationErrors['priceCollectionPreferences.notificationPreferences.escalationDays'] ? 'border-red-500' : ''}
                    />
                    {validationErrors['priceCollectionPreferences.notificationPreferences.escalationDays'] && (
                      <p className="text-sm text-red-500">
                        {validationErrors['priceCollectionPreferences.notificationPreferences.escalationDays']}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="preferredContactTime">Preferred Contact Time (HH:MM)</Label>
                  <Input
                    id="preferredContactTime"
                    type="text"
                    placeholder="09:00"
                    value={formData.priceCollectionPreferences?.notificationPreferences?.preferredContactTime || ''}
                    onChange={(e) => 
                      handleInputChange('priceCollectionPreferences.notificationPreferences.preferredContactTime', e.target.value)
                    }
                    className={validationErrors['priceCollectionPreferences.notificationPreferences.preferredContactTime'] ? 'border-red-500' : ''}
                  />
                  {validationErrors['priceCollectionPreferences.notificationPreferences.preferredContactTime'] && (
                    <p className="text-sm text-red-500">
                      {validationErrors['priceCollectionPreferences.notificationPreferences.preferredContactTime']}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mt-6">
            {error}
          </div>
        )}
        
        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? 'Creating...' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </div>
  );
}