#!/usr/bin/env node

/**
 * Import Stock Replenishment Documentation to Wiki.js
 *
 * This script imports stock replenishment documentation including:
 * - INDEX (Landing/Navigation Page)
 * - BR (Business Requirements with Backend)
 * - UC (Use Cases)
 * - TS (Technical Specification)
 * - DD (Data Definition)
 * - FD (Flow Diagrams)
 * - VAL (Validations)
 *
 * Usage: node import-stock-replenishment-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/store-operations/stock-replenishment';
const WIKI_BASE_PATH = 'store-operations/stock-replenishment';

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
 * Stock Replenishment documentation files configuration
 */
const DOCUMENTS = [
  {
    filename: 'INDEX-stock-replenishment.md',
    wikiPath: `${WIKI_BASE_PATH}`,
    title: 'Stock Replenishment',
    description: 'Central navigation page for Stock Replenishment module documentation - proactive inventory management',
    tags: ['store-operations', 'stock-replenishment', 'index', 'navigation', 'landing-page', 'inventory']
  },
  {
    filename: 'BR-stock-replenishment.md',
    wikiPath: `${WIKI_BASE_PATH}/business-requirements`,
    title: 'Stock Replenishment - Business Requirements',
    description: 'Business rules, workflows, backend specifications, and inventory integration for Stock Replenishment',
    tags: ['store-operations', 'stock-replenishment', 'business-requirements', 'backend', 'api', 'fifo', 'fefo', 'inventory-valuation']
  },
  {
    filename: 'UC-stock-replenishment.md',
    wikiPath: `${WIKI_BASE_PATH}/use-cases`,
    title: 'Stock Replenishment - Use Cases',
    description: 'User workflows, scenarios, and actor interactions for Stock Replenishment',
    tags: ['store-operations', 'stock-replenishment', 'use-cases', 'workflows', 'scenarios']
  },
  {
    filename: 'TS-stock-replenishment.md',
    wikiPath: `${WIKI_BASE_PATH}/technical-specification`,
    title: 'Stock Replenishment - Technical Specification',
    description: 'System architecture, components, and implementation details for Stock Replenishment',
    tags: ['store-operations', 'stock-replenishment', 'technical-specification', 'architecture', 'implementation']
  },
  {
    filename: 'DD-stock-replenishment.md',
    wikiPath: `${WIKI_BASE_PATH}/data-definition`,
    title: 'Stock Replenishment - Data Definition',
    description: 'Database schema and entity relationships for Stock Replenishment (6 proposed tables)',
    tags: ['store-operations', 'stock-replenishment', 'data-definition', 'database', 'schema', 'proposed']
  },
  {
    filename: 'FD-stock-replenishment.md',
    wikiPath: `${WIKI_BASE_PATH}/flow-diagrams`,
    title: 'Stock Replenishment - Flow Diagrams',
    description: 'Visual workflow diagrams (Mermaid 8.8.2 compatible) for Stock Replenishment',
    tags: ['store-operations', 'stock-replenishment', 'flow-diagrams', 'mermaid', 'workflows', 'mermaid-882']
  },
  {
    filename: 'VAL-stock-replenishment.md',
    wikiPath: `${WIKI_BASE_PATH}/validations`,
    title: 'Stock Replenishment - Validations',
    description: 'Validation rules, Zod schemas, and business rules for Stock Replenishment',
    tags: ['store-operations', 'stock-replenishment', 'validations', 'zod', 'business-rules']
  }
];

/**
 * Transform internal markdown links to Wiki.js paths
 */
