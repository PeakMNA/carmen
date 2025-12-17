/**
 * Vendor Management Types
 * 
 * Types and interfaces for vendor management including vendor profiles,
 * contacts, certifications, price lists, and vendor relationships.
 */

import { AuditTimestamp, ActivityStatus, Contact, Address, Money } from './common'

// ====== VENDOR CORE TYPES ======

/**
 * Vendor business types
 */
export type VendorBusinessType = 
  | 'manufacturer' 
  | 'distributor' 
  | 'wholesaler' 
  | 'retailer' 
  | 'service_provider' 
  | 'contractor'
  | 'consultant';

/**
 * Vendor status types
 */
export type VendorStatus = 'active' | 'inactive' | 'suspended' | 'blacklisted' | 'under_review';

/**
 * Vendor main profile
 */
export interface Vendor {
  id: string;
  vendorCode: string;
  companyName: string;
  displayName?: string;
  businessRegistrationNumber: string;
  taxId: string;
  vatNumber?: string;
  establishmentDate: string;
  businessType: VendorBusinessType;
  industryCategory?: string;
  status: VendorStatus;
  rating: number; // 0-5 stars
  isActive: boolean;
  // Relationships
  addresses: VendorAddress[];
  contacts: VendorContact[];
  certifications: VendorCertification[];
  bankAccounts: VendorBankAccount[];
  // Preferences
  preferredCurrency: string;
  preferredPaymentTerms: string;
  creditLimit?: Money;
  creditDays?: number;
  // Performance metrics
  onTimeDeliveryRate?: number; // percentage
  qualityRating?: number; // 0-5
  priceCompetitiveness?: number; // 0-5
  // Audit trail
  approvedBy?: string;
  approvedAt?: Date;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
}

/**
 * Vendor address with type specification
 */
export interface VendorAddress extends Address {
  vendorId: string;
  isHeadOffice?: boolean;
  isWarehouse?: boolean;
  operatingHours?: string;
  contactPerson?: string;
  contactPhone?: string;
}

/**
 * Vendor contact information
 */
export interface VendorContact extends Contact {
  vendorId: string;
  title?: string;
  alternativeEmail?: string;
  alternativePhone?: string;
  linkedInProfile?: string;
  isDecisionMaker?: boolean;
  canReceiveOrders?: boolean;
  canReceiveInvoices?: boolean;
  canReceivePayments?: boolean;
  specializations?: string[]; // Areas of expertise
}

// ====== VENDOR CERTIFICATIONS ======

/**
 * Certification status
 */
export type CertificationStatus = 'active' | 'expired' | 'suspended' | 'revoked' | 'pending';

/**
 * Vendor certification
 */
export interface VendorCertification {
  id: string;
  vendorId: string;
  certificationType: string;
  name: string;
  description?: string;
  issuer: string;
  issueDate: Date;
  validUntil: Date;
  status: CertificationStatus;
  certificateNumber?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  documentUrl?: string;
  notificationDays?: number; // Days before expiry to notify
}

// ====== VENDOR BANKING ======

/**
 * Vendor bank account information
 */
