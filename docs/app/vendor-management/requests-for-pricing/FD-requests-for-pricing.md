# Requests for Pricing (Price Collection Campaigns) - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Vendor Management > Requests for Pricing
- **Version**: 2.0.0
- **Last Updated**: 2025-11-26
- **Document Status**: Updated
- **Mermaid Version**: 8.8.2

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code; Removed fictional RFQ features (bidding, evaluation, awards, contracts); Updated to reflect Price Collection Campaign functionality; Updated mermaid syntax to 8.8.2 |
| 1.0 | 2024-01-15 | System | Initial flow diagrams document |

---

## 1. Introduction

This document provides visual representations of workflows and processes in the Requests for Pricing module using Mermaid 8.8.2 diagrams. These diagrams illustrate the flow of operations for price collection campaigns, from creation through vendor invitation and progress tracking.

The module enables procurement staff to create pricing collection campaigns, invite vendors to submit pricing, and track submission progress.

---

## 2. System Architecture Diagram

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph Frontend['Frontend Layer']
        UI[Next.js UI Components]
        Wizard[4-Step Campaign Wizard]
        Forms[React Hook Form + Zod]
        State[Zustand + React Query]
    end

    subgraph Application['Application Layer']
        Pages[Server Components]
        Actions[Server Actions]
        API[Route Handlers]
    end

    subgraph Business['Business Logic Layer']
        Auth[Authentication Service]
        Validation[Validation Service]
        Campaign[Campaign Service]
        Progress[Progress Tracking Service]
        Reminder[Reminder Service]
        Notification[Notification Service]
    end

    subgraph Data['Data Layer']
        MockData[Mock Data Layer]
        Types[TypeScript Interfaces]
    end

    UI --> Pages
    Wizard --> Actions
    Forms --> Actions
    State --> Actions
    Pages --> Actions
    Pages --> API
    Actions --> Auth
    Actions --> Validation
    Actions --> Campaign
    Actions --> Progress
    Actions --> Reminder
    Actions --> Notification
    Actions --> MockData
    MockData --> Types
```

---

## 3. Campaign Lifecycle State Diagram

### 3.1 Campaign Status States

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Campaign

    Draft --> Active: Launch
    Draft --> Cancelled: Cancel

    Active --> Paused: Pause
    Active --> Completed: Complete
    Active --> Cancelled: Cancel

    Paused --> Active: Resume
    Paused --> Cancelled: Cancel

    Completed --> [*]
    Cancelled --> [*]
```

### 3.2 Status Transitions with Actions

```mermaid
flowchart LR
    D[Draft] -->|Launch Campaign| A[Active]
    D -->|Cancel| X[Cancelled]

    A -->|Pause Campaign| P[Paused]
    A -->|All Complete| C[Completed]
    A -->|Cancel| X

    P -->|Resume Campaign| A
    P -->|Cancel| X
```

---

## 4. Core Workflows

### 4.1 Campaign List Workflow (FR-RFP-001)

```mermaid
flowchart TD
    Start([User Accesses Campaigns]) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| Login[Redirect to Login]
    CheckAuth -->|Yes| LoadList[Load Campaign List]

    LoadList --> ApplyFilters[Apply Default Filters]
    ApplyFilters --> DisplayList[Display Campaigns]

    DisplayList --> UserAction{User Action?}

    UserAction -->|Search| EnterSearch[Enter Search Term]
    EnterSearch --> FilterBySearch[Filter by Name/Description]
    FilterBySearch --> DisplayList

    UserAction -->|Filter Status| SelectStatus[Select Status Filter]
    SelectStatus --> FilterByStatus[Filter by Status]
    FilterByStatus --> DisplayList

    UserAction -->|Toggle View| ChangeView[Switch Table/Card View]
    ChangeView --> DisplayList

    UserAction -->|Create New| NavigateCreate[Go to Create Page]
    NavigateCreate --> End([End])

    UserAction -->|View Campaign| NavigateDetail[Go to Detail Page]
    NavigateDetail --> End

    UserAction -->|Actions Menu| ShowActions[Show Dropdown Menu]
    ShowActions --> ActionChoice{Action Choice?}

    ActionChoice -->|View| NavigateDetail
    ActionChoice -->|Edit| NavigateEdit[Go to Edit Page]
    ActionChoice -->|Duplicate| DuplicateCampaign[Create Copy]
    ActionChoice -->|Export| ExportData[Download Data]
    ActionChoice -->|Delete| ConfirmDelete[Show Confirmation]

    NavigateEdit --> End
    DuplicateCampaign --> DisplayList
    ExportData --> DisplayList

    ConfirmDelete --> DeleteConfirm{Confirm?}
    DeleteConfirm -->|Yes| DeleteCampaign[Delete Campaign]
    DeleteConfirm -->|No| DisplayList
    DeleteCampaign --> DisplayList

    Login --> End
```

