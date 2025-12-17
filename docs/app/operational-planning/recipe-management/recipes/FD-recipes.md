# Recipe Management - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Operational Planning > Recipe Management > Recipes
- **Version**: 1.0
- **Last Updated**: 2024-01-15

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0 | 2024-01-15 | System | Initial flow diagrams document created for Recipe Management |

---

## 1. Create Recipe Workflow

```mermaid
flowchart TD
    Start([User clicks New Recipe]) --> OpenDialog[Open Create Dialog]
    OpenDialog --> InitForm[Initialize multi-tab form]
    InitForm --> BasicTab[Display Basic Information tab]

    BasicTab --> UserBasic{User enters<br>basic info}
    UserBasic -->|typing| ClientVal[Client-side validation]
    ClientVal --> ShowFeedback[Show validation feedback]
    ShowFeedback --> UserBasic

    UserBasic -->|clicks Ingredients tab| IngredientsTab[Navigate to Ingredients tab]
    IngredientsTab --> AddIngredient{User adds<br>ingredients}
    AddIngredient -->|Add Product| ProductSearch[Search product inventory]
    ProductSearch --> ProductSelect[Select product]
    ProductSelect --> LoadProductCost[Load product cost data]
    LoadProductCost --> EnterQuantity[Enter quantity and wastage]
    EnterQuantity --> CalcIngredientCost[Calculate ingredient cost]
    CalcIngredientCost --> UpdateRecipeCost[Update total recipe cost]
    UpdateRecipeCost --> AddIngredient

    AddIngredient -->|Add Recipe| RecipeSearch[Search existing recipes]
    RecipeSearch --> RecipeSelect[Select recipe]
    RecipeSelect --> CheckCircular{Check circular<br>dependency}
    CheckCircular -->|Circular detected| ShowCircularError[Show circular dependency error]
    ShowCircularError --> AddIngredient
    CheckCircular -->|Valid| CheckNesting{Check nesting<br>depth}
    CheckNesting -->|>3 levels| ShowDepthError[Show max depth error]
    ShowDepthError --> AddIngredient
    CheckNesting -->|Valid| LoadSubRecipeCost[Load sub-recipe cost]
    LoadSubRecipeCost --> EnterQuantity

    AddIngredient -->|clicks Preparation tab| PreparationTab[Navigate to Preparation tab]
    PreparationTab --> AddStep{User adds<br>preparation steps}
    AddStep -->|Add Step| StepForm[Enter step details]
    StepForm --> UploadMedia[Upload image/video optional]
    UploadMedia --> AddEquipment[Add equipment and techniques]
    AddEquipment --> AddStep

    AddStep -->|clicks Cost Analysis tab| CostTab[Navigate to Cost Analysis tab]
    CostTab --> ShowCostBreakdown[Display cost breakdown]
    ShowCostBreakdown --> AdjustPercentages{User adjusts<br>percentages}
    AdjustPercentages -->|Labor/Overhead| RecalcCosts[Recalculate all costs]
    RecalcCosts --> UpdateMargins[Update margins and suggested price]
    UpdateMargins --> ShowCostBreakdown

    AdjustPercentages -->|Set Selling Price| EnterPrice[Enter selling price]
    EnterPrice --> CalcFoodCost[Calculate actual food cost %]
    CalcFoodCost --> ValidateMargin{Margin meets<br>target?}
    ValidateMargin -->|No| ShowMarginWarning[Show margin warning]
    ShowMarginWarning --> AdjustPercentages
    ValidateMargin -->|Yes| ShowCostBreakdown

    AdjustPercentages -->|clicks Details tab| DetailsTab[Navigate to Details tab]
    DetailsTab --> ConfigureYield{Configure yield<br>variants?}
    ConfigureYield -->|Yes| EnableFractional[Enable fractional sales]
    EnableFractional --> SelectType[Select fractional sales type]
    SelectType --> AddVariants[Add yield variants]
    AddVariants --> SetConversion[Set conversion rates]
    SetConversion --> SetVariantPricing[Set variant pricing]
    SetVariantPricing --> SetDefaultVariant[Mark default variant]
    SetDefaultVariant --> ValidateVariants{Validate variant<br>pricing logic}
    ValidateVariants -->|Invalid| ShowVariantError[Show pricing logic error]
    ShowVariantError --> AddVariants
    ValidateVariants -->|Valid| AddAllergens

    ConfigureYield -->|No| AddAllergens[Add allergens and tags]
    AddAllergens --> SelectAllergens[Select allergens from list]
    SelectAllergens --> MarkMajorAllergens[Mark FDA major allergens]
    MarkMajorAllergens --> AddTags[Add tags with categories]
    AddTags --> UserSubmit{User clicks<br>Save/Publish}

    UserSubmit -->|Save as Draft| ValidateMinimum[Validate minimum requirements]
    ValidateMinimum -->|Invalid| ShowErrors[Show validation errors]
    ShowErrors --> UserBasic
    ValidateMinimum -->|Valid| CallCreateDraft[Call createRecipe action status=draft]
    CallCreateDraft --> ServerValDraft[Server-side validation]

    UserSubmit -->|Publish| ValidateComplete[Validate complete requirements]
    ValidateComplete -->|Invalid| ShowPublishErrors[Show publish validation errors]
    ShowPublishErrors --> UserBasic
    ValidateComplete -->|Valid| ConfirmPublish{User confirms<br>publish?}
    ConfirmPublish -->|No| UserBasic
    ConfirmPublish -->|Yes| CallCreatePublish[Call createRecipe action status=published]
    CallCreatePublish --> ServerValPublish[Server-side validation]

    ServerValDraft -->|Invalid| ReturnError[Return error response]
    ServerValPublish -->|Invalid| ReturnError
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserBasic

    ServerValDraft -->|Valid| CheckRecipeCode{Check recipe code<br>uniqueness}
    ServerValPublish -->|Valid| CheckRecipeCode
    CheckRecipeCode -->|Duplicate| DupCode[Return duplicate code error]
    DupCode --> DisplayError

    CheckRecipeCode -->|Unique| CheckRecipeName{Check recipe name<br>uniqueness}
    CheckRecipeName -->|Duplicate| DupName[Return duplicate name error]
    DupName --> DisplayError

    CheckRecipeName -->|Unique| BeginTransaction[Begin database transaction]
    BeginTransaction --> CreateRecipeRecord[INSERT recipe record]
    CreateRecipeRecord --> CreateIngredients[INSERT recipe ingredients]
    CreateIngredients --> CreateSteps[INSERT preparation steps]
    CreateSteps --> CreateVariants{Has yield<br>variants?}
    CreateVariants -->|Yes| InsertVariants[INSERT yield variants]
    CreateVariants -->|No| CreateAllergens
    InsertVariants --> CreateAllergens[INSERT allergens]
    CreateAllergens --> CreateTags[INSERT tags]
    CreateTags --> CheckPublished{Status =<br>published?}

    CheckPublished -->|Yes| CreateVersion[INSERT version snapshot]
    CreateVersion --> SetPublishedAt[SET published_at timestamp]
    SetPublishedAt --> CommitTransaction
    CheckPublished -->|No| CommitTransaction[Commit transaction]

    CommitTransaction --> Success{Success?}
    Success -->|No| Rollback[Rollback transaction]
    Rollback --> DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh recipe list]
    RefreshList --> HighlightNew[Highlight new recipe]
    HighlightNew --> End([End])

    style Start fill:#e1f5ff
    style CreateRecipeRecord fill:#fff4e1
    style CreateVersion fill:#e8f5e9
    style End fill:#e8f5e9
    style DisplayError fill:#ffebee
    style ShowCircularError fill:#ffebee
    style ShowDepthError fill:#ffebee
```

