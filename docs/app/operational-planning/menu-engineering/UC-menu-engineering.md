# Menu Engineering - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Operational Planning > Menu Engineering
- **Version**: 1.1.0
- **Last Updated**: 2025-01-05

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2025-01-05 | System | Added implementation status section |
| 1.0 | 2024-01-15 | System | Initial use cases document created |

## ⚠️ Implementation Status

**Current State**: SUBSTANTIAL IMPLEMENTATION (~70-80% Complete)

This use case document describes the Menu Engineering module's comprehensive functionality. **See [BR-menu-engineering.md](./BR-menu-engineering.md) Implementation Status section** for detailed breakdown of what EXISTS vs what's PROPOSED.

**Key Implemented Features**:
- ✅ Menu Engineering Dashboard with Boston Matrix visualization
- ✅ Sales data import from POS systems (Square, Toast, Clover, Resy, OpenTable)
- ✅ Cost alert management with configurable thresholds
- ✅ Recipe performance metrics tracking
- ✅ Portfolio composition analysis
- ✅ AI-powered optimization recommendations
- ✅ Real-time filtering and date range selection
- ✅ 8 comprehensive API routes with security, validation, and rate limiting

**NOTE**: All use cases in this document are supported by existing UI components, API routes, and services. Database persistence layer and advanced features (competitor analysis, automated notifications, ML forecasting) are in design phase.

---

## Use Case Index

| Use Case ID | Use Case Name | Priority | Actor |
|-------------|---------------|----------|-------|
| UC-MENG-001 | View Menu Engineering Dashboard | Critical | Manager, Executive |
| UC-MENG-002 | Analyze Menu Engineering Matrix | Critical | Manager, Chef |
| UC-MENG-003 | View Item Performance Details | High | Manager, Chef |
| UC-MENG-004 | Generate Strategic Recommendations | Critical | Manager, Executive |
| UC-MENG-005 | Apply Price Optimization | Critical | Manager, Pricing Analyst |
| UC-MENG-006 | Manage Competitor Data | Medium | Manager, Marketing |
| UC-MENG-007 | Track Item Lifecycle | High | Manager, Chef |
| UC-MENG-008 | Generate Performance Reports | High | Manager, Executive |
| UC-MENG-009 | Configure Analysis Settings | Medium | Manager, Admin |
| UC-MENG-010 | Run Menu Optimization Experiment | Medium | Manager, Marketing |
| UC-MENG-011 | Forecast Item Sales | High | Manager, Operations |
| UC-MENG-012 | Bulk Update Menu Items | Medium | Manager, Admin |
| UC-MENG-013 | Export Performance Data | Medium | Manager, Analyst |
| UC-MENG-014 | View Contribution Margin Analysis | High | Manager, Finance |
| UC-MENG-015 | Monitor Menu Mix Trends | High | Manager, Operations |

---

## UC-MENG-001: View Menu Engineering Dashboard

### Description
Users can view a comprehensive dashboard displaying key menu performance metrics, Menu Engineering Matrix visualization, and actionable alerts for menu optimization opportunities.

### Actor(s)
- Primary: Restaurant Manager, General Manager
- Secondary: Executive, Operations Manager

### Priority
Critical

### Frequency
Daily (1-5 times per day)

### Preconditions
1. User is authenticated
2. User has `menu_engineering.view` permission
3. At least 90 days of sales data available
4. Menu items linked to recipes with costs

### Postconditions
1. Dashboard displays current performance metrics
2. User understands menu performance at-a-glance
3. Alert notifications presented for urgent items
4. User can drill down into specific items

### Main Flow
1. User navigates to Menu Engineering module
2. System loads dashboard with default date range (last 30 days)
3. System displays Executive Summary panel:
   - Total menu items count
   - Average contribution margin
   - Average menu mix percentage
   - Total revenue for period
   - Classification summary (Stars: X, Plowhorses: Y, Puzzles: Z, Dogs: W)
4. System displays Menu Engineering Matrix visualization:
   - Four-quadrant scatter plot
   - Items plotted by profitability (Y-axis) and popularity (X-axis)
   - Color-coded by classification
   - Threshold lines showing averages
5. System displays Top Performers panel:
   - Top 5 items by contribution margin
   - Top 5 items by sales volume
   - Top 5 items by revenue
6. System displays Alerts panel:
   - Critical items requiring attention (Dogs, low margin)
   - Price change opportunities
   - Trending items (up/down)
7. System displays Category Performance panel:
   - Pie chart showing revenue distribution
   - Category contribution margins
8. User reviews dashboard metrics
9. User can click on any metric to drill down to details

### Alternative Flows

#### A1: Change Date Range
- **Trigger**: User clicks date range selector
- **Flow**:
  1. User selects new date range (custom, last 7 days, last 30 days, last 90 days, year-to-date)
  2. System validates date range (max 365 days)
  3. System recalculates all metrics for selected period
  4. System refreshes all dashboard panels
  5. System updates all visualizations
  6. System saves date range preference

#### A2: Filter by Location
- **Trigger**: User selects specific location from dropdown
- **Flow**:
  1. User selects location (or "All Locations")
  2. System filters data to selected location
  3. System recalculates metrics for location
  4. System refreshes dashboard
  5. System displays location name in header

#### A3: Drill Down to Item Details
- **Trigger**: User clicks on specific item in matrix or list
- **Flow**:
  1. System navigates to Item Performance Details (UC-MENG-003)
  2. System displays detailed metrics for selected item
  3. User reviews item-specific performance
  4. User can return to dashboard via breadcrumb

### Exception Flows

#### E1: Insufficient Data
- **Trigger**: Less than 7 days of sales data available
- **Flow**:
  1. System displays warning message: "Insufficient data for analysis. Minimum 7 days required."
  2. System shows available data with disclaimer
  3. System disables forecasting features
  4. User can still view basic metrics with limited insights

#### E2: No Sales Data for Period
- **Trigger**: Selected date range has zero sales transactions
- **Flow**:
  1. System displays empty state message
  2. System suggests checking date range or data sync status
  3. System shows last successful data sync timestamp
  4. User can change date range or contact support

#### E3: Dashboard Load Failure
- **Trigger**: Database error or timeout
- **Flow**:
  1. System displays error message: "Unable to load dashboard. Please try again."
  2. System shows retry button
  3. System logs error for investigation
  4. User clicks retry or refreshes page

### Business Rules Applied
- BR-MENG-001: Menu item classification based on profitability and popularity thresholds
- BR-MENG-002: Contribution margin thresholds (30% critical, 40% warning, 60-75% target)
- BR-MENG-011: Menu mix monitoring alerts for significant deviations

### Performance Requirements
- Dashboard initial load: < 3 seconds for 500 items
- Date range change: < 2 seconds
- Matrix visualization render: < 1 second
- Real-time data refresh: < 5 minutes lag from POS

### Acceptance Criteria
- [ ] Dashboard displays within 3 seconds
- [ ] All panels load successfully
- [ ] Menu Engineering Matrix plots all items correctly
- [ ] Color coding matches classifications
- [ ] Alert count badge displays accurately
- [ ] Top performers calculated correctly
- [ ] Category breakdown sums to 100%
- [ ] Date range selector functional
- [ ] Location filter functional
- [ ] Drill-down navigation works
- [ ] Empty states handled gracefully

---

## UC-MENG-002: Analyze Menu Engineering Matrix

### Description
Users can view and interact with the Menu Engineering Matrix (Kasavana-Smith model) to classify menu items into Stars, Plowhorses, Puzzles, and Dogs based on profitability and popularity metrics.

### Actor(s)
- Primary: Restaurant Manager, Chef
- Secondary: Operations Manager, Executive

### Priority
Critical

### Frequency
Daily to weekly

### Preconditions
1. User is viewing Menu Engineering dashboard (UC-MENG-001)
2. At least 30 days of sales data available
3. All menu items have linked recipes with costs
4. Contribution margins calculated for all items

### Postconditions
1. User understands item classifications
2. User identifies items needing strategic action
3. Matrix provides visual insights for decision-making
4. Strategic recommendations generated (UC-MENG-004)

### Main Flow
1. User views Menu Engineering Matrix on dashboard
2. System displays four-quadrant scatter plot:
   - X-axis: Popularity (Menu Mix %)
   - Y-axis: Profitability (Contribution Margin)
   - Vertical line: Average Contribution Margin
   - Horizontal line: 70% of Expected Menu Mix
3. For each menu item, system plots point:
   - Position based on actual metrics
   - Size based on sales volume (optional)
   - Color based on classification:
     - Green: Stars (top-right quadrant)
     - Yellow: Plowhorses (bottom-right quadrant)
     - Blue: Puzzles (top-left quadrant)
     - Red: Dogs (bottom-left quadrant)
4. System displays legend with classification counts
5. User hovers over item point to view tooltip:
   - Item name
   - Contribution margin: $X (Y%)
   - Menu mix: Z%
   - Classification
   - Sales volume: N units
6. User can click item to view details (UC-MENG-003)
7. User identifies items requiring strategic action

### Alternative Flows

#### A1: Filter by Category
- **Trigger**: User selects category filter
- **Flow**:
  1. User selects category from dropdown (Appetizers, Mains, Desserts, etc.)
  2. System filters matrix to show only selected category items
  3. System recalculates thresholds for category subset
  4. System redraws matrix with filtered items
  5. System updates legend counts
  6. User analyzes category-specific performance

#### A2: Adjust Threshold Settings
- **Trigger**: User clicks "Settings" gear icon
- **Flow**:
  1. User opens threshold configuration panel
  2. System displays current thresholds:
     - Popularity threshold: X% (default: 0.7 × Expected Menu Mix)
     - Profitability threshold: Average CM (calculated)
  3. User adjusts popularity threshold slider (0.5 - 1.0)
  4. System recalculates classifications with new threshold
  5. System updates matrix in real-time
  6. User can reset to default or save custom threshold
  7. System saves user preference

#### A3: View Historical Trends
- **Trigger**: User clicks "Show Trends" toggle
- **Flow**:
  1. System displays item movement over time
  2. System shows arrows indicating direction of movement:
     - Green up-arrow: Moving toward Star
     - Red down-arrow: Moving toward Dog
     - Gray: Stable position
  3. User can select time periods to compare
  4. System highlights items with significant movement (>10% change)
  5. User identifies trending items for further analysis

#### A4: Export Matrix Data
- **Trigger**: User clicks "Export" button
- **Flow**:
  1. System prompts for export format (PNG image, PDF report, CSV data)
  2. User selects format
  3. System generates export file
  4. System downloads file to user's device
  5. Export includes: matrix visualization, classification summary, item details

### Exception Flows

#### E1: Insufficient Items for Analysis
- **Trigger**: Less than 5 active menu items
- **Flow**:
  1. System displays warning: "Minimum 5 items required for meaningful analysis"
  2. System shows available items without matrix
  3. System suggests adding more menu items
  4. User can still view individual item metrics

