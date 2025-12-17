# Vendor Directory - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Vendor Management > Vendor Directory
- **Version**: 2.2.0
- **Last Updated**: 2025-11-25
- **Document Status**: Updated
- **Mermaid Version**: 8.8.2+

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.2.0 | 2025-11-25 | System | Added certification management workflow; Updated address workflow for Asian international format |
| 2.1.0 | 2025-11-25 | System | Added multi-address and multi-contact workflows with primary designation |
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation |
| 1.0 | 2024-01-15 | System | Initial creation |

---

## 1. Introduction

This document provides visual representations of all workflows and processes in the Vendor Directory module using Mermaid diagrams. These diagrams complement the use cases and technical specifications by illustrating the flow of operations, decision points, and system interactions.

---

## 2. System Architecture Diagram

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph 'Frontend Layer'
        UI[Next.js UI Components]
        Forms[React Hook Form + Zod]
        State[Zustand + React Query]
    end

    subgraph 'Application Layer'
        Pages[Server Components]
        Actions[Server Actions]
        API[Route Handlers]
    end

    subgraph 'Business Logic Layer'
        Auth[Authentication Service]
        Validation[Validation Service]
        Encryption[Encryption Service]
        Notification[Notification Service]
    end

    subgraph 'Data Layer'
        Prisma[Prisma ORM]
        DB[(PostgreSQL + JSONB)]
    end

    subgraph 'External Services'
        S3[AWS S3 Storage]
        Email[Email Service]
        Search[Search Service]
    end

    UI --> Pages
    Forms --> Actions
    State --> Actions
    Pages --> Actions
    Pages --> API
    Actions --> Auth
    Actions --> Validation
    Actions --> Encryption
    Actions --> Notification
    Actions --> Prisma
    API --> Prisma
    Prisma --> DB
    Actions --> S3
    Notification --> Email
    DB --> Search
```

---

## 3. Data Flow Diagrams

### 3.1 Vendor Data Flow

```mermaid
graph LR
    User[User] -->|Input| Form[Vendor Form]
    Form -->|Submit| Validation[Zod Validation]
    Validation -->|Valid| ServerAction[Server Action]
    Validation -->|Invalid| Form

    ServerAction -->|Construct JSON| JSONBuilder[JSON Structure Builder]
    JSONBuilder -->|VendorInfo| Prisma[Prisma Client]

    Prisma -->|Insert/Update| DB[(PostgreSQL)]
    DB -->|Store JSON| JSONB[JSONB Column]

    DB -->|Response| ServerAction
    ServerAction -->|Success| Cache[React Query Cache]
    ServerAction -->|Error| ErrorHandler[Error Handler]

    Cache -->|Update UI| Form
    ErrorHandler -->|Display Error| Form
```

### 3.2 Document Upload Flow

```mermaid
graph TB
    User[User] -->|Select File| FileInput[File Input]
    FileInput -->|Validate| Validation{Valid?}
    Validation -->|No| Error[Show Error]
    Validation -->|Yes| Upload[Upload to S3]

    Upload -->|Upload Progress| Progress[Progress Bar]
    Upload -->|Success| S3[AWS S3]
    S3 -->|Return URL| Metadata[Create Metadata]

    Metadata -->|Document Info| JSON[Construct JSON]
    JSON -->|Update vendor.info| Prisma[Prisma Client]
    Prisma -->|Save| DB[(Database)]

    DB -->|Success| Notification[Send Notification]
    Notification -->|Expiry Alert| Schedule[Schedule Alert]
    Schedule -->|Complete| UI[Update UI]

    Error -->|Retry| FileInput
```

---

## 4. Core Workflows

### 4.1 Vendor Creation Workflow

```mermaid
flowchart TD
    Start([User Clicks 'Create Vendor']) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| Login[Redirect to Login]
    CheckAuth -->|Yes| ShowForm[Display Vendor Form]

    ShowForm --> EnterData[User Enters Data]
    EnterData --> TabNav{Navigate Tabs?}
    TabNav -->|Yes| ShowTab[Show Selected Tab]
    ShowTab --> EnterData

    TabNav -->|No| Submit{Submit Action?}
    Submit -->|Save Draft| SaveDraft[Save as Draft]
    Submit -->|Submit for Approval| ValidateRequired{Required Fields Complete?}

    ValidateRequired -->|No| ShowErrors[Highlight Missing Fields]
    ShowErrors --> EnterData

    ValidateRequired -->|Yes| ValidateCode{Vendor Code Unique?}
    ValidateCode -->|No| DuplicateError[Show Duplicate Error]
    DuplicateError --> EnterData

    ValidateCode -->|Yes| ValidateName{Company Name Unique?}
    ValidateName -->|No| NameWarning{Continue?}
    NameWarning -->|No| EnterData
    NameWarning -->|Yes| ConstructJSON

    ValidateName -->|Yes| ConstructJSON[Construct VendorInfo JSON]
    ConstructJSON --> SaveDB[(Save to Database)]
    SaveDB --> Status{Submission Type?}

    Status -->|Draft| SetDraft[Set Status: Draft]
    Status -->|Approval| SetPending[Set Status: Pending Approval]

    SetDraft --> Success[Display Success Message]
    SetPending --> CreateWorkflow[Create Approval Workflow]
    CreateWorkflow --> NotifyApprover[Notify First Approver]
    NotifyApprover --> Success

    Success --> Navigate[Navigate to Vendor Profile]
    Navigate --> End([End])

    SaveDraft --> SaveDB
    Login --> End