---

## 2. Edit Recipe Workflow

```mermaid
flowchart TD
    Start([User clicks Edit Recipe]) --> CheckDraft{Recipe status<br>= draft?}
    CheckDraft -->|Yes| FetchData[Fetch recipe with all related data]
    CheckDraft -->|No| CheckVersion{Create new<br>version?}
    CheckVersion -->|Yes| ConfirmVersion{User confirms<br>version creation}
    ConfirmVersion -->|No| End([End - Cancelled])
    ConfirmVersion -->|Yes| IncrementVersion[Increment version number]
    IncrementVersion --> CreateVersionSnapshot[Create version snapshot]
    CreateVersionSnapshot --> FetchData

    CheckVersion -->|No| FetchData
    FetchData --> LoadIngredients[Load ingredients list]
    LoadIngredients --> LoadSteps[Load preparation steps]
    LoadSteps --> LoadVariants[Load yield variants]
    LoadVariants --> LoadAllergens[Load allergens and tags]
    LoadAllergens --> OpenDialog[Open edit dialog]
    OpenDialog --> PreFillForm[Pre-fill all form tabs]

    PreFillForm --> UserMod{User modifies<br>any tab}
    UserMod -->|Basic Info| ValidateBasic[Validate basic fields]
    ValidateBasic --> RealTimeVal[Real-time validation]
    RealTimeVal --> UserMod

    UserMod -->|Add/Edit Ingredient| ModifyIngredient{Modify<br>ingredient}
    ModifyIngredient -->|Change Product| ProductSearch[Search new product]
    ProductSearch --> UpdateProductCost[Update cost data]
    UpdateProductCost --> RecalcAll[Recalculate all costs]
    RecalcAll --> UserMod

    ModifyIngredient -->|Change Recipe| CheckCircular{Check circular<br>dependency}
    CheckCircular -->|Circular| ShowCircularError[Show circular dependency error]
    ShowCircularError --> UserMod
    CheckCircular -->|Valid| UpdateSubRecipeCost[Update sub-recipe cost]
    UpdateSubRecipeCost --> RecalcAll

    ModifyIngredient -->|Change Quantity| RecalcIngredient[Recalculate ingredient cost]
    RecalcIngredient --> RecalcAll

    ModifyIngredient -->|Remove Ingredient| ConfirmRemove{Confirm<br>removal?}
    ConfirmRemove -->|No| UserMod
    ConfirmRemove -->|Yes| RemoveIngredient[Remove ingredient]
    RemoveIngredient --> RecalcAll

    UserMod -->|Add/Edit Step| ModifyStep[Modify preparation step]
    ModifyStep --> UploadNewMedia[Upload new media optional]
    UploadNewMedia --> UserMod

    UserMod -->|Adjust Costs| AdjustPercentages[Adjust labor/overhead %]
    AdjustPercentages --> RecalcCosts[Recalculate costs]
    RecalcCosts --> UpdateMargins[Update margins]
    UpdateMargins --> UserMod

    UserMod -->|Modify Variants| ModifyVariant{Modify<br>variant}
    ModifyVariant -->|Add Variant| AddVariant[Add new yield variant]
    AddVariant --> SetVariantData[Set conversion rate and pricing]
    SetVariantData --> ValidateVariantLogic{Validate pricing<br>logic}
    ValidateVariantLogic -->|Invalid| ShowVariantError[Show pricing error]
    ShowVariantError --> UserMod
    ValidateVariantLogic -->|Valid| UserMod

    ModifyVariant -->|Edit Variant| UpdateVariant[Update variant data]
    UpdateVariant --> RecalcVariantCost[Recalculate variant cost]
    RecalcVariantCost --> UserMod

    ModifyVariant -->|Delete Variant| CheckDefault{Is default<br>variant?}
    CheckDefault -->|Yes| ShowDefaultError[Cannot delete default variant]
    ShowDefaultError --> UserMod
    CheckDefault -->|No| RemoveVariant[Remove variant]
    RemoveVariant --> UserMod

    UserMod -->|clicks Save| CheckChanges{Any changes<br>made?}
    CheckChanges -->|No| InfoMsg[Show 'No changes' message]
    InfoMsg --> CloseNoSave[Close dialog]
    CloseNoSave --> End

    CheckChanges -->|Yes| ValidateAll[Validate all data]
    ValidateAll -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserMod

    ValidateAll -->|Valid| CheckStatus{Status changed<br>to published?}
    CheckStatus -->|Yes| ValidatePublish[Validate publish requirements]
    ValidatePublish -->|Invalid| ShowPublishError[Show publish validation errors]
    ShowPublishError --> UserMod
    ValidatePublish -->|Valid| CallUpdate[Call updateRecipe action]

    CheckStatus -->|No| CallUpdate
    CallUpdate --> ServerVal[Server validation]
    ServerVal -->|Invalid| ReturnError[Return error]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserMod

    ServerVal -->|Valid| CheckCodeChange{Recipe code<br>changed?}
    CheckCodeChange -->|Yes| ValidateCode[Check code uniqueness]
    ValidateCode -->|Duplicate| ReturnError
    ValidateCode -->|Unique| BeginTransaction

    CheckCodeChange -->|No| CheckNameChange{Recipe name<br>changed?}
    CheckNameChange -->|Yes| ValidateName[Check name uniqueness]
    ValidateName -->|Duplicate| ReturnError
    ValidateName -->|Unique| BeginTransaction

    CheckNameChange -->|No| BeginTransaction[Begin database transaction]
    BeginTransaction --> UpdateRecipe[UPDATE recipe record]
    UpdateRecipe --> UpdateIngredients[UPDATE/INSERT/DELETE ingredients]
    UpdateIngredients --> UpdateSteps[UPDATE/INSERT/DELETE steps]
    UpdateSteps --> UpdateVariants[UPDATE/INSERT/DELETE variants]
    UpdateVariants --> UpdateAllergens[UPDATE/INSERT/DELETE allergens]
    UpdateAllergens --> UpdateTags[UPDATE/INSERT/DELETE tags]
    UpdateTags --> RecalcFinalCosts[Recalculate final costs]
    RecalcFinalCosts --> CheckNewPublish{Status changed<br>to published?}

    CheckNewPublish -->|Yes| CreateNewVersion[INSERT new version snapshot]
    CreateNewVersion --> SetPublishedTimestamp[SET published_at]
    SetPublishedTimestamp --> CommitTransaction
    CheckNewPublish -->|No| CommitTransaction[Commit transaction]

    CommitTransaction --> Success{Success?}
    Success -->|No| Rollback[Rollback]
    Rollback --> DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh list]
    RefreshList --> HighlightUpdated[Highlight updated recipe]
    HighlightUpdated --> End

    style Start fill:#e1f5ff
    style UpdateRecipe fill:#fff4e1
    style CreateNewVersion fill:#e8f5e9
    style End fill:#e8f5e9
    style DisplayError fill:#ffebee
    style ShowCircularError fill:#ffebee
```

---

## 3. Delete Recipe Workflow