#### E2: All Items in One Quadrant
- **Trigger**: All items classified the same (e.g., all Stars)
- **Flow**:
  1. System displays notice: "All items in [Classification] quadrant"
  2. System suggests this may indicate:
     - Very optimized menu (if all Stars)
     - Data quality issue (if all Dogs)
     - Need for menu diversification
  3. System recommends reviewing thresholds
  4. User investigates data or adjusts thresholds

#### E3: No Sales for Some Items
- **Trigger**: Items with zero sales in period
- **Flow**:
  1. System excludes zero-sales items from matrix
  2. System displays count of excluded items
  3. System provides "Show Excluded Items" link
  4. User clicks to view list of zero-sales items
  5. System suggests investigating availability or seasonality

### Business Rules Applied
- BR-MENG-001: Menu item classification rules
- Classification formula: Stars = High CM + High Popularity, etc.
- Expected Menu Mix = 100% / Number of Active Items
- Popularity Threshold = 0.7 × Expected Menu Mix
- Profitability Threshold = Average Contribution Margin

### Performance Requirements
- Matrix render: < 1 second for 500 items
- Hover tooltip: < 100ms
- Threshold adjustment: Real-time update (<500ms)
- Filter application: < 500ms

### Acceptance Criteria
- [ ] Matrix displays all active items correctly
- [ ] Quadrants properly labeled and colored
- [ ] Threshold lines displayed accurately
- [ ] Item points plotted at correct coordinates
- [ ] Tooltips show accurate data
- [ ] Color coding matches classifications
- [ ] Legend shows correct counts per quadrant
- [ ] Category filter works correctly
- [ ] Threshold adjustment updates matrix in real-time
- [ ] Click-through to item details functional
- [ ] Export functionality works for all formats

---

## UC-MENG-003: View Item Performance Details

### Description
Users can view comprehensive performance metrics for individual menu items including sales trends, profitability analysis, menu mix breakdown, lifecycle stage, and historical performance comparison.

### Actor(s)
- Primary: Restaurant Manager, Chef
- Secondary: Finance Manager, Operations Manager

### Priority
High

### Frequency
Multiple times per week

### Preconditions
1. User has selected menu item from dashboard or matrix
2. Menu item linked to recipe with cost data
3. At least 30 days of sales history for item

### Postconditions
1. User understands item's complete performance profile
2. User identifies specific issues or opportunities
3. User has data to make informed decisions
4. Recommendations available for next actions

### Main Flow
1. User clicks on menu item from dashboard or matrix
2. System navigates to Item Performance Details page
3. System displays item header:
   - Item name and image
   - Current classification badge (Star/Plowhorse/Puzzle/Dog)
   - Lifecycle stage indicator
   - Category and status
4. System displays Performance Summary panel:
   - Units sold: X (velocity: Y per day)
   - Total revenue: $Z
   - Contribution margin: $A (B%)
   - Menu mix: C%
   - Popularity index: D
5. System displays Sales Trend Chart:
   - Line graph showing daily/weekly sales volume
   - Revenue overlay
   - Trend direction indicator (↑ up X%, ↓ down Y%, → stable)
6. System displays Profitability Breakdown:
   - Selling price: $X
   - Food cost: $Y (from recipe)
   - Contribution margin: $Z
   - CM percentage: W%
   - Comparison to category average
   - Comparison to overall average
7. System displays Menu Mix Analysis:
   - Actual menu mix %
   - Expected menu mix %
   - Variance: +/- X%
   - Popularity classification (High/Low)
8. System displays Lifecycle Information:
   - Current stage: Introduction/Growth/Maturity/Decline
   - Days in current stage: X
   - Stage transition date (if applicable)
9. System displays Recommendations panel (from UC-MENG-004)
10. User reviews all metrics and recommendations

### Alternative Flows

#### A1: Compare Time Periods
- **Trigger**: User clicks "Compare Periods" button
- **Flow**:
  1. User selects two periods to compare (e.g., this month vs. last month)
  2. System displays side-by-side comparison:
     - Period 1: Sales, Revenue, CM, Menu Mix
     - Period 2: Sales, Revenue, CM, Menu Mix
     - Change: Absolute and percentage differences
  3. System highlights significant changes (>20% variance)
  4. System indicates whether changes are positive or negative
  5. User analyzes period-over-period performance

#### A2: View Competitor Comparison
- **Trigger**: User clicks "Competitor Analysis" tab
- **Flow**:
  1. System displays competitor pricing data (if available)
  2. System shows:
     - Our price: $X
     - Competitor A price: $Y
     - Competitor B price: $Z
     - Average competitor price: $W
  3. System calculates price index: Our Price / Avg Competitor
  4. System displays market position: Premium/Competitive/Value
  5. System recommends pricing adjustments if appropriate
  6. User evaluates competitive positioning

#### A3: View Customer Feedback
- **Trigger**: User clicks "Customer Feedback" tab
- **Flow**:
  1. System displays aggregated customer ratings
  2. System shows:
     - Average rating: X.X/5.0 stars
     - Number of reviews: N
     - Recent reviews (last 10)
     - Sentiment analysis: Positive/Neutral/Negative %
  3. System displays common themes from reviews
  4. System correlates feedback with sales trends
  5. User identifies quality or perception issues

#### A4: View Preparation Impact
- **Trigger**: User clicks "Operations" tab
- **Flow**:
  1. System displays operational metrics:
     - Preparation time: X minutes
     - Complexity score: Y/10
     - Contribution per minute: $Z/min
     - Kitchen station assignment
  2. System shows impact on kitchen flow
  3. System identifies bottlenecks if applicable
  4. User evaluates operational efficiency

### Exception Flows

#### E1: No Competitor Data
- **Trigger**: No competitor items mapped to this menu item
- **Flow**:
  1. System displays message: "No competitor data available for comparison"
  2. System shows "Add Competitor Data" button
  3. User clicks to add competitor information (UC-MENG-006)
  4. User can skip competitive analysis

#### E2: Insufficient Historical Data
- **Trigger**: Item added within last 7 days
- **Flow**:
  1. System displays warning: "Limited history. Trends may not be reliable."
  2. System shows available data with disclaimer
  3. System recommends waiting for more data
  4. User can still view available metrics

#### E3: Recipe Cost Not Updated
- **Trigger**: Recipe cost last updated >30 days ago
- **Flow**:
  1. System displays alert: "Recipe cost may be outdated (last updated [date])"
  2. System highlights cost fields in yellow
  3. System shows "Update Recipe Cost" button
  4. User can navigate to recipe management to update
  5. System tracks alert acknowledgment

### Business Rules Applied
- BR-MENG-001: Item classification based on current metrics
- BR-MENG-002: Contribution margin thresholds applied
- BR-MENG-011: Menu mix alerts for significant deviations
- Performance metrics calculated for selected date range
- Trends require minimum 7 days of data

### Performance Requirements
- Page load: < 2 seconds
- Chart rendering: < 1 second
- Period comparison: < 1 second
- Tab switching: < 500ms

### Acceptance Criteria
- [ ] All performance metrics display accurately
- [ ] Charts render correctly with proper scaling
- [ ] Classification badge matches calculations
- [ ] Lifecycle stage displayed correctly
- [ ] Recommendations panel shows relevant suggestions
- [ ] Period comparison calculates correctly
- [ ] Competitor data displays when available
- [ ] Customer feedback aggregated accurately
- [ ] Operational metrics shown correctly
- [ ] Alerts display for outdated data
- [ ] Navigation breadcrumb works
- [ ] Back to dashboard link functional

---

## UC-MENG-004: Generate Strategic Recommendations

### Description
System automatically generates strategic recommendations for menu items based on classification, performance trends, and business rules, providing actionable guidance for menu optimization.

### Actor(s)
- Primary: Restaurant Manager, Chef
- Secondary: Operations Manager, Executive

### Priority
Critical

### Frequency
Automated (daily), On-demand

### Preconditions
1. Menu items classified in Menu Engineering Matrix
2. Performance data available for at least 30 days
3. Recommendation rules configured in system
4. User has `menu_engineering.analyze` permission

### Postconditions
1. Recommendations generated for all applicable items
2. Recommendations prioritized by impact
3. Recommendations tracked for implementation
4. User has clear action plan for menu optimization

### Main Flow
1. System runs recommendation engine (automated nightly or user-triggered)
2. System analyzes each menu item:
   - Current classification (Star/Plowhorse/Puzzle/Dog)
   - Performance trends (up/down/stable)
   - Days in current classification
   - Contribution margin vs. targets
   - Menu mix variance
3. System generates recommendations based on classification:
   - **Stars**: Maintain price, promote prominently, consider premium variations
   - **Plowhorses**: Test price increase, reduce costs, bundle with high-margin items
   - **Puzzles**: Reposition on menu, improve description, offer promotions
   - **Dogs**: Remove from menu, replace with better performers
4. System assigns priority to each recommendation:
   - Critical: Immediate action required (Dogs >60 days, margin <30%)
   - High: Action within 7 days (Plowhorses, declining Stars)
   - Medium: Action within 30 days (Puzzles, stable items)
   - Low: Monitor (Stars, items <30 days old)
5. System calculates estimated impact:
   - Revenue impact: $X increase/decrease
   - Margin impact: Y% improvement
   - Implementation effort: Low/Medium/High
6. System displays recommendations on dashboard:
   - Priority badge (Critical/High/Medium/Low)
   - Item name and classification
   - Recommendation type (Pricing/Promotion/Removal/etc.)
   - Brief description
   - Expected impact
7. User reviews recommendations
8. User can expand for detailed view with implementation steps

### Alternative Flows

#### A1: View Recommendation Details
- **Trigger**: User clicks on specific recommendation
- **Flow**:
  1. System displays recommendation detail panel
  2. System shows:
     - Full recommendation description
     - Supporting data and rationale
     - Step-by-step implementation guide
     - Expected outcomes (revenue, margin)
     - Required resources (staff, budget, time)
     - Timeline (immediate, short-term, long-term)
  3. System displays related recommendations (if any)
  4. User can approve, reject, or defer recommendation
  5. System tracks decision with timestamp

#### A2: Approve Recommendation
- **Trigger**: User clicks "Approve" on recommendation
- **Flow**:
  1. System changes recommendation status to "Approved"
  2. System prompts for implementation plan:
     - Start date
     - Responsible person
     - Target completion date
  3. User enters implementation details
  4. System creates task/reminder for follow-up
  5. System moves recommendation to "In Progress"
  6. System tracks approval timestamp and user

#### A3: Reject Recommendation
- **Trigger**: User clicks "Reject" on recommendation
- **Flow**:
  1. System prompts for rejection reason:
     - Not aligned with strategy
     - Timing not appropriate
     - Resource constraints
     - Other (text input)
  2. User selects reason and adds notes
  3. System changes status to "Rejected"
  4. System removes from active recommendations list
  5. System logs rejection for learning/audit
  6. Recommendation may resurface if conditions change

#### A4: Filter Recommendations
- **Trigger**: User applies filter criteria
- **Flow**:
  1. User selects filter: Priority, Type, Category, Classification
  2. System filters recommendation list
  3. System updates count badge
  4. System displays filtered recommendations
  5. User can clear filters to see all