### 4.2 Campaign Creation Wizard Workflow (FR-RFP-002)

```mermaid
flowchart TD
    Start([User Clicks Create]) --> CheckPerm{Has Permission?}
    CheckPerm -->|No| PermError[Show Permission Error]
    PermError --> End([End])

    CheckPerm -->|Yes| Step1[Step 1: Basic Information]

    Step1 --> EnterBasic[Enter Campaign Details]
    EnterBasic --> BasicFields[Name, Description, Priority, Dates]
    BasicFields --> ValidateStep1{Valid?}
    ValidateStep1 -->|No| ShowErrors1[Show Validation Errors]
    ShowErrors1 --> EnterBasic

    ValidateStep1 -->|Yes| Step2[Step 2: Template Selection]

    Step2 --> CheckURLParam{Template in URL?}
    CheckURLParam -->|Yes| PreSelect[Pre-select Template]
    CheckURLParam -->|No| ShowTemplates[Display Available Templates]
    PreSelect --> ShowTemplates

    ShowTemplates --> SelectTemplate[User Selects Template]
    SelectTemplate --> ValidateStep2{Template Selected?}
    ValidateStep2 -->|No| ShowErrors2[Show Selection Required]
    ShowErrors2 --> ShowTemplates

    ValidateStep2 -->|Yes| Step3[Step 3: Vendor Selection]

    Step3 --> SearchVendors[Search/Filter Vendors]
    SearchVendors --> DisplayVendors[Display Vendor List]
    DisplayVendors --> SelectVendors[Select Vendors]
    SelectVendors --> BulkActions{Bulk Action?}

    BulkActions -->|Select All| SelectAllFiltered[Select All Filtered]
    BulkActions -->|Deselect All| ClearSelection[Clear Selection]
    BulkActions -->|Individual| ToggleVendor[Toggle Vendor Selection]

    SelectAllFiltered --> DisplayVendors
    ClearSelection --> DisplayVendors
    ToggleVendor --> DisplayVendors

    DisplayVendors --> ValidateStep3{At Least 1 Vendor?}
    ValidateStep3 -->|No| ShowErrors3[Show Minimum Vendor Error]
    ShowErrors3 --> DisplayVendors

    ValidateStep3 -->|Yes| Step4[Step 4: Review & Launch]

    Step4 --> ReviewSummary[Display Campaign Summary]
    ReviewSummary --> ReviewBasic[Review Basic Info]
    ReviewBasic --> ReviewTemplate[Review Template]
    ReviewTemplate --> ReviewVendors[Review Selected Vendors]
    ReviewVendors --> ReviewSettings[Review Settings]

    ReviewSettings --> UserDecision{User Decision?}

    UserDecision -->|Edit Previous| GoBack[Navigate to Previous Step]
    GoBack --> Step1

    UserDecision -->|Launch Campaign| LaunchCampaign[Launch Campaign]
    LaunchCampaign --> CreateCampaign[Create Campaign Record]
    CreateCampaign --> SetActive[Set Status: Active]
    SetActive --> SendInvitations[Send Vendor Invitations]
    SendInvitations --> Success[Show Success Message]
    Success --> NavigateDetail[Go to Campaign Detail]
    NavigateDetail --> End
```