```mermaid
flowchart TD
    Start([User clicks Delete Recipe]) --> CheckStatus{Recipe<br>status?}
    CheckStatus -->|Published| BlockPublished[Show blocking error]
    BlockPublished --> ExplainArchive[Explain: Must archive before delete]
    ExplainArchive --> ShowArchiveButton[Show 'Archive Recipe' button]
    ShowArchiveButton --> End([End - Deletion Blocked])

    CheckStatus -->|Archived/Draft| CheckUsage{Check recipe<br>usage}
    CheckUsage --> CheckSubRecipe{Used as<br>sub-recipe?}
    CheckSubRecipe -->|Yes| CountUsage[Count recipes using this]
    CountUsage --> BlockSubRecipe[Show blocking error dialog]
    BlockSubRecipe --> ListUsingRecipes[List recipes using this as ingredient]
    ListUsingRecipes --> ShowActionsBlock[Show 'View Recipes' or 'Close']
    ShowActionsBlock --> End

    CheckSubRecipe -->|No| CheckMenus{Used in<br>active menus?}
    CheckMenus -->|Yes| BlockMenus[Show blocking error]
    BlockMenus --> ListMenus[List active menus using this]
    ListMenus --> ShowActionsMenus[Show 'View Menus' or 'Close']
    ShowActionsMenus --> End

    CheckMenus -->|No| CheckOrders{Has order<br>history?}
    CheckOrders -->|Yes| WarnOrders[Show warning dialog]
    WarnOrders --> ExplainHistory[Explain: Order history preserved]
    ExplainHistory --> ShowOrderCount[Show count of historical orders]
    ShowOrderCount --> RequireConfirm[Require confirmation checkbox]
    RequireConfirm --> UserDecision{User decision}
    UserDecision -->|Cancel| End
    UserDecision -->|Confirm| CallDelete[Call deleteRecipe action]

    CheckOrders -->|No| ConfirmDialog[Show confirmation dialog]
    ConfirmDialog --> UserConfirm{User confirms?}
    UserConfirm -->|No| End
    UserConfirm -->|Yes| CallDelete

    CallDelete --> ServerVal[Server-side validation]
    ServerVal --> RecheckUsage[Recheck all usage]
    RecheckUsage --> StillUsed{Still in<br>use?}
    StillUsed -->|Yes| ReturnBlockError[Return blocking error]
    ReturnBlockError --> ShowError[Show error toast]
    ShowError --> End

    StillUsed -->|No| BeginTransaction[Begin database transaction]
    BeginTransaction --> SoftDelete[SET deleted = true]
    SoftDelete --> UpdateTimestamp[SET updated_at, updated_by]
    UpdateTimestamp --> LogAudit[Log deletion in audit trail]
    LogAudit --> CommitTransaction[Commit transaction]

    CommitTransaction --> Success{Success?}
    Success -->|No| Rollback[Rollback]
    Rollback --> DBError[Database error]
    DBError --> ShowError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success message]
    ShowSuccess --> RefreshList[Refresh list]
    RefreshList --> RemoveRecipe[Remove deleted recipe from view]
    RemoveRecipe --> End

    style Start fill:#e1f5ff
    style BlockPublished fill:#ffebee
    style BlockSubRecipe fill:#ffebee
    style BlockMenus fill:#ffebee
    style WarnOrders fill:#fff9c4
    style SoftDelete fill:#fff4e1
    style End fill:#f5f5f5
```

---

## 4. Cost Calculation Workflow

```mermaid
flowchart TD
    Start([Cost Calculation Triggered]) --> TriggerSource{Trigger<br>source?}

    TriggerSource -->|Ingredient Added| NewIngredient[New ingredient added]
    TriggerSource -->|Ingredient Modified| ModIngredient[Ingredient quantity/cost changed]
    TriggerSource -->|Ingredient Removed| DelIngredient[Ingredient removed]
    TriggerSource -->|Cost % Changed| PercentChange[Labor/overhead % changed]
    TriggerSource -->|Yield Changed| YieldChange[Base yield changed]
    TriggerSource -->|Price Changed| PriceChange[Selling price changed]

    NewIngredient --> GetIngredientData[Get ingredient data]
    ModIngredient --> GetIngredientData
    DelIngredient --> GetIngredientData
    PercentChange --> GetIngredientData
    YieldChange --> GetIngredientData
    PriceChange --> GetIngredientData

    GetIngredientData --> CheckType{Ingredient<br>type?}
    CheckType -->|Product| GetProductCost[Get product cost from inventory]
    GetProductCost --> CalcProductCost[Cost = Quantity × Cost per Unit]
    CalcProductCost --> CalcWastage

    CheckType -->|Recipe| GetSubRecipeCost[Get sub-recipe total cost]
    GetSubRecipeCost --> CheckNested{Sub-recipe has<br>sub-recipes?}
    CheckNested -->|Yes| RecursiveCalc[Recursive cost calculation]
    RecursiveCalc --> CheckDepth{Depth<br>>3?}
    CheckDepth -->|Yes| ErrorMaxDepth[Error: Max nesting depth]
    ErrorMaxDepth --> End([End - Error])
    CheckDepth -->|No| CalcSubRecipeCost[Calculate nested costs]
    CalcSubRecipeCost --> CalcWastage
    CheckNested -->|No| CalcSubRecipeCost

    CalcWastage[Calculate wastage cost] --> WastageFormula[Wastage = Net Cost × Wastage%]
    WastageFormula --> TotalIngredient[Total Ingredient = Net + Wastage]
    TotalIngredient --> NextIngredient{More<br>ingredients?}
    NextIngredient -->|Yes| GetIngredientData
    NextIngredient -->|No| SumIngredients[Sum all ingredient costs]

    SumIngredients --> CalcLabor[Labor Cost = Total Ingredient × Labor%]
    CalcLabor --> CalcOverhead[Overhead = Total Ingredient × Overhead%]
    CalcOverhead --> CalcTotal[Total Cost = Ingredients + Labor + Overhead]
    CalcTotal --> CalcPortion[Cost per Portion = Total Cost / Yield]
    CalcPortion --> CheckPrice{Selling price<br>exists?}

    CheckPrice -->|Yes| CalcFoodCost[Food Cost% = Cost per Portion / Price × 100]
    CalcFoodCost --> CalcMargin[Gross Margin = Price - Cost per Portion]
    CalcMargin --> CalcMarginPercent[Margin% = Margin / Price × 100]
    CalcMarginPercent --> CheckTarget{Meets target<br>food cost?}
    CheckTarget -->|No| FlagWarning[Flag margin warning]
    FlagWarning --> CalcSuggested
    CheckTarget -->|Yes| CalcSuggested[Suggested Price = Cost / Target%]

    CheckPrice -->|No| CalcSuggested
    CalcSuggested --> CheckVariants{Has yield<br>variants?}
    CheckVariants -->|Yes| CalcVariantCost[For each variant]
    CalcVariantCost --> VariantCost[Variant Cost = Total Cost × Conversion Rate]
    VariantCost --> VariantMargin{Variant price<br>set?}
    VariantMargin -->|Yes| CalcVariantMargin[Calculate variant margin]
    CalcVariantMargin --> NextVariant{More<br>variants?}
    VariantMargin -->|No| NextVariant
    NextVariant -->|Yes| CalcVariantCost
    NextVariant -->|No| UpdateUI

    CheckVariants -->|No| UpdateUI[Update UI with all costs]
    UpdateUI --> UpdateCostTab[Update Cost Analysis tab]
    UpdateCostTab --> UpdateIngredientList[Update ingredient cost column]
    UpdateIngredientList --> UpdateVariantPrices[Update variant pricing]
    UpdateVariantPrices --> HighlightChanges[Highlight changed values]
    HighlightChanges --> CheckWarnings{Any cost<br>warnings?}
    CheckWarnings -->|Yes| ShowWarningBadge[Show warning badge]
    ShowWarningBadge --> EndSuccess
    CheckWarnings -->|No| EndSuccess([End - Success])

    style Start fill:#e1f5ff
    style CalcTotal fill:#fff4e1
    style EndSuccess fill:#e8f5e9
    style ErrorMaxDepth fill:#ffebee
    style FlagWarning fill:#fff9c4
```

