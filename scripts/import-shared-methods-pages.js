/**
 * Wiki.js Shared Methods Module Documentation Import Script
 *
 * Imports all shared-methods sub-module documentation to Wiki.js
 *
 * Sub-modules:
 * - inventory-operations (1 page)
 * - inventory-valuation (multiple pages including SM, BR, UC, DD, FD, VAL, API docs, guides)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzYzOTc5OTYwLCJleHAiOjE3OTU1Mzc1NjAsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.hRZIwCPcBSorxd5S23Bx_HNsWdGg8u_4T5blA3UDn_8oPw5WbEkTQcaPcfzx8j8uTSEtbXcZfZR4_dfTJ5MZ3lLoU2P0pRLHaRw6_6YpQMcMvse_t0Vwk24UzVrpvqf-jCcf6p_aUMjXV_gKYPfi4oF_YUem65VWEfm3bmbKxuSFGpVI5LR-lCyVQT92_vvbJ-ZJwZHUGLNs56mlWjjVsh3QIHvy2tO8BzmxpDRzICtV8lqJECRKRQrZTL1yAaMIKqmlOBy9pu955CZSq7ulQECtDdKsi1Ehx1G9ka5ZcvHVskJ2oLzZhAyrTozwJm282eHEkZ-8ybghAcvkwgHSSA';
const DOCS_DIR = '/Users/peak/Documents/GitHub/carmen/docs/app/shared-methods';

// Page definitions for shared-methods sub-modules
const pages = [
  // Shared Methods Index
  {
    path: 'shared-methods',
    title: 'Shared Methods',
    file: 'README.md',
    description: 'Shared methods and reusable business logic documentation'
  },

  // Inventory Operations
  {
    path: 'shared-methods/inventory-operations',
    title: 'Inventory Operations',
    file: 'inventory-operations/SM-inventory-operations.md',
    description: 'Shared methods for inventory operations'
  },

  // Inventory Valuation - Index
  {
    path: 'shared-methods/inventory-valuation',
    title: 'Inventory Valuation',
    file: null,
    description: 'Inventory valuation methods, costing, and period management',
    isIndex: true,
    indexFor: 'inventory-valuation'
  },

  // Inventory Valuation - Core Documentation
  {
    path: 'shared-methods/inventory-valuation/business-requirements',
    title: 'Business Requirements - Inventory Valuation',
    file: 'inventory-valuation/BR-inventory-valuation.md',
    description: 'Business requirements for inventory valuation'
  },
  {
    path: 'shared-methods/inventory-valuation/use-cases',
    title: 'Use Cases - Inventory Valuation',
    file: 'inventory-valuation/UC-inventory-valuation.md',
    description: 'Use cases for inventory valuation'
  },
  {
    path: 'shared-methods/inventory-valuation/data-definition',
    title: 'Data Definition - Inventory Valuation',
    file: 'inventory-valuation/DD-inventory-valuation.md',
    description: 'Data definitions and schemas for inventory valuation'
  },
  {
    path: 'shared-methods/inventory-valuation/flow-diagrams',
    title: 'Flow Diagrams - Inventory Valuation',
    file: 'inventory-valuation/FD-inventory-valuation.md',
    description: 'Process and data flow diagrams for inventory valuation'
  },
  {
    path: 'shared-methods/inventory-valuation/validations',
    title: 'Validations - Inventory Valuation',
    file: 'inventory-valuation/VAL-inventory-valuation.md',
    description: 'Validation rules for inventory valuation'
  },

  // Inventory Valuation - Shared Methods
  {
    path: 'shared-methods/inventory-valuation/costing-methods',
    title: 'Costing Methods',
    file: 'inventory-valuation/SM-costing-methods.md',
    description: 'Shared methods for inventory costing calculations'
  },
  {
    path: 'shared-methods/inventory-valuation/inventory-valuation-methods',
    title: 'Inventory Valuation Methods',
    file: 'inventory-valuation/SM-inventory-valuation.md',
    description: 'Core inventory valuation shared methods'
  },
  {
    path: 'shared-methods/inventory-valuation/period-end-snapshots',
    title: 'Period End Snapshots',
    file: 'inventory-valuation/SM-period-end-snapshots.md',
    description: 'Period-end snapshot methods for inventory valuation'
  },
  {
    path: 'shared-methods/inventory-valuation/period-management',
    title: 'Period Management',
    file: 'inventory-valuation/SM-period-management.md',
    description: 'Period management shared methods'
  },
  {
    path: 'shared-methods/inventory-valuation/periodic-average',
    title: 'Periodic Average',
    file: 'inventory-valuation/SM-periodic-average.md',
    description: 'Periodic average costing method'
  },
  {
    path: 'shared-methods/inventory-valuation/transaction-types-and-cost-layers',
    title: 'Transaction Types and Cost Layers',
    file: 'inventory-valuation/SM-transaction-types-and-cost-layers.md',
    description: 'Transaction types and cost layer management'
  },

  // Inventory Valuation - API Documentation
  {
    path: 'shared-methods/inventory-valuation/api-reference',
    title: 'API Reference - Inventory Valuation',
    file: 'inventory-valuation/api-reference.md',
    description: 'API reference for inventory valuation'
  },
  {
    path: 'shared-methods/inventory-valuation/lot-based-costing-api',
    title: 'Lot-Based Costing API',
    file: 'inventory-valuation/API-lot-based-costing.md',
    description: 'API for lot-based costing operations'
  },

  // Inventory Valuation - Configuration & Settings
  {
    path: 'shared-methods/inventory-valuation/inventory-settings',
    title: 'Inventory Settings',
    file: 'inventory-valuation/PC-inventory-settings.md',
    description: 'Inventory valuation settings and configuration'
  },
  {
    path: 'shared-methods/inventory-valuation/schema-alignment',
    title: 'Schema Alignment',
    file: 'inventory-valuation/SCHEMA-ALIGNMENT.md',
    description: 'Database schema alignment documentation'
  },

  // Inventory Valuation - Capabilities & Roadmap
  {
    path: 'shared-methods/inventory-valuation/current-capabilities',
    title: 'Current Capabilities',
    file: 'inventory-valuation/CURRENT-CAPABILITIES.md',
    description: 'Current inventory valuation capabilities'
  },
  {
    path: 'shared-methods/inventory-valuation/enhancements-roadmap',
    title: 'Enhancements Roadmap',
    file: 'inventory-valuation/ENHANCEMENTS-ROADMAP.md',
    description: 'Future enhancements roadmap'
  },
  {
    path: 'shared-methods/inventory-valuation/enhancement-comparison',
    title: 'Enhancement Comparison',
    file: 'inventory-valuation/ENHANCEMENT-COMPARISON.md',
    description: 'Comparison of enhancement options'
  },
  {
    path: 'shared-methods/inventory-valuation/enhancement-faq',
    title: 'Enhancement FAQ',
    file: 'inventory-valuation/ENHANCEMENT-FAQ.md',
    description: 'Frequently asked questions about enhancements'
  },
  {
    path: 'shared-methods/inventory-valuation/visual-roadmap',
    title: 'Visual Roadmap',
    file: 'inventory-valuation/VISUAL-ROADMAP.md',
    description: 'Visual representation of the roadmap'
  },
  {
    path: 'shared-methods/inventory-valuation/whats-coming',
    title: "What's Coming",
    file: 'inventory-valuation/WHATS-COMING.md',
    description: 'Upcoming features and improvements'
  },

  // Inventory Valuation - User Guide
  {
    path: 'shared-methods/inventory-valuation/period-close-guide',
    title: 'Period Close User Guide',
    file: 'inventory-valuation/USER-GUIDE-period-close.md',
    description: 'User guide for period close process'
  }
];

// Generate index content for inventory valuation sub-module
function generateInventoryValuationIndex() {
  return `# Inventory Valuation

## Overview

Comprehensive documentation for inventory valuation methods, costing calculations, and period management in Carmen ERP.

## Core Documentation

### [Business Requirements](./inventory-valuation/business-requirements)
Functional requirements and business rules for inventory valuation.

### [Use Cases](./inventory-valuation/use-cases)
User scenarios and interaction flows.

### [Data Definition](./inventory-valuation/data-definition)
Database schemas and data models.

### [Flow Diagrams](./inventory-valuation/flow-diagrams)
Visual process and data flows.

### [Validations](./inventory-valuation/validations)
Input validation and business rule enforcement.

## Shared Methods

### [Costing Methods](./inventory-valuation/costing-methods)
Core costing calculation methods (FIFO, LIFO, Weighted Average, etc.)

### [Inventory Valuation Methods](./inventory-valuation/inventory-valuation-methods)
Main inventory valuation shared methods.

### [Period End Snapshots](./inventory-valuation/period-end-snapshots)
Methods for creating period-end inventory snapshots.

### [Period Management](./inventory-valuation/period-management)
Accounting period management methods.

### [Periodic Average](./inventory-valuation/periodic-average)
Periodic average costing implementation.

### [Transaction Types and Cost Layers](./inventory-valuation/transaction-types-and-cost-layers)
Transaction type handling and cost layer management.

## API Documentation

### [API Reference](./inventory-valuation/api-reference)
Complete API reference for inventory valuation.

### [Lot-Based Costing API](./inventory-valuation/lot-based-costing-api)
API for lot-based costing operations.

## Configuration

### [Inventory Settings](./inventory-valuation/inventory-settings)
System settings and configuration options.

### [Schema Alignment](./inventory-valuation/schema-alignment)
Database schema alignment documentation.

## Roadmap & Capabilities

### [Current Capabilities](./inventory-valuation/current-capabilities)
Current system capabilities overview.

### [Enhancements Roadmap](./inventory-valuation/enhancements-roadmap)
Planned enhancements and timeline.

### [Enhancement Comparison](./inventory-valuation/enhancement-comparison)
Comparison of enhancement options.

### [Enhancement FAQ](./inventory-valuation/enhancement-faq)
Frequently asked questions.

### [Visual Roadmap](./inventory-valuation/visual-roadmap)
Visual representation of planned features.

### [What's Coming](./inventory-valuation/whats-coming)
Upcoming features preview.

## User Guides

### [Period Close Guide](./inventory-valuation/period-close-guide)
Step-by-step guide for period close process.

## Related Documentation

- [Shared Methods Index](../shared-methods)
- [Inventory Operations](../shared-methods/inventory-operations)
`;
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

  if (page.isIndex && page.indexFor === 'inventory-valuation') {
    content = generateInventoryValuationIndex();
  } else if (page.file) {
    const filePath = path.join(DOCS_DIR, page.file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${page.file}`);
      return false;
    }
    content = fs.readFileSync(filePath, 'utf8');
    // Remove any null bytes and control characters
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    console.log(`   ⚠️  No content source for: ${page.path}`);
    return false;
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
          tags: ["shared-methods", "documentation"]
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

  if (page.isIndex && page.indexFor === 'inventory-valuation') {
    content = generateInventoryValuationIndex();
  } else if (page.file) {
    const filePath = path.join(DOCS_DIR, page.file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${page.file}`);
      return false;
    }
    content = fs.readFileSync(filePath, 'utf8');
    // Remove any null bytes and control characters
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    console.log(`   ⚠️  No content source for: ${page.path}`);
    return false;
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
          tags: ["shared-methods", "documentation"]
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
  console.log('║     Wiki.js Shared Methods Documentation Import            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📁 Source directory: ${DOCS_DIR}`);
  console.log(`📝 Total pages to import: ${pages.length}`);
  console.log('');
  console.log('Sub-modules:');
  console.log('  • Shared Methods Index (1 page)');
  console.log('  • Inventory Operations (1 page)');
  console.log('  • Inventory Valuation (23 pages)');
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