#### A5: Generate Custom Report
- **Trigger**: User clicks "Export Recommendations"
- **Flow**:
  1. System prompts for report options:
     - Include approved only / pending only / all
     - Include implementation plans
     - Include impact estimates
  2. User selects options and format (PDF/Excel)
  3. System generates report with:
     - Executive summary
     - Recommendation list with details
     - Priority breakdown
     - Expected total impact
  4. System downloads report file

### Exception Flows

#### E1: No Recommendations Generated
- **Trigger**: All items performing optimally (all Stars)
- **Flow**:
  1. System displays message: "Great job! All items performing well."
  2. System shows summary of Star items
  3. System suggests monitoring for changes
  4. User acknowledges and continues monitoring

#### E2: Conflicting Recommendations
- **Trigger**: Two recommendations contradict each other
- **Flow**:
  1. System detects conflict (e.g., increase and decrease price)
  2. System prioritizes based on recency and impact
  3. System displays warning: "Conflicting recommendations detected"
  4. System presents both options with trade-offs
  5. User selects preferred recommendation
  6. System archives conflicting recommendation

#### E3: Implementation Failed
- **Trigger**: Approved recommendation does not yield expected results
- **Flow**:
  1. System monitors performance post-implementation
  2. System detects actual impact < 50% of expected
  3. System generates alert: "Recommendation underperforming"
  4. System analyzes factors (timing, execution, external)
  5. User reviews and may rollback or adjust
  6. System learns from outcome for future recommendations

### Business Rules Applied
- BR-MENG-005: Dog item removal policy (>60 days)
- BR-MENG-006: Star item promotion requirements
- BR-MENG-007: Puzzle item intervention timeline (90 days)
- BR-MENG-008: Plowhorse pricing strategy (60 days)
- Recommendations prioritized by financial impact
- Critical recommendations cannot be deferred >7 days

### Performance Requirements
- Recommendation generation: < 5 seconds for 500 items
- Detail panel load: < 500ms
- Approval/rejection action: < 1 second
- Report generation: < 10 seconds

### Acceptance Criteria
- [ ] Recommendations generated for all applicable items
- [ ] Priority calculated correctly
- [ ] Impact estimates reasonable and data-driven
- [ ] Star recommendations focus on maintenance
- [ ] Plowhorse recommendations focus on profitability
- [ ] Puzzle recommendations focus on promotion
- [ ] Dog recommendations focus on removal
- [ ] Implementation steps clear and actionable
- [ ] Approval workflow functional
- [ ] Rejection tracking works
- [ ] Status updates persist
- [ ] Filters work correctly
- [ ] Export generates complete report

---

## UC-MENG-005: Apply Price Optimization

### Description
Users can analyze pricing scenarios, apply data-driven price adjustments to menu items, and track the impact of pricing changes on profitability and sales volume.

### Actor(s)
- Primary: Restaurant Manager, Pricing Analyst
- Secondary: Finance Manager, Executive

### Priority
Critical

### Frequency
Weekly to monthly

### Preconditions
1. User has `menu_engineering.approve` permission (for price changes >5%)
2. Menu item has current price and cost data
3. Historical sales data available for price elasticity analysis
4. Strategic recommendation for pricing exists (from UC-MENG-004)

### Postconditions
1. New price set for menu item
2. Price change logged with justification
3. Expected impact documented
4. POS system updated with new price (integration)
5. Price change tracked for effectiveness evaluation

### Main Flow
1. User reviews pricing recommendation (UC-MENG-004)
2. User clicks "Optimize Pricing" on item detail page
3. System displays Price Optimization panel:
   - Current price: $X
   - Current food cost: $Y (Z%)
   - Current contribution margin: $A (B%)
   - Target contribution margin: C% (configurable)
4. System displays Pricing Scenarios:
   - **Scenario 1**: Target CM-based pricing
     - Recommended price: $W
     - Expected CM: E%
     - Expected impact: +F% margin, -G% volume (estimated)
   - **Scenario 2**: Competitive pricing
     - Competitor average: $R
     - Recommended price: $S (±5% of competitor avg)
     - Market position: Premium/Competitive/Value
   - **Scenario 3**: Psychological pricing
     - Rounded price: $T.00
     - Charm price: $T.95 or $T.99
     - Expected conversion impact: +H%
5. System displays Historical Price Changes (if any):
   - Previous prices and dates
   - Volume impact of past changes
   - Elasticity estimates
6. User selects preferred scenario or enters custom price
7. System validates proposed price change:
   - Checks maximum increase limit (15%)
   - Calculates new contribution margin
   - Estimates volume impact based on elasticity
8. User enters justification for price change
9. User clicks "Apply Price Change"
10. System checks approval requirements:
    - <5% increase: Auto-approved
    - 5-10% increase: Manager approval required
    - >10% increase: Director approval required
11. If approval required:
    - System sends approval request
    - Manager reviews and approves/rejects
    - System notifies user of decision
12. If approved or auto-approved:
    - System updates menu item price
    - System logs price change with metadata
    - System pushes update to POS (integration)
    - System displays success message
13. System schedules evaluation date (14 days post-change)

### Alternative Flows

#### A1: Run What-If Analysis
- **Trigger**: User clicks "Run Scenario Analysis"
- **Flow**:
  1. User enters hypothetical prices (up to 5)
  2. System calculates for each price:
     - New contribution margin
     - Estimated volume change (based on elasticity)
     - Estimated revenue change
     - Estimated total contribution change
  3. System displays comparison table and chart
  4. System highlights optimal price (highest total contribution)
  5. User selects price to apply or cancels

#### A2: Apply Bundle Pricing
- **Trigger**: User selects "Bundle Strategy" recommendation
- **Flow**:
  1. System suggests complementary items for bundling
  2. User selects items to include in bundle (2-4 items)
  3. System calculates:
     - Individual prices sum: $X
     - Recommended bundle price: $Y (15-20% discount)
     - Bundle contribution margin
  4. User sets bundle price
  5. System creates bundle in POS (integration)
  6. User tracks bundle performance separately

#### A3: Schedule Promotional Pricing
- **Trigger**: User selects "Limited-Time Promotion" option
- **Flow**:
  1. User enters promotional price (lower than regular)
  2. User sets promotion start and end dates
  3. User sets promotion conditions (day parts, days of week)
  4. System validates:
     - Promotional price still profitable (CM > 30%)
     - Duration reasonable (7-30 days typical)
  5. System schedules promotion in POS
  6. System tracks promotion performance
  7. System auto-reverts to regular price after end date
  8. System generates promotion effectiveness report

#### A4: Reject Price Change
- **Trigger**: Approver rejects price change request
- **Flow**:
  1. Approver reviews request and clicks "Reject"
  2. Approver enters rejection reason
  3. System notifies requester of rejection
  4. System displays rejection reason
  5. User can revise and resubmit or cancel
  6. System logs rejection for audit

### Exception Flows

#### E1: Insufficient Data for Elasticity Estimate
- **Trigger**: No historical price changes to analyze
- **Flow**:
  1. System displays warning: "Limited elasticity data. Estimate may be inaccurate."
  2. System uses industry benchmarks as fallback
  3. System recommends smaller price change (5% max)
  4. System suggests monitoring closely post-change
  5. User proceeds with caution

#### E2: Price Decrease Requested
- **Trigger**: User attempts to decrease price
- **Flow**:
  1. System prompts for justification (required)
  2. System warns of margin impact
  3. System requires manager approval (always)
  4. Manager reviews justification
  5. If approved:
     - System applies decrease
     - System monitors competitive response
     - System tracks volume increase
  6. If rejected: User can revise or cancel

#### E3: Price Change Would Violate Minimum Margin
- **Trigger**: Proposed price yields CM < 30%
- **Flow**:
  1. System blocks price change
  2. System displays error: "Price too low. CM would be X% (minimum 30% required)."
  3. System suggests:
     - Reduce food cost (improve recipe efficiency)
     - Set higher price
     - Consider removing item
  4. User adjusts proposal or cancels

#### E4: POS Integration Failure
- **Trigger**: POS system unavailable or rejects update
- **Flow**:
  1. System saves price change locally
  2. System displays warning: "POS update failed. Price change saved locally."
  3. System queues for retry (automated)
  4. System sends alert to IT/support
  5. System retries every 5 minutes for 1 hour
  6. If still fails, manual intervention required
  7. User notified of status

### Business Rules Applied
- BR-MENG-004: Price change approval workflow based on magnitude
- BR-MENG-002: Contribution margin minimum thresholds
- Maximum price increase: 15% per change
- Minimum evaluation period: 14 days between price changes
- Price decreases always require approval
- Historical pricing tracked for 24 months

### Performance Requirements
- Scenario calculation: < 1 second for 5 scenarios
- Price validation: < 500ms
- POS integration: < 3 seconds
- Approval workflow: < 1 second

### Acceptance Criteria
- [ ] Current pricing displayed accurately
- [ ] Scenarios calculated correctly based on targets
- [ ] Competitive pricing reflects current competitor data
- [ ] Psychological pricing options presented
- [ ] What-if analysis functional
- [ ] Price validation prevents invalid changes
- [ ] Approval workflow enforced correctly
- [ ] Justification required for all changes
- [ ] POS integration updates prices
- [ ] Price change logged with full metadata
- [ ] Success message displayed
- [ ] Email notification sent to approvers
- [ ] Historical price changes tracked

---

## UC-MENG-006: Manage Competitor Data

### Description
Users can add, update, and track competitor menu items and pricing to enable competitive analysis and market positioning decisions.

### Actor(s)
- Primary: Restaurant Manager, Marketing Manager
- Secondary: Operations Manager

### Priority
Medium

### Frequency
Weekly to monthly

### Preconditions
1. User has `menu_engineering.view` permission
2. Competitor profiles created in system

### Postconditions
1. Competitor items tracked with current pricing
2. Competitive analysis available for menu items
3. Market positioning calculated
4. Price index updated

### Main Flow
1. User navigates to Competitor Analysis section
2. System displays list of tracked competitors
3. User selects competitor or clicks "Add Competitor"
4. System displays competitor form:
   - Competitor name (required)
   - Address/location
   - Restaurant type (fine dining, casual, etc.)
   - Price range ($, $$, $$$, $$$$)
   - Direct competitor flag
5. User enters competitor information
6. User clicks "Add Competitor Items"
7. System displays item entry form:
   - Competitor item name
   - Category (for comparison)
   - Price
   - Portion size/description
   - Link to our menu item (optional mapping)
   - Source (visit, website, menu photo)
   - Date observed
8. User enters competitor item details
9. User can add multiple items
10. User clicks "Save"
11. System saves competitor and items
12. System calculates competitive metrics:
    - Average competitor price by category
    - Our price index vs. competitors
    - Market position (premium/competitive/value)
13. System displays competitive comparison dashboard

### Alternative Flows

#### A1: Update Competitor Pricing
- **Trigger**: User clicks "Update Prices" on competitor
- **Flow**:
  1. System displays current competitor items and prices
  2. User updates prices that have changed
  3. User enters date of update
  4. User notes source of updated information
  5. System saves updates with timestamp
  6. System marks previous prices as historical
  7. System recalculates competitive metrics
  8. System tracks price change trends

