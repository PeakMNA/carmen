# Purchase Order Module: Business Logic Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Overview

This document defines the comprehensive business logic governing the Purchase Order (PO) module, including creation rules, approval workflows, financial calculations, status transitions, and integration requirements.

## 2. Core Business Rules

### 2.1 PO Creation Rules

#### 2.1.1 General Creation Rules
- **Unique Reference Numbers**: Each PO must have a unique, auto-generated reference number following the pattern: `PO-YYMM-NNNN`
- **Mandatory Fields**: Vendor, Currency, Delivery Date, Department, and at least one line item are required
- **Date Constraints**: PO date cannot be in the future, Delivery date must be at least 1 day after PO date
- **User Context**: PO inherits creator's department and location unless explicitly changed

#### 2.1.2 PR-to-PO Creation Rules
```javascript
// Business Rule: Vendor+Currency Grouping
function groupPRsForPOCreation(selectedPRs) {
  return selectedPRs.reduce((groups, pr) => {
    const groupKey = `${pr.vendorId}-${pr.currency}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        vendor: pr.vendor,
        vendorId: pr.vendorId,
        currency: pr.currency,
        prs: [],
        combinedTotal: 0
      };
    }
    
    groups[groupKey].prs.push(pr);
    groups[groupKey].combinedTotal += pr.totalAmount;
    
    return groups;
  }, {});
}

// Rule: Each vendor+currency combination creates exactly one PO
// Rule: All PR items within a group are consolidated into the resulting PO
// Rule: Original PR references must be maintained for audit trail
```

#### 2.1.3 Item Consolidation Rules with PR Source Tracking
```javascript
function consolidatePRItemsWithDetailedSources(prs) {
  const consolidatedItems = {};
  
  prs.forEach(pr => {
    pr.items.forEach(prItem => {
      const itemKey = `${prItem.itemId}-${prItem.location}`;
      
      if (consolidatedItems[itemKey]) {
        // Combine quantities from multiple PRs
        consolidatedItems[itemKey].quantity += prItem.approvedQuantity || prItem.quantity;
        consolidatedItems[itemKey].prSources.push(createPRSourceRecord(pr, prItem));
      } else {
        // Create new consolidated item
        consolidatedItems[itemKey] = {
          ...prItem,
          quantity: prItem.approvedQuantity || prItem.quantity,
          prSources: [createPRSourceRecord(pr, prItem)],
          sourceType: 'consolidated',
          consolidationSummary: null
        };
      }
    });
  });
  
  // Calculate consolidation summaries for multi-source items
  Object.values(consolidatedItems).forEach(item => {
    if (item.prSources.length > 1) {
      item.consolidationSummary = calculateItemConsolidationSummary(item.prSources);
    }
    item.hasMultipleSources = item.prSources.length > 1;
  });
  
  return Object.values(consolidatedItems);
}

function createPRSourceRecord(pr, prItem) {
  return {
    // PR Information
    prId: pr.id,
    prNumber: pr.refNumber,
    prDate: pr.date,
    prStatus: pr.status,
    
    // PR Item Information
    prItemId: prItem.id,
    requestedQuantity: prItem.quantity,
    approvedQuantity: prItem.approvedQuantity || prItem.quantity,
    unitPrice: prItem.unitPrice,
    discountRate: prItem.discountRate || 0,
    taxRate: prItem.taxRate || 0,
    
    // Requestor Information
    requestorId: pr.requestorId,
    requestorName: pr.requestor.name,
    requestorDepartment: pr.requestor.department,
    
    // Additional Context
    originalDescription: prItem.description,
    notes: prItem.notes,
    urgency: prItem.urgency || 'Normal',
    deliveryRequirement: prItem.deliveryRequirement,
    
    // Status Tracking
    fulfillmentStatus: prItem.approvedQuantity === prItem.quantity ? 'Full' : 'Partial',
    varianceQuantity: (prItem.approvedQuantity || prItem.quantity) - prItem.quantity,
    varianceReason: prItem.varianceReason || null,
    
    // Timestamps
    requestedDate: prItem.createdDate,
    approvedDate: prItem.approvedDate,
    linkedToPODate: new Date()
  };
}

