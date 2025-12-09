# Menu Engineering - Data Definition (DS)

## Document Information
- **Document Type**: Data Schema Document
- **Module**: Operational Planning > Menu Engineering
- **Version**: 1.1.0
- **Last Updated**: 2025-01-05

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2025-01-05 | System | Added implementation status section |
| 1.0 | 2024-01-15 | System | Initial data schema document created |

## ⚠️ Implementation Status

**Current State**: DATA SCHEMA PROPOSED (~30% Implemented via TypeScript Types)

This data definition document describes the complete database schema for the Menu Engineering module. **See [BR-menu-engineering.md](./BR-menu-engineering.md) Implementation Status section** for detailed breakdown of what EXISTS vs what's PROPOSED.

**What EXISTS**:
- ✅ TypeScript type definitions (`lib/types/menu-engineering.ts`) matching all proposed schemas
- ✅ In-memory data structures for UI components
- ✅ API response models with full type safety

**What's PROPOSED** (NOT YET in PostgreSQL):
- ❌ All 11 database tables defined in this document
- ❌ Indexes, constraints, and relationships
- ❌ Triggers and stored procedures
- ❌ Data migration scripts
- ❌ Seed data

**NOTE**: The Menu Engineering module currently operates with TypeScript types and API-level data structures. Full PostgreSQL schema implementation is planned for Phase 2.

---

## 1. Database Schema (PostgreSQL)

### 1.1 menu_item_performance

Stores calculated performance metrics for menu items over specific time periods.
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |

```sql
CREATE TABLE menu_item_performance (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  menu_item_id VARCHAR(30) NOT NULL,
  menu_item_name VARCHAR(200) NOT NULL,
  recipe_id VARCHAR(30),
  category_id VARCHAR(30) NOT NULL,
  category_name VARCHAR(100) NOT NULL,

  -- Status and Classification
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'seasonal', 'discontinued')),
  classification VARCHAR(20) NOT NULL CHECK (classification IN ('Star', 'Plowhorse', 'Puzzle', 'Dog')),
  lifecycle_stage VARCHAR(20) NOT NULL CHECK (lifecycle_stage IN ('introduction', 'growth', 'maturity', 'decline', 'discontinued')),

  -- Period Information
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  period_days INTEGER GENERATED ALWAYS AS (EXTRACT(DAY FROM period_end - period_start) + 1) STORED,

  -- Sales Volume Metrics
  units_sold INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  velocity DECIMAL(10, 2) GENERATED ALWAYS AS (units_sold::DECIMAL / NULLIF(EXTRACT(DAY FROM period_end - period_start) + 1, 0)) STORED,

  -- Menu Mix Metrics
  actual_menu_mix_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  expected_menu_mix_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  menu_mix_variance DECIMAL(5, 2) GENERATED ALWAYS AS (actual_menu_mix_percent - expected_menu_mix_percent) STORED,
  popularity_index DECIMAL(5, 2) GENERATED ALWAYS AS (NULLIF(actual_menu_mix_percent, 0) / NULLIF(expected_menu_mix_percent, 1)) STORED,

  -- Profitability Metrics
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  food_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  contribution_margin DECIMAL(10, 2) GENERATED ALWAYS AS (selling_price - food_cost) STORED,
  contribution_margin_percent DECIMAL(5, 2) GENERATED ALWAYS AS ((selling_price - food_cost) / NULLIF(selling_price, 0) * 100) STORED,
  weighted_contribution_margin DECIMAL(10, 2) GENERATED ALWAYS AS ((selling_price - food_cost) * actual_menu_mix_percent / 100) STORED,
  total_contribution DECIMAL(12, 2) GENERATED ALWAYS AS ((selling_price - food_cost) * units_sold) STORED,

  -- Comparison Metrics
  avg_contribution_margin DECIMAL(10, 2) NOT NULL DEFAULT 0,
  profitability_vs_average DECIMAL(10, 2) GENERATED ALWAYS AS ((selling_price - food_cost) - avg_contribution_margin) STORED,
  popularity_threshold DECIMAL(5, 2) NOT NULL DEFAULT 0,
  is_high_profitability BOOLEAN GENERATED ALWAYS AS ((selling_price - food_cost) >= avg_contribution_margin) STORED,
  is_high_popularity BOOLEAN GENERATED ALWAYS AS (actual_menu_mix_percent >= popularity_threshold) STORED,

  -- Trend Metrics
  previous_period_units_sold INTEGER,
  sales_growth_percent DECIMAL(5, 2),
  trend_direction VARCHAR(10) CHECK (trend_direction IN ('up', 'down', 'stable')),

  -- Strategic Metrics
  revenue_pash DECIMAL(10, 2), -- Revenue per available seat hour
  order_frequency DECIMAL(5, 4), -- Times ordered / Times on order
  return_rate DECIMAL(5, 4), -- Returns or complaints / units_sold
  preparation_complexity INTEGER CHECK (preparation_complexity BETWEEN 1 AND 10),
  contribution_per_minute DECIMAL(10, 2),

  -- Competitor Comparison (optional)
  competitor_avg_price DECIMAL(10, 2),
  price_index DECIMAL(5, 2),
  market_position VARCHAR(20) CHECK (market_position IN ('premium', 'competitive', 'value')),

  -- Audit Trail
  calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  calculated_by VARCHAR(30) NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
  CONSTRAINT unique_performance_period UNIQUE (menu_item_id, period_start, period_end),
  CONSTRAINT valid_period CHECK (period_end > period_start),
  CONSTRAINT valid_price CHECK (selling_price >= 0),
  CONSTRAINT valid_cost CHECK (food_cost >= 0),
  CONSTRAINT valid_menu_mix CHECK (actual_menu_mix_percent >= 0 AND actual_menu_mix_percent <= 100)
);

CREATE INDEX idx_performance_item_period ON menu_item_performance(menu_item_id, period_start, period_end);
CREATE INDEX idx_performance_classification ON menu_item_performance(classification);
CREATE INDEX idx_performance_lifecycle ON menu_item_performance(lifecycle_stage);
CREATE INDEX idx_performance_period ON menu_item_performance(period_start, period_end);
CREATE INDEX idx_performance_category ON menu_item_performance(category_id);
```

### 1.2 menu_engineering_recommendations

Stores strategic recommendations for menu optimization.