#### A2: Map Competitor Item to Our Menu
- **Trigger**: User clicks "Map Item" on competitor item
- **Flow**:
  1. System displays our menu items in same category
  2. User selects corresponding menu item (or "No match")
  3. System creates mapping relationship
  4. System calculates direct price comparison:
     - Our price: $X
     - Their price: $Y
     - Difference: $Z (A%)
  5. System displays on our item detail page
  6. User can view competitive analysis (UC-MENG-003, A2)

#### A3: View Competitor Price History
- **Trigger**: User clicks "Price History" on competitor item
- **Flow**:
  1. System displays timeline of price changes
  2. System shows:
     - Date of change
     - Previous price → New price
     - % change
     - Source of information
  3. System identifies trends (increasing, decreasing, stable)
  4. User analyzes competitive pricing strategy
  5. User considers our pricing response

#### A4: Remove Competitor
- **Trigger**: User clicks "Remove" on competitor
- **Flow**:
  1. System prompts for confirmation
  2. System warns: "X items will be archived"
  3. User confirms removal
  4. System soft-deletes competitor (sets inactive)
  5. System archives competitor items
  6. System removes from active competitive analysis
  7. System recalculates metrics without this competitor

### Exception Flows

#### E1: No Competitors Added Yet
- **Trigger**: User accesses competitor analysis with no data
- **Flow**:
  1. System displays empty state
  2. System shows "Add Your First Competitor" CTA
  3. System explains benefits of competitive tracking
  4. User clicks to add competitor
  5. System guides through competitor setup

#### E2: Competitor Item Has No Match
- **Trigger**: Competitor offers item we don't have
- **Flow**:
  1. User attempts to map but finds no match
  2. User selects "No Match" option
  3. System tracks as market opportunity
  4. System suggests: "Consider adding similar item?"
  5. User can create note for menu development

#### E3: Outdated Competitor Data (>90 days)
- **Trigger**: Competitor prices last updated >90 days ago
- **Flow**:
  1. System displays warning badge on competitor
  2. System shows: "Data outdated. Last updated [date]"
  3. System prompts: "Update competitor pricing?"
  4. User can update or dismiss warning
  5. System tracks data freshness

### Business Rules Applied
- BR-MENG-009: Competitor analysis and market positioning
- Minimum 3 competitors recommended for meaningful analysis
- Price index calculated: Our Price / Average Competitor Price
- Market position classification:
  - Premium: >15% above average
  - Competitive: ±15% of average
  - Value: >15% below average
- Competitor data should be updated monthly

### Performance Requirements
- Competitor list load: < 1 second
- Item entry save: < 1 second
- Metric calculation: < 2 seconds
- Price comparison query: < 500ms

### Acceptance Criteria
- [ ] Competitor profile creation functional
- [ ] Competitor items can be added in bulk
- [ ] Item mapping works correctly
- [ ] Price index calculated accurately
- [ ] Market position determined correctly
- [ ] Price history tracked for trends
- [ ] Competitive metrics update automatically
- [ ] Outdated data flagged appropriately
- [ ] Empty states guide user to add data
- [ ] Competitor removal archives data properly

---

## UC-MENG-007: Track Item Lifecycle

### Description
Users can track menu items through lifecycle stages (Introduction, Growth, Maturity, Decline, Discontinuation) and make data-driven decisions about item management and replacement.

### Actor(s)
- Primary: Restaurant Manager, Chef
- Secondary: Operations Manager

### Priority
High

### Frequency
Weekly

### Preconditions
1. User has `menu_engineering.view` permission
2. Menu items have sales history
3. Lifecycle stages configured in system

### Postconditions
1. Item lifecycle stage assigned
2. Stage-appropriate KPIs tracked
3. Stage transition recommendations generated
4. Lifecycle reports available

### Main Flow
1. User navigates to Menu Lifecycle Management section
2. System displays lifecycle dashboard:
   - Items by stage: Introduction (X), Growth (Y), Maturity (Z), Decline (W), Discontinued (V)
   - Stage distribution pie chart
   - Items requiring attention (pending transitions)
3. System displays item list grouped by lifecycle stage
4. For each item, system shows:
   - Item name and image
   - Current stage
   - Days in current stage
   - Stage-specific KPIs:
     - Introduction: Sales velocity, initial customer response
     - Growth: Sales growth rate, customer adoption
     - Maturity: Sales stability, consistent performance
     - Decline: Sales decrease rate, comparison to peak
   - Next stage recommendation (if applicable)
5. User clicks on item to view lifecycle details
6. System displays lifecycle timeline:
   - Stage history with transition dates
   - Performance metrics by stage
   - Key events (price changes, promotions)
7. User reviews stage transition recommendation
8. User can approve or defer transition

### Alternative Flows

#### A1: Introduce New Menu Item
- **Trigger**: User adds new item to menu
- **Flow**:
  1. System automatically sets stage to "Introduction"
  2. System sets evaluation period: 60-90 days
  3. System defines success criteria:
     - Target sales volume: ≥70% of expected menu mix
     - Customer rating: ≥4.0/5.0
     - Contribution margin: ≥ category target
  4. System tracks performance during introduction
  5. At end of period, system evaluates:
     - **Pass**: Promote to Growth stage
     - **Partial**: Extend introduction with corrective actions
     - **Fail**: Recommend removal and replacement planning
  6. System notifies user of evaluation results

#### A2: Transition to Growth Stage
- **Trigger**: Introduction period successful
- **Flow**:
  1. System detects success criteria met
  2. System recommends transition to Growth
  3. User reviews performance data
  4. User approves transition
  5. System updates lifecycle stage to "Growth"
  6. System adjusts KPIs to focus on:
     - Sales growth rate (target: >10% monthly)
     - Menu mix increase
     - Customer adoption rate
  7. System continues monitoring

#### A3: Identify Declining Item
- **Trigger**: Sales decrease >20% over 90 days
- **Flow**:
  1. System detects declining trend
  2. System changes stage from Maturity to Decline
  3. System generates alert: "Item entering Decline stage"
  4. System recommends intervention strategies:
     - Limited-time promotion to boost sales
     - Recipe refresh or repositioning
     - Price adjustment
     - Replacement planning
  5. User selects strategy
  6. System tracks intervention effectiveness
  7. If successful: Revert to Maturity
  8. If unsuccessful (60 days): Recommend discontinuation

#### A4: Plan Item Discontinuation
- **Trigger**: User decides to remove declining item
- **Flow**:
  1. User initiates discontinuation process
  2. System displays discontinuation checklist:
     - Identify replacement item (new or existing)
     - Plan inventory liquidation
     - Notify customers (if signature item)
     - Train staff on replacement
     - Update marketing materials
     - Set removal date
  3. User completes checklist items
  4. System schedules discontinuation
  5. On removal date:
     - System updates status to "Discontinued"
     - System removes from active menu
     - System archives item data
     - System updates POS system
  6. System tracks sales of replacement item

### Exception Flows

#### E1: Item Stuck in Introduction
- **Trigger**: Item in introduction >90 days without progress
- **Flow**:
  1. System generates alert: "Extended introduction period"
  2. System analyzes reasons for slow adoption:
     - Low awareness (needs promotion)
     - Poor placement (menu positioning)
     - Customer feedback (quality issues)
     - Competition (better alternatives)
  3. System recommends corrective actions
  4. User implements changes or decides to remove
  5. System extends evaluation another 30 days
  6. If still unsuccessful: Recommend removal

#### E2: Unexpected Spike or Drop
- **Trigger**: Sales change >50% in single week
- **Flow**:
  1. System detects anomaly
  2. System investigates potential causes:
     - Promotion or event
     - Competitor action
     - Supply issue
     - Quality problem
     - External factor (weather, holiday)
  3. System flags for manual review
  4. User investigates and documents cause
  5. System adjusts trend analysis to account for anomaly
  6. System resumes normal monitoring

#### E3: Multiple Items Declining Simultaneously
- **Trigger**: >30% of menu items in Decline stage
- **Flow**:
  1. System generates critical alert: "Menu-wide performance issue"
  2. System suggests systemic factors:
     - New competitor impact
     - Market shift
     - Brand perception issue
     - Quality concerns
  3. System recommends comprehensive menu review
  4. User initiates strategic menu planning
  5. User may engage management or consultants

### Business Rules Applied
- BR-MENG-010: New item introduction requirements
- BR-MENG-009: Seasonal item management
- Stage transition rules:
  - Introduction → Growth: Success criteria met after 60-90 days
  - Growth → Maturity: Sales plateau (variance <10% for 60 days)
  - Maturity → Decline: Sales decrease >20% over 90 days
  - Decline → Discontinued: Sales <50% of peak for 60 days
- Items <30 days old not eligible for forced transitions

### Performance Requirements
- Lifecycle dashboard load: < 2 seconds
- Stage transition calculation: < 1 second
- Timeline visualization render: < 1 second

### Acceptance Criteria
- [ ] Lifecycle stages assigned correctly
- [ ] Stage distribution displayed accurately
- [ ] Items grouped by stage properly
- [ ] Days in stage calculated correctly
- [ ] Stage-specific KPIs shown correctly
- [ ] Transition recommendations logical
- [ ] Timeline visualization shows full history
- [ ] Success criteria evaluated correctly
- [ ] Alerts generated for attention items
- [ ] Discontinuation workflow functional
- [ ] Replacement tracking works

---

## UC-MENG-008: Generate Performance Reports

### Description
Users can generate comprehensive menu engineering reports for analysis, executive review, and strategic planning purposes.

### Actor(s)
- Primary: Restaurant Manager, Executive
- Secondary: Finance Manager, Operations Manager

### Priority
High

### Frequency
Weekly to monthly

### Preconditions
1. User has `menu_engineering.view` permission
2. Performance data available for reporting period
3. Report templates configured

### Postconditions
1. Report generated successfully
2. Report available for download or viewing
3. Report archived for future reference
4. Insights communicated to stakeholders

### Main Flow
1. User navigates to Reports section
2. System displays available report types:
   - Menu Engineering Matrix Report
   - Contribution Margin Report
   - Menu Mix Report
   - Price Analysis Report
   - Competitor Analysis Report
   - Performance Scorecard
   - Lifecycle Report
   - Forecast Accuracy Report
   - Menu Optimization Summary
3. User selects report type
4. System displays report configuration options:
   - Date range (last 7/30/90 days, custom)
   - Location filter (all or specific)
   - Category filter (all or specific)
   - Include details (summary only or with details)
   - Format (PDF, Excel, CSV)
5. User configures report parameters
6. User clicks "Generate Report"
7. System validates parameters
8. System queries data for specified period
9. System calculates metrics and aggregations
10. System generates report with:
    - Cover page (if PDF)
    - Executive summary
    - Key metrics and KPIs
    - Visualizations (charts, matrix)
    - Detailed data tables
    - Recommendations summary
    - Appendices (if included)
11. System displays report preview
12. User reviews report
13. User downloads report file or emails to recipients

### Alternative Flows

