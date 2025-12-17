// Mock data for vendor management system
import { Vendor, VendorPricelist, RequestForPricing, PricelistTemplate } from '../types'

// Mock vendor data
export const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Tech Innovations Inc.',
    contactEmail: 'contact@techinnovations.com',
    contactPhone: '555-1234',
    address: {
      street: '123 Silicon Valley',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94025',
      country: 'USA'
    },
    status: 'active',
    preferredCurrency: 'BHT',
    paymentTerms: 'NET 30',
    performanceMetrics: {
      responseRate: 95,
      averageResponseTime: 24,
      qualityScore: 92,
      onTimeDeliveryRate: 88,
      totalCampaigns: 15,
      completedSubmissions: 14,
      averageCompletionTime: 18,
      lastSubmissionDate: new Date('2024-01-15')
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'admin',
    companyRegistration: 'TI-2410-001',
    taxId: 'TAX-123456789',
    taxProfile: 'sales-tax',
    taxRate: 8.5,
    website: 'https://techinnovations.com',
    businessType: 'Technology',
    certifications: ['ISO 9001', 'ISO 27001'],
    languages: ['English', 'Spanish'],
    notes: 'Leading technology vendor with excellent track record'
  },
  {
    id: '2',
    name: 'Green Fields Produce',
    contactEmail: 'orders@greenfields.com',
    contactPhone: '555-5678',
    address: {
      street: '456 Farm Road',
      city: 'Portland',
      state: 'OR',
      postalCode: '97301',
      country: 'USA'
    },
    status: 'active',
    preferredCurrency: 'BHT',
    paymentTerms: 'NET 15',
    performanceMetrics: {
      responseRate: 88,
      averageResponseTime: 12,
      qualityScore: 95,
      onTimeDeliveryRate: 92,
      totalCampaigns: 8,
      completedSubmissions: 8,
      averageCompletionTime: 10,
      lastSubmissionDate: new Date('2024-01-10')
    },
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'admin',
    companyRegistration: 'GF-2310-002',
    taxId: 'TAX-987654321',
    taxProfile: 'vat',
    taxRate: 7,
    website: 'https://greenfields.com',
    businessType: 'Agriculture',
    certifications: ['Organic Certified', 'HACCP'],
    languages: ['English'],
    notes: 'Organic produce supplier with fast delivery'
  },
  {
    id: '3',
    name: 'Global Logistics Co.',
    contactEmail: 'logistics@globallogistics.com',
    contactPhone: '555-9012',
    address: {
      street: '789 Harbor Blvd',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    status: 'active',
    preferredCurrency: 'BHT',
    paymentTerms: 'NET 30',
    performanceMetrics: {
      responseRate: 92,
      averageResponseTime: 36,
      qualityScore: 87,
      onTimeDeliveryRate: 85,
      totalCampaigns: 20,
      completedSubmissions: 18,
      averageCompletionTime: 24,
      lastSubmissionDate: new Date('2024-01-12')
    },
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-01-12'),
    createdBy: 'admin',
    companyRegistration: 'GL-2310-003',
    taxId: 'TAX-456789123',
    taxProfile: 'gst',
    taxRate: 10,
    website: 'https://globallogistics.com',
    businessType: 'Transportation',
    certifications: ['DOT Certified', 'IATA'],
    languages: ['English', 'French'],
    notes: 'International logistics provider'
  },
  {
    id: '4',
    name: 'Stellar Manufacturing',
    contactEmail: 'sales@stellarmanufacturing.com',
    contactPhone: '555-3456',
    address: {
      street: '101 Factory Lane',
      city: 'Detroit',
      state: 'MI',
      postalCode: '48201',
      country: 'USA'
    },
    status: 'inactive',
    preferredCurrency: 'BHT',
    paymentTerms: 'NET 45',
    performanceMetrics: {
      responseRate: 78,
      averageResponseTime: 48,
      qualityScore: 90,
      onTimeDeliveryRate: 82,
      totalCampaigns: 12,
      completedSubmissions: 10,
      averageCompletionTime: 30,
      lastSubmissionDate: new Date('2023-12-20')
    },
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-12-20'),
    createdBy: 'admin',
    companyRegistration: 'SM-2310-004',
    taxId: 'TAX-789123456',
    taxProfile: 'none-vat',
    taxRate: 0,
    website: 'https://stellarmanufacturing.com',
    businessType: 'Manufacturing',
    certifications: ['ISO 9001', 'AS9100'],
    languages: ['English'],
    notes: 'Manufacturing partner - currently under review'
  },
  {
    id: '5',
    name: 'Eco Energy Solutions',
    contactEmail: 'info@ecoenergy.com',
    contactPhone: '555-7890',
    address: {
      street: '202 Green Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '77001',
      country: 'USA'
    },
    status: 'active',
    preferredCurrency: 'BHT',
    paymentTerms: 'NET 30',
    performanceMetrics: {
      responseRate: 96,
      averageResponseTime: 18,
      qualityScore: 94,
      onTimeDeliveryRate: 90,
      totalCampaigns: 10,
      completedSubmissions: 10,
      averageCompletionTime: 15,
      lastSubmissionDate: new Date('2024-01-18')
    },
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'admin',
    companyRegistration: 'EE-2310-005',
    taxId: 'TAX-321654987',
    taxProfile: 'custom',
    taxRate: 12.5,
    website: 'https://ecoenergy.com',
    businessType: 'Energy',
    certifications: ['LEED Certified', 'Energy Star'],
    languages: ['English', 'Spanish'],
    notes: 'Renewable energy solutions provider'
  }
]

