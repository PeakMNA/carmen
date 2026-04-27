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
import { Badge } from '@/components/ui/badge';
import { 
  DEFAULT_CURRENCIES
} from '@/lib/types/vendor-price-management';

interface PricelistSettingsPageProps {
  params: {
    id: string;
  };
}

export default function PricelistSettingsPage({ params }: PricelistSettingsPageProps) {
  const router = useRouter();
  const { id } = params;
  
  // State
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // State for categories
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  
  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/price-management/vendors/${id}/pricelist-settings`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch pricelist settings');
      }
      
      setSettings(data.data);
      setSelectedCategories(data.data.assignedCategories);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching pricelist settings');
      console.error('Error fetching pricelist settings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch available categories
  const fetchCategories = async () => {
    // In a real app, fetch from API
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
  };
  
  // Initial fetch
  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, [id]);
  
  // Handle form input change
  const handleInputChange = (field: string, value: any) => {
    setSettings((prev: any) => {
      if (!prev) return prev;
      
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
        updated[field] = value;
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
    if (!settings) return false;
    
    const errors: Record<string, string> = {};
    
    if (!settings.priceCollectionPreferences?.preferredCurrency) {
      errors['priceCollectionPreferences.preferredCurrency'] = 'Preferred currency is required';
    }
    
    if (settings.priceCollectionPreferences?.defaultLeadTime === undefined || 
        settings.priceCollectionPreferences.defaultLeadTime < 0) {
      errors['priceCollectionPreferences.defaultLeadTime'] = 'Default lead time must be a non-negative number';
    }
    
    if (!settings.priceCollectionPreferences?.communicationLanguage) {
      errors['priceCollectionPreferences.communicationLanguage'] = 'Communication language is required';
    }
    
    const notificationPrefs = settings.priceCollectionPreferences?.notificationPreferences;
    
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
    
    if (!settings || !validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/price-management/vendors/${id}/pricelist-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
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
          throw new Error(data.message || 'Failed to update pricelist settings');
        }
      }
      
      // Redirect to vendor details page
      router.push(`/vendor-management/vendors/${id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating pricelist settings');
      console.error('Error updating pricelist settings:', err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pricelist Settings</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-64">
              <p>Loading pricelist settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !settings) {
    return (
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pricelist Settings</h1>
          <Button onClick={() => router.push(`/vendor-management/vendors/${id}`)}>
            Back to Vendor
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="bg-red-100 text-red-800 p-4 rounded-md">
              {error || 'Pricelist settings not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pricelist Settings</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/vendor-management/vendors/${id}`)}
        >
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  value={settings.priceCollectionPreferences?.preferredCurrency}
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
                  value={settings.priceCollectionPreferences?.defaultLeadTime}
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
                  value={settings.priceCollectionPreferences?.communicationLanguage}
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
                    checked={settings.priceCollectionPreferences?.notificationPreferences?.emailReminders}
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
                    value={settings.priceCollectionPreferences?.notificationPreferences?.reminderFrequency}
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
                    checked={settings.priceCollectionPreferences?.notificationPreferences?.escalationEnabled}
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
                
                {settings.priceCollectionPreferences?.notificationPreferences?.escalationEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="escalationDays">Escalation Days</Label>
                    <Input
                      id="escalationDays"
                      type="number"
                      min="1"
                      value={settings.priceCollectionPreferences?.notificationPreferences?.escalationDays}
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
                    value={settings.priceCollectionPreferences?.notificationPreferences?.preferredContactTime || ''}
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
          
          {/* Assigned Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Categories</CardTitle>
              <CardDescription>
                Select product categories this vendor can provide pricing for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selected Categories</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[100px]">
                  {selectedCategories.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">No categories selected</p>
                  ) : (
                    selectedCategories.map((category) => (
                      <Badge 
                        key={category} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {category}
                        <button
                          type="button"
                          className="ml-1 text-xs hover:bg-gray-200 rounded-full h-4 w-4 inline-flex items-center justify-center"
                          onClick={() => handleCategoryChange(category, false)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
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
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Available Categories</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableCategories
                    .filter(category => !selectedCategories.includes(category))
                    .map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={false}
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
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}