#### A1: Schedule Recurring Report
- **Trigger**: User clicks "Schedule Report"
- **Flow**:
  1. System displays scheduling options
  2. User sets recurrence: Daily/Weekly/Monthly
  3. User sets delivery day/time
  4. User adds email recipients
  5. User configures report parameters
  6. System saves scheduled report
  7. System generates report automatically on schedule
  8. System emails report to recipients
  9. User can view/edit/delete scheduled reports

#### A2: Customize Report Template
- **Trigger**: User clicks "Customize Template"
- **Flow**:
  1. System displays template editor
  2. User selects sections to include/exclude
  3. User reorders sections
  4. User customizes branding (logo, colors)
  5. User sets default parameters
  6. System saves custom template
  7. Template available for future use

#### A3: Compare Multiple Periods
- **Trigger**: User selects "Period Comparison" report
- **Flow**:
  1. User selects 2-4 periods to compare
  2. System generates side-by-side comparison
  3. System calculates period-over-period changes
  4. System highlights significant variances (>20%)
  5. System includes trend indicators
  6. Report shows: This Period | Last Period | Change | % Change

#### A4: Export Raw Data
- **Trigger**: User selects "Export Data" instead of report
- **Flow**:
  1. User selects data tables to export
  2. User chooses format (CSV, Excel)
  3. System exports raw data without formatting
  4. User can use data for custom analysis in BI tools

### Exception Flows

#### E1: Report Generation Timeout
- **Trigger**: Large dataset causes timeout (>30 seconds)
- **Flow**:
  1. System detects long-running query
  2. System switches to asynchronous processing
  3. System displays: "Report generation in progress. You'll be notified when ready."
  4. System continues processing in background
  5. System sends email when report ready
  6. User downloads from email link or reports archive

#### E2: No Data for Period
- **Trigger**: Selected period has no sales data
- **Flow**:
  1. System detects empty dataset
  2. System displays warning: "No data available for selected period"
  3. System suggests:
     - Check date range
     - Verify location filter
     - Check data sync status
  4. User adjusts parameters or cancels

#### E3: Report Generation Error
- **Trigger**: Database error or data integrity issue
- **Flow**:
  1. System encounters error during generation
  2. System logs error details
  3. System displays error: "Unable to generate report. Please try again."
  4. System provides error reference number
  5. User can retry or contact support
  6. Support investigates using error reference

### Business Rules Applied
- Maximum report date range: 365 days
- Scheduled reports run during off-peak hours (configurable)
- Reports archived for 24 months
- Large reports (>50MB) emailed as download link, not attachment
- Sensitive data (costs, margins) included only if user has `cost.view` permission

### Performance Requirements
- Simple report generation: < 10 seconds
- Complex report with charts: < 20 seconds
- Large dataset (1000+ items, 365 days): < 60 seconds (or async)
- Report preview render: < 2 seconds
- Download initiation: < 1 second

### Acceptance Criteria
- [ ] All report types accessible
- [ ] Report configuration options functional
- [ ] Date range validation works
- [ ] Filters applied correctly
- [ ] Metrics calculated accurately
- [ ] Charts and visualizations render correctly
- [ ] Executive summary provides key insights
- [ ] Detailed tables included when requested
- [ ] Recommendations summarized appropriately
- [ ] PDF formatting professional and readable
- [ ] Excel format preserves formulas and formatting
- [ ] CSV export includes all data
- [ ] Email delivery functional
- [ ] Scheduled reports execute on time
- [ ] Report archive accessible

---

## UC-MENG-009: Configure Analysis Settings

### Description
Users with administrative privileges can configure menu engineering analysis settings including thresholds, targets, alert rules, and calculation parameters.

### Actor(s)
- Primary: Admin, System Administrator
- Secondary: Restaurant Manager (view only)

### Priority
Medium

### Frequency
Quarterly or as needed

### Preconditions
1. User has `menu_engineering.configure` permission
2. System has default settings as fallback

### Postconditions
1. Custom settings saved and applied
2. Analysis calculations use updated parameters
3. Settings audit logged
4. Users notified of changes if significant

### Main Flow
1. User navigates to Menu Engineering Settings
2. System displays settings categories:
   - Classification Thresholds
   - Contribution Margin Targets
   - Alert Rules
   - Lifecycle Stages
   - Forecast Parameters
   - Competitor Analysis
3. User selects category to configure
4. System displays current settings with defaults
5. User modifies settings:
   - **Classification Thresholds**:
     - Popularity threshold multiplier: 0.5 - 1.0 (default: 0.7)
     - Profitability threshold: Average CM or custom %
   - **Contribution Margin Targets**:
     - Food items target: 60-75% (default: 65%)
     - Beverage target: 75-85% (default: 80%)
     - Minimum acceptable: 30-50% (default: 40%)
   - **Alert Rules**:
     - Critical CM threshold: <30%
     - Warning CM threshold: <40%
     - Menu mix variance alert: >30% change
     - Lifecycle transition alerts: On/Off
   - **Lifecycle Stages**:
     - Introduction period: 60-90 days (default: 60)
     - Evaluation criteria (sales, ratings, margin)
     - Decline threshold: 20% decrease over 90 days
   - **Forecast Parameters**:
     - Forecasting method: Moving average, Exponential smoothing
     - Seasonality adjustment: On/Off
     - Promotional exclusions: On/Off
   - **Competitor Analysis**:
     - Minimum competitors required: 1-5 (default: 3)
     - Data freshness warning: 30-90 days (default: 90)
     - Price variance alert: >10% change
6. User saves settings
7. System validates new settings:
   - Thresholds within reasonable ranges
   - No conflicting rules
   - Changes won't break existing calculations
8. System applies new settings
9. System recalculates affected metrics
10. System displays confirmation: "Settings updated successfully"
11. System logs settings change with user ID and timestamp

### Alternative Flows

#### A1: Reset to Defaults
- **Trigger**: User clicks "Reset to Defaults"
- **Flow**:
  1. System displays confirmation dialog
  2. System warns: "This will replace all custom settings with system defaults"
  3. User confirms reset
  4. System restores default values
  5. System recalculates metrics with defaults
  6. System notifies affected users if settings shared

#### A2: Import Settings from Another Location
- **Trigger**: Multi-location setup, user wants consistency
- **Flow**:
  1. User selects "Import Settings"
  2. System displays list of other locations
  3. User selects source location
  4. System shows settings comparison (current vs. source)
  5. User selects settings to import (all or specific)
  6. System applies imported settings
  7. System recalculates with new settings

#### A3: Export Settings
- **Trigger**: User wants to backup or share settings
- **Flow**:
  1. User clicks "Export Settings"
  2. System generates settings file (JSON or Excel)
  3. System includes:
     - All configuration parameters
     - Custom thresholds and targets
     - Alert rules
     - Export timestamp
  4. User downloads file
  5. File can be imported to other instances

### Exception Flows

#### E1: Invalid Setting Value
- **Trigger**: User enters value outside acceptable range
- **Flow**:
  1. System detects invalid value
  2. System highlights field with error
  3. System displays inline error: "Value must be between X and Y"
  4. System prevents saving until corrected
  5. User adjusts value to valid range
  6. Error clears, saving enabled

#### E2: Conflicting Settings
- **Trigger**: New settings create logical conflict
- **Flow**:
  1. System detects conflict (e.g., critical threshold > warning threshold)
  2. System displays warning: "Settings conflict detected: [description]"
  3. System highlights conflicting fields
  4. System suggests resolution
  5. User resolves conflict
  6. System validates and allows save

#### E3: Settings Change Would Reclassify Many Items
- **Trigger**: Threshold change affects >30% of items
- **Flow**:
  1. System calculates impact of proposed changes
  2. System displays impact summary:
     - X items would change classification
     - Y new critical alerts would be generated
     - Z recommendations would be affected
  3. System asks: "Proceed with changes?"
  4. User reviews impact
  5. User proceeds or adjusts settings

### Business Rules Applied
- Settings changes require admin permission
- Settings must be within system-defined min/max ranges
- Critical settings changes logged in audit trail
- Recalculation triggered automatically after settings change
- Default settings always available as fallback

### Performance Requirements
- Settings page load: < 1 second
- Settings save: < 2 seconds
- Recalculation after change: < 30 seconds (runs async if >10 seconds)
- Validation: < 500ms

### Acceptance Criteria
- [ ] All settings categories accessible
- [ ] Current values displayed correctly
- [ ] Default values indicated
- [ ] Value validation prevents invalid entries
- [ ] Conflict detection works
- [ ] Settings save successfully
- [ ] Recalculation triggered automatically
- [ ] Impact preview shows reclassification count
- [ ] Reset to defaults functional
- [ ] Import/export works correctly
- [ ] Audit log records changes
- [ ] Confirmation messages displayed

---

## UC-MENG-010: Run Menu Optimization Experiment

### Description
Users can create and run A/B tests to evaluate menu optimization strategies such as pricing changes, description updates, menu positioning, or promotional offers.

### Actor(s)
- Primary: Restaurant Manager, Marketing Manager
- Secondary: Operations Manager, Executive

### Priority
Medium

### Frequency
Monthly to quarterly

### Preconditions
1. User has `menu_engineering.experiment` permission
2. POS system supports A/B testing (random customer assignment)
3. Statistical analysis tools available
4. Minimum 100 transactions per variant expected during test

### Postconditions
1. Experiment configured and launched
2. Customer traffic split between variants
3. Performance tracked for each variant
4. Statistical analysis determines winner
5. Winning variant rolled out (if conclusive)

### Main Flow
1. User navigates to Menu Optimization Experiments
2. User clicks "Create New Experiment"
3. System displays experiment setup wizard
4. **Step 1**: Experiment Configuration
   - User enters experiment name
   - User selects experiment type:
     - Price testing
     - Description testing
     - Menu positioning testing
     - Bundle testing
     - Promotion testing
   - User selects menu item(s) to test
   - User sets test duration (14-60 days)
5. **Step 2**: Variant Definition
   - User defines Control variant (current state)
   - User adds Test variants (1-3 variants):
     - Test A: Variant details (e.g., price = $15.99)
     - Test B: Variant details (e.g., price = $17.99)
   - User sets traffic allocation (default: 50/50 or 33/33/33)
6. **Step 3**: Success Metrics
   - User selects primary metric:
     - Revenue
     - Units sold
     - Contribution margin
     - Conversion rate
   - User adds secondary metrics (optional)
   - User sets minimum sample size (default: 100 per variant)
   - User sets confidence level (default: 95%)
7. **Step 4**: Experiment Scope
   - User selects locations (all or specific)
   - User sets customer segment (all or targeted)
   - User sets time periods (all day or specific day parts)
8. User reviews experiment summary
9. User clicks "Launch Experiment"
10. System validates experiment configuration
11. System schedules experiment start
12. System configures POS for random assignment
13. Experiment runs for specified duration
14. System tracks performance by variant
15. System calculates statistical significance daily
16. When experiment completes:
    - System analyzes results
    - System determines winning variant (if significant)
    - System generates experiment report
17. User reviews results and decides rollout

### Alternative Flows

