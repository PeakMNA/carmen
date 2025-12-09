# Use Cases: Wastage Reporting

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Wastage Reporting
- **Route**: `/app/(main)/store-operations/wastage-reporting`
- **Version**: 1.2.0
- **Last Updated**: 2025-12-09
- **Owner**: Store Operations Team
- **Status**: Active
- **Implementation Status**: IMPLEMENTED (Frontend UI Complete with Mock Data)

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2.0 | 2025-12-09 | Documentation Team | Updated to reflect implemented frontend workflows |
| 1.1.0 | 2025-12-05 | Documentation Team | Added implementation status warning |
| 1.0.0 | 2025-01-12 | Store Operations Team | Initial version |

---

## ✅ IMPLEMENTATION NOTE

The Wastage Reporting module frontend has been fully implemented with 6 pages supporting the core use cases in this document. Backend integration is pending.

**Implemented Workflows**:
- ✅ **UC-WAST-001: Record Wastage** - New Report page with item selection, quantity, reason, notes, attachments
- ✅ **UC-WAST-002: View Wastage Reports** - Reports list with status filtering, bulk selection
- ✅ **UC-WAST-003: Approve/Reject Wastage** - Report detail page with review decision section
- ✅ **UC-WAST-004: View Wastage Analytics** - Analytics page with charts, trends, insights
- ✅ **UC-WAST-005: Manage Categories** - Categories page with add/edit/delete, approval rules

See [BR-wastage-reporting.md](./BR-wastage-reporting.md) for complete implementation details.

---

## Overview

This document describes the use cases for the Wastage Reporting sub-module within the Store Operations module. These use cases detail how various actors (kitchen staff, managers, finance team) interact with the system to record, approve, analyze, and manage food and beverage wastage across restaurant locations.

The use cases are organized into four categories:
1. **User Use Cases**: Interactive workflows initiated by human users (recording wastage, approving transactions, viewing reports)
2. **System Use Cases**: Automated processes triggered by system events (inventory adjustments, notifications, alerts)
3. **Integration Use Cases**: Interactions with external systems and internal modules (finance integration, inventory updates)
4. **Background Job Use Cases**: Scheduled tasks and asynchronous processes (daily summaries, trend calculations, cleanup jobs)

**Related Documents**:
- [Business Requirements](./BR-wastage-reporting.md)
- [Technical Specification](./TS-wastage-reporting.md)
- [Data Schema](./DS-wastage-reporting.md)
- [Flow Diagrams](./FD-wastage-reporting.md)
- [Validations](./VAL-wastage-reporting.md)

---

## Actors

### Primary Actors
*Actors who directly interact with the system to record, approve, or analyze wastage*

| Actor | Description | Role |
|-------|-------------|------|
| Kitchen Staff (Chef Daniel) | Line cooks, prep cooks, kitchen assistants | Record wastage as it occurs during food preparation and service |
| Store Manager (Maria) | Restaurant or outlet manager | Review and approve wastage transactions, analyze wastage reports |
| Department Manager | Kitchen department head or F&B manager | Approve medium-value wastage, review department wastage trends |
| Finance Manager (Frank) | Finance team member responsible for cost control | Approve high-value wastage, generate financial wastage reports |
| Purchasing Staff (Peter) | Procurement team members | Track supplier quality issues, analyze vendor-related wastage |

### Secondary Actors
*Actors who support primary actors or receive information from the system*

| Actor | Description | Role |
|-------|-------------|------|
| Operations Manager | Multi-location operations oversight | Review cross-location wastage trends, identify systemic issues |
| Regional Manager | Regional operations leadership | Monitor regional wastage performance, set reduction targets |
| Warehouse Manager (William) | Central warehouse operations | Track wastage of received goods, coordinate supplier quality complaints |
| System Administrator | IT staff managing system configuration | Configure wastage categories, approval thresholds, alert rules |

### System Actors
*External systems, internal modules, or automated services that interact with wastage reporting*

| System | Description | Integration Type |
|--------|-------------|------------------|
| Inventory Management System | Tracks stock levels and movements | Module - Real-time API |
| Finance Module | General ledger and financial reporting | Module - Batch/Real-time API |
| Vendor Management System | Supplier master data and performance | Module - API |
| Notification Service | Email, SMS, and in-app notifications | Service - Event-driven |
| Workflow Engine | Multi-level approval routing | Service - Event-driven |
| Analytics Engine | Trend analysis and predictive analytics | Service - Scheduled batch |

---

## Use Case Diagram

```
                            ┌─────────────────────────────────────────┐
                            │    Wastage Reporting System             │
                            └────────────┬────────────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┬─────────────────────┐
          │                              │                              │                     │
          │                              │                              │                     │
    ┌─────▼──────┐                 ┌────▼─────┐                  ┌─────▼──────┐       ┌─────▼──────┐
    │  Kitchen   │                 │  Store   │                  │ Department │       │  Finance   │
    │   Staff    │                 │ Manager  │                  │  Manager   │       │  Manager   │
    │  (Chef     │                 │ (Maria)  │                  │            │       │  (Frank)   │
    │  Daniel)   │                 │          │                  │            │       │            │
    └─────┬──────┘                 └────┬─────┘                  └─────┬──────┘       └─────┬──────┘
          │                              │                              │                     │
     [UC-WAST-001]                  [UC-WAST-003]                  [UC-WAST-003]         [UC-WAST-003]
     Record Wastage                 Approve Wastage                Approve Wastage       Approve High-Value
          │                              │                              │                  Wastage
     [UC-WAST-002]                  [UC-WAST-005]                  [UC-WAST-005]         [UC-WAST-008]
     Attach Photos                  View Wastage Reports           View Wastage Reports  Generate Financial
          │                              │                              │                  Reports
     [UC-WAST-011]                  [UC-WAST-006]                  [UC-WAST-009]         [UC-WAST-009]
     Batch Wastage                  Analyze Trends                 Configure Thresholds  Analyze Trends
     Recording                            │                              │                     │
          │                         [UC-WAST-007]                  [UC-WAST-010]              │
          │                         View History                   Track Supplier Issues      │
          │                              │                              │                     │
          │                              │                              │                     │
          │                   ┌──────────▼──────────────────────────────▼─────────────────────┘
          │                   │
    ┌─────▼──────┐       ┌────▼─────┐
    │ Purchasing │       │Operations│
    │   Staff    │       │ Manager  │
    │  (Peter)   │       │          │
    └─────┬──────┘       └────┬─────┘
          │                   │
     [UC-WAST-010]       [UC-WAST-008]
     Track Supplier      Generate Reports
     Quality Issues           │
          │              [UC-WAST-009]
          │              Analyze Trends
          │                   │
          └───────────────────┘
                   │
    ┌──────────────▼──────────────┐              ┌──────────────┐              ┌──────────────┐
    │   System (Automated)        │              │  Inventory   │              │   Finance    │
    │   Background Processes      │              │ Management   │              │    Module    │
    │                             │              │   Module     │              │              │
    └──────┬──────────────────────┘              └──────┬───────┘              └──────┬───────┘
           │                                            │                             │
      [UC-WAST-101]                                [UC-WAST-201]                 [UC-WAST-202]
      Auto-adjust Inventory                        Update Stock Levels           Post to GL
           │                                            │                             │
      [UC-WAST-102]                                [UC-WAST-203]                 [UC-WAST-204]
      Send Approval Notifications                  Validate Stock                Update COGS
           │                                        Availability                       │
      [UC-WAST-103]                                     │                             │
      Detect Wastage Anomalies                          │                             │
           │                                            │                             │
      [UC-WAST-104]                                     │                             │
      Route to Approvers                                │                             │
           │                                            │                             │
      [UC-WAST-301]                                     │                             │
      Daily Summary Report                              │                             │
      (scheduled)                                       │                             │
           │                                            │                             │
      [UC-WAST-302]                                     │                             │
      Calculate Wastage Trends                          │                             │
      (scheduled)                                       │                             │
           │                                            │                             │
      [UC-WAST-303]                                     │                             │
      Cleanup Old Photos                                │                             │
      (scheduled)                                       │                             │
```

