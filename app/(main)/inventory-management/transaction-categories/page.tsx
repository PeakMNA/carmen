/**
 * ============================================================================
 * TRANSACTION CATEGORIES MODULE - MAIN PAGE
 * ============================================================================
 *
 * This is the main landing page for managing transaction categories.
 * Transaction categories provide the two-level classification system for
 * inventory adjustments:
 * - Category (header-level): Maps to GL accounts for financial reporting
 * - Reason (item-level): Provides detailed classification within categories
 *
 * KEY CONCEPTS:
 *
 * 1. CATEGORY TYPES:
 *    - Stock IN: Categories for positive adjustments (Found, Return, Correction)
 *    - Stock OUT: Categories for negative adjustments (Wastage, Loss, Quality, Consumption)
 *
 * 2. GL ACCOUNT MAPPING:
 *    Each category maps to specific GL accounts for journal entry generation:
 *    - Wastage → 5200 Waste Expense
 *    - Loss → 5210 Inventory Loss
 *    - Quality/Consumption → 5100 COGS
 *    - Found/Return/Correction → 1310 Inventory
 *
 * 3. USAGE:
 *    Categories and reasons are used in the Inventory Adjustments form:
 *    - User selects ONE category per adjustment (header-level)
 *    - User selects reason for each item (filtered by category)
 *
 * FEATURES:
 * - Three tabs: All Categories, Stock In, Stock Out
 * - Context-specific create buttons on Stock In/Out tabs
 * - View all category records with filtering and sorting
 * - View category details with reasons
 * - Add/Edit/Delete categories and reasons
 *
 * TODO: Replace mock data with API calls:
 * - GET /api/transaction-categories - List all categories
 * - POST /api/transaction-categories - Create new category
 * - PUT /api/transaction-categories/:id - Update category
 * - DELETE /api/transaction-categories/:id - Delete category
 *
 * ============================================================================
 */

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  PlusIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  ListFilter,
  Tags,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryList } from "./components/category-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

/**
 * TransactionCategoriesPage - Main Dashboard
 *
 * Displays the list of all transaction categories with:
 * - Three tabs: All Categories (consolidated), Stock In, Stock Out
 * - Context-specific create buttons on Stock In/Out tabs
 * - Search and filter capabilities
 * - Quick actions (view, edit, delete)
 */
export default function TransactionCategoriesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="flex flex-col gap-4 p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4">
          {/* Header with title and tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Tags className="h-6 w-6 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-semibold">Transaction Categories</h1>
                <p className="text-sm text-muted-foreground">
                  Manage categories and reasons for inventory adjustments
                </p>
              </div>
            </div>
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <ListFilter className="w-4 h-4" />
                All Categories
              </TabsTrigger>
              <TabsTrigger value="in" className="gap-2">
                <ArrowUpCircle className="w-4 h-4 text-green-600" />
                Stock In
              </TabsTrigger>
              <TabsTrigger value="out" className="gap-2">
                <ArrowDownCircle className="w-4 h-4 text-red-600" />
                Stock Out
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: All Categories (Consolidated View) */}
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">All Categories</CardTitle>
                <Button
                  onClick={() => router.push("/inventory-management/transaction-categories/new")}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                <CategoryList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Stock In - WITH Create Stock In Category button */}
          <TabsContent value="in" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-green-600" />
                  Stock In Categories
                </CardTitle>
                <Button
                  onClick={() => router.push("/inventory-management/transaction-categories/new?type=in")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Stock In Category
                </Button>
              </CardHeader>
              <CardContent>
                <CategoryList typeFilter="IN" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Stock Out - WITH Create Stock Out Category button */}
          <TabsContent value="out" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-red-600" />
                  Stock Out Categories
                </CardTitle>
                <Button
                  variant="destructive"
                  onClick={() => router.push("/inventory-management/transaction-categories/new?type=out")}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Stock Out Category
                </Button>
              </CardHeader>
              <CardContent>
                <CategoryList typeFilter="OUT" />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