// Mock campaign data
export const mockCampaigns: RequestForPricing[] = [
  {
    id: '1',
    name: 'Q1 2024 Office Supplies',
    description: 'Collection campaign for office supplies for Q1 2024',
    templateId: '1',
    vendorIds: ['1', '2', '3'],
    schedule: {
      type: 'one-time',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    },
    status: 'active',
    priority: 'high',
    tags: ['office', 'supplies', 'q1'],
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'admin',
    deadlineBuffer: 24,
    maxSubmissionAttempts: 3,
    requireManagerApproval: false,
    invitations: [],
    analytics: {
      totalVendors: 3,
      invitationsSent: 3,
      invitationsDelivered: 3,
      portalAccesses: 2,
      submissionsStarted: 2,
      submissionsCompleted: 1,
      responseRate: 67,
      averageResponseTime: 24,
      completionRate: 50,
      qualityScore: 85,
      vendorEngagement: [
        {
          vendorId: '1',
          accessCount: 5,
          timeSpent: 120,
          completionPercentage: 80,
          lastActivity: new Date('2024-01-15')
        },
        {
          vendorId: '2',
          accessCount: 3,
          timeSpent: 90,
          completionPercentage: 60,
          lastActivity: new Date('2024-01-14')
        }
      ]
    }
  },
  {
    id: '2',
    name: 'Kitchen Equipment Pricing',
    description: 'Annual kitchen equipment pricing collection',
    templateId: '2',
    vendorIds: ['2', '4', '5'],
    schedule: {
      type: 'recurring',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      recurrencePattern: {
        frequency: 'monthly',
        interval: 1
      }
    },
    status: 'draft',
    priority: 'medium',
    tags: ['kitchen', 'equipment', 'annual'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'admin',
    deadlineBuffer: 48,
    maxSubmissionAttempts: 5,
    requireManagerApproval: true,
    invitations: [],
    analytics: {
      totalVendors: 0,
      invitationsSent: 0,
      invitationsDelivered: 0,
      portalAccesses: 0,
      submissionsStarted: 0,
      submissionsCompleted: 0,
      responseRate: 0,
      averageResponseTime: 0,
      completionRate: 0,
      qualityScore: 0,
      vendorEngagement: []
    }
  }
]

// Mock templates
export const mockTemplates: PricelistTemplate[] = [
  {
    id: '1',
    name: 'Office Supplies Template',
    description: 'Template for office supplies pricing',
    productSelection: {
      categories: ['supplies'],
      subcategories: ['disposables'],
      itemGroups: ['paper-products'],
      specificItems: []
    },
    customFields: [],
    instructions: 'Please provide competitive pricing for all office supplies',
    validityPeriod: 90,
    status: 'active',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01'),
    createdBy: 'admin',
    allowMultiMOQ: true,
    requireLeadTime: true,
    defaultCurrency: 'BHT',
    supportedCurrencies: ['BHT', 'USD', 'CNY', 'SGD'],
    maxItemsPerSubmission: 1000,
    notificationSettings: {
      sendReminders: true,
      reminderDays: [7, 3, 1],
      escalationDays: 14
    }
  },
  {
    id: '2',
    name: 'Kitchen Equipment Template',
    description: 'Template for kitchen equipment pricing',
    productSelection: {
      categories: ['equipment'],
      subcategories: ['kitchen'],
      itemGroups: ['prep-equipment'],
      specificItems: []
    },
    customFields: [],
    instructions: 'Please include warranty information and delivery terms',
    validityPeriod: 180,
    status: 'active',
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2023-12-05'),
    createdBy: 'admin',
    allowMultiMOQ: true,
    requireLeadTime: true,
    defaultCurrency: 'BHT',
    supportedCurrencies: ['USD', 'EUR'],
    maxItemsPerSubmission: 500,
    notificationSettings: {
      sendReminders: true,
      reminderDays: [10, 5, 2],
      escalationDays: 21
    }
  },
  {
    id: '3',
    name: 'Seasonal Menu Template',
    description: 'Template for seasonal menu items pricing',
    productSelection: {
      categories: ['food-beverage'],
      subcategories: ['produce'],
      itemGroups: ['vegetables', 'fruits'],
      specificItems: []
    },
    customFields: [],
    instructions: 'Please provide pricing for seasonal menu items with availability dates',
    validityPeriod: 45,
    status: 'inactive',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-12-20'),
    createdBy: 'admin',
    allowMultiMOQ: false,
    requireLeadTime: true,
    defaultCurrency: 'BHT',
    supportedCurrencies: ['BHT', 'USD'],
    maxItemsPerSubmission: 500,
    notificationSettings: {
      sendReminders: true,
      reminderDays: [7, 3, 1],
      escalationDays: 10
    }
  },
  {
    id: '4',
    name: 'Draft Cleaning Supplies Template',
    description: 'Work-in-progress template for cleaning supplies',
    productSelection: {
      categories: ['supplies'],
      subcategories: ['cleaning'],
      itemGroups: [],
      specificItems: []
    },
    customFields: [],
    instructions: '',
    validityPeriod: 60,
    status: 'draft',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'admin',
    allowMultiMOQ: true,
    requireLeadTime: false,
    defaultCurrency: 'BHT',
    supportedCurrencies: ['BHT'],
    maxItemsPerSubmission: 1000,
    notificationSettings: {
      sendReminders: false,
      reminderDays: [],
      escalationDays: 14
    }
  }
]

// Mock pricelist data
export const mockPricelists: VendorPricelist[] = [
  {
    id: '1',
    pricelistNumber: 'PL-2410-001',
    vendorId: '1',
    campaignId: '1',
    templateId: '1',
    invitationId: 'inv-1',
    currency: 'BHT',
    status: 'submitted',
    validFrom: new Date('2024-02-01'),
    validTo: new Date('2024-04-30'),
    submittedAt: new Date('2024-01-15'),
    items: [
      {
        id: '1',
        productId: 'prod-1',
        productCode: 'PEN-001',
        productName: 'Office Pen - Blue',
        productDescription: 'High-quality ballpoint pen',
        category: 'office-supplies',
        subcategory: 'writing-instruments',
        pricing: [
          {
            id: '1',
            moq: 100,
            unit: 'piece',
            unitPrice: 1.50,
            conversionFactor: 1,
            leadTime: 5,
            notes: 'Standard pricing',
            validFrom: new Date('2024-01-15'),
            validTo: new Date('2024-04-15')
          },
          {
            id: '2',
            moq: 500,
            unit: 'piece',
            unitPrice: 1.40,
            conversionFactor: 1,
            leadTime: 5,
            notes: 'Volume discount',
            validFrom: new Date('2024-01-15'),
            validTo: new Date('2024-04-15')
          },
          {
            id: '3',
            moq: 1000,
            unit: 'piece',
            unitPrice: 1.30,
            conversionFactor: 1,
            leadTime: 5,
            notes: 'Bulk pricing',
            validFrom: new Date('2024-01-15'),
            validTo: new Date('2024-04-15')
          }
        ],
        currency: 'BHT',
        leadTime: 5,
        notes: 'Fast delivery available',
        customFieldValues: {
          brand: 'BIC',
          color: 'Blue'
        },
        status: 'submitted',
        qualityScore: 95,
        lastModified: new Date('2024-01-15')
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    completionPercentage: 100,
    qualityScore: 95,
    totalItems: 1,
    completedItems: 1,
    lastAutoSave: new Date('2024-01-15'),
    submissionNotes: 'Submitted on time with competitive pricing',
    version: 1
  }
]

// Mock product categories and items for template creation
export interface ProductCategory {
  id: string
  name: string
  subcategories: ProductSubcategory[]
}

export interface ProductSubcategory {
  id: string
  name: string
  itemGroups?: ProductItemGroup[]
}

export interface ProductItemGroup {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  itemGroup?: string
  defaultOrderUnit: string
  availableOrderUnits: string[]
}

// Common order units for different product types
export const ORDER_UNITS = {
  WEIGHT: ['kg', 'lb', 'g', 'oz', 'ton'],
  VOLUME: ['L', 'ml', 'gal', 'qt', 'fl oz'],
  COUNT: ['piece', 'dozen', 'pack', 'box', 'case'],
  LENGTH: ['m', 'ft', 'cm', 'in', 'yard'],
  AREA: ['sqm', 'sqft'],
  PORTION: ['portion', 'serving']
} as const

export const mockCategories: ProductCategory[] = [
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    subcategories: [
      { 
        id: 'meat-poultry', 
        name: 'Meat & Poultry',
        itemGroups: [
          { id: 'beef-cuts', name: 'Beef Cuts' },
          { id: 'poultry-fresh', name: 'Fresh Poultry' },
          { id: 'processed-meats', name: 'Processed Meats' }
        ]
      },
      { 
        id: 'seafood', 
        name: 'Seafood',
        itemGroups: [
          { id: 'fresh-fish', name: 'Fresh Fish' },
          { id: 'shellfish', name: 'Shellfish' },
          { id: 'frozen-seafood', name: 'Frozen Seafood' }
        ]
      },
      { 
        id: 'produce', 
        name: 'Fresh Produce',
        itemGroups: [
          { id: 'vegetables', name: 'Vegetables' },
          { id: 'fruits', name: 'Fruits' },
          { id: 'herbs-spices', name: 'Herbs & Spices' }
        ]
      },
      { 
        id: 'dairy', 
        name: 'Dairy Products',
        itemGroups: [
          { id: 'milk-cream', name: 'Milk & Cream' },
          { id: 'cheese', name: 'Cheese' },
          { id: 'yogurt', name: 'Yogurt' }
        ]
      },
      { 
        id: 'beverages', 
        name: 'Beverages',
        itemGroups: [
          { id: 'soft-drinks', name: 'Soft Drinks' },
          { id: 'juices', name: 'Juices' },
          { id: 'hot-beverages', name: 'Hot Beverages' }
        ]
      },
      { 
        id: 'dry-goods', 
        name: 'Dry Goods',
        itemGroups: [
          { id: 'grains-rice', name: 'Grains & Rice' },
          { id: 'pasta-noodles', name: 'Pasta & Noodles' },
          { id: 'canned-goods', name: 'Canned Goods' }
        ]
      }
    ]
  },
  {
    id: 'supplies',
    name: 'Supplies',
    subcategories: [
      { 
        id: 'cleaning', 
        name: 'Cleaning Supplies',
        itemGroups: [
          { id: 'detergents', name: 'Detergents' },
          { id: 'disinfectants', name: 'Disinfectants' },
          { id: 'cleaning-tools', name: 'Cleaning Tools' }
        ]
      },
      { 
        id: 'disposables', 
        name: 'Disposables',
        itemGroups: [
          { id: 'paper-products', name: 'Paper Products' },
          { id: 'plastic-items', name: 'Plastic Items' },
          { id: 'packaging', name: 'Packaging' }
        ]
      },
      { 
        id: 'linens', 
        name: 'Linens & Textiles',
        itemGroups: [
          { id: 'bed-linens', name: 'Bed Linens' },
          { id: 'towels', name: 'Towels' },
          { id: 'table-linens', name: 'Table Linens' }
        ]
      },
      { 
        id: 'maintenance', 
        name: 'Maintenance Supplies',
        itemGroups: [
          { id: 'tools', name: 'Tools' },
          { id: 'hardware', name: 'Hardware' },
          { id: 'electrical', name: 'Electrical' }
        ]
      }
    ]
  },
  {
    id: 'equipment',
    name: 'Equipment',
    subcategories: [
      { 
        id: 'kitchen', 
        name: 'Kitchen Equipment',
        itemGroups: [
          { id: 'cooking-equipment', name: 'Cooking Equipment' },
          { id: 'prep-equipment', name: 'Prep Equipment' },
          { id: 'storage-equipment', name: 'Storage Equipment' }
        ]
      },
      { 
        id: 'furniture', 
        name: 'Furniture',
        itemGroups: [
          { id: 'dining-furniture', name: 'Dining Furniture' },
          { id: 'bedroom-furniture', name: 'Bedroom Furniture' },
          { id: 'outdoor-furniture', name: 'Outdoor Furniture' }
        ]
      },
      { 
        id: 'technology', 
        name: 'Technology',
        itemGroups: [
          { id: 'computers', name: 'Computers' },
          { id: 'networking', name: 'Networking' },
          { id: 'audio-visual', name: 'Audio Visual' }
        ]
      },
      { 
        id: 'tools', 
        name: 'Tools & Hardware',
        itemGroups: [
          { id: 'power-tools', name: 'Power Tools' },
          { id: 'hand-tools', name: 'Hand Tools' },
          { id: 'fasteners', name: 'Fasteners' }
        ]
      }
    ]
  },
  {
    id: 'services',
    name: 'Services',
    subcategories: [
      { 
        id: 'maintenance-services', 
        name: 'Maintenance Services',
        itemGroups: [
          { id: 'hvac-services', name: 'HVAC Services' },
          { id: 'plumbing-services', name: 'Plumbing Services' },
          { id: 'electrical-services', name: 'Electrical Services' }
        ]
      },
      { 
        id: 'consulting', 
        name: 'Consulting',
        itemGroups: [
          { id: 'business-consulting', name: 'Business Consulting' },
          { id: 'technical-consulting', name: 'Technical Consulting' },
          { id: 'legal-consulting', name: 'Legal Consulting' }
        ]
      },
      { 
        id: 'delivery', 
        name: 'Delivery Services',
        itemGroups: [
          { id: 'food-delivery', name: 'Food Delivery' },
          { id: 'package-delivery', name: 'Package Delivery' },
          { id: 'freight-delivery', name: 'Freight Delivery' }
        ]
      }
    ]
  }
]

export const mockProducts: Product[] = [
  { id: 'beef-ribeye', name: 'Beef Ribeye Steak', category: 'food-beverage', subcategory: 'meat-poultry', itemGroup: 'beef-cuts', defaultOrderUnit: 'kg', availableOrderUnits: ['kg', 'lb', 'g', 'portion'] },
  { id: 'chicken-breast', name: 'Chicken Breast', category: 'food-beverage', subcategory: 'meat-poultry', itemGroup: 'poultry-fresh', defaultOrderUnit: 'kg', availableOrderUnits: ['kg', 'lb', 'piece', 'portion'] },
  { id: 'salmon-fillet', name: 'Atlantic Salmon Fillet', category: 'food-beverage', subcategory: 'seafood', itemGroup: 'fresh-fish', defaultOrderUnit: 'kg', availableOrderUnits: ['kg', 'lb', 'piece', 'portion'] },
  { id: 'shrimp-jumbo', name: 'Jumbo Shrimp', category: 'food-beverage', subcategory: 'seafood', itemGroup: 'shellfish', defaultOrderUnit: 'kg', availableOrderUnits: ['kg', 'lb', 'piece'] },
  { id: 'tomatoes-vine', name: 'Vine Tomatoes', category: 'food-beverage', subcategory: 'produce', itemGroup: 'vegetables', defaultOrderUnit: 'kg', availableOrderUnits: ['kg', 'lb', 'box', 'case'] },
  { id: 'apples-gala', name: 'Gala Apples', category: 'food-beverage', subcategory: 'produce', itemGroup: 'fruits', defaultOrderUnit: 'kg', availableOrderUnits: ['kg', 'lb', 'box', 'case'] },
  { id: 'milk-whole', name: 'Whole Milk', category: 'food-beverage', subcategory: 'dairy', itemGroup: 'milk-cream', defaultOrderUnit: 'L', availableOrderUnits: ['L', 'ml', 'gal', 'qt'] },
  { id: 'cheddar-cheese', name: 'Cheddar Cheese', category: 'food-beverage', subcategory: 'dairy', itemGroup: 'cheese', defaultOrderUnit: 'kg', availableOrderUnits: ['kg', 'lb', 'g', 'piece'] },
  { id: 'dish-soap', name: 'Commercial Dish Soap', category: 'supplies', subcategory: 'cleaning', itemGroup: 'detergents', defaultOrderUnit: 'L', availableOrderUnits: ['L', 'ml', 'gal', 'bottle'] },
  { id: 'paper-towels', name: 'Paper Towels', category: 'supplies', subcategory: 'disposables', itemGroup: 'paper-products', defaultOrderUnit: 'pack', availableOrderUnits: ['pack', 'piece', 'case', 'box'] },
  { id: 'napkins', name: 'Cocktail Napkins', category: 'supplies', subcategory: 'disposables', itemGroup: 'paper-products', defaultOrderUnit: 'pack', availableOrderUnits: ['pack', 'piece', 'case', 'box'] },
  { id: 'paper-cups', name: 'Disposable Paper Cups', category: 'supplies', subcategory: 'disposables', itemGroup: 'paper-products', defaultOrderUnit: 'pack', availableOrderUnits: ['pack', 'piece', 'case', 'sleeve'] },
  { id: 'plastic-bags', name: 'Food Storage Bags', category: 'supplies', subcategory: 'disposables', itemGroup: 'plastic-items', defaultOrderUnit: 'box', availableOrderUnits: ['box', 'pack', 'piece', 'case'] },
  { id: 'chef-knife', name: "Chef's Knife 8-inch", category: 'equipment', subcategory: 'kitchen', itemGroup: 'prep-equipment', defaultOrderUnit: 'piece', availableOrderUnits: ['piece', 'set'] },
  { id: 'cutting-board', name: 'Commercial Cutting Board', category: 'equipment', subcategory: 'kitchen', itemGroup: 'prep-equipment', defaultOrderUnit: 'piece', availableOrderUnits: ['piece', 'set'] },
  { id: 'dining-chair', name: 'Wooden Dining Chair', category: 'equipment', subcategory: 'furniture', itemGroup: 'dining-furniture', defaultOrderUnit: 'piece', availableOrderUnits: ['piece', 'set'] }
]

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper function to create paginated response
export const createPaginatedResponse = <T>(
  items: T[],
  page: number = 1,
  limit: number = 20
) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = items.slice(startIndex, endIndex)
  
  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    hasMore: endIndex < items.length
  }
}

// Helper function to filter vendors
export const filterVendors = (vendors: Vendor[], filters: any = {}): Vendor[] => {
  return vendors.filter(vendor => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(vendor.status)) {
        return false
      }
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      if (!vendor.name.toLowerCase().includes(searchTerm) &&
          !vendor.contactEmail.toLowerCase().includes(searchTerm) &&
          !vendor.businessType?.toLowerCase().includes(searchTerm)) {
        return false
      }
    }
    
    return true
  })
}