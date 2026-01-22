/**
 * Wiki.js POS Integration & Permission Sub-Modules Import Script
 *
 * Imports the following documentation to Wiki.js:
 * - POS Integration (7 pages)
 * - Permission Management sub-modules:
 *   - Policies (7 pages)
 *   - Roles (7 pages)
 *   - Subscription (7 pages)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';
const DOCS_DIR = '/Users/peak/Documents/GitHub/carmen/docs/app/system-administration';

// Page definitions
const pages = [
  // ============================================
  // SYSTEM INTEGRATIONS - POS Integration
  // ============================================

  // POS Integration Index
  {
    path: 'system-administration/system-integrations/pos-integration',
    title: 'POS Integration',
    file: 'system-integrations/pos-integration/INDEX-pos-integration.md',
    description: 'Point-of-Sale system integration - Recipe mapping, transaction processing, and analytics',
    tags: ['system-administration', 'system-integrations', 'pos', 'integration']
  },
  {
    path: 'system-administration/system-integrations/pos-integration/business-requirements',
    title: 'Business Requirements - POS Integration',
    file: 'system-integrations/pos-integration/BR-pos-integration.md',
    description: 'Business requirements for POS integration',
    tags: ['system-administration', 'pos-integration', 'business-requirements']
  },
  {
    path: 'system-administration/system-integrations/pos-integration/use-cases',
    title: 'Use Cases - POS Integration',
    file: 'system-integrations/pos-integration/UC-pos-integration.md',
    description: 'Use cases for POS integration',
    tags: ['system-administration', 'pos-integration', 'use-cases']
  },
  {
    path: 'system-administration/system-integrations/pos-integration/data-dictionary',
    title: 'Data Dictionary - POS Integration',
    file: 'system-integrations/pos-integration/DD-pos-integration.md',
    description: 'Data dictionary for POS integration',
    tags: ['system-administration', 'pos-integration', 'data-dictionary']
  },
  {
    path: 'system-administration/system-integrations/pos-integration/technical-specification',
    title: 'Technical Specification - POS Integration',
    file: 'system-integrations/pos-integration/TS-pos-integration.md',
    description: 'Technical specification for POS integration',
    tags: ['system-administration', 'pos-integration', 'technical-specification']
  },
  {
    path: 'system-administration/system-integrations/pos-integration/flow-diagrams',
    title: 'Flow Diagrams - POS Integration',
    file: 'system-integrations/pos-integration/FD-pos-integration.md',
    description: 'Flow diagrams for POS integration',
    tags: ['system-administration', 'pos-integration', 'flow-diagrams']
  },
  {
    path: 'system-administration/system-integrations/pos-integration/validations',
    title: 'Validations - POS Integration',
    file: 'system-integrations/pos-integration/VAL-pos-integration.md',
    description: 'Validation rules for POS integration',
    tags: ['system-administration', 'pos-integration', 'validations']
  },

  // ============================================
  // PERMISSION MANAGEMENT - Policies
  // ============================================

  {
    path: 'system-administration/permission-management/policies',
    title: 'Policy Management',
    file: 'permission-management/policies/INDEX-policies.md',
    description: 'RBAC and ABAC policy configuration and management',
    tags: ['system-administration', 'permission-management', 'policies']
  },
  {
    path: 'system-administration/permission-management/policies/business-requirements',
    title: 'Business Requirements - Policy Management',
    file: 'permission-management/policies/BR-policies.md',
    description: 'Business requirements for policy management',
    tags: ['system-administration', 'policies', 'business-requirements']
  },
  {
    path: 'system-administration/permission-management/policies/use-cases',
    title: 'Use Cases - Policy Management',
    file: 'permission-management/policies/UC-policies.md',
    description: 'Use cases for policy management',
    tags: ['system-administration', 'policies', 'use-cases']
  },
  {
    path: 'system-administration/permission-management/policies/data-dictionary',
    title: 'Data Dictionary - Policy Management',
    file: 'permission-management/policies/DD-policies.md',
    description: 'Data dictionary for policy management',
    tags: ['system-administration', 'policies', 'data-dictionary']
  },
  {
    path: 'system-administration/permission-management/policies/technical-specification',
    title: 'Technical Specification - Policy Management',
    file: 'permission-management/policies/TS-policies.md',
    description: 'Technical specification for policy management',
    tags: ['system-administration', 'policies', 'technical-specification']
  },
  {
    path: 'system-administration/permission-management/policies/flow-diagrams',
    title: 'Flow Diagrams - Policy Management',
    file: 'permission-management/policies/FD-policies.md',
    description: 'Flow diagrams for policy management',
    tags: ['system-administration', 'policies', 'flow-diagrams']
  },
  {
    path: 'system-administration/permission-management/policies/validations',
    title: 'Validations - Policy Management',
    file: 'permission-management/policies/VAL-policies.md',
    description: 'Validation rules for policy management',
    tags: ['system-administration', 'policies', 'validations']
  },

  // ============================================
  // PERMISSION MANAGEMENT - Roles
  // ============================================

  {
    path: 'system-administration/permission-management/roles',
    title: 'Role Management',
    file: 'permission-management/roles/INDEX-roles.md',
    description: 'User role configuration with hierarchy and inheritance',
    tags: ['system-administration', 'permission-management', 'roles']
  },
  {
    path: 'system-administration/permission-management/roles/business-requirements',
    title: 'Business Requirements - Role Management',
    file: 'permission-management/roles/BR-roles.md',
    description: 'Business requirements for role management',
    tags: ['system-administration', 'roles', 'business-requirements']
  },
  {
    path: 'system-administration/permission-management/roles/use-cases',
    title: 'Use Cases - Role Management',
    file: 'permission-management/roles/UC-roles.md',
    description: 'Use cases for role management',
    tags: ['system-administration', 'roles', 'use-cases']
  },
  {
    path: 'system-administration/permission-management/roles/data-dictionary',
    title: 'Data Dictionary - Role Management',
    file: 'permission-management/roles/DD-roles.md',
    description: 'Data dictionary for role management',
    tags: ['system-administration', 'roles', 'data-dictionary']
  },
  {
    path: 'system-administration/permission-management/roles/technical-specification',
    title: 'Technical Specification - Role Management',
    file: 'permission-management/roles/TS-roles.md',
    description: 'Technical specification for role management',
    tags: ['system-administration', 'roles', 'technical-specification']
  },
  {
    path: 'system-administration/permission-management/roles/flow-diagrams',
    title: 'Flow Diagrams - Role Management',
    file: 'permission-management/roles/FD-roles.md',
    description: 'Flow diagrams for role management',
    tags: ['system-administration', 'roles', 'flow-diagrams']
  },
  {
    path: 'system-administration/permission-management/roles/validations',
    title: 'Validations - Role Management',
    file: 'permission-management/roles/VAL-roles.md',
    description: 'Validation rules for role management',
    tags: ['system-administration', 'roles', 'validations']
  },

  // ============================================
  // PERMISSION MANAGEMENT - Subscription
  // ============================================

  {
    path: 'system-administration/permission-management/subscription',
    title: 'Subscription Settings',
    file: 'permission-management/subscription/INDEX-subscription.md',
    description: 'Subscription packages and feature activation (placeholder)',
    tags: ['system-administration', 'permission-management', 'subscription']
  },
  {
    path: 'system-administration/permission-management/subscription/business-requirements',
    title: 'Business Requirements - Subscription Settings',
    file: 'permission-management/subscription/BR-subscription.md',
    description: 'Business requirements for subscription settings',
    tags: ['system-administration', 'subscription', 'business-requirements']
  },
  {
    path: 'system-administration/permission-management/subscription/use-cases',
    title: 'Use Cases - Subscription Settings',
    file: 'permission-management/subscription/UC-subscription.md',
    description: 'Use cases for subscription settings',
    tags: ['system-administration', 'subscription', 'use-cases']
  },
  {
    path: 'system-administration/permission-management/subscription/data-dictionary',
    title: 'Data Dictionary - Subscription Settings',
    file: 'permission-management/subscription/DD-subscription.md',
    description: 'Data dictionary for subscription settings',
    tags: ['system-administration', 'subscription', 'data-dictionary']
  },
  {
    path: 'system-administration/permission-management/subscription/technical-specification',
    title: 'Technical Specification - Subscription Settings',
    file: 'permission-management/subscription/TS-subscription.md',
    description: 'Technical specification for subscription settings',
    tags: ['system-administration', 'subscription', 'technical-specification']
  },
  {
    path: 'system-administration/permission-management/subscription/flow-diagrams',
    title: 'Flow Diagrams - Subscription Settings',
    file: 'permission-management/subscription/FD-subscription.md',
    description: 'Flow diagrams for subscription settings',
    tags: ['system-administration', 'subscription', 'flow-diagrams']
  },
  {
    path: 'system-administration/permission-management/subscription/validations',
    title: 'Validations - Subscription Settings',
    file: 'permission-management/subscription/VAL-subscription.md',
    description: 'Validation rules for subscription settings',
    tags: ['system-administration', 'subscription', 'validations']
  },

  // ============================================
  // Updated Index Pages
  // ============================================

  {
    path: 'system-administration/system-integrations',
    title: 'System Integrations',
    file: 'system-integrations/INDEX-system-integrations.md',
    description: 'External system integrations and API management',
    tags: ['system-administration', 'system-integrations', 'documentation']
  },
  {
    path: 'system-administration/permission-management',
    title: 'Permission Management',
    file: 'permission-management/INDEX-permission-management.md',
    description: 'Role-based access control and permission management',
    tags: ['system-administration', 'permission-management', 'documentation']
  }
];

// Check if page exists
async function checkPageExists(pagePath) {
  const query = `
    query {
      pages {
        single(path: "${pagePath}", locale: "en") {
          id
          path
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    return result.data?.pages?.single?.id || null;
  } catch (error) {
    return null;
  }
}

// Create a new page
async function createPage(page) {
  const filePath = path.join(DOCS_DIR, page.file);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${page.file}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  // Remove any null bytes and control characters
  content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  const mutation = `
    mutation {
      pages {
        create(
          content: ${JSON.stringify(content)}
          description: ${JSON.stringify(page.description)}
          editor: "markdown"
          isPublished: true
          isPrivate: false
          locale: "en"
          path: ${JSON.stringify(page.path)}
          tags: ${JSON.stringify(page.tags)}
          title: ${JSON.stringify(page.title)}
        ) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
          page {
            id
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ query: mutation })
    });

    const result = await response.json();

    if (result.data?.pages?.create?.responseResult?.succeeded) {
      console.log(`   ✅ Created: ${page.title} (ID: ${result.data.pages.create.page.id})`);
      return true;
    } else {
      console.log(`   ❌ Failed to create: ${result.data?.pages?.create?.responseResult?.message || JSON.stringify(result.errors || result)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Update existing page
async function updatePage(pageId, page) {
  const filePath = path.join(DOCS_DIR, page.file);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${page.file}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  // Remove any null bytes and control characters
  content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  const mutation = `
    mutation {
      pages {
        update(
          id: ${pageId}
          content: ${JSON.stringify(content)}
          description: ${JSON.stringify(page.description)}
          editor: "markdown"
          isPublished: true
          isPrivate: false
          locale: "en"
          path: ${JSON.stringify(page.path)}
          tags: ${JSON.stringify(page.tags)}
          title: ${JSON.stringify(page.title)}
        ) {
          responseResult {
            succeeded
            errorCode
            slug
            message
          }
          page {
            id
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ query: mutation })
    });

    const result = await response.json();

    if (result.data?.pages?.update?.responseResult?.succeeded) {
      console.log(`   ✅ Updated: ${page.title} (ID: ${pageId})`);
      return true;
    } else {
      console.log(`   ❌ Failed to update: ${result.data?.pages?.update?.responseResult?.message || JSON.stringify(result.errors || result)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Main import function
async function importPages() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Wiki.js POS Integration & Permission Sub-Modules Import      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📁 Source directory: ${DOCS_DIR}`);
  console.log(`📝 Total pages to import: ${pages.length}`);
  console.log('');
  console.log('Modules to import:');
  console.log('  • POS Integration (7 pages)');
  console.log('  • Policy Management (7 pages)');
  console.log('  • Role Management (7 pages)');
  console.log('  • Subscription Settings (7 pages)');
  console.log('  • Updated Index Pages (2 pages)');
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const page of pages) {
    console.log(`📄 Processing: ${page.path}`);

    // Check if page already exists
    const existingId = await checkPageExists(page.path);

    if (existingId) {
      // Update existing page
      const success = await updatePage(existingId, page);
      if (success) successCount++;
      else failCount++;
    } else {
      // Create new page
      const success = await createPage(page);
      if (success) successCount++;
      else failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                       Import Summary                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${pages.length}`);
  console.log('');
  console.log('🔗 Wiki.js URL: http://dev.blueledgers.com:3993');

  if (failCount > 0) {
    console.log('');
    console.log('⚠️  Some pages failed to import. Please check the errors above.');
    process.exit(1);
  }
}

// Run the import
importPages().catch(console.error);
