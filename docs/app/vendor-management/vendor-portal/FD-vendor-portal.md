# Vendor Price Submission Portal - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **System**: Vendor Price Submission Portal
- **Module**: Vendor Management > Vendor Portal
- **Version**: 3.0.0
- **Status**: Active
- **Created**: 2025-01-23
- **Last Updated**: 2026-01-15
- **Author**: Product Team
- **Related Documents**:
  - [Business Requirements](./BR-vendor-portal.md)
  - [Use Cases](./UC-vendor-portal.md)
  - [Technical Specification](./TS-vendor-portal.md)
  - [Data Dictionary](./DD-vendor-portal.md)
  - [Validations](./VAL-vendor-portal.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.1 | 2026-01-15 | Documentation Team | Synced with current code; Verified flow diagrams against sample/page.tsx implementation; Confirmed submission methods (online, upload, email) |
| 3.0.0 | 2025-11-26 | System | Complete refactor - removed staff-side flows. This document now focuses ONLY on vendor-facing portal. Mermaid 8.8.2 compatible syntax. |
| 2.1.0 | 2025-11-26 | System | Removed approval workflow; Updated status to draft - submitted |
| 2.0 | 2025-01-23 | Product Team | Complete rewrite - token-based price submission only |
| 1.0 | 2024-01-15 | System | Initial version |

---

## Scope Clarification

### In Scope (This Document)
- Token-based portal access flow
- Online price submission flow
- Excel upload flow
- Excel template download flow
- Auto-save mechanism
- Submission and confirmation flow

### Out of Scope (See Related Modules)
- **Campaign Creation Flows** - See [requests-for-pricing](../requests-for-pricing/) module
- **Template Creation Flows** - See [pricelist-templates](../pricelist-templates/) module
- **Vendor Invitation Flows** - See [requests-for-pricing](../requests-for-pricing/) module
- **Pricelist Viewing Flows** - See [price-lists](../price-lists/) module

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Vendor Portal Architecture](#2-vendor-portal-architecture)
3. [Core Vendor Workflows](#3-core-vendor-workflows)
4. [Supporting Flows](#4-supporting-flows)
5. [System Automation](#5-system-automation)

---

## 1. Introduction

### 1.1 Purpose
This document provides visual representations of vendor-facing workflows in the Vendor Price Submission Portal using Mermaid diagrams compatible with version 8.8.2.

### 1.2 Scope
This document covers vendor-facing workflows ONLY:
- Token-based portal access
- Price submission via three methods
- Draft management with auto-save
- Submission confirmation

**Note**: There is no approval workflow - pricelists go from draft to submitted and become active immediately.

### 1.3 Diagram Conventions
- **Rectangles**: Process steps
- **Diamonds**: Decision points
- **Rounded rectangles**: Start/End points
- **Green nodes**: Success paths
- **Red nodes**: Error paths
- **Yellow nodes**: Warning states

---

## 2. Vendor Portal Architecture

### 2.1 Portal Component Overview

```mermaid
graph TB
    subgraph VendorPortal[Vendor Portal]
        TokenAuth[Token Authentication]
        WelcomeTab[Welcome Tab]
        SubmitTab[Submit Prices Tab]
        ReviewTab[Review Tab]
        HistoryTab[History Tab]
    end

    subgraph SubmissionMethods[Submission Methods]
        OnlineEntry[Online Entry]
        ExcelUpload[Excel Upload]
        ExcelDownload[Excel Download]
    end

    subgraph Services[Backend Services]
        TokenService[Token Service]
        PricelistService[Pricelist Service]
        ExcelService[Excel Service]
        AutoSaveService[Auto-Save Service]
    end

    subgraph DataLayer[Data Layer]
        Database[(PostgreSQL)]
        FileStorage[(File Storage)]
        Cache[(Redis Cache)]
    end

    TokenAuth --> TokenService
    SubmitTab --> OnlineEntry
    SubmitTab --> ExcelUpload
    SubmitTab --> ExcelDownload

    OnlineEntry --> PricelistService
    ExcelUpload --> ExcelService
    ExcelDownload --> ExcelService

    PricelistService --> Database
    ExcelService --> FileStorage
    AutoSaveService --> Cache

    style VendorPortal fill:#fff3e0
    style Services fill:#e3f2fd
    style DataLayer fill:#e8f5e9
```

---

## 3. Core Vendor Workflows

### 3.1 Token-Based Portal Access

**UC-VPP-006: Access Vendor Portal via Token**

```mermaid
flowchart TD
    Start([Vendor Clicks Token Link])
    ExtractToken[Extract Token from URL]
    ValidateFormat{Valid UUID Format?}
    ErrorFormat[Display Invalid Link Error]
    QueryDB[Query Database for Token]
    TokenExists{Token Exists?}
    ErrorNotFound[Display Token Not Found Error]
    CheckStatus{Token Status OK?}
    ErrorStatus[Display Token Status Error]
    CheckCampaign{Campaign Active?}
    ErrorCampaign[Display Campaign Inactive Error]
    CheckExpiry{Token Expired?}
    ErrorExpired[Display Token Expired Error]
    LoadData[Load Campaign and Pricelist Data]
    CreateSession[Create Portal Session]
    FirstAccess{First Access?}
    UpdateAccessed[Update Status to Accessed]
    UpdateTimestamp[Update Last Access Time]
    LogAccess[Log Access Activity]
    CheckDraft{Has Existing Draft?}
    ShowWelcomeBack[Show Welcome Back Message]
    ShowWelcome[Show Welcome Message]
    CheckExpirySoon{Expires in 24 Hours?}
    ShowWarning[Show Expiry Warning Banner]
    DisplayPortal[Display Vendor Portal]
    PortalReady([Portal Ready])
    AccessDenied([Access Denied])

    Start --> ExtractToken
    ExtractToken --> ValidateFormat
    ValidateFormat -->|No| ErrorFormat
    ValidateFormat -->|Yes| QueryDB
    ErrorFormat --> AccessDenied
    QueryDB --> TokenExists
    TokenExists -->|No| ErrorNotFound
    TokenExists -->|Yes| CheckStatus
    ErrorNotFound --> AccessDenied
    CheckStatus -->|Invalid| ErrorStatus
    CheckStatus -->|Valid| CheckCampaign
    ErrorStatus --> AccessDenied
    CheckCampaign -->|No| ErrorCampaign
    CheckCampaign -->|Yes| CheckExpiry
    ErrorCampaign --> AccessDenied
    CheckExpiry -->|Yes| ErrorExpired
    CheckExpiry -->|No| LoadData
    ErrorExpired --> AccessDenied
    LoadData --> CreateSession
    CreateSession --> FirstAccess
    FirstAccess -->|Yes| UpdateAccessed
    FirstAccess -->|No| UpdateTimestamp
    UpdateAccessed --> LogAccess
    UpdateTimestamp --> LogAccess
    LogAccess --> CheckDraft
    CheckDraft -->|Yes| ShowWelcomeBack
    CheckDraft -->|No| ShowWelcome
    ShowWelcomeBack --> CheckExpirySoon
    ShowWelcome --> CheckExpirySoon
    CheckExpirySoon -->|Yes| ShowWarning
    CheckExpirySoon -->|No| DisplayPortal
    ShowWarning --> DisplayPortal
    DisplayPortal --> PortalReady

    style Start fill:#e3f2fd
    style PortalReady fill:#c8e6c9
    style AccessDenied fill:#ffcdd2
    style ErrorFormat fill:#ffcdd2
    style ErrorNotFound fill:#ffcdd2
    style ErrorStatus fill:#ffcdd2
    style ErrorCampaign fill:#ffcdd2
    style ErrorExpired fill:#ffcdd2
    style ShowWarning fill:#fff9c4
```

### 3.2 Online Price Submission

**UC-VPP-007: Submit Prices Online**

```mermaid
flowchart TD
    Start([Vendor in Portal])
    ClickSubmit[Click Submit Prices Tab]
    ShowMethods[Display Submission Methods]
    SelectOnline[Select Online Entry]
    LoadInterface[Load Price Entry Interface]
    ShowHeader[Display Header Form]
    ShowProducts[Display Product Table]
    EnterPricing{Enter Pricing}
    SimplePricing[Enter Base Price]
    MOQPricing[Add MOQ Tiers]
    FOCPricing[Add FOC Quantity]
    ShowTierForm[Display Tier Form]
    EnterTiers[Enter Tier Data]
    ValidateTiers{Tiers Valid?}
    ShowTierError[Show Tier Error]
    ValidatePrice{Price Valid?}
    ShowPriceError[Show Price Error]
    ValidateFOC{FOC Valid?}
    ShowFOCError[Show FOC Error]
    AutoSave[Auto-Save Draft]
    SaveToDB[(Save to Database)]
    ContinueEditing{Continue?}
    SaveDraft[Save Draft]
    DraftSaved([Draft Saved])
    EnableSubmit[Enable Submit Button]
    ClickSubmitBtn[Click Submit]
    ShowConfirm[Display Confirmation]
    ConfirmSubmit{Confirm?}
    CancelSubmit[Cancel]
    FinalValidation[Final Validation]
    ValidationPass{Pass?}
    ShowErrors[Show Validation Errors]
    UpdateStatus[Update Status to Submitted]
    CalcQuality[Calculate Quality Score]
    ActivatePricelist[Activate Pricelist]
    SendVendorEmail[Send Vendor Confirmation]
    SendStaffEmail[Send Staff Notification]
    LogActivity[Log Submission]
    UpdateProgress[Update Campaign Progress]
    PortalReadOnly[Portal Read-Only Mode]
    Success([Pricelist Active])

    Start --> ClickSubmit
    ClickSubmit --> ShowMethods
    ShowMethods --> SelectOnline
    SelectOnline --> LoadInterface
    LoadInterface --> ShowHeader
    ShowHeader --> ShowProducts
    ShowProducts --> EnterPricing
    EnterPricing -->|Simple| SimplePricing
    EnterPricing -->|MOQ| MOQPricing
    EnterPricing -->|FOC| FOCPricing
    SimplePricing --> ValidatePrice
    MOQPricing --> ShowTierForm
    FOCPricing --> ValidateFOC
    ShowTierForm --> EnterTiers
    EnterTiers --> ValidateTiers
    ValidateTiers -->|No| ShowTierError
    ValidateTiers -->|Yes| AutoSave
    ShowTierError --> EnterTiers
    ValidatePrice -->|No| ShowPriceError
    ValidatePrice -->|Yes| AutoSave
    ShowPriceError --> SimplePricing
    ValidateFOC -->|No| ShowFOCError
    ValidateFOC -->|Yes| AutoSave
    ShowFOCError --> FOCPricing
    AutoSave --> SaveToDB
    SaveToDB --> ContinueEditing
    ContinueEditing -->|Yes| EnterPricing
    ContinueEditing -->|No| SaveDraft
    SaveDraft --> DraftSaved
    EnterPricing -->|Complete| EnableSubmit
    EnableSubmit --> ClickSubmitBtn
    ClickSubmitBtn --> ShowConfirm
    ShowConfirm --> ConfirmSubmit
    ConfirmSubmit -->|No| CancelSubmit
    ConfirmSubmit -->|Yes| FinalValidation
    CancelSubmit --> EnterPricing
    FinalValidation --> ValidationPass
    ValidationPass -->|No| ShowErrors
    ValidationPass -->|Yes| UpdateStatus
    ShowErrors --> EnterPricing
    UpdateStatus --> CalcQuality
    CalcQuality --> ActivatePricelist
    ActivatePricelist --> SendVendorEmail
    SendVendorEmail --> SendStaffEmail
    SendStaffEmail --> LogActivity
    LogActivity --> UpdateProgress
    UpdateProgress --> PortalReadOnly
    PortalReadOnly --> Success

    style Start fill:#e3f2fd
    style Success fill:#c8e6c9
    style DraftSaved fill:#fff9c4
    style ShowTierError fill:#ffcdd2
    style ShowPriceError fill:#ffcdd2
    style ShowFOCError fill:#ffcdd2
    style ShowErrors fill:#ffcdd2
```

### 3.3 Excel Upload Submission

**UC-VPP-008: Upload Excel Pricelist**

```mermaid
flowchart TD
    Start([Vendor in Portal])
    ClickSubmit[Click Submit Prices Tab]
    ShowMethods[Display Submission Methods]
    SelectUpload[Select Upload Excel]
    ShowUploadUI[Display Upload Interface]
    ChooseFile[Choose Excel File]
    ValidateFile{File Valid?}
    ErrorFormat[Invalid Format Error]
    ErrorSize[File Too Large Error]
    UploadFile[Upload File]
    ShowProgress[Show Upload Progress]
    UploadComplete{Upload OK?}
    ErrorUpload[Upload Failed Error]
    ParseExcel[Parse Excel File]
    ValidateStructure{Structure Valid?}
    ErrorHeaders[Missing Headers Error]
    ErrorSheet[Wrong Sheet Error]
    ValidateData[Validate Each Row]
    CheckErrors{Has Errors?}
    CollectErrors[Collect Validation Errors]
    ShowErrorReport[Display Error Report]
    DownloadErrors{Download Report?}
    GenerateErrorExcel[Generate Error Report]
    DownloadErrorFile[Download Report File]
    FixChoice{How to Fix?}
    EditOnline[Switch to Online Entry]
    SavePartial[Save Valid Data]
    MapData[Map Data to Items]
    CreateItems[Create Pricelist Items]
    CalcMetrics[Calculate Metrics]
    ShowPreview[Display Preview]
    ReviewData{Data Correct?}
    CancelUpload[Cancel Upload]
    SaveDraft[Save as Draft]
    DraftSaved[(Save to Database)]
    SubmitNow{Submit Now?}
    DraftEnd([Draft Saved])
    FinalValidation[Final Validation]
    ValidationPass{Pass?}
    ShowValidationErrors[Show Errors]
    UpdateStatus[Update Status]
    CalcQuality[Calculate Quality Score]
    ActivatePricelist[Activate Pricelist]
    SendEmails[Send Confirmation Emails]
    LogActivity[Log Activity]
    Success([Pricelist Active])
    UploadFailed([Upload Failed])

    Start --> ClickSubmit
    ClickSubmit --> ShowMethods
    ShowMethods --> SelectUpload
    SelectUpload --> ShowUploadUI
    ShowUploadUI --> ChooseFile
    ChooseFile --> ValidateFile
    ValidateFile -->|Wrong Format| ErrorFormat
    ValidateFile -->|Too Large| ErrorSize
    ValidateFile -->|OK| UploadFile
    ErrorFormat --> ShowUploadUI
    ErrorSize --> ShowUploadUI
    UploadFile --> ShowProgress
    ShowProgress --> UploadComplete
    UploadComplete -->|No| ErrorUpload
    UploadComplete -->|Yes| ParseExcel
    ErrorUpload --> ShowUploadUI
    ParseExcel --> ValidateStructure
    ValidateStructure -->|Missing Headers| ErrorHeaders
    ValidateStructure -->|Wrong Sheet| ErrorSheet
    ValidateStructure -->|OK| ValidateData
    ErrorHeaders --> ShowErrorReport
    ErrorSheet --> ShowErrorReport
    ValidateData --> CheckErrors
    CheckErrors -->|Yes| CollectErrors
    CheckErrors -->|No| MapData
    CollectErrors --> ShowErrorReport
    ShowErrorReport --> DownloadErrors
    DownloadErrors -->|Yes| GenerateErrorExcel
    DownloadErrors -->|No| FixChoice
    GenerateErrorExcel --> DownloadErrorFile
    DownloadErrorFile --> FixChoice
    FixChoice -->|Re-upload| ShowUploadUI
    FixChoice -->|Edit Online| EditOnline
    EditOnline --> SavePartial
    SavePartial --> DraftEnd
    MapData --> CreateItems
    CreateItems --> CalcMetrics
    CalcMetrics --> ShowPreview
    ShowPreview --> ReviewData
    ReviewData -->|No| CancelUpload
    ReviewData -->|Yes| SaveDraft
    CancelUpload --> ShowUploadUI
    SaveDraft --> DraftSaved
    DraftSaved --> SubmitNow
    SubmitNow -->|No| DraftEnd
    SubmitNow -->|Yes| FinalValidation
    FinalValidation --> ValidationPass
    ValidationPass -->|No| ShowValidationErrors
    ValidationPass -->|Yes| UpdateStatus
    ShowValidationErrors --> SaveDraft
    UpdateStatus --> CalcQuality
    CalcQuality --> ActivatePricelist
    ActivatePricelist --> SendEmails
    SendEmails --> LogActivity
    LogActivity --> Success

    style Start fill:#e3f2fd
    style Success fill:#c8e6c9
    style DraftEnd fill:#fff9c4
    style UploadFailed fill:#ffcdd2
    style ErrorFormat fill:#ffcdd2
    style ErrorSize fill:#ffcdd2
    style ErrorUpload fill:#ffcdd2
    style ErrorHeaders fill:#ffcdd2
    style ErrorSheet fill:#ffcdd2
    style ShowErrorReport fill:#ffcdd2
    style ShowValidationErrors fill:#ffcdd2
```

### 3.4 Excel Template Download

**UC-VPP-009: Download Excel Template**

```mermaid
flowchart TD
    Start([Vendor in Portal])
    ClickSubmit[Click Submit Prices Tab]
    ShowMethods[Display Submission Methods]
    SelectDownload[Select Download Template]
    ShowDownloadUI[Display Download Interface]
    ClickDownload[Click Download Template]
    RequestTemplate[Request Template Generation]
    LoadCampaign[Load Campaign Details]
    LoadProducts[Load Product List]
    CreateWorkbook[Create Excel Workbook]
    CreateSheets[Create Sheets]
    PopulateInstructions[Add Instructions Sheet]
    PopulatePricelist[Add Pricelist Sheet]
    PopulateReference[Add Reference Sheet]
    PopulateExample[Add Example Sheet]
    ApplyFormatting[Apply Formatting]
    ProtectSheets[Protect Read-Only Sheets]
    GenerateFile[Generate Excel File]
    SaveToStorage[Save to File Storage]
    GenerateURL[Generate Download URL]
    LogDownload[Log Download Activity]
    TriggerDownload[Trigger Browser Download]
    DownloadSuccess{Download OK?}
    ErrorDownload[Display Download Error]
    RetryDownload{Retry?}
    ShowSuccess[Display Success Message]
    ShowInstructions[Display Next Steps]
    VendorChoice{Next Action?}
    FillOffline([Fill Offline])
    GoToUpload[Go to Upload]
    ContinueUpload([Continue to Upload])
    ShowHelp[Display Help]
    HelpEnd([Help Displayed])
    DownloadFailed([Download Failed])

    Start --> ClickSubmit
    ClickSubmit --> ShowMethods
    ShowMethods --> SelectDownload
    SelectDownload --> ShowDownloadUI
    ShowDownloadUI --> ClickDownload
    ClickDownload --> RequestTemplate
    RequestTemplate --> LoadCampaign
    LoadCampaign --> LoadProducts
    LoadProducts --> CreateWorkbook
    CreateWorkbook --> CreateSheets
    CreateSheets --> PopulateInstructions
    PopulateInstructions --> PopulatePricelist
    PopulatePricelist --> PopulateReference
    PopulateReference --> PopulateExample
    PopulateExample --> ApplyFormatting
    ApplyFormatting --> ProtectSheets
    ProtectSheets --> GenerateFile
    GenerateFile --> SaveToStorage
    SaveToStorage --> GenerateURL
    GenerateURL --> LogDownload
    LogDownload --> TriggerDownload
    TriggerDownload --> DownloadSuccess
    DownloadSuccess -->|No| ErrorDownload
    DownloadSuccess -->|Yes| ShowSuccess
    ErrorDownload --> RetryDownload
    RetryDownload -->|Yes| GenerateURL
    RetryDownload -->|No| DownloadFailed
    ShowSuccess --> ShowInstructions
    ShowInstructions --> VendorChoice
    VendorChoice -->|Fill Offline| FillOffline
    VendorChoice -->|Upload Now| GoToUpload
    VendorChoice -->|Help| ShowHelp
    GoToUpload --> ContinueUpload
    ShowHelp --> HelpEnd

    style Start fill:#e3f2fd
    style ShowSuccess fill:#c8e6c9
    style FillOffline fill:#c8e6c9
    style ContinueUpload fill:#c8e6c9
    style HelpEnd fill:#c8e6c9
    style DownloadFailed fill:#ffcdd2
    style ErrorDownload fill:#ffcdd2
```

---

## 4. Supporting Flows

### 4.1 Auto-Save Mechanism

```mermaid
sequenceDiagram
    participant V as Vendor Browser
    participant F as Frontend
    participant T as Timer
    participant A as API
    participant C as Cache
    participant D as Database

    V->>F: Enter price value
    F->>F: Update local state
    F->>T: Reset 2-min timer

    Note over T: Timer running

    alt Timer expires
        T->>F: Trigger auto-save
        F->>A: Save draft request
        A->>C: Check save lock
        alt No active save
            C-->>A: OK to save
            A->>C: Set save lock
            A->>D: Save draft
            D-->>A: Success
            A->>C: Update cache
            A->>C: Release lock
            A-->>F: Save success
            F-->>V: Show saved indicator
        else Save in progress
            C-->>A: Locked
            A-->>F: Skip save
            F->>T: Reset timer
        end
    end

    alt Manual save
        V->>F: Click Save Draft
        F->>A: Manual save
        A->>D: Save draft
        D-->>A: Success
        A-->>F: Success
        F-->>V: Show saved message
    end

    alt Field change
        V->>F: Enter new value
        F->>F: Update state
        F->>T: Reset timer
    end
```

### 4.2 Validation Flow

```mermaid
flowchart TD
    Start([Validation Triggered])
    TriggerType{Validation Type}
    FieldValidation[Field-Level Validation]
    DraftValidation[Draft Validation]
    FinalValidation[Final Submission Validation]
    ValidateField[Validate Single Field]
    FieldValid{Field Valid?}
    ShowFieldError[Show Inline Error]
    ClearFieldError[Clear Error]
    FieldInvalid([Field Invalid])
    FieldOK([Field Valid])
    ValidateRequired[Check Required Fields]
    ValidateTypes[Validate Data Types]
    ValidateRanges[Validate Ranges]
    DraftValid{Draft Valid?}
    LogDraftErrors[Log Errors]
    SaveDraft[Save Draft]
    DraftSaved([Draft Saved])
    ValidateAllRequired[Validate All Required]
    RequiredOK{All Present?}
    CollectRequired[Collect Missing Fields]
    ReturnErrors1[Return Errors]
    ValidateBusiness[Validate Business Rules]
    CheckMOQOrder[Check MOQ Order]
    CheckPriceLogic[Check Price Logic]
    CheckDates[Check Date Logic]
    CheckConsistency[Check Consistency]
    BusinessOK{Rules Pass?}
    CollectBRErrors[Collect Rule Violations]
    ReturnErrors2[Return Errors]
    CalculateQuality[Calculate Quality Score]
    CalcCompleteness[Completeness 40 percent]
    CalcAccuracy[Accuracy 30 percent]
    CalcDetail[Detail 20 percent]
    CalcTimeliness[Timeliness 10 percent]
    CombineScores[Combine Weighted Scores]
    NormalizeScore[Normalize to 0-100]
    SaveQualityScore[Save Quality Score]
    ValidationSuccess[Validation Successful]
    ReadySubmit([Ready for Submission])
    ValidationFailed([Validation Failed])

    Start --> TriggerType
    TriggerType -->|Field Edit| FieldValidation
    TriggerType -->|Auto-Save| DraftValidation
    TriggerType -->|Submission| FinalValidation

    FieldValidation --> ValidateField
    ValidateField --> FieldValid
    FieldValid -->|No| ShowFieldError
    FieldValid -->|Yes| ClearFieldError
    ShowFieldError --> FieldInvalid
    ClearFieldError --> FieldOK

    DraftValidation --> ValidateRequired
    ValidateRequired --> ValidateTypes
    ValidateTypes --> ValidateRanges
    ValidateRanges --> DraftValid
    DraftValid -->|No| LogDraftErrors
    DraftValid -->|Yes| SaveDraft
    LogDraftErrors --> SaveDraft
    SaveDraft --> DraftSaved

    FinalValidation --> ValidateAllRequired
    ValidateAllRequired --> RequiredOK
    RequiredOK -->|No| CollectRequired
    RequiredOK -->|Yes| ValidateBusiness
    CollectRequired --> ReturnErrors1
    ReturnErrors1 --> ValidationFailed

    ValidateBusiness --> CheckMOQOrder
    CheckMOQOrder --> CheckPriceLogic
    CheckPriceLogic --> CheckDates
    CheckDates --> CheckConsistency
    CheckConsistency --> BusinessOK
    BusinessOK -->|No| CollectBRErrors
    BusinessOK -->|Yes| CalculateQuality
    CollectBRErrors --> ReturnErrors2
    ReturnErrors2 --> ValidationFailed

    CalculateQuality --> CalcCompleteness
    CalcCompleteness --> CalcAccuracy
    CalcAccuracy --> CalcDetail
    CalcDetail --> CalcTimeliness
    CalcTimeliness --> CombineScores
    CombineScores --> NormalizeScore
    NormalizeScore --> SaveQualityScore
    SaveQualityScore --> ValidationSuccess
    ValidationSuccess --> ReadySubmit

    style Start fill:#e3f2fd
    style FieldOK fill:#c8e6c9
    style DraftSaved fill:#c8e6c9
    style ReadySubmit fill:#c8e6c9
    style FieldInvalid fill:#fff9c4
    style ValidationFailed fill:#ffcdd2
    style ShowFieldError fill:#ffcdd2
    style ReturnErrors1 fill:#ffcdd2
    style ReturnErrors2 fill:#ffcdd2
```

### 4.3 Quality Score Calculation

```mermaid
flowchart TD
    Start([Calculate Quality Score])
    LoadPricelist[Load Pricelist Data]
    CountFields[Count Total Fields]
    CountFilled[Count Filled Fields]
    CalcCompleteness[Completeness = Filled / Total]
    WeightCompleteness[Apply 40 percent Weight]
    CheckValidation[Check for Validation Errors]
    CheckPriceReasonable[Check Price Reasonableness]
    CalcAccuracy[Accuracy Score]
    WeightAccuracy[Apply 30 percent Weight]
    CountMOQTiers[Count MOQ Tiers Present]
    CountFOC[Count FOC Quantities]
    CountNotes[Count Notes Added]
    CalcDetail[Detail Score]
    WeightDetail[Apply 20 percent Weight]
    GetDeadline[Get Campaign Deadline]
    GetSubmitDate[Get Submission Date]
    CalcDaysEarly[Calculate Days Early]
    CalcTimeliness[Timeliness Score]
    WeightTimeliness[Apply 10 percent Weight]
    SumScores[Sum Weighted Scores]
    NormalizeScore[Normalize to 0-100]
    SaveScore[Save Quality Score]
    ReturnScore([Return Quality Score])

    Start --> LoadPricelist
    LoadPricelist --> CountFields
    CountFields --> CountFilled
    CountFilled --> CalcCompleteness
    CalcCompleteness --> WeightCompleteness
    WeightCompleteness --> CheckValidation
    CheckValidation --> CheckPriceReasonable
    CheckPriceReasonable --> CalcAccuracy
    CalcAccuracy --> WeightAccuracy
    WeightAccuracy --> CountMOQTiers
    CountMOQTiers --> CountFOC
    CountFOC --> CountNotes
    CountNotes --> CalcDetail
    CalcDetail --> WeightDetail
    WeightDetail --> GetDeadline
    GetDeadline --> GetSubmitDate
    GetSubmitDate --> CalcDaysEarly
    CalcDaysEarly --> CalcTimeliness
    CalcTimeliness --> WeightTimeliness
    WeightTimeliness --> SumScores
    SumScores --> NormalizeScore
    NormalizeScore --> SaveScore
    SaveScore --> ReturnScore

    style Start fill:#e3f2fd
    style ReturnScore fill:#c8e6c9
```

---

## 5. System Automation

### 5.1 Token Expiration Checker

```mermaid
flowchart TD
    Start([Daily Job 0000 UTC])
    QueryInvitations[Query Active Invitations]
    ForEach{For Each Invitation}
    CheckExpiry{Token Expired?}
    CheckWarning{Expires in 24 Hours?}
    ExpireToken[Set Status to Expired]
    CheckWarningFlag{Warning Sent?}
    SendWarning[Send Expiry Warning Email]
    FlagWarning[Flag Warning Sent]
    UpdatePricelist{Has Draft?}
    MarkDraftExpired[Mark Draft as Expired]
    NotifyVendor[Send Expiration Email]
    UpdateProgress[Update Campaign Progress]
    LogExpiration[Log Expiration]
    Done[Process Next]
    JobComplete([Job Complete])

    Start --> QueryInvitations
    QueryInvitations --> ForEach
    ForEach -->|Invitation| CheckExpiry
    ForEach -->|Done| JobComplete
    CheckExpiry -->|No| CheckWarning
    CheckExpiry -->|Yes| ExpireToken
    CheckWarning -->|No| Done
    CheckWarning -->|Yes| CheckWarningFlag
    CheckWarningFlag -->|Yes| Done
    CheckWarningFlag -->|No| SendWarning
    SendWarning --> FlagWarning
    FlagWarning --> Done
    ExpireToken --> UpdatePricelist
    UpdatePricelist -->|Yes| MarkDraftExpired
    UpdatePricelist -->|No| NotifyVendor
    MarkDraftExpired --> NotifyVendor
    NotifyVendor --> UpdateProgress
    UpdateProgress --> LogExpiration
    LogExpiration --> Done
    Done --> ForEach

    style Start fill:#e3f2fd
    style JobComplete fill:#c8e6c9
```

### 5.2 Submission Confirmation Email Flow

```mermaid
flowchart TD
    Start([Pricelist Submitted])
    LoadVendorData[Load Vendor Details]
    LoadPricelistData[Load Pricelist Summary]
    LoadCampaignData[Load Campaign Details]
    SelectTemplate[Select Email Template]
    MergeData[Merge Template with Data]
    PersonalizeEmail[Personalize for Vendor]
    ComposeEmail[Compose Email]
    ValidateEmail{Email Valid?}
    LogError[Log Email Error]
    SendEmail[Send Email]
    TrackDelivery[Track Delivery Status]
    DeliveryStatus{Delivered?}
    UpdateSent[Update Sent Timestamp]
    RetryAttempt{Retry Count < 3?}
    WaitRetry[Wait 5 Minutes]
    MarkFailed[Mark Email Failed]
    NotifyAdmin[Notify Admin]
    LogSuccess[Log Email Sent]
    SendStaffNotification[Send Staff Notification]
    EmailComplete([Email Process Complete])
    EmailFailed([Email Failed])

    Start --> LoadVendorData
    LoadVendorData --> LoadPricelistData
    LoadPricelistData --> LoadCampaignData
    LoadCampaignData --> SelectTemplate
    SelectTemplate --> MergeData
    MergeData --> PersonalizeEmail
    PersonalizeEmail --> ComposeEmail
    ComposeEmail --> ValidateEmail
    ValidateEmail -->|No| LogError
    ValidateEmail -->|Yes| SendEmail
    LogError --> EmailFailed
    SendEmail --> TrackDelivery
    TrackDelivery --> DeliveryStatus
    DeliveryStatus -->|Yes| UpdateSent
    DeliveryStatus -->|No| RetryAttempt
    UpdateSent --> LogSuccess
    RetryAttempt -->|Yes| WaitRetry
    RetryAttempt -->|No| MarkFailed
    WaitRetry --> SendEmail
    MarkFailed --> NotifyAdmin
    NotifyAdmin --> EmailFailed
    LogSuccess --> SendStaffNotification
    SendStaffNotification --> EmailComplete

    style Start fill:#e3f2fd
    style EmailComplete fill:#c8e6c9
    style EmailFailed fill:#ffcdd2
    style LogError fill:#ffcdd2
    style MarkFailed fill:#ffcdd2
```

---

## Appendices

### Appendix A: Related Module Documentation

| Module | Documentation Path | Related Flows |
|--------|-------------------|---------------|
| Requests for Pricing | `../requests-for-pricing/` | Campaign creation, vendor invitation flows |
| Pricelist Templates | `../pricelist-templates/` | Template creation flows |
| Price Lists | `../price-lists/` | Pricelist viewing flows |
| Vendor Directory | `../vendor-directory/` | Vendor profile flows |

### Appendix B: Diagram Legend

**Colors**:
- Green: Success paths, completed states
- Red: Error paths, failure states
- Blue: Normal processes, start points
- Yellow: Warnings, pending actions, drafts

**Shapes**:
- Rectangle: Process step
- Diamond: Decision point
- Rounded Rectangle: Start/End point
- Cylinder: Database operation

### Appendix C: Workflow Summary

| ID | Workflow Name | Primary Actor | Section |
|----|---------------|---------------|---------|
| FD-006 | Access Portal via Token | Vendor | 3.1 |
| FD-007 | Submit Prices Online | Vendor | 3.2 |
| FD-008 | Upload Excel Pricelist | Vendor | 3.3 |
| FD-009 | Download Excel Template | Vendor | 3.4 |
| FD-INT-01 | Auto-Save Mechanism | System | 4.1 |
| FD-INT-02 | Validation Flow | System | 4.2 |
| FD-INT-03 | Quality Score Calculation | System | 4.3 |
| FD-JOB-01 | Token Expiration Checker | System | 5.1 |
| FD-JOB-02 | Submission Confirmation Email | System | 5.2 |

**Note**: Staff-side flows (campaign creation, template creation, vendor invitation, pricelist viewing) are documented in their respective module documentation.

---

**Document End**

**Implementation Notes**:
- This document covers ONLY vendor-facing portal flows
- Staff-side flows are in separate modules
- No approval workflow - pricelists become active immediately upon submission
- All diagrams use Mermaid 8.8.2 compatible syntax