#### A1: Monitor Experiment Progress
- **Trigger**: User checks in-progress experiment
- **Flow**:
  1. User navigates to active experiments
  2. System displays experiment dashboard:
     - Days remaining
     - Transactions per variant
     - Current metric values (updated daily)
     - Statistical significance status
  3. System shows early trend indicators
  4. User reviews progress
  5. User can extend, pause, or stop experiment

#### A2: Early Stop (Conclusive Results)
- **Trigger**: Statistical significance reached before end date
- **Flow**:
  1. System detects significance threshold met (95% confidence)
  2. System sends alert: "Experiment reached statistical significance"
  3. System displays results with winner
  4. User reviews results
  5. User can:
     - Stop early and rollout winner
     - Continue to planned end date for confirmation
  6. If stopped early, system halts assignment
  7. Winning variant applied to all traffic

#### A3: Early Stop (Negative Impact)
- **Trigger**: Test variant performing significantly worse (>10% revenue loss)
- **Flow**:
  1. System detects harmful impact
  2. System generates critical alert
  3. System recommends stopping experiment
  4. User reviews data
  5. User stops experiment
  6. System reverts all traffic to control
  7. System marks experiment as "Stopped - Negative Impact"

#### A4: Inconclusive Results
- **Trigger**: Experiment ends without statistical significance
- **Flow**:
  1. System analyzes final results
  2. System determines: No clear winner (p-value >0.05)
  3. System displays: "Experiment inconclusive"
  4. System shows comparison of variants
  5. System suggests:
     - Extend experiment duration
     - Increase traffic allocation
     - Try more aggressive variant
  6. User can rerun or abandon

#### A5: Rollout Winning Variant
- **Trigger**: Experiment conclusive, user approves rollout
- **Flow**:
  1. User clicks "Rollout Winner"
  2. System confirms: "Apply [Variant] to all traffic?"
  3. User confirms rollout
  4. System applies winning variant:
     - Updates menu item (price, description, etc.)
     - Pushes changes to POS
     - Updates all locations (if multi-location)
  5. System monitors post-rollout performance
  6. System marks experiment "Completed - Rolled Out"

### Exception Flows

#### E1: Insufficient Traffic
- **Trigger**: Low transaction volume during experiment
- **Flow**:
  1. System detects slow progress (<10 transactions/day)
  2. System estimates: "At current rate, will take X days to reach min sample size"
  3. System suggests:
     - Extend experiment duration
     - Increase traffic allocation to test variants
     - Apply to more locations
  4. User adjusts experiment or cancels

#### E2: Technical Implementation Error
- **Trigger**: POS fails to randomize or track correctly
- **Flow**:
  1. System detects tracking discrepancies
  2. System pauses experiment automatically
  3. System alerts: "Experiment paused - technical issue"
  4. System logs issue for IT investigation
  5. IT resolves issue
  6. User can resume or restart experiment

#### E3: Conflicting Experiment
- **Trigger**: User tries to launch experiment on item already in another test
- **Flow**:
  1. System detects conflict
  2. System displays error: "[Item] is already in active experiment [Name]"
  3. System shows existing experiment details
  4. User must:
     - Wait for existing experiment to complete
     - Stop existing experiment
     - Select different item
  5. System prevents creating conflicting experiments

### Business Rules Applied
- BR-MENG-014: Menu optimization experiment requirements
- Minimum experiment duration: 14 days
- Maximum experiment duration: 60 days
- Minimum sample size: 100 transactions per variant
- Statistical significance threshold: 95% confidence (p-value <0.05)
- Maximum concurrent experiments per location: 2
- Experiments auto-stop if negative impact >10% detected

### Performance Requirements
- Experiment setup: < 2 seconds per step
- POS configuration: < 5 seconds
- Daily metric calculation: < 30 seconds (async)
- Results dashboard load: < 2 seconds
- Rollout execution: < 10 seconds

### Acceptance Criteria
- [ ] Experiment wizard guides user through setup
- [ ] All experiment types supported
- [ ] Variants defined correctly
- [ ] Traffic allocation configured properly
- [ ] POS integration randomizes assignments
- [ ] Metrics tracked accurately by variant
- [ ] Statistical analysis calculates correctly
- [ ] Significance threshold enforced (95%)
- [ ] Early stop detection functional (positive and negative)
- [ ] Inconclusive results handled appropriately
- [ ] Rollout applies winning variant
- [ ] Experiment report generated with full details
- [ ] Conflicting experiments prevented

---

## UC-MENG-011: Forecast Item Sales

### Description
Users can generate sales forecasts for menu items to support demand planning, inventory management, and operational scheduling.

### Actor(s)
- Primary: Restaurant Manager, Operations Manager
- Secondary: Inventory Manager, Chef

### Priority
High

### Frequency
Weekly

### Preconditions
1. User has `menu_engineering.view` permission
2. Minimum 90 days of historical sales data available
3. Forecasting algorithms configured

### Postconditions
1. Sales forecasts generated for selected items/period
2. Forecast accuracy metrics calculated
3. Forecasts available for planning
4. Integration with inventory system (optional)

### Main Flow
1. User navigates to Sales Forecasting section
2. System displays forecasting dashboard:
   - Forecast accuracy (last 30 days): MAPE = X%
   - Trending items (up/down forecasts)
   - Seasonal patterns detected
3. User selects forecasting scope:
   - All items or specific items
   - All categories or specific category
4. User selects forecast period:
   - Short-term: Next 7 days (daily granularity)
   - Medium-term: Next 30 days (daily or weekly)
   - Long-term: Next 90 days (weekly or monthly)
5. User selects forecasting method (advanced users):
   - Simple moving average
   - Weighted moving average
   - Exponential smoothing
   - Auto-select (system recommends)
6. User sets forecast parameters:
   - Include seasonality adjustments: Yes/No
   - Include trend adjustments: Yes/No
   - Exclude promotional periods: Yes/No
7. User clicks "Generate Forecast"
8. System runs forecasting algorithm:
   - Retrieves historical sales data
   - Applies selected forecasting method
   - Adjusts for seasonality (if enabled)
   - Adjusts for trends (if enabled)
   - Calculates confidence intervals (80%, 95%)
9. System displays forecast results:
   - Forecast table: Date | Item | Forecasted Units | Lower Bound | Upper Bound
   - Forecast chart: Historical data + Forecast line with confidence bands
   - Accuracy metrics: MAPE, MAE, Forecast Bias
10. User reviews forecast
11. User can export forecast for planning

### Alternative Flows

#### A1: Adjust Forecast Manually
- **Trigger**: User has additional information (event, promotion)
- **Flow**:
  1. User views generated forecast
  2. User clicks "Adjust Forecast"
  3. User selects dates to override
  4. User enters adjusted forecast values
  5. User enters reason for adjustment
  6. System saves manual adjustments
  7. System displays adjusted forecast
  8. System tracks manual vs. system forecast for learning

#### A2: View Forecast Accuracy History
- **Trigger**: User clicks "Accuracy Report"
- **Flow**:
  1. System displays forecast vs. actual comparison
  2. System shows:
     - Historical forecasts
     - Actual sales
     - Forecast error (absolute and %)
     - Accuracy trend over time
  3. System calculates accuracy metrics:
     - MAPE (Mean Absolute Percentage Error)
     - MAE (Mean Absolute Error)
     - Forecast bias (tendency to over/under forecast)
  4. System identifies items with poor forecast accuracy
  5. User investigates issues or adjusts methods

#### A3: Create Forecast Scenario
- **Trigger**: User wants to model different scenarios
- **Flow**:
  1. User clicks "Create Scenario"
  2. User defines scenario:
     - Name: "Summer Promotion Scenario"
     - Assumptions: +20% sales on selected items for 2 weeks
     - Impact on other items: -5% (cannibalization)
  3. System generates scenario-based forecast
  4. User compares scenarios:
     - Baseline forecast
     - Scenario forecast
     - Difference
  5. User selects preferred scenario for planning

#### A4: Integrate with Inventory Planning
- **Trigger**: User clicks "Push to Inventory Planning"
- **Flow**:
  1. System converts sales forecast to ingredient requirements
  2. System multiplies forecast by recipe quantities
  3. System aggregates ingredient needs by forecast period
  4. System pushes forecast to inventory system
  5. Inventory system uses forecast for:
     - Purchase order planning
     - Stock level targets
     - Supplier scheduling
  6. System confirms integration successful

### Exception Flows

#### E1: Insufficient Historical Data
- **Trigger**: Item has <30 days of sales history
- **Flow**:
  1. System detects insufficient data
  2. System displays warning: "Limited data available. Forecast may be unreliable."
  3. System uses alternative methods:
     - Category average
     - Similar item forecasts
     - User input (manual forecast)
  4. System clearly marks forecast as low-confidence
  5. User proceeds with caution

#### E2: Volatile Sales Pattern (High Variability)
- **Trigger**: Item has erratic sales with high standard deviation
- **Flow**:
  1. System detects high volatility (CV >50%)
  2. System displays warning: "Sales pattern highly variable. Forecast uncertainty is high."
  3. System widens confidence intervals
  4. System recommends:
     - Investigate cause of volatility
     - Use shorter forecast horizon
     - Consider manual adjustments
  5. User reviews and adjusts as needed

#### E3: Forecast Error Exceeds Threshold
- **Trigger**: Actual sales differ from forecast by >30%
- **Flow**:
  1. System detects large forecast error
  2. System generates alert: "Forecast accuracy degraded for [Item]"
  3. System analyzes potential causes:
     - Unplanned promotion
     - Competitor action
     - Supply outage
     - External event
  4. System suggests model recalibration
  5. User reviews and updates forecasting parameters

### Business Rules Applied
- BR-MENG-011: Sales forecasting requirements
- Minimum 30 days historical data required (90 days recommended)
- Forecast accuracy target: MAPE <20%
- Confidence intervals: 80% and 95% calculated
- Seasonal adjustments applied automatically if seasonality detected
- Promotional periods excluded from baseline forecast
- Forecasts recalculated weekly or when data changes significantly

### Performance Requirements
- Forecast generation: < 10 seconds for 100 items, 30-day horizon
- Forecast dashboard load: < 2 seconds
- Accuracy calculation: < 5 seconds
- Scenario modeling: < 5 seconds

### Acceptance Criteria
- [ ] Forecasting dashboard displays key metrics
- [ ] Forecast scope selection functional
- [ ] Forecast period selection works
- [ ] Forecasting methods selectable
- [ ] Seasonality adjustment applied correctly
- [ ] Trend adjustment applied correctly
- [ ] Forecast generated within performance target
- [ ] Forecast table displays correctly
- [ ] Forecast chart visualizes historical + forecast
- [ ] Confidence intervals shown
- [ ] Accuracy metrics calculated correctly
- [ ] Manual adjustments saved and applied
- [ ] Scenario modeling functional
- [ ] Integration with inventory works
- [ ] Alerts for poor accuracy generated

---

## UC-MENG-012: Bulk Update Menu Items

### Description
Users can perform bulk updates on multiple menu items simultaneously for efficiency, such as applying price changes, category reassignments, or status updates.

### Actor(s)
- Primary: Restaurant Manager, Admin
- Secondary: Pricing Analyst

### Priority
Medium

### Frequency
Monthly or as needed