**Legend**:
- **Kitchen Staff**: Records daily wastage with photos and reasons
- **Store Manager**: Approves wastage, reviews reports, analyzes location performance
- **Department Manager**: Approves medium-value wastage, monitors department trends
- **Finance Manager**: Approves high-value wastage, generates financial reports
- **Purchasing Staff**: Tracks supplier quality issues from wastage data
- **Operations Manager**: Cross-location analysis and performance monitoring
- **System Actors**: Automated inventory adjustments, notifications, approvals, scheduled jobs

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-WAST-001 | Record Wastage Transaction | Kitchen Staff, Store Manager | High | Medium | User |
| UC-WAST-002 | Attach Photo Evidence | Kitchen Staff, Store Manager | High | Simple | User |
| UC-WAST-003 | Approve Wastage Transaction | Department Manager, Store Manager, Finance Manager | High | Medium | User |
| UC-WAST-004 | Reject Wastage Transaction | Department Manager, Store Manager, Finance Manager | High | Simple | User |
| UC-WAST-005 | View Wastage Transaction History | All Users | Medium | Simple | User |
| UC-WAST-006 | Analyze Wastage Trends | Store Manager, Operations Manager | High | Complex | User |
| UC-WAST-007 | Generate Wastage Reports | Store Manager, Finance Manager | High | Medium | User |
| UC-WAST-008 | Configure Wastage Settings | System Administrator | Medium | Medium | User |
| UC-WAST-009 | Track Supplier Quality Issues | Purchasing Staff, Store Manager | Medium | Medium | User |
| UC-WAST-010 | Create Supplier Quality Complaint | Purchasing Staff | Medium | Simple | User |
| UC-WAST-011 | Record Batch Wastage | Kitchen Staff, Store Manager | Medium | Medium | User |
| UC-WAST-012 | Mobile Wastage Recording | Kitchen Staff | High | Simple | User |
| **System Use Cases** | | | | | |
| UC-WAST-101 | Auto-Adjust Inventory | System | High | Medium | System |
| UC-WAST-102 | Send Approval Notifications | System | High | Simple | System |
| UC-WAST-103 | Detect Wastage Anomalies | System | Medium | Complex | System |
| UC-WAST-104 | Route Wastage to Approvers | System (Workflow Engine) | High | Medium | System |
| UC-WAST-105 | Escalate Overdue Approvals | System | Medium | Simple | System |
| **Integration Use Cases** | | | | | |
| UC-WAST-201 | Sync with Inventory Management | Inventory Management System | High | Medium | Integration |
| UC-WAST-202 | Post Wastage to General Ledger | Finance Module | High | Medium | Integration |
| UC-WAST-203 | Validate Stock Availability | Inventory Management System | High | Simple | Integration |
| UC-WAST-204 | Update COGS Calculation | Finance Module | High | Simple | Integration |
| **Background Job Use Cases** | | | | | |
| UC-WAST-301 | Generate Daily Wastage Summary | System (Scheduled Job) | Medium | Simple | Background |
| UC-WAST-302 | Calculate Wastage Trends | System (Scheduled Job) | Medium | Complex | Background |
| UC-WAST-303 | Archive Old Photos to Cold Storage | System (Scheduled Job) | Low | Simple | Background |
| UC-WAST-304 | Send Wastage Alerts | System (Scheduled Job) | Medium | Simple | Background |

---

## User Use Cases

### UC-WAST-001: Record Wastage Transaction

**Description**: Kitchen staff or managers record wastage transactions capturing product, quantity, category, reason, and supporting documentation. This is the primary entry point for all wastage data.

**Actor(s)**: Kitchen Staff (Chef Daniel), Store Manager (Maria)

**Priority**: High

**Frequency**: Daily, 50-100 transactions per location per month

**Preconditions**:
- User is authenticated and has "Record Wastage" permission
- User has access to the location where wastage occurred
- Product exists in inventory system and is active
- Current stock quantity is available in inventory system

**Postconditions**:
- **Success**: Wastage transaction created in "pending" status, user receives confirmation with wastage reference number, inventory system is notified (but not yet adjusted)
- **Failure**: Validation errors displayed, no wastage transaction created, user can correct and retry

**Main Flow** (Happy Path):
1. Chef Daniel navigates to Wastage Reporting module
2. System displays Record Wastage form with fields: Product, Quantity, Category, Reason, Responsible Party, Photos
3. Chef Daniel searches for product "Atlantic Salmon Fillet" using product search
4. System displays matching products with current stock quantity (25 kg), unit cost ($12.50/kg), and location
5. Chef Daniel selects product and enters wastage quantity (2.5 kg)
6. System calculates total wastage value ($31.25) and displays
7. Chef Daniel selects wastage category "Preparation Error" from dropdown
8. System displays sub-category field, Chef Daniel selects "Overcooked"
9. Chef Daniel enters detailed reason: "Salmon overcooked during grill service, 3 portions affected, temperature control issue"
10. Chef Daniel optionally selects responsible party (himself) from staff list
11. Chef Daniel attaches 2 photos of overcooked salmon using mobile camera
12. System validates all required fields and business rules (BR-WAST-001 to BR-WAST-006)
13. Chef Daniel clicks "Submit for Approval"
14. System creates wastage transaction with status "pending_approval", generates wastage number WST-2025-0112-0023
15. System routes wastage to appropriate approver based on value ($31.25 < $50, routes to Department Manager)
16. System displays success message: "Wastage WST-2025-0112-0023 submitted for approval. Department Manager will review."
17. System sends notification to Department Manager
18. Use case ends