### 4.3 Campaign Detail View Workflow (FR-RFP-005)

```mermaid
flowchart TD
    Start([User Opens Campaign]) --> LoadCampaign[Load Campaign Data]
    LoadCampaign --> DisplayHeader[Display Header with Status]

    DisplayHeader --> DefaultTab[Show Overview Tab]

    DefaultTab --> TabChoice{Tab Selection?}

    TabChoice -->|Overview| OverviewTab[Overview Tab]
    OverviewTab --> ShowDetails[Campaign Details Card]
    ShowDetails --> ShowMetrics[Performance Summary Card]
    ShowMetrics --> TabChoice

    TabChoice -->|Vendors| VendorsTab[Vendors Tab]
    VendorsTab --> LoadVendors[Load Vendor Status List]
    LoadVendors --> DisplayVendorTable[Display Vendor Table]
    DisplayVendorTable --> VendorAction{Vendor Action?}

    VendorAction -->|Send Reminder| CheckVendorStatus{Vendor Completed?}
    CheckVendorStatus -->|Yes| DisabledReminder[Reminder Disabled]
    CheckVendorStatus -->|No| SendReminder[Send Reminder Email]
    SendReminder --> DisplayVendorTable
    DisabledReminder --> DisplayVendorTable

    VendorAction -->|View Progress| ShowProgress[Show Progress Bar]
    ShowProgress --> DisplayVendorTable

    DisplayVendorTable --> TabChoice

    TabChoice -->|Settings| SettingsTab[Settings Tab]
    SettingsTab --> ShowPortalSettings[Portal Access Duration]
    ShowPortalSettings --> ShowSubmissionMethods[Submission Methods]
    ShowSubmissionMethods --> ShowApproval[Approval Settings]
    ShowApproval --> ShowReminders[Reminder Schedule]
    ShowReminders --> ShowEscalation[Escalation Rules]
    ShowEscalation --> TabChoice

    TabChoice -->|Header Action| HeaderAction{Header Action?}

    HeaderAction -->|Duplicate| DuplicateCampaign[Create Copy]
    DuplicateCampaign --> End([End])

    HeaderAction -->|Edit| CheckEditPerm{Can Edit?}
    CheckEditPerm -->|Yes - Draft| NavigateEdit[Go to Edit Page]
    CheckEditPerm -->|No - Active| ShowReadOnly[Show as Read-Only]
    NavigateEdit --> End
    ShowReadOnly --> TabChoice
```

### 4.4 Vendor Selection Workflow (FR-RFP-010)

```mermaid
flowchart TD
    Start([Vendor Selection Step]) --> LoadVendors[Load Vendor List]
    LoadVendors --> DisplayAll[Display All Vendors]

    DisplayAll --> SearchAction{Search?}
    SearchAction -->|Yes| EnterSearch[Enter Search Term]
    EnterSearch --> FilterSearch[Filter by Name/Email/Company]
    FilterSearch --> DisplayFiltered[Display Filtered Results]
    SearchAction -->|No| DisplayFiltered

    DisplayFiltered --> StatusFilter{Status Filter?}
    StatusFilter -->|All| ShowAll[Show All Statuses]
    StatusFilter -->|Active| ShowActive[Show Active Only]
    StatusFilter -->|Inactive| ShowInactive[Show Inactive Only]
    StatusFilter -->|Pending| ShowPending[Show Pending Only]

    ShowAll --> DisplayVendors[Display Vendor Cards]
    ShowActive --> DisplayVendors
    ShowInactive --> DisplayVendors
    ShowPending --> DisplayVendors

    DisplayVendors --> SelectAction{Selection Action?}

    SelectAction -->|Select Individual| ToggleVendor[Toggle Vendor Checkbox]
    ToggleVendor --> UpdateCount[Update Selection Count]
    UpdateCount --> DisplayVendors

    SelectAction -->|Select All Filtered| SelectAll[Select All Visible]
    SelectAll --> UpdateCount

    SelectAction -->|Deselect All| ClearAll[Clear All Selections]
    ClearAll --> UpdateCount

    SelectAction -->|Proceed| CheckMinimum{Count >= 1?}
    CheckMinimum -->|No| ShowError[Show Minimum Error]
    ShowError --> DisplayVendors

    CheckMinimum -->|Yes| ShowSummary[Show Selection Summary]
    ShowSummary --> Proceed[Proceed to Next Step]
    Proceed --> End([End])
```