```sql
CREATE TABLE menu_engineering_recommendations (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  menu_item_id VARCHAR(30) NOT NULL,
  performance_id VARCHAR(30),

  -- Recommendation Details
  classification VARCHAR(20) NOT NULL CHECK (classification IN ('Star', 'Plowhorse', 'Puzzle', 'Dog')),
  recommendation_type VARCHAR(20) NOT NULL CHECK (recommendation_type IN ('pricing', 'positioning', 'promotion', 'removal', 'maintain', 'bundle', 'reformulation')),
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),

  -- Content
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  expected_impact VARCHAR(10) NOT NULL CHECK (expected_impact IN ('high', 'medium', 'low')),
  estimated_revenue_impact DECIMAL(10, 2),
  estimated_margin_impact DECIMAL(5, 2),

  -- Implementation
  implementation_steps TEXT[] NOT NULL,
  estimated_effort VARCHAR(10) NOT NULL CHECK (estimated_effort IN ('low', 'medium', 'high')),
  required_resources TEXT[] NOT NULL,
  timeline VARCHAR(100) NOT NULL,

  -- Status Tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
  approved_by VARCHAR(30),
  approved_at TIMESTAMP,
  implemented_at TIMESTAMP,

  -- Results Tracking (after implementation)
  actual_revenue_impact DECIMAL(10, 2),
  actual_margin_impact DECIMAL(5, 2),
  success BOOLEAN,
  notes TEXT,

  -- Audit Trail
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(30) NOT NULL DEFAULT 'system',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_performance FOREIGN KEY (performance_id) REFERENCES menu_item_performance(id) ON DELETE SET NULL,
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_recommendations_item ON menu_engineering_recommendations(menu_item_id);
CREATE INDEX idx_recommendations_status ON menu_engineering_recommendations(status);
CREATE INDEX idx_recommendations_priority ON menu_engineering_recommendations(priority);
CREATE INDEX idx_recommendations_type ON menu_engineering_recommendations(recommendation_type);
CREATE INDEX idx_recommendations_created ON menu_engineering_recommendations(created_at);
```

### 1.3 menu_categories

Defines menu categories with performance targets.

```sql
CREATE TABLE menu_categories (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,

  -- Display Properties
  display_order INTEGER NOT NULL DEFAULT 0,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color code

  -- Category Targets
  target_item_count INTEGER NOT NULL DEFAULT 10,
  min_item_count INTEGER NOT NULL DEFAULT 3,
  max_item_count INTEGER NOT NULL DEFAULT 20,

  -- Profitability Targets
  target_contribution_margin_percent DECIMAL(5, 2) NOT NULL DEFAULT 65.00 CHECK (target_contribution_margin_percent BETWEEN 0 AND 100),
  min_contribution_margin_percent DECIMAL(5, 2) NOT NULL DEFAULT 40.00 CHECK (min_contribution_margin_percent BETWEEN 0 AND 100),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit Trail
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(30) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(30) NOT NULL,

  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
  CONSTRAINT valid_item_count_range CHECK (min_item_count <= target_item_count AND target_item_count <= max_item_count)
);

CREATE INDEX idx_categories_active ON menu_categories(is_active);
CREATE INDEX idx_categories_display_order ON menu_categories(display_order);
```

### 1.4 competitors

Tracks competitor information for market analysis.

```sql
CREATE TABLE competitors (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  name VARCHAR(200) NOT NULL,

  -- Location Information
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) NOT NULL DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Competitor Details
  type VARCHAR(30) NOT NULL CHECK (type IN ('fine_dining', 'casual', 'fast_casual', 'quick_service')),
  cuisine VARCHAR(100),
  price_range VARCHAR(10) NOT NULL CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),

  -- Comparison Relevance
  is_direct_competitor BOOLEAN NOT NULL DEFAULT true,
  relevance_score INTEGER NOT NULL DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),

  -- Contact Information
  website VARCHAR(500),
  phone VARCHAR(20),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit Trail
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(30) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(30) NOT NULL,

  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX idx_competitors_active ON competitors(is_active);
CREATE INDEX idx_competitors_type ON competitors(type);
CREATE INDEX idx_competitors_relevance ON competitors(relevance_score DESC);
```

### 1.5 competitor_items

Tracks competitor menu items and pricing.

```sql
CREATE TABLE competitor_items (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  competitor_id VARCHAR(30) NOT NULL,
  competitor_name VARCHAR(200) NOT NULL, -- Denormalized for performance
  item_name VARCHAR(200) NOT NULL,

  -- Comparison Mapping
  our_menu_item_id VARCHAR(30),
  category_id VARCHAR(30) NOT NULL,

  -- Pricing Information
  price DECIMAL(10, 2) NOT NULL,
  portion_size VARCHAR(100),
  price_per_standard_unit DECIMAL(10, 2), -- Normalized price (e.g., per 100g)

  -- Additional Details
  description TEXT,
  image_url VARCHAR(500),
  source VARCHAR(100) NOT NULL, -- 'visit', 'website', 'menu', 'delivery_app'

  -- Tracking
  first_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit Trail
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(30) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_competitor FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE,
  CONSTRAINT fk_our_menu_item FOREIGN KEY (our_menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT valid_price CHECK (price > 0)
);

CREATE INDEX idx_competitor_items_competitor ON competitor_items(competitor_id);
CREATE INDEX idx_competitor_items_our_item ON competitor_items(our_menu_item_id);
CREATE INDEX idx_competitor_items_category ON competitor_items(category_id);
CREATE INDEX idx_competitor_items_active ON competitor_items(is_active);
CREATE INDEX idx_competitor_items_verified ON competitor_items(last_verified_at);
```

### 1.6 menu_optimization_experiments

Tracks A/B testing experiments for menu optimization.

```sql
CREATE TABLE menu_optimization_experiments (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,

  -- Experiment Configuration
  experiment_type VARCHAR(20) NOT NULL CHECK (experiment_type IN ('price', 'description', 'positioning', 'bundle', 'promotion')),
  menu_item_id VARCHAR(30) NOT NULL,

  -- Experiment Period
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  duration INTEGER GENERATED ALWAYS AS (EXTRACT(DAY FROM end_date - start_date) + 1) STORED,

  -- Experiment Scope
  location_ids TEXT[] NOT NULL,
  customer_segment VARCHAR(100),

  -- Success Metrics
  primary_metric VARCHAR(30) NOT NULL CHECK (primary_metric IN ('revenue', 'units_sold', 'contribution_margin', 'conversion_rate')),
  secondary_metrics TEXT[] NOT NULL,
  minimum_sample_size INTEGER NOT NULL DEFAULT 100,

  -- Results
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),
  winning_variant_id VARCHAR(30),
  statistical_significance DECIMAL(5, 4), -- P-value or confidence level

  -- Rollout
  rollout_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (rollout_status IN ('pending', 'in_progress', 'completed')),
  rollout_date TIMESTAMP,

  -- Audit Trail
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(30) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT valid_period CHECK (end_date > start_date),
  CONSTRAINT valid_duration CHECK (EXTRACT(DAY FROM end_date - start_date) + 1 BETWEEN 14 AND 60)
);

CREATE INDEX idx_experiments_item ON menu_optimization_experiments(menu_item_id);
CREATE INDEX idx_experiments_status ON menu_optimization_experiments(status);
CREATE INDEX idx_experiments_dates ON menu_optimization_experiments(start_date, end_date);
```

### 1.7 experiment_variants

Stores variants for A/B testing experiments.

```sql
CREATE TABLE experiment_variants (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  experiment_id VARCHAR(30) NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_control BOOLEAN NOT NULL DEFAULT false,

  -- Variant Configuration (stored as JSONB for flexibility)
  configuration JSONB NOT NULL, -- { price: 15.99, description: "...", position: "top", etc. }

  -- Performance Metrics
  transaction_count INTEGER NOT NULL DEFAULT 0,
  units_sold INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  avg_contribution_margin DECIMAL(10, 2),
  conversion_rate DECIMAL(5, 4), -- % of views that convert to purchases

  -- Statistical Metrics
  mean DECIMAL(12, 4),
  standard_deviation DECIMAL(12, 4),
  confidence_interval_lower DECIMAL(12, 4),
  confidence_interval_upper DECIMAL(12, 4),

  -- Audit Trail
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_experiment FOREIGN KEY (experiment_id) REFERENCES menu_optimization_experiments(id) ON DELETE CASCADE,
  CONSTRAINT unique_experiment_variant_name UNIQUE (experiment_id, name)
);

CREATE INDEX idx_variants_experiment ON experiment_variants(experiment_id);
CREATE INDEX idx_variants_control ON experiment_variants(is_control);
```