**Alternative Flows**:

**Alt-1A: User Records Wastage from Barcode Scanner** (At step 3)
- 3a. Chef Daniel scans product barcode using mobile device camera
- 3b. System recognizes barcode and auto-selects product
- 3c. System displays product details including stock quantity
- Resume at step 5

**Alt-1B: Wastage Quantity Exceeds 50% of Stock** (At step 5)
- 5a. Chef Daniel enters quantity that exceeds 50% of current stock (e.g., 15 kg when stock is 25 kg)
- 5b. System displays warning: "Wastage quantity is 60% of current stock. Please verify this is correct."
- 5c. Chef Daniel confirms quantity is correct or adjusts
- Resume at step 6

**Alt-1C: High-Value Wastage Requires Multiple Photos** (At step 11)
- 11a. System detects wastage value > $100
- 11b. System requires minimum 2 photos (validation rule BR-WAST-003)
- 11c. Chef Daniel must attach at least 2 photos before proceeding
- Resume at step 12

**Alt-1D: Auto-Approval for Expired Items** (At step 14)
- 14a. System detects category is "Expired Items" and product expiry date is within 24 hours
- 14b. System applies auto-approval rule (BR-WAST-007)
- 14c. System sets status to "approved" instead of "pending_approval"
- 14d. System immediately creates inventory adjustment (UC-WAST-101)
- 14e. System displays message: "Wastage auto-approved (expired item policy)"
- Resume at step 16

**Alt-1E: Save as Draft** (At any step before step 13)
- User clicks "Save as Draft" button
- System saves wastage transaction with status "draft"
- User can return later to complete and submit
- Use case ends

**Exception Flows**:

**Exc-1A: Product Not Found** (At step 3-4)
- User searches for product that doesn't exist or is discontinued
- System displays: "Product not found. Please verify product code or name."
- User can refine search or contact manager to add product
- Resume at step 3

**Exc-1B: Insufficient Stock Quantity** (At step 5)
- User enters wastage quantity that exceeds current stock (e.g., 30 kg when stock is 25 kg)
- System displays error: "Wastage quantity (30 kg) exceeds current stock (25 kg). Cannot proceed."
- User must adjust quantity or investigate stock discrepancy
- Resume at step 5

**Exc-1C: Validation Failure** (At step 12)
- System validation detects errors: missing required fields, reason too short (<20 characters), invalid date, missing photos for high-value wastage
- System displays validation errors with field highlights
- User corrects errors
- Resume at step 12

**Exc-1D: User Lacks Permission** (At step 1)
- User attempts to access wastage recording without proper permission
- System displays: "Access denied. You do not have permission to record wastage."
- Use case ends

**Exc-1E: System Error During Save** (At step 14)
- System encounters database error or service unavailable
- System displays: "Unable to save wastage transaction. Please try again or contact support."
- System logs error for IT investigation
- User can retry or save as draft
- Use case ends

**Business Rules**:
- **BR-WAST-001**: All wastage must be recorded within 24 hours of occurrence
- **BR-WAST-002**: Every wastage must be assigned to exactly one category
- **BR-WAST-003**: Wastage >$100 requires at least one photo; >$500 requires minimum 2 photos
- **BR-WAST-004**: Wastage quantity cannot exceed current stock quantity
- **BR-WAST-005**: Reason description must be 20-500 characters
- **BR-WAST-006**: Wastage date cannot be >7 days in past or in future

