# Glossary

**Carmen ERP terminology** and domain-specific definitions.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## General ERP Terms

**ERP (Enterprise Resource Planning)**
: Integrated software system managing core business processes (finance, procurement, inventory, etc.)

**ABAC (Attribute-Based Access Control)**
: Authorization model using attributes (user role, department, resource type) for access decisions

**Server Component**
: React component rendered on server (Next.js 14), no client-side JavaScript sent

**Client Component**
: React component with interactivity, requires `'use client'` directive

**Server Action**
: Type-safe server-side function for data mutations (Next.js 14)

---

## Business Process Terms

**Document Status**
: Lifecycle state of a business document (DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED, CANCELLED)

**Approval Workflow**
: Multi-level review and approval process based on document type and amount

**Audit Trail**
: Complete history of changes made to a record (who, what, when)

---

## Procurement Terms

**Purchase Request (PR)**
: Internal request to purchase goods or services, requires approval before becoming a Purchase Order

**Purchase Order (PO)**
: Legally binding document sent to vendor to purchase goods or services at agreed prices

**Goods Received Note (GRN)**
: Document recording receipt of goods against a Purchase Order, triggers inventory update

**Request for Pricing (RFP)**
: Request sent to vendors to submit pricing for specified products/services

**Price List**
: Vendor's pricing for products, may include tiered pricing (volume discounts)

**Credit Note**
: Document issued for returns, damaged goods, or price adjustments

---

## Inventory Terms

**FIFO (First-In-First-Out)**
: Inventory costing method where oldest inventory costs are used first

**Lot-Based Costing**
: Tracking costs per lot/batch, enables lot-specific costing and traceability

**Periodic Average Costing**
: Calculate average cost for a period, apply to all transactions in that period

**Stock Level**
: Current quantity available at a location

**Inventory Transaction**
: Any movement affecting inventory (receipt, issue, transfer, adjustment)

**Cost Layer**
: Record of inventory quantity and cost at specific point in time (used in FIFO)

**Lot Number**
: Unique identifier for a batch of inventory received together

**Fractional Inventory**
: Support for non-whole number quantities (0.5 kg, 2.3 liters)

---

## Finance Terms

**Base Currency**
: Primary currency for financial reporting (typically USD for Carmen)

**Exchange Rate**
: Conversion rate between two currencies

**Department Allocation**
: Assigning costs/revenues to specific departments for reporting

**Account Code Mapping**
: Mapping internal codes to General Ledger accounts

**Multi-Currency**
: Ability to conduct transactions in multiple currencies

---

## Vendor Management Terms

**Vendor**
: External supplier of goods or services

**Vendor Contact**
: Person representing the vendor organization

**Vendor Certification**
: Required licenses, certifications (e.g., food safety certificates)

**Vendor Rating**
: Evaluation score based on quality, delivery, pricing performance

**Vendor Portal**
: Self-service portal where vendors can view POs, submit invoices, track payments

---

## Product Management Terms

**Product**
: Item that can be purchased, stocked, or sold

**Category**
: Hierarchical classification of products

**Unit of Measure (UoM)**
: Standard unit for measuring quantity (kg, liter, piece, box)

**Unit Conversion**
: Conversion factor between different units (1 box = 12 pieces)

**SKU (Stock Keeping Unit)**
: Unique identifier for a product variant

---

## Recipe & Menu Terms

**Recipe**
: Specification of ingredients and quantities to produce a dish

**Recipe Ingredient**
: Individual ingredient within a recipe with specified quantity

**Recipe Costing**
: Calculating cost to produce a recipe based on current ingredient costs

**Menu Engineering**
: Analysis technique classifying menu items as Star, Plow-horse, Puzzle, or Dog based on popularity and profitability

**Cuisine Type**
: Classification of recipes by cuisine (Italian, Chinese, French, etc.)

---

## Store Operations Terms

**Store Requisition**
: Request to transfer inventory between locations (warehouse → restaurant)

**Stock Replenishment**
: Process of restocking inventory when it falls below minimum levels

