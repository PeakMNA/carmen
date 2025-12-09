import { BalanceReport } from "@/app/(main)/inventory-management/stock-overview/inventory-balance/types"

export const mockBalanceReport: BalanceReport = {
  locations: [
    {
      id: "loc-004",
      code: "WH-001",
      name: "Main Warehouse",
      categories: [
        {
          id: "cat1",
          code: "PROD",
          name: "Produce",
          products: [
            {
              id: "prod1",
              code: "P-1001",
              name: "Fresh Tomatoes",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 50, maximum: 200 },
              totals: { quantity: 185, averageCost: 3.50, value: 647.50 },
              lots: [
                { lotNumber: "LOT-2024-12-01", expiryDate: "2024-12-15", quantity: 100, unitCost: 3.40, value: 340 },
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-20", quantity: 85, unitCost: 3.62, value: 307.50 }
              ]
            },
            {
              id: "prod2",
              code: "P-1002",
              name: "Yellow Onions",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 100, maximum: 500 },
              totals: { quantity: 420, averageCost: 2.25, value: 945 },
              lots: [
                { lotNumber: "LOT-2024-11-20", expiryDate: "2025-01-20", quantity: 250, unitCost: 2.20, value: 550 },
                { lotNumber: "LOT-2024-12-01", expiryDate: "2025-02-01", quantity: 170, unitCost: 2.32, value: 395 }
              ]
            },
            {
              id: "prod3",
              code: "P-1003",
              name: "Russet Potatoes",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 200, maximum: 800 },
              totals: { quantity: 650, averageCost: 1.85, value: 1202.50 },
              lots: [
                { lotNumber: "LOT-2024-11-25", expiryDate: "2025-01-25", quantity: 400, unitCost: 1.80, value: 720 },
                { lotNumber: "LOT-2024-12-02", expiryDate: "2025-02-02", quantity: 250, unitCost: 1.93, value: 482.50 }
              ]
            },
            {
              id: "prod4",
              code: "P-1004",
              name: "Fresh Carrots",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 80, maximum: 300 },
              totals: { quantity: 275, averageCost: 2.40, value: 660 },
              lots: [
                { lotNumber: "LOT-2024-12-01", expiryDate: "2025-01-15", quantity: 275, unitCost: 2.40, value: 660 }
              ]
            },
            {
              id: "prod5",
              code: "P-1005",
              name: "Iceberg Lettuce",
              unit: "head",
              tracking: { batch: true },
              thresholds: { minimum: 50, maximum: 150 },
              totals: { quantity: 120, averageCost: 1.80, value: 216 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-12", quantity: 120, unitCost: 1.80, value: 216 }
              ]
            },
            {
              id: "prod6",
              code: "P-1006",
              name: "Bell Peppers Mixed",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 30, maximum: 100 },
              totals: { quantity: 85, averageCost: 5.50, value: 467.50 },
              lots: [
                { lotNumber: "LOT-2024-12-03", expiryDate: "2024-12-18", quantity: 85, unitCost: 5.50, value: 467.50 }
              ]
            }
          ],
          totals: { quantity: 1735, value: 4138.50 }
        },
        {
          id: "cat2",
          code: "MEAT",
          name: "Meat & Poultry",
          products: [
            {
              id: "prod7",
              code: "M-2001",
              name: "Chicken Breast Boneless",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 50, maximum: 150 },
              totals: { quantity: 125, averageCost: 9.50, value: 1187.50 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-11", quantity: 75, unitCost: 9.40, value: 705 },
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-12", quantity: 50, unitCost: 9.65, value: 482.50 }
              ]
            },
            {
              id: "prod8",
              code: "M-2002",
              name: "Ground Beef Premium",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 40, maximum: 120 },
              totals: { quantity: 95, averageCost: 14.25, value: 1353.75 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-10", quantity: 95, unitCost: 14.25, value: 1353.75 }
              ]
            },
            {
              id: "prod9",
              code: "M-2003",
              name: "Beef Tenderloin",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 20, maximum: 60 },
              totals: { quantity: 45, averageCost: 42.00, value: 1890 },
              lots: [
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-12", quantity: 45, unitCost: 42.00, value: 1890 }
              ]
            },
            {
              id: "prod10",
              code: "M-2004",
              name: "Lamb Rack",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 15, maximum: 40 },
              totals: { quantity: 32, averageCost: 38.50, value: 1232 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-11", quantity: 32, unitCost: 38.50, value: 1232 }
              ]
            },
            {
              id: "prod11",
              code: "M-2005",
              name: "Pork Belly",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 25, maximum: 80 },
              totals: { quantity: 68, averageCost: 12.75, value: 867 },
              lots: [
                { lotNumber: "LOT-2024-12-03", expiryDate: "2024-12-13", quantity: 68, unitCost: 12.75, value: 867 }
              ]
            }
          ],
          totals: { quantity: 365, value: 6530.25 }
        },
        {
          id: "cat3",
          code: "SEAFOOD",
          name: "Seafood",
          products: [
            {
              id: "prod12",
              code: "SF-3001",
              name: "Atlantic Salmon Fillet",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 20, maximum: 60 },
              totals: { quantity: 48, averageCost: 28.50, value: 1368 },
              lots: [
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-10", quantity: 48, unitCost: 28.50, value: 1368 }
              ]
            },
            {
              id: "prod13",
              code: "SF-3002",
              name: "Tiger Prawns Large",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 15, maximum: 40 },
              totals: { quantity: 35, averageCost: 32.00, value: 1120 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-09", quantity: 35, unitCost: 32.00, value: 1120 }
              ]
            },
            {
              id: "prod14",
              code: "SF-3003",
              name: "Sea Bass Whole",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 10, maximum: 30 },
              totals: { quantity: 22, averageCost: 24.00, value: 528 },
              lots: [
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-10", quantity: 22, unitCost: 24.00, value: 528 }
              ]
            },
            {
              id: "prod15",
              code: "SF-3004",
              name: "Blue Crab",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 8, maximum: 25 },
              totals: { quantity: 18, averageCost: 45.00, value: 810 },
              lots: [
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-08", quantity: 18, unitCost: 45.00, value: 810 }
              ]
            }
          ],
          totals: { quantity: 123, value: 3826 }
        },
        {
          id: "cat4",
          code: "DAIRY",
          name: "Dairy & Eggs",
          products: [
            {
              id: "prod16",
              code: "D-4001",
              name: "Fresh Milk Full Cream",
              unit: "liter",
              tracking: { batch: true },
              thresholds: { minimum: 100, maximum: 300 },
              totals: { quantity: 280, averageCost: 2.45, value: 686 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-14", quantity: 150, unitCost: 2.40, value: 360 },
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-15", quantity: 130, unitCost: 2.51, value: 326 }
              ]
            },
            {
              id: "prod17",
              code: "D-4002",
              name: "Heavy Cream",
              unit: "liter",
              tracking: { batch: true },
              thresholds: { minimum: 40, maximum: 120 },
              totals: { quantity: 95, averageCost: 6.80, value: 646 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-18", quantity: 95, unitCost: 6.80, value: 646 }
              ]
            },
            {
              id: "prod18",
              code: "D-4003",
              name: "Butter Unsalted",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 30, maximum: 100 },
              totals: { quantity: 75, averageCost: 12.50, value: 937.50 },
              lots: [
                { lotNumber: "LOT-2024-11-28", expiryDate: "2025-02-28", quantity: 75, unitCost: 12.50, value: 937.50 }
              ]
            },
            {
              id: "prod19",
              code: "D-4004",
              name: "Cheddar Cheese Aged",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 20, maximum: 60 },
              totals: { quantity: 48, averageCost: 18.75, value: 900 },
              lots: [
                { lotNumber: "LOT-2024-11-15", expiryDate: "2025-03-15", quantity: 48, unitCost: 18.75, value: 900 }
              ]
            },
            {
              id: "prod20",
              code: "D-4005",
              name: "Eggs Grade A Large",
              unit: "dozen",
              tracking: { batch: true },
              thresholds: { minimum: 100, maximum: 300 },
              totals: { quantity: 240, averageCost: 4.25, value: 1020 },
              lots: [
                { lotNumber: "LOT-2024-12-03", expiryDate: "2025-01-03", quantity: 240, unitCost: 4.25, value: 1020 }
              ]
            },
            {
              id: "prod21",
              code: "D-4006",
              name: "Greek Yogurt",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 25, maximum: 80 },
              totals: { quantity: 65, averageCost: 5.80, value: 377 },
              lots: [
                { lotNumber: "LOT-2024-12-02", expiryDate: "2024-12-22", quantity: 65, unitCost: 5.80, value: 377 }
              ]
            }
          ],
          totals: { quantity: 803, value: 4566.50 }
        },
        {
          id: "cat5",
          code: "DRY",
          name: "Dry Goods & Pantry",
          products: [
            {
              id: "prod22",
              code: "DG-5001",
              name: "Jasmine Rice Premium",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 300, maximum: 1000 },
              totals: { quantity: 850, averageCost: 3.20, value: 2720 },
              lots: []
            },
            {
              id: "prod23",
              code: "DG-5002",
              name: "All Purpose Flour",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 200, maximum: 600 },
              totals: { quantity: 480, averageCost: 1.85, value: 888 },
              lots: []
            },
            {
              id: "prod24",
              code: "DG-5003",
              name: "Spaghetti Pasta",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 150, maximum: 400 },
              totals: { quantity: 320, averageCost: 2.45, value: 784 },
              lots: []
            },
            {
              id: "prod25",
              code: "DG-5004",
              name: "Olive Oil Extra Virgin",
              unit: "liter",
              tracking: { batch: false },
              thresholds: { minimum: 50, maximum: 150 },
              totals: { quantity: 120, averageCost: 12.50, value: 1500 },
              lots: []
            },
            {
              id: "prod26",
              code: "DG-5005",
              name: "Granulated Sugar",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 200, maximum: 500 },
              totals: { quantity: 380, averageCost: 1.45, value: 551 },
              lots: []
            },
            {
              id: "prod27",
              code: "DG-5006",
              name: "Canned Tomatoes",
              unit: "can",
              tracking: { batch: false },
              thresholds: { minimum: 100, maximum: 300 },
              totals: { quantity: 245, averageCost: 2.80, value: 686 },
              lots: []
            }
          ],
          totals: { quantity: 2395, value: 7129 }
        },
        {
          id: "cat6",
          code: "BEV",
          name: "Beverages",
          products: [
            {
              id: "prod28",
              code: "BV-6001",
              name: "Orange Juice Fresh",
              unit: "liter",
              tracking: { batch: true },
              thresholds: { minimum: 80, maximum: 200 },
              totals: { quantity: 165, averageCost: 4.50, value: 742.50 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-18", quantity: 165, unitCost: 4.50, value: 742.50 }
              ]
            },
            {
              id: "prod29",
              code: "BV-6002",
              name: "Mineral Water Still",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 200, maximum: 600 },
              totals: { quantity: 480, averageCost: 1.20, value: 576 },
              lots: []
            },
            {
              id: "prod30",
              code: "BV-6003",
              name: "Coffee Beans Arabica",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 30, maximum: 80 },
              totals: { quantity: 65, averageCost: 28.00, value: 1820 },
              lots: [
                { lotNumber: "LOT-2024-11-20", expiryDate: "2025-05-20", quantity: 65, unitCost: 28.00, value: 1820 }
              ]
            }
          ],
          totals: { quantity: 710, value: 3138.50 }
        }
      ],
      totals: { quantity: 6131, value: 29328.75 }
    },
    {
      id: "loc-003",
      code: "KIT-001",
      name: "Central Kitchen",
      categories: [
        {
          id: "cat1",
          code: "PROD",
          name: "Produce",
          products: [
            {
              id: "prod1",
              code: "P-1001",
              name: "Fresh Tomatoes",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 20, maximum: 60 },
              totals: { quantity: 45, averageCost: 3.55, value: 159.75 },
              lots: [
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-12", quantity: 45, unitCost: 3.55, value: 159.75 }
              ]
            },
            {
              id: "prod2",
              code: "P-1002",
              name: "Yellow Onions",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 30, maximum: 100 },
              totals: { quantity: 85, averageCost: 2.30, value: 195.50 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2025-01-04", quantity: 85, unitCost: 2.30, value: 195.50 }
              ]
            },
            {
              id: "prod31",
              code: "P-1007",
              name: "Fresh Garlic",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 5, maximum: 20 },
              totals: { quantity: 12, averageCost: 8.50, value: 102 },
              lots: [
                { lotNumber: "LOT-2024-12-01", expiryDate: "2025-01-15", quantity: 12, unitCost: 8.50, value: 102 }
              ]
            },
            {
              id: "prod32",
              code: "P-1008",
              name: "Fresh Herbs Assorted",
              unit: "bundle",
              tracking: { batch: true },
              thresholds: { minimum: 15, maximum: 40 },
              totals: { quantity: 28, averageCost: 3.75, value: 105 },
              lots: [
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-10", quantity: 28, unitCost: 3.75, value: 105 }
              ]
            }
          ],
          totals: { quantity: 170, value: 562.25 }
        },
        {
          id: "cat2",
          code: "MEAT",
          name: "Meat & Poultry",
          products: [
            {
              id: "prod7",
              code: "M-2001",
              name: "Chicken Breast Boneless",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 15, maximum: 40 },
              totals: { quantity: 32, averageCost: 9.55, value: 305.60 },
              lots: [
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-10", quantity: 32, unitCost: 9.55, value: 305.60 }
              ]
            },
            {
              id: "prod8",
              code: "M-2002",
              name: "Ground Beef Premium",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 10, maximum: 30 },
              totals: { quantity: 18, averageCost: 14.30, value: 257.40 },
              lots: [
                { lotNumber: "LOT-2024-12-05", expiryDate: "2024-12-09", quantity: 18, unitCost: 14.30, value: 257.40 }
              ]
            }
          ],
          totals: { quantity: 50, value: 563 }
        },
        {
          id: "cat6",
          code: "SPICE",
          name: "Spices & Seasonings",
          products: [
            {
              id: "prod33",
              code: "SP-7001",
              name: "Black Pepper Ground",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 2, maximum: 10 },
              totals: { quantity: 5.5, averageCost: 32.00, value: 176 },
              lots: []
            },
            {
              id: "prod34",
              code: "SP-7002",
              name: "Sea Salt Fine",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 10, maximum: 30 },
              totals: { quantity: 22, averageCost: 2.50, value: 55 },
              lots: []
            },
            {
              id: "prod35",
              code: "SP-7003",
              name: "Paprika Smoked",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 1, maximum: 5 },
              totals: { quantity: 3.2, averageCost: 28.00, value: 89.60 },
              lots: []
            },
            {
              id: "prod36",
              code: "SP-7004",
              name: "Cumin Ground",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 1, maximum: 5 },
              totals: { quantity: 2.8, averageCost: 24.00, value: 67.20 },
              lots: []
            }
          ],
          totals: { quantity: 33.5, value: 387.80 }
        }
      ],
      totals: { quantity: 253.5, value: 1513.05 }
    },
    {
      id: "loc-002",
      code: "REST-001",
      name: "Main Restaurant",
      categories: [
        {
          id: "cat7",
          code: "SPIRITS",
          name: "Spirits & Liquors",
          products: [
            {
              id: "prod37",
              code: "AL-8001",
              name: "Vodka Premium",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 10, maximum: 40 },
              totals: { quantity: 28, averageCost: 45.00, value: 1260 },
              lots: []
            },
            {
              id: "prod38",
              code: "AL-8002",
              name: "Whisky Single Malt",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 8, maximum: 30 },
              totals: { quantity: 22, averageCost: 85.00, value: 1870 },
              lots: []
            },
            {
              id: "prod39",
              code: "AL-8003",
              name: "Gin London Dry",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 10, maximum: 35 },
              totals: { quantity: 25, averageCost: 38.00, value: 950 },
              lots: []
            },
            {
              id: "prod40",
              code: "AL-8004",
              name: "Rum Dark Aged",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 8, maximum: 25 },
              totals: { quantity: 18, averageCost: 42.00, value: 756 },
              lots: []
            },
            {
              id: "prod41",
              code: "AL-8005",
              name: "Tequila Reposado",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 6, maximum: 20 },
              totals: { quantity: 15, averageCost: 55.00, value: 825 },
              lots: []
            }
          ],
          totals: { quantity: 108, value: 5661 }
        },
        {
          id: "cat8",
          code: "WINE",
          name: "Wines",
          products: [
            {
              id: "prod42",
              code: "WN-9001",
              name: "Cabernet Sauvignon Reserve",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 12, maximum: 48 },
              totals: { quantity: 36, averageCost: 32.00, value: 1152 },
              lots: []
            },
            {
              id: "prod43",
              code: "WN-9002",
              name: "Chardonnay Premium",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 12, maximum: 48 },
              totals: { quantity: 42, averageCost: 28.00, value: 1176 },
              lots: []
            },
            {
              id: "prod44",
              code: "WN-9003",
              name: "Prosecco DOC",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 15, maximum: 60 },
              totals: { quantity: 48, averageCost: 18.00, value: 864 },
              lots: []
            },
            {
              id: "prod45",
              code: "WN-9004",
              name: "Champagne Brut",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 6, maximum: 24 },
              totals: { quantity: 18, averageCost: 75.00, value: 1350 },
              lots: []
            }
          ],
          totals: { quantity: 144, value: 4542 }
        },
        {
          id: "cat9",
          code: "MIXERS",
          name: "Mixers & Garnishes",
          products: [
            {
              id: "prod46",
              code: "MX-0001",
              name: "Tonic Water Premium",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 48, maximum: 144 },
              totals: { quantity: 96, averageCost: 2.50, value: 240 },
              lots: []
            },
            {
              id: "prod47",
              code: "MX-0002",
              name: "Fresh Lime",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 5, maximum: 15 },
              totals: { quantity: 8, averageCost: 6.00, value: 48 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-18", quantity: 8, unitCost: 6.00, value: 48 }
              ]
            },
            {
              id: "prod48",
              code: "MX-0003",
              name: "Fresh Lemon",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 5, maximum: 15 },
              totals: { quantity: 10, averageCost: 5.50, value: 55 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-18", quantity: 10, unitCost: 5.50, value: 55 }
              ]
            },
            {
              id: "prod49",
              code: "MX-0004",
              name: "Angostura Bitters",
              unit: "bottle",
              tracking: { batch: false },
              thresholds: { minimum: 3, maximum: 10 },
              totals: { quantity: 6, averageCost: 12.00, value: 72 },
              lots: []
            }
          ],
          totals: { quantity: 120, value: 415 }
        },
        {
          id: "cat11",
          code: "COND",
          name: "Condiments & Sauces",
          products: [
            {
              id: "prod56",
              code: "CD-0001",
              name: "Mayonnaise Commercial",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 10, maximum: 30 },
              totals: { quantity: 22, averageCost: 8.50, value: 187 },
              lots: [
                { lotNumber: "LOT-2024-11-20", expiryDate: "2025-02-20", quantity: 22, unitCost: 8.50, value: 187 }
              ]
            },
            {
              id: "prod57",
              code: "CD-0002",
              name: "Ketchup Premium",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 10, maximum: 30 },
              totals: { quantity: 18, averageCost: 5.50, value: 99 },
              lots: [
                { lotNumber: "LOT-2024-11-25", expiryDate: "2025-05-25", quantity: 18, unitCost: 5.50, value: 99 }
              ]
            },
            {
              id: "prod58",
              code: "CD-0003",
              name: "Soy Sauce",
              unit: "liter",
              tracking: { batch: false },
              thresholds: { minimum: 8, maximum: 24 },
              totals: { quantity: 16, averageCost: 6.00, value: 96 },
              lots: []
            },
            {
              id: "prod59",
              code: "CD-0004",
              name: "Worcestershire Sauce",
              unit: "liter",
              tracking: { batch: false },
              thresholds: { minimum: 4, maximum: 12 },
              totals: { quantity: 8, averageCost: 8.50, value: 68 },
              lots: []
            }
          ],
          totals: { quantity: 64, value: 450 }
        }
      ],
      totals: { quantity: 436, value: 11068 }
    },
    {
      id: "loc-001",
      code: "HTL-001",
      name: "Main Hotel",
      categories: [
        {
          id: "cat10",
          code: "BAKING",
          name: "Baking Supplies",
          products: [
            {
              id: "prod50",
              code: "BK-0001",
              name: "Cake Flour",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 50, maximum: 150 },
              totals: { quantity: 120, averageCost: 2.20, value: 264 },
              lots: []
            },
            {
              id: "prod51",
              code: "BK-0002",
              name: "Cocoa Powder Premium",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 10, maximum: 30 },
              totals: { quantity: 25, averageCost: 15.00, value: 375 },
              lots: []
            },
            {
              id: "prod52",
              code: "BK-0003",
              name: "Vanilla Extract Pure",
              unit: "liter",
              tracking: { batch: false },
              thresholds: { minimum: 2, maximum: 8 },
              totals: { quantity: 5, averageCost: 85.00, value: 425 },
              lots: []
            },
            {
              id: "prod53",
              code: "BK-0004",
              name: "Belgian Chocolate Dark",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 15, maximum: 50 },
              totals: { quantity: 35, averageCost: 22.00, value: 770 },
              lots: [
                { lotNumber: "LOT-2024-11-15", expiryDate: "2025-11-15", quantity: 35, unitCost: 22.00, value: 770 }
              ]
            },
            {
              id: "prod54",
              code: "BK-0005",
              name: "Almond Flour",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 10, maximum: 30 },
              totals: { quantity: 22, averageCost: 18.00, value: 396 },
              lots: []
            },
            {
              id: "prod55",
              code: "BK-0006",
              name: "Powdered Sugar",
              unit: "kg",
              tracking: { batch: false },
              thresholds: { minimum: 25, maximum: 80 },
              totals: { quantity: 65, averageCost: 2.00, value: 130 },
              lots: []
            }
          ],
          totals: { quantity: 272, value: 2360 }
        },
        {
          id: "cat4",
          code: "DAIRY",
          name: "Dairy & Eggs",
          products: [
            {
              id: "prod18",
              code: "D-4003",
              name: "Butter Unsalted",
              unit: "kg",
              tracking: { batch: true },
              thresholds: { minimum: 15, maximum: 50 },
              totals: { quantity: 38, averageCost: 12.55, value: 476.90 },
              lots: [
                { lotNumber: "LOT-2024-12-02", expiryDate: "2025-03-02", quantity: 38, unitCost: 12.55, value: 476.90 }
              ]
            },
            {
              id: "prod17",
              code: "D-4002",
              name: "Heavy Cream",
              unit: "liter",
              tracking: { batch: true },
              thresholds: { minimum: 20, maximum: 60 },
              totals: { quantity: 45, averageCost: 6.85, value: 308.25 },
              lots: [
                { lotNumber: "LOT-2024-12-04", expiryDate: "2024-12-18", quantity: 45, unitCost: 6.85, value: 308.25 }
              ]
            }
          ],
          totals: { quantity: 83, value: 785.15 }
        }
      ],
      totals: { quantity: 355, value: 3145.15 }
    },
    {
      id: "loc-005",
      code: "REST-002",
      name: "Branch Restaurant",
      categories: [
        {
          id: "cat6",
          code: "BEV",
          name: "Beverages",
          products: [
            {
              id: "prod60",
              code: "BV-6004",
              name: "Soft Drinks Assorted",
              unit: "can",
              tracking: { batch: false },
              thresholds: { minimum: 100, maximum: 300 },
              totals: { quantity: 240, averageCost: 1.00, value: 240 },
              lots: []
            },
            {
              id: "prod61",
              code: "BV-6005",
              name: "Iced Tea Peach",
              unit: "bottle",
              tracking: { batch: true },
              thresholds: { minimum: 48, maximum: 144 },
              totals: { quantity: 96, averageCost: 2.25, value: 216 },
              lots: [
                { lotNumber: "LOT-2024-11-28", expiryDate: "2025-02-28", quantity: 96, unitCost: 2.25, value: 216 }
              ]
            }
          ],
          totals: { quantity: 336, value: 456 }
        }
      ],
      totals: { quantity: 336, value: 456 }
    }
  ],
  totals: {
    quantity: 7511.5,
    value: 45510.95
  }
}