```

### 4.2 Vendor Approval Workflow

```mermaid
flowchart TD
    Start([Vendor Submitted for Approval]) --> CreateWorkflow[Create Workflow Instance]
    CreateWorkflow --> Stage1[Stage 1: Compliance Review]

    Stage1 --> NotifyCompliance[Notify Compliance Officer]
    NotifyCompliance --> WaitCompliance[Wait for Review]

    WaitCompliance --> ComplianceDecision{Compliance Decision?}
    ComplianceDecision -->|Approve| Stage2[Stage 2: Financial Review]
    ComplianceDecision -->|Reject| Rejected[Status: Rejected]
    ComplianceDecision -->|Request Info| InfoRequested[Status: Info Requested]

    InfoRequested --> NotifySubmitter[Notify Submitter]
    NotifySubmitter --> WaitInfo[Wait for Information]
    WaitInfo --> InfoProvided{Info Provided?}
    InfoProvided -->|Yes| Stage1
    InfoProvided -->|No| Timeout[SLA Timeout]
    Timeout --> Escalate[Escalate to Manager]

    Stage2 --> NotifyFinance[Notify Finance Manager]
    NotifyFinance --> WaitFinance[Wait for Review]

    WaitFinance --> FinanceDecision{Finance Decision?}
    FinanceDecision -->|Approve| Stage3[Stage 3: Quality Review]
    FinanceDecision -->|Reject| Rejected
    FinanceDecision -->|Request Info| InfoRequested

    Stage3 --> NotifyQuality[Notify Quality Manager]
    NotifyQuality --> WaitQuality[Wait for Review]

    WaitQuality --> QualityDecision{Quality Decision?}
    QualityDecision -->|Approve| CheckType{High-Value Vendor?}
    QualityDecision -->|Reject| Rejected
    QualityDecision -->|Request Info| InfoRequested

    CheckType -->|Yes| Stage4[Stage 4: Management Approval]
    CheckType -->|No| Approved[Status: Approved]

    Stage4 --> NotifyManagement[Notify Management]
    NotifyManagement --> WaitManagement[Wait for Review]

    WaitManagement --> ManagementDecision{Management Decision?}
    ManagementDecision -->|Approve| Approved
    ManagementDecision -->|Reject| Rejected
    ManagementDecision -->|Request Info| InfoRequested

    Approved --> UpdateStatus[Update Vendor Status]
    UpdateStatus --> NotifyAll[Notify All Stakeholders]
    NotifyAll --> LogAudit[Log in Audit Trail]
    LogAudit --> End([End])

    Rejected --> LogRejection[Log Rejection Reason]
    LogRejection --> NotifySubmitterReject[Notify Submitter]
    NotifySubmitterReject --> End

    Escalate --> End
```

### 4.3 Vendor Edit Workflow

```mermaid
flowchart TD
    Start([User Opens Vendor for Edit]) --> LoadVendor[(Load Vendor from DB)]
    LoadVendor --> ParseJSON[Parse JSON Fields]
    ParseJSON --> DisplayForm[Display Form with Data]

    DisplayForm --> UserEdits[User Modifies Fields]
    UserEdits --> SaveAction{User Action?}

    SaveAction -->|Cancel| DiscardConfirm{Confirm Discard?}
    DiscardConfirm -->|Yes| End([End])
    DiscardConfirm -->|No| UserEdits

    SaveAction -->|Save Changes| ValidateChanges[Validate Changes]
    ValidateChanges --> ValidationResult{Valid?}

    ValidationResult -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> UserEdits

    ValidationResult -->|Yes| CheckConflict{Concurrent Edit?}
    CheckConflict -->|Yes| ConflictResolution{Resolution?}
    ConflictResolution -->|Override| MergeChanges
    ConflictResolution -->|Merge| MergeChanges[Merge Changes]
    ConflictResolution -->|Cancel| End

    CheckConflict -->|No| CheckApproval{Changes Require Approval?}
    CheckApproval -->|Yes| CreateApproval[Create Approval Request]
    CreateApproval --> PendingStatus[Set Status: Pending Approval]
    PendingStatus --> NotifyApprovers[Notify Approvers]

    CheckApproval -->|No| SaveChanges[Save Changes to DB]
    SaveChanges --> UpdateJSON[Update JSON Fields]
    UpdateJSON --> CheckImpact{Active Transactions?}

    CheckImpact -->|Yes| ShowWarning[Show Impact Warning]
    ShowWarning --> ConfirmSave{Confirm Save?}
    ConfirmSave -->|No| End
    ConfirmSave -->|Yes| CommitChanges

    CheckImpact -->|No| CommitChanges[Commit to Database]
    CommitChanges --> AuditLog[Create Audit Entry]
    AuditLog --> Revalidate[Revalidate Cache]
    Revalidate --> Success[Display Success Message]

    NotifyApprovers --> Success
    Success --> RefreshUI[Refresh UI]
    RefreshUI --> End
```

### 4.4 Document Upload Workflow

```mermaid
flowchart TD
    Start([User Clicks 'Upload Document']) --> SelectFile[User Selects File]
    SelectFile --> ValidateFile{File Valid?}

    ValidateFile -->|Size > 50MB| SizeError[Show Size Error]
    ValidateFile -->|Invalid Type| TypeError[Show Type Error]
    ValidateFile -->|Valid| ShowProgress[Show Upload Progress]

    SizeError --> SelectFile
    TypeError --> SelectFile

    ShowProgress --> UploadS3[Upload to AWS S3]
    UploadS3 --> UploadStatus{Upload Success?}

    UploadStatus -->|Failed| RetryPrompt{Retry?}
    RetryPrompt -->|Yes| UploadS3
    RetryPrompt -->|No| End([End])

    UploadStatus -->|Success| GetURL[Get S3 File URL]
    GetURL --> ShowMetadataForm[Show Metadata Form]

    ShowMetadataForm --> UserEntersMetadata[User Enters Metadata]
    UserEntersMetadata --> ValidateMetadata{Metadata Valid?}

    ValidateMetadata -->|No| MetadataErrors[Show Validation Errors]
    MetadataErrors --> UserEntersMetadata

    ValidateMetadata -->|Yes| CheckDuplicate{Duplicate Document?}
    CheckDuplicate -->|Yes| DuplicatePrompt{Action?}
    DuplicatePrompt -->|Replace| ArchiveOld[Archive Old Version]
    DuplicatePrompt -->|Save New| CreateNew
    DuplicatePrompt -->|Cancel| DeleteS3[Delete from S3]
    DeleteS3 --> End

    ArchiveOld --> IncrementVersion[Increment Version]
    IncrementVersion --> CreateNew

    CheckDuplicate -->|No| CreateNew[Create Document Entry]
    CreateNew --> UpdateJSON[Update vendor.info JSON]
    UpdateJSON --> CheckApproval{Requires Approval?}

    CheckApproval -->|Yes| CreateApprovalRequest[Create Approval Request]
    CreateApprovalRequest --> SetPending[Status: Pending]
    SetPending --> NotifyApprover[Notify Approver]

    CheckApproval -->|No| SetActive[Status: Active]
    SetActive --> CheckExpiry{Has Expiry Date?}

    CheckExpiry -->|Yes| ScheduleAlerts[Schedule Expiry Alerts]
    ScheduleAlerts --> SaveDB

    CheckExpiry -->|No| SaveDB[(Save to Database)]
    SaveDB --> NotifyUser[Notify User]

    NotifyApprover --> NotifyUser
    NotifyUser --> Success[Display Success]
    Success --> RefreshList[Refresh Document List]
    RefreshList --> End
