# Inventory Adjustments List Screen Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
```yaml
Title: Inventory Adjustments List Screen Specification
Module: Inventory Management
Function: Inventory Adjustments
Screen: Adjustments List View
Version: 1.0
Date: 2025-01-14
Status: Based on Actual Source Code Analysis
```

## Implementation Overview

- **Purpose**: Provides a comprehensive list view for managing and tracking all inventory adjustments with search, filtering, and sorting capabilities
- **File Locations**: 
  - Main component: `app/(main)/inventory-management/inventory-adjustments/page.tsx`
  - List component: `components/inventory-adjustment-list.tsx`
  - Filter component: `components/filter-sort-options.tsx`
- **User Types**: Inventory managers, warehouse staff, department managers, financial managers
- **Current Status**: Fully implemented with mock data, ready for backend integration

## Visual Interface

![Inventory Adjustments List View](./images/inventory-adjustments-list/inventory-adjustments-list-populated.png)
*Inventory Adjustments management interface showing populated data with first record selected, showcasing comprehensive list view with filtering, search capabilities, and adjustment tracking for inventory variance management within Carmen hospitality ERP*

## Layout & Navigation

### Header Area
- **Page Title**: "Inventory Adjustments" displayed prominently at the top left
- **Primary Action**: "New Adjustment" button positioned at the top right with plus icon
- **Navigation**: Accessible via main inventory management menu structure

### Main Content Layout
- **Card Container**: All content wrapped in a clean card layout with proper spacing
- **Search Bar**: Full-width search input with search icon positioned at the top of the list
- **Filter Controls**: Advanced filtering and sorting options positioned next to the search bar
- **Data Table**: Comprehensive table view showing all adjustment records with sortable columns

## Data Display

### Table Structure
The adjustments are displayed in a structured table with the following columns:
- **Adjustment Number**: Unique identifier for each adjustment (e.g., ADJ-2401-0001)
- **Date**: Date when the adjustment was created or processed
- **Type**: Movement type displayed as color-coded badges (Stock In/Stock Out)
- **Location**: Physical location where adjustment occurred (Main Warehouse, Production Store)
- **Reason**: Business reason for the adjustment with predefined categories
- **Items**: Number of items included in the adjustment
- **Total Value**: Financial impact displayed in currency format with right alignment
- **Status**: Current processing status with color-coded badges
- **Actions**: Dropdown menu with available operations per record

### Status Indicators
- **Posted**: Green badge indicating completed and finalized adjustments
- **Draft**: Yellow badge showing adjustments still being prepared
- **Voided**: Red badge for cancelled or voided adjustments
- **Type Badges**: IN (Stock In) and OUT (Stock Out) with distinct styling

### Search Functionality
- **Global Search**: Single search field that searches across all visible data fields
- **Real-time Filtering**: Results update immediately as users type
- **Case-insensitive**: Search works regardless of text case
- **Multi-field Coverage**: Searches adjustment numbers, locations, reasons, and other text fields

## User Interactions

### Filtering and Sorting Options
- **Status Filter**: Filter by Draft, Posted, or Cancelled status
- **Type Filter**: Filter by Stock In or Stock Out movements  
- **Location Filter**: Filter by Main Warehouse, Store 1, Store 2, or other locations
- **Active Filter Display**: Number badge shows count of active filters
- **Clear Filters**: One-click option to remove all active filters
- **Multi-Select**: Users can apply multiple filters simultaneously

### Sorting Capabilities
- **Sort by Date**: Default sorting with newest first, toggle between ascending/descending
- **Sort by Adjustment Number**: Alphanumeric sorting of adjustment IDs
- **Sort by Total Value**: Numerical sorting from highest to lowest value
- **Sort by Items Count**: Sort by number of items in each adjustment
- **Visual Indicator**: Arrow icon shows current sort field and direction

