/**
 * Wiki.js System Administration Module Documentation Import Script
 *
 * Imports all system administration sub-module documentation to Wiki.js
 * Skips business-rules sub-module as requested
 *
 * Sub-modules:
 * - delivery-points (1 page - only BR exists)
 * - location-management (6 pages)
 * - permission-management (6 pages)
 * - settings (6 pages)
 * - system-integrations (6 pages)
 * - user-management (6 pages)
 * - workflow (6 pages)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzYzOTc5OTYwLCJleHAiOjE3OTU1Mzc1NjAsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.hRZIwCPcBSorxd5S23Bx_HNsWdGg8u_4T5blA3UDn_8oPw5WbEkTQcaPcfzx8j8uTSEtbXcZfZR4_dfTJ5MZ3lLoU2P0pRLHaRw6_6YpQMcMvse_t0Vwk24UzVrpvqf-jCcf6p_aUMjXV_gKYPfi4oF_YUem65VWEfm3bmbKxuSFGpVI5LR-lCyVQT92_vvbJ-ZJwZHUGLNs56mlWjjVsh3QIHvy2tO8BzmxpDRzICtV8lqJECRKRQrZTL1yAaMIKqmlOBy9pu955CZSq7ulQECtDdKsi1Ehx1G9ka5ZcvHVskJ2oLzZhAyrTozwJm282eHEkZ-8ybghAcvkwgHSSA';
const DOCS_DIR = '/Users/peak/Documents/GitHub/carmen/docs/app/system-administration';

// Page definitions for system administration sub-modules (excluding business-rules)
const pages = [
  // System Administration Index
  {
    path: 'system-administration',
    title: 'System Administration',
    file: null, // Will create index content
    description: 'System Administration module documentation - User management, permissions, settings, workflows, and integrations',
    isIndex: true
  },

  // Delivery Points (only BR exists)
  {
    path: 'system-administration/delivery-points',
    title: 'Delivery Points',
    file: 'delivery-points/BR-delivery-points.md',
    description: 'Delivery points configuration and management'
  },

  // Location Management
  {
    path: 'system-administration/location-management',
    title: 'Location Management',
    file: null,
    description: 'Location and site management documentation',
    isIndex: true,
    indexFor: 'location-management'
  },
  {
    path: 'system-administration/location-management/business-requirements',
    title: 'Business Requirements - Location Management',
    file: 'location-management/BR-location-management.md',
    description: 'Business requirements for location management'
  },
  {
    path: 'system-administration/location-management/use-cases',
    title: 'Use Cases - Location Management',
    file: 'location-management/UC-location-management.md',
    description: 'Use cases for location management'
  },
  {
    path: 'system-administration/location-management/technical-specification',
    title: 'Technical Specification - Location Management',
    file: 'location-management/TS-location-management.md',
    description: 'Technical specifications for location management'
  },
  {
    path: 'system-administration/location-management/data-definition',
    title: 'Data Definition - Location Management',
    file: 'location-management/DD-location-management.md',
    description: 'Data definitions and schemas for location management'
  },
  {
    path: 'system-administration/location-management/flow-diagrams',
    title: 'Flow Diagrams - Location Management',
    file: 'location-management/FD-location-management.md',
    description: 'Process and data flow diagrams for location management'
  },
  {
    path: 'system-administration/location-management/validations',
    title: 'Validations - Location Management',
    file: 'location-management/VAL-location-management.md',
    description: 'Validation rules for location management'
  },

  // Permission Management
  {
    path: 'system-administration/permission-management',
    title: 'Permission Management',
    file: null,
    description: 'Role-based access control and permission management',
    isIndex: true,
    indexFor: 'permission-management'
  },
  {
    path: 'system-administration/permission-management/business-requirements',
    title: 'Business Requirements - Permission Management',
    file: 'permission-management/BR-permission-management.md',
    description: 'Business requirements for permission management'
  },
  {
    path: 'system-administration/permission-management/use-cases',
    title: 'Use Cases - Permission Management',
    file: 'permission-management/UC-permission-management.md',
    description: 'Use cases for permission management'
  },
  {
    path: 'system-administration/permission-management/technical-specification',
    title: 'Technical Specification - Permission Management',
    file: 'permission-management/TS-permission-management.md',
    description: 'Technical specifications for permission management'
  },
  {
    path: 'system-administration/permission-management/data-definition',
    title: 'Data Definition - Permission Management',
    file: 'permission-management/DD-permission-management.md',
    description: 'Data definitions and schemas for permission management'
  },
  {
    path: 'system-administration/permission-management/flow-diagrams',
    title: 'Flow Diagrams - Permission Management',
    file: 'permission-management/FD-permission-management.md',
    description: 'Process and data flow diagrams for permission management'
  },
  {
    path: 'system-administration/permission-management/validations',
    title: 'Validations - Permission Management',
    file: 'permission-management/VAL-permission-management.md',
    description: 'Validation rules for permission management'
  },

  // Settings
  {
    path: 'system-administration/settings',
    title: 'Settings',
    file: null,
    description: 'System settings and configuration management',
    isIndex: true,
    indexFor: 'settings'
  },
  {
    path: 'system-administration/settings/business-requirements',
    title: 'Business Requirements - Settings',
    file: 'settings/BR-settings.md',
    description: 'Business requirements for system settings'
  },
  {
    path: 'system-administration/settings/use-cases',
    title: 'Use Cases - Settings',
    file: 'settings/UC-settings.md',
    description: 'Use cases for system settings'
  },
  {
    path: 'system-administration/settings/technical-specification',
    title: 'Technical Specification - Settings',
    file: 'settings/TS-settings.md',
    description: 'Technical specifications for system settings'
  },
  {
    path: 'system-administration/settings/data-definition',
    title: 'Data Definition - Settings',
    file: 'settings/DD-settings.md',
    description: 'Data definitions and schemas for system settings'
  },
  {
    path: 'system-administration/settings/flow-diagrams',
    title: 'Flow Diagrams - Settings',
    file: 'settings/FD-settings.md',
    description: 'Process and data flow diagrams for system settings'
  },
  {
    path: 'system-administration/settings/validations',
    title: 'Validations - Settings',
    file: 'settings/VAL-settings.md',
    description: 'Validation rules for system settings'
  },

  // System Integrations
  {
    path: 'system-administration/system-integrations',
    title: 'System Integrations',
    file: null,
    description: 'External system integrations and API management',
    isIndex: true,
    indexFor: 'system-integrations'
  },
  {
    path: 'system-administration/system-integrations/business-requirements',
    title: 'Business Requirements - System Integrations',
    file: 'system-integrations/BR-system-integrations.md',
    description: 'Business requirements for system integrations'
  },
  {
    path: 'system-administration/system-integrations/use-cases',
    title: 'Use Cases - System Integrations',
    file: 'system-integrations/UC-system-integrations.md',
    description: 'Use cases for system integrations'
  },
  {
    path: 'system-administration/system-integrations/technical-specification',
    title: 'Technical Specification - System Integrations',
    file: 'system-integrations/TS-system-integrations.md',
    description: 'Technical specifications for system integrations'
  },
  {
    path: 'system-administration/system-integrations/data-definition',
    title: 'Data Definition - System Integrations',
    file: 'system-integrations/DD-system-integrations.md',
    description: 'Data definitions and schemas for system integrations'
  },
  {
    path: 'system-administration/system-integrations/flow-diagrams',
    title: 'Flow Diagrams - System Integrations',
    file: 'system-integrations/FD-system-integrations.md',
    description: 'Process and data flow diagrams for system integrations'
  },
  {
    path: 'system-administration/system-integrations/validations',
    title: 'Validations - System Integrations',
    file: 'system-integrations/VAL-system-integrations.md',
    description: 'Validation rules for system integrations'
  },

  // User Management
  {
    path: 'system-administration/user-management',
    title: 'User Management',
    file: null,
    description: 'User accounts, profiles, and authentication management',
    isIndex: true,
    indexFor: 'user-management'
  },
  {
    path: 'system-administration/user-management/business-requirements',
    title: 'Business Requirements - User Management',
    file: 'user-management/BR-user-management.md',
    description: 'Business requirements for user management'
  },
  {
    path: 'system-administration/user-management/use-cases',
    title: 'Use Cases - User Management',
    file: 'user-management/UC-user-management.md',
    description: 'Use cases for user management'
  },
  {
    path: 'system-administration/user-management/technical-specification',
    title: 'Technical Specification - User Management',
    file: 'user-management/TS-user-management.md',
    description: 'Technical specifications for user management'
  },
  {
    path: 'system-administration/user-management/data-definition',
    title: 'Data Definition - User Management',
    file: 'user-management/DD-user-management.md',
    description: 'Data definitions and schemas for user management'
  },
  {
    path: 'system-administration/user-management/flow-diagrams',
    title: 'Flow Diagrams - User Management',
    file: 'user-management/FD-user-management.md',
    description: 'Process and data flow diagrams for user management'
  },
  {
    path: 'system-administration/user-management/validations',
    title: 'Validations - User Management',
    file: 'user-management/VAL-user-management.md',
    description: 'Validation rules for user management'
  },

  // Workflow
  {
    path: 'system-administration/workflow',
    title: 'Workflow',
    file: null,
    description: 'Approval workflows and process automation',
    isIndex: true,
    indexFor: 'workflow'
  },
  {
    path: 'system-administration/workflow/business-requirements',
    title: 'Business Requirements - Workflow',
    file: 'workflow/BR-workflow.md',
    description: 'Business requirements for workflow management'
  },
  {
    path: 'system-administration/workflow/use-cases',
    title: 'Use Cases - Workflow',
    file: 'workflow/UC-workflow.md',
    description: 'Use cases for workflow management'
  },
  {
    path: 'system-administration/workflow/technical-specification',
    title: 'Technical Specification - Workflow',
    file: 'workflow/TS-workflow.md',
    description: 'Technical specifications for workflow management'
  },
  {
    path: 'system-administration/workflow/data-definition',
    title: 'Data Definition - Workflow',
    file: 'workflow/DD-workflow.md',
    description: 'Data definitions and schemas for workflow management'
  },
  {
    path: 'system-administration/workflow/flow-diagrams',
    title: 'Flow Diagrams - Workflow',
    file: 'workflow/FD-workflow.md',
    description: 'Process and data flow diagrams for workflow management'
  },
  {
    path: 'system-administration/workflow/validations',
    title: 'Validations - Workflow',
    file: 'workflow/VAL-workflow.md',
    description: 'Validation rules for workflow management'
  }
];

// Generate index content for main system administration page
function generateMainIndexContent() {
  return `# System Administration

## Overview

The System Administration module provides comprehensive tools for managing system configuration, user access, permissions, workflows, and integrations across the Carmen ERP platform.

## Sub-Modules

### [Delivery Points](./system-administration/delivery-points)
Configuration and management of delivery points for logistics and receiving operations.

### [Location Management](./system-administration/location-management)
Multi-site and location configuration including warehouses, stores, and operational areas.

### [Permission Management](./system-administration/permission-management)
Role-based access control (RBAC) system for managing user permissions and security policies.

### [Settings](./system-administration/settings)
System-wide configuration settings and application preferences.

### [System Integrations](./system-administration/system-integrations)
External system connections, API management, and third-party integrations.

### [User Management](./system-administration/user-management)
User account lifecycle management, authentication, and profile administration.

### [Workflow](./system-administration/workflow)
Approval workflow configuration, process automation, and business rule orchestration.

## Documentation Structure

Each sub-module contains:
- **Business Requirements (BR)** - Functional requirements and business rules
- **Use Cases (UC)** - User scenarios and interaction flows
- **Technical Specification (TS)** - Implementation details and architecture
- **Data Definition (DD)** - Database schemas and data models
- **Flow Diagrams (FD)** - Visual process and data flows
- **Validations (VAL)** - Input validation and business rule enforcement

## Related Modules

- [Finance](/en/finance) - Financial management and accounting
- [Inventory Management](/en/inventory-management) - Stock and inventory control
- [Procurement](/en/procurement) - Purchase orders and vendor management
`;
}

// Generate index content for sub-modules
function generateSubModuleIndexContent(moduleName, moduleTitle) {
  const docTypes = [
    { name: 'Business Requirements', path: 'business-requirements', desc: 'Functional requirements and business rules' },
    { name: 'Use Cases', path: 'use-cases', desc: 'User scenarios and interaction flows' },
    { name: 'Technical Specification', path: 'technical-specification', desc: 'Implementation details and architecture' },
    { name: 'Data Definition', path: 'data-definition', desc: 'Database schemas and data models' },
    { name: 'Flow Diagrams', path: 'flow-diagrams', desc: 'Visual process and data flows' },
    { name: 'Validations', path: 'validations', desc: 'Input validation and business rule enforcement' }
  ];

  let content = `# ${moduleTitle}

## Overview

Documentation for the ${moduleTitle} sub-module within System Administration.

## Documentation

`;

  docTypes.forEach(doc => {
    content += `### [${doc.name}](./${moduleName}/${doc.path})
${doc.desc}

`;
  });

  content += `## Related Documentation

- [System Administration Index](../system-administration)
`;

  return content;
}

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
  let content;

  if (page.isIndex && !page.indexFor) {
    content = generateMainIndexContent();
  } else if (page.isIndex && page.indexFor) {
    const moduleTitle = page.title;
    content = generateSubModuleIndexContent(page.indexFor, moduleTitle);
  } else {
    const filePath = path.join(DOCS_DIR, page.file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${page.file}`);
      return false;
    }
    content = fs.readFileSync(filePath, 'utf8');
    // Remove any null bytes and control characters
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

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
          tags: ["system-administration", "documentation"]
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
  let content;

  if (page.isIndex && !page.indexFor) {
    content = generateMainIndexContent();
  } else if (page.isIndex && page.indexFor) {
    const moduleTitle = page.title;
    content = generateSubModuleIndexContent(page.indexFor, moduleTitle);
  } else {
    const filePath = path.join(DOCS_DIR, page.file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${page.file}`);
      return false;
    }
    content = fs.readFileSync(filePath, 'utf8');
    // Remove any null bytes and control characters
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

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
          tags: ["system-administration", "documentation"]
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
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Wiki.js System Administration Documentation Import       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📁 Source directory: ${DOCS_DIR}`);
  console.log(`📝 Total pages to import: ${pages.length}`);
  console.log('');
  console.log('Sub-modules (excluding business-rules):');
  console.log('  • Delivery Points (1 page)');
  console.log('  • Location Management (7 pages)');
  console.log('  • Permission Management (7 pages)');
  console.log('  • Settings (7 pages)');
  console.log('  • System Integrations (7 pages)');
  console.log('  • User Management (7 pages)');
  console.log('  • Workflow (7 pages)');
  console.log('  • System Administration Index (1 page)');
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
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                     Import Summary                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${pages.length}`);

  if (failCount > 0) {
    console.log('');
    console.log('⚠️  Some pages failed to import. Please check the errors above.');
    process.exit(1);
  }
}

// Run the import
importPages().catch(console.error);