function calculateItemConsolidationSummary(prSources) {
  const summary = {
    // Quantity Analysis
    totalRequested: prSources.reduce((sum, src) => sum + src.requestedQuantity, 0),
    totalApproved: prSources.reduce((sum, src) => sum + src.approvedQuantity, 0),
    totalVariance: 0,
    variancePercentage: 0,
    
    // Source Analysis
    sourceCount: prSources.length,
    uniqueRequestors: [...new Set(prSources.map(src => src.requestorName))],
    departments: [...new Set(prSources.map(src => src.requestorDepartment))],
    
    // Price Analysis
    priceConsistency: true,
    averagePrice: 0,
    priceVariance: 0,
    
    // Status Analysis
    fullFulfillmentCount: prSources.filter(src => src.fulfillmentStatus === 'Full').length,
    partialFulfillmentCount: prSources.filter(src => src.fulfillmentStatus === 'Partial').length,
    
    // Date Analysis
    requestDateRange: {
      earliest: new Date(Math.min(...prSources.map(src => src.requestedDate))),
      latest: new Date(Math.max(...prSources.map(src => src.requestedDate)))
    },
    
    // Risk Indicators
    hasVariance: false,
    hasPriceInconsistency: false,
    hasUrgentItems: prSources.some(src => src.urgency === 'Urgent'),
    crossDepartmental: false
  };
  
  // Calculate derived values
  summary.totalVariance = summary.totalApproved - summary.totalRequested;
  summary.variancePercentage = summary.totalRequested > 0 ? 
    (summary.totalVariance / summary.totalRequested) * 100 : 0;
  summary.hasVariance = summary.totalVariance !== 0;
  
  // Price analysis
  const prices = prSources.map(src => src.unitPrice);
  summary.averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  summary.priceConsistency = new Set(prices).size === 1;
  summary.hasPriceInconsistency = !summary.priceConsistency;
  
  if (!summary.priceConsistency) {
    summary.priceVariance = Math.max(...prices) - Math.min(...prices);
  }
  
  // Department analysis
  summary.crossDepartmental = summary.departments.length > 1;
  
  return summary;
}
```

### 2.2 Financial Calculation Rules

#### 2.2.1 Item-Level Calculations
```javascript
function calculateItemFinancials(item) {
  // Rule: All calculations use 2 decimal precision with banker's rounding
  const subtotal = roundBankers(item.quantity * item.unitPrice, 2);
  
  // Rule: Discount calculated on subtotal
  const discountAmount = roundBankers(subtotal * (item.discountRate / 100), 2);
  
  // Rule: Net amount is subtotal minus discount
  const netAmount = roundBankers(subtotal - discountAmount, 2);
  
  // Rule: Tax calculated on net amount (after discount)
  const taxAmount = roundBankers(netAmount * (item.taxRate / 100), 2);
  
  // Rule: Total is net amount plus tax
  const totalAmount = roundBankers(netAmount + taxAmount, 2);
  
  return {
    subtotal,
    discountAmount,
    netAmount,
    taxAmount,
    totalAmount
  };
}
```

#### 2.2.2 PO-Level Calculations
```javascript
function calculatePOTotals(items) {
  // Rule: PO totals are sum of individual item calculations
  const totals = items.reduce((acc, item) => {
    const itemCalc = calculateItemFinancials(item);
    return {
      subtotal: acc.subtotal + itemCalc.subtotal,
      discountAmount: acc.discountAmount + itemCalc.discountAmount,
      netAmount: acc.netAmount + itemCalc.netAmount,
      taxAmount: acc.taxAmount + itemCalc.taxAmount,
      totalAmount: acc.totalAmount + itemCalc.totalAmount
    };
  }, {
    subtotal: 0,
    discountAmount: 0,
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0
  });
  
  // Rule: Final rounding applied to totals
  return {
    subtotal: roundBankers(totals.subtotal, 2),
    discountAmount: roundBankers(totals.discountAmount, 2),
    netAmount: roundBankers(totals.netAmount, 2),
    taxAmount: roundBankers(totals.taxAmount, 2),
    totalAmount: roundBankers(totals.totalAmount, 2)
  };
}
```

#### 2.2.3 Multi-Currency Rules
```javascript
function handleMultiCurrency(po, baseCurrency) {
  if (po.currency === baseCurrency) {
    // Rule: No conversion needed for base currency
    po.baseCurrencyTotals = po.totals;
    po.exchangeRate = 1.0;
  } else {
    // Rule: Convert using current exchange rate
    const rate = getExchangeRate(po.currency, baseCurrency);
    po.exchangeRate = rate;
    po.baseCurrencyTotals = {
      subtotal: roundBankers(po.totals.subtotal * rate, 2),
      discountAmount: roundBankers(po.totals.discountAmount * rate, 2),
      netAmount: roundBankers(po.totals.netAmount * rate, 2),
      taxAmount: roundBankers(po.totals.taxAmount * rate, 2),
      totalAmount: roundBankers(po.totals.totalAmount * rate, 2)
    };
  }
  
  return po;
}
```

### 2.3 Status Transition Rules

#### 2.3.1 Valid Status Transitions
```javascript
const statusTransitions = {
  'Draft': {
    allowed: ['Sent', 'Deleted'],
    conditions: {
      'Sent': ['hasItems', 'hasVendor', 'hasValidDeliveryDate'],
      'Deleted': ['isDraft', 'isCreatorOrAdmin']
    }
  },
  'Sent': {
    allowed: ['Partial', 'FullyReceived', 'Voided', 'Cancelled'],
    conditions: {
      'Partial': ['hasPartialReceipt'],
      'FullyReceived': ['hasFullReceipt'],
      'Voided': ['hasVoidPermission'],
      'Cancelled': ['hasCancelPermission']
    }
  },
  'Partial': {
    allowed: ['FullyReceived', 'Closed'],
    conditions: {
      'FullyReceived': ['hasFullReceipt'],
      'Closed': ['hasClosePermission']
    }
  },
  'FullyReceived': {
    allowed: ['Closed'],
    conditions: {
      'Closed': ['hasClosePermission']
    }
  },
  'Voided': {
    allowed: [], // Terminal state
    conditions: {}
  },
  'Closed': {
    allowed: [], // Terminal state
    conditions: {}
  },
  'Deleted': {
    allowed: [], // Terminal state
    conditions: {}
  }
};
```

#### 2.3.2 Status Validation Logic
```javascript
function validateStatusTransition(po, newStatus, user) {
  const currentStatus = po.status;
  const transition = statusTransitions[currentStatus];
  
  // Rule: Check if transition is allowed
  if (!transition.allowed.includes(newStatus)) {
    return {
      valid: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}`
    };
  }
  
  // Rule: Check business conditions
  const conditions = transition.conditions[newStatus];
  for (const condition of conditions) {
    if (!evaluateCondition(condition, po, user)) {
      return {
        valid: false,
        reason: `Condition not met: ${condition}`
      };
    }
  }
  
  return { valid: true };
}
```

### 2.4 Approval Workflow Rules

#### 2.4.1 Approval Hierarchy
```javascript
const approvalLimits = {
  'Department Head': {
    standard: 5000,
    urgent: 2500,
    emergency: 1000
  },
  'Finance Manager': {
    standard: 25000,
    urgent: 15000,
    emergency: 10000
  },
  'Procurement Manager': {
    standard: 100000,
    urgent: 50000,
    emergency: 25000
  },
  'General Manager': {
    standard: Infinity,
    urgent: Infinity,
    emergency: Infinity
  }
};

function getRequiredApprover(po) {
  const type = po.type || 'standard';
  const amount = po.totalAmount;
  
  for (const [role, limits] of Object.entries(approvalLimits)) {
    if (amount <= limits[type]) {
      return {
        role,
        requiredLevel: role,
        approvalLimit: limits[type]
      };
    }
  }
  
  return {
    role: 'Board Approval',
    requiredLevel: 'Board Approval',
    approvalLimit: Infinity
  };
}
```

#### 2.4.2 Approval Business Rules
```javascript
function validateApproval(po, approver) {
  const validations = [];
  
  // Rule: Cannot approve own PO
  if (po.createdBy === approver.id) {
    validations.push({
      valid: false,
      rule: 'self_approval_prohibited',
      message: 'Cannot approve your own purchase order'
    });
  }
  
  // Rule: Must have sufficient approval authority
  const requiredApprover = getRequiredApprover(po);
  if (!hasApprovalAuthority(approver.role, requiredApprover.role)) {
    validations.push({
      valid: false,
      rule: 'insufficient_authority',
      message: `Requires ${requiredApprover.role} approval for amount ${po.totalAmount}`
    });
  }
  
  // Rule: Department heads can only approve their department's POs
  if (approver.role === 'Department Head' && po.department !== approver.department) {
    validations.push({
      valid: false,
      rule: 'department_mismatch',
      message: 'Can only approve purchase orders from your department'
    });
  }
  
  // Rule: Check vendor compliance
  if (!isVendorCompliant(po.vendorId)) {
    validations.push({
      valid: false,
      rule: 'vendor_non_compliant',
      message: 'Vendor does not meet compliance requirements'
    });
  }
  
  return validations;
}
```

### 2.5 Vendor Management Rules

#### 2.5.1 Vendor Validation
```javascript
function validateVendorForPO(vendor, po) {
  const validations = [];
  
  // Rule: Vendor must be active
  if (vendor.status !== 'Active') {
    validations.push({
      valid: false,
      rule: 'vendor_inactive',
      message: 'Vendor is not active'
    });
  }
  
  // Rule: Check credit limit
  const outstandingAmount = getVendorOutstandingAmount(vendor.id);
  if (outstandingAmount + po.totalAmount > vendor.creditLimit) {
    validations.push({
      valid: false,
      rule: 'credit_limit_exceeded',
      message: `PO would exceed vendor credit limit of ${vendor.creditLimit}`
    });
  }
  
  // Rule: Check payment terms
  if (!vendor.paymentTerms.includes(po.paymentTerms)) {
    validations.push({
      valid: false,
      rule: 'invalid_payment_terms',
      message: 'Payment terms not supported by vendor'
    });
  }
  
  // Rule: Validate delivery capability
  if (!canVendorDeliverToLocation(vendor.id, po.deliveryLocation)) {
    validations.push({
      valid: false,
      rule: 'delivery_not_supported',
      message: 'Vendor does not deliver to specified location'
    });
  }
  
  return validations;
}
```

### 2.6 Budget Control Rules

#### 2.6.1 Budget Validation
```javascript
function validateBudgetCompliance(po) {
  const budgetPeriod = getCurrentBudgetPeriod();
  const departmentBudget = getBudgetAllocation(po.department, budgetPeriod);
  
  const validations = [];
  
  // Rule: Check department budget availability
  const spentAmount = getDepartmentSpentAmount(po.department, budgetPeriod);
  const availableBudget = departmentBudget.totalAllocation - spentAmount;
  
  if (po.totalAmount > availableBudget) {
    validations.push({
      valid: false,
      rule: 'insufficient_budget',
      message: `Insufficient budget. Available: ${availableBudget}, Required: ${po.totalAmount}`
    });
  }
  
  // Rule: Check category-specific budgets
  const categoryAllocations = getCategoryBudgetAllocations(po.department, budgetPeriod);
  const poCategories = getItemCategories(po.items);
  
  for (const category of poCategories) {
    const categorySpent = getCategorySpentAmount(po.department, category, budgetPeriod);
    const categoryAvailable = categoryAllocations[category] - categorySpent;
    const categoryAmount = getCategoryAmount(po.items, category);
    
    if (categoryAmount > categoryAvailable) {
      validations.push({
        valid: false,
        rule: 'category_budget_exceeded',
        message: `Category ${category} budget exceeded. Available: ${categoryAvailable}, Required: ${categoryAmount}`
      });
    }
  }
  
  return validations;
}
```

### 2.7 Inventory Integration Rules

#### 2.7.1 Stock Validation
```javascript
function validateStockImpact(po) {
  const validations = [];
  
  po.items.forEach(item => {
    const stockInfo = getItemStock(item.itemId, item.location);
    
    // Rule: Check if item affects inventory
    if (item.affectsInventory) {
      // Rule: Warn if ordering below reorder level
      if (stockInfo.currentLevel <= stockInfo.reorderLevel) {
        validations.push({
          valid: true,
          rule: 'reorder_level_warning',
          message: `Item ${item.name} is below reorder level (${stockInfo.reorderLevel})`
        });
      }
      
      // Rule: Check maximum stock level
      const projectedStock = stockInfo.currentLevel + item.quantity;
      if (projectedStock > stockInfo.maxLevel) {
        validations.push({
          valid: false,
          rule: 'max_stock_exceeded',
          message: `Ordering ${item.quantity} would exceed maximum stock level`
        });
      }
    }
    
    // Rule: Validate unit of measure conversion
    if (item.orderUnit !== item.stockUnit) {
      if (!hasValidUOMConversion(item.orderUnit, item.stockUnit)) {
        validations.push({
          valid: false,
          rule: 'invalid_uom_conversion',
          message: `Cannot convert from ${item.orderUnit} to ${item.stockUnit}`
        });
      }
    }
  });
  
  return validations;
}
```

### 2.8 Document Management Rules

#### 2.8.1 Attachment Rules
```javascript
function validateAttachments(po, attachments) {
  const validations = [];
  
  // Rule: Maximum file size
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  attachments.forEach(file => {
    if (file.size > maxFileSize) {
      validations.push({
        valid: false,
        rule: 'file_size_exceeded',
        message: `File ${file.name} exceeds maximum size of 10MB`
      });
    }
  });
  
  // Rule: Allowed file types
  const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png'];
  attachments.forEach(file => {
    const extension = getFileExtension(file.name);
    if (!allowedTypes.includes(extension)) {
      validations.push({
        valid: false,
        rule: 'invalid_file_type',
        message: `File type ${extension} not allowed`
      });
    }
  });
  
  // Rule: Mandatory documents for high-value POs
  if (po.totalAmount > 25000) {
    const requiredDocTypes = ['quote', 'specification'];
    const providedDocTypes = attachments.map(att => att.documentType);
    
    requiredDocTypes.forEach(reqType => {
      if (!providedDocTypes.includes(reqType)) {
        validations.push({
          valid: false,
          rule: 'mandatory_document_missing',
          message: `${reqType} document required for POs over $25,000`
        });
      }
    });
  }
  
  return validations;
}
```

### 2.9 Tax Calculation Rules

#### 2.9.1 Tax Rate Determination
```javascript
function determineTaxRate(item, vendor, deliveryLocation) {
  // Rule: Tax rate based on item category and delivery location
  const itemCategory = getItemCategory(item.itemId);
  const locationTaxRules = getTaxRules(deliveryLocation);
  
  // Rule: Some items are tax-exempt
  if (isTaxExemptCategory(itemCategory)) {
    return 0;
  }
  
  // Rule: Vendor tax status affects calculation
  if (vendor.taxExempt) {
    return 0;
  }
  
  // Rule: Location-based tax rates
  const applicableRate = locationTaxRules.find(rule => 
    rule.categoryId === itemCategory.id
  );
  
  return applicableRate ? applicableRate.rate : locationTaxRules.defaultRate;
}
```

#### 2.9.2 Tax Calculation Method
```javascript
function calculateTaxAmount(item, taxRate, taxInclusivePrice = false) {
  if (taxInclusivePrice) {
    // Rule: For tax-inclusive pricing, extract tax from total
    const taxMultiplier = 1 + (taxRate / 100);
    const netAmount = roundBankers(item.totalAmount / taxMultiplier, 2);
    const taxAmount = roundBankers(item.totalAmount - netAmount, 2);
    
    return {
      netAmount,
      taxAmount,
      totalAmount: item.totalAmount
    };
  } else {
    // Rule: For tax-exclusive pricing, add tax to net
    const netAmount = item.quantity * item.unitPrice - item.discountAmount;
    const taxAmount = roundBankers(netAmount * (taxRate / 100), 2);
    const totalAmount = roundBankers(netAmount + taxAmount, 2);
    
    return {
      netAmount: roundBankers(netAmount, 2),
      taxAmount,
      totalAmount
    };
  }
}
```

### 2.10 Audit and Compliance Rules

#### 2.10.1 Audit Trail Requirements
```javascript
function logPOActivity(po, action, user, details = {}) {
  const auditLog = {
    documentType: 'PurchaseOrder',
    documentId: po.id,
    documentNumber: po.number,
    action,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    timestamp: new Date(),
    ipAddress: user.ipAddress,
    details: {
      oldValues: details.oldValues || {},
      newValues: details.newValues || {},
      reason: details.reason || '',
      ...details
    }
  };
  
  // Rule: All PO changes must be logged
  saveAuditLog(auditLog);
  
  // Rule: Notify relevant parties of significant changes
  if (isSignificantChange(action)) {
    notifyStakeholders(po, action, user);
  }
}
```

#### 2.10.2 Compliance Checks
```javascript
function performComplianceChecks(po) {
  const checks = [];
  
  // Rule: Segregation of duties check
  if (po.createdBy === po.approvedBy) {
    checks.push({
      type: 'SOD_VIOLATION',
      severity: 'HIGH',
      message: 'Segregation of duties violation: same person created and approved'
    });
  }
  
  // Rule: Three-way matching for high-value POs
  if (po.totalAmount > 10000 && po.status === 'FullyReceived') {
    const hasGRN = hasLinkedGRN(po.id);
    const hasInvoice = hasLinkedInvoice(po.id);
    
    if (!hasGRN || !hasInvoice) {
      checks.push({
        type: 'THREE_WAY_MATCH_INCOMPLETE',
        severity: 'MEDIUM',
        message: 'Three-way matching incomplete: missing GRN or invoice'
      });
    }
  }
  
  // Rule: Vendor compliance check
  const vendorCompliance = checkVendorCompliance(po.vendorId);
  if (!vendorCompliance.compliant) {
    checks.push({
      type: 'VENDOR_NON_COMPLIANCE',
      severity: 'HIGH',
      message: `Vendor compliance issues: ${vendorCompliance.issues.join(', ')}`
    });
  }
  
  return checks;
}
```

## 3. Integration Business Rules

### 3.1 Purchase Request Integration

#### 3.1.1 PR-to-PO Linkage Rules
```javascript
function linkPRsToPO(po, sourceReferences) {
  // Rule: Maintain bidirectional links
  sourceReferences.forEach(ref => {
    // Update PR with PO reference
    updatePurchaseRequest(ref.prId, {
      linkedPOId: po.id,
      linkedPONumber: po.number,
      status: 'ConvertedToPO'
    });
    
    // Update PO with PR reference
    po.sourceReferences = po.sourceReferences || [];
    po.sourceReferences.push({
      type: 'PurchaseRequest',
      id: ref.prId,
      number: ref.prNumber,
      convertedDate: new Date()
    });
  });
  
  // Rule: PR quantities must match PO quantities
  validateQuantityAlignment(po, sourceReferences);
}
```

### 3.2 Goods Received Note Integration

#### 3.2.1 GRN Creation Rules
```javascript
function createGRNFromPO(po, receivedItems) {
  // Rule: Can only receive items that are on the PO
  const validItems = receivedItems.filter(item => 
    po.items.some(poItem => poItem.id === item.poItemId)
  );
  
  // Rule: Cannot receive more than ordered quantity
  validItems.forEach(item => {
    const poItem = po.items.find(pi => pi.id === item.poItemId);
    const previouslyReceived = getPreviouslyReceivedQuantity(poItem.id);
    const totalReceiving = previouslyReceived + item.receivedQuantity;
    
    if (totalReceiving > poItem.quantity) {
      throw new Error(`Cannot receive ${item.receivedQuantity}. Would exceed ordered quantity.`);
    }
  });
  
  // Rule: Update PO status based on receipt percentage
  const receiptPercentage = calculateReceiptPercentage(po, receivedItems);
  if (receiptPercentage >= 100) {
    po.status = 'FullyReceived';
  } else if (receiptPercentage > 0) {
    po.status = 'Partial';
  }
  
  return validItems;
}
```

## 4. Error Handling and Business Rules

### 4.1 Error Classification
```javascript
const errorTypes = {
  VALIDATION_ERROR: {
    code: 'VAL_001',
    severity: 'MEDIUM',
    userMessage: 'Please correct the highlighted fields',
    logLevel: 'WARN'
  },
  BUSINESS_RULE_VIOLATION: {
    code: 'BUS_001',
    severity: 'HIGH',
    userMessage: 'Business rule violation detected',
    logLevel: 'ERROR'
  },
  PERMISSION_DENIED: {
    code: 'AUTH_001',
    severity: 'HIGH',
    userMessage: 'Insufficient permissions for this action',
    logLevel: 'WARN'
  },
  SYSTEM_ERROR: {
    code: 'SYS_001',
    severity: 'CRITICAL',
    userMessage: 'System error occurred. Please try again.',
    logLevel: 'ERROR'
  }
};
```

### 4.2 Business Rule Recovery
```javascript
function handleBusinessRuleViolation(rule, po, context) {
  switch (rule.type) {
    case 'BUDGET_EXCEEDED':
      return {
        action: 'REQUEST_BUDGET_INCREASE',
        message: 'Would you like to request additional budget approval?',
        options: ['Request Approval', 'Modify PO', 'Cancel']
      };
      
    case 'CREDIT_LIMIT_EXCEEDED':
      return {
        action: 'VENDOR_CREDIT_OPTIONS',
        message: 'Vendor credit limit exceeded. Choose an option:',
        options: ['Request Credit Increase', 'Split PO', 'Choose Different Vendor']
      };
      
    case 'APPROVAL_AUTHORITY_INSUFFICIENT':
      return {
        action: 'ESCALATE_APPROVAL',
        message: 'Escalating to higher approval authority',
        automaticAction: true
      };
      
    default:
      return {
        action: 'MANUAL_REVIEW',
        message: 'Manual review required for this business rule violation'
      };
  }
}
```

This comprehensive business logic documentation ensures consistent, compliant, and efficient operation of the Purchase Order module across all user interactions and system integrations.