# Vendor Directory - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Vendor Directory
- **Version**: 2.2.0
- **Last Updated**: 2025-11-25
- **Document Status**: Updated

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.2.0 | 2025-11-25 | System | Added certification management validations (16 types, status auto-calculation, 30-day threshold); Added Asian international address format validations (15 countries, subDistrict, district fields, country-specific postal codes) |
| 2.1.0 | 2025-11-25 | System | Added multi-address and multi-contact management validations |
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation |
| 1.0 | 2024-01-15 | System | Initial creation |

---

## 1. Introduction

This document defines all validation rules, error messages, and data integrity constraints for the Vendor Directory module. It includes field-level validations, business rule validations, Zod schemas, database constraints, and API validation specifications.

---

## 2. Field-Level Validations

### 2.1 Vendor Basic Information

#### Vendor Code
**Field**: `vendorCode` (stored in `tb_vendor.info['profile']['vendorCode']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Vendor code is required" |
| Unique | Must be unique across active vendors | "Vendor code already exists. Please use a unique code." |
| Format | Alphanumeric with hyphens, 3-20 characters | "Vendor code must be 3-20 characters (letters, numbers, hyphens only)" |
| Pattern | Matches: `^[A-Z0-9-]+$` | "Vendor code must contain only uppercase letters, numbers, and hyphens" |

**Zod Schema**:
```typescript
vendorCode: z.string()
  .min(3, 'Vendor code must be at least 3 characters')
  .max(20, 'Vendor code must not exceed 20 characters')
  .regex(/^[A-Z0-9-]+$/, 'Vendor code must contain only uppercase letters, numbers, and hyphens')
  .refine(async (code) => {
    // Check uniqueness in database
    const existing = await prisma.tb_vendor.findFirst({
      where: {
        info: {
          path: ['profile', 'vendorCode'],
          equals: code,
        },
        deleted_at: null,
      },
    });
    return !existing;
  }, 'Vendor code already exists')
```

#### Company Name
**Field**: `name` (stored in `tb_vendor.name`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Company name is required" |
| Length | 2-200 characters | "Company name must be 2-200 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "Company name contains invalid characters" |
| Unique | Warn if duplicate within active vendors | "A vendor with this name already exists. Continue anyway?" |

**Zod Schema**:
```typescript
name: z.string()
  .min(2, 'Company name must be at least 2 characters')
  .max(200, 'Company name must not exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Company name contains invalid characters')
```

#### Legal Name
**Field**: `legalName` (stored in `tb_vendor.info['profile']['legalName']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | 2-200 characters if provided | "Legal name must be 2-200 characters" |
| Format | Letters, numbers, spaces, and legal entity suffixes | "Legal name contains invalid characters" |

**Zod Schema**:
```typescript
legalName: z.string()
  .min(2, 'Legal name must be at least 2 characters')
  .max(200, 'Legal name must not exceed 200 characters')
  .optional()
  .or(z.literal(''))
```

#### Website
**Field**: `website` (stored in `tb_vendor.info['profile']['website']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | Valid URL format | "Invalid website URL. Must start with http:// or https://" |
| Protocol | Must include http:// or https:// | "Website URL must include protocol (http:// or https://)" |
| Length | Max 500 characters | "Website URL must not exceed 500 characters" |

**Zod Schema**:
```typescript
website: z.string()
  .url('Invalid website URL')
  .max(500, 'Website URL must not exceed 500 characters')
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Website URL must start with http:// or https://',
  })
  .optional()
  .or(z.literal(''))
```

#### Description
**Field**: `description` (stored in `tb_vendor.description`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 2000 characters | "Description must not exceed 2000 characters" |
| Format | Plain text, no HTML | "Description cannot contain HTML tags" |

**Zod Schema**:
```typescript
description: z.string()
  .max(2000, 'Description must not exceed 2000 characters')
  .refine((text) => !/<[^>]*>/.test(text), 'Description cannot contain HTML tags')
  .optional()
```

#### Business Type
**Field**: `business_type_id` (stored in `tb_vendor.business_type_id`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a type | "Business type is required" |
| Valid | Must exist in business types list | "Invalid business type selected" |

**Zod Schema**:
```typescript
business_type_id: z.string()
  .min(1, 'Business type is required')
  .uuid('Invalid business type ID')
```

### 2.2 Contact Information

#### Contact Name
**Field**: `fullName` (stored in `tb_vendor_contact.info['fullName']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Contact name is required" |
| Length | 2-100 characters | "Contact name must be 2-100 characters" |
| Format | Letters, spaces, hyphens, apostrophes | "Contact name contains invalid characters" |

**Zod Schema**:
```typescript
fullName: z.string()
  .min(2, 'Contact name must be at least 2 characters')
  .max(100, 'Contact name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Contact name contains invalid characters')
```

