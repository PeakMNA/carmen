/**
 * Price Lists API Route
 *
 * Transaction Code Format: PREFIX-YYMM-NNNN
 * - PREFIX: Document type (CNT = Contract, PL = Pricelist, etc.)
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: CNT-2410-001 = Contract #001 from October 2024
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock data - in a real implementation, this would come from a database
// Transaction codes use format: CNT-YYMM-NNNN (e.g., CNT-2410-001 = Contract #001, October 2024)
const mockPriceLists = [
  {
    id: 'pl-001',
    vendorId: 'vendor-001',
    vendorName: 'ABC Food Supplies',
    title: 'Q1 2024 Food & Beverage Pricing',
    description: 'Comprehensive pricing for all food and beverage categories including seasonal adjustments',
    status: 'active',
    category: 'Food & Beverage',
    currency: 'USD',
    itemCount: 245,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2024-03-31T23:59:59Z',
    lastUpdated: '2024-01-15T10:30:00Z',
    createdBy: 'John Smith',
    categoriesCount: 8,
    activeItemsCount: 238,
    utilizationRate: 87,
    qualityScore: 94,
    isPreferred: true,
    tags: ['seasonal', 'bulk-discount', 'organic'],
    priceRange: { min: 0.50, max: 89.99 },
    geographicScope: ['North America', 'Canada'],
    contractReference: 'CNT-2410-001',
    renewalDate: '2024-04-01T00:00:00Z',
    discountTiers: [
      { minQuantity: 100, discountPercentage: 5 },
      { minQuantity: 500, discountPercentage: 10 },
      { minQuantity: 1000, discountPercentage: 15 }
    ],
    metadata: {
      submissionMethod: 'portal',
      fileFormat: 'xlsx',
      processingTime: 245,
      validationErrors: 0,
      lastAccessedAt: '2024-01-20T14:30:00Z',
      accessCount: 156
    }
  },
  {
    id: 'pl-002',
    vendorId: 'vendor-002',
    vendorName: 'Fresh Produce Co.',
    title: 'Weekly Fresh Produce Rates',
    description: 'Dynamic pricing for fresh fruits and vegetables with daily updates',
    status: 'active',
    category: 'Fresh Produce',
    currency: 'USD',
    itemCount: 89,
    validFrom: '2024-01-22T00:00:00Z',
    validTo: '2024-01-29T23:59:59Z',
    lastUpdated: '2024-01-22T08:00:00Z',
    createdBy: 'Sarah Johnson',
    categoriesCount: 5,
    activeItemsCount: 85,
    utilizationRate: 92,
    qualityScore: 88,
    isPreferred: true,
    tags: ['weekly', 'fresh', 'local'],
    priceRange: { min: 0.75, max: 15.50 },
    geographicScope: ['Local', 'Regional'],
    discountTiers: [
      { minQuantity: 50, discountPercentage: 3 },
      { minQuantity: 200, discountPercentage: 7 }
    ],
    metadata: {
      submissionMethod: 'api',
      processingTime: 45,
      validationErrors: 2,
      lastAccessedAt: '2024-01-22T16:45:00Z',
      accessCount: 89
    }
  },
  {
    id: 'pl-003',
    vendorId: 'vendor-003',
    vendorName: 'Kitchen Equipment Ltd',
    title: 'Commercial Kitchen Equipment 2024',
    description: 'Annual pricing for commercial kitchen equipment and appliances',
    status: 'active',
    category: 'Equipment',
    currency: 'USD',
    itemCount: 156,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2024-12-31T23:59:59Z',
    lastUpdated: '2024-01-10T09:15:00Z',
    createdBy: 'Mike Wilson',
    categoriesCount: 12,
    activeItemsCount: 150,
    utilizationRate: 65,
    qualityScore: 91,
    isPreferred: false,
    tags: ['annual', 'equipment', 'warranty'],
    priceRange: { min: 125.00, max: 15000.00 },
    geographicScope: ['North America'],
    contractReference: 'CNT-2410-003',
    renewalDate: '2025-01-01T00:00:00Z',
    discountTiers: [
      { minQuantity: 1, discountPercentage: 0 },
      { minQuantity: 5, discountPercentage: 8 },
      { minQuantity: 10, discountPercentage: 15 }
    ],
    metadata: {
      submissionMethod: 'email',
      fileFormat: 'pdf',
      processingTime: 1200,
      validationErrors: 5,
      lastAccessedAt: '2024-01-18T11:20:00Z',
      accessCount: 34
    }
  },
  {
    id: 'pl-004',
    vendorId: 'vendor-004',
    vendorName: 'Quality Beverages Inc',
    title: 'Beverage Portfolio Q1 2024',
    description: 'Complete beverage pricing including soft drinks, juices, and specialty beverages',
    status: 'expired',
    category: 'Beverages',
    currency: 'USD',
    itemCount: 78,
    validFrom: '2023-10-01T00:00:00Z',
    validTo: '2024-01-15T23:59:59Z',
    lastUpdated: '2023-12-20T15:30:00Z',
    createdBy: 'Lisa Chen',
    categoriesCount: 6,
    activeItemsCount: 70,
    utilizationRate: 78,
    qualityScore: 85,
    isPreferred: true,
    tags: ['expired', 'beverages', 'seasonal'],
    priceRange: { min: 0.95, max: 8.50 },
    geographicScope: ['Regional'],
    discountTiers: [
      { minQuantity: 24, discountPercentage: 5 },
      { minQuantity: 144, discountPercentage: 12 }
    ],
    metadata: {
      submissionMethod: 'portal',
      fileFormat: 'csv',
      processingTime: 180,
      validationErrors: 1,
      lastAccessedAt: '2024-01-10T13:15:00Z',
      accessCount: 67
    }
  },
  {
    id: 'pl-005',
    vendorId: 'vendor-005',
    vendorName: 'Premium Meats & Seafood',
    title: 'Premium Protein Selection',
    description: 'High-quality meats and seafood with traceability and sustainability certifications',
    status: 'pending',
    category: 'Meat & Seafood',
    currency: 'USD',
    itemCount: 134,
    validFrom: '2024-02-01T00:00:00Z',
    validTo: '2024-04-30T23:59:59Z',
    lastUpdated: '2024-01-20T16:45:00Z',
    createdBy: 'David Rodriguez',
    categoriesCount: 10,
    activeItemsCount: 130,
    utilizationRate: 0,
    qualityScore: 96,
    isPreferred: true,
    tags: ['premium', 'sustainable', 'traceable'],
    priceRange: { min: 4.50, max: 85.00 },
    geographicScope: ['North America', 'International'],
    contractReference: 'CNT-2410-005',
    renewalDate: '2024-05-01T00:00:00Z',
    discountTiers: [
      { minQuantity: 25, discountPercentage: 3 },
      { minQuantity: 100, discountPercentage: 8 },
      { minQuantity: 250, discountPercentage: 12 }
    ],
    metadata: {
      submissionMethod: 'portal',
      fileFormat: 'xlsx',
      processingTime: 320,
      validationErrors: 0,
      accessCount: 12
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const vendor = searchParams.get('vendor') || 'all';
    const currency = searchParams.get('currency') || 'all';
    const sortBy = searchParams.get('sortBy') || 'lastUpdated';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const showExpiringSoon = searchParams.get('showExpiringSoon') === 'true';
    const showPreferredOnly = searchParams.get('showPreferredOnly') === 'true';
    const minUtilization = parseInt(searchParams.get('minUtilization') || '0');
    const minQualityScore = parseInt(searchParams.get('minQualityScore') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredPriceLists = [...mockPriceLists];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPriceLists = filteredPriceLists.filter(pl => 
        pl.title.toLowerCase().includes(searchLower) ||
        pl.vendorName.toLowerCase().includes(searchLower) ||
        pl.description.toLowerCase().includes(searchLower) ||
        pl.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (status !== 'all') {
      filteredPriceLists = filteredPriceLists.filter(pl => pl.status === status);
    }

    // Apply category filter
    if (category !== 'all') {
      filteredPriceLists = filteredPriceLists.filter(pl => pl.category === category);
    }

    // Apply vendor filter
    if (vendor !== 'all') {
      filteredPriceLists = filteredPriceLists.filter(pl => pl.vendorId === vendor);
    }

    // Apply currency filter
    if (currency !== 'all') {
      filteredPriceLists = filteredPriceLists.filter(pl => pl.currency === currency);
    }

    // Apply expiring soon filter
    if (showExpiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filteredPriceLists = filteredPriceLists.filter(pl => {
        const validTo = new Date(pl.validTo);
        return validTo <= thirtyDaysFromNow && pl.status === 'active';
      });
    }

    // Apply preferred only filter
    if (showPreferredOnly) {
      filteredPriceLists = filteredPriceLists.filter(pl => pl.isPreferred);
    }

    // Apply utilization filter
    if (minUtilization > 0) {
      filteredPriceLists = filteredPriceLists.filter(pl => pl.utilizationRate >= minUtilization);
    }

    // Apply quality score filter
    if (minQualityScore > 0) {
      filteredPriceLists = filteredPriceLists.filter(pl => pl.qualityScore >= minQualityScore);
    }

    // Apply sorting
    filteredPriceLists.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      // Handle date strings
      if (typeof aValue === 'string' && aValue.includes('T')) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate pagination
    const totalItems = filteredPriceLists.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredPriceLists.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
      total: mockPriceLists.length,
      filtered: totalItems,
      active: mockPriceLists.filter(pl => pl.status === 'active').length,
      expired: mockPriceLists.filter(pl => pl.status === 'expired').length,
      pending: mockPriceLists.filter(pl => pl.status === 'pending').length,
      expiringSoon: mockPriceLists.filter(pl => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const validTo = new Date(pl.validTo);
        return validTo <= thirtyDaysFromNow && validTo > new Date() && pl.status === 'active';
      }).length,
      averageUtilization: Math.round(
        mockPriceLists.reduce((sum, pl) => sum + pl.utilizationRate, 0) / mockPriceLists.length
      ),
      averageQualityScore: Math.round(
        mockPriceLists.reduce((sum, pl) => sum + pl.qualityScore, 0) / mockPriceLists.length
      ),
      totalCategories: mockPriceLists.reduce((sum, pl) => sum + pl.categoriesCount, 0),
      totalActiveItems: mockPriceLists.reduce((sum, pl) => sum + pl.activeItemsCount, 0),
      categories: [...new Set(mockPriceLists.map(pl => pl.category))],
      vendors: [...new Set(mockPriceLists.map(pl => ({ id: pl.vendorId, name: pl.vendorName })))],
      currencies: [...new Set(mockPriceLists.map(pl => pl.currency))]
    };

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      summary,
      filters: {
        search,
        status,
        category,
        vendor,
        currency,
        sortBy,
        sortOrder,
        showExpiringSoon,
        showPreferredOnly,
        minUtilization,
        minQualityScore
      }
    });

  } catch (error) {
    console.error('Error fetching price lists:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch price lists',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, priceListIds, data } = body;

    switch (action) {
      case 'bulk_activate':
        // Simulate bulk activation
        return NextResponse.json({
          success: true,
          message: `Successfully activated ${priceListIds.length} price lists`,
          affectedIds: priceListIds
        });

      case 'bulk_suspend':
        // Simulate bulk suspension
        return NextResponse.json({
          success: true,
          message: `Successfully suspended ${priceListIds.length} price lists`,
          affectedIds: priceListIds
        });

      case 'bulk_export':
        // Simulate bulk export
        return NextResponse.json({
          success: true,
          message: `Export initiated for ${priceListIds.length} price lists`,
          exportId: `export-${Date.now()}`,
          downloadUrl: `/api/price-management/exports/export-${Date.now()}.xlsx`
        });

      case 'bulk_archive':
        // Simulate bulk archive
        return NextResponse.json({
          success: true,
          message: `Successfully archived ${priceListIds.length} price lists`,
          affectedIds: priceListIds
        });

      case 'update_status':
        // Simulate status update
        return NextResponse.json({
          success: true,
          message: `Status updated to ${data.status}`,
          priceListId: data.priceListId
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing price list action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    // Simulate price list update
    const updatedPriceList = {
      ...mockPriceLists.find(pl => pl.id === id),
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Price list updated successfully',
      data: updatedPriceList
    });

  } catch (error) {
    console.error('Error updating price list:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update price list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Price list ID is required' },
        { status: 400 }
      );
    }

    // Simulate price list deletion
    return NextResponse.json({
      success: true,
      message: 'Price list deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting price list:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete price list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}