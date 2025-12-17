/**
 * Mock Vendor Data
 * Centralized vendor mock data for the Carmen ERP application
 *
 * Reference Code Format: PREFIX-YYMM-NNNN
 * - PREFIX: Company/Business type identifier (e.g., TI, GF, GL, SM, EE)
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: TI-2410-001 = Business Registration #001 from October 2024
 */

import type { Vendor } from '@/lib/types'

// Define a simple enum for address types since we don't have access to the lib version
export enum AddressType {
  MAIN = 'MAIN',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  BRANCH = 'BRANCH'
}

export const mockVendors: Vendor[] = [
  {
    id: 'vendor-001',
    vendorCode: 'VEN-001',
    companyName: 'Premium Food Suppliers Ltd',
    displayName: 'Premium Food',
    businessRegistrationNumber: 'BRN123456',
    taxId: 'TAX123456',
    vatNumber: 'VAT123456',
    establishmentDate: '2020-01-15',
    businessType: 'distributor',
    industryCategory: 'Food & Beverage',
    status: 'active',
    rating: 4.5,
    isActive: true,
    addresses: [
      {
        id: 'addr-001',
        vendorId: 'vendor-001',
        addressLine: '123 Food Street, Culinary District, CD 12345',
        addressType: 'MAIN' as any,
        isPrimary: true,
        isHeadOffice: true
      }
    ],
    contacts: [
      {
        id: 'contact-001',
        vendorId: 'vendor-001',
        name: 'John Smith',
        email: 'john@premiumfood.com',
        phone: '+1-555-0101',
        position: 'Sales Manager',
        isPrimary: true,
        canReceiveOrders: true,
        canReceiveInvoices: true,
        canReceivePayments: false
      }
    ],
    certifications: [],
    bankAccounts: [],
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 30',
    onTimeDeliveryRate: 95,
    qualityRating: 4.5,
    priceCompetitiveness: 4.0
  },
  {
    id: 'vendor-002',
    vendorCode: 'VEN-002',
    companyName: 'Fresh Produce Market',
    displayName: 'Fresh Produce',
    businessRegistrationNumber: 'BRN789012',
    taxId: 'TAX789012',
    vatNumber: 'VAT789012',
    establishmentDate: '2019-06-01',
    businessType: 'wholesaler',
    industryCategory: 'Produce',
    status: 'active',
    rating: 4.8,
    isActive: true,
    addresses: [
      {
        id: 'addr-002',
        vendorId: 'vendor-002',
        addressLine: '456 Garden Ave, Fresh Valley, FV 67890',
        addressType: 'MAIN' as any,
        isPrimary: true,
        isHeadOffice: true
      }
    ],
    contacts: [
      {
        id: 'contact-002',
        vendorId: 'vendor-002',
        name: 'Maria Garcia',
        email: 'maria@freshproduce.com',
        phone: '+1-555-0102',
        position: 'Account Manager',
        isPrimary: true,
        canReceiveOrders: true,
        canReceiveInvoices: true,
        canReceivePayments: true
      }
    ],
    certifications: [],
    bankAccounts: [],
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 15',
    onTimeDeliveryRate: 98,
    qualityRating: 4.8,
    priceCompetitiveness: 4.5
  },
  {
    id: 'vendor-003',
    vendorCode: 'VEN-003',
    companyName: 'Kitchen Equipment Co',
    displayName: 'Kitchen Equipment',
    businessRegistrationNumber: 'BRN345678',
    taxId: 'TAX345678',
    vatNumber: 'VAT345678',
    establishmentDate: '2018-03-20',
    businessType: 'manufacturer',
    industryCategory: 'Equipment',
    status: 'active',
    rating: 4.2,
    isActive: true,
    addresses: [
      {
        id: 'addr-003',
        vendorId: 'vendor-003',
        addressLine: '789 Equipment Blvd, Industrial Park, IP 11111',
        addressType: 'MAIN' as any,
        isPrimary: true,
        isHeadOffice: true,
        isWarehouse: true
      }
    ],
    contacts: [
      {
        id: 'contact-003',
        vendorId: 'vendor-003',
        name: 'David Chen',
        email: 'david@kitchenequip.com',
        phone: '+1-555-0103',
        position: 'Director of Sales',
        isPrimary: true,
        canReceiveOrders: true,
        canReceiveInvoices: false,
        canReceivePayments: false
      }
    ],
    certifications: [],
    bankAccounts: [],
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 45',
    creditLimit: {
      amount: 100000,
      currency: 'USD'
    },
    creditDays: 45,
    onTimeDeliveryRate: 92,
    qualityRating: 4.2,
    priceCompetitiveness: 3.8
  },
  // Merged from app/(main)/vendor-management/manage-vendors/data/mock.ts
  {
    id: '1',
    vendorCode: 'VEN-004', // Added code
    companyName: 'Acme Corporation',
    displayName: 'Acme Corp', // Added display name
    businessRegistrationNumber: 'BR123456',
    taxId: 'TAX123456',
    establishmentDate: '2000-01-01',
    businessType: 'service_provider',
    industryCategory: 'Technology',
    status: 'active',
    rating: 4.5,
    isActive: true,
    addresses: [
      {
        id: 'addr1',
        vendorId: '1', // Added vendorId
        addressLine: '123 Main St',
        subDistrictId: 'SD001',
        districtId: 'D001',
        provinceId: 'P001',
        postalCode: '10001',
        addressType: AddressType.MAIN as any,
        isPrimary: true
      }
    ],
    contacts: [
      {
        id: 'cont1',
        vendorId: '1', // Added vendorId
        name: 'John Doe',
        email: 'john.doe@acme.com',
        phone: '+1-555-0123',
        position: 'Manager',
        department: 'Procurement',
        isPrimary: true
      }
    ],
    certifications: [
      {
        id: 'cert1',
        vendorId: '1',
        certificationType: 'Quality Management',
        name: 'ISO 9001',
        status: 'active',
        issuer: 'ISO',
        issueDate: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31')
      }
    ],
    bankAccounts: [],
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 30'
  },
  // Merged from app/(main)/vendor-management/lib/mock-data.ts
  {
    id: 'vendor-004',
    vendorCode: 'VEN-005',
    companyName: 'Tech Innovations Inc.',
    displayName: 'Tech Innovations',
    businessRegistrationNumber: 'TI-2410-001',
    taxId: 'TAX-123456789',
    establishmentDate: '2024-01-01',
    businessType: 'service_provider',
    industryCategory: 'Technology',
    status: 'active',
    rating: 4.6, // Calculated from performance metrics
    isActive: true,
    addresses: [
      {
        id: 'addr-004',
        vendorId: 'vendor-004',
        addressLine: '123 Silicon Valley',
        postalCode: '94025',
        country: 'USA',
        addressType: 'MAIN' as any,
        isPrimary: true
      }
    ],
    contacts: [
      {
        id: 'contact-004',
        vendorId: 'vendor-004',
        name: 'Contact Person',
        email: 'contact@techinnovations.com',
        phone: '555-1234',
        position: 'Representative',
        isPrimary: true
      }
    ],
    certifications: [
      
      
    ],
    bankAccounts: [],
    preferredCurrency: 'BHT',
    preferredPaymentTerms: 'NET 30',
    onTimeDeliveryRate: 88,
    qualityRating: 4.6, // 92/20
    priceCompetitiveness: 4.0
  },
  {
    id: 'vendor-005',
    vendorCode: 'VEN-006',
    companyName: 'Green Fields Produce',
    displayName: 'Green Fields',
    businessRegistrationNumber: 'GF-2310-002',
    taxId: 'TAX-987654321',
    establishmentDate: '2023-12-15',
    businessType: 'distributor',
    industryCategory: 'Produce',
    status: 'active',
    rating: 4.75, // 95/20
    isActive: true,
    addresses: [
      {
        id: 'addr-005',
        vendorId: 'vendor-005',
        addressLine: '456 Farm Road',
        postalCode: '97301',
        country: 'USA',
        addressType: 'MAIN' as any,
        isPrimary: true
      }
    ],
    contacts: [
      {
        id: 'contact-005',
        vendorId: 'vendor-005',
        name: 'Contact Person',
        email: 'orders@greenfields.com',
        phone: '555-5678',
        position: 'Representative',
        isPrimary: true
      }
    ],
    certifications: [
      
      
    ],
    bankAccounts: [],
    preferredCurrency: 'BHT',
    preferredPaymentTerms: 'NET 15',
    onTimeDeliveryRate: 92,
    qualityRating: 4.75,
    priceCompetitiveness: 4.0
  },
  {
    id: 'vendor-006',
    vendorCode: 'VEN-007',
    companyName: 'Global Logistics Co.',
    displayName: 'Global Logistics',
    businessRegistrationNumber: 'GL-2310-003',
    taxId: 'TAX-456789123',
    establishmentDate: '2023-11-01',
    businessType: 'service_provider',
    industryCategory: 'Logistics',
    status: 'active',
    rating: 4.35, // 87/20
    isActive: true,
    addresses: [
      {
        id: 'addr-006',
        vendorId: 'vendor-006',
        addressLine: '789 Harbor Blvd',
        postalCode: '10001',
        country: 'USA',
        addressType: 'MAIN' as any,
        isPrimary: true
      }
    ],
    contacts: [
      {
        id: 'contact-006',
        vendorId: 'vendor-006',
        name: 'Contact Person',
        email: 'logistics@globallogistics.com',
        phone: '555-9012',
        position: 'Representative',
        isPrimary: true
      }
    ],
    certifications: [
      
      
    ],
    bankAccounts: [],
    preferredCurrency: 'BHT',
    preferredPaymentTerms: 'NET 30',
    onTimeDeliveryRate: 85,
    qualityRating: 4.35,
    priceCompetitiveness: 4.0
  },
  {
    id: 'vendor-007',
    vendorCode: 'VEN-008',
    companyName: 'Stellar Manufacturing',
    displayName: 'Stellar Mfg',
    businessRegistrationNumber: 'SM-2310-004',
    taxId: 'TAX-789123456',
    establishmentDate: '2023-10-15',
    businessType: 'manufacturer',
    industryCategory: 'Manufacturing',
    status: 'inactive',
    rating: 4.5, // 90/20
    isActive: false,
    addresses: [
      {
        id: 'addr-007',
        vendorId: 'vendor-007',
        addressLine: '101 Factory Lane',
        postalCode: '48201',
        country: 'USA',
        addressType: 'MAIN' as any,
        isPrimary: true
      }
    ],
    contacts: [
      {
        id: 'contact-007',
        vendorId: 'vendor-007',
        name: 'Contact Person',
        email: 'sales@stellarmanufacturing.com',
        phone: '555-3456',
        position: 'Representative',
        isPrimary: true
      }
    ],
    certifications: [
      
      
    ],
    bankAccounts: [],
    preferredCurrency: 'BHT',
    preferredPaymentTerms: 'NET 45',
    onTimeDeliveryRate: 82,
    qualityRating: 4.5,
    priceCompetitiveness: 4.0
  },
  {
    id: 'vendor-008',
    vendorCode: 'VEN-009',
    companyName: 'Eco Energy Solutions',
    displayName: 'Eco Energy',
    businessRegistrationNumber: 'EE-2310-005',
    taxId: 'TAX-321654987',
    establishmentDate: '2023-09-01',
    businessType: 'service_provider',
    industryCategory: 'Energy',
    status: 'active',
    rating: 4.7, // 94/20
    isActive: true,
    addresses: [
      {
        id: 'addr-008',
        vendorId: 'vendor-008',
        addressLine: '202 Green Street',
        postalCode: '77001',
        country: 'USA',
        addressType: 'MAIN' as any,
        isPrimary: true
      }
    ],
    contacts: [
      {
        id: 'contact-008',
        vendorId: 'vendor-008',
        name: 'Contact Person',
        email: 'info@ecoenergy.com',
        phone: '555-7890',
        position: 'Representative',
        isPrimary: true
      }
    ],
    certifications: [
      
      
    ],
    bankAccounts: [],
    preferredCurrency: 'BHT',
    preferredPaymentTerms: 'NET 30',
    onTimeDeliveryRate: 90,
    qualityRating: 4.7,
    priceCompetitiveness: 4.0
  }
]

export const MOCK_VENDORS: Record<string, Vendor> = mockVendors.reduce((acc, vendor) => {
  acc[vendor.id] = vendor
  return acc
}, {} as Record<string, Vendor>)

export const BUSINESS_TYPES = [
  { id: "TECH001", name: "Technology" },
  { id: "RETAIL001", name: "Retail" },
  { id: "MANUF001", name: "Manufacturing" },
  { id: "SERVICE001", name: "Service" },
  { id: "CONSULT001", name: "Consulting" }
]

export const ADDRESS_TYPES = [
  { id: AddressType.MAIN, name: "Main Office" },
  { id: AddressType.BILLING, name: "Billing Address" },
  { id: AddressType.SHIPPING, name: "Shipping Address" },
  { id: AddressType.BRANCH, name: "Branch Office" }
]

export function getMockVendor(id: string): Vendor | undefined {
  return mockVendors.find(v => v.id === id)
}