```

---

## 5. Search and Filter Workflows

### 5.1 Vendor Search Workflow

```mermaid
flowchart TD
    Start([User Enters Search Term]) --> Debounce[Debounce 300ms]
    Debounce --> CheckCache{Result in Cache?}

    CheckCache -->|Yes| ReturnCached[Return Cached Results]
    ReturnCached --> DisplayResults

    CheckCache -->|No| BuildQuery[Build Search Query]
    BuildQuery --> SearchDB[(Query Database)]

    SearchDB --> ApplyFilters{Filters Applied?}
    ApplyFilters -->|Yes| FilterResults[Apply Client-Side Filters]
    ApplyFilters -->|No| CalculateRelevance

    FilterResults --> CalculateRelevance[Calculate Relevance Score]
    CalculateRelevance --> SortResults[Sort by Relevance]
    SortResults --> ApplyPermissions[Apply User Permissions]

    ApplyPermissions --> LimitResults[Limit to 100 Results]
    LimitResults --> HighlightMatches[Highlight Search Terms]
    HighlightMatches --> CacheResults[Cache Results]
    CacheResults --> DisplayResults[Display Results]

    DisplayResults --> UserAction{User Action?}
    UserAction -->|Select Vendor| OpenProfile[Open Vendor Profile]
    UserAction -->|Change Filters| ApplyFilters
    UserAction -->|New Search| Start
    UserAction -->|Export| ExportResults[Export to CSV/Excel]

    OpenProfile --> End([End])
    ExportResults --> End
```

### 5.2 Advanced Filter Workflow

```mermaid
flowchart TD
    Start([User Opens Filter Panel]) --> LoadFilters[Load Filter Options]
    LoadFilters --> DisplayPanel[Display Filter Panel]

    DisplayPanel --> UserSelects[User Selects Filters]
    UserSelects --> FilterType{Filter Type?}

    FilterType -->|Status| StatusFilter[Apply Status Filter]
    FilterType -->|Rating| RatingFilter[Apply Rating Filter]
    FilterType -->|Location| LocationFilter[Apply Location Filter]
    FilterType -->|Category| CategoryFilter[Apply Category Filter]
    FilterType -->|Date Range| DateFilter[Apply Date Range Filter]

    StatusFilter --> CombineFilters
    RatingFilter --> CombineFilters
    LocationFilter --> CombineFilters
    CategoryFilter --> CombineFilters
    DateFilter --> CombineFilters[Combine All Filters]

    CombineFilters --> QueryDB[(Query Database)]
    QueryDB --> ProcessResults[Process Results]
    ProcessResults --> DisplayCount[Display Result Count]
    DisplayCount --> UpdateUI[Update Vendor List]

    UpdateUI --> UserAction{User Action?}
    UserAction -->|Add Filter| UserSelects
    UserAction -->|Remove Filter| RemoveFilter[Remove Filter]
    RemoveFilter --> CombineFilters

    UserAction -->|Clear All| ClearFilters[Clear All Filters]
    ClearFilters --> DisplayPanel

    UserAction -->|Save Filter| SaveFilterPrompt[Prompt for Name]
    SaveFilterPrompt --> SaveFilter[Save Filter Preset]
    SaveFilter --> UpdateUI

    UserAction -->|Close| End([End])