**Wastage Report**
: Document recording spoiled, damaged, or expired inventory

**Wastage Reason**
: Cause of wastage (expired, damaged, spillage, etc.)

**Sales Consumption (SC)**
: System-generated inventory source document created at shift close. Aggregates POS sales for a location/shift, explodes each menu item through its recipe mapping, and deducts the resulting ingredient quantities from the inventory ledger. One SC per (location, shift, business_date). See [store-operations/sales-consumption](../store-operations/sales-consumption/INDEX-sales-consumption.md).

**Exception Queue (POS)**
: List of POS transaction lines that could not be auto-posted to the inventory ledger during SC generation. Each entry carries a reason code (e.g. `UNMAPPED_ITEM`, `MISSING_RECIPE`). Managed in POS Integration → Operate → Exceptions.

**Supplemental SC**
: A Sales Consumption document generated when exception lines from a prior SC are resolved and re-posted. Linked to the parent SC via `parentSCId`. The parent SC is never edited — corrections flow through supplementals.

**Connector Mode**
: How a POS system delivers transaction data to Carmen. Options: `api` (real-time API call), `file_import` (manual CSV/XML upload), `webhook` (push event). Configured per POS connection in POS Integration → Setup → Connections.

---

## Technical Terms

**Prisma**
: TypeScript ORM (Object-Relational Mapping) for database access

**Zod**
: TypeScript schema validation library

**Zustand**
: Lightweight state management library

**React Query**
: Data fetching and caching library

**Shadcn/ui**
: Component library built on Radix UI and Tailwind CSS

**Mock Data**
: Sample data used for development/testing (current Carmen approach)

**Type Guard**
: TypeScript function that performs runtime type checking

**Factory Function**
: Function that creates and returns objects (used for mock data)

---

## Document Type Abbreviations

**DD**
: Data Definition - Database schema and table structures

**BR**
: Business Requirements - Functional requirements and business rules

**TS**
: Technical Specification - Implementation details and algorithms

**UC**
: Use Cases - User workflows and scenarios

**FD**
: Flow Diagrams - Visual process flows (Mermaid diagrams)

**VAL**
: Validations - Business rules and data validation specifications

**PROCESS**
: Process Documentation - End-to-end workflow documentation

**PC**
: Page Content - UI page content specifications

**SM**
: Shared Methods - Reusable methods and utilities

---

## Database Terms

**Schema**
: Database structure definition (tables, columns, relationships)

**Migration**
: Script to modify database schema (add/remove tables, columns)

**Foreign Key**
: Column referencing primary key in another table

**Index**
: Database structure to speed up queries

**JSONB**
: PostgreSQL binary JSON data type for flexible schema

**Enum**
: Set of allowed values for a column

**UUID**
: Universally Unique Identifier (128-bit random value)

---

## Workflow Terms

**Approval Chain**
: Series of approvers required for a document

**Workflow Step**
: Individual stage in a workflow (e.g., "Department Manager Approval")

**Workflow Instance**
: Running instance of a workflow for a specific document

**Auto-approval**
: Automatic approval based on criteria (e.g., amount < $100)

---

## Common Abbreviations

**PR** - Purchase Request
**PO** - Purchase Order
**GRN** - Goods Received Note
**SC** - Sales Consumption (system-generated inventory document from POS sales)
**RFP** - Request for Pricing
**UoM** - Unit of Measure
**SKU** - Stock Keeping Unit
**GL** - General Ledger
**FIFO** - First-In-First-Out
**ABAC** - Attribute-Based Access Control
**ERP** - Enterprise Resource Planning
**qty** - quantity
**amt** - amount

---

## Related Documentation

- **[DOCUMENT-TYPES-EXPLAINED.md](DOCUMENT-TYPES-EXPLAINED.md)** - Document type guide
- **[MODULE-INDEX.md](../MODULE-INDEX.md)** - All modules
- **[WIKI-HOME.md](../WIKI-HOME.md)** - Documentation hub

---

**🏠 [Back to Wiki](../WIKI-HOME.md)** | **🗺️ [Module Index](../MODULE-INDEX.md)**
