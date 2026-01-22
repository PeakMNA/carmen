/**
 * Wiki.js Store Operations Import Script
 *
 * Imports the following documentation to Wiki.js:
 * - Store Operations Index (1 page)
 * - Store Requisitions (7 pages)
 * - Stock Replenishment (7 pages)
 * - Stock Transfers (6 pages)
 * - Stock Issues (6 pages)
 * - Wastage Reporting (7 pages)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';
const DOCS_DIR = '/Users/peak/Documents/GitHub/carmen/docs/app/store-operations';

// Page definitions
const pages = [
  // ============================================
  // STORE OPERATIONS - Main Index
  // ============================================
  {
    path: 'store-operations',
    title: 'Store Operations',
    file: 'index.md',
    description: 'Store Operations module - Inventory movements, requisitions, transfers, issues, and wastage reporting',
    tags: ['store-operations', 'inventory', 'module-index']
  },

  // ============================================
  // STORE REQUISITIONS
  // ============================================
  {
    path: 'store-operations/store-requisitions',
    title: 'Store Requisitions',
    file: 'store-requisitions/INDEX-store-requisitions.md',
    description: 'Store Requisitions - Department requests for inventory items',
    tags: ['store-operations', 'store-requisitions', 'index']
  },
  {
    path: 'store-operations/store-requisitions/business-requirements',
    title: 'Business Requirements - Store Requisitions',
    file: 'store-requisitions/BR-store-requisitions.md',
    description: 'Business requirements for store requisitions',
    tags: ['store-operations', 'store-requisitions', 'business-requirements']
  },
  {
    path: 'store-operations/store-requisitions/use-cases',
    title: 'Use Cases - Store Requisitions',
    file: 'store-requisitions/UC-store-requisitions.md',
    description: 'Use cases for store requisitions',
    tags: ['store-operations', 'store-requisitions', 'use-cases']
  },
  {
    path: 'store-operations/store-requisitions/data-dictionary',
    title: 'Data Dictionary - Store Requisitions',
    file: 'store-requisitions/DD-store-requisitions.md',
    description: 'Data dictionary for store requisitions',
    tags: ['store-operations', 'store-requisitions', 'data-dictionary']
  },
  {
    path: 'store-operations/store-requisitions/technical-specification',
    title: 'Technical Specification - Store Requisitions',
    file: 'store-requisitions/TS-store-requisitions.md',
    description: 'Technical specification for store requisitions',
    tags: ['store-operations', 'store-requisitions', 'technical-specification']
  },
  {
    path: 'store-operations/store-requisitions/flow-diagrams',
    title: 'Flow Diagrams - Store Requisitions',
    file: 'store-requisitions/FD-store-requisitions.md',
    description: 'Flow diagrams for store requisitions',
    tags: ['store-operations', 'store-requisitions', 'flow-diagrams']
  },
  {
    path: 'store-operations/store-requisitions/validations',
    title: 'Validations - Store Requisitions',
    file: 'store-requisitions/VAL-store-requisitions.md',
    description: 'Validation rules for store requisitions',
    tags: ['store-operations', 'store-requisitions', 'validations']
  },

  // ============================================
  // STOCK REPLENISHMENT
  // ============================================
  {
    path: 'store-operations/stock-replenishment',
    title: 'Stock Replenishment',
    file: 'stock-replenishment/INDEX-stock-replenishment.md',
    description: 'Stock Replenishment - Proactive inventory management',
    tags: ['store-operations', 'stock-replenishment', 'index']
  },
  {
    path: 'store-operations/stock-replenishment/business-requirements',
    title: 'Business Requirements - Stock Replenishment',
    file: 'stock-replenishment/BR-stock-replenishment.md',
    description: 'Business requirements for stock replenishment',
    tags: ['store-operations', 'stock-replenishment', 'business-requirements']
  },
  {
    path: 'store-operations/stock-replenishment/use-cases',
    title: 'Use Cases - Stock Replenishment',
    file: 'stock-replenishment/UC-stock-replenishment.md',
    description: 'Use cases for stock replenishment',
    tags: ['store-operations', 'stock-replenishment', 'use-cases']
  },
  {
    path: 'store-operations/stock-replenishment/data-dictionary',
    title: 'Data Dictionary - Stock Replenishment',
    file: 'stock-replenishment/DD-stock-replenishment.md',
    description: 'Data dictionary for stock replenishment',
    tags: ['store-operations', 'stock-replenishment', 'data-dictionary']
  },
  {
    path: 'store-operations/stock-replenishment/technical-specification',
    title: 'Technical Specification - Stock Replenishment',
    file: 'stock-replenishment/TS-stock-replenishment.md',
    description: 'Technical specification for stock replenishment',
    tags: ['store-operations', 'stock-replenishment', 'technical-specification']
  },
  {
    path: 'store-operations/stock-replenishment/flow-diagrams',
    title: 'Flow Diagrams - Stock Replenishment',
    file: 'stock-replenishment/FD-stock-replenishment.md',
    description: 'Flow diagrams for stock replenishment',
    tags: ['store-operations', 'stock-replenishment', 'flow-diagrams']
  },
  {
    path: 'store-operations/stock-replenishment/validations',
    title: 'Validations - Stock Replenishment',
    file: 'stock-replenishment/VAL-stock-replenishment.md',
    description: 'Validation rules for stock replenishment',
    tags: ['store-operations', 'stock-replenishment', 'validations']
  },

  // ============================================
  // STOCK TRANSFERS
  // ============================================
  {
    path: 'store-operations/stock-transfers',
    title: 'Stock Transfers',
    file: 'stock-transfers/INDEX-stock-transfers.md',
    description: 'Stock Transfers - Inventory movements between INVENTORY locations',
    tags: ['store-operations', 'stock-transfers', 'index']
  },
  {
    path: 'store-operations/stock-transfers/business-rules',
    title: 'Business Rules - Stock Transfers',
    file: 'stock-transfers/BR-stock-transfers.md',
    description: 'Business rules for stock transfers',
    tags: ['store-operations', 'stock-transfers', 'business-rules']
  },
  {
    path: 'store-operations/stock-transfers/use-cases',
    title: 'Use Cases - Stock Transfers',
    file: 'stock-transfers/UC-stock-transfers.md',
    description: 'Use cases for stock transfers',
    tags: ['store-operations', 'stock-transfers', 'use-cases']
  },
  {
    path: 'store-operations/stock-transfers/data-structure',
    title: 'Data Structure - Stock Transfers',
    file: 'stock-transfers/DS-stock-transfers.md',
    description: 'Data structure for stock transfers',
    tags: ['store-operations', 'stock-transfers', 'data-structure']
  },
  {
    path: 'store-operations/stock-transfers/technical-specification',
    title: 'Technical Specification - Stock Transfers',
    file: 'stock-transfers/TS-stock-transfers.md',
    description: 'Technical specification for stock transfers',
    tags: ['store-operations', 'stock-transfers', 'technical-specification']
  },
  {
    path: 'store-operations/stock-transfers/flow-diagrams',
    title: 'Flow Diagrams - Stock Transfers',
    file: 'stock-transfers/FD-stock-transfers.md',
    description: 'Flow diagrams for stock transfers',
    tags: ['store-operations', 'stock-transfers', 'flow-diagrams']
  },
  {
    path: 'store-operations/stock-transfers/validations',
    title: 'Validations - Stock Transfers',
    file: 'stock-transfers/VAL-stock-transfers.md',
    description: 'Validation rules for stock transfers',
    tags: ['store-operations', 'stock-transfers', 'validations']
  },

  // ============================================
  // STOCK ISSUES
  // ============================================
  {
    path: 'store-operations/stock-issues',
    title: 'Stock Issues',
    file: 'stock-issues/INDEX-stock-issues.md',
    description: 'Stock Issues - Direct issues to expense/consumption locations',
    tags: ['store-operations', 'stock-issues', 'index']
  },
  {
    path: 'store-operations/stock-issues/business-rules',
    title: 'Business Rules - Stock Issues',
    file: 'stock-issues/BR-stock-issues.md',
    description: 'Business rules for stock issues',
    tags: ['store-operations', 'stock-issues', 'business-rules']
  },
  {
    path: 'store-operations/stock-issues/use-cases',
    title: 'Use Cases - Stock Issues',
    file: 'stock-issues/UC-stock-issues.md',
    description: 'Use cases for stock issues',
    tags: ['store-operations', 'stock-issues', 'use-cases']
  },
  {
    path: 'store-operations/stock-issues/data-structure',
    title: 'Data Structure - Stock Issues',
    file: 'stock-issues/DS-stock-issues.md',
    description: 'Data structure for stock issues',
    tags: ['store-operations', 'stock-issues', 'data-structure']
  },
  {
    path: 'store-operations/stock-issues/technical-specification',
    title: 'Technical Specification - Stock Issues',
    file: 'stock-issues/TS-stock-issues.md',
    description: 'Technical specification for stock issues',
    tags: ['store-operations', 'stock-issues', 'technical-specification']
  },
  {
    path: 'store-operations/stock-issues/flow-diagrams',
    title: 'Flow Diagrams - Stock Issues',
    file: 'stock-issues/FD-stock-issues.md',
    description: 'Flow diagrams for stock issues',
    tags: ['store-operations', 'stock-issues', 'flow-diagrams']
  },
  {
    path: 'store-operations/stock-issues/validations',
    title: 'Validations - Stock Issues',
    file: 'stock-issues/VAL-stock-issues.md',
    description: 'Validation rules for stock issues',
    tags: ['store-operations', 'stock-issues', 'validations']
  },

  // ============================================
  // WASTAGE REPORTING
  // ============================================
  {
    path: 'store-operations/wastage-reporting',
    title: 'Wastage Reporting',
    file: 'wastage-reporting/INDEX-wastage-reporting.md',
    description: 'Wastage Reporting - Record, approve, and analyze food and beverage wastage',
    tags: ['store-operations', 'wastage-reporting', 'index']
  },
  {
    path: 'store-operations/wastage-reporting/business-requirements',
    title: 'Business Requirements - Wastage Reporting',
    file: 'wastage-reporting/BR-wastage-reporting.md',
    description: 'Business requirements for wastage reporting',
    tags: ['store-operations', 'wastage-reporting', 'business-requirements']
  },
  {
    path: 'store-operations/wastage-reporting/use-cases',
    title: 'Use Cases - Wastage Reporting',
    file: 'wastage-reporting/UC-wastage-reporting.md',
    description: 'Use cases for wastage reporting',
    tags: ['store-operations', 'wastage-reporting', 'use-cases']
  },
  {
    path: 'store-operations/wastage-reporting/data-dictionary',
    title: 'Data Dictionary - Wastage Reporting',
    file: 'wastage-reporting/DD-wastage-reporting.md',
    description: 'Data dictionary for wastage reporting',
    tags: ['store-operations', 'wastage-reporting', 'data-dictionary']
  },
  {
    path: 'store-operations/wastage-reporting/technical-specification',
    title: 'Technical Specification - Wastage Reporting',
    file: 'wastage-reporting/TS-wastage-reporting.md',
    description: 'Technical specification for wastage reporting',
    tags: ['store-operations', 'wastage-reporting', 'technical-specification']
  },
  {
    path: 'store-operations/wastage-reporting/flow-diagrams',
    title: 'Flow Diagrams - Wastage Reporting',
    file: 'wastage-reporting/FD-wastage-reporting.md',
    description: 'Flow diagrams for wastage reporting',
    tags: ['store-operations', 'wastage-reporting', 'flow-diagrams']
  },
  {
    path: 'store-operations/wastage-reporting/validations',
    title: 'Validations - Wastage Reporting',
    file: 'wastage-reporting/VAL-wastage-reporting.md',
    description: 'Validation rules for wastage reporting',
    tags: ['store-operations', 'wastage-reporting', 'validations']
  }
];

// GraphQL mutation for creating a page
const CREATE_PAGE_MUTATION = `
  mutation CreatePage($content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) {
    pages {
      create(content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) {
        responseResult {
          succeeded
          errorCode
          slug
          message
        }
        page {
          id
          path
          title
        }
      }
    }
  }
`;

// GraphQL mutation for updating a page
const UPDATE_PAGE_MUTATION = `
  mutation UpdatePage($id: Int!, $content: String!, $description: String!, $tags: [String]!, $title: String!) {
    pages {
      update(id: $id, content: $content, description: $description, tags: $tags, title: $title) {
        responseResult {
          succeeded
          errorCode
          slug
          message
        }
        page {
          id
          path
          title
        }
      }
    }
  }
`;

// GraphQL query to find page by path
const FIND_PAGE_QUERY = `
  query FindPage($path: String!) {
    pages {
      singleByPath(path: $path, locale: "en") {
        id
        path
        title
      }
    }
  }
`;

async function makeRequest(query, variables) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ query, variables })
  });
  return response.json();
}

async function findPageByPath(pagePath) {
  const result = await makeRequest(FIND_PAGE_QUERY, { path: pagePath });
  return result?.data?.pages?.singleByPath;
}

async function createPage(pageConfig) {
  const filePath = path.join(DOCS_DIR, pageConfig.file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${pageConfig.file}`);
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  const variables = {
    content,
    description: pageConfig.description,
    editor: 'markdown',
    isPublished: true,
    isPrivate: false,
    locale: 'en',
    path: pageConfig.path,
    tags: pageConfig.tags,
    title: pageConfig.title
  };

  return makeRequest(CREATE_PAGE_MUTATION, variables);
}

async function updatePage(pageId, pageConfig) {
  const filePath = path.join(DOCS_DIR, pageConfig.file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${pageConfig.file}`);
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  const variables = {
    id: pageId,
    content,
    description: pageConfig.description,
    tags: pageConfig.tags,
    title: pageConfig.title
  };

  return makeRequest(UPDATE_PAGE_MUTATION, variables);
}

async function main() {
  console.log('Wiki.js Store Operations Import Script');
  console.log('======================================\n');
  console.log(`Total pages to process: ${pages.length}\n`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const pageConfig of pages) {
    console.log(`Processing: ${pageConfig.title}`);
    console.log(`  Path: ${pageConfig.path}`);

    // Check if page exists
    const existingPage = await findPageByPath(pageConfig.path);

    if (existingPage) {
      // Update existing page
      console.log(`  Found existing page (ID: ${existingPage.id}), updating...`);
      const result = await updatePage(existingPage.id, pageConfig);

      if (result?.data?.pages?.update?.responseResult?.succeeded) {
        console.log(`  ✅ Updated successfully`);
        updated++;
      } else {
        const error = result?.data?.pages?.update?.responseResult?.message || 'Unknown error';
        console.log(`  ❌ Update failed: ${error}`);
        failed++;
      }
    } else {
      // Create new page
      console.log(`  Creating new page...`);
      const result = await createPage(pageConfig);

      if (result?.data?.pages?.create?.responseResult?.succeeded) {
        const newId = result?.data?.pages?.create?.page?.id;
        console.log(`  ✅ Created successfully (ID: ${newId})`);
        created++;
      } else {
        const error = result?.data?.pages?.create?.responseResult?.message || 'Unknown error';
        console.log(`  ❌ Creation failed: ${error}`);
        failed++;
      }
    }

    console.log('');

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('======================================');
  console.log('Import Summary:');
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${pages.length}`);
  console.log('======================================');
}

main().catch(console.error);