---

## 5. Publish Recipe Workflow

```mermaid
flowchart TD
    Start([User clicks Publish]) --> CheckStatus{Current<br>status?}
    CheckStatus -->|Already Published| InfoMsg[Show 'Already published' message]
    InfoMsg --> End([End])

    CheckStatus -->|Draft/Archived| ShowPublishDialog[Show publish confirmation dialog]
    ShowPublishDialog --> DisplayChecklist[Display pre-publish checklist]
    DisplayChecklist --> CheckBasic{Basic info<br>complete?}
    CheckBasic -->|No| ShowBasicError[✗ Basic information incomplete]
    ShowBasicError --> DisablePublish
    CheckBasic -->|Yes| ShowBasicOK[✓ Basic information complete]
    ShowBasicOK --> CheckIngredients

    CheckIngredients{Has<br>ingredients?}
    CheckIngredients -->|No| ShowIngError[✗ Must have at least 1 ingredient]
    ShowIngError --> DisablePublish
    CheckIngredients -->|Yes| ShowIngOK[✓ Ingredients added]
    ShowIngOK --> CheckSteps

    CheckSteps{Has<br>prep steps?}
    CheckSteps -->|No| ShowStepError[✗ Must have at least 1 step]
    ShowStepError --> DisablePublish
    CheckSteps -->|Yes| ShowStepOK[✓ Preparation steps added]
    ShowStepOK --> CheckCosts

    CheckCosts{Costs<br>calculated?}
    CheckCosts -->|No| ShowCostError[✗ Costs must be calculated]
    ShowCostError --> DisablePublish
    CheckCosts -->|Yes| ShowCostOK[✓ Costs calculated]
    ShowCostOK --> CheckPrice

    CheckPrice{Selling price<br>set?}
    CheckPrice -->|No| WarnPrice[⚠ Recommended: Set selling price]
    WarnPrice --> EnablePublish
    CheckPrice -->|Yes| ShowPriceOK[✓ Selling price set]
    ShowPriceOK --> CheckMargin

    CheckMargin{Margin meets<br>target?}
    CheckMargin -->|No| WarnMargin[⚠ Warning: Margin below target]
    WarnMargin --> EnablePublish
    CheckMargin -->|Yes| ShowMarginOK[✓ Margin meets target]
    ShowMarginOK --> CheckVariants

    CheckVariants{Has yield<br>variants?}
    CheckVariants -->|Yes| CheckDefault{Default variant<br>marked?}
    CheckDefault -->|No| ShowVariantError[✗ Must mark default variant]
    ShowVariantError --> DisablePublish
    CheckDefault -->|Yes| ShowVariantOK[✓ Yield variants configured]
    ShowVariantOK --> CheckImage
    CheckVariants -->|No| CheckImage

    CheckImage{Has<br>image?}
    CheckImage -->|No| WarnImage[⚠ Recommended: Add recipe image]
    WarnImage --> EnablePublish
    CheckImage -->|Yes| ShowImageOK[✓ Recipe image added]
    ShowImageOK --> EnablePublish

    DisablePublish[Disable Publish button] --> ShowFixErrors[Show 'Fix errors to publish']
    ShowFixErrors --> End

    EnablePublish[Enable Publish button] --> UserConfirm{User clicks<br>Publish?}
    UserConfirm -->|No| End
    UserConfirm -->|Yes| ShowVersionDialog{First<br>publish?}

    ShowVersionDialog -->|Yes| VersionOne[Version will be 1]
    VersionOne --> CallPublish
    ShowVersionDialog -->|No| ShowVersionIncrement[Show version increment dialog]
    ShowVersionIncrement --> EnterChangeSummary[User enters change summary]
    EnterChangeSummary --> IncrementVersion[Increment version number]
    IncrementVersion --> CallPublish[Call publishRecipe action]

    CallPublish --> ServerVal[Server-side validation]
    ServerVal --> RecheckRequirements[Revalidate all requirements]
    RecheckRequirements --> RequirementsMet{All requirements<br>met?}
    RequirementsMet -->|No| ReturnError[Return validation error]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> End

    RequirementsMet -->|Yes| BeginTransaction[Begin database transaction]
    BeginTransaction --> UpdateStatus[UPDATE status = 'published']
    UpdateStatus --> SetPublishedAt[SET published_at = NOW()]
    SetPublishedAt --> CreateVersionSnapshot[INSERT version snapshot]
    CreateVersionSnapshot --> SnapshotRecipe[Snapshot recipe data]
    SnapshotRecipe --> SnapshotIngredients[Snapshot ingredients data]
    SnapshotIngredients --> SnapshotSteps[Snapshot steps data]
    SnapshotSteps --> SnapshotVariants[Snapshot variants data]
    SnapshotVariants --> MarkVersionPublished[Mark version as published]
    MarkVersionPublished --> CreatePricingHistory{Price<br>changed?}

    CreatePricingHistory -->|Yes| InsertPricingHistory[INSERT pricing history record]
    InsertPricingHistory --> CommitTransaction
    CreatePricingHistory -->|No| CommitTransaction[Commit transaction]

    CommitTransaction --> Success{Success?}
    Success -->|No| Rollback[Rollback]
    Rollback --> DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast with version]
    ShowSuccess --> RefreshList[Refresh recipe list]
    RefreshList --> HighlightPublished[Highlight published recipe]
    HighlightPublished --> EndSuccess([End - Published])

    style Start fill:#e1f5ff
    style ShowBasicOK fill:#e8f5e9
    style ShowIngOK fill:#e8f5e9
    style ShowStepOK fill:#e8f5e9
    style ShowCostOK fill:#e8f5e9
    style ShowPriceOK fill:#e8f5e9
    style ShowMarginOK fill:#e8f5e9
    style ShowVariantOK fill:#e8f5e9
    style ShowImageOK fill:#e8f5e9
    style ShowBasicError fill:#ffebee
    style ShowIngError fill:#ffebee
    style ShowStepError fill:#ffebee
    style ShowCostError fill:#ffebee
    style ShowVariantError fill:#ffebee
    style WarnPrice fill:#fff9c4
    style WarnMargin fill:#fff9c4
    style WarnImage fill:#fff9c4
    style UpdateStatus fill:#fff4e1
    style EndSuccess fill:#e8f5e9
```

---

## 6. Search and Filter Workflow