export interface VendorBankAccount {
  id: string;
  vendorId: string;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'business';
  currency: string;
  iban?: string;
  swiftCode?: string;
  routingNumber?: string;
  branchAddress?: string;
  isPrimary: boolean;
  isActive: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

// ====== VENDOR PRICE LISTS ======

/**
 * Price list validity and status
 * Updated: 2025-11-17 - Changed 'expired' to 'inactive' per ARC-2410-001
 */
export type PriceListStatus = 'draft' | 'active' | 'inactive' | 'superseded' | 'cancelled';

/**
 * Vendor price list header
 * Updated: 2025-11-17 - Changed effectiveDate to effectiveStartDate/effectiveEndDate per ARC-2410-001
 */
export interface VendorPriceList {
  id: string;
  vendorId: string;
  priceListName: string;
  priceListCode: string;
  description?: string;
  currency: string;
  currencyCode: string; // Added: ISO 4217 currency code
  effectiveStartDate: Date; // Changed from effectiveDate
  effectiveEndDate?: Date | null; // Changed from expiryDate, null = open-ended
  status: PriceListStatus;
  version: string;
  supersedes?: string; // ID of previous price list
  // Terms and conditions
  minimumOrderValue?: Money;
  paymentTerms?: string;
  deliveryTerms?: string;
  validityPeriod?: number; // in days
  // Discounts
  volumeDiscounts: VolumeDiscount[];
  earlyPaymentDiscount?: number; // percentage
  // Metadata
  totalItems: number;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  publishedBy?: string;
  publishedAt?: Date;
  notes?: string;
  attachments?: string[];
}

/**
 * Volume discount tiers
 */
export interface VolumeDiscount {
  id: string;
  minQuantity: number;
  maxQuantity?: number;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  description?: string;
}

/**
 * Price list item
 * Updated: 2025-11-17 - Added FOC, tax fields, product_identifier per ARC-2410-001
 */
export interface VendorPriceListItem {
  id: string;
  priceListId: string;
  itemId?: string; // Optional for non-catalog items
  itemCode: string;
  itemName: string;
  productIdentifier: string; // Added: Combined product number and name (format: "CODE - NAME")
  description: string; // Made required - now primary display field
  specification?: string;
  brandOffered?: string;
  modelNumber?: string;
  unit: string;
  unitPrice: Money;
  minimumOrderQuantity: number;
  leadTimeDays?: number; // Made optional
  // Tax information (Added per ARC-2410-001)
  isFoc: boolean; // Free of Charge indicator
  taxProfileId?: string; // Optional FK to tax profile
  taxRate?: number; // Tax rate percentage (0-100)
  isPreferredVendor: boolean; // Preferred vendor flag
  // Packaging information
  packSize?: number;
  packUnit?: string;
  packPrice?: Money;
  // Additional charges
  setupFee?: Money;
  shippingCharge?: Money;
  handlingCharge?: Money;
  // Validity
  itemEffectiveDate?: Date;
  itemExpiryDate?: Date;
  // Discounts specific to this item
  itemDiscounts: VolumeDiscount[];
  notes?: string;
  isActive: boolean;
}

/**
 * Tax Profile
 * Added: 2025-11-17 - Support for tax profiles per ARC-2410-001
 */
export interface TaxProfile {
  id: string;
  name: string;
  description?: string;
  taxRate: number; // Tax rate percentage (0-100)
  taxType: 'VAT' | 'GST' | 'Sales Tax' | 'Other';
  isActive: boolean;
  effectiveDate?: Date;
  expiryDate?: Date;
  countryCode?: string; // ISO country code
  stateCode?: string; // State/province code
  notes?: string;
}

/**
 * Import Result for bulk price list item imports
 * Added: 2025-11-17 - Support for bulk import feature per ARC-2410-001
 */
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: ImportError[];
  importedAt: Date;
  importedBy: string;
}

/**
 * Import Error details
 * Added: 2025-11-17 - Error tracking for imports per ARC-2410-001
 */
export interface ImportError {
  row: number;
  field: string;
  value?: any;
  error: string;
  severity: 'error' | 'warning';
}

// ====== VENDOR CATEGORIES ======

/**
 * Vendor category for classification
 */
export interface VendorCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  code?: string;
  isActive: boolean;
  // Approval workflow requirements
  requiresApproval: boolean;
  approvalLimit?: Money;
  defaultPaymentTerms?: string;
}

/**
 * Vendor category assignment
 */
export interface VendorCategoryAssignment {
  id: string;
  vendorId: string;
  categoryId: string;
  isPrimary: boolean;
  assignedBy: string;
  assignedAt: Date;
  notes?: string;
}