### 4.5 Progress Tracking Workflow (FR-RFP-006)

```mermaid
flowchart TD
    Start([View Campaign Progress]) --> LoadProgress[Load Progress Data]

    LoadProgress --> CalculateMetrics[Calculate Metrics]
    CalculateMetrics --> CompletionRate[Completion Rate]
    CompletionRate --> ResponseRate[Response Rate]
    ResponseRate --> AvgTime[Average Response Time]

    AvgTime --> DisplayOverview[Display Progress Overview]

    DisplayOverview --> ShowMetricCards[Show Metric Cards]
    ShowMetricCards --> TotalCard[Total Vendors]
    TotalCard --> RespondedCard[Responded Vendors]
    RespondedCard --> CompletedCard[Completed Submissions]
    CompletedCard --> PendingCard[Pending Submissions]

    PendingCard --> ShowProgressBar[Show Overall Progress Bar]
    ShowProgressBar --> ShowVendorList[Show Vendor Status List]

    ShowVendorList --> VendorRow{For Each Vendor}
    VendorRow --> ShowVendorStatus[Show Status Badge]
    ShowVendorStatus --> ShowVendorProgress[Show Individual Progress]
    ShowVendorProgress --> ShowLastActivity[Show Last Activity Time]
    ShowLastActivity --> NextVendor{More Vendors?}
    NextVendor -->|Yes| VendorRow
    NextVendor -->|No| End([End])
```

---

## 5. Data Flow Diagrams

### 5.1 Campaign Creation Data Flow

```mermaid
flowchart LR
    User[User] -->|Input| Wizard[Campaign Wizard]
    Wizard -->|Step Data| Validation[Zod Validation]
    Validation -->|Valid| Action[Server Action]
    Validation -->|Invalid| Wizard

    Action -->|Build Campaign| Builder[Campaign Builder]
    Builder -->|Basic Info| BasicHandler[Basic Info Handler]
    Builder -->|Template| TemplateHandler[Template Handler]
    Builder -->|Vendors| VendorHandler[Vendor Handler]
    Builder -->|Settings| SettingsHandler[Settings Handler]

    BasicHandler -->|Validated| Storage[Data Storage]
    TemplateHandler -->|Validated| Storage
    VendorHandler -->|Validated| Storage
    SettingsHandler -->|Validated| Storage

    Storage -->|Save| MockData[Mock Data Store]
    MockData -->|Success| Cache[React Query Cache]
    Cache -->|Refresh| UI[Update UI]

    Action -->|Error| ErrorHandler[Error Handler]
    ErrorHandler -->|Display| Wizard
```

### 5.2 Campaign List Data Flow

```mermaid
flowchart LR
    Page[Campaign List Page] -->|Load| DataFetch[Data Fetching]
    DataFetch -->|Query| MockData[Mock Data]
    MockData -->|Return| CampaignArray[Campaign Array]

    CampaignArray -->|Filter| SearchFilter[Search Filter]
    SearchFilter -->|Filter| StatusFilter[Status Filter]
    StatusFilter -->|Result| FilteredData[Filtered Campaigns]

    FilteredData -->|Render| ViewCheck{View Mode?}
    ViewCheck -->|Table| TableView[Table Component]
    ViewCheck -->|Card| CardView[Card Grid Component]

    TableView -->|Display| UI[User Interface]
    CardView -->|Display| UI

    UI -->|User Action| ActionHandler[Action Handler]
    ActionHandler -->|Navigate| Router[Next.js Router]
    ActionHandler -->|Mutate| DataFetch
```