```

---

## 6. Performance Tracking Workflows

### 6.1 Automated Performance Calculation

```mermaid
flowchart TD
    Start([Monthly Cron Job Triggers]) --> SelectVendors[Select Eligible Vendors]
    SelectVendors --> CheckEligibility{Min 5 Transactions?}

    CheckEligibility -->|No| Skip[Skip Vendor]
    CheckEligibility -->|Yes| FetchData[Fetch Transaction Data]

    FetchData --> GatherPOs[Gather Purchase Orders]
    GatherPOs --> GatherGRNs[Gather GRN Data]
    GatherGRNs --> GatherInvoices[Gather Invoice Data]
    GatherInvoices --> GatherIssues[Gather Issue Tickets]

    GatherIssues --> CalcQuality[Calculate Quality Score]
    CalcQuality --> QualityFormula['Quality = 100 - (defect_rate * 40) - (reject_rate * 30) - (complaint_impact * 30)']

    QualityFormula --> CalcDelivery[Calculate Delivery Score]
    CalcDelivery --> DeliveryFormula['Delivery = (on_time / total) * 100']

    DeliveryFormula --> CalcService[Calculate Service Score]
    CalcService --> ServiceFormula['Service = 100 - (response_delay * 2) - (unresolved * 10)']

    ServiceFormula --> CalcPricing[Calculate Pricing Score]
    CalcPricing --> PricingFormula['Pricing = 100 - (price_variance * 2)']

    PricingFormula --> ApplyWeights[Apply Weights]
    ApplyWeights --> OverallFormula['Overall = Quality * 0.35 + Delivery * 0.30 + Service * 0.20 + Pricing * 0.15']

    OverallFormula --> Compare{Rating Change >10 points?}
    Compare -->|Yes| FlagChange[Flag Significant Change]
    Compare -->|No| SaveRating

    FlagChange --> SendAlert[Send Alert to Manager]
    SendAlert --> SaveRating[Save Rating to JSON]

    SaveRating --> UpdateHistory[Update Performance History]
    UpdateHistory --> CheckThreshold{Rating < 60?}

    CheckThreshold -->|Yes| TriggerPIP[Trigger Performance Improvement Plan]
    CheckThreshold -->|No| CheckHigh{Rating >= 90 for 6 months?}

    TriggerPIP --> NotifyManager[Notify Vendor Manager]
    CheckHigh -->|Yes| SuggestPreferred[Suggest Preferred Status]
    CheckHigh -->|No| Complete

    SuggestPreferred --> NotifyManager
    NotifyManager --> Complete[Mark Complete]
    Complete --> NextVendor{More Vendors?}

    NextVendor -->|Yes| SelectVendors
    NextVendor -->|No| GenerateReport[Generate Monthly Report]
    GenerateReport --> End([End])

    Skip --> NextVendor
```

### 6.2 Manual Performance Review

```mermaid
flowchart TD
    Start([Manager Initiates Performance Review]) --> SelectVendor[Select Vendor]
    SelectVendor --> LoadMetrics[Load Performance Metrics]
    LoadMetrics --> DisplayDashboard[Display Performance Dashboard]

    DisplayDashboard --> ReviewMetrics[Manager Reviews Metrics]
    ReviewMetrics --> Action{Manager Action?}

    Action -->|Adjust Rating| AdjustPrompt[Enter Adjustment Reason]
    AdjustPrompt --> AdjustScores[Manually Adjust Scores]
    AdjustScores --> Recalculate[Recalculate Overall Rating]
    Recalculate --> FlagManual[Flag as Manual Override]
    FlagManual --> SaveChanges

    Action -->|Dispute Data| InvestigateData[Investigate Data Issue]
    InvestigateData --> CorrectData{Data Correct?}
    CorrectData -->|No| UpdateData[Update Transaction Data]
    UpdateData --> RecalcAuto[Recalculate Automatically]
    RecalcAuto --> SaveChanges
    CorrectData -->|Yes| NotifyVendor[Notify Vendor]
    NotifyVendor --> End

    Action -->|Create PIP| CreatePIP[Create Performance Improvement Plan]
    CreatePIP --> SetGoals[Set Improvement Goals]
    SetGoals --> ScheduleReview[Schedule Follow-up Review]
    ScheduleReview --> SaveChanges

    Action -->|Recommend Preferred| SubmitRecommendation[Submit Preferred Status Recommendation]
    SubmitRecommendation --> ApprovalFlow[Trigger Approval Workflow]
    ApprovalFlow --> SaveChanges

    SaveChanges[(Save to Database)]
    SaveChanges --> AuditLog[Create Audit Entry]
    AuditLog --> Success[Display Success Message]
    Success --> End([End])
```

---

## 7. Status Change Workflows

### 7.1 Block Vendor Workflow

```mermaid
flowchart TD
    Start([Manager Initiates Block Vendor]) --> CheckAuth{Has Permission?}
    CheckAuth -->|No| PermissionError[Show Permission Error]
    PermissionError --> End([End])

    CheckAuth -->|Yes| CheckImpact[Check Impact]
    CheckImpact --> CountPOs[Count Active POs]
    CountPOs --> CountInvoices[Count Pending Invoices]
    CountInvoices --> CountBalance[Check Outstanding Balance]

    CountBalance --> DisplaySummary[Display Impact Summary]
    DisplaySummary --> CheckType{Vendor Type?}

    CheckType -->|Strategic| StrategicWarning[Show Strategic Vendor Warning]
    StrategicWarning --> RequireExecutive[Require Executive Approval]
    CheckType -->|Sole Source| SoleSourceWarning[Show Sole Source Warning]
    SoleSourceWarning --> RequireExecutive
    CheckType -->|Regular| EnterReason

    RequireExecutive --> EnterReason[Enter Block Reason]
    EnterReason --> ReasonType{Reason Type?}

    ReasonType -->|Quality| QualityDetails[Enter Quality Issue Details]
    ReasonType -->|Delivery| DeliveryDetails[Enter Delivery Failure Details]
    ReasonType -->|Compliance| ComplianceDetails[Enter Compliance Issue Details]
    ReasonType -->|Financial| FinancialDetails[Enter Financial Concern Details]
    ReasonType -->|Other| OtherDetails[Enter Other Reason]

    QualityDetails --> EnterNotes
    DeliveryDetails --> EnterNotes
    ComplianceDetails --> EnterNotes
    FinancialDetails --> EnterNotes
    OtherDetails --> EnterNotes[Enter Detailed Notes]

    EnterNotes --> SetDuration{Block Type?}
    SetDuration -->|Temporary| SetDays[Set Number of Days]
    SetDuration -->|Pending Review| SetReview[Set Review Date]
    SetDuration -->|Indefinite| RequireApproval

    SetDays --> NotifyVendor{Notify Vendor?}
    SetReview --> NotifyVendor

    NotifyVendor -->|Yes| ComposeNotification[Compose Notification]
    ComposeNotification --> RequireApproval
    NotifyVendor -->|No| RequireApproval{Requires Approval?}

    RequireApproval -->|Yes| SubmitApproval[Submit for Approval]
    SubmitApproval --> WaitApproval[Wait for Approval]
    WaitApproval --> ApprovalDecision{Approved?}
    ApprovalDecision -->|No| NotifyRejection[Notify Manager]
    NotifyRejection --> End
    ApprovalDecision -->|Yes| ApplyBlock

    RequireApproval -->|No| ApplyBlock[Apply Block Status]
    ApplyBlock --> UpdateJSON[Update vendor.info]
    UpdateJSON --> SetEffectiveDate[Set Effective Date]
    SetEffectiveDate --> PreventNewPOs[Prevent New PO Creation]
    PreventNewPOs --> AllowExisting[Allow Existing PO Processing]

    AllowExisting --> SendNotifications[Send Notifications]
    SendNotifications --> NotifyProcurement[Notify Procurement Team]
    NotifyProcurement --> NotifyFinance[Notify Finance Team]
    NotifyFinance --> NotifyVendorEmail{Vendor Notification?}

    NotifyVendorEmail -->|Yes| SendVendorEmail[Send Email to Vendor]
    SendVendorEmail --> LogAction
    NotifyVendorEmail -->|No| LogAction[Log in Audit Trail]

    LogAction --> CheckTemporary{Temporary Block?}
    CheckTemporary -->|Yes| ScheduleReview[Schedule Review Reminder]
    ScheduleReview --> DisplaySuccess
    CheckTemporary -->|No| DisplaySuccess[Display Success Message]

    DisplaySuccess --> UpdateBadge[Add BLOCKED Badge]
    UpdateBadge --> RefreshUI[Refresh Vendor Profile]
    RefreshUI --> End
