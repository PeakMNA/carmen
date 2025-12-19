# Flow Diagrams: Purchase Orders

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Orders
- **Document Type**: Flow Diagrams (FD)
- **Version**: 2.5.0
- **Last Updated**: 2025-12-19
- **Status**: Approved

**Document History**:
- v1.0.0 (2025-10-30): Initial version with approval workflow diagrams
- v2.0.0 (2025-10-31): Removed Diagram 2 (Approval Workflow) and Diagram 9 (Multi-Level Approval Sequence), updated all remaining diagrams to remove approval workflow logic

## Related Documents
- [Business Requirements](./BR-purchase-orders.md)
- [Use Cases](./UC-purchase-orders.md)
- [Technical Specification](./TS-purchase-orders.md)
- [Data Definition](./DS-purchase-orders.md)
- [Validations](./VAL-purchase-orders.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.5.0 | 2025-12-19 | System Analyst | Added Diagram 11: Simplified Create PO from PR flow showing new PO Summary dialog workflow with vendor + currency grouping |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.4.0 | 2025-12-03 | System | Mermaid 8.8.2 compatibility fixes: Updated stateDiagram to stateDiagram-v2, removed unsupported subgraph styling |
| 2.3.0 | 2025-12-02 | System Analyst | Added Diagram 10: QR Code Generation for Mobile Receiving flow, updated PO creation flow (Diagram 1) to include QR code generation step |
| 2.1.0 | 2025-12-01 | System | Added Comments & Attachments sidebar feature; Updated page layout description to include collapsible right sidebar with Comments, Attachments, and Activity Log sections |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

This document provides visual representations of purchase order workflows, data flows, and state transitions. All diagrams use Mermaid syntax for version control and maintainability.

**Diagram Types**:
- Process Flow Diagrams: User and system workflows
- Data Flow Diagrams: Information movement
- State Transition Diagrams: Status lifecycle
- Sequence Diagrams: System interactions
- Integration Flow Diagrams: External system interactions

---

## 1. Purchase Order Creation Process Flow

```mermaid
graph TD
    Start([User Starts PO Creation]) --> CheckSource{Source?}
    
    CheckSource -->|From PR| SelectPR[Select Approved PRs]
    CheckSource -->|Manual| ManualEntry[Manual PO Entry]
    
    SelectPR --> FilterPRs[Filter by Vendor/Dept]
    FilterPRs --> SelectItems[Select PR Items]
    SelectItems --> ValidateVendor{Same Vendor?}
    
    ValidateVendor -->|No| ErrorVendor[Show Error: Mixed Vendors]
    ErrorVendor --> FilterPRs
    ValidateVendor -->|Yes| PopulateForm[Populate PO Form]
    
    ManualEntry --> SelectVendor[Select Vendor]
    SelectVendor --> PopulateForm
    
    PopulateForm --> EnterDetails[Enter Order Details:<br>- Delivery Date<br>- Location<br>- Terms]
    EnterDetails --> AddLineItems[Add/Review Line Items]
    AddLineItems --> ApplyDiscount[Apply Discount<br>Optional]
    ApplyDiscount --> AddShipping[Add Shipping<br>Optional]
    AddShipping --> CalcTotals[Calculate Totals]
    CalcTotals --> AllocateBudget[Allocate to<br>Budget Accounts]
    
    AllocateBudget --> ValidateBudget{Budget<br>Available?}
    ValidateBudget -->|No| ShowBudgetError[Show Budget Error]
    ShowBudgetError --> AdjustPO{Adjust PO?}
    AdjustPO -->|Yes| AddLineItems
    AdjustPO -->|No| CancelCreate[Cancel Creation]
    
    ValidateBudget -->|Yes| ValidateForm{Form<br>Valid?}
    ValidateForm -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> EnterDetails
    
    ValidateForm -->|Yes| CreatePO[Create PO Record]
    CreatePO --> GeneratePONum[Generate PO Number]
    GeneratePONum --> CreateLineItems[Create Line Items]
    CreateLineItems --> CreateBudgetAlloc[Create Budget Allocations]
    CreateBudgetAlloc --> UpdatePRStatus[Update PR Status<br>if from PR]
    UpdatePRStatus --> GenerateQRCode[Generate QR Code<br>for PO number]
    GenerateQRCode --> CreateAuditLog[Create Audit Log Entry]
    CreateAuditLog --> End([PO Created<br>Status: Draft])
    
    CancelCreate --> EndCancel([Creation Cancelled])
```

**Description**: Complete flow for creating a purchase order from purchase requests or manually.

## 2. Send Purchase Order to Vendor

```mermaid
graph TD
    Start([PO Status Draft]) --> UserClickSend[User Clicks<br>Send to Vendor]
    UserClickSend --> DisplayDialog[Display Send Dialog]
    
    DisplayDialog --> LoadVendorEmail[Load Vendor<br>Email Address]
    LoadVendorEmail --> ValidateEmail{Email<br>Valid?}
    
    ValidateEmail -->|No| ShowEmailError[Show Error:<br>Invalid Email]
    ShowEmailError --> AllowManual[Allow Manual<br>Email Entry]
    AllowManual --> DisplayDialog
    
    ValidateEmail -->|Yes| PrepareEmail[Prepare Email:<br>- Subject<br>- Body Template<br>- CC Recipients]
    PrepareEmail --> UserReview[User Reviews<br>Email Content]
    UserReview --> UserAdditions{Add CC or<br>Attachments?}
    
    UserAdditions -->|Yes| AddCCAttach[Add CC Recipients<br>or Attachments]
    AddCCAttach --> UserReview
    
    UserAdditions -->|No| UserConfirm{User<br>Confirms<br>Send?}
    UserConfirm -->|No| SaveDraft[Save as Draft]
    SaveDraft --> EndDraft([Email Saved<br>Not Sent])
    
    UserConfirm -->|Yes| GeneratePDF[Generate PO PDF]
    GeneratePDF --> PDFSuccess{PDF<br>Generated?}
    
    PDFSuccess -->|No| PDFError[Show PDF Error]
    PDFError --> RetryPDF{Retry?}
    RetryPDF -->|Yes| GeneratePDF
    RetryPDF -->|No| EndError([Send Failed])
    
    PDFSuccess -->|Yes| SendEmail[Send Email<br>with Attachments]
    SendEmail --> EmailSuccess{Email<br>Sent?}
    
    EmailSuccess -->|No| LogEmailError[Log Email Error]
    LogEmailError --> ShowEmailFailed[Show Error Message]
    ShowEmailFailed --> RetryOptions{User<br>Action}
    RetryOptions -->|Retry| SendEmail
    RetryOptions -->|Download PDF| DownloadPDF[Download PDF<br>for Manual Send]
    RetryOptions -->|Cancel| EndError
    DownloadPDF --> EndManual([Manual Send<br>Required])
    
    EmailSuccess -->|Yes| UpdatePOStatus[Update PO Status<br>to 'Sent']
    UpdatePOStatus --> RecordSentDetails[Record:<br>- Sent Timestamp<br>- Sent By<br>- Recipient Email]
    RecordSentDetails --> CreateCommLog[Create Communication<br>Log Entry]
    CreateCommLog --> SetExpectedAck[Set Expected<br>Acknowledgment Date]
    SetExpectedAck --> UpdateActivityLog[Update Activity Log]
    UpdateActivityLog --> NotifyStaff[Notify Purchasing<br>Staff]
    NotifyStaff --> End([PO Sent to Vendor<br>Status: Sent])
```

**Description**: Process for sending purchase order to vendor via email with PDF attachment.

---

## 3. Purchase Order Change Order Process

```mermaid
graph TD
    Start([PO Status Sent or Acknowledged]) --> UserInitiate[User Clicks<br>Request Change Order]
    UserInitiate --> DisplayChangeForm[Display Change Order Form]
    
    DisplayChangeForm --> ShowCurrentPO[Show Current<br>PO Details<br>Read-Only]
    ShowCurrentPO --> UserMakeChanges[User Makes Changes:<br>- Quantities<br>- Prices<br>- Dates<br>- Add/Remove Items]
    
    UserMakeChanges --> CalculateImpact[Calculate Impact:<br>- New Totals<br>- Change %<br>- Budget Impact]
    CalculateImpact --> DisplayComparison[Display Comparison:<br>Original vs New]
    
    DisplayComparison --> UserEnterReason[User Enters<br>Change Reason<br>Required]
    UserEnterReason --> UserSubmitChange{User<br>Submits<br>Change?}
    
    UserSubmitChange -->|No| CancelChange([Change<br>Cancelled])
    
    UserSubmitChange -->|Yes| ValidateChanges{Changes<br>Valid?}
    ValidateChanges -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> UserMakeChanges
    
    ValidateChanges -->|Yes| CheckBudget{Budget<br>Available<br>for Increase?}
    CheckBudget -->|No| BudgetError[Show Budget Error]
    BudgetError --> AdjustChange{Adjust<br>Changes?}
    AdjustChange -->|Yes| UserMakeChanges
    AdjustChange -->|No| CancelChange
    
    CheckBudget -->|Yes| EvaluateSignificance{Total<br>Change<br>>10%?}

    EvaluateSignificance -->|Yes| RequireManagerAuth[Require Manager<br>Authorization]
    RequireManagerAuth --> NotifyManager[Notify Manager]
    NotifyManager --> ManagerReview{Manager<br>Authorizes?}

    ManagerReview -->|No| RejectChange[Reject Change Order]
    RejectChange --> NotifyRejection[Notify User]
    NotifyRejection --> EndRejected([Change Rejected])

    ManagerReview -->|Yes| ApplyChanges[Apply Changes<br>Immediately]

    EvaluateSignificance -->|No| ApplyChanges
    
    ApplyChanges --> CreateRevision[Create PO Revision<br>Rev 1, Rev 2, etc.]
    CreateRevision --> UpdatePO[Update PO Details]
    UpdatePO --> LogHistory[Log All Changes<br>in History]
    LogHistory --> CheckPOSent{Was PO<br>Already<br>Sent?}
    
    CheckPOSent -->|No| UpdateBudget[Update Budget<br>Encumbrance]
    CheckPOSent -->|Yes| PrepareVendorNotice[Prepare Vendor<br>Change Notice]
    PrepareVendorNotice --> SendChangeNotice[Send Revised PO<br>to Vendor]
    SendChangeNotice --> LogVendorComm[Log Vendor<br>Communication]
    LogVendorComm --> UpdateBudget
    
    UpdateBudget --> NotifyStakeholders[Notify Stakeholders]
    NotifyStakeholders --> End([Change Order Complete])
```

**Description**: Process for modifying sent purchase orders with change order control and manager authorization for significant changes (>10%).

---

## 4. Purchase Order Cancellation Process

```mermaid
graph TD
    Start([User Initiates Cancellation]) --> CheckPOStatus{Current<br>PO Status}
    
    CheckPOStatus -->|Draft| SimpleCancellation[Simple Cancellation<br>No Vendor Notification]
    CheckPOStatus -->|Sent/Acknowledged| CheckReceipts{Items<br>Received?}
    
    CheckReceipts -->|Yes| CannotCancel[Cannot Cancel:<br>Items Already Received]
    CannotCancel --> OfferOptions[Offer Options:<br>- Partial Cancel<br>- Return Process<br>- Close PO]
    OfferOptions --> UserChoice{User<br>Selects}
    UserChoice -->|Partial| PartialCancel[Cancel Unreceived<br>Items Only]
    UserChoice -->|Return| RedirectReturn[Redirect to<br>Return Process]
    UserChoice -->|Close| ClosePO[Close PO as<br>Completed]
    UserChoice -->|Cancel| EndNoAction([Action Cancelled])
    
    CheckReceipts -->|No| CheckShipment{Items<br>in Transit?}
    CheckShipment -->|Yes| WarnTransit[Warn: Items May<br>Arrive, Prepare to Return]
    WarnTransit --> RequireConfirm{User<br>Confirms<br>Risk?}
    RequireConfirm -->|No| EndNoAction
    RequireConfirm -->|Yes| VendorNotification
    
    CheckShipment -->|No| VendorNotification[Vendor Notification<br>Required]
    SimpleCancellation --> ShowCancelDialog[Display Cancellation Dialog]
    VendorNotification --> ShowCancelDialog
    
    ShowCancelDialog --> RequireReason[Require Cancellation<br>Reason Entry]
    RequireReason --> EnterComments[User Enters<br>Detailed Comments]
    EnterComments --> CheckAuthority{User Has<br>Authority?}
    
    CheckAuthority -->|No| RequestManagerApproval[Request Manager<br>Approval]
    RequestManagerApproval --> ManagerReviews[Manager Reviews<br>Cancellation Request]
    ManagerReviews --> ManagerDecision{Manager<br>Approves?}
    ManagerDecision -->|No| NotifyDenied[Notify User:<br>Request Denied]
    NotifyDenied --> EndDenied([Cancellation Denied])
    ManagerDecision -->|Yes| ProceedCancel[Proceed with<br>Cancellation]
    
    CheckAuthority -->|Yes| UserConfirm{User<br>Confirms?}
    UserConfirm -->|No| EndNoAction
    UserConfirm -->|Yes| ProceedCancel
    
    ProceedCancel --> UpdatePOStatus[Update PO Status<br>to 'Cancelled']
    UpdatePOStatus --> RecordCancellation[Record:<br>- Cancelled Timestamp<br>- Cancelled By<br>- Reason]
    RecordCancellation --> ReleaseBudget[Release Budget<br>Encumbrance]
    ReleaseBudget --> UpdatePRStatus{From PR?}
    
    UpdatePRStatus -->|Yes| RevertPRStatus[Update PR Status<br>to 'Approved - Not Ordered']
    UpdatePRStatus -->|No| CreateAuditLog
    RevertPRStatus --> CreateAuditLog[Create Audit Log<br>Entry]
    
    CreateAuditLog --> NeedVendorNotice{Vendor<br>Notification<br>Needed?}
    NeedVendorNotice -->|Yes| SendCancellationEmail[Send Cancellation<br>Notice to Vendor]
    SendCancellationEmail --> LogVendorComm[Log Vendor<br>Communication]
    LogVendorComm --> NotifyStakeholders
    
    NeedVendorNotice -->|No| NotifyStakeholders[Notify:<br>- Creator<br>- Manager<br>- Budget Controller]
    NotifyStakeholders --> End([PO Cancelled])
    
    PartialCancel --> PartialProcess[Process Partial<br>Cancellation]
    PartialProcess --> End
    RedirectReturn --> EndRedirect([Redirected to<br>Return Module])
    ClosePO --> EndClosed([PO Closed])
```

**Description**: Purchase order cancellation with vendor notification and budget release.

---

## 5. Purchase Order Status State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft: Create PO

    Draft --> Sent: Send to Vendor
    Draft --> Cancelled: Cancel Draft
    Draft --> [*]: Delete

    Sent --> Acknowledged: Vendor Confirms
    Sent --> PartiallyReceived: Receive Some Items
    Sent --> Cancelled: Cancel (with Vendor Notice)
    Sent --> OnHold: Place on Hold

    Acknowledged --> PartiallyReceived: Receive Some Items
    Acknowledged --> FullyReceived: Receive All Items
    Acknowledged --> OnHold: Place on Hold

    OnHold --> Draft: Resume (if draft)
    OnHold --> Sent: Resume (if sent)
    OnHold --> Acknowledged: Resume (if acknowledged)
    OnHold --> Cancelled: Cancel While on Hold

    PartiallyReceived --> FullyReceived: Receive Remaining Items
    PartiallyReceived --> Completed: Close with Partial Receipt
    PartiallyReceived --> OnHold: Place on Hold

    FullyReceived --> Completed: Auto-Complete (30 days)
    FullyReceived --> Completed: Manual Complete

    Completed --> [*]: Archive
    Cancelled --> [*]: Archive

    note right of Draft
        User can edit freely
        No budget impact
    end note

    note right of Sent
        Budget encumbered
        Vendor notified
        Change requires
        change order process
    end note

    note right of FullyReceived
        All quantities received
        30-day grace period
        before auto-complete
    end note

    note right of Completed
        Read-only
        Historical record
        Cannot reopen
    end note
```

**Description**: Complete state machine showing all possible PO status transitions and constraints.

**State Guard Descriptions**:

**Send to Vendor Guard**:
- **Condition Name**: Can Send to Vendor
- **Description**: PO can only be sent if all validations pass and vendor contact is valid
- **Required Checks**:
  - PO status is 'Draft'
  - At least one line item exists
  - All required fields completed
  - Budget is available for total amount
  - Vendor has valid email address
  - PO PDF can be generated
  - User has 'send_purchase_orders' permission
- **Implementation**: System validates before email transmission and creates budget encumbrance

**Receive Items Guard**:
- **Condition Name**: Can Receive Items
- **Description**: Items can only be received against sent/acknowledged POs
- **Required Checks**:
  - PO status is 'Sent' or 'Acknowledged'
  - Receiving location matches delivery location
  - Quantities within tolerance (+5%)
  - Line items match PO
- **Implementation**: GRN creation validates against PO

**Complete PO Guard**:
- **Condition Name**: Can Complete
- **Description**: PO can only be completed when all conditions are met
- **Required Checks**:
  - All items fully received OR partial receipt approved
  - No open quality issues or disputes
  - 30 days elapsed since full receipt (for auto-complete)
  - All related invoices processed (if integrated)
  - Budget fully reconciled
- **Implementation**: Automated job checks conditions daily

**Cancel Guard**:
- **Condition Name**: Can Cancel
- **Description**: PO can be cancelled if no items have been received
- **Required Checks**:
  - No GRN entries exist for this PO
  - User has cancellation authority based on PO amount
  - Cancellation reason provided
  - If sent: Vendor notification prepared
- **Implementation**: System prevents cancellation if items received

---

## 6. Budget Integration Data Flow

```mermaid
graph LR
    subgraph PO_System['Purchase Order System']
        CreatePO[Create PO]
        SendPO[Send PO to Vendor]
        ModifyPO[Modify PO]
        CancelPO[Cancel PO]
        ReceiveGoods[Receive Goods via GRN]
    end

    subgraph Budget_System['Budget Management System']
        CheckAvailability[Check Budget<br>Availability]
        CreateEncumbrance[Create<br>Encumbrance]
        AdjustEncumbrance[Adjust<br>Encumbrance]
        ReleaseEncumbrance[Release<br>Encumbrance]
        ConvertToExpense[Convert<br>to Expense]
    end

    CreatePO -->|Budget Check Request| CheckAvailability
    CheckAvailability -->|Available Amount| CreatePO

    SendPO -->|Encumbrance Request| CreateEncumbrance
    CreateEncumbrance -->|Transaction ID| SendPO
    
    ModifyPO -->|Adjustment Request| AdjustEncumbrance
    AdjustEncumbrance -->|Updated Transaction| ModifyPO
    
    CancelPO -->|Release Request| ReleaseEncumbrance
    ReleaseEncumbrance -->|Confirmation| CancelPO
    
    ReceiveGoods -->|Conversion Request| ConvertToExpense
    ConvertToExpense -->|Expense Record| ReceiveGoods
```

**Description**: Data flow between purchase order system and budget management system.

---

## 7. Vendor Communication Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant PO_System
    participant Email_Service
    participant PDF_Generator
    participant Vendor
    participant Audit_Log

    User->>PO_System: Click Send to Vendor
    PO_System->>PO_System: Validate PO Status is Draft
    PO_System->>PO_System: Load Vendor Contact Info
    PO_System-->>User: Display Send Dialog

    User->>PO_System: Review and Confirm Send
    PO_System->>PDF_Generator: Generate PO PDF
    PDF_Generator-->>PO_System: Return PDF File

    alt PDF Generation Success
        PO_System->>Email_Service: Send Email with PDF
        Email_Service->>Vendor: Deliver Email
        Vendor-->>Email_Service: Email Received
        Email_Service-->>PO_System: Send Confirmation

        PO_System->>PO_System: Update PO Status to Sent
        PO_System->>PO_System: Record Sent Timestamp
        PO_System->>Audit_Log: Log Communication
        PO_System-->>User: Success Message

    else PDF Generation Failed
        PDF_Generator-->>PO_System: Error
        PO_System-->>User: Show Error and Offer Retry
    else Email Send Failed
        Email_Service-->>PO_System: Delivery Failed
        PO_System->>Audit_Log: Log Failed Attempt
        PO_System-->>User: Show Error and Offer Manual Send
    end

    opt Vendor Acknowledgment
        Vendor->>PO_System: Acknowledge Receipt via Portal
        PO_System->>PO_System: Update Status to Acknowledged
        PO_System->>Audit_Log: Log Acknowledgment
        PO_System-->>User: Notify Acknowledgment
    end
```

**Description**: Sequence of interactions when sending PO to vendor with error handling.

## 8. Goods Receipt Integration Flow

```mermaid
graph TD
    Start([GRN Created]) --> GRNApproved{GRN<br>Approved?}
    
    GRNApproved -->|No| EndWait([Wait for GRN Approval])
    
    GRNApproved -->|Yes| GetPORef[Get Referenced<br>PO ID]
    GetPORef --> FetchPO[Fetch PO Details]
    FetchPO --> GetGRNLines[Get GRN Line Items]
    
    GetGRNLines --> LoopLines{For Each<br>GRN Line}
    LoopLines --> FindPOLine[Find Matching<br>PO Line Item]
    FindPOLine --> UpdateReceived[Update<br>Quantity Received]
    UpdateReceived --> CalcRemaining[Calculate<br>Quantity Remaining]
    CalcRemaining --> CheckTolerance{Within<br>Tolerance?}
    
    CheckTolerance -->|No| FlagOverReceipt[Flag Over-Receipt<br>Requires Review]
    CheckTolerance -->|Yes| NextLine
    FlagOverReceipt --> NextLine{More<br>Lines?}
    
    NextLine -->|Yes| LoopLines
    NextLine -->|No| EvaluateStatus[Evaluate Overall<br>PO Status]
    
    EvaluateStatus --> AnyRemaining{Any Items<br>Remaining?}
    AnyRemaining -->|Yes| SetPartiallyReceived[Set Status:<br>'Partially Received']
    AnyRemaining -->|No| SetFullyReceived[Set Status:<br>'Fully Received']
    
    SetPartiallyReceived --> UpdateBudget1[Convert Received<br>Portion to Expense]
    SetFullyReceived --> UpdateBudget2[Convert All<br>Encumbrance to Expense]
    
    UpdateBudget1 --> LogHistory1[Log Status Change]
    UpdateBudget2 --> LogHistory2[Log Status Change]
    
    LogHistory1 --> NotifyPartial[Notify Purchasing Staff:<br>Partial Receipt]
    LogHistory2 --> NotifyFull[Notify All:<br>Fully Received]
    
    NotifyPartial --> SetAutoComplete{30 Days<br>Since Full<br>Receipt?}
    NotifyFull --> SetAutoComplete
    
    SetAutoComplete -->|No| End([Status Updated])
    SetAutoComplete -->|Yes| AutoComplete[Auto-Complete PO]
    AutoComplete --> FinalizeStatus[Set Status:<br>'Completed']
    FinalizeStatus --> ArchivePO[Archive PO]
    ArchivePO --> End
```

**Description**: Automatic PO status update when goods are received via GRN.

---

## 9. Line Item Details View Flow

```mermaid
graph TD
    Start([User Clicks Line Item Row]) --> LoadItem[Load Item Data from PO Line]
    LoadItem --> ShowDialog[Open Item Details Dialog]

    ShowDialog --> DisplayHeader[Display Item Header]
    DisplayHeader --> LoadInventory[Load Inventory Status Data]

    LoadInventory --> CalcOnHand[Calculate On Hand]
    LoadInventory --> CalcOnOrder[Calculate On Order]
    LoadInventory --> CalcReceived[Calculate Received]

    CalcOnHand --> DisplayIndicators[Display Inventory Status]
    CalcOnOrder --> DisplayIndicators
    CalcReceived --> DisplayIndicators

    DisplayIndicators --> DisplayMetrics[Display Key Metrics]
    DisplayMetrics --> DisplayPR[Display Related PR]
    DisplayPR --> DisplaySummary[Display Order Summary]
    DisplaySummary --> DisplayForm[Display Form Fields]

    DisplayIndicators --> UserClick{User Clicks Indicator?}

    UserClick -->|On Hand| OpenOnHand[Open On Hand Dialog]
    UserClick -->|On Order| OpenOnOrder[Open Pending POs Dialog]
    UserClick -->|Received| OpenReceived[Open GRN History Dialog]

    OpenOnHand --> ShowLocations[Show Location Table]
    ShowLocations --> CloseSubDialog[Close Sub-Dialog]

    OpenOnOrder --> ShowPendingPOs[Show Pending POs Table]
    ShowPendingPOs --> CloseSubDialog

    OpenReceived --> ShowGRNs[Show GRN History Table]
    ShowGRNs --> CloseSubDialog

    CloseSubDialog --> UserClick

    DisplayForm --> UserAction{User Action?}
    UserAction -->|Save| ValidateForm{Form Valid?}
    UserAction -->|Cancel| CloseDialog[Close Dialog]

    ValidateForm -->|Yes| SaveChanges[Save Item Changes]
    ValidateForm -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> DisplayForm

    SaveChanges --> UpdatePO[Update PO Line Item]
    UpdatePO --> CloseDialog

    CloseDialog --> End([Return to PO Detail Page])
```

**Description**: User flow for viewing and interacting with line item details, including inventory status indicators and sub-dialogs.

---

## 10. QR Code Generation for Mobile Receiving

```mermaid
graph TD
    Start([PO Created/Updated]) --> CheckPONum{PO Number<br>Generated?}
    CheckPONum -->|No| WaitForNum[Wait for PO Number]
    WaitForNum --> CheckPONum

    CheckPONum -->|Yes| BuildValue[Build QR Value<br>Format: PO:po_number]
    BuildValue --> CallQRLib[Call qrcode Library v1.5.3]

    CallQRLib --> SetOptions[Set QR Options:<br>- Error Correction: M 15%<br>- Width: 300px<br>- Margin: 4 modules]
    SetOptions --> GenerateImage[Generate Base64 Image]

    GenerateImage --> CheckSuccess{Generation<br>Success?}
    CheckSuccess -->|No| LogError[Log Error]
    LogError --> SetNull[Set qr_code fields = NULL]
    SetNull --> End([QR Code Generation Failed])

    CheckSuccess -->|Yes| StoreValue[Store qr_code value<br>e.g., 'PO:PO-2501-0001']
    StoreValue --> StoreImage[Store qr_code_image<br>Base64 data URL]
    StoreImage --> StoreTimestamp[Store qr_code_generated_at<br>Current timestamp]

    StoreTimestamp --> DisplayOnUI[Display QR Code<br>on PO Detail Page]
    DisplayOnUI --> ShowActions[Show Actions:<br>- Download QR<br>- Copy PO Number]
    ShowActions --> ShowInstructions[Show Mobile<br>Scanning Instructions]

    ShowInstructions --> UserAction{User Action?}
    UserAction -->|Download| DownloadQR[Generate High-Res QR<br>400x400px, 4 margin]
    DownloadQR --> SaveFile[Save as PNG:<br>po_number-QR.png]
    SaveFile --> UserAction

    UserAction -->|Copy| CopyToClipboard[Copy PO Number<br>to Clipboard]
    CopyToClipboard --> ShowConfirm[Show 'Copied!'<br>Confirmation]
    ShowConfirm --> UserAction

    UserAction -->|None| Ready([Ready for Mobile Scan])

    Ready --> MobileScan[Mobile App Scans QR]
    MobileScan --> ExtractPO[Extract PO Number<br>from QR Value]
    ExtractPO --> FetchPO[API: Fetch PO Details]
    FetchPO --> CreateGRN[Auto-Create GRN<br>Status: RECEIVED]
    CreateGRN --> OpenGRNPage[Open GRN Detail Page]
    OpenGRNPage --> MobileEnd([Mobile Receiving Workflow])
```

**Description**: Complete flow for automatic QR code generation on PO creation/update, desktop display with download/copy actions, and integration with mobile receiving workflow. QR codes enable quick GRN creation by scanning PO QR codes on mobile devices.

**Key Components**:
- **QR Library**: qrcode v1.5.3 (npm package)
- **QR Format**: `PO:{orderNumber}` (e.g., "PO:PO-2501-0001")
- **Desktop Component**: `QRCodeSection.tsx` at `app/(main)/procurement/purchase-orders/components/`
- **Utilities**: `lib/utils/qr-code.ts` with 7+ utility functions
- **Mobile Integration**: cmobile app scans QR → Extracts PO number → Auto-creates GRN
- **Display Options**:
  * On-screen: 200×200px, 2-module margin
  * Download: 400×400px PNG, 4-module margin
- **Error Correction**: Medium (M) level - 15% data restoration capability

---

## 11. Create PO from PR Flow (Simplified v1.4.0)

```mermaid
graph TD
    Start([User Opens<br>Create PO from PR]) --> AccessPoint{Access<br>Point?}

    AccessPoint -->|Dialog| OpenDialog[Open CreatePOFromPR<br>Dialog on PO List]
    AccessPoint -->|Page| OpenPage[Navigate to<br>/create/from-pr]

    OpenDialog --> ShowPRTable[Display PR<br>Selection Interface]
    OpenPage --> ShowPRTable

    ShowPRTable --> DisplayHeader[Show Header with<br>Package Icon in<br>bg-primary/10 circle]
    DisplayHeader --> DisplayBanner[Show Info Banner<br>bg-blue-50 border-blue-200<br>explaining automatic grouping]
    DisplayBanner --> DisplayWorkflow[Show Workflow Indicator<br>Select PRs → Review Summary → Create PO]
    DisplayWorkflow --> DisplayTable[Display Simplified Table:<br>Checkbox | PR# | Date | Description]

    DisplayTable --> UserSearch{User<br>Searches?}
    UserSearch -->|Yes| FilterPRs[Filter PRs by<br>PR# or Description]
    FilterPRs --> DisplayTable
    UserSearch -->|No| UserSelect[User Selects PRs]

    UserSelect --> UpdateBadge[Update Selection Badge<br>Green with CheckCircle]
    UpdateBadge --> MoreSelect{More<br>Selections?}
    MoreSelect -->|Yes| UserSelect
    MoreSelect -->|No| ClickCreate[User Clicks<br>Create PO Button]

    ClickCreate --> GroupPRs[Group PRs by<br>Vendor + Currency]
    GroupPRs --> ShowSummary[Display PO<br>Summary Dialog]

    ShowSummary --> DialogContent[Show Dialog:<br>- Header: X PRs → Y POs<br>- Card per PO with:<br>  * Vendor with Building icon<br>  * Delivery date with Calendar<br>  * Total with green badge<br>  * Source PR badges]
    DialogContent --> UserReview{User<br>Reviews}

    UserReview -->|Cancel| CloseDialog[Close Dialog<br>Return to Selection]
    CloseDialog --> DisplayTable

    UserReview -->|Confirm| StoreData[Store Grouped Data<br>in localStorage]
    StoreData --> CheckGroups{Group<br>Count?}

    CheckGroups -->|Single| NavSingle[Navigate to:<br>/create?mode=fromPR&grouped=true]
    CheckGroups -->|Multiple| NavBulk[Navigate to:<br>/create/bulk]

    NavSingle --> CreateSingle([Create Single PO])
    NavBulk --> CreateBulk([Create Multiple POs])
```

**Description**: Simplified workflow (v1.4.0) for creating Purchase Orders from approved Purchase Requests. Shows the streamlined PR selection interface with simplified table (PR#, Date, Description only), PO Summary dialog for reviewing grouped POs before creation, and navigation to single or bulk creation pages.

**Key Implementation Details**:
- **Component**: `CreatePOFromPR` at `app/(main)/procurement/purchase-orders/components/createpofrompr.tsx`
- **Page**: `/create/from-pr` at `app/(main)/procurement/purchase-orders/create/from-pr/page.tsx`
- **Simplified Table**: Removed Vendor, Delivery Date, Amount, Currency columns for cleaner selection experience
- **Grouping**: By vendor + currency only (NOT delivery date)
- **Design Language**: Consistent styling with `border-l-4 border-l-primary`, green badges, blue info banners
- **localStorage Keys**: `groupedPurchaseRequests`, `selectedPurchaseRequests`
- **Dialog Scrolling**: Uses `overflow-y-auto` with `min-h-0` for flex layout (not ScrollArea)

---

## Summary

This document provides comprehensive visual representations of all major purchase order workflows including:

1. **Creation Process**: From PRs or manual entry
2. **Vendor Communication**: Sending POs with PDF generation
3. **Change Management**: Change order process with budget validation
4. **Cancellation**: Budget release and vendor notification
5. **State Transitions**: Complete lifecycle state machine
6. **Budget Integration**: Real-time budget system interaction
7. **Vendor Communication Sequence**: Email transmission sequence
8. **GRN Integration**: Automatic status updates on receipt
9. **Line Item Details View**: Item details dialog with inventory status and sub-dialogs
10. **QR Code Generation**: Automatic QR code generation for mobile receiving integration
11. **Create PO from PR (Simplified)**: New streamlined workflow with simplified PR table and PO Summary dialog

These diagrams serve as reference for developers, testers, and stakeholders to understand system behavior and data flows.

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-30 | System | Initial creation from template |
| 2.1.0 | 2025-12-01 | System | Added Comments & Attachments sidebar feature documentation |
| 2.2.0 | 2025-12-01 | System | Added Line Item Details View Flow (Diagram 9) showing item details dialog with inventory status indicators, sub-dialogs for On Hand Breakdown, Pending POs, and GRN History |
| 2.3.0 | 2025-12-02 | System Analyst | Added Diagram 10: QR Code Generation for Mobile Receiving flow with complete desktop and mobile integration, updated Diagram 1 to include QR code generation step |
| 2.4.0 | 2025-12-03 | System | Mermaid 8.8.2 compatibility fixes: Updated stateDiagram to stateDiagram-v2, removed unsupported subgraph styling |
| 2.5.0 | 2025-12-19 | System Analyst | Added Diagram 11: Simplified Create PO from PR flow showing new PO Summary dialog workflow with vendor + currency grouping |