### 1.8 sales_forecasts

Stores sales forecast data for menu items.

```sql
CREATE TABLE sales_forecasts (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  menu_item_id VARCHAR(30) NOT NULL,
  forecast_date DATE NOT NULL,

  -- Forecast Values
  forecasted_units DECIMAL(10, 2) NOT NULL,
  confidence_level DECIMAL(3, 2) NOT NULL DEFAULT 0.95 CHECK (confidence_level BETWEEN 0 AND 1),
  lower_bound DECIMAL(10, 2) NOT NULL,
  upper_bound DECIMAL(10, 2) NOT NULL,

  -- Forecast Methodology
  forecasting_method VARCHAR(50) NOT NULL, -- 'moving_average', 'exponential_smoothing', etc.
  seasonality_adjusted BOOLEAN NOT NULL DEFAULT false,
  trend_adjusted BOOLEAN NOT NULL DEFAULT false,
  promotional_period BOOLEAN NOT NULL DEFAULT false,

  -- Actual Values (filled in after forecast date)
  actual_units INTEGER,
  forecast_error DECIMAL(10, 2), -- Actual - Forecasted
  absolute_percent_error DECIMAL(5, 2), -- |Actual - Forecasted| / Actual * 100

  -- Audit Trail
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  generated_by VARCHAR(30) NOT NULL DEFAULT 'system',

  CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT unique_forecast UNIQUE (menu_item_id, forecast_date),
  CONSTRAINT valid_bounds CHECK (lower_bound <= forecasted_units AND forecasted_units <= upper_bound)
);

CREATE INDEX idx_forecasts_item_date ON sales_forecasts(menu_item_id, forecast_date);
CREATE INDEX idx_forecasts_date ON sales_forecasts(forecast_date);
CREATE INDEX idx_forecasts_method ON sales_forecasts(forecasting_method);
```

### 1.9 menu_engineering_settings

Stores configuration settings for menu engineering analysis.

```sql
CREATE TABLE menu_engineering_settings (
  id VARCHAR(30) PRIMARY KEY DEFAULT generate_ulid(),
  location_id VARCHAR(30), -- NULL = global settings

  -- Classification Thresholds
  popularity_threshold_multiplier DECIMAL(3, 2) NOT NULL DEFAULT 0.70 CHECK (popularity_threshold_multiplier BETWEEN 0.5 AND 1.0),
  profitability_threshold_type VARCHAR(20) NOT NULL DEFAULT 'average_cm' CHECK (profitability_threshold_type IN ('average_cm', 'custom')),
  custom_profitability_threshold DECIMAL(5, 2),

  -- Contribution Margin Targets
  food_item_target_cm_percent DECIMAL(5, 2) NOT NULL DEFAULT 65.00 CHECK (food_item_target_cm_percent BETWEEN 0 AND 100),
  beverage_target_cm_percent DECIMAL(5, 2) NOT NULL DEFAULT 80.00 CHECK (beverage_target_cm_percent BETWEEN 0 AND 100),
  min_acceptable_cm_percent DECIMAL(5, 2) NOT NULL DEFAULT 40.00 CHECK (min_acceptable_cm_percent BETWEEN 0 AND 100),

  -- Alert Rules
  critical_cm_threshold DECIMAL(5, 2) NOT NULL DEFAULT 30.00,
  warning_cm_threshold DECIMAL(5, 2) NOT NULL DEFAULT 40.00,
  menu_mix_variance_alert_threshold DECIMAL(5, 2) NOT NULL DEFAULT 30.00,
  lifecycle_transition_alerts_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Lifecycle Stages
  introduction_period_days INTEGER NOT NULL DEFAULT 60 CHECK (introduction_period_days BETWEEN 30 AND 120),
  decline_threshold_percent DECIMAL(5, 2) NOT NULL DEFAULT 20.00,

  -- Forecast Parameters
  forecasting_method VARCHAR(50) NOT NULL DEFAULT 'exponential_smoothing',
  seasonality_adjustment_enabled BOOLEAN NOT NULL DEFAULT true,
  promotional_exclusion_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Competitor Analysis
  min_competitors_required INTEGER NOT NULL DEFAULT 3 CHECK (min_competitors_required BETWEEN 1 AND 5),
  data_freshness_warning_days INTEGER NOT NULL DEFAULT 90 CHECK (data_freshness_warning_days BETWEEN 30 AND 180),
  price_variance_alert_threshold DECIMAL(5, 2) NOT NULL DEFAULT 10.00,

  -- Audit Trail
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(30) NOT NULL,

  CONSTRAINT fk_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
  CONSTRAINT unique_location_settings UNIQUE (location_id)
);

CREATE INDEX idx_settings_location ON menu_engineering_settings(location_id);
```

---

## 2. Prisma Schema