### Preconditions
1. User has `menu_engineering.approve` permission (for price changes)
2. Multiple menu items exist in system
3. Bulk operation rules configured

### Postconditions
1. Selected items updated with new values
2. Changes logged in audit trail
3. POS system synchronized (if applicable)
4. Affected items' metrics recalculated

### Main Flow
1. User navigates to Menu Engineering dashboard or item list
2. User selects multiple items via checkboxes (minimum 2)
3. System displays bulk actions toolbar:
   - Bulk actions count badge: "X items selected"
   - Available actions: Update Prices, Change Category, Update Status, Export, Delete
4. User clicks desired bulk action
5. **For Bulk Price Update**:
   - System displays bulk price update modal
   - User selects update method:
     - Percentage increase/decrease: +/- X%
     - Fixed amount increase/decrease: +/- $X
     - Set target contribution margin: Y%
   - User enters value
   - System calculates new prices for all selected items
   - System displays preview table:
     - Item | Current Price | New Price | New CM%
   - User reviews preview
   - System validates (no price <cost, CM ≥30%)
   - User enters justification
   - User confirms bulk update
   - System applies price changes
   - System logs changes
   - System pushes to POS
   - System displays success message
6. **For Bulk Category Change**:
   - System displays category selection dropdown
   - User selects new category
   - System confirms: "Move X items to [Category]?"
   - User confirms
   - System updates all items
   - System recalculates category metrics
7. **For Bulk Status Update**:
   - System displays status options: Active, Seasonal, Discontinued
   - User selects new status
   - System confirms impact
   - User confirms
   - System updates all items
8. System displays bulk update summary:
   - Successful updates: X
   - Failed updates: Y (with reasons)
   - Items updated: [list]

### Alternative Flows

#### A1: Selective Preview Before Applying
- **Trigger**: User wants to review item-by-item before applying
- **Flow**:
  1. System displays preview table with new values
  2. User reviews each item
  3. User can deselect specific items from bulk operation
  4. User clicks "Apply to Selected"
  5. System updates only checked items
  6. System provides partial success summary

#### A2: Apply Different Values to Different Items
- **Trigger**: User wants varied updates (e.g., different price increases)
- **Flow**:
  1. User selects items for bulk operation
  2. User clicks "Custom Values"
  3. System displays editable table
  4. User enters individual values per item
  5. System validates each row
  6. User applies changes
  7. System updates with custom values

#### A3: Bulk Export Selected Items
- **Trigger**: User wants to export selected items for analysis
- **Flow**:
  1. User selects items
  2. User clicks "Export Selected"
  3. System prompts for format (CSV, Excel, PDF)
  4. System generates export file with selected items
  5. System downloads file
  6. User analyzes data externally

### Exception Flows

#### E1: Some Items Fail Validation
- **Trigger**: Bulk update would violate business rules for some items
- **Flow**:
  1. System validates each item individually
  2. System identifies items that fail validation:
     - Price change would result in CM <30%
     - Category change invalid (category inactive)
     - Status change blocked (item has dependencies)
  3. System displays error summary:
     - Successful: X items
     - Failed: Y items
  4. System lists failed items with reasons
  5. User can:
     - Apply to successful items only
     - Revise bulk operation parameters
     - Cancel bulk operation
  6. System applies to successful items if user proceeds

#### E2: Insufficient Permissions
- **Trigger**: Bulk price change exceeds user's approval authority
- **Flow**:
  1. User attempts bulk price increase >10%
  2. System detects permission issue
  3. System displays: "Bulk price increase requires Director approval"
  4. System sends approval request with:
     - Items affected
     - Proposed changes
     - Justification
  5. Approver reviews and approves/rejects
  6. System notifies user of decision
  7. If approved, system applies changes

#### E3: POS Integration Failure During Bulk Update
- **Trigger**: POS system unavailable during bulk operation
- **Flow**:
  1. System applies updates to local database successfully
  2. System attempts POS synchronization
  3. POS sync fails for all items
  4. System displays warning: "Items updated locally. POS sync failed."
  5. System queues updates for retry
  6. System retries every 5 minutes
  7. System alerts IT if fails after 1 hour
  8. System notifies user when sync completes

### Business Rules Applied
- BR-MENG-004: Price change approval workflow
- BR-MENG-002: Contribution margin minimum thresholds
- Minimum 2 items required for bulk operations
- Maximum 100 items per bulk operation (performance limit)
- Bulk price increases >15% require executive approval
- All bulk operations logged in audit trail
- Bulk operations atomic: All succeed or all fail (optional: partial success mode)

### Performance Requirements
- Selection of items: < 500ms per 100 items
- Bulk action toolbar display: < 300ms
- Preview calculation: < 2 seconds for 100 items
- Bulk update execution: < 10 seconds for 100 items
- POS synchronization: < 30 seconds for 100 items

### Acceptance Criteria
- [ ] Item selection via checkboxes functional
- [ ] Bulk actions toolbar displays when items selected
- [ ] Selection count badge accurate
- [ ] Bulk price update modal displays correctly
- [ ] Preview table shows all selected items
- [ ] New prices calculated correctly
- [ ] Validation prevents invalid updates
- [ ] Justification required for significant changes
- [ ] Approval workflow enforced
- [ ] Bulk updates applied successfully
- [ ] Audit log captures all changes
- [ ] POS synchronization works
- [ ] Success summary displayed
- [ ] Failed items listed with reasons
- [ ] Partial success handled gracefully

---

## UC-MENG-013: Export Performance Data

### Description
Users can export menu performance data in various formats for external analysis, reporting, or integration with other systems.

### Actor(s)
- Primary: Restaurant Manager, Analyst
- Secondary: Finance Manager, Executive

### Priority
Medium

### Frequency
Weekly to monthly

### Preconditions
1. User has `menu_engineering.view` permission
2. Performance data available for export
3. Export formats configured

### Postconditions
1. Data exported successfully
2. File downloaded or sent via email
3. Export logged in audit trail
4. Data suitable for external analysis

### Main Flow
1. User navigates to Menu Engineering dashboard or reports
2. User clicks "Export Data" button
3. System displays export configuration modal:
   - **Data Selection**:
     - All items or selected items
     - All categories or specific categories
     - Date range for metrics
   - **Metrics to Include**:
     - Sales metrics (units, revenue, velocity)
     - Profitability metrics (CM, CM%, food cost)
     - Menu mix metrics (actual %, expected %, variance)
     - Classification (Star/Plowhorse/Puzzle/Dog)
     - Lifecycle stage
     - Trends (up/down/stable)
   - **Format**:
     - CSV (comma-separated values)
     - Excel (.xlsx) with formatting
     - PDF report (formatted)
     - JSON (for API integration)
4. User configures export options
5. User clicks "Export"
6. System validates selections
7. System retrieves data based on filters
8. System formats data according to selected format:
   - **CSV**: Plain text, comma-delimited, no formatting
   - **Excel**: Formatted cells, formulas preserved, charts included
   - **PDF**: Professional report layout with visualizations
   - **JSON**: Structured data for programmatic access
9. System generates export file
10. System initiates download or sends via email
11. System displays success message
12. User opens file in external application

### Alternative Flows

#### A1: Schedule Recurring Export
- **Trigger**: User wants automated exports
- **Flow**:
  1. User clicks "Schedule Export"
  2. System displays scheduling options:
     - Frequency: Daily/Weekly/Monthly
     - Day and time
     - Email recipients
     - Data and format configuration
  3. User configures scheduled export
  4. System saves schedule
  5. System generates export automatically per schedule
  6. System emails file to recipients
  7. User can view/edit/delete scheduled exports

#### A2: Export with Custom Fields
- **Trigger**: User needs specific data columns
- **Flow**:
  1. User clicks "Custom Export"
  2. System displays available fields (50+ options)
  3. User selects desired fields
  4. User reorders columns (drag-and-drop)
  5. User saves custom export template
  6. System generates export with selected fields only
  7. Template available for reuse

#### A3: Export Raw Transaction Data
- **Trigger**: User needs granular data for detailed analysis
- **Flow**:
  1. User selects "Export Transactions"
  2. System warns: "Large dataset may take several minutes"
  3. User confirms
  4. System queries transaction database
  5. System exports itemized sales transactions:
     - Transaction ID, Date, Time, Item, Quantity, Price
  6. System generates large CSV file
  7. System emails download link (file >10MB)

### Exception Flows

#### E1: Export Too Large
- **Trigger**: Selected data exceeds export limits (>100K rows)
- **Flow**:
  1. System detects large dataset
  2. System displays warning: "Export size exceeds limit. Please narrow filters."
  3. System suggests:
     - Reduce date range
     - Filter by category
     - Export in batches
  4. User adjusts filters
  5. System validates new selection
  6. Export proceeds if within limits

#### E2: Export Generation Error
- **Trigger**: Database error during export
- **Flow**:
  1. System encounters error retrieving data
  2. System logs error details
  3. System displays error: "Unable to generate export. Please try again."
  4. System provides error reference number
  5. User can retry or contact support
  6. Support investigates using error reference

#### E3: Excel Formatting Issues
- **Trigger**: Excel file opens with formatting errors
- **Flow**:
  1. User reports issue via support
  2. Support investigates Excel version compatibility
  3. Support provides:
     - CSV alternative (no formatting)
     - Excel compatibility mode file
     - Workaround instructions
  4. User uses alternative format

### Business Rules Applied
- Maximum export size: 100,000 rows
- Exports include only data user has permission to view
- Cost data included only if user has `cost.view` permission
- Exports logged in audit trail for security
- Large exports (>50MB) sent as download links, not attachments
- Export files expire after 7 days (if stored on server)

### Performance Requirements
- Export configuration load: < 1 second
- Small export (<1000 rows): < 5 seconds
- Medium export (1000-10K rows): < 15 seconds
- Large export (10K-100K rows): < 60 seconds (may use async)
- Download initiation: < 1 second

### Acceptance Criteria
- [ ] Export button accessible from dashboard/reports
- [ ] Export configuration modal displays correctly
- [ ] Data selection filters functional
- [ ] Metrics checkboxes work
- [ ] Format selection available
- [ ] CSV export generates correctly
- [ ] Excel export includes formatting
- [ ] PDF export renders professionally
- [ ] JSON export structured correctly
- [ ] File download initiates successfully
- [ ] Email delivery functional (if selected)
- [ ] Scheduled exports execute on time
- [ ] Custom field selection works
- [ ] Large export handling appropriate
- [ ] Error messages clear and helpful

---

## UC-MENG-014: View Contribution Margin Analysis

### Description
Users can analyze contribution margins at item, category, and menu levels to identify profitability opportunities and inform pricing decisions.

### Actor(s)
- Primary: Restaurant Manager, Finance Manager
- Secondary: Executive, Chef

### Priority
High

### Frequency
Weekly

### Preconditions
1. User has `menu_engineering.view` and `cost.view` permissions
2. Menu items linked to recipes with accurate costs
3. Sales data available for analysis period

### Postconditions
1. User understands profitability by item and category
2. High and low contributors identified
3. Margin improvement opportunities highlighted
4. Actionable insights provided