```

### 7.2 Unblock/Reactivate Vendor

```mermaid
flowchart TD
    Start([Manager Initiates Unblock Vendor]) --> CheckBlock{Vendor Blocked?}
    CheckBlock -->|No| NotBlockedError[Show Error: Not Blocked]
    NotBlockedError --> End([End])

    CheckBlock -->|Yes| ReviewReason[Review Block Reason]
    ReviewReason --> CheckResolution{Issue Resolved?}

    CheckResolution -->|No| CannotUnblock[Cannot Unblock Yet]
    CannotUnblock --> CreateFollowup[Create Follow-up Task]
    CreateFollowup --> End

    CheckResolution -->|Yes| EnterResolution[Enter Resolution Details]
    EnterResolution --> VerifyDocs{Required Docs Updated?}

    VerifyDocs -->|No| RequestDocs[Request Updated Documents]
    RequestDocs --> WaitDocs[Wait for Documents]
    WaitDocs --> DocsReceived{Docs Received?}
    DocsReceived -->|No| End
    DocsReceived -->|Yes| VerifyCompliance

    VerifyDocs -->|Yes| VerifyCompliance[Verify Compliance]
    VerifyCompliance --> CheckType{Block Type?}

    CheckType -->|Extended| RequireApproval[Require Approval]
    CheckType -->|Strategic| RequireApproval
    CheckType -->|Temporary| DirectUnblock

    RequireApproval --> SubmitApproval[Submit Unblock Request]
    SubmitApproval --> WaitApproval[Wait for Approval]
    WaitApproval --> ApprovalDecision{Approved?}

    ApprovalDecision -->|No| RejectUnblock[Unblock Rejected]
    RejectUnblock --> NotifyManager[Notify Manager]
    NotifyManager --> End

    ApprovalDecision -->|Yes| DirectUnblock[Change Status to Approved]
    DirectUnblock --> UpdateJSON[Update vendor.info]
    UpdateJSON --> ClearBlock[Clear Block Flags]
    ClearBlock --> EnablePOs[Enable PO Creation]

    EnablePOs --> SendNotifications[Send Notifications]
    SendNotifications --> NotifyStakeholders[Notify Stakeholders]
    NotifyStakeholders --> NotifyVendor[Notify Vendor]

    NotifyVendor --> LogAction[Log in Audit Trail]
    LogAction --> Success[Display Success]
    Success --> RemoveBadge[Remove BLOCKED Badge]
    RemoveBadge --> RefreshUI[Refresh Vendor Profile]
    RefreshUI --> End
```

---

## 8. Contact Management Workflows

### 8.1 Add Contact Workflow

```mermaid
flowchart TD
    Start([User Clicks 'Add Contact']) --> ShowForm[Display Contact Form]
    ShowForm --> EnterData[User Enters Contact Info]

    EnterData --> ValidateEmail{Email Valid?}
    ValidateEmail -->|No| EmailError[Show Email Error]
    EmailError --> EnterData

    ValidateEmail -->|Yes| ValidatePhone{Phone Valid?}
    ValidatePhone -->|No| PhoneError[Show Phone Error]
    PhoneError --> EnterData

    ValidatePhone -->|Yes| CheckDuplicate{Email Already Exists?}
    CheckDuplicate -->|Yes| DuplicatePrompt{Action?}
    DuplicatePrompt -->|Add Anyway| CreateContact
    DuplicatePrompt -->|View Existing| ViewExisting[View Existing Contact]
    DuplicatePrompt -->|Update| UpdateExisting[Update Existing Contact]

    ViewExisting --> End([End])
    UpdateExisting --> End

    CheckDuplicate -->|No| CheckPrimary{Marked as Primary?}
    CheckPrimary -->|Yes| PrimaryExists{Primary Already Exists?}
    PrimaryExists -->|Yes| ReplacePrompt{Replace Primary?}
    ReplacePrompt -->|Yes| UpdateOldPrimary[Update Old Primary]
    UpdateOldPrimary --> CreateContact
    ReplacePrompt -->|No| SaveRegular[Save as Regular Contact]
    SaveRegular --> End

    PrimaryExists -->|No| CreateContact[Create Contact Entry]
    CheckPrimary -->|No| CreateContact

    CreateContact --> ConstructJSON[Construct ContactInfo JSON]
    ConstructJSON --> UpdateVendor[Update tb_vendor_contact]
    UpdateVendor --> TestEmail{Send Test Email?}

    TestEmail -->|Yes| SendTest[Send Test Email]
    SendTest --> TestResult{Delivered?}
    TestResult -->|No| TestFailed[Show Warning]
    TestFailed --> SaveSuccess
    TestResult -->|Yes| SaveSuccess

    TestEmail -->|No| SaveSuccess[Save Successful]
    SaveSuccess --> LogAudit[Log in Audit Trail]
    LogAudit --> RefreshList[Refresh Contact List]
    RefreshList --> Success[Display Success Message]
    Success --> End