### 5.3 Vendor Selection Data Flow

```mermaid
flowchart TB
    Step3[Vendor Selection Step] -->|Load| VendorData[Vendor Data Source]
    VendorData -->|Return| VendorList[Vendor List]

    VendorList -->|State| SelectionState[Selection State]
    SelectionState -->|selectedVendors| SelectedArray[Selected Vendor IDs]

    SearchInput[Search Input] -->|onChange| SearchState[Search State]
    SearchState -->|Filter| FilterLogic[Filter Logic]

    StatusSelect[Status Dropdown] -->|onChange| StatusState[Status Filter State]
    StatusState -->|Filter| FilterLogic

    VendorList -->|Input| FilterLogic
    FilterLogic -->|Output| FilteredVendors[Filtered Vendors]

    FilteredVendors -->|Render| VendorCards[Vendor Cards]
    VendorCards -->|Click| ToggleSelection[Toggle Selection]
    ToggleSelection -->|Update| SelectionState

    BulkSelect[Bulk Select Button] -->|Click| SelectAllFiltered[Select All Filtered]
    SelectAllFiltered -->|Update| SelectionState

    SelectionState -->|Count| SelectionSummary[Selection Summary]
    SelectionSummary -->|Display| UI[User Interface]
```

---

## 6. UI Navigation Flows

### 6.1 Campaign Module Navigation

```mermaid
flowchart TD
    Sidebar[Sidebar Menu] -->|Click| VendorMgmt[Vendor Management]
    VendorMgmt -->|Expand| RFPLink[Requests for Pricing]
    RFPLink -->|Click| ListPage[Campaign List Page]

    ListPage -->|Create Button| CreatePage[Create Campaign Page]
    ListPage -->|Row Click| DetailPage[Campaign Detail Page]
    ListPage -->|Edit Action| EditPage[Edit Campaign Page]

    CreatePage -->|Cancel| ListPage
    CreatePage -->|Success| DetailPage

    DetailPage -->|Back| ListPage
    DetailPage -->|Duplicate| CreatePage
    DetailPage -->|Edit| EditPage

    EditPage -->|Cancel| DetailPage
    EditPage -->|Save| DetailPage
```

### 6.2 Campaign Create Wizard Navigation

```mermaid
flowchart LR
    Step1[Step 1\nBasic Info] -->|Next| Step2[Step 2\nTemplate]
    Step2 -->|Next| Step3[Step 3\nVendors]
    Step3 -->|Next| Step4[Step 4\nReview]

    Step2 -->|Previous| Step1
    Step3 -->|Previous| Step2
    Step4 -->|Previous| Step3

    Step4 -->|Launch| Success[Success]
    Success -->|Navigate| Detail[Detail Page]

    Step1 -->|Cancel| List[List Page]
    Step2 -->|Cancel| List
    Step3 -->|Cancel| List
    Step4 -->|Cancel| List
```

### 6.3 Campaign Detail Tabs Navigation

```mermaid
flowchart LR
    DetailPage[Campaign Detail] --> TabBar[Tab Bar]

    TabBar -->|Click| Overview[Overview Tab]
    TabBar -->|Click| Vendors[Vendors Tab]
    TabBar -->|Click| Settings[Settings Tab]

    Overview -->|Default| Content1[Campaign Details\nPerformance Summary]
    Vendors -->|Active| Content2[Vendor List\nStatus & Progress]
    Settings -->|Active| Content3[All Settings\nReminder Schedule]

    Content1 --> TabBar
    Content2 --> TabBar
    Content3 --> TabBar
```

---

## 7. Action Workflows

### 7.1 Duplicate Campaign Workflow

```mermaid
flowchart TD
    Start([Click Duplicate]) --> LoadCampaign[Load Original Campaign]
    LoadCampaign --> CopyData[Copy Campaign Data]
    CopyData --> ModifyName[Add ' (Copy)' to Name]
    ModifyName --> ResetStatus[Set Status: Draft]
    ResetStatus --> ResetProgress[Reset Progress Metrics]
    ResetProgress --> CreateNew[Create New Campaign]
    CreateNew --> ShowToast[Show Success Toast]
    ShowToast --> NavigateNew[Navigate to New Campaign]
    NavigateNew --> End([End])
```

