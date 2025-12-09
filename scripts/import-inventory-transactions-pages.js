#!/usr/bin/env node

/**
 * Import Inventory Transactions Documentation to Wiki.js
 *
 * This script imports inventory transactions documentation including:
 * - INDEX (Landing/Navigation Page)
 * - BR (Business Requirements)
 * - UC (Use Cases)
 * - TS (Technical Specification)
 * - FD (Flow Diagrams)
 * - VAL (Validations)
 *
 * Usage: node import-inventory-transactions-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/inventory-management/transactions';
const WIKI_BASE_PATH = 'inventory-management/transactions';

/**
 * GraphQL mutation to create a new page
 */
const CREATE_PAGE_MUTATION = `
mutation CreatePage(
  $content: String!
  $description: String!
  $editor: String!
  $isPublished: Boolean!
  $isPrivate: Boolean!
  $locale: String!
  $path: String!
  $tags: [String]!
  $title: String!
) {
  pages {
    create(
      content: $content
      description: $description
      editor: $editor
      isPublished: $isPublished
      isPrivate: $isPrivate
      locale: $locale
      path: $path
      tags: $tags
      title: $title
    ) {
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

/**
 * GraphQL mutation to update an existing page
 */
const UPDATE_PAGE_MUTATION = `
mutation UpdatePage(
  $id: Int!
  $content: String!
  $description: String!
  $editor: String!
  $isPublished: Boolean!
  $isPrivate: Boolean!
  $locale: String!
  $path: String!
  $tags: [String]!
  $title: String!
) {
  pages {
    update(
      id: $id
      content: $content
      description: $description
      editor: $editor
      isPublished: $isPublished
      isPrivate: $isPrivate
      locale: $locale
      path: $path
      tags: $tags
      title: $title
    ) {
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

/**
 * GraphQL query to find page by path
 */
const GET_PAGE_BY_PATH_QUERY = `
query GetPageByPath($path: String!, $locale: String!) {
  pages {
    singleByPath(path: $path, locale: $locale) {
      id
      path
      title
    }
  }
}
`;

/**
 * Inventory Transactions documentation files configuration
 */
const DOCUMENTS = [
  {
    filename: 'INDEX-inventory-transactions.md',
    wikiPath: `${WIKI_BASE_PATH}`,
    title: 'Inventory Transactions',
    description: 'Central navigation page for Inventory Transactions module documentation',
    tags: ['inventory-management', 'transactions', 'index', 'navigation', 'landing-page']
  },
  {
    filename: 'BR-inventory-transactions.md',
    wikiPath: `${WIKI_BASE_PATH}/business-requirements`,
    title: 'Inventory Transactions - Business Requirements',
    description: 'Business rules, functional requirements, and specifications for Inventory Transactions',
    tags: ['inventory-management', 'transactions', 'business-requirements', 'functional-requirements']
  },
  {
    filename: 'UC-inventory-transactions.md',
    wikiPath: `${WIKI_BASE_PATH}/use-cases`,
    title: 'Inventory Transactions - Use Cases',
    description: 'User workflows, scenarios, and actor interactions for Inventory Transactions',
    tags: ['inventory-management', 'transactions', 'use-cases', 'workflows', 'scenarios']
  },
  {
    filename: 'TS-inventory-transactions.md',
    wikiPath: `${WIKI_BASE_PATH}/technical-specification`,
    title: 'Inventory Transactions - Technical Specification',
    description: 'System architecture, components, and implementation details for Inventory Transactions',
    tags: ['inventory-management', 'transactions', 'technical-specification', 'architecture', 'implementation']
  },
  {
    filename: 'FD-inventory-transactions.md',
    wikiPath: `${WIKI_BASE_PATH}/flow-diagrams`,
    title: 'Inventory Transactions - Flow Diagrams',
    description: 'Visual workflow diagrams (Mermaid 8.8.2 compatible) for Inventory Transactions',
    tags: ['inventory-management', 'transactions', 'flow-diagrams', 'mermaid', 'workflows']
  },
  {
    filename: 'VAL-inventory-transactions.md',
    wikiPath: `${WIKI_BASE_PATH}/validations`,
    title: 'Inventory Transactions - Validations',
    description: 'Validation rules and business rules for Inventory Transactions',
    tags: ['inventory-management', 'transactions', 'validations', 'business-rules']
  }
];

/**
 * Transform internal markdown links to Wiki.js paths
 */
function transformLinks(content) {
  let transformed = content;

  // BR document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/BR-inventory-transactions\.md\)/g,
    '[$1](/inventory-management/transactions/business-requirements)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/BR-inventory-transactions\.md#([^)]+)\)/g,
    '[$1](/inventory-management/transactions/business-requirements#$2)'
  );

  // UC document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/UC-inventory-transactions\.md\)/g,
    '[$1](/inventory-management/transactions/use-cases)'
  );

  // TS document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/TS-inventory-transactions\.md\)/g,
    '[$1](/inventory-management/transactions/technical-specification)'
  );

  // FD document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/FD-inventory-transactions\.md\)/g,
    '[$1](/inventory-management/transactions/flow-diagrams)'
  );

  // VAL document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/VAL-inventory-transactions\.md\)/g,
    '[$1](/inventory-management/transactions/validations)'
  );

  // Related module links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\/docs\/app\/inventory-management\/([^)]+)\)/g,
    '[$1](/inventory-management/$2)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\/docs\/app\/procurement\/([^)]+)\)/g,
    '[$1](/procurement/$2)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\/docs\/app\/store-operations\/([^)]+)\)/g,
    '[$1](/store-operations/$2)'
  );

  return transformed;
}