```prisma
model MenuItemPerformance {
  id                        String   @id @default(cuid()) @db.VarChar(30)
  menuItemId                String   @map("menu_item_id") @db.VarChar(30)
  menuItemName              String   @map("menu_item_name") @db.VarChar(200)
  recipeId                  String?  @map("recipe_id") @db.VarChar(30)
  categoryId                String   @map("category_id") @db.VarChar(30)
  categoryName              String   @map("category_name") @db.VarChar(100)

  status                    String   @db.VarChar(20)
  classification            String   @db.VarChar(20)
  lifecycleStage            String   @map("lifecycle_stage") @db.VarChar(20)

  periodStart               DateTime @map("period_start") @db.Timestamp()
  periodEnd                 DateTime @map("period_end") @db.Timestamp()

  unitsSold                 Int      @default(0) @map("units_sold")
  totalRevenue              Decimal  @default(0) @map("total_revenue") @db.Decimal(12, 2)
  totalCost                 Decimal  @default(0) @map("total_cost") @db.Decimal(12, 2)

  actualMenuMixPercent      Decimal  @default(0) @map("actual_menu_mix_percent") @db.Decimal(5, 2)
  expectedMenuMixPercent    Decimal  @default(0) @map("expected_menu_mix_percent") @db.Decimal(5, 2)

  sellingPrice              Decimal  @default(0) @map("selling_price") @db.Decimal(10, 2)
  foodCost                  Decimal  @default(0) @map("food_cost") @db.Decimal(10, 2)

  avgContributionMargin     Decimal  @default(0) @map("avg_contribution_margin") @db.Decimal(10, 2)
  popularityThreshold       Decimal  @default(0) @map("popularity_threshold") @db.Decimal(5, 2)

  previousPeriodUnitsSold   Int?     @map("previous_period_units_sold")
  salesGrowthPercent        Decimal? @map("sales_growth_percent") @db.Decimal(5, 2)
  trendDirection            String?  @map("trend_direction") @db.VarChar(10)

  revenuePASH               Decimal? @map("revenue_pash") @db.Decimal(10, 2)
  orderFrequency            Decimal? @map("order_frequency") @db.Decimal(5, 4)
  returnRate                Decimal? @map("return_rate") @db.Decimal(5, 4)
  preparationComplexity     Int?     @map("preparation_complexity")
  contributionPerMinute     Decimal? @map("contribution_per_minute") @db.Decimal(10, 2)

  competitorAvgPrice        Decimal? @map("competitor_avg_price") @db.Decimal(10, 2)
  priceIndex                Decimal? @map("price_index") @db.Decimal(5, 2)
  marketPosition            String?  @map("market_position") @db.VarChar(20)

  calculatedAt              DateTime @default(now()) @map("calculated_at") @db.Timestamp()
  calculatedBy              String   @map("calculated_by") @db.VarChar(30)
  lastUpdated               DateTime @updatedAt @map("last_updated") @db.Timestamp()

  menuItem                  MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  recipe                    Recipe?  @relation(fields: [recipeId], references: [id], onDelete: SetNull)
  category                  MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  recommendations           MenuEngineeringRecommendation[]

  @@unique([menuItemId, periodStart, periodEnd], name: "unique_performance_period")
  @@index([menuItemId, periodStart, periodEnd], name: "idx_performance_item_period")
  @@index([classification], name: "idx_performance_classification")
  @@index([lifecycleStage], name: "idx_performance_lifecycle")
  @@map("menu_item_performance")
}

model MenuEngineeringRecommendation {
  id                      String   @id @default(cuid()) @db.VarChar(30)
  menuItemId              String   @map("menu_item_id") @db.VarChar(30)
  performanceId           String?  @map("performance_id") @db.VarChar(30)

  classification          String   @db.VarChar(20)
  recommendationType      String   @map("recommendation_type") @db.VarChar(20)
  priority                String   @db.VarChar(10)

  title                   String   @db.VarChar(200)
  description             String   @db.Text
  expectedImpact          String   @map("expected_impact") @db.VarChar(10)
  estimatedRevenueImpact  Decimal? @map("estimated_revenue_impact") @db.Decimal(10, 2)
  estimatedMarginImpact   Decimal? @map("estimated_margin_impact") @db.Decimal(5, 2)

  implementationSteps     String[] @map("implementation_steps")
  estimatedEffort         String   @map("estimated_effort") @db.VarChar(10)
  requiredResources       String[] @map("required_resources")
  timeline                String   @db.VarChar(100)

  status                  String   @default("pending") @db.VarChar(20)
  approvedBy              String?  @map("approved_by") @db.VarChar(30)
  approvedAt              DateTime? @map("approved_at") @db.Timestamp()
  implementedAt           DateTime? @map("implemented_at") @db.Timestamp()

  actualRevenueImpact     Decimal? @map("actual_revenue_impact") @db.Decimal(10, 2)
  actualMarginImpact      Decimal? @map("actual_margin_impact") @db.Decimal(5, 2)
  success                 Boolean?
  notes                   String?  @db.Text

  createdAt               DateTime @default(now()) @map("created_at") @db.Timestamp()
  createdBy               String   @default("system") @map("created_by") @db.VarChar(30)
  updatedAt               DateTime @updatedAt @map("updated_at") @db.Timestamp()

  menuItem                MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  performance             MenuItemPerformance? @relation(fields: [performanceId], references: [id], onDelete: SetNull)
  approver                User?    @relation(fields: [approvedBy], references: [id], onDelete: SetNull)

  @@index([menuItemId], name: "idx_recommendations_item")
  @@index([status], name: "idx_recommendations_status")
  @@index([priority], name: "idx_recommendations_priority")
  @@map("menu_engineering_recommendations")
}

model MenuCategory {
  id                              String   @id @default(cuid()) @db.VarChar(30)
  name                            String   @unique @db.VarChar(100)
  description                     String?  @db.Text

  displayOrder                    Int      @default(0) @map("display_order")
  icon                            String?  @db.VarChar(50)
  color                           String?  @db.VarChar(7)

  targetItemCount                 Int      @default(10) @map("target_item_count")
  minItemCount                    Int      @default(3) @map("min_item_count")
  maxItemCount                    Int      @default(20) @map("max_item_count")

  targetContributionMarginPercent Decimal  @default(65.00) @map("target_contribution_margin_percent") @db.Decimal(5, 2)
  minContributionMarginPercent    Decimal  @default(40.00) @map("min_contribution_margin_percent") @db.Decimal(5, 2)

  isActive                        Boolean  @default(true) @map("is_active")

  createdAt                       DateTime @default(now()) @map("created_at") @db.Timestamp()
  createdBy                       String   @map("created_by") @db.VarChar(30)
  updatedAt                       DateTime @updatedAt @map("updated_at") @db.Timestamp()
  updatedBy                       String   @map("updated_by") @db.VarChar(30)

  creator                         User     @relation("CategoryCreator", fields: [createdBy], references: [id])
  updater                         User     @relation("CategoryUpdater", fields: [updatedBy], references: [id])

  menuItems                       MenuItem[]
  performance                     MenuItemPerformance[]
  competitorItems                 CompetitorItem[]

  @@index([isActive], name: "idx_categories_active")
  @@index([displayOrder], name: "idx_categories_display_order")
  @@map("menu_categories")
}

model Competitor {
  id                 String   @id @default(cuid()) @db.VarChar(30)
  name               String   @db.VarChar(200)

  address            String?  @db.Text
  city               String?  @db.VarChar(100)
  state              String?  @db.VarChar(50)
  country            String   @default("USA") @db.VarChar(50)
  latitude           Decimal? @db.Decimal(10, 8)
  longitude          Decimal? @db.Decimal(11, 8)

  type               String   @db.VarChar(30)
  cuisine            String?  @db.VarChar(100)
  priceRange         String   @map("price_range") @db.VarChar(10)

  isDirectCompetitor Boolean  @default(true) @map("is_direct_competitor")
  relevanceScore     Int      @default(5) @map("relevance_score")

  website            String?  @db.VarChar(500)
  phone              String?  @db.VarChar(20)

  isActive           Boolean  @default(true) @map("is_active")

  createdAt          DateTime @default(now()) @map("created_at") @db.Timestamp()
  createdBy          String   @map("created_by") @db.VarChar(30)
  updatedAt          DateTime @updatedAt @map("updated_at") @db.Timestamp()
  updatedBy          String   @map("updated_by") @db.VarChar(30)

  creator            User     @relation("CompetitorCreator", fields: [createdBy], references: [id])
  updater            User     @relation("CompetitorUpdater", fields: [updatedBy], references: [id])

  items              CompetitorItem[]

  @@index([isActive], name: "idx_competitors_active")
  @@index([type], name: "idx_competitors_type")
  @@map("competitors")
}

model CompetitorItem {
  id                    String   @id @default(cuid()) @db.VarChar(30)
  competitorId          String   @map("competitor_id") @db.VarChar(30)
  competitorName        String   @map("competitor_name") @db.VarChar(200)
  itemName              String   @map("item_name") @db.VarChar(200)

  ourMenuItemId         String?  @map("our_menu_item_id") @db.VarChar(30)
  categoryId            String   @map("category_id") @db.VarChar(30)

  price                 Decimal  @db.Decimal(10, 2)
  portionSize           String?  @map("portion_size") @db.VarChar(100)
  pricePerStandardUnit  Decimal? @map("price_per_standard_unit") @db.Decimal(10, 2)

  description           String?  @db.Text
  imageUrl              String?  @map("image_url") @db.VarChar(500)
  source                String   @db.VarChar(100)

  firstSeenAt           DateTime @default(now()) @map("first_seen_at") @db.Timestamp()
  lastVerifiedAt        DateTime @default(now()) @map("last_verified_at") @db.Timestamp()
  isActive              Boolean  @default(true) @map("is_active")

  createdAt             DateTime @default(now()) @map("created_at") @db.Timestamp()
  createdBy             String   @map("created_by") @db.VarChar(30)
  updatedAt             DateTime @updatedAt @map("updated_at") @db.Timestamp()

  competitor            Competitor @relation(fields: [competitorId], references: [id], onDelete: Cascade)
  ourMenuItem           MenuItem?  @relation(fields: [ourMenuItemId], references: [id], onDelete: SetNull)
  category              MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  creator               User       @relation(fields: [createdBy], references: [id])

  @@index([competitorId], name: "idx_competitor_items_competitor")
  @@index([ourMenuItemId], name: "idx_competitor_items_our_item")
  @@map("competitor_items")
}

model MenuOptimizationExperiment {
  id                     String   @id @default(cuid()) @db.VarChar(30)
  name                   String   @db.VarChar(200)
  description            String   @db.Text

  experimentType         String   @map("experiment_type") @db.VarChar(20)
  menuItemId             String   @map("menu_item_id") @db.VarChar(30)

  startDate              DateTime @map("start_date") @db.Timestamp()
  endDate                DateTime @map("end_date") @db.Timestamp()

  locationIds            String[] @map("location_ids")
  customerSegment        String?  @map("customer_segment") @db.VarChar(100)

  primaryMetric          String   @map("primary_metric") @db.VarChar(30)
  secondaryMetrics       String[] @map("secondary_metrics")
  minimumSampleSize      Int      @default(100) @map("minimum_sample_size")

  status                 String   @default("draft") @db.VarChar(20)
  winningVariantId       String?  @map("winning_variant_id") @db.VarChar(30)
  statisticalSignificance Decimal? @map("statistical_significance") @db.Decimal(5, 4)

  rolloutStatus          String   @default("pending") @map("rollout_status") @db.VarChar(20)
  rolloutDate            DateTime? @map("rollout_date") @db.Timestamp()

  createdAt              DateTime @default(now()) @map("created_at") @db.Timestamp()
  createdBy              String   @map("created_by") @db.VarChar(30)
  updatedAt              DateTime @updatedAt @map("updated_at") @db.Timestamp()

  menuItem               MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  creator                User     @relation(fields: [createdBy], references: [id])

  variants               ExperimentVariant[]

  @@index([menuItemId], name: "idx_experiments_item")
  @@index([status], name: "idx_experiments_status")
  @@map("menu_optimization_experiments")
}

model ExperimentVariant {
  id                       String   @id @default(cuid()) @db.VarChar(30)
  experimentId             String   @map("experiment_id") @db.VarChar(30)
  name                     String   @db.VarChar(100)
  isControl                Boolean  @default(false) @map("is_control")

  configuration            Json     // { price, description, position, etc. }

  transactionCount         Int      @default(0) @map("transaction_count")
  unitsSold                Int      @default(0) @map("units_sold")
  totalRevenue             Decimal  @default(0) @map("total_revenue") @db.Decimal(12, 2)
  avgContributionMargin    Decimal? @map("avg_contribution_margin") @db.Decimal(10, 2)
  conversionRate           Decimal? @map("conversion_rate") @db.Decimal(5, 4)

  mean                     Decimal? @db.Decimal(12, 4)
  standardDeviation        Decimal? @map("standard_deviation") @db.Decimal(12, 4)
  confidenceIntervalLower  Decimal? @map("confidence_interval_lower") @db.Decimal(12, 4)
  confidenceIntervalUpper  Decimal? @map("confidence_interval_upper") @db.Decimal(12, 4)

  createdAt                DateTime @default(now()) @map("created_at") @db.Timestamp()
  updatedAt                DateTime @updatedAt @map("updated_at") @db.Timestamp()

  experiment               MenuOptimizationExperiment @relation(fields: [experimentId], references: [id], onDelete: Cascade)

  @@unique([experimentId, name], name: "unique_experiment_variant_name")
  @@index([experimentId], name: "idx_variants_experiment")
  @@map("experiment_variants")
}

model SalesForecast {
  id                   String   @id @default(cuid()) @db.VarChar(30)
  menuItemId           String   @map("menu_item_id") @db.VarChar(30)
  forecastDate         DateTime @map("forecast_date") @db.Date

  forecastedUnits      Decimal  @map("forecasted_units") @db.Decimal(10, 2)
  confidenceLevel      Decimal  @default(0.95) @map("confidence_level") @db.Decimal(3, 2)
  lowerBound           Decimal  @map("lower_bound") @db.Decimal(10, 2)
  upperBound           Decimal  @map("upper_bound") @db.Decimal(10, 2)

  forecastingMethod    String   @map("forecasting_method") @db.VarChar(50)
  seasonalityAdjusted  Boolean  @default(false) @map("seasonality_adjusted")
  trendAdjusted        Boolean  @default(false) @map("trend_adjusted")
  promotionalPeriod    Boolean  @default(false) @map("promotional_period")

  actualUnits          Int?     @map("actual_units")
  forecastError        Decimal? @map("forecast_error") @db.Decimal(10, 2)
  absolutePercentError Decimal? @map("absolute_percent_error") @db.Decimal(5, 2)

  generatedAt          DateTime @default(now()) @map("generated_at") @db.Timestamp()
  generatedBy          String   @default("system") @map("generated_by") @db.VarChar(30)

  menuItem             MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)

  @@unique([menuItemId, forecastDate], name: "unique_forecast")
  @@index([menuItemId, forecastDate], name: "idx_forecasts_item_date")
  @@map("sales_forecasts")
}

model MenuEngineeringSettings {
  id                               String   @id @default(cuid()) @db.VarChar(30)
  locationId                       String?  @unique @map("location_id") @db.VarChar(30)

  popularityThresholdMultiplier    Decimal  @default(0.70) @map("popularity_threshold_multiplier") @db.Decimal(3, 2)
  profitabilityThresholdType       String   @default("average_cm") @map("profitability_threshold_type") @db.VarChar(20)
  customProfitabilityThreshold     Decimal? @map("custom_profitability_threshold") @db.Decimal(5, 2)

  foodItemTargetCMPercent          Decimal  @default(65.00) @map("food_item_target_cm_percent") @db.Decimal(5, 2)
  beverageTargetCMPercent          Decimal  @default(80.00) @map("beverage_target_cm_percent") @db.Decimal(5, 2)
  minAcceptableCMPercent           Decimal  @default(40.00) @map("min_acceptable_cm_percent") @db.Decimal(5, 2)

  criticalCMThreshold              Decimal  @default(30.00) @map("critical_cm_threshold") @db.Decimal(5, 2)
  warningCMThreshold               Decimal  @default(40.00) @map("warning_cm_threshold") @db.Decimal(5, 2)
  menuMixVarianceAlertThreshold    Decimal  @default(30.00) @map("menu_mix_variance_alert_threshold") @db.Decimal(5, 2)
  lifecycleTransitionAlertsEnabled Boolean  @default(true) @map("lifecycle_transition_alerts_enabled")

  introductionPeriodDays           Int      @default(60) @map("introduction_period_days")
  declineThresholdPercent          Decimal  @default(20.00) @map("decline_threshold_percent") @db.Decimal(5, 2)

  forecastingMethod                String   @default("exponential_smoothing") @map("forecasting_method") @db.VarChar(50)
  seasonalityAdjustmentEnabled     Boolean  @default(true) @map("seasonality_adjustment_enabled")
  promotionalExclusionEnabled      Boolean  @default(true) @map("promotional_exclusion_enabled")

  minCompetitorsRequired           Int      @default(3) @map("min_competitors_required")
  dataFreshnessWarningDays         Int      @default(90) @map("data_freshness_warning_days")
  priceVarianceAlertThreshold      Decimal  @default(10.00) @map("price_variance_alert_threshold") @db.Decimal(5, 2)

  createdAt                        DateTime @default(now()) @map("created_at") @db.Timestamp()
  updatedAt                        DateTime @updatedAt @map("updated_at") @db.Timestamp()
  updatedBy                        String   @map("updated_by") @db.VarChar(30)

  location                         Location? @relation(fields: [locationId], references: [id], onDelete: Cascade)
  updater                          User      @relation(fields: [updatedBy], references: [id])

  @@index([locationId], name: "idx_settings_location")
  @@map("menu_engineering_settings")
}
```