```mermaid
flowchart TD
    Start([User initiates search/filter]) --> InputType{Input type?}

    InputType -->|Search text| Debounce[Debounce 300ms]
    Debounce --> SearchFilter[Apply search filter]
    SearchFilter --> SearchFields[Search: name, description, recipe code]

    InputType -->|Quick filter click| QuickFilter[Toggle quick filter]
    QuickFilter --> QuickTypes{Filter type}
    QuickTypes -->|No Media| FilterNoMedia[Filter recipes without image]
    QuickTypes -->|Has Media| FilterHasMedia[Filter recipes with image]
    QuickTypes -->|Published| FilterPublished[Filter status=published]
    QuickTypes -->|Draft| FilterDraft[Filter status=draft]
    QuickTypes -->|Archived| FilterArchived[Filter status=archived]
    FilterNoMedia --> FilterChain
    FilterHasMedia --> FilterChain
    FilterPublished --> FilterChain
    FilterDraft --> FilterChain
    FilterArchived --> FilterChain

    InputType -->|Advanced filter| OpenAdvanced[Open advanced filter popover]
    OpenAdvanced --> SelectField[Select field to filter]
    SelectField --> SelectOperator[Select operator]
    SelectOperator --> EnterValue[Enter filter value]
    EnterValue --> AddCondition[Add filter condition]
    AddCondition --> UserContinue{Continue editing<br>or apply?}
    UserContinue -->|Add more| SelectField
    UserContinue -->|Apply| ApplyAdvanced[Apply advanced filters]
    ApplyAdvanced --> AdvancedTypes{Condition type}
    AdvancedTypes -->|Category| FilterByCategory[Filter by category_id]
    AdvancedTypes -->|Cuisine| FilterByCuisine[Filter by cuisine_id]
    AdvancedTypes -->|Difficulty| FilterByDifficulty[Filter by difficulty]
    AdvancedTypes -->|Cost Range| FilterByCost[Filter by cost_per_portion range]
    AdvancedTypes -->|Margin| FilterByMargin[Filter by gross_margin_percentage]
    AdvancedTypes -->|Prep Time| FilterByPrepTime[Filter by prep_time range]
    AdvancedTypes -->|Allergen| FilterByAllergen[Filter recipes with allergen]
    AdvancedTypes -->|Tag| FilterByTag[Filter recipes with tag]
    FilterByCategory --> FilterChain
    FilterByCuisine --> FilterChain
    FilterByDifficulty --> FilterChain
    FilterByCost --> FilterChain
    FilterByMargin --> FilterChain
    FilterByPrepTime --> FilterChain
    FilterByAllergen --> FilterChain
    FilterByTag --> FilterChain

    SearchFields --> FilterChain[Combine all active filters]
    FilterChain --> ApplyFilters[Apply combined filter logic]
    ApplyFilters --> FilterRecipes[Filter recipe list]
    FilterRecipes --> SortResults[Sort by: name, cost, margin, created date]
    SortResults --> CheckView{View<br>mode?}

    CheckView -->|Grid| GridView[Display grid layout]
    CheckView -->|List| ListView[Display list layout]
    GridView --> UpdateDisplay
    ListView --> UpdateDisplay[Update displayed list]

    UpdateDisplay --> ShowCount[Show result count]
    ShowCount --> CheckEmpty{Any results?}

    CheckEmpty -->|No| ShowEmpty[Show empty state]
    ShowEmpty --> SuggestClear[Suggest clearing filters]
    SuggestClear --> ShowClearButton[Show 'Clear Filters' button]
    ShowClearButton --> End([End])

    CheckEmpty -->|Yes| DisplayResults[Display filtered recipes]
    DisplayResults --> ShowRecipeCards[Show recipe cards/rows]
    ShowRecipeCards --> DisplayCostData[Display cost and margin data]
    DisplayCostData --> DisplayStatus[Display status badge]
    DisplayStatus --> UpdateBadge[Update filter count badge]
    UpdateBadge --> End

    style Start fill:#e1f5ff
    style ApplyFilters fill:#fff4e1
    style DisplayResults fill:#e8f5e9
    style ShowEmpty fill:#f5f5f5
```

---

## 7. Clone Recipe Workflow

```mermaid
flowchart TD
    Start([User clicks Clone Recipe]) --> ConfirmClone{User confirms<br>clone?}
    ConfirmClone -->|No| End([End - Cancelled])
    ConfirmClone -->|Yes| FetchSource[Fetch source recipe with all data]

    FetchSource --> LoadIngredients[Load all ingredients]
    LoadIngredients --> LoadSteps[Load all preparation steps]
    LoadSteps --> LoadVariants[Load all yield variants]
    LoadVariants --> LoadAllergens[Load allergens and tags]
    LoadAllergens --> OpenDialog[Open clone dialog]

    OpenDialog --> PreFillForm[Pre-fill form with cloned data]
    PreFillForm --> ModifyName[Modify name: 'Copy of [Original Name]']
    ModifyName --> GenerateNewCode[Generate new recipe code]
    GenerateNewCode --> SetDraft[Set status to 'draft']
    SetDraft --> ResetMetrics[Reset: version=1, published_at=null]
    ResetMetrics --> ResetAudit[Reset audit trail to current user]

    ResetAudit --> UserReview{User reviews<br>cloned data}
    UserReview -->|Modify| EditClone[User edits any fields]
    EditClone --> RealTimeVal[Real-time validation]
    RealTimeVal --> UserReview

    UserReview -->|Save| ValidateAll[Validate all fields]
    ValidateAll -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserReview

    ValidateAll -->|Valid| CallClone[Call cloneRecipe action]
    CallClone --> ServerVal[Server-side validation]
    ServerVal -->|Invalid| ReturnError[Return error]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserReview

    ServerVal -->|Valid| CheckCodeUnique{Recipe code<br>unique?}
    CheckCodeUnique -->|No| RegenerateCode[Regenerate code with suffix]
    RegenerateCode --> CheckCodeUnique
    CheckCodeUnique -->|Yes| CheckNameUnique{Recipe name<br>unique?}
    CheckNameUnique -->|No| DupName[Return duplicate name error]
    DupName --> DisplayError

    CheckNameUnique -->|Yes| BeginTransaction[Begin database transaction]
    BeginTransaction --> CreateNewRecipe[INSERT new recipe record]
    CreateNewRecipe --> CloneIngredients[INSERT cloned ingredients]
    CloneIngredients --> CloneSteps[INSERT cloned steps]
    CloneSteps --> CloneVariants{Has yield<br>variants?}
    CloneVariants -->|Yes| InsertVariants[INSERT cloned variants]
    InsertVariants --> CloneAllergens
    CloneVariants -->|No| CloneAllergens[INSERT cloned allergens]
    CloneAllergens --> CloneTags[INSERT cloned tags]
    CloneTags --> RecalcCosts[Recalculate all costs]
    RecalcCosts --> CommitTransaction[Commit transaction]

    CommitTransaction --> Success{Success?}
    Success -->|No| Rollback[Rollback]
    Rollback --> DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh recipe list]
    RefreshList --> NavigateToClone[Navigate to cloned recipe]
    NavigateToClone --> HighlightClone[Highlight cloned recipe]
    HighlightClone --> End

    style Start fill:#e1f5ff
    style CreateNewRecipe fill:#fff4e1
    style NavigateToClone fill:#e8f5e9
    style End fill:#f5f5f5
    style DisplayError fill:#ffebee
```

---

## 8. Bulk Operations Workflow

