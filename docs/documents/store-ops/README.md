# Store Operations Module - Documentation

## Overview

This directory contains comprehensive documentation and screenshots for the **Store Operations** module of the Carmen ERP system. The Store Operations module manages internal store requisitions, stock replenishment, and wastage reporting for hospitality operations.

## Contents

### Main Documentation

1. **[STORE-OPERATIONS-MODULE.md](STORE-OPERATIONS-MODULE.md)** - Module overview, sitemap, and submodule index

### Submodule Documentation

2. **[STORE-REQUISITIONS.md](STORE-REQUISITIONS.md)** - Complete specification (✅ Production)
   - Store Requisition List Page
   - Store Requisition Detail Page (4 tabs)
   - All modals, dropdowns, actions, and components
   - Action flows with Mermaid diagrams

3. **[STOCK-REPLENISHMENT.md](STOCK-REPLENISHMENT.md)** - Stock replenishment dashboard (🚧 Prototype)
   - Dashboard with statistics
   - Stock level trends
   - Inventory status table
   - Future features roadmap

4. **[WASTAGE-REPORTING.md](WASTAGE-REPORTING.md)** - Wastage reporting dashboard (🚧 Prototype)
   - Wastage statistics and trends
   - Wastage by reason analysis
   - Wastage records management
   - Future features roadmap

### Supporting Documentation

5. **[SHARED-COMPONENTS.md](SHARED-COMPONENTS.md)** - Reusable UI components across all submodules
   - 4 Modals and dialogues documented
   - 6 Dropdown components documented
   - Form, display, and navigation components

6. **[GLOSSARY.md](GLOSSARY.md)** - Complete terminology reference
   - 100+ terms defined
   - Store requisitions, stock management, wastage terms
   - Workflow and approval terminology
   - Technical abbreviations

7. **[FEATURE-GAPS.md](FEATURE-GAPS.md)** - Incomplete features and development roadmap
   - 50+ gaps identified
   - Priority matrix (P0-P3)
   - Integration gaps
   - UI/UX gaps

8. **[SCREENSHOT-SUMMARY.md](SCREENSHOT-SUMMARY.md)** - Visual documentation with all captured screenshots

### Interactive Gallery

9. **[index.html](index.html)** - Interactive screenshot gallery with modal viewer

### Screenshots

#### Dashboard & Overview
- `store-operations-dashboard.png` - Main Store Operations dashboard

#### Store Requisitions
- `store-requisitions-list-table.png` - List view in table format
- `store-requisitions-list-card.png` - List view in card format
- `store-requisitions-filters.png` - Advanced filtering interface

#### Store Requisition Detail Views
- `store-requisition-detail-items.png` - Items tab showing requisition line items
- `store-requisition-detail-stock-movements.png` - Stock movements tracking
- `store-requisition-detail-journal.png` - Financial journal entries
- `store-requisition-detail-approval-workflow.png` - Approval workflow visualization

#### Other Modules
- `stock-replenishment-dashboard.png` - Stock replenishment management
- `wastage-reporting-dashboard.png` - Wastage tracking and reporting

## Module Structure

### Store Requisitions

The Store Requisitions feature supports:

- **List Views**: Table and card layouts with sorting, filtering, and search
- **Detail View**: Comprehensive requisition details with tabbed interface
  - Items tab: Line items with quantities, costs, and approval status
  - Stock Movements tab: Related inventory transactions
  - Journal Entries tab: Financial accounting entries
  - Approval Workflow tab: Multi-level approval process

### Stock Replenishment

Dashboard for managing automated and manual stock transfer requests based on:
- Minimum/maximum stock levels
- Par levels by location
- Consumption patterns
- Lead times

### Wastage Reporting

Track and categorize product wastage with:
- Wastage types (spoilage, damage, expiry, etc.)
- Cost impact analysis
- Trend reporting
- Prevention recommendations

## Key Features

### Store Requisitions
- ✅ Multi-view layouts (table/card)
- ✅ Advanced filtering and search
- ✅ Multi-level approval workflow
- ✅ Stock movement tracking
- ✅ Journal entry integration
- ✅ Bulk operations support
- ✅ Status management
- ✅ Cost tracking and calculations

### Stock Replenishment
- ✅ Automated replenishment suggestions
- ✅ Par level management
- ✅ Location-based inventory
- ✅ Replenishment prioritization

### Wastage Reporting
- ✅ Wastage categorization
- ✅ Cost impact tracking
- ✅ Trend analysis
- ✅ Prevention insights

## Technical Implementation

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: Shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React hooks, Zustand
- **Forms**: React Hook Form + Zod validation

### Key Components
- `StoreRequisitionDetailComponent` - Main detail page component
- `ApprovalWorkflow` - Approval visualization and actions
- `JournalEntriesTab` - Financial entries display
- `StockMovementSR` - Stock movement tracking

### File Locations
```
app/(main)/store-operations/
├── page.tsx                          # Store Operations dashboard
├── store-requisitions/
│   ├── page.tsx                      # List page
│   ├── [id]/
│   │   └── page.tsx                  # Detail page
│   ├── components/
│   │   ├── store-requisition-detail.tsx
│   │   ├── approval-workflow.tsx
│   │   ├── tabs/
│   │   │   └── journal-entries-tab.tsx
│   │   └── ... other components
│   └── types/
├── stock-replenishment/
│   └── page.tsx
└── wastage-reporting/
    └── page.tsx
```

## Navigation Paths

- **Dashboard**: `/store-operations`
- **Store Requisitions List**: `/store-operations/store-requisitions`
- **Store Requisition Detail**: `/store-operations/store-requisitions/[id]`
- **Stock Replenishment**: `/store-operations/stock-replenishment`
- **Wastage Reporting**: `/store-operations/wastage-reporting`

## Screenshot Specifications

- **Resolution**: 1920x1080 (Desktop)
- **Format**: PNG
- **Browser**: Chromium (Playwright)
- **Capture Date**: October 2, 2025
- **Total Screenshots**: 10

## Future Enhancements

Potential additions to the Store Operations module:

1. **Comments System** - Add commenting functionality to requisitions
2. **Attachments** - Support for file attachments (invoices, delivery notes, etc.)
3. **Activity Log** - Detailed audit trail of all changes
4. **Mobile Views** - Screenshots at mobile resolutions (375x667, 768x1024)
5. **Email Notifications** - Automated notifications for approvals and status changes
6. **Batch Processing** - Enhanced bulk operations for multiple requisitions
7. **Analytics Dashboard** - Advanced reporting and analytics
8. **Integration** - Direct integration with POS and external systems

## Related Documentation

- [Procurement Module Documentation](../procurement/)
- [Inventory Management Documentation](../inv/)
- [Product Management Documentation](../pm/)
- [System Requirements](../../carmen-erp-system-requirements-documentation.md)

## Contact & Support

For questions or issues related to the Store Operations module:
- Check the [SCREENSHOT-SUMMARY.md](SCREENSHOT-SUMMARY.md) for visual references
- Review the [STORE-OPERATIONS-MODULE.md](STORE-OPERATIONS-MODULE.md) for detailed specifications
- Contact the development team for technical support

---

**Last Updated**: October 2, 2025
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Module Version**: 1.0
**Documentation Status**: Complete