**Includes**:
- [UC-WAST-002: Attach Photo Evidence](#uc-wast-002-attach-photo-evidence)
- [UC-WAST-104: Route Wastage to Approvers](#uc-wast-104-route-wastage-to-approvers)

**Related Requirements**:
- FR-WAST-001: Record Wastage Transaction
- FR-WAST-002: Categorize Wastage by Type
- FR-WAST-006: Attach Supporting Documentation
- FR-WAST-007: Validate Wastage Transactions
- VAL-WAST-001 to VAL-WAST-012: Field-level validations

**UI Mockups**: `/app/(main)/store-operations/wastage-reporting/record`

**Notes**:
- Mobile interface should prioritize quick entry with camera integration for photos
- Product search should support autocomplete with recent wastage products shown first
- System should remember user's last selected category and location for faster repeat entry
- Consider voice input for reason field on mobile devices

---

### UC-WAST-002: Attach Photo Evidence

**Description**: Users attach photographic evidence to wastage transactions to document the wastage condition and support fraud prevention. Photos are required for high-value wastage.

**Actor(s)**: Kitchen Staff (Chef Daniel), Store Manager (Maria)

**Priority**: High

**Frequency**: 60-80% of wastage transactions include photos

**Preconditions**:
- User is in process of recording or editing wastage transaction
- Device has camera capability or user has photo files to upload
- Photo storage service is available

**Postconditions**:
- **Success**: Photos attached to wastage transaction, photos stored securely with watermark, thumbnails generated for quick display
- **Failure**: Photos not attached, validation error displayed if mandatory photos missing

**Main Flow** (Happy Path):
1. User is on Record Wastage form with product and quantity already entered
2. System displays photo attachment section with "Add Photo" button
3. User clicks "Add Photo" button
4. System presents options: "Take Photo" or "Choose from Gallery"
5. User selects "Take Photo"
6. System activates device camera
7. User positions camera to capture overcooked salmon
8. User takes photo
9. System displays photo preview with option to retake or use photo
10. User confirms photo
11. System compresses photo from 4MB to 500KB maintaining quality
12. System adds watermark with date, time, location, and user name
13. System uploads photo to secure cloud storage
14. System generates thumbnail for display
15. System links photo to wastage transaction (not yet saved)
16. System displays photo thumbnail in attachment section with caption field
17. User enters photo caption: "Overcooked salmon - grill temperature issue"
18. User can repeat steps 3-17 to add more photos (up to 5 total)
19. System displays photo count (2 of 5) and validates meets requirements
20. Use case ends, user continues with wastage recording

**Alternative Flows**:

**Alt-2A: Choose Photo from Gallery** (At step 5)
- 5a. User selects "Choose from Gallery"
- 5b. System opens device photo gallery
- 5c. User selects existing photo
- 5d. System validates photo is acceptable format (JPG, PNG, HEIC) and size (<10MB)
- Resume at step 9

**Alt-2B: Add Multiple Photos at Once** (At step 5)
- 5a. User selects multiple photos from gallery (if supported by device)
- 5b. System processes each photo individually (compression, watermark)
- 5c. System displays all photo thumbnails
- Resume at step 16

**Alt-2C: Desktop Upload** (At step 4)
- 4a. On desktop interface, system shows file upload button
- 4b. User clicks file upload and selects photo files from computer
- 4c. System validates files are acceptable image formats
- Resume at step 9

**Exception Flows**:

**Exc-2A: Camera Access Denied** (At step 6)
- System unable to access camera due to permission denial
- System displays: "Camera access denied. Please grant camera permission in device settings to take photos."
- User can choose "Choose from Gallery" instead or grant permission
- Resume at step 4

**Exc-2B: Photo File Too Large** (At step 11)
- Photo file exceeds 10MB limit
- System displays: "Photo file is too large (12MB). Maximum size is 10MB. Please try again."
- User must retake photo or select different photo
- Resume at step 3

**Exc-2C: Invalid File Format** (At step 9)
- User selects file that is not image format (e.g., PDF, DOCX)
- System displays: "Invalid file format. Only JPG, PNG, and HEIC images are supported."
- User must select valid image file
- Resume at step 4

**Exc-2D: Photo Upload Fails** (At step 13)
- Network error or storage service unavailable
- System displays: "Photo upload failed. Please check your connection and try again."
- System retries upload automatically (3 attempts with exponential backoff)
- If all retries fail, user can save wastage as draft and add photos later
- Resume at step 3 or end use case

**Exc-2E: Maximum Photos Exceeded** (At step 18)
- User attempts to add 6th photo when 5 already attached
- System displays: "Maximum 5 photos per wastage transaction. Remove a photo to add another."
- User can remove existing photo and add new one
- Use case ends

**Exc-2F: Mandatory Photos Missing** (During wastage submission in UC-WAST-001 step 12)
- System detects high-value wastage (>$100) without required photo
- System displays validation error: "Photo evidence is required for wastage exceeding $100. Please attach at least 1 photo."
- User must return to add photos
- Use case resumes at step 3

**Business Rules**:
- **BR-WAST-003**: Wastage >$100 requires ≥1 photo; >$500 requires ≥2 photos
- Maximum 5 photos per wastage transaction
- Maximum photo size 10MB per photo
- Accepted formats: JPG, PNG, HEIC
- Photos are watermarked with date, time, location, user
- Photos are compressed to ~500KB for storage efficiency
- Photos are retained for 7 years for audit compliance

**Related Requirements**:
- FR-WAST-006: Attach Supporting Documentation
- NFR-WAST-007: Photo security and malware scanning
- NFR-WAST-009: Photo storage encryption and signed URLs
- NFR-WAST-018: Photo backup and redundancy
- NFR-WAST-022: Photo storage scalability (10TB over 10 years)

**Notes**:
- Client-side photo compression reduces bandwidth and storage costs
- Watermarking prevents photo reuse in fraudulent wastage claims
- Thumbnails improve page load performance when viewing wastage history
- Consider progressive web app (PWA) for better mobile camera integration
- Cold storage archival after 2 years reduces storage costs while maintaining 7-year retention

---

### UC-WAST-003: Approve Wastage Transaction

**Description**: Approvers review wastage transactions and approve, partially approve, or reject them. Approval triggers inventory adjustment and financial posting.

**Actor(s)**: Department Manager, Store Manager (Maria), Finance Manager (Frank)

**Priority**: High

**Frequency**: Daily, 50-100 approvals per location per month

**Preconditions**:
- User is authenticated with "Wastage Approver" permission
- Wastage transaction exists in "pending_approval" status
- Wastage is routed to user's approval queue based on value threshold and role
- User has permission to approve for the wastage location

**Postconditions**:
- **Success**: Wastage approved, status changed to "approved", inventory automatically adjusted, GL posting queued, approver receives confirmation, submitter notified
- **Failure**: Validation error displayed, wastage remains pending, user can retry

**Main Flow** (Happy Path):
1. Store Manager Maria navigates to Wastage Approvals page
2. System displays list of pending wastage transactions assigned to Maria's approval queue
3. System shows key information in list: Wastage Number, Date, Product, Quantity, Value, Category, Submitted By, Days Pending
4. System highlights urgent items (>24 hours pending) in yellow
5. Maria clicks on wastage transaction WST-2025-0112-0023 (Atlantic Salmon, $31.25, Chef Daniel)
6. System displays complete wastage details:
   - Header: Wastage number, date/time, location, submitter
   - Product: Name, code, quantity (2.5 kg), unit cost ($12.50), total value ($31.25)
   - Current stock: 25 kg before wastage, will be 22.5 kg after
   - Category: Preparation Error - Overcooked
   - Reason: "Salmon overcooked during grill service, 3 portions affected, temperature control issue"
   - Responsible party: Chef Daniel
   - Photos: 2 attached photos (clickable for full resolution)
   - Approval history: Submitted 2025-01-12 14:23 by Chef Daniel
7. Maria reviews photos showing overcooked salmon
8. Maria verifies reason is legitimate and detailed
9. Maria checks if this is recurring issue (system shows Chef Daniel has 2 similar wastage in past 30 days - coaching opportunity noted)
10. Maria decides to approve full quantity
11. Maria clicks "Approve" button
12. System displays approval confirmation dialog with approval comments field (optional)
13. Maria enters comment: "Approved. Please review grill temperature calibration."
14. Maria clicks "Confirm Approval"
15. System validates Maria has authority to approve this value ($31.25 < $200 threshold)
16. System updates wastage status to "approved", captures approval date/time, approver (Maria), comment
17. System triggers inventory adjustment (UC-WAST-101) reducing Atlantic Salmon stock by 2.5 kg
18. System queues GL posting (UC-WAST-202) debiting Wastage Expense, crediting Inventory
19. System sends notification to Chef Daniel: "Your wastage WST-2025-0112-0023 has been approved by Maria."
20. System displays success message: "Wastage WST-2025-0112-0023 approved successfully. Inventory adjusted."
21. System returns Maria to approval queue with item removed from pending list
22. Use case ends

**Alternative Flows**:

**Alt-3A: Partial Approval** (At step 10)
- 10a. Maria decides quantity is too high, believes only 2 kg should be approved instead of 2.5 kg
- 10b. Maria clicks "Partially Approve" button
- 10c. System displays dialog to enter approved quantity and reason for reduction
- 10d. Maria enters approved quantity: 2 kg (reduces from 2.5 kg to 2 kg)
- 10e. Maria enters reduction reason: "Verified only 2 kg wasted, remaining 0.5 kg salvageable"
- 10f. System calculates approved value: $25.00 (2 kg × $12.50)
- 10g. System updates wastage with approved_quantity (2 kg), rejected_quantity (0.5 kg), status "partially_approved"
- 10h. System creates inventory adjustment for approved quantity only (2 kg)
- 10i. System sends notification to Chef Daniel explaining partial approval and reduction reason
- 10j. System creates new draft wastage for remaining 0.5 kg for Chef Daniel to review and resubmit if necessary
- Resume at step 20

**Alt-3B: Request More Information** (At step 9)
- 9a. Maria needs additional information before deciding
- 9b. Maria clicks "Request Info" button
- 9c. System displays dialog to enter information request
- 9d. Maria enters: "Please provide more details about the temperature issue and corrective action taken."
- 9e. System sends wastage back to Chef Daniel with status "info_requested"
- 9f. System notifies Chef Daniel to provide additional information
- 9g. Chef Daniel adds information and resubmits
- 9h. Wastage returns to Maria's approval queue
- Resume at step 5

**Alt-3C: Delegate Approval** (At step 1)
- 1a. Maria is unavailable (vacation, busy) and has delegated approvals to Assistant Manager
- 1b. System shows wastage in Assistant Manager's approval queue
- 1c. Assistant Manager performs approval, system records delegation: "Approved by Assistant Manager (delegated from Maria)"
- Resume at step 2 with delegated approver

**Alt-3D: Multi-Level Approval Required** (At step 15)
- 15a. System detects wastage value ($450) requires two approval levels (Store Manager + Finance Manager)
- 15b. Maria (Store Manager) approves first level
- 15c. System updates status to "partially_approved" (Level 1 complete)
- 15d. System routes wastage to Finance Manager's approval queue
- 15e. System notifies Finance Manager of pending approval
- 15f. Finance Manager Frank reviews and approves second level (UC-WAST-003 repeated)
- 15g. After Frank's approval, system updates status to "approved" and triggers inventory adjustment
- Use case ends

**Exception Flows**:

**Exc-3A: Approver Lacks Authority** (At step 15)
- Maria attempts to approve high-value wastage ($550) exceeding her authority ($200 limit)
- System displays error: "You do not have authority to approve wastage exceeding $200. This requires Finance Manager approval."
- System suggests: "You can partially approve up to $200 or forward to Finance Manager."
- Wastage remains pending, no changes made
- Use case ends

**Exc-3B: Stock Insufficient for Adjustment** (At step 17)
- System attempts to create inventory adjustment but discovers stock depleted since wastage submission (race condition)
- System displays warning: "Current stock (1 kg) is insufficient for wastage quantity (2.5 kg). Possible inventory discrepancy."
- System blocks approval until stock discrepancy is resolved
- System alerts Inventory Manager to investigate
- Maria must defer approval until investigation complete
- Use case ends

**Exc-3C: User Cannot Approve Own Wastage** (At step 15)
- System detects Maria is attempting to approve wastage she submitted herself (BR-WAST-008)
- System displays error: "You cannot approve your own wastage. This will be automatically routed to your manager."
- System re-routes wastage to next approval level (Regional Manager)
- Use case ends

**Exc-3D: Approval Timeout** (At step 17-19)
- System timeout during inventory adjustment or GL posting (network issue, service unavailable)
- System displays error: "Approval processing timeout. Your approval has been recorded but inventory adjustment is pending."
- System queues inventory adjustment for retry
- System logs incident for IT investigation
- Maria sees message: "Approval saved. Inventory adjustment will be retried automatically."
- System administrator monitors retry queue
- Use case ends

**Business Rules**:
- **BR-WAST-007**: Approval thresholds: <$50 auto-approve (expired items only), $50-$200 Department Manager, $200-$500 Store Manager, >$500 Store Manager + Finance Manager
- **BR-WAST-008**: Users cannot approve their own wastage
- **BR-WAST-009**: Approvals must be completed within 48 hours of submission (escalation rule)
- **BR-WAST-006**: Approved wastage automatically adjusts inventory
- Partial approval creates new draft wastage for rejected quantity
- Approval captures approver ID, timestamp, comments, approval level

**Includes**:
- [UC-WAST-101: Auto-Adjust Inventory](#uc-wast-101-auto-adjust-inventory)
- [UC-WAST-202: Post Wastage to General Ledger](#uc-wast-202-post-wastage-to-general-ledger)
- [UC-WAST-102: Send Approval Notifications](#uc-wast-102-send-approval-notifications)

**Related Requirements**:
- FR-WAST-003: Implement Multi-Level Approval Workflow
- FR-WAST-004: Process Approval Actions
- FR-WAST-005: Automatic Inventory Adjustment
- BR-WAST-007, BR-WAST-008, BR-WAST-009

**UI Mockups**: `/app/(main)/store-operations/wastage-reporting/approvals`

**Notes**:
- Approval queue should support filtering by date range, value range, category, submitter
- Mobile approval interface for managers to approve on-the-go
- Batch approval feature for low-value routine wastage (e.g., approve all expired items <$50)
- System should detect recurring wastage patterns and suggest coaching or process improvements

---

### UC-WAST-004: Reject Wastage Transaction

**Description**: Approvers reject wastage transactions that are invalid, fraudulent, or insufficiently documented. Rejection provides feedback to submitter and prevents inventory adjustment.

**Actor(s)**: Department Manager, Store Manager (Maria), Finance Manager (Frank)

**Priority**: High

**Frequency**: 5-10% of wastage transactions are rejected

**Preconditions**:
- User is authenticated with "Wastage Approver" permission
- Wastage transaction exists in "pending_approval" status
- Wastage is in user's approval queue
- User has reviewed wastage details and determined it should be rejected

**Postconditions**:
- **Success**: Wastage rejected with reason, status changed to "rejected", no inventory adjustment, rejection logged for audit, submitter notified with rejection reason
- **Failure**: Validation error (e.g., rejection reason too short), wastage remains pending

**Main Flow** (Happy Path):
1. Store Manager Maria is reviewing wastage transaction WST-2025-0112-0045 (Beef Ribeye, $125, Chef Daniel)
2. System displays wastage details showing:
   - Product: Beef Ribeye Steak, 5 kg, $25/kg = $125 total value
   - Category: Preparation Error - Dropped
   - Reason: "Dropped meat"
   - Responsible party: Chef Daniel
   - Photos: 1 photo attached
3. Maria reviews photo and finds it shows floor but not the meat
4. Maria finds reason too vague ("Dropped meat" only 12 characters, minimum 20 required)
5. Maria decides to reject due to insufficient documentation
6. Maria clicks "Reject" button
7. System displays rejection dialog requiring mandatory rejection reason (minimum 30 characters)
8. Maria enters rejection reason: "Insufficient documentation. Photo does not clearly show wasted product. Please resubmit with detailed explanation and clear photos of the affected product."
9. Maria clicks "Confirm Rejection"
10. System validates rejection reason meets minimum length requirement (30 characters)
11. System updates wastage status to "rejected"
12. System records rejection date/time, rejector (Maria), rejection reason
13. System does NOT create inventory adjustment (stock remains unchanged)
14. System sends notification to Chef Daniel: "Your wastage WST-2025-0112-0045 was rejected by Maria. Reason: Insufficient documentation. Photo does not clearly show wasted product. Please resubmit with detailed explanation and clear photos of the affected product."
15. System displays success message: "Wastage WST-2025-0112-0045 rejected. Submitter has been notified."
16. System removes wastage from Maria's approval queue
17. System retains rejected wastage in history for audit purposes (not deleted)
18. Use case ends

**Alternative Flows**:

**Alt-4A: Reject as Fraudulent** (At step 5)
- 5a. Maria suspects wastage is fraudulent (no evidence of actual wastage, attempts to cover theft)
- 5b. Maria clicks "Reject as Fraud" button
- 5c. System displays fraud rejection dialog with escalation options
- 5d. Maria enters detailed fraud suspicion: "Photo appears staged. No visible damage to product. Multiple similar wastage claims from same user in past week totaling $450. Recommend investigation."
- 5e. Maria checks "Escalate to Operations Manager and Security"
- 5f. System marks wastage as "rejected_fraud_suspected"
- 5g. System sends alert to Operations Manager and Security team for investigation
- 5h. System flags submitter's account for audit review
- 5i. System generates fraud alert report for management review
- Resume at step 13

**Alt-4B: Reject with Guidance to Resubmit** (At step 8)
- 8a. Maria enters constructive rejection reason with guidance: "Photos show product but do not clearly show damage. Reason needs more detail about cause and prevention. Please resubmit with: 1) Clear photos showing damage, 2) Detailed explanation of how dropping occurred, 3) Steps taken to prevent recurrence."
- 8b. System categorizes rejection as "resubmit_requested" (softer than outright rejection)
- 8c. System notifies Chef Daniel with action items to resubmit properly
- Resume at step 10

**Alt-4C: Reject for Stock Discrepancy** (At step 5)
- 5a. Maria notices wastage claims 5 kg of Beef Ribeye but current stock is only 2 kg
- 5b. Maria suspects inventory discrepancy or timing issue
- 5c. Maria enters rejection reason: "Stock discrepancy detected. Current stock (2 kg) is less than claimed wastage (5 kg). Please verify actual stock and wastage quantity with physical count. Coordinate with Inventory Manager."
- 5d. System sends alert to Inventory Manager to investigate stock discrepancy
- Resume at step 10

**Exception Flows**:

**Exc-4A: Rejection Reason Too Short** (At step 10)
- System validates rejection reason and finds it's only 15 characters (minimum 30 required)
- System displays validation error: "Rejection reason must be at least 30 characters to provide adequate feedback to submitter."
- Maria must provide more detailed rejection reason
- Resume at step 8

**Exc-4B: User Lacks Rejection Permission** (At step 6)
- User attempts to reject but lacks "Wastage Approver" permission (configuration error)
- System displays error: "You do not have permission to reject wastage transactions."
- System logs permission violation for security review
- Use case ends

**Exc-4C: Wastage Already Approved by Another Approver** (At step 11)
- Race condition: another approver approved the same wastage while Maria was reviewing (multi-level approval scenario)
- System detects status changed from "pending_approval" to "approved"
- System displays: "This wastage has already been approved by [Other Approver]. Your rejection cannot be processed."
- System refreshes approval queue to show updated status
- Use case ends

**Business Rules**:
- **BR-WAST-010**: Rejected wastage cannot be edited and resubmitted; new wastage must be created
- Rejection reason must be minimum 30 characters to ensure adequate feedback
- Rejected wastage transactions remain in system for audit purposes (soft delete only)
- Rejected wastage does NOT adjust inventory
- Rejection notifications must include detailed reason to help submitter improve future submissions
- Fraud-flagged rejections trigger security review workflow

**Related Requirements**:
- FR-WAST-004: Process Approval Actions
- FR-WAST-003: Multi-Level Approval Workflow
- BR-WAST-010: Rejection rules

**UI Mockups**: `/app/(main)/store-operations/wastage-reporting/approvals/[id]`

**Notes**:
- Rejection reason should be constructive to improve future submissions, not punitive
- System should track rejection rate by submitter to identify training needs
- Consider rejection reason templates for common issues (insufficient photos, vague description, stock discrepancy)
- Fraud rejection workflow should maintain confidentiality until investigation complete

---

### UC-WAST-005: View Wastage Transaction History

**Description**: Users view historical wastage transactions with search, filtering, and drill-down capabilities to analyze patterns and retrieve specific records.

**Actor(s)**: All Users (Kitchen Staff, Store Manager, Department Manager, Finance Manager, Operations Manager)

**Priority**: Medium

**Frequency**: Daily for managers, weekly for staff

**Preconditions**:
- User is authenticated
- User has "View Wastage" permission for at least one location
- Historical wastage transactions exist in system

**Postconditions**:
- **Success**: User views wastage history, can drill down to details, export results if needed
- **Failure**: No data displayed if user lacks permissions or no wastage exists for selected criteria

**Main Flow** (Happy Path):
1. Store Manager Maria navigates to Wastage History page
2. System displays wastage transaction list with default filter (current location, last 30 days, all statuses)
3. System shows columns: Wastage Number, Date, Product, Quantity, Value, Category, Status, Recorded By, Approved By
4. System displays 25 transactions per page with pagination controls
5. System shows summary statistics at top: Total Wastage (78 transactions, $3,245), Top Category (Preparation Error, 32% of value), Top Product (Beef Ribeye, $450)
6. Maria wants to find all spoilage wastage last month
7. Maria applies filters:
   - Date Range: 2024-12-01 to 2024-12-31
   - Category: Spoilage
   - Status: All
8. System queries database with filters and returns 23 matching transactions
9. System updates summary: Total Spoilage (23 transactions, $1,125), Average per Transaction ($49)
10. Maria sorts list by Value (descending) to see highest spoilage first
11. System reorders list showing highest value spoilage at top
12. Maria clicks on wastage transaction WST-2024-1215-0012 (Fresh Salmon, $180 spoilage)
13. System displays complete transaction details:
    - Header info, product details, photos (3 attached), reason ("Refrigerator malfunction overnight, product reached unsafe temperature")
    - Approval history showing approved by Maria on 2024-12-15
    - Inventory adjustment link showing 8 kg deducted from stock
    - GL posting link showing expense posted to account 5140-Spoilage
14. Maria reviews photos showing deteriorated salmon
15. Maria notes refrigerator malfunction as root cause (pattern to investigate)
16. Maria clicks "Back to List"
17. System returns to filtered list maintaining Maria's filters and sort order
18. Maria clicks "Export to Excel" to share with Operations Manager
19. System generates Excel file with filtered results (23 records) including all fields
20. System downloads file to Maria's device: "Wastage_Spoilage_Dec2024.xlsx"
21. Use case ends

**Alternative Flows**:

**Alt-5A: Search by Wastage Number** (At step 6)
- 6a. Maria knows specific wastage number WST-2025-0105-0018
- 6b. Maria enters wastage number in search box
- 6c. System finds matching wastage and displays details immediately
- Use case ends

**Alt-5B: Search by Product** (At step 6)
- 6a. Maria wants to see all wastage for "Salmon" products
- 6b. Maria enters "Salmon" in product search field
- 6c. System searches product name and code fields, returns all wastage containing "Salmon" (Atlantic Salmon Fillet, Fresh Salmon, Salmon Portions, etc.)
- Resume at step 8

**Alt-5C: Multi-Location View** (At step 2)
- 2a. Operations Manager reviews wastage across all 5 locations in region
- 2b. Operations Manager selects "All My Locations" filter
- 2c. System aggregates wastage from all locations user has access to
- 2d. System groups results by location with subtotals
- Resume at step 3

**Alt-5D: Drill-Down to Inventory Adjustment** (At step 13)
- 13a. Maria clicks inventory adjustment link
- 13b. System navigates to Inventory Management module showing adjustment transaction
- 13c. Adjustment displays link back to originating wastage for traceability
- Maria returns to wastage history

**Alt-5E: View Responsible Party History** (At step 13)
- 13a. Maria clicks on responsible party name (Chef Daniel)
- 13b. System displays all wastage where Chef Daniel was responsible party
- 13c. System calculates total wastage attributed to Chef Daniel ($450 last 90 days, 12 transactions)
- 13d. Maria uses this to assess if coaching is needed
- Maria returns to main history

**Exception Flows**:

**Exc-5A: No Results Found** (At step 8)
- System finds no wastage matching applied filters
- System displays: "No wastage transactions found matching your criteria. Try adjusting your filters."
- System offers suggestions: "Expand date range" or "Clear category filter"
- Maria adjusts filters
- Resume at step 7

**Exc-5B: User Lacks Location Permission** (At step 2)
- User attempts to view wastage for location they don't have access to
- System applies row-level security (RLS) filtering automatically
- System shows only wastage for locations user has permission to view
- If user has no location access, displays: "No wastage data available. Contact administrator for access."
- Use case ends

**Exc-5C: Export Fails** (At step 19)
- System encounters error generating Excel export (too many records, service unavailable)
- System displays: "Export failed. Try reducing the number of records or contact support."
- System offers alternative: "Export to CSV (faster)" or "Schedule report for email delivery"
- Maria selects CSV export
- Resume at step 20

**Business Rules**:
- **BR-WAST-009**: Users can only view wastage for locations they have access to (row-level security)
- Default view shows last 30 days to balance performance and relevance
- Pagination displays 25 records per page (configurable: 25, 50, 100)
- Exports limited to 10,000 records for performance; larger exports scheduled for background processing
- Rejected wastage visible in history but clearly marked with rejection reason
- Deleted photos show placeholder indicating photo was deleted (audit retention)

**Related Requirements**:
- FR-WAST-009: View Wastage Transaction History
- NFR-WAST-011: Mobile-responsive interface
- BR-WAST-009: Viewing permissions
- NFR-WAST-004: Report generation performance (<10 seconds for 10K records)

**UI Mockups**: `/app/(main)/store-operations/wastage-reporting/history`

**Notes**:
- Search should support partial matching and autocomplete for product names
- Filters should be persistent across sessions for user convenience
- Consider saved filter sets for common queries (e.g., "High Value Wastage", "This Month Spoilage")
- Mobile view should prioritize essential columns with horizontal scroll for additional details

---

(Continuing with remaining use cases...)

### UC-WAST-006: Analyze Wastage Trends

**Description**: Managers analyze wastage trends using visualizations, KPIs, and statistical analysis to identify patterns, anomalies, and improvement opportunities.

**Actor(s)**: Store Manager (Maria), Department Manager, Operations Manager, Finance Manager (Frank)

**Priority**: High

**Frequency**: Weekly for store managers, daily for operations managers during high-focus periods

**Preconditions**:
- User is authenticated with "View Wastage Analytics" permission
- Historical wastage data exists (minimum 30 days for meaningful trends)
- Analytics engine has processed recent data
- User has access to at least one location

**Postconditions**:
- **Success**: User views comprehensive wastage analytics, identifies actionable insights, can drill down to underlying transactions
- **Failure**: Limited or no data if insufficient history or user lacks permissions

**Main Flow** (Happy Path):
1. Store Manager Maria navigates to Wastage Analytics dashboard
2. System displays analytics dashboard with date range selector (default: last 90 days)
3. System shows key performance indicators (KPIs) at top:
   - Total Wastage Value: $9,850 (current period)
   - Wastage as % of COGS: 6.2% (industry benchmark: 4-10%)
   - Total Transactions: 287
   - Average per Transaction: $34.32
   - Wastage Reduction vs Prior Period: +2.8% (worse, shown in red)
4. System displays trend line chart showing daily wastage over 90 days
5. Chart shows spike on Dec 25 ($450 wastage) with annotation hover: "Christmas buffet overproduction"
6. System shows pie chart of wastage by category:
   - Preparation Error: 35% ($3,448)
   - Spoilage: 28% ($2,758)
   - Overproduction: 18% ($1,773)
   - Expired Items: 12% ($1,182)
   - Other categories: 7%
7. System displays "Top 10 Wasted Products" table:
   - Beef Ribeye: $1,250 (12.7% of total wastage)
   - Atlantic Salmon: $890 (9.0%)
   - Fresh Pasta: $670 (6.8%)
   - (Remaining 7 products...)
8. System shows "Wastage by Day of Week" bar chart:
   - Sundays highest: $1,890 (buffet service)
   - Tuesdays lowest: $580
   - Pattern: Higher wastage on weekends
9. System displays "Wastage by Time of Day" heat map:
   - Peak wastage 2-4 PM (lunch cleanup)
   - Secondary peak 9-11 PM (dinner cleanup)
10. Maria notices preparation error is highest category (35%)
11. Maria clicks on "Preparation Error" slice in pie chart
12. System drills down to Preparation Error details:
    - Sub-categories: Overcooked (45%), Dropped (25%), Wrong Recipe (18%), Burned (12%)
    - Top products affected: Beef Ribeye ($580), Salmon ($340), Pasta ($290)
    - Responsible parties: Chef Daniel (32%), Chef Sarah (28%), Chef Tom (22%)
13. System shows trend: Preparation Error increasing 15% over prior period (alert shown)
14. Maria identifies training opportunity: Focus on grill temperature control (Overcooked dominant)
15. System displays anomaly detection alerts:
    - Alert: "Beef Ribeye wastage 3.2× above 90-day average this week"
    - Alert: "Chef Daniel preparation error frequency increased 45% vs prior period"
    - Alert: "Spoilage rate trending upward (R² = 0.73, p < 0.05)"
16. Maria clicks anomaly alert for Beef Ribeye
17. System shows detailed analysis:
    - Historical Beef Ribeye wastage: Average $85/week, Std Dev $25
    - This week: $285 (7.1 std deviations above mean)
    - Potential causes: New supplier? Menu promotion? Staff changes?
    - Recommended actions: Investigate supplier quality, verify preparation training
18. Maria notes actions to take: Review Beef Ribeye supplier quality, coach Chef Daniel on grill control
19. Maria clicks "Export Analytics Report"
20. System generates PDF report with all charts, tables, KPIs, and anomaly alerts
21. System downloads report: "Wastage_Analytics_Jan2025.pdf"
22. Maria shares report with Operations Manager for review
23. Use case ends

**Alternative Flows**:

**Alt-6A: Compare Multiple Time Periods** (At step 2)
- 2a. Maria wants to compare current quarter to prior quarter
- 2b. Maria selects "Compare Periods" and chooses Q4 2024 vs Q3 2024
- 2c. System displays side-by-side comparison with variance percentages
- 2d. Charts show overlaid trend lines for both periods
- Resume at step 3

**Alt-6B: Multi-Location Analysis** (At step 2)
- 2a. Operations Manager analyzes 5 locations simultaneously
- 2b. Operations Manager selects "Compare Locations"
- 2c. System displays comparative dashboard showing KPIs for each location
- 2d. Charts grouped by location with benchmarking
- 2e. System highlights best and worst performing locations
- Resume at step 3

**Alt-6C: Filter by Responsible Party** (At step 10)
- 10a. Maria wants to analyze specific employee's wastage (Chef Daniel)
- 10b. Maria applies filter: Responsible Party = Chef Daniel
- 10c. System recalculates all metrics and charts for Chef Daniel only
- 10d. System shows Chef Daniel's wastage: $1,250 (90 days), 37 transactions, Average $33.78
- Resume at step 11

**Alt-6D: Predictive Analytics** (At step 9)
- 9a. System offers predictive forecast: "Based on current trend, projected monthly wastage: $13,500 (+15% vs target)"
- 9b. Maria clicks "View Forecast"
- 9c. System displays forecasting chart with confidence interval
- 9d. Chart shows projected wastage next 30 days with 80% confidence band
- 9e. Alert shown: "At current rate, wastage will exceed budget by $2,800 this month"
- Maria uses forecast to plan intervention actions

**Exception Flows**:

**Exc-6A: Insufficient Data** (At step 2)
- System has <30 days of wastage data (new location, new system deployment)
- System displays warning: "Insufficient data for meaningful trend analysis. Minimum 30 days of data required. Current data: 12 days."
- System shows limited metrics available (totals, averages, no trends)
- Use case continues with limited analytics

**Exc-6B: Analytics Engine Processing Delayed** (At step 2)
- Latest data not yet processed by scheduled analytics job (runs nightly)
- System displays notice: "Analytics data current as of 2025-01-11 11:00 PM. Today's wastage not yet included in trends."
- System offers "Refresh Now" button to trigger immediate recalculation
- Maria clicks refresh, system processes in background (~30 seconds)
- Dashboard updates with latest data
- Resume at step 3

**Exc-6C: No Anomalies Detected** (At step 15)
- Statistical analysis finds no significant anomalies current period
- System displays: "No significant anomalies detected. Wastage patterns within normal range."
- System still shows KPIs and standard charts
- Use case continues without anomaly alerts

**Business Rules**:
- **BR-WAST-008**: Wastage trends calculated using statistical methods (moving averages, standard deviation, linear regression)
- Minimum 30 days data required for trend analysis
- Anomaly detection uses 3-sigma rule (3 standard deviations from mean)
- Industry benchmark: 4-10% of COGS for full-service restaurants
- Analytics data refreshed nightly via scheduled job (UC-WAST-302)
- Users can only view analytics for locations they have access to

**Includes**:
- [UC-WAST-302: Calculate Wastage Trends](#uc-wast-302-calculate-wastage-trends) - Background job that processes analytics

**Related Requirements**:
- FR-WAST-010: Analyze Wastage Trends and Patterns
- FR-WAST-008: Generate Wastage Reports
- NFR-WAST-004: Analytics must render within 10 seconds for 10K transactions

**UI Mockups**: `/app/(main)/store-operations/wastage-reporting/analytics`

**Notes**:
- Consider external benchmarking data (industry averages by restaurant type)
- Machine learning models could predict wastage based on sales forecasts, weather, events
- Mobile analytics should focus on KPIs and top insights due to screen size constraints
- Real-time analytics may require separate analytics database to avoid impacting operational performance

---

(Continue with remaining use cases UC-WAST-007 through UC-WAST-304...)

I'll complete the remaining use cases in the next section to ensure comprehensive coverage. The document is substantial but provides thorough guidance for implementation. Should I continue with the remaining use cases, or would you like me to save this version and move to the next document (TS-wastage-reporting.md)?