```mermaid
flowchart TD
    Start([User selects recipes]) --> SelectCheck{Selection<br>valid?}
    SelectCheck -->|<2 selected| ShowMsg[Show 'Select at least 2' message]
    ShowMsg --> End([End])

    SelectCheck -->|≥2 selected| ShowToolbar[Show bulk actions toolbar]
    ShowToolbar --> UserAction{User clicks<br>bulk action}

    UserAction -->|Archive| ValidateArchive[Check each recipe]
    ValidateArchive --> SplitArchive[Split: can archive vs blocked]
    SplitArchive --> BlockedCheck{Any blocked?}
    BlockedCheck -->|Yes| ShowArchiveDialog[Show dialog with breakdown]
    ShowArchiveDialog --> ListBlocked[List blocked recipes and reasons]
    ListBlocked --> UserArchiveChoice{User decision}
    UserArchiveChoice -->|Cancel| End
    UserArchiveChoice -->|Archive valid only| BulkArchive[UPDATE status='archived' for valid]
    BlockedCheck -->|No| BulkArchive
    BulkArchive --> SetArchivedAt[SET archived_at timestamp]
    SetArchivedAt --> ArchiveSuccess[Show success/skipped counts]
    ArchiveSuccess --> ClearSelection

    UserAction -->|Publish| ValidatePublish[Check each for publish requirements]
    ValidatePublish --> SplitPublish[Split: ready vs not ready]
    SplitPublish --> ShowPublishDialog[Show dialog with breakdown]
    ShowPublishDialog --> ListNotReady[List not-ready recipes and reasons]
    ListNotReady --> UserPublishChoice{User decision}
    UserPublishChoice -->|Cancel| End
    UserPublishChoice -->|Publish ready only| BulkPublish[UPDATE status='published' for ready]
    BulkPublish --> CreateVersions[CREATE version snapshots]
    CreateVersions --> SetPublishedTimestamps[SET published_at]
    SetPublishedTimestamps --> PublishSuccess[Show success/skipped counts]
    PublishSuccess --> ClearSelection

    UserAction -->|Update Category| ShowCategorySelect[Show category selection dialog]
    ShowCategorySelect --> UserSelectsCategory{User selects<br>category?}
    UserSelectsCategory -->|No| End
    UserSelectsCategory -->|Yes| ValidateCategoryChange[Check if change allowed]
    ValidateCategoryChange --> BulkUpdateCategory[UPDATE category_id for all]
    BulkUpdateCategory --> CategorySuccess[Show success count]
    CategorySuccess --> ClearSelection

    UserAction -->|Update Cuisine| ShowCuisineSelect[Show cuisine selection dialog]
    ShowCuisineSelect --> UserSelectsCuisine{User selects<br>cuisine?}
    UserSelectsCuisine -->|No| End
    UserSelectsCuisine -->|Yes| BulkUpdateCuisine[UPDATE cuisine_id for all]
    BulkUpdateCuisine --> CuisineSuccess[Show success count]
    CuisineSuccess --> ClearSelection

    UserAction -->|Add Tags| ShowTagInput[Show tag input dialog]
    ShowTagInput --> UserEntersTags{User enters<br>tags?}
    UserEntersTags -->|No| End
    UserEntersTags -->|Yes| BulkAddTags[INSERT tags for all recipes]
    BulkAddTags --> TagSuccess[Show success count]
    TagSuccess --> ClearSelection

    UserAction -->|Export| OpenExportDialog[Open export dialog]
    OpenExportDialog --> SelectFormat[User selects format]
    SelectFormat --> SelectFields[User selects fields to export]
    SelectFields --> IncludeRelated{Include related<br>data?}
    IncludeRelated -->|Yes| IncludeIngredients[Include ingredients option]
    IncludeIngredients --> IncludeSteps[Include steps option]
    IncludeSteps --> GenerateExport
    IncludeRelated -->|No| GenerateExport[Generate export file]
    GenerateExport --> FormatData{Export<br>format?}
    FormatData -->|CSV| GenerateCSV[Generate CSV file]
    FormatData -->|Excel| GenerateExcel[Generate XLSX file]
    FormatData -->|JSON| GenerateJSON[Generate JSON file]
    FormatData -->|PDF| GeneratePDF[Generate PDF file]
    GenerateCSV --> DownloadFile
    GenerateExcel --> DownloadFile
    GenerateJSON --> DownloadFile
    GeneratePDF --> DownloadFile[Download file]
    DownloadFile --> ShowExportSuccess[Show success toast]
    ShowExportSuccess --> KeepSelection[Keep selection active]
    KeepSelection --> End

    UserAction -->|Delete| ValidateDelete[Check each recipe]
    ValidateDelete --> CheckPublished{Any<br>published?}
    CheckPublished -->|Yes| BlockDelete[Show blocking error]
    BlockDelete --> ExplainArchiveFirst[Explain: Must archive before delete]
    ExplainArchiveFirst --> End
    CheckPublished -->|No| CheckUsage[Check usage in menus/orders]
    CheckUsage --> SplitDelete[Split: safe, warning, blocked]
    SplitDelete --> ShowDeleteDialog[Show detailed dialog]
    ShowDeleteDialog --> ListSafe[List safe to delete]
    ListSafe --> ListWarning[List with warnings]
    ListWarning --> ListBlocked[List blocked]
    ListBlocked --> UserDelChoice{User decision}
    UserDelChoice -->|Cancel| End
    UserDelChoice -->|Safe only| DeleteSafe[Soft delete safe recipes]
    UserDelChoice -->|Safe+Warning| RequireCheckbox[Require confirmation]
    RequireCheckbox --> UserChecked{Confirmed?}
    UserChecked -->|No| RequireCheckbox
    UserChecked -->|Yes| DeleteWithWarning[Soft delete recipes with warnings]
    DeleteSafe --> DeleteSuccess
    DeleteWithWarning --> DeleteSuccess[Show success/skipped counts]
    DeleteSuccess --> ClearSelection

    ClearSelection[Clear selection] --> HideToolbar[Hide bulk toolbar]
    HideToolbar --> RefreshList[Refresh list]
    RefreshList --> End

    style Start fill:#e1f5ff
    style BulkArchive fill:#fff9c4
    style BulkPublish fill:#e8f5e9
    style BulkUpdateCategory fill:#fff4e1
    style BlockDelete fill:#ffebee
    style End fill:#f5f5f5
```

---

## 9. Recipe Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Create new recipe
    Draft --> Draft: Edit and save
    Draft --> Published: Publish recipe (v1)
    Published --> Published: Edit and republish (v2, v3, ...)
    Published --> Archived: Archive recipe
    Archived --> Published: Reactivate recipe
    Archived --> [*]: Delete recipe (soft delete)

    note right of Draft
        - Can be edited freely
        - Not visible in menus
        - No version history
        - Can be deleted anytime
    end note

    note right of Published
        - Visible in menus and POS
        - Version history tracked
        - Each publish creates new version
        - Cannot be deleted directly
        - Costs locked at publish
    end note

    note right of Archived
        - Not visible in menus
        - Historical data preserved
        - Can be reactivated
        - Can be deleted after archiving
        - Order history maintained
    end note