### Main Flow
1. User navigates to Contribution Margin Analysis section
2. System displays Contribution Margin Dashboard:
   - **Overall Metrics**:
     - Weighted average contribution margin: X%
     - Total contribution: $Y
     - Target contribution margin: Z%
   - **Distribution Chart**:
     - Histogram showing number of items by CM% range
     - Color-coded: Green (>60%), Yellow (40-60%), Red (<40%)
   - **Top Contributors**:
     - Top 10 items by total contribution ($)
     - Percentage of total contribution
   - **Bottom Contributors**:
     - Bottom 10 items by CM%
     - Items below minimum threshold (30%)
3. System displays Category Breakdown:
   - Table: Category | Avg CM% | Total Contribution | Item Count
   - Comparison to category targets
   - Visual indicators (above/below target)
4. System displays Item-Level Analysis:
   - Sortable table with all items:
     - Item Name | Selling Price | Food Cost | CM | CM% | Total Contribution | Classification
   - Search and filter capabilities
   - Drill-down to item details
5. User reviews dashboard and identifies opportunities
6. User can apply filters to focus analysis:
   - By category
   - By classification
   - By CM% range
   - By date range

### Alternative Flows

#### A1: Compare to Target Margins
- **Trigger**: User clicks "Target Comparison"
- **Flow**:
  1. System displays items with target CM% vs. actual CM%
  2. System calculates variance: Actual - Target
  3. System highlights items with negative variance (underperforming)
  4. System calculates potential revenue if all items met targets
  5. System shows: "If all items met targets: +$X additional contribution"
  6. User identifies priority items for margin improvement

#### A2: Analyze Margin Trends
- **Trigger**: User clicks "Trend Analysis"
- **Flow**:
  1. System displays CM% trends over time (last 12 months)
  2. System shows:
     - Overall weighted average CM% trend
     - Individual item CM% trends (top movers)
     - Category-level trends
  3. System identifies:
     - Items with declining margins (red flag)
     - Items with improving margins (success)
  4. System correlates with events (price changes, cost increases)
  5. User investigates causes of trends

#### A3: Simulate Price Changes
- **Trigger**: User clicks "Price Impact Simulator"
- **Flow**:
  1. User selects items to simulate
  2. User enters hypothetical price changes
  3. System calculates:
     - New CM% per item
     - Estimated volume impact (price elasticity)
     - New total contribution
  4. System displays before/after comparison
  5. User evaluates scenarios
  6. User can apply price changes directly (with approval)

#### A4: Export Margin Analysis
- **Trigger**: User clicks "Export Analysis"
- **Flow**:
  1. System prompts for format (Excel/CSV/PDF)
  2. System generates comprehensive margin report:
     - Executive summary
     - Category breakdowns
     - Item-level details
     - Trends and insights
  3. User downloads report
  4. User shares with stakeholders

### Exception Flows

#### E1: Outdated Cost Data
- **Trigger**: Recipe costs not updated in >30 days
- **Flow**:
  1. System detects stale cost data
  2. System displays warning banner: "Some costs may be outdated"
  3. System lists items with old costs
  4. System shows last cost update date
  5. User can:
     - Navigate to recipe management to update costs
     - Proceed with analysis (with disclaimer)
     - Contact procurement to verify costs

#### E2: Negative Contribution Margin
- **Trigger**: Item CM% is negative (selling below cost)
- **Flow**:
  1. System detects negative margin
  2. System generates critical alert
  3. System highlights item in red
  4. System displays: "CRITICAL: Item selling below cost"
  5. System recommends immediate actions:
     - Increase price
     - Reduce cost (recipe reformulation)
     - Remove item
  6. User takes corrective action urgently

#### E3: No Sales Data for Period
- **Trigger**: No sales in selected date range
- **Flow**:
  1. System displays message: "No sales data for selected period"
  2. System suggests adjusting date range
  3. System shows last period with data
  4. User changes date range
  5. Analysis refreshes with data

### Business Rules Applied
- BR-MENG-002: Contribution margin thresholds
- BR-MENG-012: Contribution margin recalculation triggers
- Weighted average CM = Sum(CM × Menu Mix%) / 100
- Total contribution = Sum(CM × Units Sold)
- Target CM varies by category (Food: 60-75%, Beverage: 75-85%)
- Alert generated if weighted average CM < 60%

### Performance Requirements
- Dashboard load: < 3 seconds
- Filter application: < 1 second
- Trend calculation: < 2 seconds
- Simulation calculation: < 1 second

### Acceptance Criteria
- [ ] Dashboard displays all key metrics
- [ ] Distribution chart renders correctly
- [ ] Top/bottom contributors identified accurately
- [ ] Category breakdown calculated correctly
- [ ] Item-level table sortable and filterable
- [ ] Target comparison highlights variances
- [ ] Trend analysis shows historical data
- [ ] Price simulator calculates new margins correctly
- [ ] Export generates comprehensive report
- [ ] Alerts for negative margins displayed
- [ ] Outdated cost warnings shown
- [ ] Drill-down to item details functional

---

## UC-MENG-015: Monitor Menu Mix Trends

### Description
Users can monitor menu mix trends over time to understand shifts in customer preferences, identify seasonal patterns, and detect emerging trends for strategic menu planning.

### Actor(s)
- Primary: Restaurant Manager, Operations Manager
- Secondary: Chef, Marketing Manager

### Priority
High

### Frequency
Weekly

### Preconditions
1. User has `menu_engineering.view` permission
2. At least 90 days of sales history available
3. Menu items tracked with consistent identifiers

### Postconditions
1. User understands current menu mix distribution
2. Trends identified (growing, stable, declining)
3. Seasonal patterns recognized
4. Strategic insights provided

### Main Flow
1. User navigates to Menu Mix Analysis section
2. System displays Menu Mix Dashboard:
   - **Current Period Summary** (default: last 30 days):
     - Total units sold: X
     - Number of active items: Y
     - Expected menu mix per item: Z% (100% / Y)
   - **Menu Mix Distribution**:
     - Pie chart showing top 10 items by sales volume
     - "Other" category for remaining items
   - **Popularity Rankings**:
     - Ranked list: Top 20 items by units sold
     - Showing: Item | Units | Menu Mix % | Popularity Index
   - **Menu Mix Variance**:
     - Items significantly above expected mix (>150%)
     - Items significantly below expected mix (<50%)
3. System displays Menu Mix Trend Chart:
   - Line graph showing menu mix % over time for selected items
   - X-axis: Time (weeks or months)
   - Y-axis: Menu Mix %
   - Multiple lines for comparison (up to 10 items)
   - Reference line: Expected menu mix %
4. User reviews dashboard and identifies trends
5. User can select specific items to track
6. User can change date range or comparison periods

### Alternative Flows

#### A1: View Category-Level Mix
- **Trigger**: User clicks "Category View"
- **Flow**:
  1. System aggregates menu mix by category
  2. System displays category distribution:
     - Appetizers: X%
     - Mains: Y%
     - Desserts: Z%
     - Beverages: W%
  3. System compares to ideal category distribution
  4. System highlights imbalances
  5. User evaluates category performance

#### A2: Compare Time Periods
- **Trigger**: User clicks "Period Comparison"
- **Flow**:
  1. User selects two periods to compare (e.g., this month vs. last month)
  2. System displays side-by-side comparison:
     - Period 1 menu mix % | Period 2 menu mix % | Change
  3. System highlights items with significant changes (>20%)
  4. System indicates winners (increasing mix) and losers (decreasing mix)
  5. User investigates causes of changes

#### A3: Detect Seasonal Patterns
- **Trigger**: User clicks "Seasonality Analysis"
- **Flow**:
  1. System analyzes 12+ months of historical data
  2. System identifies seasonal patterns:
     - Items that peak in specific months
     - Items that decline in specific months
     - Recurring patterns year-over-year
  3. System displays seasonality chart:
     - Heatmap showing menu mix % by month
     - Color intensity indicates popularity
  4. System forecasts seasonal demand for current year
  5. User plans menu and inventory accordingly

#### A4: Identify Emerging Trends
- **Trigger**: User clicks "Trend Detection"
- **Flow**:
  1. System applies trend detection algorithms
  2. System identifies:
     - **Rising Stars**: Items with consistent growth (>10% monthly for 3+ months)
     - **Declining Items**: Items with consistent decline (>10% monthly for 3+ months)
     - **Stable Items**: Items with <10% variance
  3. System displays trend report:
     - Item | Trend Direction | Growth Rate | Forecast
  4. System recommends actions:
     - Rising: Promote further, ensure supply
     - Declining: Investigate cause, plan intervention
     - Stable: Maintain current strategy
  5. User prioritizes actions based on trends

### Exception Flows

#### E1: Menu Changes Disrupt Tracking
- **Trigger**: Item added/removed during analysis period
- **Flow**:
  1. System detects menu composition changes
  2. System adjusts expected menu mix calculation:
     - Recalculates based on items active each day
     - Normalizes for consistent comparison
  3. System displays note: "Menu composition changed during period"
  4. System provides details of changes (items added/removed, dates)
  5. User interprets trends with context

#### E2: Promotional Period Skews Mix
- **Trigger**: Promotional item dominates sales during period
- **Flow**:
  1. System detects unusual menu mix spike (>200% of expected)
  2. System checks for promotional activity
  3. System displays alert: "Menu mix affected by promotion"
  4. System offers to exclude promotional period from trend analysis
  5. User can:
     - View trends with promotion included
     - View trends with promotion excluded (normalized)
     - Compare both views
  6. System notes promotional impact for historical record

#### E3: Insufficient History for Seasonality
- **Trigger**: Less than 12 months of data available
- **Flow**:
  1. User attempts seasonality analysis
  2. System displays warning: "Minimum 12 months required for seasonality analysis"
  3. System shows available months
  4. System suggests:
     - Wait for more data
     - Use industry benchmarks as reference
     - Review available partial patterns
  5. User proceeds with available data or waits

### Business Rules Applied
- BR-MENG-011: Menu mix monitoring and alerts
- Expected Menu Mix % = 100% / Number of Active Items
- Popularity Index = Actual Menu Mix % / Expected Menu Mix %
- High Popularity: Index >1.5 (>150% of expected)
- Low Popularity: Index <0.5 (<50% of expected)
- Significant change threshold: ±20% from previous period
- Seasonality requires minimum 12 months data

### Performance Requirements
- Dashboard load: < 2 seconds
- Trend chart render: < 1 second
- Period comparison: < 1 second
- Seasonality analysis: < 5 seconds

### Acceptance Criteria
- [ ] Menu mix dashboard displays correctly
- [ ] Distribution pie chart shows top items
- [ ] Popularity rankings calculated accurately
- [ ] Trend chart visualizes changes over time
- [ ] Expected menu mix line displayed
- [ ] Category-level aggregation works
- [ ] Period comparison highlights changes
- [ ] Seasonality analysis detects patterns
- [ ] Trend detection identifies rising/declining items
- [ ] Alerts for significant variances generated
- [ ] Menu changes accounted for in calculations
- [ ] Promotional periods flagged appropriately
- [ ] Insufficient data warnings shown

---
