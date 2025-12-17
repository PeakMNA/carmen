export interface TemplateItem {
  id: string
  itemCode: string
  description: string
  uom: string
  quantity: number
  unitPrice: number
  totalAmount: number
  budgetCode: string
  accountCode: string
  department: string
  taxCode: string
  currency: string
}

export const mockTemplateItems: TemplateItem[] = [
  {
    id: "1",
    itemCode: "RAW-001",
    description: "Fresh Vegetables Assortment",
    uom: "KG",
    quantity: 100,
    unitPrice: 5.50,
    totalAmount: 550.00,
    budgetCode: "BUD-2410-001",
    accountCode: "5001",
    department: "Kitchen",
    taxCode: "VAT7",
    currency: 'USD'
  },
  {
    id: "2",
    itemCode: "RAW-002",
    description: "Premium Beef Cuts",
    uom: "KG",
    quantity: 50,
    unitPrice: 25.00,
    totalAmount: 1250.00,
    budgetCode: "BUD-2410-001",
    accountCode: "5001",
    department: "Kitchen",
    taxCode: "VAT7",
    currency: 'USD'
  },
  {
    id: "3",
    itemCode: "CHEM-001",
    description: "All-Purpose Cleaner",
    uom: "BTL",
    quantity: 24,
    unitPrice: 8.75,
    totalAmount: 210.00,
    budgetCode: "BUD-2410-002",
    accountCode: "5002",
    department: "Housekeeping",
    taxCode: "VAT7",
    currency: 'USD'
  },
  {
    id: "4",
    itemCode: "CHEM-002",
    description: "Glass Cleaner",
    uom: "BTL",
    quantity: 12,
    unitPrice: 6.50,
    totalAmount: 78.00,
    budgetCode: "BUD-2410-002",
    accountCode: "5002",
    department: "Housekeeping",
    taxCode: "VAT7",
    currency: 'USD'
  },
  {
    id: "5",
    itemCode: "SUP-001",
    description: "Paper Towels",
    uom: "CTN",
    quantity: 30,
    unitPrice: 12.00,
    totalAmount: 360.00,
    budgetCode: "BUD-2410-003",
    accountCode: "5003",
    department: "Housekeeping",
    taxCode: "VAT7",
    currency: 'USD'
  }
] 