### 7.2 Send Reminder Workflow

```mermaid
flowchart TD
    Start([Click Send Reminder]) --> CheckVendorStatus{Vendor Status?}

    CheckVendorStatus -->|Completed| ShowDisabled[Button Disabled]
    ShowDisabled --> End([End])

    CheckVendorStatus -->|Pending/InProgress| LoadVendor[Load Vendor Data]
    LoadVendor --> PrepareEmail[Prepare Reminder Email]
    PrepareEmail --> SendEmail[Send Email]
    SendEmail --> UpdateRecord[Update Reminder Sent]
    UpdateRecord --> ShowToast[Show Success Toast]
    ShowToast --> RefreshList[Refresh Vendor List]
    RefreshList --> End
```

### 7.3 Delete Campaign Workflow

```mermaid
flowchart TD
    Start([Click Delete]) --> ShowDialog[Show Confirmation Dialog]
    ShowDialog --> UserChoice{User Choice?}

    UserChoice -->|Cancel| CloseDialog[Close Dialog]
    CloseDialog --> End([End])

    UserChoice -->|Confirm| DeleteCampaign[Delete Campaign]
    DeleteCampaign --> RefreshList[Refresh Campaign List]
    RefreshList --> ShowToast[Show Success Toast]
    ShowToast --> End
```

---

## 8. Settings Configuration Flows

### 8.1 Reminder Schedule Configuration

```mermaid
flowchart TD
    Start([Configure Reminders]) --> EnableToggle{Enable Reminders?}

    EnableToggle -->|No| DisableReminders[Disable All Reminders]
    DisableReminders --> End([End])

    EnableToggle -->|Yes| SetIntervals[Set Reminder Intervals]
    SetIntervals --> AddInterval[Add Days Before Deadline]
    AddInterval --> MoreIntervals{More Intervals?}
    MoreIntervals -->|Yes| AddInterval
    MoreIntervals -->|No| ValidateOrder{In Descending Order?}

    ValidateOrder -->|No| ShowError[Show Order Error]
    ShowError --> AddInterval

    ValidateOrder -->|Yes| ConfigEscalation{Enable Escalation?}

    ConfigEscalation -->|No| SaveSettings[Save Settings]

    ConfigEscalation -->|Yes| SetThreshold[Set Overdue Threshold]
    SetThreshold --> AddRecipients[Add Escalation Recipients]
    AddRecipients --> SaveSettings

    SaveSettings --> End
```

### 8.2 Recurring Pattern Configuration

```mermaid
flowchart TD
    Start([Configure Recurring]) --> SelectFrequency{Frequency?}

    SelectFrequency -->|Weekly| SetWeekly[Set Weekly Pattern]
    SetWeekly --> SelectDays[Select Days of Week]
    SelectDays --> SetInterval1[Set Week Interval]
    SetInterval1 --> SetEndCondition

    SelectFrequency -->|Monthly| SetMonthly[Set Monthly Pattern]
    SetMonthly --> SelectDayOfMonth[Select Day of Month]
    SelectDayOfMonth --> SetInterval2[Set Month Interval]
    SetInterval2 --> SetEndCondition

    SelectFrequency -->|Quarterly| SetQuarterly[Set Quarterly Pattern]
    SetQuarterly --> SelectDayQ[Select Day of Month]
    SelectDayQ --> SetInterval3[Set Quarter Interval]
    SetInterval3 --> SetEndCondition

    SelectFrequency -->|Annually| SetAnnually[Set Annual Pattern]
    SetAnnually --> SelectMonth[Select Month]
    SelectMonth --> SelectDayA[Select Day of Month]
    SelectDayA --> SetInterval4[Set Year Interval]
    SetInterval4 --> SetEndCondition

    SetEndCondition{End Condition?}
    SetEndCondition -->|End Date| SetEndDate[Set End Date]
    SetEndCondition -->|Max Occurrences| SetMaxOccur[Set Max Occurrences]
    SetEndCondition -->|No End| NoEnd[Leave Open-Ended]

    SetEndDate --> SavePattern[Save Pattern]
    SetMaxOccur --> SavePattern
    NoEnd --> SavePattern

    SavePattern --> End([End])
```

