/**
 * GRN Item Grouping Utilities
 *
 * Transforms flat GoodsReceiveNoteItem arrays into hierarchical structures
 * for display: Product → Location → PO Line
 */

import { GoodsReceiveNoteItem } from '@/lib/types';

/**
 * Product information extracted from GRN items
 */
export interface ProductInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
}

/**
 * Location information extracted from GRN items
 */
export interface LocationInfo {
  id: string;
  name: string;
  code?: string;
}

/**
 * PO Line with associated GRN item
 */
export interface POLineInfo {
  poNumber: string;
  poId?: string;
  item: GoodsReceiveNoteItem;
}

/**
 * Location group containing PO lines
 */
export interface LocationGroup {
  location: LocationInfo;
  poLines: POLineInfo[];
}

/**
 * Product group containing location groups
 */
export interface ProductGroup {
  product: ProductInfo;
  locations: Map<string, LocationGroup>;
  totalItems: number;
  totalLocations: number;
}

/**
 * Grouped GRN items structure
 */
export interface GroupedGRNItems {
  products: Map<string, ProductGroup>;
  totalProducts: number;
  totalItems: number;
}

/**
 * Groups GRN items by Product → Location → PO
 *
 * @param items - Flat array of GoodsReceiveNoteItem
 * @returns Hierarchical grouped structure
 */
export function groupItemsByProductLocation(
  items: GoodsReceiveNoteItem[]
): GroupedGRNItems {
  const products = new Map<string, ProductGroup>();

  items.forEach((item) => {
    const productId = item.itemId || item.id;
    const locationId = item.storageLocationId || 'unknown';
    const poNumber = item.purchaseOrderId || 'No PO';

    // Handle different field naming conventions in mock data
    // Some data uses 'name' while others use 'itemName'
    const productName = item.itemName || (item as any).name || 'Unknown Product';
    const productCode = item.itemCode || (item as any).sku || (item as any).code || '';

    // Get or create product group
    if (!products.has(productId)) {
      products.set(productId, {
        product: {
          id: productId,
          name: productName,
          code: productCode,
          description: item.description,
        },
        locations: new Map(),
        totalItems: 0,
        totalLocations: 0,
      });
    }

    const productGroup = products.get(productId)!;

    // Get or create location group within product
    if (!productGroup.locations.has(locationId)) {
      productGroup.locations.set(locationId, {
        location: {
          id: locationId,
          name: (item as any).location || locationId,
          code: locationId,
        },
        poLines: [],
      });
      productGroup.totalLocations++;
    }

    const locationGroup = productGroup.locations.get(locationId)!;

    // Add PO line
    locationGroup.poLines.push({
      poNumber,
      poId: item.purchaseOrderId,
      item,
    });

    productGroup.totalItems++;
  });

  return {
    products,
    totalProducts: products.size,
    totalItems: items.length,
  };
}

/**
 * Flattens grouped items back to a flat array
 * Useful for saving changes back to the parent component
 *
 * @param grouped - Hierarchical grouped structure
 * @returns Flat array of GoodsReceiveNoteItem
 */
export function flattenGroupedItems(
  grouped: GroupedGRNItems
): GoodsReceiveNoteItem[] {
  const items: GoodsReceiveNoteItem[] = [];

  grouped.products.forEach((productGroup) => {
    productGroup.locations.forEach((locationGroup) => {
      locationGroup.poLines.forEach((poLine) => {
        items.push(poLine.item);
      });
    });
  });

  return items;
}

/**
 * Updates a specific item within the grouped structure
 * Returns a new grouped structure with the updated item
 *
 * @param grouped - Current grouped structure
 * @param itemId - ID of the item to update
 * @param updates - Partial item updates
 * @returns New grouped structure with updated item
 */
export function updateItemInGrouped(
  grouped: GroupedGRNItems,
  itemId: string,
  updates: Partial<GoodsReceiveNoteItem>
): GroupedGRNItems {
  const newProducts = new Map(grouped.products);

  newProducts.forEach((productGroup, productId) => {
    const newLocations = new Map(productGroup.locations);

    newLocations.forEach((locationGroup, locationId) => {
      const updatedPoLines = locationGroup.poLines.map((poLine) => {
        if (poLine.item.id === itemId) {
          return {
            ...poLine,
            item: { ...poLine.item, ...updates },
          };
        }
        return poLine;
      });

      newLocations.set(locationId, {
        ...locationGroup,
        poLines: updatedPoLines,
      });
    });

    newProducts.set(productId, {
      ...productGroup,
      locations: newLocations,
    });
  });

  return {
    ...grouped,
    products: newProducts,
  };
}

/**
 * Calculates remaining quantity to receive for an item
 *
 * @param item - GRN item
 * @returns Remaining quantity to receive
 */
export function calculateRemainingToReceive(item: GoodsReceiveNoteItem): number {
  const ordered = item.orderedQuantity || 0;
  const previouslyReceived = item.deliveredQuantity || 0;
  const currentReceived = item.receivedQuantity || 0;

  return ordered - previouslyReceived - currentReceived;
}

/**
 * Converts grouped structure to an array format for iteration
 *
 * @param grouped - Hierarchical grouped structure
 * @returns Array of product groups with nested arrays
 */
export function groupedToArray(grouped: GroupedGRNItems): Array<{
  productId: string;
  product: ProductInfo;
  totalItems: number;
  totalLocations: number;
  locations: Array<{
    locationId: string;
    location: LocationInfo;
    poLines: POLineInfo[];
  }>;
}> {
  const result: Array<{
    productId: string;
    product: ProductInfo;
    totalItems: number;
    totalLocations: number;
    locations: Array<{
      locationId: string;
      location: LocationInfo;
      poLines: POLineInfo[];
    }>;
  }> = [];

  grouped.products.forEach((productGroup, productId) => {
    const locations: Array<{
      locationId: string;
      location: LocationInfo;
      poLines: POLineInfo[];
    }> = [];

    productGroup.locations.forEach((locationGroup, locationId) => {
      locations.push({
        locationId,
        location: locationGroup.location,
        poLines: locationGroup.poLines,
      });
    });

    result.push({
      productId,
      product: productGroup.product,
      totalItems: productGroup.totalItems,
      totalLocations: productGroup.totalLocations,
      locations,
    });
  });

  return result;
}