---

## 3. TypeScript Interfaces

```typescript
// Menu Engineering specific types
export interface MenuItemPerformance {
  id: string
  menuItemId: string
  menuItemName: string
  recipeId?: string
  categoryId: string
  categoryName: string

  status: 'active' | 'seasonal' | 'discontinued'
  classification: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog'
  lifecycleStage: 'introduction' | 'growth' | 'maturity' | 'decline' | 'discontinued'

  periodStart: string // ISO 8601
  periodEnd: string // ISO 8601
  periodDays: number

  unitsSold: number
  totalRevenue: number
  totalCost: number
  velocity: number

  actualMenuMixPercent: number
  expectedMenuMixPercent: number
  menuMixVariance: number
  popularityIndex: number

  sellingPrice: number
  foodCost: number
  contributionMargin: number
  contributionMarginPercent: number
  weightedContributionMargin: number
  totalContribution: number

  avgContributionMargin: number
  profitabilityVsAverage: number
  popularityThreshold: number
  isHighProfitability: boolean
  isHighPopularity: boolean

  previousPeriodUnitsSold?: number
  salesGrowthPercent?: number
  trendDirection?: 'up' | 'down' | 'stable'

  revenuePASH?: number
  orderFrequency?: number
  returnRate?: number
  preparationComplexity?: number
  contributionPerMinute?: number

  competitorAvgPrice?: number
  priceIndex?: number
  marketPosition?: 'premium' | 'competitive' | 'value'

  calculatedAt: string
  calculatedBy: string
  lastUpdated: string
}

export interface MenuEngineeringRecommendation {
  id: string
  menuItemId: string
  performanceId?: string

  classification: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog'
  recommendationType: 'pricing' | 'positioning' | 'promotion' | 'removal' | 'maintain' | 'bundle' | 'reformulation'
  priority: 'critical' | 'high' | 'medium' | 'low'

  title: string
  description: string
  expectedImpact: 'high' | 'medium' | 'low'
  estimatedRevenueImpact?: number
  estimatedMarginImpact?: number

  implementationSteps: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
  requiredResources: string[]
  timeline: string

  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  implementedAt?: string

  actualRevenueImpact?: number
  actualMarginImpact?: number
  success?: boolean
  notes?: string

  createdAt: string
  createdBy: string
  updatedAt: string
}

export interface MenuCategory {
  id: string
  name: string
  description?: string

  displayOrder: number
  icon?: string
  color?: string

  targetItemCount: number
  minItemCount: number
  maxItemCount: number

  targetContributionMarginPercent: number
  minContributionMarginPercent: number

  isActive: boolean

  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface Competitor {
  id: string
  name: string

  address?: string
  city?: string
  state?: string
  country: string
  latitude?: number
  longitude?: number

  type: 'fine_dining' | 'casual' | 'fast_casual' | 'quick_service'
  cuisine?: string
  priceRange: '$' | '$$' | '$$$' | '$$$$'

  isDirectCompetitor: boolean
  relevanceScore: number

  website?: string
  phone?: string

  isActive: boolean

  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface CompetitorItem {
  id: string
  competitorId: string
  competitorName: string
  itemName: string

  ourMenuItemId?: string
  categoryId: string

  price: number
  portionSize?: string
  pricePerStandardUnit?: number

  description?: string
  imageUrl?: string
  source: string

  firstSeenAt: string
  lastVerifiedAt: string
  isActive: boolean

  createdAt: string
  createdBy: string
  updatedAt: string
}

export interface MenuOptimizationExperiment {
  id: string
  name: string
  description: string

  experimentType: 'price' | 'description' | 'positioning' | 'bundle' | 'promotion'
  menuItemId: string

  startDate: string
  endDate: string
  duration: number

  locationIds: string[]
  customerSegment?: string

  primaryMetric: 'revenue' | 'units_sold' | 'contribution_margin' | 'conversion_rate'
  secondaryMetrics: string[]
  minimumSampleSize: number

  status: 'draft' | 'running' | 'completed' | 'cancelled'
  winningVariantId?: string
  statisticalSignificance?: number

  rolloutStatus: 'pending' | 'in_progress' | 'completed'
  rolloutDate?: string

  createdAt: string
  createdBy: string
  updatedAt: string
}

export interface ExperimentVariant {
  id: string
  experimentId: string
  name: string
  isControl: boolean

  configuration: Record<string, any> // Flexible config object

  transactionCount: number
  unitsSold: number
  totalRevenue: number
  avgContributionMargin?: number
  conversionRate?: number

  mean?: number
  standardDeviation?: number
  confidenceIntervalLower?: number
  confidenceIntervalUpper?: number

  createdAt: string
  updatedAt: string
}

export interface SalesForecast {
  id: string
  menuItemId: string
  forecastDate: string // Date string (YYYY-MM-DD)

  forecastedUnits: number
  confidenceLevel: number
  lowerBound: number
  upperBound: number

  forecastingMethod: string
  seasonalityAdjusted: boolean
  trendAdjusted: boolean
  promotionalPeriod: boolean

  actualUnits?: number
  forecastError?: number
  absolutePercentError?: number

  generatedAt: string
  generatedBy: string
}

export interface MenuEngineeringSettings {
  id: string
  locationId?: string

  popularityThresholdMultiplier: number
  profitabilityThresholdType: 'average_cm' | 'custom'
  customProfitabilityThreshold?: number

  foodItemTargetCMPercent: number
  beverageTargetCMPercent: number
  minAcceptableCMPercent: number

  criticalCMThreshold: number
  warningCMThreshold: number
  menuMixVarianceAlertThreshold: number
  lifecycleTransitionAlertsEnabled: boolean

  introductionPeriodDays: number
  declineThresholdPercent: number

  forecastingMethod: string
  seasonalityAdjustmentEnabled: boolean
  promotionalExclusionEnabled: boolean

  minCompetitorsRequired: number
  dataFreshnessWarningDays: number
  priceVarianceAlertThreshold: number

  createdAt: string
  updatedAt: string
  updatedBy: string
}

// Dashboard aggregation types
export interface DashboardData {
  periodStart: string
  periodEnd: string
  totalItems: number
  classifications: {
    stars: number
    plowhorses: number
    puzzles: number
    dogs: number
  }
  avgContributionMargin: number
  totalRevenue: number
  items: MenuItemPerformance[]
  recommendations: MenuEngineeringRecommendation[]
}

export interface MatrixData {
  items: MenuItemPerformance[]
  avgContributionMargin: number
  expectedMenuMix: number
  popularityThreshold: number
  thresholds: {
    profitability: number
    popularity: number
  }
}
```

