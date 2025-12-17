/**
 * Vendor Service Integration Example
 * 
 * This example demonstrates how to use the vendor service and API endpoints
 * for complete vendor management with performance metrics.
 */

import { vendorService, type CreateVendorInput, type VendorFilters } from '../vendor-service'
import { type VendorBusinessType, type VendorStatus } from '@/lib/types/vendor'

/**
 * Example: Complete vendor management workflow
 */
export async function vendorManagementExample() {
  console.log('🏪 Vendor Management Integration Example\n')

  try {
    // 1. Create a new vendor
    console.log('1. Creating new vendor...')
    const newVendorData: CreateVendorInput = {
      name: 'Premium Food Solutions Inc',
      contactEmail: 'contact@premiumfood.com',
      contactPhone: '+1-555-0199',
      address: {
        street: '123 Industry Blvd',
        city: 'Food City',
        state: 'California',
        postalCode: '90210',
        country: 'USA'
      },
      status: 'active' as VendorStatus,
      preferredCurrency: 'USD',
      paymentTerms: 'Net 30 days',
      companyRegistration: 'PFS-2410-001',
      taxId: 'TAX-PFS-123456',
      website: 'https://premiumfood.com',
      businessType: 'manufacturer' as VendorBusinessType,
      certifications: ['ISO 9001', 'HACCP', 'FDA Approved'],
      languages: ['en', 'es'],
      notes: 'Premium food manufacturer with excellent quality standards',
      createdBy: 'system-admin-001'
    }

    const createResult = await vendorService.createVendor(newVendorData)
    
    if (!createResult.success) {
      console.error('❌ Failed to create vendor:', createResult.error)
      return
    }

    console.log('✅ Vendor created successfully!')
    console.log(`   ID: ${createResult.data!.id}`)
    console.log(`   Name: ${createResult.data!.companyName}`)
    console.log(`   Code: ${createResult.data!.vendorCode}`)
    console.log('')

    const vendorId = createResult.data!.id

    // 2. Update vendor metrics (simulating external data)
    console.log('2. Updating vendor metrics...')
    const metricsUpdate = {
      response_rate: 95.5,
      average_response_time: 2.1,
      quality_score: 88.5,
      on_time_delivery_rate: 94.2,
      total_campaigns: 12,
      completed_submissions: 11,
      average_completion_time: 18.5,
      last_submission_date: new Date()
    }

    const metricsResult = await vendorService.updateVendorMetrics(vendorId, metricsUpdate)
    
    if (metricsResult.success) {
      console.log('✅ Vendor metrics updated successfully!')
    } else {
      console.log('⚠️  Metrics update failed:', metricsResult.error)
    }
    console.log('')

    // 3. Fetch vendor with calculated performance metrics
    console.log('3. Fetching vendor with performance metrics...')
    const vendorResult = await vendorService.getVendorById(vendorId)
    
    if (vendorResult.success) {
      const vendor = vendorResult.data!
      console.log('✅ Vendor retrieved with metrics:')
      console.log(`   Company: ${vendor.companyName}`)
      console.log(`   Rating: ${vendor.rating}/5`)
      console.log(`   Status: ${vendor.status}`)
      console.log(`   On-time Delivery: ${vendor.onTimeDeliveryRate || 'N/A'}%`)
      console.log(`   Quality Rating: ${vendor.qualityRating || 'N/A'}/5`)
      console.log(`   Addresses: ${vendor.addresses.length}`)
      console.log(`   Contacts: ${vendor.contacts.length}`)
    }
    console.log('')

    // 4. Search and filter vendors
    console.log('4. Searching vendors...')
    const filters: VendorFilters = {
      status: ['active'],
      businessType: ['manufacturer', 'distributor'],
      search: 'food',
      hasMetrics: true
    }

    const searchResult = await vendorService.getVendors(filters, {
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc'
    })

    if (searchResult.success) {
      console.log('✅ Search results:')
      console.log(`   Found ${searchResult.data!.length} vendors`)
      console.log(`   Total in database: ${searchResult.metadata!.total}`)
      console.log(`   Current page: ${searchResult.metadata!.page}`)
      
      searchResult.data!.forEach((vendor, index) => {
        console.log(`   ${index + 1}. ${vendor.companyName} (${vendor.status})`)
      })
    }
    console.log('')

    // 5. Calculate detailed performance metrics
    console.log('5. Calculating detailed performance metrics...')
    const performanceResult = await vendorService.calculateVendorPerformanceMetrics(vendorId)
    
    if (performanceResult.success) {
      const metrics = performanceResult.data!
      console.log('✅ Performance metrics calculated:')
      console.log(`   Period: ${metrics.period.startDate.toISOString().slice(0, 10)} to ${metrics.period.endDate.toISOString().slice(0, 10)}`)
      console.log(`   Total Orders: ${metrics.totalOrders}`)
      console.log(`   On-time Deliveries: ${metrics.onTimeDeliveries}`)
      console.log(`   Late Deliveries: ${metrics.lateDeliveries}`)
      console.log(`   On-time Rate: ${metrics.onTimeDeliveryRate}%`)
      console.log(`   Quality Rating: ${metrics.qualityRating}/5`)
      console.log(`   Service Rating: ${metrics.serviceRating}/5`)
      console.log(`   Overall Rating: ${metrics.overallRating}/5`)
      console.log(`   Total Value: ${metrics.totalValue.currency} ${metrics.totalValue.amount}`)
    }
    console.log('')

    // 6. Get vendor statistics
    console.log('6. Getting vendor statistics...')
    const statsResult = await vendorService.getVendorStatistics()
    
    if (statsResult.success) {
      const stats = statsResult.data!
      console.log('✅ Vendor statistics:')
      console.log(`   Total Vendors: ${stats.total}`)
      console.log(`   Active: ${stats.active}`)
      console.log(`   Inactive: ${stats.inactive}`)
      console.log(`   Suspended: ${stats.suspended}`)
      console.log(`   Average Rating: ${stats.averageRating}/5`)
      console.log('   By Business Type:')
      Object.entries(stats.byBusinessType).forEach(([type, count]) => {
        console.log(`     ${type}: ${count}`)
      })
    }
    console.log('')

    // 7. Update vendor information
    console.log('7. Updating vendor information...')
    const updateResult = await vendorService.updateVendor(vendorId, {
      paymentTerms: 'Net 15 days',
      notes: 'Updated: Excellent performance, reduced payment terms',
      certifications: ['ISO 9001', 'HACCP', 'FDA Approved', 'Organic Certified']
    })

    if (updateResult.success) {
      console.log('✅ Vendor updated successfully!')
      console.log(`   New payment terms: ${updateResult.data!.preferredPaymentTerms}`)
      console.log(`   Certifications: ${updateResult.data!.certifications.length}`)
    }
    console.log('')

    console.log('🎉 Vendor management example completed successfully!')

  } catch (error) {
    console.error('💥 Error in vendor management example:', error)
  }
}