```

### 8.2 Address Management Workflow (Asian International Format)

```mermaid
flowchart TD
    Start([User Clicks 'Add Address']) --> ShowForm[Display Address Form]
    ShowForm --> EnterData[User Enters Address Info]

    subgraph 'Asian International Format Fields'
        EnterData --> EnterLabel[Enter Label e.g. Main Office]
        EnterLabel --> EnterLine1[Enter Address Line 1 *]
        EnterLine1 --> EnterLine2[Enter Address Line 2]
        EnterLine2 --> EnterSubDistrict[Enter Sub-District]
        EnterSubDistrict --> EnterDistrict[Enter District]
        EnterDistrict --> EnterCity[Enter City *]
        EnterCity --> EnterProvince[Enter Province]
        EnterProvince --> EnterPostal[Enter Postal Code]
        EnterPostal --> SelectCountry[Select Country *]
    end

    SelectCountry --> ValidateRequired{Required Fields Complete?}
    ValidateRequired -->|No| RequiredError[Show Required Field Error]
    RequiredError --> EnterData

    ValidateRequired -->|Yes| ValidateCountry{Country Valid?}
    ValidateCountry -->|No| CountryError[Show Unsupported Country Error]
    CountryError --> SelectCountry

    ValidateCountry -->|Yes| CheckPrimary{Set as Primary?}
    CheckPrimary -->|Yes| CheckExistingPrimary{Primary Exists?}
    CheckExistingPrimary -->|Yes| UpdateOldPrimary[Update Old Primary to Non-Primary]
    UpdateOldPrimary --> CreateAddress
    CheckExistingPrimary -->|No| CreateAddress

    CheckPrimary -->|No| FirstAddress{First Address?}
    FirstAddress -->|Yes| SetPrimaryAuto[Auto-Set as Primary]
    SetPrimaryAuto --> CreateAddress
    FirstAddress -->|No| CreateAddress[Create Address Entry]

    CreateAddress --> SaveDB[(Save to Database)]
    SaveDB --> RefreshList[Refresh Address List]
    RefreshList --> Success[Display Success Toast]
    Success --> End([End])
```

**Supported Countries (15):**
- Thailand, Singapore, Malaysia, Indonesia, Vietnam
- Philippines, Myanmar, Cambodia, Laos, Brunei
- China, Japan, South Korea, India, United States

---

## 9. Certification Management Workflows

### 9.1 Add Certification Workflow

```mermaid
flowchart TD
    Start([User Clicks 'Add Certification']) --> ShowDialog[Display Certification Dialog]
    ShowDialog --> EnterData[User Enters Certification Info]

    subgraph 'Certification Form Fields'
        EnterData --> EnterName[Enter Certification Name *]
        EnterName --> SelectType[Select Certification Type *]
        SelectType --> EnterIssuer[Enter Issuer *]
        EnterIssuer --> EnterCertNum[Enter Certificate Number]
        EnterCertNum --> SelectIssueDate[Select Issue Date *]
        SelectIssueDate --> SelectExpiryDate[Select Expiry Date *]
        SelectExpiryDate --> EnterDocUrl[Enter Document URL]
        EnterDocUrl --> EnterNotes[Enter Notes]
    end

    EnterNotes --> ValidateRequired{Required Fields Complete?}
    ValidateRequired -->|No| RequiredError[Show Validation Error]
    RequiredError --> EnterData

    ValidateRequired -->|Yes| ValidateDates{Expiry > Issue Date?}
    ValidateDates -->|No| DateError[Show Date Validation Error]
    DateError --> SelectIssueDate

    ValidateDates -->|Yes| ValidateType{Valid Certification Type?}
    ValidateType -->|No| TypeError[Show Invalid Type Error]
    TypeError --> SelectType

    ValidateType -->|Yes| CalcStatus[Calculate Status Auto]

    subgraph 'Status Calculation'
        CalcStatus --> CheckExpiry{Days Until Expiry?}
        CheckExpiry -->|< 0| SetExpired[Status: Expired]
        CheckExpiry -->|0-30| SetExpiringSoon[Status: Expiring Soon]
        CheckExpiry -->|> 30| SetActive[Status: Active]
    end

    SetExpired --> CreateCert
    SetExpiringSoon --> CreateCert
    SetActive --> CreateCert[Create Certification Entry]

    CreateCert --> SaveDB[(Save to Vendor Record)]
    SaveDB --> RefreshList[Refresh Certifications List]
    RefreshList --> ShowToast[Show Success Toast]
    ShowToast --> End([End])
```

### 9.2 Edit Certification Workflow

```mermaid
flowchart TD
    Start([User Clicks 'Edit' on Certification]) --> LoadData[Load Existing Data]
    LoadData --> ShowDialog[Display Dialog with Data]
    ShowDialog --> UserEdits[User Modifies Fields]

    UserEdits --> SaveAction{User Action?}
    SaveAction -->|Cancel| CloseDialog[Close Dialog]
    CloseDialog --> End([End])

    SaveAction -->|Save| ValidateFields{Fields Valid?}
    ValidateFields -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> UserEdits

    ValidateFields -->|Yes| ValidateDates{Expiry > Issue Date?}
    ValidateDates -->|No| DateError[Show Date Error]
    DateError --> UserEdits

    ValidateDates -->|Yes| RecalcStatus[Recalculate Status]

    subgraph 'Status Recalculation'
        RecalcStatus --> CheckNewExpiry{New Days Until Expiry?}
        CheckNewExpiry -->|< 0| UpdateExpired[Status: Expired]
        CheckNewExpiry -->|0-30| UpdateExpiringSoon[Status: Expiring Soon]
        CheckNewExpiry -->|> 30| UpdateActive[Status: Active]
    end

    UpdateExpired --> SaveChanges
    UpdateExpiringSoon --> SaveChanges
    UpdateActive --> SaveChanges[(Save Changes)]

    SaveChanges --> RefreshUI[Refresh Certifications Tab]
    RefreshUI --> ShowSuccess[Show Success Toast]
    ShowSuccess --> End