---

## 4. Entity Relationship Diagram

```mermaid
erDiagram
    MenuItemPerformance ||--o{ MenuEngineeringRecommendation : "generates"
    MenuItem ||--o{ MenuItemPerformance : "has"
    Recipe ||--o{ MenuItemPerformance : "costs from"
    MenuCategory ||--o{ MenuItemPerformance : "categorizes"
    MenuCategory ||--o{ MenuItem : "contains"
    MenuCategory ||--o{ CompetitorItem : "compares"

    Competitor ||--o{ CompetitorItem : "offers"
    MenuItem ||--o{ CompetitorItem : "maps to"

    MenuItem ||--o{ MenuOptimizationExperiment : "tests"
    MenuOptimizationExperiment ||--o{ ExperimentVariant : "has"

    MenuItem ||--o{ SalesForecast : "forecasts"

    Location ||--o| MenuEngineeringSettings : "configures"

    MenuItemPerformance {
        string id PK
        string menu_item_id FK
        string recipe_id FK
        string category_id FK
        string classification
        string lifecycle_stage
        timestamp period_start
        timestamp period_end
        int units_sold
        decimal actual_menu_mix_percent
        decimal contribution_margin_percent
    }

    MenuEngineeringRecommendation {
        string id PK
        string menu_item_id FK
        string performance_id FK
        string recommendation_type
        string priority
        string status
        string title
        text implementation_steps
    }

    MenuCategory {
        string id PK
        string name UK
        int target_item_count
        decimal target_contribution_margin_percent
    }

    Competitor {
        string id PK
        string name
        string type
        string price_range
        boolean is_direct_competitor
    }

    CompetitorItem {
        string id PK
        string competitor_id FK
        string our_menu_item_id FK
        string category_id FK
        decimal price
        string source
    }

    MenuOptimizationExperiment {
        string id PK
        string menu_item_id FK
        string experiment_type
        string status
        timestamp start_date
        timestamp end_date
    }

    ExperimentVariant {
        string id PK
        string experiment_id FK
        boolean is_control
        jsonb configuration
        decimal mean
        decimal standard_deviation
    }

    SalesForecast {
        string id PK
        string menu_item_id FK
        date forecast_date
        decimal forecasted_units
        decimal lower_bound
        decimal upper_bound
    }

    MenuEngineeringSettings {
        string id PK
        string location_id UK FK
        decimal popularity_threshold_multiplier
        decimal food_item_target_cm_percent
        int introduction_period_days
    }
```