#### Email
**Field**: `primaryEmail` (stored in `tb_vendor_contact.info['contactMethods']['primaryEmail']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Email address is required" |
| Format | Valid email format (RFC 5322) | "Invalid email address format" |
| Length | Max 320 characters | "Email address must not exceed 320 characters" |
| Domain | Valid domain with MX records (optional check) | "Email domain does not accept mail" |
| Duplicate | Warn if email exists for same vendor | "This email address already exists for this vendor" |

**Zod Schema**:
```typescript
primaryEmail: z.string()
  .email('Invalid email address format')
  .max(320, 'Email address must not exceed 320 characters')
  .refine((email) => {
    // Check for disposable email domains (optional)
    const disposableDomains = ['tempmail.com', 'throwaway.email'];
    const domain = email.split('@')[1];
    return !disposableDomains.includes(domain);
  }, 'Disposable email addresses are not allowed')
```

#### Phone Number
**Field**: `phoneNumbers` (stored in `tb_vendor_contact.info['contactMethods']['phoneNumbers']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | Valid phone format for country | "Invalid phone number format for selected country" |
| Country Code | Valid ISO country code | "Invalid country code" |
| Length | 7-15 digits (excluding formatting) | "Phone number must be 7-15 digits" |

**Zod Schema**:
```typescript
phoneNumbers: z.array(z.object({
  type: z.enum(['office', 'mobile', 'home', 'fax']),
  countryCode: z.string()
    .length(2, 'Country code must be 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),
  number: z.string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number format'),
  extension: z.string()
    .max(10, 'Extension must not exceed 10 digits')
    .regex(/^\d*$/, 'Extension must contain only digits')
    .optional(),
  isPrimary: z.boolean().default(false),
})).optional()
```

### 2.3 Financial Information

#### Payment Terms
**Field**: `paymentTermsType` (stored in `tb_vendor.info['paymentTerms']['termsType']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select payment terms | "Payment terms are required" |
| Valid | Must be one of predefined types | "Invalid payment terms selected" |

**Zod Schema**:
```typescript
paymentTermsType: z.enum([
  'net_7',
  'net_15',
  'net_30',
  'net_45',
  'net_60',
  'net_90',
  'custom',
], {
  errorMap: () => ({ message: 'Invalid payment terms selected' }),
}).default('net_30')
```

#### Days Net
**Field**: `daysNet` (stored in `tb_vendor.info['paymentTerms']['daysNet']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide number of days | "Payment days is required" |
| Type | Must be integer | "Payment days must be a whole number" |
| Range | 0-365 days | "Payment days must be between 0 and 365" |
| Consistency | Must match payment terms type | "Payment days must match selected payment terms" |

**Zod Schema**:
```typescript
daysNet: z.number()
  .int('Payment days must be a whole number')
  .min(0, 'Payment days cannot be negative')
  .max(365, 'Payment days must not exceed 365')
  .default(30)
```

#### Credit Limit
**Field**: `creditLimit` (stored in `tb_vendor.info['paymentTerms']['creditLimit']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide credit limit | "Credit limit is required" |
| Type | Must be number | "Credit limit must be a number" |
| Range | 0 to 999,999,999 | "Credit limit must be between 0 and 999,999,999" |
| Precision | Max 2 decimal places | "Credit limit must have at most 2 decimal places" |

**Zod Schema**:
```typescript
creditLimit: z.number()
  .min(0, 'Credit limit cannot be negative')
  .max(999999999, 'Credit limit must not exceed 999,999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }, 'Credit limit must have at most 2 decimal places')
  .default(0)
```

#### Currency
**Field**: `defaultCurrency` (stored in `tb_vendor.info['paymentTerms']['defaultCurrency']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select currency | "Currency is required" |
| Format | ISO 4217 code (3 letters) | "Invalid currency code" |
| Valid | Must exist in supported currencies | "Currency not supported" |

**Zod Schema**:
```typescript
defaultCurrency: z.string()
  .length(3, 'Currency code must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
  .refine((code) => {
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
    return supportedCurrencies.includes(code);
  }, 'Currency not supported')
  .default('USD')
```

### 2.4 Address Information (Asian International Format)

#### Address Line 1
**Field**: `addressLine1` (stored in `tb_vendor_address.data['addressLine1']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Address line 1 is required" |
| Length | 5-200 characters | "Address must be 5-200 characters" |
| Format | Letters, numbers, spaces, common punctuation, Unicode | "Address contains invalid characters" |

**Zod Schema**:
```typescript
addressLine1: z.string()
  .min(5, 'Address must be at least 5 characters')
  .max(200, 'Address must not exceed 200 characters')
```

#### Address Line 2
**Field**: `addressLine2` (stored in `tb_vendor_address.data['addressLine2']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 200 characters | "Address line 2 must not exceed 200 characters" |

**Zod Schema**:
```typescript
addressLine2: z.string()
  .max(200, 'Address line 2 must not exceed 200 characters')
  .optional()
  .or(z.literal(''))
```

#### Sub-District (Asian Address Field)
**Field**: `subDistrict` (stored in `tb_vendor_address.data['subDistrict']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty (recommended for Asian countries) | N/A |
| Length | Max 100 characters | "Sub-district must not exceed 100 characters" |
| Format | Letters, numbers, spaces, Unicode | "Sub-district contains invalid characters" |

**Country-Specific Labels**:
| Country | Label | Local Name |
|---------|-------|------------|
| Thailand | Sub-District | ตำบล (Tambon) |
| Indonesia | Sub-District | Kelurahan |
| Malaysia | Sub-District | Mukim |

**Zod Schema**:
```typescript
subDistrict: z.string()
  .max(100, 'Sub-district must not exceed 100 characters')
  .optional()
  .or(z.literal(''))
```

#### District (Asian Address Field)
**Field**: `district` (stored in `tb_vendor_address.data['district']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty (recommended for Asian countries) | N/A |
| Length | Max 100 characters | "District must not exceed 100 characters" |
| Format | Letters, numbers, spaces, Unicode | "District contains invalid characters" |

**Country-Specific Labels**:
| Country | Label | Local Name |
|---------|-------|------------|
| Thailand | District | อำเภอ (Amphoe) |
| Indonesia | District | Kecamatan / Kabupaten/Kota |
| Vietnam | District | Quận/Huyện |

**Zod Schema**:
```typescript
district: z.string()
  .max(100, 'District must not exceed 100 characters')
  .optional()
  .or(z.literal(''))
```

#### City
**Field**: `city` (stored in `tb_vendor_address.data['city']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "City is required" |
| Length | 2-100 characters | "City must be 2-100 characters" |

**Zod Schema**:
```typescript
city: z.string()
  .min(2, 'City must be at least 2 characters')
  .max(100, 'City must not exceed 100 characters')
```

#### Province/State
**Field**: `province` (stored in `tb_vendor_address.data['province']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Province/State is required" |
| Length | 2-100 characters | "Province must be 2-100 characters" |

**Country-Specific Labels**:
| Country | Label |
|---------|-------|
| Thailand | Province (จังหวัด) |
| Indonesia | Province (Provinsi) |
| Malaysia | State (Negeri) |
| Vietnam | Province (Tỉnh) |
| United States | State |
| Others | Province/State |

**Zod Schema**:
```typescript
province: z.string()
  .min(2, 'Province must be at least 2 characters')
  .max(100, 'Province must not exceed 100 characters')
```

#### Postal Code
**Field**: `postalCode` (stored in `tb_vendor_address.data['postalCode']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Postal code is required" |
| Format | Varies by country | "Invalid postal code format for selected country" |
| Length | 3-10 characters | "Postal code must be 3-10 characters" |

**Country-Specific Postal Code Formats (15 Countries)**:
| Country | Code | Format | Pattern | Example |
|---------|------|--------|---------|---------|
| Thailand | TH | 5 digits | `^\d{5}$` | 10110 |
| Singapore | SG | 6 digits | `^\d{6}$` | 123456 |
| Malaysia | MY | 5 digits | `^\d{5}$` | 50450 |
| Indonesia | ID | 5 digits | `^\d{5}$` | 12345 |
| Vietnam | VN | 6 digits | `^\d{6}$` | 100000 |
| Philippines | PH | 4 digits | `^\d{4}$` | 1234 |
| Myanmar | MM | 5 digits | `^\d{5}$` | 11011 |
| Cambodia | KH | 5 digits | `^\d{5}$` | 12000 |
| Laos | LA | 5 digits | `^\d{5}$` | 01000 |
| Brunei | BN | 6 alphanumeric | `^[A-Z]{2}\d{4}$` | KB1234 |
| China | CN | 6 digits | `^\d{6}$` | 100000 |
| Japan | JP | 7 digits with hyphen | `^\d{3}-\d{4}$` | 100-0001 |
| South Korea | KR | 5 digits | `^\d{5}$` | 12345 |
| India | IN | 6 digits | `^\d{6}$` | 110001 |
| United States | US | 5 or 9 digits | `^\d{5}(-\d{4})?$` | 12345 or 12345-6789 |

**Zod Schema**:
```typescript
postalCode: z.string()
  .min(3, 'Postal code must be at least 3 characters')
  .max(10, 'Postal code must not exceed 10 characters')
  .superRefine((code, ctx) => {
    const country = ctx.path.includes('country') ? ctx.parent?.country : 'default';
    const formats: Record<string, RegExp> = {
      'TH': /^\d{5}$/,
      'SG': /^\d{6}$/,
      'MY': /^\d{5}$/,
      'ID': /^\d{5}$/,
      'VN': /^\d{6}$/,
      'PH': /^\d{4}$/,
      'MM': /^\d{5}$/,
      'KH': /^\d{5}$/,
      'LA': /^\d{5}$/,
      'BN': /^[A-Z]{2}\d{4}$/,
      'CN': /^\d{6}$/,
      'JP': /^\d{3}-\d{4}$/,
      'KR': /^\d{5}$/,
      'IN': /^\d{6}$/,
      'US': /^\d{5}(-\d{4})?$/,
    };
    const pattern = formats[country] || /^[A-Z0-9\s\-]+$/i;
    if (!pattern.test(code)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid postal code format for ${country}`,
      });
    }
  })
```

#### Country
**Field**: `country` (stored in `tb_vendor_address.data['country']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select country | "Country is required" |
| Format | ISO 3166-1 alpha-2 code | "Invalid country code" |
| Valid | Must exist in 15 supported countries | "Country not supported" |

**Supported Countries (15)**:
| Code | Country Name |
|------|--------------|
| TH | Thailand |
| SG | Singapore |
| MY | Malaysia |
| ID | Indonesia |
| VN | Vietnam |
| PH | Philippines |
| MM | Myanmar |
| KH | Cambodia |
| LA | Laos |
| BN | Brunei |
| CN | China |
| JP | Japan |
| KR | South Korea |
| IN | India |
| US | United States |

**Zod Schema**:
```typescript
country: z.enum([
  'TH', 'SG', 'MY', 'ID', 'VN', 'PH', 'MM', 'KH', 'LA', 'BN', 'CN', 'JP', 'KR', 'IN', 'US'
], {
  errorMap: () => ({ message: 'Please select a supported country' }),
})
```

#### Primary Address Designation
**Field**: `isPrimary` (stored in `tb_vendor_address.data['isPrimary']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Boolean value | "Primary designation is required" |
| Unique | Only one address can be primary per vendor | "Another address is already set as primary" |
| Auto-set | First address automatically becomes primary | N/A |

**Business Rule**: When setting a new primary address, the system must automatically update the previous primary address to non-primary.

#### Address Limit
| Rule | Validation | Error Message |
|------|------------|---------------|
| Maximum | 10 addresses per vendor | "Maximum of 10 addresses allowed per vendor" |
| Minimum | At least 1 address required | "At least one address is required" |

### 2.5 Document Information

#### Document Type
**Field**: `documentType` (stored in `tb_vendor.info['documents']['documents'][n]['documentType']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select document type | "Document type is required" |
| Valid | Must be one of predefined types | "Invalid document type selected" |

**Zod Schema**:
```typescript
documentType: z.enum([
  'contract',
  'certification',
  'insurance',
  'tax_document',
  'bank_details',
  'quality_certificate',
  'other',
], {
  errorMap: () => ({ message: 'Invalid document type selected' }),
})
```

#### Document Number
**Field**: `documentNumber` (stored in `tb_vendor.info['documents']['documents'][n]['documentNumber']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Document number is required" |
| Length | 1-100 characters | "Document number must be 1-100 characters" |
| Format | Alphanumeric with common separators | "Document number contains invalid characters" |

**Zod Schema**:
```typescript
documentNumber: z.string()
  .min(1, 'Document number is required')
  .max(100, 'Document number must not exceed 100 characters')
  .regex(/^[A-Z0-9\-\/\.]+$/i, 'Document number contains invalid characters')
```

#### Issue Date
**Field**: `issueDate` (stored in `tb_vendor.info['documents']['documents'][n]['issueDate']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide date | "Issue date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Range | Cannot be future date | "Issue date cannot be in the future" |
| Range | Cannot be more than 50 years ago | "Issue date is too far in the past" |

**Zod Schema**:
```typescript
issueDate: z.coerce.date()
  .max(new Date(), 'Issue date cannot be in the future')
  .refine((date) => {
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
    return date >= fiftyYearsAgo;
  }, 'Issue date is too far in the past')
```

#### Expiry Date
**Field**: `expiryDate` (stored in `tb_vendor.info['documents']['documents'][n]['expiryDate']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | ISO 8601 date string if provided | "Invalid date format" |
| Consistency | Must be after issue date | "Expiry date must be after issue date" |
| Recommended | Should be provided for certifications and insurance | "Warning: Expiry date is recommended for this document type" |

**Zod Schema**:
```typescript
expiryDate: z.coerce.date()
  .optional()
  .refine((expiryDate, ctx) => {
    if (!expiryDate) return true;
    const issueDate = ctx.parent.issueDate;
    return expiryDate > issueDate;
  }, 'Expiry date must be after issue date')
```

#### File Upload
**Field**: File upload (stored in S3, URL in `tb_vendor.info['documents']['documents'][n]['fileUrl']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select file | "Please select a file to upload" |
| Size | Max 50MB | "File size must not exceed 50MB" |
| Type | PDF, DOC, DOCX, XLS, XLSX, JPG, PNG | "Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG" |
| Virus Scan | Must pass virus scan | "File contains malicious content and cannot be uploaded" |

**Validation Logic**:
```typescript
const validateFile = (file: File): ValidationResult => {
  // Size check
  if (file.size > 50 * 1024 * 1024) {
    return {
      valid: false,
      error: 'File size must not exceed 50MB',
    };
  }

  // Type check
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG',
    };
  }

  return { valid: true };
};
```

### 2.6 Certification Information

#### Certification Type
**Field**: `certificationType` (stored in `tb_vendor.info['certifications'][n]['certificationType']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a type | "Certification type is required" |
| Valid | Must be one of 16 predefined types | "Invalid certification type selected" |
| Unique | One active certification per type per vendor | "This certification type already exists for this vendor" |

**Allowed Certification Types (16)**:
| Code | Display Name |
|------|--------------|
| iso_9001 | ISO 9001 (Quality Management) |
| iso_14001 | ISO 14001 (Environmental Management) |
| iso_22000 | ISO 22000 (Food Safety) |
| haccp | HACCP (Hazard Analysis Critical Control Points) |
| gmp | GMP (Good Manufacturing Practice) |
| halal | Halal Certification |
| kosher | Kosher Certification |
| organic | Organic Certification |
| fda_registered | FDA Registered |
| usda_certified | USDA Certified |
| fair_trade | Fair Trade Certified |
| business_license | Business License |
| health_safety_license | Health & Safety License |
| tax_registration | Tax Registration Certificate |
| trade_license | Trade License |
| other | Other Certification |

**Zod Schema**:
```typescript
certificationType: z.enum([
  'iso_9001',
  'iso_14001',
  'iso_22000',
  'haccp',
  'gmp',
  'halal',
  'kosher',
  'organic',
  'fda_registered',
  'usda_certified',
  'fair_trade',
  'business_license',
  'health_safety_license',
  'tax_registration',
  'trade_license',
  'other',
], {
  errorMap: () => ({ message: 'Invalid certification type selected' }),
})
```

#### Certificate Number
**Field**: `certificateNumber` (stored in `tb_vendor.info['certifications'][n]['certificateNumber']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Certificate number is required" |
| Length | 1-100 characters | "Certificate number must be 1-100 characters" |
| Format | Alphanumeric with common separators | "Certificate number contains invalid characters" |

**Zod Schema**:
```typescript
certificateNumber: z.string()
  .min(1, 'Certificate number is required')
  .max(100, 'Certificate number must not exceed 100 characters')
  .regex(/^[A-Z0-9\-\/\.]+$/i, 'Certificate number contains invalid characters')
```

#### Issuing Authority
**Field**: `issuingAuthority` (stored in `tb_vendor.info['certifications'][n]['issuingAuthority']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Issuing authority is required" |
| Length | 2-200 characters | "Issuing authority must be 2-200 characters" |

**Zod Schema**:
```typescript
issuingAuthority: z.string()
  .min(2, 'Issuing authority must be at least 2 characters')
  .max(200, 'Issuing authority must not exceed 200 characters')
```

#### Issue Date
**Field**: `issueDate` (stored in `tb_vendor.info['certifications'][n]['issueDate']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide date | "Issue date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Range | Cannot be future date | "Issue date cannot be in the future" |

**Zod Schema**:
```typescript
issueDate: z.coerce.date()
  .max(new Date(), 'Issue date cannot be in the future')
```

#### Expiry Date
**Field**: `expiryDate` (stored in `tb_vendor.info['certifications'][n]['expiryDate']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide date | "Expiry date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | Must be after issue date | "Expiry date must be after issue date" |

**Zod Schema**:
```typescript
expiryDate: z.coerce.date()
  .refine((expiryDate, ctx) => {
    const issueDate = ctx.parent?.issueDate;
    if (!issueDate) return true;
    return expiryDate > issueDate;
  }, 'Expiry date must be after issue date')
```

#### Certification Status (Auto-Calculated)
**Field**: `status` (stored in `tb_vendor.info['certifications'][n]['status']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Auto-calculated | System determines based on expiry date | N/A |
| Allowed Values | active, expiring_soon, expired, pending | "Invalid certification status" |

**Status Calculation Logic (30-Day Threshold)**:
| Status | Condition | Display |
|--------|-----------|---------|
| `active` | Expiry date > today + 30 days | Green badge |
| `expiring_soon` | Today < expiry date ≤ today + 30 days | Yellow badge |
| `expired` | Expiry date < today | Red badge |
| `pending` | No expiry date or manual override | Gray badge |

**Status Calculation Function**:
```typescript
const calculateCertificationStatus = (expiryDate: Date | null): CertificationStatus => {
  if (!expiryDate) return 'pending';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiry < today) {
    return 'expired';
  } else if (expiry <= thirtyDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
};
```

**Zod Schema**:
```typescript
status: z.enum(['active', 'expiring_soon', 'expired', 'pending'], {
  errorMap: () => ({ message: 'Invalid certification status' }),
}).default('pending')
```

#### Certificate Document
**Field**: `documentUrl` (stored in `tb_vendor.info['certifications'][n]['documentUrl']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| File Type | PDF, JPG, PNG only | "Certificate document must be PDF, JPG, or PNG" |
| File Size | Max 10MB | "Certificate document must not exceed 10MB" |

**Zod Schema**:
```typescript
documentUrl: z.string()
  .url('Invalid document URL')
  .optional()
  .or(z.literal(''))
```

#### Notes
**Field**: `notes` (stored in `tb_vendor.info['certifications'][n]['notes']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 1000 characters | "Notes must not exceed 1000 characters" |

**Zod Schema**:
```typescript
notes: z.string()
  .max(1000, 'Notes must not exceed 1000 characters')
  .optional()
```

#### Certification Limit
| Rule | Validation | Error Message |
|------|------------|---------------|
| Maximum | 20 certifications per vendor | "Maximum of 20 certifications allowed per vendor" |

---

## 3. Business Rule Validations

### 3.1 Vendor Creation Rules

#### BR-VAL-001: Primary Contact Requirement
**Rule**: At least one contact with role "Primary" must exist before vendor can be submitted for approval.

**Validation**: Before submission, check:
```typescript
const hasPrimaryContact = contacts.some(
  (contact) => contact.role === 'primary' && contact.isActive
);

if (!hasPrimaryContact) {
  throw new ValidationError('At least one primary contact is required before submission');
}
```

**Error Message**: "At least one primary contact is required before submission. Please add a primary contact in the Contacts tab."

#### BR-VAL-002: Payment Terms Requirement
**Rule**: Payment terms must be defined before vendor can be used in purchase orders.

**Validation**: Check if payment terms are configured:
```typescript
const hasPaymentTerms = vendorInfo.paymentTerms &&
  vendorInfo.paymentTerms.termsType &&
  vendorInfo.paymentTerms.daysNet > 0;

if (!hasPaymentTerms) {
  throw new ValidationError('Payment terms must be configured before creating purchase orders');
}
```

**Error Message**: "Payment terms must be configured before this vendor can be used in purchase orders."

#### BR-VAL-003: Required Documents
**Rule**: Specific vendor types require specific documents before approval.

**Validation**:
```typescript
const requiredDocsByType = {
  'supplier': ['tax_document', 'business_license'],
  'service_provider': ['tax_document', 'insurance', 'business_license'],
  'contractor': ['tax_document', 'insurance', 'business_license', 'quality_certificate'],
};

const vendorType = vendorInfo.categorization.primaryType;
const requiredDocs = requiredDocsByType[vendorType] || [];

const uploadedDocTypes = vendorInfo.documents.documents.map(doc => doc.documentType);
const missingDocs = requiredDocs.filter(type => !uploadedDocTypes.includes(type));

if (missingDocs.length > 0) {
  throw new ValidationError(`Missing required documents: ${missingDocs.join(', ')}`);
}
```

**Error Message**: "Missing required documents: [list of missing documents]. Please upload these documents before submission."

### 3.2 Approval Rules

#### BR-VAL-004: Self-Approval Prevention
**Rule**: Users cannot approve their own vendor submissions.

**Validation**:
```typescript
const isSubmitter = vendorInfo.approval.submittedBy === currentUserId;

if (isSubmitter) {
  throw new ValidationError('You cannot approve your own vendor submission');
}
```

**Error Message**: "You cannot approve your own vendor submission. Please assign to another approver."

#### BR-VAL-005: Approval Authority
**Rule**: High-value vendors require executive approval.

**Validation**:
```typescript
const annualSpend = vendorInfo.paymentTerms.creditLimit;
const requiresExecutive = annualSpend > 500000;

if (requiresExecutive && !hasExecutiveApproval) {
  throw new ValidationError('Vendors with credit limit > $500,000 require executive approval');
}
```

**Error Message**: "This high-value vendor requires executive approval. Routing to executive approval stage."

### 3.3 Status Change Rules

#### BR-VAL-006: Block Vendor with Active POs
**Rule**: Cannot block vendor if active purchase orders exist (unless forced with approval).

**Validation**:
```typescript
const activePOsCount = await prisma.tb_purchase_order.count({
  where: {
    vendor_id: vendorId,
    deleted_at: null,
    status: { in: ['pending', 'approved', 'partially_received'] },
  },
});

if (activePOsCount > 0 && !forceBlock) {
  throw new ValidationError(
    `Cannot block vendor with ${activePOsCount} active purchase orders. Force block requires manager approval.`
  );
}
```

**Error Message**: "Cannot block vendor with [X] active purchase orders. You can force block with manager approval, or wait for POs to complete."

#### BR-VAL-007: Archive Vendor with Pending Invoices
**Rule**: Cannot archive vendor if pending invoices exist.

**Validation**:
```typescript
const pendingInvoices = await prisma.tb_invoice.count({
  where: {
    vendor_id: vendorId,
    deleted_at: null,
    payment_status: { not: 'paid' },
  },
});

if (pendingInvoices > 0) {
  throw new ValidationError(
    `Cannot archive vendor with ${pendingInvoices} pending invoices. Please resolve all invoices first.`
  );
}
```

**Error Message**: "Cannot archive vendor with [X] pending invoices. Please resolve all invoices before archiving."

### 3.4 Performance Rules

#### BR-VAL-008: Minimum Transactions for Rating
**Rule**: Vendors must have minimum 5 transactions to receive performance rating.

**Validation**:
```typescript
const transactionCount = vendorInfo.performance?.transactionCount || 0;

if (transactionCount < 5) {
  return {
    rating: null,
    message: 'Insufficient transaction data for meaningful rating',
  };
}
```

**Display Message**: "Not yet rated (minimum 5 transactions required)"

#### BR-VAL-009: Rating Threshold for Preferred Status
**Rule**: Vendors must maintain rating ≥ 4.0/5.0 for preferred status.

**Validation**:
```typescript
const currentRating = vendorInfo.performance?.overallRating || 0;
const isPreferred = vendorInfo.categorization?.isPreferred;

if (isPreferred && currentRating < 4.0) {
  return {
    warning: true,
    message: 'Vendor rating below 4.0. Preferred status may be revoked.',
  };
}
```

**Warning Message**: "Warning: Vendor rating has fallen below 4.0. Preferred status may be revoked if performance does not improve."

### 3.5 Certification Rules

#### BR-VAL-010: Certification Expiry Warning
**Rule**: System automatically calculates certification status based on expiry date. Certifications within 30 days of expiry are marked as "expiring_soon".

**Status Calculation**:
```typescript
const calculateCertificationStatus = (expiryDate: Date | null): CertificationStatus => {
  if (!expiryDate) return 'pending';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiry < today) {
    return 'expired';
  } else if (expiry <= thirtyDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
};
```

**Status Definitions**:
| Status | Condition | Display Badge |
|--------|-----------|---------------|
| `active` | Expiry date > 30 days from today | Green badge |
| `expiring_soon` | Expiry date within 30 days | Yellow/warning badge |
| `expired` | Expiry date has passed | Red badge |
| `pending` | No expiry date set (awaiting certification) | Gray badge |

**Warning Message**: "Warning: This certification will expire on [DATE]. Please initiate renewal process."

#### BR-VAL-011: Duplicate Certification Type Prevention
**Rule**: A vendor cannot have multiple certifications of the same type that are both active.

**Validation**:
```typescript
const existingCertification = await prisma.tb_vendor_document.findFirst({
  where: {
    vendor_id: vendorId,
    info: {
      path: ['certificationType'],
      equals: newCertification.certificationType,
    },
    deleted_at: null,
  },
});

if (existingCertification) {
  const existingStatus = calculateCertificationStatus(existingCertification.expiryDate);
  if (existingStatus === 'active' || existingStatus === 'expiring_soon') {
    throw new ValidationError(
      `An active ${getCertificationDisplayName(newCertification.certificationType)} certification already exists. ` +
      'Please update the existing certification or wait for it to expire.'
    );
  }
}
```

**Error Message**: "An active [Certification Type] certification already exists for this vendor. Please update the existing certification instead."

#### BR-VAL-012: Required Certifications by Vendor Type
**Rule**: Certain vendor types may require specific certifications before approval.

**Configuration**:
```typescript
const REQUIRED_CERTIFICATIONS: Record<string, string[]> = {
  'food_supplier': ['halal', 'food_safety'],
  'medical_supplier': ['medical_device'],
  'construction': ['safety_compliance'],
  'technology': ['iso_27001'],
};

const validateRequiredCertifications = async (
  vendorId: string,
  vendorType: string
): Promise<ValidationResult> => {
  const requiredTypes = REQUIRED_CERTIFICATIONS[vendorType] || [];
  if (requiredTypes.length === 0) return { valid: true };

  const activeCertifications = await prisma.tb_vendor_document.findMany({
    where: {
      vendor_id: vendorId,
      info: {
        path: ['certificationType'],
        in: requiredTypes,
      },
      deleted_at: null,
    },
  });

  const activeCertTypes = activeCertifications
    .filter(cert => {
      const status = calculateCertificationStatus(cert.expiryDate);
      return status === 'active' || status === 'expiring_soon';
    })
    .map(cert => cert.info?.certificationType);

  const missingCerts = requiredTypes.filter(type => !activeCertTypes.includes(type));

  if (missingCerts.length > 0) {
    return {
      valid: false,
      missingCertifications: missingCerts,
      message: `The following certifications are required: ${missingCerts.map(getCertificationDisplayName).join(', ')}`,
    };
  }

  return { valid: true };
};
```

**Warning Message**: "Warning: This vendor type requires the following certifications: [List]. Please ensure all certifications are active before approval."

#### BR-VAL-013: Certification Limit Per Vendor
**Rule**: Each vendor can have a maximum of 20 certifications.

**Validation**:
```typescript
const certificationCount = await prisma.tb_vendor_document.count({
  where: {
    vendor_id: vendorId,
    info: {
      path: ['isCertification'],
      equals: true,
    },
    deleted_at: null,
  },
});

if (certificationCount >= 20) {
  throw new ValidationError(
    'Maximum certification limit (20) reached. Please remove expired or obsolete certifications before adding new ones.'
  );
}
```

**Error Message**: "Maximum certification limit (20) reached. Please remove expired or obsolete certifications before adding new ones."

### 3.6 Address Rules

#### BR-VAL-014: Primary Address Requirement
**Rule**: Each vendor must have exactly one primary address when addresses exist.

**Validation**:
```typescript
const validatePrimaryAddress = async (vendorId: string): Promise<ValidationResult> => {
  const addresses = await prisma.tb_vendor_address.findMany({
    where: {
      vendor_id: vendorId,
      is_active: true,
      deleted_at: null,
    },
  });

  if (addresses.length === 0) {
    return { valid: true }; // No addresses = no primary requirement
  }

  const primaryAddresses = addresses.filter(addr => addr.info?.isPrimary === true);

  if (primaryAddresses.length === 0) {
    return {
      valid: false,
      message: 'At least one address must be set as primary',
    };
  }

  if (primaryAddresses.length > 1) {
    return {
      valid: false,
      message: 'Only one address can be set as primary',
    };
  }

  return { valid: true };
};
```

**Error Message**: "At least one address must be designated as the primary address."

#### BR-VAL-015: Address Limit Per Vendor
**Rule**: Each vendor can have a maximum of 10 addresses.

**Validation**:
```typescript
const addressCount = await prisma.tb_vendor_address.count({
  where: {
    vendor_id: vendorId,
    deleted_at: null,
  },
});

if (addressCount >= 10) {
  throw new ValidationError(
    'Maximum address limit (10) reached. Please remove unused addresses before adding new ones.'
  );
}
```

**Error Message**: "Maximum address limit (10) reached for this vendor."

#### BR-VAL-016: Country-Specific Address Validation
**Rule**: Address fields are validated based on the selected country's format requirements.

**Country-Specific Requirements**:
| Country | Sub-District Required | District Required | Province Required | Postal Code Format |
|---------|----------------------|-------------------|-------------------|-------------------|
| TH (Thailand) | Recommended | Required | Required | 5 digits |
| SG (Singapore) | No | No | No | 6 digits |
| MY (Malaysia) | No | No | Required (State) | 5 digits |
| ID (Indonesia) | Required (Kelurahan) | Required (Kecamatan) | Required | 5 digits |
| VN (Vietnam) | Required (Phường/Xã) | Required (Quận/Huyện) | Required | 6 digits |
| PH (Philippines) | Required (Barangay) | No | Required | 4 digits |
| JP (Japan) | No | No | Required (Prefecture) | 3-4 format (###-####) |
| KR (South Korea) | No | Required (구/군) | Required (시/도) | 5 digits |
| CN (China) | No | Required | Required | 6 digits |

**Validation Example**:
```typescript
const countryRequirements: Record<string, CountryAddressRequirements> = {
  'TH': { subDistrictRequired: false, districtRequired: true, provinceRequired: true },
  'ID': { subDistrictRequired: true, districtRequired: true, provinceRequired: true },
  'VN': { subDistrictRequired: true, districtRequired: true, provinceRequired: true },
  'PH': { subDistrictRequired: true, districtRequired: false, provinceRequired: true },
  'SG': { subDistrictRequired: false, districtRequired: false, provinceRequired: false },
  // ... other countries
};

const validateAddressByCountry = (
  address: VendorAddress,
  country: string
): ValidationResult => {
  const requirements = countryRequirements[country];
  if (!requirements) return { valid: true };

  const errors: string[] = [];

  if (requirements.subDistrictRequired && !address.subDistrict) {
    errors.push('Sub-district is required for this country');
  }
  if (requirements.districtRequired && !address.district) {
    errors.push('District is required for this country');
  }
  if (requirements.provinceRequired && !address.province) {
    errors.push('Province/State is required for this country');
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true };
};
```

---

## 4. Complete Zod Schemas

### 4.1 Vendor Schema

```typescript
// lib/schemas/vendor.schema.ts

import { z } from 'zod';

export const vendorSchema = z.object({
  // Basic Information
  vendorCode: z.string()
    .min(3, 'Vendor code must be at least 3 characters')
    .max(20, 'Vendor code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Vendor code must contain only uppercase letters, numbers, and hyphens'),

  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Company name contains invalid characters'),

  legalName: z.string()
    .min(2, 'Legal name must be at least 2 characters')
    .max(200, 'Legal name must not exceed 200 characters')
    .optional()
    .or(z.literal('')),

  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .refine((text) => !/<[^>]*>/.test(text), 'Description cannot contain HTML tags')
    .optional(),

  website: z.string()
    .url('Invalid website URL')
    .max(500, 'Website URL must not exceed 500 characters')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'Website URL must start with http:// or https://',
    })
    .optional()
    .or(z.literal('')),

  industry: z.string()
    .max(100, 'Industry must not exceed 100 characters')
    .optional(),

  // Classification
  business_type_id: z.string()
    .min(1, 'Business type is required')
    .uuid('Invalid business type ID'),

  tax_profile_id: z.string()
    .uuid('Invalid tax profile ID')
    .optional(),

  // Status
  status: z.enum([
    'draft',
    'pending_approval',
    'approved',
    'preferred',
    'provisional',
    'blocked',
    'blacklisted',
    'inactive',
  ]).default('draft'),

  // Financial
  paymentTermsType: z.enum([
    'net_7',
    'net_15',
    'net_30',
    'net_45',
    'net_60',
    'net_90',
    'custom',
  ]).default('net_30'),

  daysNet: z.number()
    .int('Payment days must be a whole number')
    .min(0, 'Payment days cannot be negative')
    .max(365, 'Payment days must not exceed 365')
    .default(30),

  creditLimit: z.number()
    .min(0, 'Credit limit cannot be negative')
    .max(999999999, 'Credit limit must not exceed 999,999,999')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }, 'Credit limit must have at most 2 decimal places')
    .default(0),

  defaultCurrency: z.string()
    .length(3, 'Currency code must be exactly 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
    .default('USD'),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
```

### 4.2 Contact Schema

```typescript
// lib/schemas/contact.schema.ts

import { z } from 'zod';

export const vendorContactSchema = z.object({
  fullName: z.string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Contact name contains invalid characters'),

  title: z.string()
    .max(100, 'Title must not exceed 100 characters')
    .optional(),

  role: z.enum([
    'primary',
    'sales',
    'accounts_payable',
    'technical_support',
    'management',
    'other',
  ]).default('primary'),

  // Contact Methods
  primaryEmail: z.string()
    .email('Invalid email address format')
    .max(320, 'Email address must not exceed 320 characters'),

  secondaryEmail: z.string()
    .email('Invalid email address format')
    .max(320, 'Email address must not exceed 320 characters')
    .optional()
    .or(z.literal('')),

  phoneNumbers: z.array(z.object({
    type: z.enum(['office', 'mobile', 'home', 'fax']),
    countryCode: z.string()
      .length(2, 'Country code must be 2 characters')
      .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),
    number: z.string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number format'),
    extension: z.string()
      .max(10, 'Extension must not exceed 10 digits')
      .regex(/^\d*$/, 'Extension must contain only digits')
      .optional(),
    isPrimary: z.boolean().default(false),
  })).optional().default([]),

  // Preferences
  preferredMethod: z.enum(['email', 'phone', 'sms', 'portal']).default('email'),

  language: z.string()
    .length(2, 'Language code must be 2 characters')
    .regex(/^[a-z]{2}$/, 'Language code must be lowercase letters')
    .default('en'),

  // Status
  isActive: z.boolean().default(true),
  isPreferredContact: z.boolean().default(false),

  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
});

export type VendorContactFormData = z.infer<typeof vendorContactSchema>;
```

### 4.3 Document Schema

```typescript
// lib/schemas/document.schema.ts

import { z } from 'zod';

export const vendorDocumentSchema = z.object({
  documentType: z.enum([
    'contract',
    'certification',
    'insurance',
    'tax_document',
    'bank_details',
    'quality_certificate',
    'other',
  ]),

  documentNumber: z.string()
    .min(1, 'Document number is required')
    .max(100, 'Document number must not exceed 100 characters')
    .regex(/^[A-Z0-9\-\/\.]+$/i, 'Document number contains invalid characters'),

  documentName: z.string()
    .min(1, 'Document name is required')
    .max(200, 'Document name must not exceed 200 characters'),

  issueDate: z.coerce.date()
    .max(new Date(), 'Issue date cannot be in the future')
    .refine((date) => {
      const fiftyYearsAgo = new Date();
      fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
      return date >= fiftyYearsAgo;
    }, 'Issue date is too far in the past'),

  expiryDate: z.coerce.date()
    .optional()
    .refine((expiryDate, ctx) => {
      if (!expiryDate) return true;
      const issueDate = ctx.parent.issueDate;
      return expiryDate > issueDate;
    }, 'Expiry date must be after issue date'),

  issuingAuthority: z.string()
    .max(200, 'Issuing authority must not exceed 200 characters')
    .optional(),

  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),

  requiresApproval: z.boolean().default(false),
  isConfidential: z.boolean().default(false),
  autoNotifyBeforeExpiry: z.boolean().default(true),
});

export type VendorDocumentFormData = z.infer<typeof vendorDocumentSchema>;
```

### 4.4 Address Schema (Asian International Format)

```typescript
// lib/schemas/address.schema.ts

import { z } from 'zod';

// Supported countries (ISO 3166-1 alpha-2)
export const SUPPORTED_COUNTRIES = [
  'TH', // Thailand
  'SG', // Singapore
  'MY', // Malaysia
  'ID', // Indonesia
  'VN', // Vietnam
  'PH', // Philippines
  'MM', // Myanmar
  'KH', // Cambodia
  'LA', // Laos
  'BN', // Brunei
  'CN', // China
  'JP', // Japan
  'KR', // South Korea
  'IN', // India
  'US', // United States
] as const;

export type SupportedCountry = typeof SUPPORTED_COUNTRIES[number];

// Country-specific postal code patterns
const postalCodePatterns: Record<SupportedCountry, RegExp> = {
  TH: /^\d{5}$/,
  SG: /^\d{6}$/,
  MY: /^\d{5}$/,
  ID: /^\d{5}$/,
  VN: /^\d{6}$/,
  PH: /^\d{4}$/,
  MM: /^\d{5}$/,
  KH: /^\d{5}$/,
  LA: /^\d{5}$/,
  BN: /^[A-Z]{2}\d{4}$/,
  CN: /^\d{6}$/,
  JP: /^\d{3}-\d{4}$/,
  KR: /^\d{5}$/,
  IN: /^\d{6}$/,
  US: /^\d{5}(-\d{4})?$/,
};

// Country-specific field requirements
interface CountryFieldRequirements {
  subDistrictRequired: boolean;
  districtRequired: boolean;
  provinceRequired: boolean;
  subDistrictLabel: string;
  districtLabel: string;
  provinceLabel: string;
}

const countryFieldRequirements: Record<SupportedCountry, CountryFieldRequirements> = {
  TH: { subDistrictRequired: false, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Tambon', districtLabel: 'Amphoe', provinceLabel: 'Province' },
  SG: { subDistrictRequired: false, districtRequired: false, provinceRequired: false, subDistrictLabel: 'Sub-district', districtLabel: 'District', provinceLabel: 'Region' },
  MY: { subDistrictRequired: false, districtRequired: false, provinceRequired: true, subDistrictLabel: 'Mukim', districtLabel: 'District', provinceLabel: 'State' },
  ID: { subDistrictRequired: true, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Kelurahan', districtLabel: 'Kecamatan', provinceLabel: 'Province' },
  VN: { subDistrictRequired: true, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Phường/Xã', districtLabel: 'Quận/Huyện', provinceLabel: 'Province/City' },
  PH: { subDistrictRequired: true, districtRequired: false, provinceRequired: true, subDistrictLabel: 'Barangay', districtLabel: 'Municipality', provinceLabel: 'Province' },
  MM: { subDistrictRequired: false, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Ward', districtLabel: 'Township', provinceLabel: 'State/Region' },
  KH: { subDistrictRequired: true, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Sangkat', districtLabel: 'Khan/District', provinceLabel: 'Province' },
  LA: { subDistrictRequired: false, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Village', districtLabel: 'District', provinceLabel: 'Province' },
  BN: { subDistrictRequired: false, districtRequired: true, provinceRequired: false, subDistrictLabel: 'Kampong', districtLabel: 'Mukim', provinceLabel: 'District' },
  CN: { subDistrictRequired: false, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Sub-district', districtLabel: 'District/County', provinceLabel: 'Province' },
  JP: { subDistrictRequired: false, districtRequired: false, provinceRequired: true, subDistrictLabel: 'Chōme', districtLabel: 'Ward', provinceLabel: 'Prefecture' },
  KR: { subDistrictRequired: false, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Dong', districtLabel: 'Gu/Gun', provinceLabel: 'Province/City' },
  IN: { subDistrictRequired: false, districtRequired: true, provinceRequired: true, subDistrictLabel: 'Locality', districtLabel: 'District', provinceLabel: 'State' },
  US: { subDistrictRequired: false, districtRequired: false, provinceRequired: true, subDistrictLabel: 'Neighborhood', districtLabel: 'County', provinceLabel: 'State' },
};

export const vendorAddressSchema = z.object({
  addressType: z.enum(['contact_address', 'mailing_address', 'register_address']),

  // Core address fields
  addressLine1: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\#\/\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]+$/,
      'Address contains invalid characters'),

  addressLine2: z.string()
    .max(200, 'Address line 2 must not exceed 200 characters')
    .optional()
    .or(z.literal('')),

  // Asian International Format fields
  subDistrict: z.string()
    .max(100, 'Sub-district must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  district: z.string()
    .max(100, 'District must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),

  province: z.string()
    .max(100, 'Province/State must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  postalCode: z.string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(10, 'Postal code must not exceed 10 characters'),

  country: z.enum(SUPPORTED_COUNTRIES, {
    errorMap: () => ({ message: 'Please select a supported country' }),
  }),

  // Primary/Active status
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),

  // Additional fields
  deliveryInstructions: z.string()
    .max(500, 'Delivery instructions must not exceed 500 characters')
    .optional(),

}).superRefine((data, ctx) => {
  // Country-specific postal code validation
  const pattern = postalCodePatterns[data.country];
  if (pattern && !pattern.test(data.postalCode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid postal code format for ${data.country}`,
      path: ['postalCode'],
    });
  }

  // Country-specific required field validation
  const requirements = countryFieldRequirements[data.country];
  if (requirements) {
    if (requirements.subDistrictRequired && !data.subDistrict) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${requirements.subDistrictLabel} is required for ${data.country}`,
        path: ['subDistrict'],
      });
    }
    if (requirements.districtRequired && !data.district) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${requirements.districtLabel} is required for ${data.country}`,
        path: ['district'],
      });
    }
    if (requirements.provinceRequired && !data.province) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${requirements.provinceLabel} is required for ${data.country}`,
        path: ['province'],
      });
    }
  }
});

export type VendorAddressFormData = z.infer<typeof vendorAddressSchema>;

// Helper function to get field labels for a country
export const getAddressFieldLabels = (country: SupportedCountry) => {
  return countryFieldRequirements[country] || countryFieldRequirements.US;
};
```

### 4.5 Certification Schema

```typescript
// lib/schemas/certification.schema.ts

import { z } from 'zod';

// 16 Certification Types
export const CERTIFICATION_TYPES = [
  'halal',
  'iso_9001',
  'iso_14001',
  'iso_22000',
  'iso_27001',
  'haccp',
  'gmp',
  'organic',
  'fair_trade',
  'fda_approved',
  'ce_marking',
  'medical_device',
  'food_safety',
  'environmental',
  'safety_compliance',
  'other',
] as const;

export type CertificationType = typeof CERTIFICATION_TYPES[number];

// Certification Status (auto-calculated)
export const CERTIFICATION_STATUSES = [
  'active',
  'expiring_soon',
  'expired',
  'pending',
] as const;

export type CertificationStatus = typeof CERTIFICATION_STATUSES[number];

// Certification type display names
export const CERTIFICATION_TYPE_LABELS: Record<CertificationType, string> = {
  halal: 'Halal Certification',
  iso_9001: 'ISO 9001 (Quality Management)',
  iso_14001: 'ISO 14001 (Environmental Management)',
  iso_22000: 'ISO 22000 (Food Safety Management)',
  iso_27001: 'ISO 27001 (Information Security)',
  haccp: 'HACCP (Hazard Analysis)',
  gmp: 'GMP (Good Manufacturing Practice)',
  organic: 'Organic Certification',
  fair_trade: 'Fair Trade Certification',
  fda_approved: 'FDA Approved',
  ce_marking: 'CE Marking',
  medical_device: 'Medical Device Certification',
  food_safety: 'Food Safety Certification',
  environmental: 'Environmental Compliance',
  safety_compliance: 'Safety Compliance',
  other: 'Other Certification',
};

// Status calculation function
export const calculateCertificationStatus = (expiryDate: Date | null): CertificationStatus => {
  if (!expiryDate) return 'pending';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiry < today) {
    return 'expired';
  } else if (expiry <= thirtyDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
};

export const vendorCertificationSchema = z.object({
  // Certification Type
  certificationType: z.enum(CERTIFICATION_TYPES, {
    errorMap: () => ({ message: 'Please select a certification type' }),
  }),

  // Certificate Details
  certificateNumber: z.string()
    .min(1, 'Certificate number is required')
    .max(100, 'Certificate number must not exceed 100 characters')
    .regex(/^[A-Z0-9\-\/\.]+$/i, 'Certificate number contains invalid characters'),

  certificateName: z.string()
    .min(1, 'Certificate name is required')
    .max(200, 'Certificate name must not exceed 200 characters'),

  issuingAuthority: z.string()
    .min(1, 'Issuing authority is required')
    .max(200, 'Issuing authority must not exceed 200 characters'),

  // Dates
  issueDate: z.coerce.date()
    .max(new Date(), 'Issue date cannot be in the future')
    .refine((date) => {
      const fiftyYearsAgo = new Date();
      fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
      return date >= fiftyYearsAgo;
    }, 'Issue date is too far in the past'),

  expiryDate: z.coerce.date()
    .optional()
    .nullable(),

  // Document Upload
  documentFile: z.object({
    fileName: z.string()
      .min(1, 'Document file name is required')
      .max(255, 'File name must not exceed 255 characters'),
    fileSize: z.number()
      .max(50 * 1024 * 1024, 'File size must not exceed 50MB'),
    mimeType: z.enum([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
    ], {
      errorMap: () => ({ message: 'Only PDF, JPEG, PNG, and GIF files are allowed' }),
    }),
    url: z.string().url('Invalid document URL'),
  }).optional(),

  // Notes
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),

  // Flags
  isActive: z.boolean().default(true),
  autoNotifyBeforeExpiry: z.boolean().default(true),
  notifyDaysBefore: z.number()
    .int('Notification days must be a whole number')
    .min(1, 'Notification must be at least 1 day before')
    .max(90, 'Notification must not exceed 90 days before')
    .default(30),

}).superRefine((data, ctx) => {
  // Expiry date must be after issue date
  if (data.expiryDate && data.issueDate) {
    if (data.expiryDate <= data.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expiry date must be after issue date',
        path: ['expiryDate'],
      });
    }
  }
});

export type VendorCertificationFormData = z.infer<typeof vendorCertificationSchema>;

// Helper function to get certification display name
export const getCertificationDisplayName = (type: CertificationType): string => {
  return CERTIFICATION_TYPE_LABELS[type] || type;
};

// Helper function to get status badge styling
export const getCertificationStatusStyle = (status: CertificationStatus): {
  badge: string;
  text: string;
  icon: string;
} => {
  switch (status) {
    case 'active':
      return { badge: 'bg-green-100 text-green-800', text: 'Active', icon: 'CheckCircle' };
    case 'expiring_soon':
      return { badge: 'bg-yellow-100 text-yellow-800', text: 'Expiring Soon', icon: 'AlertTriangle' };
    case 'expired':
      return { badge: 'bg-red-100 text-red-800', text: 'Expired', icon: 'XCircle' };
    case 'pending':
      return { badge: 'bg-gray-100 text-gray-800', text: 'Pending', icon: 'Clock' };
    default:
      return { badge: 'bg-gray-100 text-gray-800', text: 'Unknown', icon: 'HelpCircle' };
  }
};
```

---

## 5. Database Constraints

### 5.1 PostgreSQL Constraints

```sql
-- Vendor table constraints
ALTER TABLE tb_vendor
  ADD CONSTRAINT check_name_not_empty CHECK (name <> ''),
  ADD CONSTRAINT check_vendor_code_format CHECK (
    (info->'profile'->>'vendorCode') ~ '^[A-Z0-9-]{3,20}$'
  );

-- Vendor contact constraints
ALTER TABLE tb_vendor_contact
  ADD CONSTRAINT check_contact_has_email CHECK (
    (info->'contactMethods'->>'primaryEmail') IS NOT NULL AND
    (info->'contactMethods'->>'primaryEmail') <> ''
  );

-- Unique constraints
CREATE UNIQUE INDEX idx_vendor_code_unique
  ON tb_vendor ((info->'profile'->>'vendorCode'))
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_vendor_name_unique
  ON tb_vendor (LOWER(name))
  WHERE deleted_at IS NULL;

-- Check constraints for JSON data
ALTER TABLE tb_vendor
  ADD CONSTRAINT check_credit_limit_positive CHECK (
    CAST(info->'paymentTerms'->>'creditLimit' AS NUMERIC) >= 0
  ),
  ADD CONSTRAINT check_payment_days_range CHECK (
    CAST(info->'paymentTerms'->>'daysNet' AS INTEGER) BETWEEN 0 AND 365
  );
```

### 5.2 Application-Level Constraints

```typescript
// Before insert/update validations

// Ensure vendor code is unique
const existingVendorCode = await prisma.tb_vendor.findFirst({
  where: {
    info: {
      path: ['profile', 'vendorCode'],
      equals: vendorData.vendorCode,
    },
    deleted_at: null,
    ...(isUpdate && { NOT: { id: vendorId } }),
  },
});

if (existingVendorCode) {
  throw new ConflictError('Vendor code already exists');
}

// Ensure at least one primary contact for approved vendors
if (status === 'approved') {
  const primaryContactCount = await prisma.tb_vendor_contact.count({
    where: {
      vendor_id: vendorId,
      is_active: true,
      info: {
        path: ['role'],
        equals: 'primary',
      },
    },
  });

  if (primaryContactCount === 0) {
    throw new ValidationError('At least one primary contact is required for approved vendors');
  }
}
```

---

## 6. Error Messages Reference

### 6.1 User-Friendly Error Messages

| Error Code | Technical Message | User Message |
|------------|-------------------|--------------|
| VEN-001 | Vendor code already exists | This vendor code is already in use. Please choose a different code. |
| VEN-002 | Company name duplicate | A vendor with this name already exists. Would you like to view the existing vendor? |
| VEN-003 | Missing primary contact | At least one primary contact is required. Please add a contact in the Contacts tab. |
| VEN-004 | Payment terms not configured | Payment terms must be set before this vendor can be used in purchase orders. |
| VEN-005 | Missing required documents | Required documents are missing. Please upload: [list] |
| VEN-006 | Cannot block vendor with active POs | This vendor has [X] active purchase orders. Force blocking requires manager approval. |
| VEN-007 | Cannot archive with pending invoices | This vendor has [X] pending invoices. Please resolve all invoices before archiving. |
| VEN-008 | Self-approval not allowed | You cannot approve your own vendor submission. Please assign to another approver. |
| VEN-009 | Insufficient transaction data | This vendor does not yet have enough transactions (minimum 5) for a performance rating. |
| VEN-010 | Invalid email format | Please enter a valid email address (e.g., user@example.com). |
| VEN-011 | Invalid phone number | Please enter a valid phone number for the selected country. |
| VEN-012 | File size exceeds limit | File size must not exceed 50MB. Please compress or split the file. |
| VEN-013 | Invalid file type | Only PDF, DOC, DOCX, XLS, XLSX, JPG, and PNG files are allowed. |
| VEN-014 | Expiry date before issue date | The expiry date must be after the issue date. |
| VEN-015 | Credit limit exceeded | This purchase order exceeds the vendor's credit limit. Additional approval required. |
| CERT-001 | Duplicate certification type | An active [Certification Type] certification already exists for this vendor. Please update the existing certification. |
| CERT-002 | Certification limit exceeded | Maximum certification limit (20) reached. Please remove expired or obsolete certifications before adding new ones. |
| CERT-003 | Missing required certifications | The following certifications are required for this vendor type: [List]. Please add them before approval. |
| CERT-004 | Certificate number invalid | Certificate number contains invalid characters. Only letters, numbers, hyphens, slashes, and dots are allowed. |
| CERT-005 | Certification expiring soon | Warning: This certification will expire on [DATE]. Please initiate renewal process. |
| CERT-006 | Certification expired | This certification has expired on [DATE]. Please upload a renewed certificate or remove this certification. |
| CERT-007 | Issuing authority required | Issuing authority is required for all certifications. |
| ADDR-001 | Primary address required | At least one address must be designated as the primary address. |
| ADDR-002 | Multiple primary addresses | Only one address can be set as primary. Please deselect other primary addresses first. |
| ADDR-003 | Address limit exceeded | Maximum address limit (10) reached for this vendor. Please remove unused addresses first. |
| ADDR-004 | Invalid postal code format | Invalid postal code format for [COUNTRY]. Expected format: [FORMAT]. |
| ADDR-005 | Missing required address field | [FIELD_NAME] is required for addresses in [COUNTRY]. |
| ADDR-006 | Unsupported country | The selected country is not currently supported. Supported countries: Thailand, Singapore, Malaysia, Indonesia, Vietnam, Philippines, Myanmar, Cambodia, Laos, Brunei, China, Japan, South Korea, India, United States. |
| ADDR-007 | Cannot delete primary address | Cannot delete the primary address. Please set another address as primary first or delete all other addresses. |

### 6.2 Technical Error Logs

```typescript
// Error logging format
interface ErrorLog {
  code: string;
  message: string;
  details: Record<string, any>;
  userId: string;
  timestamp: string;
  stackTrace?: string;
}

// Example usage
logger.error({
  code: 'VEN-001',
  message: 'Vendor code already exists',
  details: {
    vendorCode: 'VEN-2401-0001',
    existingVendorId: 'vendor-uuid',
  },
  userId: currentUser.id,
  timestamp: new Date().toISOString(),
});
```

---

## 7. Validation Testing Matrix

### 7.1 Unit Test Cases

| Test Case ID | Validation Rule | Input | Expected Result |
|--------------|-----------------|-------|-----------------|
| UT-VEN-001 | Vendor code format | "ven-001" | Error: Must be uppercase |
| UT-VEN-002 | Vendor code format | "VEN-2401-0001" | Success |
| UT-VEN-003 | Vendor code length | "VE" | Error: Minimum 3 characters |
| UT-VEN-004 | Email format | "user@domain" | Error: Invalid email |
| UT-VEN-005 | Email format | "user@domain.com" | Success |
| UT-VEN-006 | Credit limit | -1000 | Error: Cannot be negative |
| UT-VEN-007 | Credit limit | 50000.555 | Error: Max 2 decimal places |
| UT-VEN-008 | Payment days | 400 | Error: Must be ≤ 365 |
| UT-VEN-009 | Expiry before issue | issue: 2024-01-15, expiry: 2024-01-10 | Error: Expiry must be after issue |
| UT-VEN-010 | File size | 60MB | Error: Exceeds 50MB limit |
| UT-CERT-001 | Certification type | "halal" | Success |
| UT-CERT-002 | Certification type | "invalid_type" | Error: Invalid certification type |
| UT-CERT-003 | Certificate number format | "CERT/2024-001" | Success |
| UT-CERT-004 | Certificate number format | "CERT@#$%" | Error: Invalid characters |
| UT-CERT-005 | Certificate number length | "A".repeat(101) | Error: Exceeds 100 characters |
| UT-CERT-006 | Status calculation | expiryDate: 45 days from now | Status: active |
| UT-CERT-007 | Status calculation | expiryDate: 20 days from now | Status: expiring_soon |
| UT-CERT-008 | Status calculation | expiryDate: yesterday | Status: expired |
| UT-CERT-009 | Status calculation | expiryDate: null | Status: pending |
| UT-CERT-010 | Issuing authority | "" (empty) | Error: Issuing authority required |
| UT-ADDR-001 | Country code | "TH" | Success |
| UT-ADDR-002 | Country code | "XX" | Error: Unsupported country |
| UT-ADDR-003 | Thai postal code | "10110" | Success |
| UT-ADDR-004 | Thai postal code | "1234" | Error: Invalid format (5 digits required) |
| UT-ADDR-005 | Singapore postal code | "123456" | Success |
| UT-ADDR-006 | Singapore postal code | "12345" | Error: Invalid format (6 digits required) |
| UT-ADDR-007 | Japan postal code | "123-4567" | Success |
| UT-ADDR-008 | Japan postal code | "1234567" | Error: Invalid format (###-#### required) |
| UT-ADDR-009 | Indonesia district | country: "ID", district: "" | Error: Kecamatan required |
| UT-ADDR-010 | Vietnam sub-district | country: "VN", subDistrict: "" | Error: Phường/Xã required |
| UT-ADDR-011 | Address line 1 (Thai chars) | "123 ถนนสุขุมวิท" | Success |
| UT-ADDR-012 | Address line 1 (Chinese chars) | "北京市朝阳区" | Success |

### 7.2 Integration Test Cases

| Test Case ID | Scenario | Steps | Expected Result |
|--------------|----------|-------|-----------------|
| IT-VEN-001 | Create vendor with duplicate code | 1. Create vendor "VEN-001"<br>2. Try create another "VEN-001" | Error on step 2 |
| IT-VEN-002 | Submit without primary contact | 1. Create vendor<br>2. Submit without contacts | Error: Primary contact required |
| IT-VEN-003 | Block vendor with active PO | 1. Create vendor<br>2. Create PO<br>3. Try to block | Warning: Active PO exists |
| IT-VEN-004 | Approve own submission | 1. User A creates vendor<br>2. User A tries to approve | Error: Self-approval |
| IT-VEN-005 | Upload invalid file type | 1. Select .exe file<br>2. Try to upload | Error: Invalid file type |
| IT-CERT-001 | Add duplicate certification type | 1. Add Halal certification<br>2. Try to add another Halal certification | Error: Duplicate type |
| IT-CERT-002 | Certification limit reached | 1. Add 20 certifications<br>2. Try to add 21st certification | Error: Limit exceeded |
| IT-CERT-003 | Status auto-calculation | 1. Add certification with expiry in 15 days<br>2. View certification list | Status shows "Expiring Soon" |
| IT-CERT-004 | Required certifications check | 1. Create food supplier vendor<br>2. Try to approve without Halal/Food Safety cert | Warning: Required certifications missing |
| IT-CERT-005 | Edit expired certification | 1. View expired certification<br>2. Update expiry date to future | Status changes to "Active" |
| IT-ADDR-001 | Add duplicate primary address | 1. Add address as primary<br>2. Try to add another primary address | Existing primary auto-deselected |
| IT-ADDR-002 | Address limit reached | 1. Add 10 addresses<br>2. Try to add 11th address | Error: Limit exceeded |
| IT-ADDR-003 | Delete primary address | 1. Have 2 addresses, one primary<br>2. Delete primary address | Error: Set another as primary first |
| IT-ADDR-004 | Country-specific validation (ID) | 1. Select Indonesia<br>2. Leave district empty<br>3. Try to save | Error: Kecamatan required |
| IT-ADDR-005 | Country-specific postal code (TH) | 1. Select Thailand<br>2. Enter 6-digit postal code<br>3. Try to save | Error: Invalid format |
| IT-ADDR-006 | Set primary address | 1. Have 3 addresses, none primary<br>2. Set one as primary | Selected becomes primary, others unchanged |
| IT-ADDR-007 | Address with Thai characters | 1. Select Thailand<br>2. Enter address with Thai characters<br>3. Save | Success |

---

## Related Documents
- [BR-vendor-directory.md](BR-vendor-directory.md) - Business Requirements (v2.2.0)
- [DD-vendor-directory.md](DD-vendor-directory.md) - Data Dictionary (v2.2.0)
- [UC-vendor-directory.md](UC-vendor-directory.md) - Use Cases (v2.2.0)
- [TS-vendor-directory.md](TS-vendor-directory.md) - Technical Specification (v2.2.0)
- [FD-vendor-directory.md](FD-vendor-directory.md) - Flow Diagrams (v2.2.0)

---

**End of Validations Document**