```

### 9.3 Delete Certification Workflow

```mermaid
flowchart TD
    Start([User Clicks 'Delete' on Certification]) --> ShowConfirm[Show Confirmation Dialog]
    ShowConfirm --> UserDecision{User Confirms?}

    UserDecision -->|Cancel| CloseDialog[Close Dialog]
    CloseDialog --> End([End])

    UserDecision -->|Confirm Delete| RemoveCert[Remove Certification from List]
    RemoveCert --> SaveDB[(Save Updated Vendor)]
    SaveDB --> RefreshList[Refresh Certifications List]
    RefreshList --> ShowToast[Show Success Toast]
    ShowToast --> End
```

### 9.4 Certification Status Auto-Calculation Flow

```mermaid
flowchart LR
    subgraph 'Page Load / Edit'
        A[Load Certification] --> B[Get Expiry Date]
        B --> C[Get Current Date]
        C --> D[Calculate Days Difference]
    end

    subgraph 'Status Decision'
        D --> E{Days Until Expiry}
        E -->|< 0 days| F[EXPIRED]
        E -->|0-30 days| G[EXPIRING SOON]
        E -->|> 30 days| H[ACTIVE]
    end

    subgraph 'Visual Display'
        F --> I[Red Badge]
        G --> J[Yellow Badge]
        H --> K[Green Badge]
    end
```

### 9.5 Certification Types Reference

```mermaid
graph TB
    subgraph 'ISO Standards'
        ISO9001[ISO 9001 - Quality]
        ISO14001[ISO 14001 - Environmental]
        ISO22000[ISO 22000 - Food Safety]
        ISO45001[ISO 45001 - Occupational Safety]
    end

    subgraph 'Food & Safety'
        HACCP[HACCP - Hazard Analysis]
        GMP[GMP - Good Manufacturing]
        Halal[Halal Certification]
        Kosher[Kosher Certification]
        Organic[Organic Certification]
        FairTrade[Fair Trade]
        FDA[FDA Approved]
    end

    subgraph 'Business & Trade'
        CE[CE Marking]
        BizLicense[Business License]
        TradeLicense[Trade License]
        ImportExport[Import/Export License]
        Other[Other]
    end
```

---

## 10. Integration Workflows

### 10.1 Vendor Selection in Purchase Order

```mermaid
flowchart TD
    Start([User Creates Purchase Order]) --> SelectVendor[Click 'Select Vendor']
    SelectVendor --> ShowModal[Show Vendor Selection Modal]

    ShowModal --> SearchVendors[Search/Filter Vendors]
    SearchVendors --> ApplyFilters[Apply Filters]
    ApplyFilters --> FilterStatus{Status Filter}

    FilterStatus --> OnlyApproved[Show Only Approved/ Preferred Vendors]
    OnlyApproved --> FilterLocation{Location Filter}
    FilterLocation --> MatchLocation[Match PO Location]
    MatchLocation --> FilterCatalog{Product Filter}
    FilterCatalog --> MatchProducts[Match Product Categories]

    MatchProducts --> DisplayResults[Display Filtered Vendors]
    DisplayResults --> UserSelects[User Selects Vendor]
    UserSelects --> CheckStatus{Vendor Status Valid?}

    CheckStatus -->|Blocked| BlockedError[Show Error: Vendor Blocked]
    CheckStatus -->|Blacklisted| BlacklistError[Show Error: Vendor Blacklisted]
    CheckStatus -->|Inactive| InactiveError[Show Error: Vendor Inactive]

    BlockedError --> SearchVendors
    BlacklistError --> SearchVendors
    InactiveError --> SearchVendors

    CheckStatus -->|Approved/Preferred| LoadVendorData[Load Vendor Data]
    LoadVendorData --> ParseJSON[Parse vendor.info JSON]
    ParseJSON --> AutoFill[Auto-fill PO Fields]

    AutoFill --> FillAddress[Fill Vendor Address]
    FillAddress --> FillContact[Fill Primary Contact]
    FillContact --> FillPaymentTerms[Fill Payment Terms]
    FillPaymentTerms --> FillCurrency[Fill Default Currency]
    FillCurrency --> FillCreditLimit[Check Credit Limit]

    FillCreditLimit --> CheckLimit{Within Credit Limit?}
    CheckLimit -->|No| CreditWarning[Show Credit Limit Warning]
    CreditWarning --> RequireApproval[Require Additional Approval]
    RequireApproval --> CompleteFill

    CheckLimit -->|Yes| CompleteFill[Complete Auto-fill]
    CompleteFill --> CloseModal[Close Modal]
    CloseModal --> UpdatePO[Update PO Form]
    UpdatePO --> EnableNext[Enable Next Step]
    EnableNext --> End([End])