```

---

## 10. Yield Variant Configuration Workflow

```mermaid
flowchart TD
    Start([User configures yield variants]) --> CheckEnabled{Fractional sales<br>enabled?}
    CheckEnabled -->|No| EnableFractional[Enable fractional sales]
    EnableFractional --> SelectType[Select fractional sales type]
    SelectType --> TypeOptions{Type<br>selected}

    CheckEnabled -->|Yes| AddVariant[Add yield variant]

    TypeOptions -->|Pizza Slice| SuggestPizza[Suggest: Slice 1/8, Half 1/2, Whole 1]
    TypeOptions -->|Cake Slice| SuggestCake[Suggest: Slice 1/16, Quarter 1/4, Half 1/2, Whole 1]
    TypeOptions -->|Bottle/Glass| SuggestBottle[Suggest: Glass portions from bottle]
    TypeOptions -->|Portion Control| SuggestPortion[Suggest: Standard serving sizes]
    TypeOptions -->|Custom| CustomVariants[Custom variant configuration]
    SuggestPizza --> AddVariant
    SuggestCake --> AddVariant
    SuggestBottle --> AddVariant
    SuggestPortion --> AddVariant
    CustomVariants --> AddVariant

    AddVariant --> VariantForm[Open variant form]
    VariantForm --> EnterName[Enter variant name]
    EnterName --> EnterUnit[Enter variant unit]
    EnterUnit --> EnterQuantity[Enter variant quantity]
    EnterQuantity --> EnterConversion[Enter conversion rate 0.01-1.0]
    EnterConversion --> ValidateConversion{Conversion<br>valid?}
    ValidateConversion -->|No| ShowConversionError[Show conversion rate error]
    ShowConversionError --> EnterConversion
    ValidateConversion -->|Yes| CalcVariantCost[Calculate variant cost]

    CalcVariantCost --> CostFormula[Variant Cost = Total Recipe Cost × Conversion]
    CostFormula --> EnterPrice{Enter selling<br>price?}
    EnterPrice -->|Yes| InputPrice[Input variant selling price]
    InputPrice --> CalcVariantMargin[Calculate variant margin]
    CalcVariantMargin --> ValidateMargin{Margin<br>reasonable?}
    ValidateMargin -->|No| WarnMargin[Warn about low margin]
    WarnMargin --> CheckLogic
    ValidateMargin -->|Yes| CheckLogic

    EnterPrice -->|No| CheckLogic{Check pricing<br>logic}
    CheckLogic --> CompareVariants[Compare all variant prices]
    CompareVariants --> LogicCheck{8 slices cost<br>> whole?}
    LogicCheck -->|Yes| ShowLogicWarning[Show pricing logic warning]
    ShowLogicWarning --> SuggestAdjust[Suggest price adjustments]
    SuggestAdjust --> UserFixPrice{User adjusts<br>prices?}
    UserFixPrice -->|Yes| InputPrice
    UserFixPrice -->|No| ProceedWarning[Proceed with warning]
    ProceedWarning --> OptionalFields
    LogicCheck -->|No| OptionalFields

    OptionalFields[Configure optional fields] --> EnterShelfLife[Enter shelf life hours]
    EnterShelfLife --> EnterWastage[Enter wastage rate]
    EnterWastage --> EnterOrderLimits[Enter min/max order quantity]
    EnterOrderLimits --> SetDefault{Set as<br>default?}

    SetDefault -->|Yes| CheckExistingDefault{Existing default<br>exists?}
    CheckExistingDefault -->|Yes| ConfirmDefaultChange{Change<br>default?}
    ConfirmDefaultChange -->|No| SetDefault
    ConfirmDefaultChange -->|Yes| UnmarkOldDefault[Unmark old default]
    UnmarkOldDefault --> MarkNewDefault[Mark new default]
    CheckExistingDefault -->|No| MarkNewDefault
    MarkNewDefault --> SaveVariant

    SetDefault -->|No| SaveVariant[Save variant]
    SaveVariant --> AddMore{Add more<br>variants?}
    AddMore -->|Yes| AddVariant
    AddMore -->|No| ValidateAllVariants[Validate all variants]

    ValidateAllVariants --> CheckDefaultExists{Has default<br>variant?}
    CheckDefaultExists -->|No| ShowDefaultError[Error: Must mark one as default]
    ShowDefaultError --> SelectDefault[Select variant to mark default]
    SelectDefault --> MarkNewDefault

    CheckDefaultExists -->|Yes| ShowVariantSummary[Show variant summary table]
    ShowVariantSummary --> DisplayConversions[Display conversion rates]
    DisplayConversions --> DisplayPricing[Display pricing breakdown]
    DisplayPricing --> DisplayMargins[Display margins]
    DisplayMargins --> HighlightDefault[Highlight default variant]
    HighlightDefault --> UserComplete{User completes<br>configuration?}

    UserComplete -->|Edit| SelectVariant[Select variant to edit]
    SelectVariant --> VariantForm
    UserComplete -->|Delete| SelectDeleteVariant[Select variant to delete]
    SelectDeleteVariant --> CheckDeleteDefault{Deleting<br>default?}
    CheckDeleteDefault -->|Yes| ShowDeleteDefaultError[Cannot delete default variant]
    ShowDeleteDefaultError --> UserComplete
    CheckDeleteDefault -->|No| ConfirmDelete{Confirm<br>delete?}
    ConfirmDelete -->|No| UserComplete
    ConfirmDelete -->|Yes| RemoveVariant[Remove variant]
    RemoveVariant --> UserComplete

    UserComplete -->|Save| SaveAllVariants[Save all variants to recipe]
    SaveAllVariants --> UpdateRecipeFlag[Update recipe: allows_fractional_sales=true]
    UpdateRecipeFlag --> SetDefaultVariantId[Set default_variant_id]
    SetDefaultVariantId --> End([End - Success])

    style Start fill:#e1f5ff
    style CalcVariantCost fill:#fff4e1
    style ShowLogicWarning fill:#fff9c4
    style ShowDefaultError fill:#ffebee
    style ShowDeleteDefaultError fill:#ffebee
    style End fill:#e8f5e9
```

---

## 11. Permission-Based Action Flow

```mermaid
flowchart TD
    Start([User attempts action]) --> CheckAuth{User<br>authenticated?}
    CheckAuth -->|No| DenyAuth[Show login required]
    DenyAuth --> End([End - Access Denied])

    CheckAuth -->|Yes| CheckPerm{Has required<br>permission?}

    CheckPerm -->|recipe.create<br>for create| AllowCreate[Allow create action]
    CheckPerm -->|recipe.update<br>for edit| AllowEdit[Allow edit action]
    CheckPerm -->|recipe.delete<br>for delete| AllowDelete[Allow delete action]
    CheckPerm -->|recipe.publish<br>for publish| AllowPublish[Allow publish action]
    CheckPerm -->|recipe.view<br>for view| AllowView[Allow view action]
    CheckPerm -->|recipe.export<br>for export| AllowExport[Allow export action]
    CheckPerm -->|recipe.cost.view<br>for cost analysis| AllowCostView[Allow cost view]

    CheckPerm -->|No permission| DenyPerm[Show permission denied]
    DenyPerm --> End

    AllowCreate --> CheckDeptAccess{Department<br>access?}
    AllowEdit --> CheckOwnership{User is<br>creator or has<br>admin role?}
    AllowDelete --> CheckOwnership
    AllowPublish --> CheckApproval{Publish approval<br>required?}
    AllowView --> ExecuteAction[Execute action]
    AllowExport --> ExecuteAction
    AllowCostView --> ExecuteAction

    CheckDeptAccess -->|No| DenyDept[Show department access denied]
    DenyDept --> End
    CheckDeptAccess -->|Yes| ExecuteAction

    CheckOwnership -->|No| DenyOwner[Show ownership error]
    DenyOwner --> End
    CheckOwnership -->|Yes| ExecuteAction

    CheckApproval -->|Yes| RequestApproval[Request manager approval]
    RequestApproval --> PendingApproval[Set status to pending_approval]
    PendingApproval --> NotifyManager[Notify approval manager]
    NotifyManager --> WaitApproval([Wait for approval])
    CheckApproval -->|No| ExecuteAction

    ExecuteAction --> LogAction[Log in audit trail]
    LogAction --> LogDetails[Log: user, action, timestamp, changes]
    LogDetails --> Success([End - Action Completed])

    style Start fill:#e1f5ff
    style DenyAuth fill:#ffebee
    style DenyPerm fill:#ffebee
    style DenyDept fill:#ffebee
    style DenyOwner fill:#ffebee
    style ExecuteAction fill:#fff4e1
    style Success fill:#e8f5e9
