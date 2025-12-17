# Carmen ERP Accessibility Test Implementation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

This document outlines the comprehensive accessibility testing setup implemented for the Carmen ERP system using Playwright. The tests are designed to verify that all pages in the application are accessible and can be navigated to without errors.

## Test Implementation

### 1. Test Suite Structure

**Location**: `/tests/accessibility/page-accessibility.spec.ts`

The accessibility test suite includes:
- Comprehensive route testing across all modules
- Authentication state management
- Error detection and reporting
- Detailed accessibility metrics

### 2. Routes Tested

The test suite covers **130+ routes** across all major modules:

#### Core Application Routes
- Authentication (`/login`, `/signup`, `/signin`)
- Dashboard (`/dashboard`)
- Profile management (`/profile`, `/edit-profile`)

#### Business Module Routes
- **Inventory Management** (25+ routes)
  - Physical counts, spot checks, stock overview
  - Inventory adjustments, fractional inventory
  - Stock cards, aging reports, period-end
  
- **Procurement** (20+ routes)
  - Purchase requests and orders
  - Goods received notes, credit notes
  - Vendor comparison, approvals
  
- **Vendor Management** (15+ routes)
  - Vendor profiles, pricelists, campaigns
  - Templates, portal functionality
  
- **Product Management** (8+ routes)
  - Product catalog, categories, units
  
- **Operational Planning** (10+ routes)
  - Recipe management, cuisine types, categories
  
- **Store Operations** (8+ routes)
  - Store requisitions, wastage reporting, stock replenishment
  
- **System Administration** (30+ routes)
  - User management, workflows, integrations
  - POS mapping, reports, business rules
  
- **Finance** (8+ routes)
  - Account mapping, currency management, exchange rates
  
- **Reporting & Analytics** (5+ routes)
  - Consumption analytics, operational reports

#### Dynamic Routes
The test suite also includes sample dynamic routes with mock IDs:
- Detail pages (`/procurement/purchase-requests/PR-2401-0001`)
- Edit forms (`/vendor-management/vendors/vendor-001/edit`)
- Configuration pages (`/system-administration/workflow/workflow-configuration/workflow-001`)

### 3. Test Features

#### Authentication Simulation
```typescript
async function mockAuthentication(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-001',
      name: 'Test User',
      email: 'test@example.com',
      role: 'staff',
      department: 'procurement',
      location: 'main-kitchen',
      permissions: ['read', 'write', 'approve']
    }));
    
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('selectedBusinessUnit', 'main-unit');
  });
}
```

#### Error Detection
The test suite detects multiple types of errors:
- HTTP status codes (4xx, 5xx)
- Error text indicators ("Error", "404")
- Next.js error boundaries
- Application error pages

#### Accessibility Validation
```typescript
async function checkPageAccessibility(page: Page, route: string) {
  // Navigate with proper timeout and wait conditions
  const response = await page.goto(route, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Check for error indicators
  const hasErrorText = await page.locator('text=Error').count() > 0;
  const has404Text = await page.locator('text=404').count() > 0;
  const hasErrorPage = await page.locator('[data-testid="error-page"]').count() > 0;
  const hasNextError = await page.locator('text=Application error').count() > 0;
  
  // Determine accessibility status
  return {
    url: route,
    accessible: response?.ok() && !hasErrorText && !has404Text && !hasErrorPage && !hasNextError,
    statusCode: response?.status(),
    redirected: finalUrl !== expectedUrl,
    finalUrl: redirected ? finalUrl : undefined,
  };
}
```

### 4. Test Categories

#### Public Routes
Routes that should be accessible without authentication:
- Landing page, login, signup pages
- Public documentation or help pages

#### Protected Routes
Routes requiring authentication:
- Dashboard, all business modules
- User profile and settings
- Administrative functions

#### Special Routes
Routes with expected redirect behavior:
- Root path (`/`) - may redirect to login or dashboard
- Business unit selector - may redirect if already selected

