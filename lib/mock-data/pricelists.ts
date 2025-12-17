/**
 * Mock Pricelist Data
 * Centralized pricelist mock data for the Carmen ERP application
 */

import type { VendorPriceList, VendorPriceListItem } from '@/lib/types'

export const mockPricelists: VendorPriceList[] = [
  {
    id: 'pricelist-001',
    vendorId: 'vendor-001',
    priceListName: 'General Supplies Q2 2024',
    priceListCode: 'PL-2410-001',
    description: 'Comprehensive price list for general supplies',
    currency: 'USD',
    currencyCode: 'USD',
    effectiveStartDate: new Date('2024-04-01'),
    effectiveEndDate: new Date('2024-06-30'),
    status: 'active',
    version: '1.0',
    volumeDiscounts: [],
    totalItems: 245,
    createdBy: 'john.doe@carmen.com',
    approvedBy: 'john.doe@carmen.com',
    approvedAt: new Date('2024-04-20'),
    notes: 'All items submitted with competitive pricing'
  },
  {
    id: 'pricelist-002',
    vendorId: 'vendor-002',
    priceListName: 'Fresh Produce August 2024',
    priceListCode: 'PL-2410-002',
    description: 'Weekly fresh produce pricing',
    currency: 'USD',
    currencyCode: 'USD',
    effectiveStartDate: new Date('2024-08-01'),
    effectiveEndDate: new Date('2024-08-31'),
    status: 'active',
    version: '3.0',
    volumeDiscounts: [],
    totalItems: 156,
    createdBy: 'maria.garcia@carmen.com',
    approvedBy: 'maria.garcia@carmen.com',
    approvedAt: new Date('2024-08-06'),
    notes: 'Weekly fresh produce pricing submitted on time'
  },
  {
    id: 'pricelist-003',
    vendorId: 'vendor-003',
    priceListName: 'Beverages September 2024',
    priceListCode: 'PL-2410-003',
    description: 'Monthly beverage pricing',
    currency: 'USD',
    currencyCode: 'USD',
    effectiveStartDate: new Date('2024-09-01'),
    effectiveEndDate: new Date('2024-09-30'),
    status: 'draft',
    version: '1.0',
    volumeDiscounts: [],
    totalItems: 0,
    createdBy: 'system'
  },
  {
    id: 'pricelist-004',
    vendorId: 'vendor-001',
    priceListName: 'Holiday Catering July 2024',
    priceListCode: 'PL-2410-004',
    description: 'Holiday catering items with seasonal pricing',
    currency: 'USD',
    currencyCode: 'USD',
    effectiveStartDate: new Date('2024-07-01'),
    effectiveEndDate: new Date('2024-07-31'),
    status: 'active',
    version: '1.0',
    volumeDiscounts: [],
    totalItems: 89,
    createdBy: 'john.doe@carmen.com',
    notes: 'Holiday catering items submitted with seasonal pricing'
  }
]

export const mockPricelistItems: VendorPriceListItem[] = [
  {
    id: 'item-001',
    priceListId: 'pricelist-001',
    itemCode: 'BE-001',
    itemName: 'Beach Umbrella - Large',
    productIdentifier: 'BE-001 - Beach Umbrella - Large',
    description: 'Professional grade large beach umbrella with UV protection',
    unit: 'Each',
    unitPrice: {
      amount: 45.00,
      currency: 'USD'
    },
    minimumOrderQuantity: 1,
    leadTimeDays: 7,
    itemDiscounts: [
      {
        id: 'discount-001',
        minQuantity: 10,
        discountType: 'percentage',
        discountValue: 5,
        description: '5% bulk discount for orders of 10+'
      },
      {
        id: 'discount-002',
        minQuantity: 25,
        discountType: 'percentage',
        discountValue: 10,
        description: '10% bulk discount for orders of 25+'
      }
    ],
    notes: 'High quality UV resistant material',
    isActive: true,
    isFoc: false,
    isPreferredVendor: true
  },
  {
    id: 'item-002',
    priceListId: 'pricelist-001',
    itemCode: 'FU-012',
    itemName: 'Poolside Lounge Chair',
    productIdentifier: 'FU-012 - Poolside Lounge Chair',
    description: 'Comfortable poolside lounge chair with adjustable back',
    unit: 'Each',
    unitPrice: {
      amount: 180.00,
      currency: 'USD'
    },
    minimumOrderQuantity: 1,
    leadTimeDays: 14,
    itemDiscounts: [
      {
        id: 'discount-003',
        minQuantity: 5,
        discountType: 'fixed_amount',
        discountValue: 5,
        description: '$5 discount for orders of 5+'
      },
      {
        id: 'discount-004',
        minQuantity: 12,
        discountType: 'fixed_amount',
        discountValue: 10,
        description: '$10 discount for orders of 12+'
      }
    ],
    notes: 'Weather resistant aluminum frame',
    isActive: true,
    isFoc: false,
    isPreferredVendor: true
  }
]