---

## 5. Sample Data

### 5.1 Menu Categories

```sql
INSERT INTO menu_categories (id, name, description, display_order, target_item_count, min_item_count, max_item_count, target_contribution_margin_percent, min_contribution_margin_percent, created_by, updated_by)
VALUES
  ('cat_01', 'Appetizers', 'Starter dishes to begin the meal', 1, 8, 4, 12, 70.00, 50.00, 'user_admin', 'user_admin'),
  ('cat_02', 'Main Courses', 'Primary entrees and main dishes', 2, 12, 6, 18, 65.00, 45.00, 'user_admin', 'user_admin'),
  ('cat_03', 'Desserts', 'Sweet dishes to end the meal', 3, 6, 3, 10, 75.00, 55.00, 'user_admin', 'user_admin'),
  ('cat_04', 'Beverages', 'Drinks and refreshments', 4, 15, 8, 25, 85.00, 70.00, 'user_admin', 'user_admin');
```

### 5.2 Menu Item Performance (Sample)

```sql
INSERT INTO menu_item_performance (
  id, menu_item_id, menu_item_name, recipe_id, category_id, category_name,
  status, classification, lifecycle_stage,
  period_start, period_end,
  units_sold, total_revenue, total_cost,
  actual_menu_mix_percent, expected_menu_mix_percent,
  selling_price, food_cost,
  avg_contribution_margin, popularity_threshold,
  calculated_by
) VALUES
  -- Star: Margherita Pizza (High Profit, High Popularity)
  (
    'perf_001',
    'item_pizza_marg',
    'Margherita Pizza',
    'recipe_pizza_marg',
    'cat_02',
    'Main Courses',
    'active',
    'Star',
    'maturity',
    '2024-01-01 00:00:00',
    '2024-01-31 23:59:59',
    850, -- units sold
    29750.00, -- total revenue ($35 × 850)
    12325.00, -- total cost ($14.50 × 850)
    17.00, -- actual menu mix % (850 / 5000 total × 100)
    7.14, -- expected menu mix % (100 / 14 items)
    35.00, -- selling price
    14.50, -- food cost
    20.50, -- avg contribution margin
    5.00, -- popularity threshold (0.7 × 7.14)
    'system'
  ),

  -- Plowhorse: Spaghetti Carbonara (Low Profit, High Popularity)
  (
    'perf_002',
    'item_spaghetti_carb',
    'Spaghetti Carbonara',
    'recipe_spaghetti_carb',
    'cat_02',
    'Main Courses',
    'active',
    'Plowhorse',
    'maturity',
    '2024-01-01 00:00:00',
    '2024-01-31 23:59:59',
    720,
    15840.00, -- $22 × 720
    10800.00, -- $15 × 720
    14.40,
    7.14,
    22.00,
    15.00, -- High food cost
    20.50,
    5.00,
    'system'
  ),

  -- Puzzle: Truffle Risotto (High Profit, Low Popularity)
  (
    'perf_003',
    'item_truffle_risotto',
    'Truffle Risotto',
    'recipe_truffle_risotto',
    'cat_02',
    'Main Courses',
    'active',
    'Puzzle',
    'introduction',
    '2024-01-01 00:00:00',
    '2024-01-31 23:59:59',
    180,
    8100.00, -- $45 × 180
    2880.00, -- $16 × 180
    3.60, -- Low popularity
    7.14,
    45.00,
    16.00,
    20.50,
    5.00,
    'system'
  ),

  -- Dog: Caesar Salad (Low Profit, Low Popularity)
  (
    'perf_004',
    'item_caesar_salad',
    'Caesar Salad',
    'recipe_caesar_salad',
    'cat_01',
    'Appetizers',
    'active',
    'Dog',
    'decline',
    '2024-01-01 00:00:00',
    '2024-01-31 23:59:59',
    95, -- Low sales
    1425.00, -- $15 × 95
    1140.00, -- $12 × 95 (high cost)
    1.90, -- Low popularity
    7.14,
    15.00,
    12.00, -- High food cost
    20.50,
    5.00,
    'system'
  );
```