function transformLinks(content) {
  // Transform relative links to Wiki.js paths
  let transformed = content;

  // INDEX document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/INDEX-stock-replenishment\.md\)/g,
    '[$1](/store-operations/stock-replenishment)'
  );

  // BR document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/BR-stock-replenishment\.md\)/g,
    '[$1](/store-operations/stock-replenishment/business-requirements)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/BR-stock-replenishment\.md#([^)]+)\)/g,
    '[$1](/store-operations/stock-replenishment/business-requirements#$2)'
  );

  // UC document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/UC-stock-replenishment\.md\)/g,
    '[$1](/store-operations/stock-replenishment/use-cases)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/UC-stock-replenishment\.md#([^)]+)\)/g,
    '[$1](/store-operations/stock-replenishment/use-cases#$2)'
  );

  // TS document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/TS-stock-replenishment\.md\)/g,
    '[$1](/store-operations/stock-replenishment/technical-specification)'
  );

  // DD document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/DD-stock-replenishment\.md\)/g,
    '[$1](/store-operations/stock-replenishment/data-definition)'
  );
  // Also handle old DS references
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/DS-stock-replenishment\.md\)/g,
    '[$1](/store-operations/stock-replenishment/data-definition)'
  );

  // FD document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/FD-stock-replenishment\.md\)/g,
    '[$1](/store-operations/stock-replenishment/flow-diagrams)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/FD-stock-replenishment\.md#([^)]+)\)/g,
    '[$1](/store-operations/stock-replenishment/flow-diagrams#$2)'
  );

  // VAL document links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/VAL-stock-replenishment\.md\)/g,
    '[$1](/store-operations/stock-replenishment/validations)'
  );

  // Store Requisitions cross-references
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/store-requisitions\/INDEX-store-requisitions\.md\)/g,
    '[$1](/store-operations/store-requisitions)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/store-requisitions\/FD-store-requisitions\.md\)/g,
    '[$1](/store-operations/store-requisitions/flow-diagrams)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/store-requisitions\/VAL-store-requisitions\.md\)/g,
    '[$1](/store-operations/store-requisitions/validations)'
  );

  // Shared methods links
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/\.\.\/shared-methods\/inventory-operations\/SM-inventory-operations\.md\)/g,
    '[$1](/shared-methods/inventory-operations)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/\.\.\/shared-methods\/inventory-valuation\/SM-costing-methods\.md\)/g,
    '[$1](/shared-methods/inventory-valuation/costing-methods)'
  );

  // Inventory Management cross-references
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/\.\.\/inventory-management\/inventory-overview\/FD-inventory-overview\.md\)/g,
    '[$1](/inventory-management/inventory-overview/flow-diagrams)'
  );

  // Procurement cross-references
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/\.\.\/procurement\/([^)]+)\.md\)/g,
    '[$1](/procurement/$2)'
  );

  // Vendor Management cross-references
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/\.\.\/vendor-management\/([^)]+)\.md\)/g,
    '[$1](/vendor-management/$2)'
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
    description: description || 'Stock Replenishment Documentation',
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
    description: description || 'Stock Replenishment Documentation',
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
 * Update Store Operations landing page with stock replenishment link
 */
async function updateStoreOperationsLanding() {
  const wikiPath = 'store-operations';
  const existingPage = await getPageByPath(wikiPath);

  if (!existingPage) {
    // Create if doesn't exist
    const content = `# Store Operations

Welcome to the Store Operations module documentation.

## Available Sub-Modules

| Module | Description | Status |
|--------|-------------|--------|
| [Store Requisitions](/store-operations/store-requisitions) | Internal material requests from departments to central stores | ✅ Implemented |
| [Stock Replenishment](/store-operations/stock-replenishment) | Proactive inventory management and inter-location transfers | 🚧 Proposed |

## Overview

The Store Operations module manages internal inventory movements within the hotel, including:
- **Store Requisitions**: Department requests for materials from central stores
- **Stock Replenishment**: Automated monitoring and replenishment of inventory levels
- **Stock Transfers**: Movement of inventory between locations
- **Wastage Tracking**: Recording and analysis of inventory wastage

---

> This is the landing page for Store Operations. Select a sub-module above to view its documentation.
`;

    return await createPage(
      wikiPath,
      'Store Operations',
      'Store Operations module documentation - internal inventory movements',
      content,
      ['store-operations', 'inventory', 'landing-page']
    );
  }

  console.log(`\n✅ Store Operations landing page already exists`);
  return { success: true, path: wikiPath, action: 'exists' };
}

/**
 * Main execution
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Stock Replenishment Documentation Import to Wiki.js        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n📁 Source: ${BASE_DIR}`);
  console.log(`🌐 Wiki Base Path: ${WIKI_BASE_PATH}`);
  console.log(`📄 Documents to import: ${DOCUMENTS.length}`);

  const results = {
    success: [],
    failed: []
  };

  // Ensure Store Operations landing page exists
  console.log('\n━━━ Ensuring Parent Pages ━━━');
  await updateStoreOperationsLanding();

  // Process each document
  console.log('\n━━━ Importing Stock Replenishment Documents ━━━');

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
  console.log(`   DD: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/data-definition`);
  console.log(`   FD: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/flow-diagrams`);
  console.log(`   VAL: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/validations`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