```

### 10.2 Performance Data Update from GRN

```mermaid
flowchart TD
    Start([GRN Created/ Updated]) --> ExtractData[Extract GRN Data]
    ExtractData --> GetVendor[Get Vendor ID]
    GetVendor --> LoadVendor[Load Vendor Record]

    LoadVendor --> ParseJSON[Parse vendor.info]
    ParseJSON --> GetPerformance[Get Performance Object]

    GetPerformance --> UpdateQuality[Update Quality Metrics]
    UpdateQuality --> DefectRate[Calculate Defect Rate]
    DefectRate --> RejectRate[Calculate Reject Rate]
    RejectRate --> ComplaintImpact[Calculate Complaint Impact]

    ComplaintImpact --> UpdateDelivery[Update Delivery Metrics]
    UpdateDelivery --> OnTimeStatus{Delivered On Time?}
    OnTimeStatus -->|Yes| IncrementOnTime[Increment On-Time Count]
    OnTimeStatus -->|No| IncrementLate[Increment Late Count]

    IncrementOnTime --> CalcDeliveryRate
    IncrementLate --> CalcDeliveryRate[Calculate Delivery Rate]
    CalcDeliveryRate --> UpdateQuantity[Update Quantity Accuracy]

    UpdateQuantity --> CheckTransactions{Transaction Count >= 5?}
    CheckTransactions -->|No| SaveMetrics[Save Updated Metrics]
    CheckTransactions -->|Yes| RecalcRating[Recalculate Overall Rating]

    RecalcRating --> ApplyWeights[Apply Weighted Formula]
    ApplyWeights --> CompareOld{Significant Change?}
    CompareOld -->|Yes| TriggerAlert[Trigger Rating Alert]
    TriggerAlert --> SaveMetrics
    CompareOld -->|No| SaveMetrics

    SaveMetrics --> UpdateJSON[Update vendor.info JSON]
    UpdateJSON --> SaveDB[(Save to Database)]
    SaveDB --> CheckThreshold{Rating Below Threshold?}

    CheckThreshold -->|Yes| NotifyManager[Notify Vendor Manager]
    NotifyManager --> LogUpdate
    CheckThreshold -->|No| LogUpdate[Log Update in Audit]

    LogUpdate --> End([End])
```

---

## 11. Notification Workflows

### 11.1 Document Expiry Alert Workflow

```mermaid
flowchart TD
    Start([Daily Cron Job Triggers]) --> QueryDocuments[Query Documents with Expiry]
    QueryDocuments --> FilterExpiring[Filter Expiring Documents]

    FilterExpiring --> CheckDays{Days Until Expiry?}
    CheckDays -->|90 Days| Create90DayAlert
    CheckDays -->|60 Days| Create60DayAlert
    CheckDays -->|30 Days| Create30DayAlert
    CheckDays -->|7 Days| Create7DayAlert
    CheckDays -->|Expired| CreateExpiredAlert

    Create90DayAlert[Create 90-Day Alert] --> GroupAlerts
    Create60DayAlert[Create 60-Day Alert] --> GroupAlerts
    Create30DayAlert[Create 30-Day Alert] --> GroupAlerts
    Create7DayAlert[Create 7-Day Alert] --> GroupAlerts
    CreateExpiredAlert[Create Expired Alert] --> GroupAlerts

    GroupAlerts[Group Alerts by Vendor] --> BatchAlerts[Batch Alerts by User]
    BatchAlerts --> SendEmail[Send Email Notifications]
    SendEmail --> CreateInAppNotif[Create In-App Notifications]
    CreateInAppNotif --> UpdateDashboard[Update Dashboard Badge]

    UpdateDashboard --> LogNotifications[Log Notifications Sent]
    LogNotifications --> MarkSent[Mark Alerts as Sent]
    MarkSent --> CheckAutoRenew{Auto-Renew Enabled?}

    CheckAutoRenew -->|Yes| TriggerRenewal[Trigger Renewal Workflow]
    TriggerRenewal --> NotifyVendor[Notify Vendor]
    NotifyVendor --> End([End])

    CheckAutoRenew -->|No| End
```

### 11.2 Approval Notification Workflow

```mermaid
flowchart TD
    Start([Approval Request Created]) --> IdentifyApprover[Identify Approver]
    IdentifyApprover --> CheckAvailability{Approver Available?}

    CheckAvailability -->|No| FindBackup[Find Backup Approver]
    FindBackup --> NotifyBackup[Notify Backup]
    NotifyBackup --> LogDelegation[Log Auto-Delegation]
    LogDelegation --> SendEmail

    CheckAvailability -->|Yes| SendEmail[Send Email Notification]
    SendEmail --> EmailContent[Compose Email]
    EmailContent --> IncludeDetails[Include Vendor Details]
    IncludeDetails --> IncludeLink[Include Approval Link]
    IncludeLink --> IncludeDeadline[Include SLA Deadline]

    IncludeDeadline --> SendEmailAPI[Send via Email Service]
    SendEmailAPI --> CreateInApp[Create In-App Notification]
    CreateInApp --> UpdateBadge[Update Notification Badge]

    UpdateBadge --> StartSLA[Start SLA Timer]
    StartSLA --> ScheduleReminder[Schedule Reminder]
    ScheduleReminder --> WaitResponse[Wait for Response]

    WaitResponse --> CheckSLA{SLA Exceeded?}
    CheckSLA -->|Yes| SendReminder[Send Reminder]
    SendReminder --> EscalateCount{Reminder Count?}
    EscalateCount -->|3rd| EscalateManager[Escalate to Manager]
    EscalateManager --> WaitResponse
    EscalateCount -->|<3| WaitResponse

    CheckSLA -->|No| ResponseReceived{Response Received?}
    ResponseReceived -->|No| WaitResponse
    ResponseReceived -->|Yes| ProcessResponse[Process Response]

    ProcessResponse --> NotifySubmitter[Notify Submitter]
    NotifySubmitter --> UpdateWorkflow[Update Workflow Status]
    UpdateWorkflow --> LogResponse[Log in Audit Trail]
    LogResponse --> End([End])
```

---

## Related Documents
- BR-vendor-directory.md - Business Requirements
- UC-vendor-directory.md - Use Cases
- TS-vendor-directory.md - Technical Specification
- data-structure-gaps.md - Data Structure Analysis
- VAL-vendor-directory.md - Validations

---

**End of Flow Diagrams Document**
