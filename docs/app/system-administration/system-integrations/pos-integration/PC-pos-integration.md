# Page Components: POS Integration

## Module Information
- **Module**: System Administration > System Integrations
- **Sub-Module**: POS Integration
- **Route**: `/system-administration/system-integration/pos`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-27

---

## Route Structure

```
app/(main)/system-administration/system-integration/pos/
  layout.tsx                          # Sub-nav: Setup | Operate | Audit
  page.tsx                            # Redirect → ./operate
  setup/
    page.tsx                          # Setup landing (tabs: Connections | Mappings)
    connections/
      page.tsx                        # Connection list + wizard
    mappings/
      page.tsx                        # Mapping sub-tabs
  operate/
    page.tsx                          # Sync Health dashboard
    exceptions/
      page.tsx                        # Exception Queue
  audit/
    page.tsx                          # Audit tabs: Raw Transactions | Sync Events
  components/
    pos-layout-nav.tsx                # Section sub-nav (Setup | Operate | Audit)
    setup/
      pos-connection-list.tsx         # List of configured POS connections
      pos-connection-wizard.tsx       # Add/edit connection wizard
      pos-mapping-tab.tsx             # (existing — moved here from root)
    operate/
      pos-sync-health.tsx             # Sync Health dashboard (was pos-dashboard.tsx)
      pos-exception-queue.tsx         # Exception Queue with bulk actions
    audit/
      pos-transactions-tab.tsx        # (existing — moved here from root)
      pos-sync-events.tsx             # Sync event history
```

---

## Section: Setup

### Setup Landing (`setup/page.tsx`)

**Purpose**: Configuration home. Two tabs: Connections, Mappings.

| Tab | Content |
|-----|---------|
| Connections | List of POS connections + Add Connection button |
| Mappings | Recipe, Unit, Location, Fractional, Modifier sub-tabs |

---

### Connection List (`pos-connection-list.tsx`)

**Purpose**: Show all configured POS connections with status indicators.

**Columns**:
| Column | Description |
|--------|-------------|
| POS System | Model name + icon (Square, Toast, Lightspeed, etc.) |
| Connector Mode | `api`, `file_import`, or `webhook` badge |
| Carmen Location | Linked location name |
| Status | `active` (green), `paused` (amber), `error` (red) |
| Last Sync | Relative time (e.g., "2 minutes ago") |
| SC Generation | Enabled / Disabled toggle |
| Actions | Edit, Pause/Resume, Test, Delete |

**Empty State**: "No POS connections configured. Click Add Connection to get started."

---

### Connection Wizard (`pos-connection-wizard.tsx`)

**Purpose**: Step-by-step wizard to add or edit a POS connection.

**Steps**:

1. **Select POS Model**
   - Cards for: Square, Toast, Lightspeed, Micros, Generic CSV, Generic XML, Other
   - Selecting a model shows which connector modes it supports

2. **Configure Connector**
   - `api`: API endpoint URL, API key/credentials, sync frequency selector
   - `file_import`: File format (CSV/XML), column mapping wizard, upload schedule
   - `webhook`: System-generated webhook URL (copy button), secret key, event types

3. **Map Location**
   - Dropdown: Select Carmen location
   - Sub-dropdown: Select POS outlet at that location (fetched from the connection)

4. **Settings**
   - Sync schedule (5 / 15 / 30 / 60 min, or manual)
   - Enable SC generation toggle
   - Notification recipients

5. **Test & Save**
   - "Test Connection" button → shows success/error inline
   - "Save" creates the connection (status: `active`)

---

### Mapping Tab (`pos-mapping-tab.tsx`)

**Purpose**: Recipe, unit, location, fractional variant, and modifier mappings.

**Sub-tabs** (existing structure retained, new Modifiers tab added):
| Sub-tab | Purpose |
|---------|---------|
| Recipes | Map POS items to Carmen recipes |
| Units | Map POS units to Carmen UoMs |
| Locations | Map POS outlets to Carmen locations |
| Fractional | Configure fractional sale variants (slices, portions) |
| Modifiers | Map POS add-ons/modifiers to recipe ingredients (NEW) |

**Modifiers sub-tab** (new):
- Lists all POS modifiers fetched from connected POS systems
- For each modifier: POS modifier name, mapped ingredient(s), quantity per occurrence
- Unmapped modifiers highlighted with amber badge
- Quick-map action: select modifier → select ingredient(s) → set qty → save

---

## Section: Operate

### Sync Health Dashboard (`pos-sync-health.tsx`)

**Purpose**: At-a-glance view of integration health. Default landing on navigate to POS.

**Panels**:
| Panel | Content |
|-------|---------|
| Connection Status | Card per active connection: name, last sync time, status indicator |
| Exception Summary | Count of open exceptions by reason code category |
| SC Generation Status | Yesterday's SCs: Posted / Posted with Exceptions / Blocked per location |
| Recent Sync Activity | Last 5 sync events with timestamp and transaction count |

**Quick Actions**:
- "View Exceptions" → navigate to `operate/exceptions/`
- "View SC Documents" → navigate to `store-operations/sales-consumption/`

---

### Exception Queue (`pos-exception-queue.tsx`)

**Purpose**: The operational hot spot. Lists all unresolved exception lines from SC generation, with bulk actions.

**Filters**:
| Filter | Options |
|--------|---------|
| Reason Code | All, UNMAPPED_ITEM, MISSING_RECIPE, ZERO_COST_INGREDIENT, LOCATION_UNMAPPED, FRACTIONAL_MISSING_VARIANT, MODIFIER_UNMAPPED, CURRENCY_MISMATCH, REFUND_PARTIAL, COMP_OR_DISCOUNT, STALE_TRANSACTION |
| Location | All, [list of locations] |
| Date | Date range picker |
| Status | Pending, Informational (auto-resolved), All |

**Table Columns**:
| Column | Description |
|--------|-------------|
| POS Item | Item name from POS |
| Reason Code | Badge with label (e.g., "Unmapped Item") |
| Sale Date | Business date of the original sale |
| Outlet | POS outlet name |
| Qty Sold | Quantity from POS transaction |
| SC Reference | Link to parent SC document |
| Actions | Resolve & Re-post, Defer, Mark Non-inventory, Discard |

**Bulk Actions Toolbar** (visible when rows selected):
- Resolve & Re-post selected
- Mark as Non-inventory
- Defer to Tomorrow
- Discard with Reason

**Empty State**: "No open exceptions. All POS sales have been posted to inventory."

---

## Section: Audit

### Raw Transactions Log (`pos-transactions-tab.tsx`)

**Purpose**: Full log of raw POS transaction records. Reference and troubleshooting only.

**Columns**: Transaction ID, POS Item, Date/Time, Outlet, Quantity, Amount, Status (staged / included_in_sc / exception / voided)

**Filters**: Location, date range, status

**Note**: This is a read-only log. Actions on transactions happen via the Exception Queue.

---

### Sync Events Log (`pos-sync-events.tsx`)

**Purpose**: Log of sync job executions per connection.

**Columns**: Timestamp, Connection, Mode, Transactions Fetched, Transactions New, Errors, Duration

**Use Cases**: Debugging sync failures, verifying schedule adherence, auditing data gaps.

---

## Navigation Sub-Nav (`pos-layout-nav.tsx`)

**Component**: Horizontal tab-style nav rendered in the POS layout.

```
[Setup]   [Operate ●]   [Audit]
           ↑ Badge shows open exception count
```

Operate tab shows a red badge count when open exceptions exist (count > 0). This ensures the daily job is visible without the user having to navigate.

---

**Document End**