### 5.3 Menu Engineering Recommendations (Sample)

```sql
INSERT INTO menu_engineering_recommendations (
  id, menu_item_id, performance_id,
  classification, recommendation_type, priority,
  title, description, expected_impact,
  estimated_revenue_impact, estimated_margin_impact,
  implementation_steps, estimated_effort, required_resources, timeline,
  status, created_by
) VALUES
  -- Recommendation for Dog item: Remove
  (
    'rec_001',
    'item_caesar_salad',
    'perf_004',
    'Dog',
    'removal',
    'critical',
    'Remove Caesar Salad from Menu',
    'This item has consistently low profitability (20% CM) and low popularity (1.9% menu mix). It has been in decline stage for 75 days. Recommend immediate removal and replacement with a higher-margin appetizer.',
    'high',
    1425.00, -- Current revenue (loss opportunity)
    15.00, -- Potential margin improvement if replaced with better item
    ARRAY[
      'Notify chef and kitchen staff of removal date',
      'Use remaining inventory for staff meals or specials',
      'Replace menu slot with high-margin appetizer (Puzzle item promotion)',
      'Update POS system and printed menus',
      'Train staff on new item'
    ],
    'low', -- Easy to remove
    ARRAY['Kitchen coordination', 'Menu reprinting ($200)', 'Staff training (2 hours)'],
    'Immediate - within 7 days',
    'pending',
    'system'
  ),

  -- Recommendation for Plowhorse: Price Increase
  (
    'rec_002',
    'item_spaghetti_carb',
    'perf_002',
    'Plowhorse',
    'pricing',
    'high',
    'Increase Spaghetti Carbonara Price by 9%',
    'This popular item (14.4% menu mix) has low profitability (31.8% CM vs 58.6% average). Recommend increasing price from $22 to $24 to improve contribution margin. Based on price elasticity analysis, expect minimal volume impact due to high popularity.',
    'high',
    1440.00, -- Additional revenue: (24 - 22) × 720
    9.00, -- CM improvement: from 31.8% to 41.7%
    ARRAY[
      'Update price in POS system',
      'Reprint menu section',
      'Monitor sales volume for 14 days',
      'If volume drops >15%, consider $23 price point',
      'Evaluate results after 30 days'
    ],
    'low',
    ARRAY['POS configuration', 'Menu reprinting ($150)', 'Monitoring time (1 hr/week)'],
    'Within 7 days',
    'pending',
    'system'
  ),

  -- Recommendation for Puzzle: Promotion
  (
    'rec_003',
    'item_truffle_risotto',
    'perf_003',
    'Puzzle',
    'promotion',
    'medium',
    'Promote Truffle Risotto to Increase Visibility',
    'High-margin item (64.4% CM) with low popularity (3.6% menu mix). Recommend repositioning to top of mains section, adding professional food photography, and featuring as "Chef''s Special" for 30 days. Consider limited-time 10% discount to drive trial.',
    'medium',
    3600.00, -- Estimated revenue increase if sales double
    0.00, -- No margin change (already high)
    ARRAY[
      'Commission professional food photography',
      'Reposition to top of Main Courses section',
      'Add "Chef''s Special" designation',
      'Train servers to recommend actively',
      'Consider 30-day promotional pricing ($40 instead of $45)',
      'Monitor sales increase'
    ],
    'medium',
    ARRAY['Food photography ($500)', 'Menu redesign ($300)', 'Staff training (1 hour)', 'Promotional materials ($200)'],
    'Within 30 days',
    'pending',
    'system'
  ),

  -- Recommendation for Star: Maintain
  (
    'rec_004',
    'item_pizza_marg',
    'perf_001',
    'Star',
    'maintain',
    'low',
    'Maintain Margherita Pizza as Signature Item',
    'Top-performing item with high profitability (58.6% CM) and high popularity (17% menu mix). Recommend maintaining current price and quality. Feature prominently in marketing materials and menu placement. Consider creating premium variation (e.g., with burrata) at higher price point.',
    'high',
    5000.00, -- Revenue protection
    0.00, -- Maintain current margins
    ARRAY[
      'Keep prominent menu placement',
      'Ensure consistent quality and portion control',
      'Feature in social media and marketing',
      'Train new staff on preparation standards',
      'Consider premium variation (Burrata Margherita at $42)'
    ],
    'low',
    ARRAY['Quality monitoring', 'Marketing support', 'Staff training (ongoing)'],
    'Ongoing',
    'approved',
    'system'
  );
```

### 5.4 Competitors and Competitor Items (Sample)

```sql
INSERT INTO competitors (id, name, address, city, state, type, cuisine, price_range, is_direct_competitor, relevance_score, created_by, updated_by)
VALUES
  ('comp_001', 'Bella Italia', '123 Main St', 'San Francisco', 'CA', 'casual', 'Italian', '$$', true, 9, 'user_manager', 'user_manager'),
  ('comp_002', 'The Pasta House', '456 Market St', 'San Francisco', 'CA', 'casual', 'Italian', '$$', true, 8, 'user_manager', 'user_manager'),
  ('comp_003', 'Trattoria Rosa', '789 Union St', 'San Francisco', 'CA', 'fine_dining', 'Italian', '$$$', false, 6, 'user_manager', 'user_manager');

INSERT INTO competitor_items (
  id, competitor_id, competitor_name, item_name,
  our_menu_item_id, category_id,
  price, portion_size, source,
  created_by
) VALUES
  -- Bella Italia items
  ('comp_item_001', 'comp_001', 'Bella Italia', 'Margherita Pizza', 'item_pizza_marg', 'cat_02', 32.00, '12 inch', 'visit', 'user_manager'),
  ('comp_item_002', 'comp_001', 'Bella Italia', 'Spaghetti Carbonara', 'item_spaghetti_carb', 'cat_02', 24.00, 'Regular portion', 'visit', 'user_manager'),
  ('comp_item_003', 'comp_001', 'Bella Italia', 'Caesar Salad', 'item_caesar_salad', 'cat_01', 13.00, 'Regular portion', 'visit', 'user_manager'),

  -- The Pasta House items
  ('comp_item_004', 'comp_002', 'The Pasta House', 'Margherita Pizza', 'item_pizza_marg', 'cat_02', 34.00, '12 inch', 'website', 'user_manager'),
  ('comp_item_005', 'comp_002', 'The Pasta House', 'Carbonara Pasta', 'item_spaghetti_carb', 'cat_02', 22.00, 'Regular portion', 'website', 'user_manager'),

  -- Trattoria Rosa items (upscale)
  ('comp_item_006', 'comp_003', 'Trattoria Rosa', 'Truffle Risotto', 'item_truffle_risotto', 'cat_02', 52.00, 'Chef portion', 'menu', 'user_manager'),
  ('comp_item_007', 'comp_003', 'Trattoria Rosa', 'Margherita Napoletana', 'item_pizza_marg', 'cat_02', 38.00, '10 inch Neapolitan', 'menu', 'user_manager');
```

---