/**
 * Example: API endpoint usage with fetch
 */
export async function apiEndpointExample() {
  console.log('🌐 API Endpoint Usage Example\n')

  const baseUrl = 'http://localhost:3000'

  try {
    // 1. Create vendor via API
    console.log('1. Creating vendor via POST /api/vendors...')
    const createResponse = await fetch(`${baseUrl}/api/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'API Test Vendor Ltd',
        contactEmail: 'api@testvendor.com',
        businessType: 'distributor',
        status: 'active',
        createdBy: 'api-test-user'
      })
    })

    const createData = await createResponse.json()
    if (createData.success) {
      console.log('✅ Vendor created via API!')
      console.log(`   ID: ${createData.data.id}`)
    } else {
      console.log('❌ API creation failed:', createData.error)
    }
    console.log('')

    // 2. List vendors with filtering
    console.log('2. Listing vendors via GET /api/vendors...')
    const listResponse = await fetch(
      `${baseUrl}/api/vendors?status=active&businessType=distributor&page=1&limit=5`
    )
    
    const listData = await listResponse.json()
    if (listData.success) {
      console.log('✅ Vendors retrieved via API!')
      console.log(`   Count: ${listData.data.length}`)
      console.log(`   Total: ${listData.metadata.total}`)
      console.log(`   Page: ${listData.metadata.page}`)
    }
    console.log('')

    // 3. Get vendor statistics
    console.log('3. Getting statistics via GET /api/vendors/stats...')
    const statsResponse = await fetch(`${baseUrl}/api/vendors/stats`)
    const statsData = await statsResponse.json()
    
    if (statsData.success) {
      console.log('✅ Statistics retrieved via API!')
      console.log(`   Total: ${statsData.data.total}`)
      console.log(`   Active: ${statsData.data.active}`)
      console.log(`   Average Rating: ${statsData.data.averageRating}`)
    }
    console.log('')

    console.log('🎉 API endpoint example completed!')

  } catch (error) {
    console.error('💥 Error in API example:', error)
  }
}

/**
 * Run both examples
 */
export async function runVendorIntegrationExamples() {
  console.log('🚀 Starting Vendor Service Integration Examples\n')
  console.log('=' .repeat(60))
  
  await vendorManagementExample()
  
  console.log('=' .repeat(60))
  
  await apiEndpointExample()
  
  console.log('=' .repeat(60))
  console.log('✨ All examples completed!')
}

// Uncomment to run examples
// runVendorIntegrationExamples().catch(console.error)