/**
 * Check if page exists by path
 */
async function getPageByPath(wikiPath) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: GET_PAGE_BY_PATH_QUERY,
        variables: {
          path: wikiPath,
          locale: 'en'
        }
      })
    });

    const result = await response.json();

    if (result.data?.pages?.singleByPath) {
      return result.data.pages.singleByPath;
    }
    return null;
  } catch (error) {
    console.error(`   ⚠️ Error checking page:`, error.message);
    return null;
  }
}

/**
 * Create a page in Wiki.js
 */
async function createPage(wikiPath, title, description, content, tags) {
  console.log(`\n📄 Creating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);

  const variables = {
    content: content,
    description: description || 'Inventory Transactions Documentation',
    editor: 'markdown',
    isPublished: true,
    isPrivate: false,
    locale: 'en',
    path: wikiPath,
    tags: tags,
    title: title
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: CREATE_PAGE_MUTATION,
        variables: variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error(`   ❌ GraphQL Error:`, result.errors[0].message);
      return { success: false, path: wikiPath, error: result.errors[0].message };
    }

    if (result.data?.pages?.create?.responseResult?.succeeded) {
      console.log(`   ✅ Created! Page ID: ${result.data.pages.create.page.id}`);
      return { success: true, path: wikiPath, id: result.data.pages.create.page.id, action: 'created' };
    } else {
      const errorMsg = result.data?.pages?.create?.responseResult?.message || 'Unknown error';
      console.error(`   ❌ Failed:`, errorMsg);
      return { success: false, path: wikiPath, error: errorMsg };
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, path: wikiPath, error: error.message };
  }
}

/**
 * Update an existing page in Wiki.js
 */
async function updatePage(pageId, wikiPath, title, description, content, tags) {
  console.log(`\n📝 Updating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);
  console.log(`   Page ID: ${pageId}`);

  const variables = {
    id: pageId,
    content: content,
    description: description || 'Inventory Transactions Documentation',
    editor: 'markdown',
    isPublished: true,
    isPrivate: false,
    locale: 'en',
    path: wikiPath,
    tags: tags,
    title: title
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: UPDATE_PAGE_MUTATION,
        variables: variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error(`   ❌ GraphQL Error:`, result.errors[0].message);
      return { success: false, path: wikiPath, error: result.errors[0].message };
    }

    if (result.data?.pages?.update?.responseResult?.succeeded) {
      console.log(`   ✅ Updated! Page ID: ${result.data.pages.update.page.id}`);
      return { success: true, path: wikiPath, id: result.data.pages.update.page.id, action: 'updated' };
    } else {
      const errorMsg = result.data?.pages?.update?.responseResult?.message || 'Unknown error';
      console.error(`   ❌ Failed:`, errorMsg);
      return { success: false, path: wikiPath, error: errorMsg };
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, path: wikiPath, error: error.message };
  }
}

