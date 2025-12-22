/**
 * Credit Note Item Grouping Utilities
 *
 * Transforms flat CreditNoteItem arrays into hierarchical structures
 * for display: Product → Location → GRN Line
 */

/**
 * Credit Note Item interface
 */
export interface CreditNoteItem {
  id: string | number;
  location: {
    code: string;
    name: string;
  };
  product: {
    code: string;
    name: string;
    description?: string;
  };
  quantity: {
    primary: number;
    secondary: number;
  };
  unit: {
    primary: string;
    secondary: string;
  };
  price: {
    unit: number;
    secondary: number;
  };
  amounts: {
    net: number;
    tax: number;
    total: number;
    baseNet: number;
    baseTax: number;
    baseTotal: number;
  };
  grnReference?: string;
  grnDate?: string;
  originalQuantity?: number;
  returnQuantity?: number;
  notes?: string;
}

/**
 * Product information extracted from CN items
 */
export interface ProductInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
}

/**
 * Location information extracted from CN items
 */
export interface LocationInfo {
  id: string;
  name: string;
  code?: string;
}

/**
 * GRN Line with associated CN item
 */
export interface GRNLineInfo {
  grnNumber: string;
  grnId?: string;
  item: CreditNoteItem;
}

/**
 * Location group containing GRN lines
 */
export interface LocationGroup {
  location: LocationInfo;
  grnLines: GRNLineInfo[];
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
 * Grouped CN items structure
 */
export interface GroupedCNItems {
  products: Map<string, ProductGroup>;
  totalProducts: number;
  totalItems: number;
}

/**
 * Groups CN items by Product → Location → GRN
 *
 * @param items - Flat array of CreditNoteItem
 * @returns Hierarchical grouped structure
 */
export function groupItemsByProductLocation(
  items: CreditNoteItem[]
): GroupedCNItems {
  const products = new Map<string, ProductGroup>();

  items.forEach((item) => {
    const productId = item.product.code;
    const locationId = item.location.code;
    const grnNumber = item.grnReference || 'No GRN';

    // Get or create product group
    if (!products.has(productId)) {
      products.set(productId, {
        product: {
          id: productId,
          name: item.product.name,
          code: item.product.code,
          description: item.product.description,
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
          name: item.location.name,
          code: item.location.code,
        },
        grnLines: [],
      });
      productGroup.totalLocations++;
    }

    const locationGroup = productGroup.locations.get(locationId)!;

    // Add GRN line
    locationGroup.grnLines.push({
      grnNumber,
      grnId: item.grnReference,
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
 * @returns Flat array of CreditNoteItem
 */
export function flattenGroupedItems(
  grouped: GroupedCNItems
): CreditNoteItem[] {
  const items: CreditNoteItem[] = [];

  grouped.products.forEach((productGroup) => {
    productGroup.locations.forEach((locationGroup) => {
      locationGroup.grnLines.forEach((grnLine) => {
        items.push(grnLine.item);
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
  grouped: GroupedCNItems,
  itemId: string | number,
  updates: Partial<CreditNoteItem>
): GroupedCNItems {
  const newProducts = new Map(grouped.products);

  newProducts.forEach((productGroup, productId) => {
    const newLocations = new Map(productGroup.locations);

    newLocations.forEach((locationGroup, locationId) => {
      const updatedGRNLines = locationGroup.grnLines.map((grnLine) => {
        if (grnLine.item.id === itemId) {
          return {
            ...grnLine,
            item: { ...grnLine.item, ...updates },
          };
        }
        return grnLine;
      });

      newLocations.set(locationId, {
        ...locationGroup,
        grnLines: updatedGRNLines,
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
 * Converts grouped structure to an array format for iteration
 *
 * @param grouped - Hierarchical grouped structure
 * @returns Array of product groups with nested arrays
 */
export function groupedToArray(grouped: GroupedCNItems): Array<{
  productId: string;
  product: ProductInfo;
  totalItems: number;
  totalLocations: number;
  locations: Array<{
    locationId: string;
    location: LocationInfo;
    grnLines: GRNLineInfo[];
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
      grnLines: GRNLineInfo[];
    }>;
  }> = [];

  grouped.products.forEach((productGroup, productId) => {
    const locations: Array<{
      locationId: string;
      location: LocationInfo;
      grnLines: GRNLineInfo[];
    }> = [];

    productGroup.locations.forEach((locationGroup, locationId) => {
      locations.push({
        locationId,
        location: locationGroup.location,
        grnLines: locationGroup.grnLines,
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