### Row Actions
Each adjustment record provides a dropdown menu with:
- **View Details**: Navigate to detailed adjustment view
- **Edit**: Modify adjustment details (for applicable statuses)
- **Delete**: Remove adjustment record (with appropriate permissions)

### Interactive Elements
- **Clickable Rows**: Clicking adjustment number navigates to detail view
- **Hover Effects**: Visual feedback when hovering over interactive elements
- **Responsive Actions**: Action menu adapts to user permissions and adjustment status

## Role-Based Functionality

### Inventory Manager Permissions
- **Full Access**: Can view, create, edit, and delete all adjustments
- **Status Control**: Ability to change adjustment status from Draft to Posted
- **All Locations**: Access to adjustments across all warehouse locations
- **Financial Visibility**: Can view total values and financial impact of adjustments

### Warehouse Staff Permissions  
- **Location-Specific**: Access limited to their assigned warehouse location
- **Draft Management**: Can create and edit draft adjustments
- **Read-Only Posted**: Can view but not modify posted adjustments
- **Item-Level Focus**: Primary interaction with item quantities and details

### Department Manager Permissions
- **Department View**: See adjustments affecting their department's inventory
- **Approval Rights**: Can approve adjustments above certain value thresholds
- **Reporting Access**: View historical adjustment patterns and trends
- **Budget Impact**: Visibility into how adjustments affect department budgets

### Financial Manager Permissions
- **Financial Review**: Focus on adjustments with significant monetary impact
- **Audit Trail**: Access to complete adjustment history and approval workflows
- **Value Analysis**: Tools to analyze financial impact and variance patterns
- **GL Integration**: View how adjustments integrate with general ledger

## Business Rules & Validation

### Adjustment Creation Rules
- **Reason Codes**: All adjustments must include a predefined reason code
- **Location Validation**: Adjustments can only be created for accessible locations
- **Value Limits**: Large value adjustments may require additional approval
- **Documentation**: Significant adjustments require supporting documentation

### Status Workflow Logic
- **Draft State**: New adjustments start in Draft status allowing modifications
- **Posting Process**: Draft adjustments can be posted to finalize inventory impact
- **Void Restrictions**: Posted adjustments cannot be deleted, only voided
- **Audit Requirements**: Status changes create audit trail entries

### Filter and Search Logic
- **Real-time Updates**: Search and filter results update immediately
- **Logical Combination**: Multiple filters use AND logic (all must match)
- **Persistent State**: Filter and sort preferences maintained during session
- **Performance Optimization**: Large datasets are efficiently filtered

### Data Validation
- **Required Fields**: Adjustment number, date, type, location, and reason are mandatory
- **Date Constraints**: Adjustment dates cannot be in future beyond current period
- **Numerical Validation**: Item counts and values must be positive numbers
- **Status Dependencies**: Certain actions only available for specific statuses

## Current Limitations

### Backend Integration
- **Mock Data**: Currently displays static mock data instead of live database records
- **API Connectivity**: No actual backend API calls implemented yet
- **Real-time Updates**: Changes don't persist across browser sessions
- **User Authentication**: Role-based permissions not connected to actual user management

### Advanced Features
- **Bulk Operations**: No multi-select or bulk action capabilities implemented
- **Advanced Reporting**: Limited to basic list view without analytical features
- **Export Functionality**: No options to export adjustment data to Excel/PDF
- **Print Support**: No dedicated print layout or formatting

### Workflow Integration
- **Approval Processes**: No formal approval workflow for high-value adjustments
- **Notification System**: No alerts or notifications for status changes
- **Integration Links**: No connections to related purchase orders or stock movements
- **GL Posting**: No actual integration with general ledger systems

### Performance Considerations
- **Pagination**: No pagination implemented for large datasets
- **Lazy Loading**: All data loads at once regardless of list size
- **Caching**: No client-side caching of frequently accessed data
- **Mobile Optimization**: Limited mobile responsiveness for complex table structure