// ====== VENDOR PERFORMANCE ======

/**
 * Vendor performance metrics
 */
export interface VendorPerformanceMetrics {
  vendorId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  // Order statistics
  totalOrders: number;
  totalValue: Money;
  averageOrderValue: Money;
  // Delivery performance
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeDeliveryRate: number; // percentage
  averageDeliveryTime: number; // in days
  // Quality metrics
  qualityAcceptanceRate: number; // percentage
  defectRate: number; // percentage
  returnRate: number; // percentage
  // Invoice accuracy
  invoiceAccuracyRate: number; // percentage
  // Overall ratings
  qualityRating: number; // 0-5
  serviceRating: number; // 0-5
  priceRating: number; // 0-5
  overallRating: number; // 0-5
  // Calculated metrics
  lastUpdated: Date;
}

// ====== VENDOR CONTRACTS ======

/**
 * Contract types
 */
export type ContractType = 'purchase_agreement' | 'service_agreement' | 'framework_agreement' | 'blanket_order';

/**
 * Contract status
 */
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';

/**
 * Vendor contract
 */
export interface VendorContract {
  id: string;
  contractNumber: string;
  vendorId: string;
  contractType: ContractType;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  autoRenewal: boolean;
  renewalPeriod?: number; // in months
  noticeRequired?: number; // days before expiry
  // Financial terms
  contractValue?: Money;
  currency: string;
  paymentTerms: string;
  // Legal terms
  governingLaw?: string;
  jurisdiction?: string;
  penaltyClauses?: string[];
  // Management
  contractManager: string;
  vendorSignatory: string;
  signedDate?: Date;
  // Documents
  documentUrl?: string;
  attachments?: string[];
  // Notifications
  expiryNotificationSent: boolean;
  lastNotificationDate?: Date;
}

// ====== VENDOR ONBOARDING ======

/**
 * Vendor onboarding status
 */
export type OnboardingStatus = 'initiated' | 'documents_pending' | 'under_review' | 'approved' | 'rejected' | 'completed';

/**
 * Vendor onboarding process
 */
export interface VendorOnboarding {
  id: string;
  vendorId: string;
  onboardingNumber: string;
  status: OnboardingStatus;
  initiatedBy: string;
  initiatedAt: Date;
  // Required documents
  requiredDocuments: OnboardingDocument[];
  // Approval workflow
  approvalStages: OnboardingApprovalStage[];
  currentStage?: string;
  // Completion
  completedBy?: string;
  completedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  notes?: string;
}

/**
 * Onboarding document requirement
 */
export interface OnboardingDocument {
  id: string;
  documentType: string;
  documentName: string;
  isRequired: boolean;
  isSubmitted: boolean;
  submittedAt?: Date;
  documentUrl?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  rejectionReason?: string;
}

/**
 * Onboarding approval stage
 */
export interface OnboardingApprovalStage {
  id: string;
  stageName: string;
  order: number;
  assignedTo: string;
  status: 'pending' | 'approved' | 'rejected';
  completedBy?: string;
  completedAt?: Date;
  comments?: string;
}

// ====== VENDOR COMMUNICATION ======

/**
 * Communication types with vendors
 */
export type CommunicationType = 'email' | 'phone' | 'meeting' | 'letter' | 'portal' | 'other';

/**
 * Vendor communication log
 */
export interface VendorCommunication {
  id: string;
  vendorId: string;
  communicationType: CommunicationType;
  subject: string;
  description: string;
  initiatedBy: string;
  communicationDate: Date;
  // Participants
  vendorContacts: string[]; // Contact IDs
  internalParticipants: string[]; // User IDs
  // Follow-up
  requiresFollowUp: boolean;
  followUpDate?: Date;
  followUpBy?: string;
  isFollowUpCompleted: boolean;
  // Attachments
  attachments?: string[];
  // Categorization
  category?: string;
  priority: 'low' | 'normal' | 'high';
}