---

## 9. Integration Flow Diagrams

### 9.1 Template Integration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant TL as Template List
    participant TD as Template Detail
    participant CC as Campaign Create
    participant CL as Campaign List

    U->>TL: View Templates
    TL->>U: Display Template List
    U->>TD: Select Template
    TD->>U: Show Template Details
    U->>CC: Click "Create Request for Pricing"
    Note over CC: URL: /campaigns/new?templateId={id}
    CC->>CC: Pre-select Template (Step 2)
    U->>CC: Complete Wizard
    CC->>CL: Create Campaign
    CL->>U: Show Campaign in List
```

### 9.2 Vendor Directory Integration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CW as Campaign Wizard
    participant VS as Vendor Selection
    participant VD as Vendor Directory

    U->>CW: Start Campaign Creation
    CW->>VS: Navigate to Step 3
    VS->>VD: Query Vendors
    VD->>VS: Return Vendor List
    VS->>U: Display Vendors with Search/Filter
    U->>VS: Search by Name/Email
    VS->>VD: Filter Vendors
    VD->>VS: Return Filtered List
    VS->>U: Display Filtered Vendors
    U->>VS: Select Vendors
    VS->>CW: Store Selected Vendor IDs
    CW->>U: Proceed to Step 4
```

---

## 10. Error Handling Flows

### 10.1 Form Validation Error Flow

```mermaid
flowchart TD
    Start([User Submits Form]) --> Validate[Zod Validation]

    Validate --> CheckResult{Valid?}

    CheckResult -->|Yes| ProcessData[Process Data]
    ProcessData --> Success[Success Response]
    Success --> End([End])

    CheckResult -->|No| CollectErrors[Collect Validation Errors]
    CollectErrors --> MapToFields[Map Errors to Fields]
    MapToFields --> HighlightFields[Highlight Invalid Fields]
    HighlightFields --> ShowMessages[Show Error Messages]
    ShowMessages --> FocusFirst[Focus First Invalid Field]
    FocusFirst --> End
```

### 10.2 API Error Flow

```mermaid
flowchart TD
    Start([API Call]) --> TryRequest[Execute Request]

    TryRequest --> CheckResponse{Success?}

    CheckResponse -->|Yes| ReturnData[Return Data]
    ReturnData --> UpdateUI[Update UI]
    UpdateUI --> End([End])

    CheckResponse -->|No| CheckErrorType{Error Type?}

    CheckErrorType -->|Network| ShowNetworkError[Show Network Error Toast]
    CheckErrorType -->|Auth| RedirectLogin[Redirect to Login]
    CheckErrorType -->|Validation| ShowValidationError[Show Validation Errors]
    CheckErrorType -->|Server| ShowServerError[Show Server Error Toast]
    CheckErrorType -->|Unknown| ShowGenericError[Show Generic Error Toast]

    ShowNetworkError --> End
    RedirectLogin --> End
    ShowValidationError --> End
    ShowServerError --> End
    ShowGenericError --> End
```

---

## 11. Related Documents

- [BR-requests-for-pricing.md](./BR-requests-for-pricing.md) - Business Requirements v2.0.0
- [DD-requests-for-pricing.md](./DD-requests-for-pricing.md) - Data Definition
- [TS-requests-for-pricing.md](./TS-requests-for-pricing.md) - Technical Specification
- [UC-requests-for-pricing.md](./UC-requests-for-pricing.md) - Use Cases
- [VAL-requests-for-pricing.md](./VAL-requests-for-pricing.md) - Validations

---

**End of Flow Diagrams Document**
