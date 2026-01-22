# Flow Diagrams: Certifications

## Module Information
- **Module**: System Administration
- **Sub-Module**: Certifications
- **Route**: `/system-administration/certifications`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17
- **Owner**: System Administration Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-17 | Documentation Team | Initial version |

---

## Overview

This document provides visual representations of the Certifications module workflows.

**Related Documents**:
- [Business Requirements](./BR-certifications.md)
- [Use Cases](./UC-certifications.md)
- [Data Dictionary](./DD-certifications.md)
- [Technical Specification](./TS-certifications.md)
- [Validation Rules](./VAL-certifications.md)

---

## Page Load Flow

```mermaid
graph TD
    A[User navigates to /system-administration/certifications] --> B[Server component renders]
    B --> C[fetchCertifications called]
    C --> D[Database query executes]
    D --> E[Return certification array]
    E --> F[Render table with certifications]
    F --> G[User sees certification list]
```

---

## Create Certification Flow

```mermaid
graph TD
    A[User clicks Create Certification] --> B[Navigate to /certifications/create]
    B --> C[Display create form]
    C --> D[User enters Name required]
    D --> E[User enters Description optional]
    E --> F[User enters Icon URL optional]
    F --> G[User clicks Create button]
    G --> H{Validate with Zod}
    H -->|Valid| I[Execute createCertification]
    H -->|Invalid| C
    I --> J[Insert into database]
    J --> K[revalidatePath]
    K --> L[redirect to list]
    L --> M[User sees updated list]
```

---

## Edit Certification Flow

```mermaid
graph TD
    A[User clicks Edit link] --> B[Navigate to /certifications/id/edit]
    B --> C[fetchCertificationById]
    C --> D{Certification exists?}
    D -->|Yes| E[Display form with values]
    D -->|No| F[Show not found message]
    E --> G[User modifies fields]
    G --> H[User clicks Update button]
    H --> I{Validate with Zod}
    I -->|Valid| J[Execute updateCertification]
    I -->|Invalid| E
    J --> K[Update database record]
    K --> L[revalidatePath]
    L --> M[redirect to list]
    M --> N[User sees updated list]
```

---

## Delete Certification Flow

```mermaid
graph TD
    A[User clicks Delete button] --> B[Form submits with deleteCertification]
    B --> C[Execute deleteCertification action]
    C --> D[Delete from database]
    D --> E[revalidatePath]
    E --> F[Page refreshes]
    F --> G[Certification removed from list]
```

---

## Assign to Vendor Flow

```mermaid
graph TD
    A[User on vendor detail page] --> B[Select certification to add]
    B --> C[Enter certificate details]
    C --> D[Submit form]
    D --> E{Validate input}
    E -->|Valid| F[Execute addCertificationToVendor]
    E -->|Invalid| C
    F --> G[Insert into vendor_certifications]
    G --> H[revalidatePath vendor page]
    H --> I[Certification appears on vendor]
```

---

## Assign to Product Flow

```mermaid
graph TD
    A[User on product detail page] --> B[Select certification to add]
    B --> C[Enter certificate details]
    C --> D[Submit form]
    D --> E{Validate input}
    E -->|Valid| F[Execute addCertificationToProduct]
    E -->|Invalid| C
    F --> G[Insert into product_certifications]
    G --> H[revalidatePath product page]
    H --> I[Certification appears on product]
```

---

## Navigation Flow

```mermaid
graph LR
    subgraph System Administration
        A[Certifications List]
    end

    subgraph CRUD Operations
        B[Create Page]
        C[Edit Page]
    end

    subgraph Related Modules
        D[Vendor Management]
        E[Product Management]
    end

    A --> B
    A --> C
    B --> A
    C --> A
    A -.->|Reference| D
    A -.->|Reference| E
```

---

## Component Interaction

```mermaid
sequenceDiagram
    participant U as User
    participant P as Page
    participant SA as Server Action
    participant DB as Database

    U->>P: Navigate to certifications
    P->>DB: fetchCertifications()
    DB-->>P: Return certifications
    P-->>U: Display table

    U->>P: Click Create
    P-->>U: Show create form
    U->>P: Submit form
    P->>SA: createCertification(formData)
    SA->>DB: INSERT certification
    DB-->>SA: Success
    SA->>P: revalidatePath + redirect
    P-->>U: Show updated list
```

---

## Data Flow Summary

```
User Actions              Server Processing         Database
-----------              -----------------         --------
View list           -->  fetchCertifications  -->  SELECT * FROM certifications
Click Create        -->  Navigate to form
Submit create       -->  createCertification  -->  INSERT INTO certifications
Click Edit          -->  fetchCertificationById -> SELECT WHERE id = ?
Submit edit         -->  updateCertification  -->  UPDATE WHERE id = ?
Click Delete        -->  deleteCertification  -->  DELETE WHERE id = ?
Assign to vendor    -->  addCertificationToVendor -> INSERT INTO vendor_certifications
Assign to product   -->  addCertificationToProduct -> INSERT INTO product_certifications
```

---

**Document End**