#### Dynamic Routes
Routes with parameter placeholders:
- Detail pages with specific IDs
- Edit forms with entity references
- Configuration pages with workflow IDs

### 5. Reporting Features

#### Real-time Console Logging
```
✅ Public route /login is accessible
❌ Protected route /invalid-route is not accessible: HTTP 404
🔄 Redirected routes: / → /dashboard
```

#### Detailed JSON Report
Generated at `test-results/accessibility-report.json`:
```json
{
  "timestamp": "2025-08-22T05:30:00.000Z",
  "summary": {
    "total": 130,
    "accessible": 125,
    "inaccessible": 3,
    "redirected": 2,
    "successRate": "96.15%"
  },
  "results": [...]
}
```

## Configuration

### Playwright Configuration
**File**: `playwright.config.js`

Key settings for accessibility testing:
- Base URL: `http://localhost:3000`
- Single worker for consistent results
- Extended timeouts for complex pages
- Network idle wait condition
- Screenshot capture on failures

### Test Execution

#### Run Accessibility Tests
```bash
# Run all accessibility tests
npx playwright test tests/accessibility/page-accessibility.spec.ts

# Run on specific browser
npx playwright test tests/accessibility/page-accessibility.spec.ts --project=desktop-chrome

# Run with detailed output
npx playwright test tests/accessibility/page-accessibility.spec.ts --reporter=line
```

#### View Results
```bash
# Open HTML report
npx playwright show-report

# View JSON report
cat test-results/accessibility-report.json
```

## Benefits

### 1. Comprehensive Coverage
- Tests all 130+ application routes
- Covers all business modules and functions
- Includes both static and dynamic routes

### 2. Early Error Detection
- Identifies broken routes before production
- Detects configuration issues
- Validates authentication flows

### 3. Continuous Monitoring
- Can be integrated into CI/CD pipeline
- Provides trend analysis over time
- Alerts on accessibility regressions

### 4. Detailed Reporting
- Clear success/failure indicators
- Detailed error information
- JSON export for external analysis

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Accessibility Tests
on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run dev &
      - run: npx playwright test tests/accessibility/page-accessibility.spec.ts
      - uses: actions/upload-artifact@v3
        with:
          name: accessibility-report
          path: test-results/
```

## Future Enhancements

### 1. WCAG Compliance Testing
- Add actual accessibility audits using @axe-core/playwright
- Check color contrast ratios
- Validate keyboard navigation
- Test screen reader compatibility

### 2. Performance Integration
- Measure page load times during accessibility tests
- Track Core Web Vitals for each route
- Identify performance bottlenecks

### 3. Visual Regression Testing
- Capture screenshots of all accessible pages
- Compare against baseline images
- Detect unintended UI changes

### 4. Mobile Accessibility
- Test accessibility on mobile viewports
- Validate touch target sizes
- Check mobile-specific navigation patterns

## Maintenance

### Regular Updates
1. **Route Updates**: Add new routes as features are developed
2. **Authentication Updates**: Modify mock authentication as user model evolves
3. **Error Detection**: Update error patterns as application error handling changes
4. **Reporting**: Enhance reports based on team feedback

### Troubleshooting
1. **Timeout Issues**: Increase timeout values for slow-loading pages
2. **Authentication Failures**: Verify mock authentication data matches application requirements
3. **False Positives**: Review error detection patterns and adjust as needed
4. **Performance**: Optimize test execution for large route sets

## Conclusion

The Carmen ERP accessibility test suite provides comprehensive coverage of all application routes, ensuring that pages are accessible and functional. With 130+ routes tested across all business modules, this implementation provides:

- **High Coverage**: Tests all major application functionality
- **Early Detection**: Identifies issues before they reach production
- **Detailed Reporting**: Provides actionable insights for development teams
- **CI/CD Integration**: Supports automated testing workflows

The test suite is designed to grow with the application, providing ongoing validation of accessibility and functionality as new features are developed.