/**
 * Create or update a page (upsert)
 */
async function upsertPage(wikiPath, title, description, content, tags) {
  const existingPage = await getPageByPath(wikiPath);

  if (existingPage) {
    return await updatePage(existingPage.id, wikiPath, title, description, content, tags);
  } else {
    return await createPage(wikiPath, title, description, content, tags);
  }
}

/**
 * Process a single document
 */
async function processDocument(doc) {
  const filePath = path.join(BASE_DIR, doc.filename);

  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ File not found: ${filePath}`);
    return { success: false, path: doc.wikiPath, error: 'File not found' };
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Transform internal links to Wiki.js paths
  content = transformLinks(content);

  return await upsertPage(doc.wikiPath, doc.title, doc.description, content, doc.tags);
}

/**
 * Ensure Inventory Management landing page exists
 */
async function ensureInventoryManagementLanding() {
  const wikiPath = 'inventory-management';
  const existingPage = await getPageByPath(wikiPath);

  if (!existingPage) {
    const content = `# Inventory Management

Welcome to the Inventory Management module documentation.

## Available Sub-Modules

| Module | Description |
|--------|-------------|
| [Stock Overview](/inventory-management/stock-overview) | Real-time inventory visibility and monitoring |
| [Inventory Balance](/inventory-management/inventory-balance) | Current stock levels and balance tracking |
| [Stock Transfers](/inventory-management/stock-transfers) | Inter-location inventory movements |
| [Inventory Adjustments](/inventory-management/inventory-adjustments) | Manual stock corrections |
| [Inventory Counts](/inventory-management/inventory-counts) | Physical inventory counting |
| [Transactions](/inventory-management/transactions) | Unified view of all inventory movements |

## Overview

The Inventory Management module provides comprehensive tools for managing hotel inventory, including:
- **Stock Overview**: Real-time visibility into inventory levels across all locations
- **Inventory Balance**: Track current stock quantities and values
- **Stock Transfers**: Manage movement of inventory between locations
- **Inventory Adjustments**: Record manual corrections to stock levels
- **Inventory Counts**: Conduct physical inventory counts
- **Transactions**: View all inventory movements in a unified interface

---

> This is the landing page for Inventory Management. Select a sub-module above to view its documentation.
`;

    return await createPage(
      wikiPath,
      'Inventory Management',
      'Inventory Management module documentation - stock tracking and inventory control',
      content,
      ['inventory-management', 'inventory', 'landing-page']
    );
  }

  console.log(`\n✅ Inventory Management landing page already exists`);
  return { success: true, path: wikiPath, action: 'exists' };
}

/**
 * Main execution
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║    Inventory Transactions Documentation Import to Wiki.js    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n📁 Source: ${BASE_DIR}`);
  console.log(`🌐 Wiki Base Path: ${WIKI_BASE_PATH}`);
  console.log(`📄 Documents to import: ${DOCUMENTS.length}`);

  const results = {
    success: [],
    failed: []
  };

  // Ensure Inventory Management landing page exists
  console.log('\n━━━ Ensuring Parent Pages ━━━');
  await ensureInventoryManagementLanding();

  // Process each document
  console.log('\n━━━ Importing Inventory Transactions Documents ━━━');

  for (const doc of DOCUMENTS) {
    const result = await processDocument(doc);

    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push(result);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        IMPORT SUMMARY                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  console.log(`\n✅ Successful: ${results.success.length}`);
  results.success.forEach(r => {
    console.log(`   • ${r.path} (${r.action})`);
  });

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(r => {
      console.log(`   • ${r.path}: ${r.error}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Wiki.js URLs:');
  console.log(`   Landing: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}`);
  console.log(`   BR: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/business-requirements`);
  console.log(`   UC: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/use-cases`);
  console.log(`   TS: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/technical-specification`);
  console.log(`   FD: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/flow-diagrams`);
  console.log(`   VAL: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/validations`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