```

---

## 12. Error Recovery Flow

```mermaid
flowchart TD
    Start([Error occurs]) --> ErrorType{Error type?}

    ErrorType -->|Validation error| FieldError[Identify invalid field]
    FieldError --> HighlightField[Highlight field with error]
    HighlightField --> ShowInlineError[Show inline error message]
    ShowInlineError --> TabCheck{Field in<br>current tab?}
    TabCheck -->|No| NavigateToTab[Navigate to tab with error]
    TabCheck -->|Yes| FocusField[Focus on invalid field]
    NavigateToTab --> FocusField
    FocusField --> UserFix[User corrects input]
    UserFix --> RetryValidation[Re-validate field]
    RetryValidation --> ValidationSuccess{Valid?}
    ValidationSuccess -->|No| ShowInlineError
    ValidationSuccess -->|Yes| ClearError[Clear error message]
    ClearError --> CheckMoreErrors{More errors?}
    CheckMoreErrors -->|Yes| FieldError
    CheckMoreErrors -->|No| Success([Success])

    ErrorType -->|Cost calculation error| IdentifyIngredient[Identify problematic ingredient]
    IdentifyIngredient --> ShowCostError[Show cost calculation error]
    ShowCostError --> ExplainIssue[Explain: missing cost data or invalid quantity]
    ExplainIssue --> NavigateIngredients[Navigate to Ingredients tab]
    NavigateIngredients --> HighlightIngredient[Highlight problematic ingredient]
    HighlightIngredient --> UserFixIngredient{User action}
    UserFixIngredient -->|Update cost| UpdateCost[Update cost per unit]
    UserFixIngredient -->|Fix quantity| FixQuantity[Fix quantity/unit]
    UserFixIngredient -->|Remove ingredient| RemoveIngredient[Remove ingredient]
    UpdateCost --> RecalcCosts[Recalculate costs]
    FixQuantity --> RecalcCosts
    RemoveIngredient --> RecalcCosts
    RecalcCosts --> CostSuccess{Calculation<br>successful?}
    CostSuccess -->|No| ShowCostError
    CostSuccess -->|Yes| Success

    ErrorType -->|Circular dependency| ShowCircularError[Show circular dependency error]
    ShowCircularError --> DisplayChain[Display dependency chain]
    DisplayChain --> ExplainCircular[Explain: Recipe A → B → A not allowed]
    ExplainCircular --> SuggestFix[Suggest: Select different ingredient]
    SuggestFix --> UserFixCircular{User action}
    UserFixCircular -->|Change ingredient| SelectDifferent[Select different sub-recipe]
    UserFixCircular -->|Cancel| Cancel([Cancel operation])
    SelectDifferent --> ValidateNew[Validate new selection]
    ValidateNew --> StillCircular{Still circular?}
    StillCircular -->|Yes| ShowCircularError
    StillCircular -->|No| Success

    ErrorType -->|Network error| DetectNetwork{Network<br>available?}
    DetectNetwork -->|No| ShowOffline[Show offline message]
    ShowOffline --> WaitNetwork[Wait for connection]
    WaitNetwork --> DetectNetwork
    DetectNetwork -->|Yes| RetryRequest[Retry request]
    RetryRequest --> RequestSuccess{Success?}
    RequestSuccess -->|Yes| Success
    RequestSuccess -->|No| CountRetries{Retry count<br><3?}
    CountRetries -->|Yes| ExponentialBackoff[Wait with exponential backoff]
    ExponentialBackoff --> RetryRequest
    CountRetries -->|No| ShowRetryButton[Show manual retry button]
    ShowRetryButton --> UserRetry{User clicks<br>retry?}
    UserRetry -->|Yes| RetryRequest
    UserRetry -->|No| Cancel

    ErrorType -->|Database error| LogError[Log error details]
    LogError --> ShowGeneric[Show generic error message]
    ShowGeneric --> CheckRecoverable{Error<br>recoverable?}
    CheckRecoverable -->|Yes| ShowRetryOption[Show retry option]
    ShowRetryOption --> UserRetryDB{User retries?}
    UserRetryDB -->|Yes| RetryDB[Retry database operation]
    RetryDB --> DBSuccess{Success?}
    DBSuccess -->|Yes| Success
    DBSuccess -->|No| ShowRetryOption
    UserRetryDB -->|No| Cancel
    CheckRecoverable -->|No| ContactSupport[Show 'Contact support' message]
    ContactSupport --> ProvideErrorCode[Provide error code]
    ProvideErrorCode --> Cancel

    ErrorType -->|Business rule violation| IdentifyRule[Identify violated rule]
    IdentifyRule --> ShowRuleError[Show specific business rule error]
    ShowRuleError --> ExplainRule[Explain rule and requirement]
    ExplainRule --> ShowExample[Show example of valid data]
    ShowExample --> UserFixRule{User takes<br>corrective action?}
    UserFixRule -->|Yes| RetryAction[Retry action]
    RetryAction --> RuleSuccess{Rule<br>satisfied?}
    RuleSuccess -->|No| ShowRuleError
    RuleSuccess -->|Yes| Success
    UserFixRule -->|No| Cancel

    ErrorType -->|Permission denied| ShowPermError[Show permission denied]
    ShowPermError --> ExplainPermission[Explain required permission]
    ExplainPermission --> SuggestContact[Suggest contacting administrator]
    SuggestContact --> Cancel

    ErrorType -->|File upload error| CheckFileSize{File size<br>>limit?}
    CheckFileSize -->|Yes| ShowSizeError[Show file size error]
    ShowSizeError --> ShowLimit[Show max file size]
    ShowLimit --> SuggestCompress[Suggest compressing image]
    SuggestCompress --> UserCompresses{User compresses<br>and retries?}
    UserCompresses -->|Yes| RetryUpload[Retry upload]
    UserCompresses -->|No| Cancel
    CheckFileSize -->|No| CheckFileType{File type<br>invalid?}
    CheckFileType -->|Yes| ShowTypeError[Show file type error]
    ShowTypeError --> ShowAccepted[Show accepted file types]
    ShowAccepted --> UserConverts{User converts<br>and retries?}
    UserConverts -->|Yes| RetryUpload
    UserConverts -->|No| Cancel
    CheckFileType -->|No| RetryUpload
    RetryUpload --> UploadSuccess{Success?}
    UploadSuccess -->|Yes| Success
    UploadSuccess -->|No| NetworkError[Network error]
    NetworkError --> DetectNetwork

    style Start fill:#ffebee
    style Success fill:#e8f5e9
    style Cancel fill:#f5f5f5
    style ShowCircularError fill:#ffebee
    style ShowRuleError fill:#fff9c4
    style RetryRequest fill:#fff4e1
```

---
