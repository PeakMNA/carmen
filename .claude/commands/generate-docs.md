# Generate Documentation Command

You are a documentation generator for the Carmen ERP system (hospitality/hotel management).

## Task
Generate complete documentation set (BR, UC, TS, DD, FD, VAL) for: **{module}/{submodule}**

## Critical Rules
1. **ONLY document features that exist in source code** - scan first, document second
2. **Use hospitality personas** - chefs, housekeepers, purchasing staff, etc. (not generic roles)
3. **Follow templates exactly** - see docs/app/template-guide/ for structure and format
4. **Verify everything** - every feature must have code evidence
5. **Be specific, not verbose** - create document in a more concise format to avoid the token limit.

---

## Step 1: Source Code Scan

### 1.1 Locate Module Files
```
Search in: app/(main)/{module}/{submodule}/
Find: **/*.{ts,tsx}
Also check: lib/types/*.ts, lib/mock-data/*.ts
```

### 1.2 Extract These Elements
- [ ] **Pages**: All page.tsx routes (List, Detail, Create, Edit)
- [ ] **Components**: All UI components in components/
- [ ] **Server Actions**: All functions in actions/
- [ ] **Types**: All interfaces and enums in types/
- [ ] **Validations**: All Zod schemas
- [ ] **Business Logic**: Calculations, workflows, status transitions

### 1.3 Build Feature Inventory
For each feature found, note:
- Feature name
- Source file location
- User persona who uses it
- Required fields/data
- Validation rules
- Integration points

---

## Step 2: Generate Documents

Use templates from `docs/app/template-guide/`

### 2.1 BR (Business Requirements)
Template: `BR-template.md`

For each feature found in code:
```
### FR-XXX-NNN: [Feature Name from Code]
**Priority**: [High/Medium/Low based on criticality]
**User Story**: As a [hospitality persona], I want to [action from code] so that [business benefit].

**Requirements**:
[List from code analysis - use actual field names, actual validations, actual workflows]

**Intent**:
describe in bullet points the feature objectives related to user inent 

**Acceptance Criteria**:
[Testable criteria from component behavior and validation rules]
```

**Hospitality Personas to Use:**
- Head Chef, Sous Chef (F&B operations)
- Housekeeping Manager, Housekeeper (room operations)
- Chief Engineer, Maintenance Staff (engineering)
- Purchasing Manager, Buyer (procurement)
- Receiving Clerk, Storekeeper (warehouse)
- Financial Controller, AP Clerk (finance)
- General Manager, Department Manager (management)

### 2.2 UC (Use Cases)
Template: `UC-template.md`

For each server action:
```
### UC-XXX-NNN: [Action Name]
**Actor**: [Hospitality Persona]
**Preconditions**: [From code state checks]

**Main Flow**:
[Step-by-step from actual code implementation]

**Alternative Flows**: [From conditional logic in code]
**Exception Flows**: [From error handling in code]
```

### 2.3 TS (Technical Specification)
Template: `TS-template.md`
Reference: `docs/app/procurement/purchase-requests/TS-purchase-requests.md` (text format, no code)

- System architecture Mermaid diagram (actual integrations)
- Page hierarchy Mermaid diagram (actual routes)
- Page descriptions (actual pages only)
- Navigation flow Mermaid diagrams (actual workflows)
- Component descriptions (actual components, their responsibilities, no code)
- Server action descriptions (actual functions, inputs/outputs, no code)
- Integration points (actual external systems only)

### 2.4 DD (Data Definition)
Template: `DD-template.md`

- Extract tables from the /Users/peak/Documents/GitHub/carmen/data/schema.prisma calls if it does not exsist add the require fields and tables
- Document columns from TypeScript interfaces
- Show relationships from foreign key usage
- Use actual mock data for examples

### 2.5 FD (Flow Diagrams)
Template: `FD-template.md`

- Create Mermaid diagrams for actual workflows found in code
- Use actual status values from enums
- Show actual decision points from conditional logic

### 2.6 VAL (Validations)
Template: `VAL-template.md`

- Extract all Zod schemas
- Document custom validators
- List database constraints
- Use actual error messages from code

---

## Step 3: Quality Verification

### 3.1 Code Coverage Check
- [ ] Every FR-XXX feature has source code evidence
- [ ] Every UC-XXX workflow exists in implementation
- [ ] Every page documented exists in file system
- [ ] Every table documented appears in queries
- [ ] Every validation documented exists in schemas
- [ ] **ZERO fictional features added**

### 3.2 Hospitality Context Check
- [ ] All personas are hotel-specific roles
- [ ] All examples use hotel scenarios (F&B, housekeeping, maintenance)
- [ ] Terminology is hospitality-focused (kitchen, store, department, not generic)
- [ ] Workflows match hotel operations

### 3.3 Template Compliance Check
- [ ] BR follows user story template format
- [ ] All documents have required sections
- [ ] User stories: "As a [who], I want to [what] so that [why]"
- [ ] Acceptance criteria are testable and specific
- [ ] No code in TS document (high-level descriptions only)

---

## Output

Generate these 6 files in `docs/app/{module}/{submodule}/`:

1. **BR-{submodule}.md** - Business Requirements with user stories
2. **UC-{submodule}.md** - Use Cases with detailed workflows
3. **TS-{submodule}.md** - Technical Specification (text + Mermaid, NO code)
4. **DD-{submodule}.md** - Data Definition with text description of actual tables
5. **FD-{submodule}.md** - Flow Diagrams (Mermaid)
6. **VAL-{submodule}.md** - Validation Rules extracted from code

---

## Example Scan Commands

```bash
# Find all module files
glob: app/(main)/{module}/{submodule}/**/*.{ts,tsx}

# Find interface definitions
grep: "interface \w+" in types/
grep: "export interface" in lib/types/

# Find components
glob: components/*.tsx
grep: "export function \w+" in components/

# Find server actions
glob: actions/*.ts
grep: "export async function" in actions/

# Find validations
grep: "z\.object\(" in all files
grep: "z\.(string|number|array)" in all files

# Find database queries
grep: "supabase\.from\(" in actions/
grep: "\.select\(|\.insert\(|\.update\(" in actions/

# Find status enums
grep: "export (type|enum).*Status" in types/
grep: "status.*===" in all files
```

---

## Critical Reminders

⚠️ **NEVER add fictional features** - if it's not in the code, it's not real
✅ **Always scan code first** - understand before documenting
✅ **Use exact names** - field names, status values, messages from actual code
✅ **Hospitality context** - every persona and example must fit hotel operations
✅ **Follow templates** - structure, format, and style must match exactly

---

## Arguments

When executing this command, specify:
- `{module}` - Parent module (e.g., "procurement", "inventory")
- `{submodule}` - Sub-module to document (e.g., "vendor-management")
- Optional: `--scan-depth` (quick|standard|thorough) - default: thorough
- Optional: `--verify-only` (true|false) - only verify, don't generate - default: false

## Example Usage

```
/generate-docs {module=procurement} {submodule=vendor-management}
/generate-docs {module=inventory} {submodule=stock-adjustments} {scan-depth=thorough}
/generate-docs {module=finance} {submodule=invoices} {verify-only=true}
```
