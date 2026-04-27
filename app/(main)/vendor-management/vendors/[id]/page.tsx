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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  VendorPriceManagement,
  VENDOR_STATUSES
} from '@/lib/types/vendor-price-management';
import { mockCampaigns } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, Users, Target, TrendingUp, Clock } from 'lucide-react';

interface VendorDetailPageProps {
  params: {
    id: string;
  };
}

export default function VendorDetailPage({ params }: VendorDetailPageProps) {
  const router = useRouter();
  const { id } = params;
  
  // State
  const [vendor, setVendor] = useState<VendorPriceManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch vendor
  const fetchVendor = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/price-management/vendors/${id}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch vendor');
      }
      
      setVendor(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching vendor');
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchVendor();
  }, [id]);
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!vendor) return;
    
    try {
      const response = await fetch(`/api/price-management/vendors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update vendor status');
      }
      
      setVendor(data.data);
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating vendor status');
      console.error('Error updating vendor status:', err);
    }
  };
  
  // Handle edit
  const handleEdit = () => {
    router.push(`/vendor-management/vendors/${id}/edit`);
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!vendor) return;
    
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/price-management/vendors/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete vendor');
      }
      
      router.push('/vendor-management/vendors');
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting vendor');
      console.error('Error deleting vendor:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendor Details</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-64">
              <p>Loading vendor details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !vendor) {
    return (
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendor Details</h1>
          <Button onClick={() => router.push('/vendor-management/vendors')}>
            Back to Vendors
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="bg-red-100 text-red-800 p-4 rounded-md">
              {error || 'Vendor not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendor Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/vendor-management/vendors')}>
            Back to Vendors
          </Button>
          <Button onClick={handleEdit}>Edit Vendor</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vendor Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
            <CardDescription>Basic vendor details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vendor ID</h3>
                <p>{vendor.baseVendorId}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(vendor.status)}>
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </Badge>
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const dropdown = document.getElementById('status-dropdown');
                        dropdown?.classList.toggle('hidden');
                      }}
                    >
                      Change
                    </Button>
                    <div 
                      id="status-dropdown" 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden"
                    >
                      <div className="py-1">
                        {VENDOR_STATUSES.map((status) => (
                          <button
                            key={status}
                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                              vendor.status === status ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => {
                              handleStatusChange(status);
                              document.getElementById('status-dropdown')?.classList.add('hidden');
                            }}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p>{formatDate(new Date(vendor.createdAt))}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p>{formatDate(new Date(vendor.updatedAt))}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                <p>{vendor.createdBy}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned Categories</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {vendor.assignedCategories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDelete}
                >
                  Delete Vendor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <Tabs defaultValue="performance">
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="preferences">Price Collection</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="history">Submission History</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Response Rate</h3>
                  <div className="mt-2 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${vendor.performanceMetrics.responseRate}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-semibold">
                      {vendor.performanceMetrics.responseRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Data Quality Score</h3>
                  <div className="mt-2 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${vendor.performanceMetrics.dataQualityScore}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-semibold">
                      {vendor.performanceMetrics.dataQualityScore}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Avg. Response Time</h3>
                  <p className="text-lg font-semibold mt-2">
                    {vendor.performanceMetrics.averageResponseTime.toFixed(1)} hours
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Campaigns</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span>Invited:</span>
                    <span className="font-semibold">
                      {vendor.performanceMetrics.totalCampaignsInvited}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Completed:</span>
                    <span className="font-semibold">
                      {vendor.performanceMetrics.totalCampaignsCompleted}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Completion Rate:</span>
                    <span className="font-semibold">
                      {vendor.performanceMetrics.totalCampaignsInvited > 0
                        ? ((vendor.performanceMetrics.totalCampaignsCompleted / 
                            vendor.performanceMetrics.totalCampaignsInvited) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Last Submission</h3>
                  {vendor.performanceMetrics.lastSubmissionDate ? (
                    <div className="mt-2">
                      <p className="font-semibold">
                        {formatDate(new Date(vendor.performanceMetrics.lastSubmissionDate))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(vendor.performanceMetrics.lastSubmissionDate).toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 italic">No submissions yet</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Preferred Currency</h3>
                  <p className="font-semibold mt-2">
                    {vendor.priceCollectionPreferences.preferredCurrency}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Default Lead Time</h3>
                  <p className="font-semibold mt-2">
                    {vendor.priceCollectionPreferences.defaultLeadTime} days
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Communication Language</h3>
                  <p className="font-semibold mt-2">
                    {vendor.priceCollectionPreferences.communicationLanguage}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Preferred Contact Time</h3>
                  <p className="font-semibold mt-2">
                    {vendor.priceCollectionPreferences.notificationPreferences.preferredContactTime || 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Notification Preferences</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Email Reminders:</span>
                    <Badge variant={vendor.priceCollectionPreferences.notificationPreferences.emailReminders ? 'default' : 'outline'}>
                      {vendor.priceCollectionPreferences.notificationPreferences.emailReminders ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Reminder Frequency:</span>
                    <Badge variant="outline">
                      {vendor.priceCollectionPreferences.notificationPreferences.reminderFrequency.charAt(0).toUpperCase() + 
                       vendor.priceCollectionPreferences.notificationPreferences.reminderFrequency.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Escalation:</span>
                    <Badge variant={vendor.priceCollectionPreferences.notificationPreferences.escalationEnabled ? 'default' : 'outline'}>
                      {vendor.priceCollectionPreferences.notificationPreferences.escalationEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  {vendor.priceCollectionPreferences.notificationPreferences.escalationEnabled && (
                    <div className="flex items-center justify-between">
                      <span>Escalation After:</span>
                      <span className="font-semibold">
                        {vendor.priceCollectionPreferences.notificationPreferences.escalationDays} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => router.push(`/vendor-management/vendors/${id}/pricelist-settings`)}
                >
                  Edit Price Collection Settings
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="campaigns" className="space-y-4">
              {(() => {
                const vendorCampaigns = mockCampaigns.filter(campaign => 
                  campaign.selectedVendors.includes(vendor.baseVendorId)
                );
                
                if (vendorCampaigns.length === 0) {
                  return (
                    <div className="bg-gray-50 p-8 rounded-md text-center">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">This vendor hasn't been invited to any campaigns yet.</p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {vendorCampaigns.map((campaign) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'active': return 'bg-green-100 text-green-800';
                          case 'draft': return 'bg-gray-100 text-gray-800';
                          case 'completed': return 'bg-blue-100 text-blue-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      };
                      
                      const getPriorityColor = (priority: string) => {
                        switch (priority) {
                          case 'urgent': return 'bg-red-100 text-red-800';
                          case 'high': return 'bg-orange-100 text-orange-800';
                          case 'medium': return 'bg-yellow-100 text-yellow-800';
                          case 'low': return 'bg-green-100 text-green-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      };
                      
                      // Mock vendor progress for this campaign
                      const vendorIndex = campaign.selectedVendors.indexOf(vendor.baseVendorId);
                      const isResponded = vendorIndex < campaign.progress.respondedVendors;
                      const isCompleted = vendorIndex < campaign.progress.completedSubmissions;
                      const vendorProgress = isCompleted ? 100 : isResponded ? 50 : 0;
                      
                      return (
                        <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <Link 
                                  href={`/vendor-management/campaigns/${campaign.id}`}
                                  className="text-lg font-semibold hover:text-blue-600 transition-colors"
                                >
                                  {campaign.name}
                                </Link>
                                <p className="text-gray-600 mt-1">{campaign.description}</p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Badge className={getStatusColor(campaign.status)}>
                                  {campaign.status}
                                </Badge>
                                <Badge className={getPriorityColor(campaign.settings.priority)}>
                                  {campaign.settings.priority}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">Started</p>
                                  <p className="font-medium">{formatDate(campaign.scheduledStart)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">Duration</p>
                                  <p className="font-medium">{campaign.settings.portalAccessDuration} days</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">Progress</p>
                                  <div className="flex items-center gap-2">
                                    <div className="w-12 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${vendorProgress}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium">{vendorProgress}%</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">Status</p>
                                  <p className="font-medium">
                                    {isCompleted ? 'Completed' : isResponded ? 'In Progress' : 'Pending'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="text-sm text-gray-500">
                                Campaign Type: <span className="font-medium">{campaign.campaignType}</span>
                              </div>
                              <Link href={`/vendor-management/campaigns/${campaign.id}`}>
                                <Button variant="outline" size="sm">
                                  View Campaign
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                );
              })()}
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p>Submission history will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">
                  This feature is not yet implemented
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}