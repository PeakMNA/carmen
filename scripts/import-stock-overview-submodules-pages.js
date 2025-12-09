#!/usr/bin/env node

/**
 * Import Stock Overview Sub-Modules Documentation to Wiki.js
 *
 * This script imports documentation for all Stock Overview sub-modules:
 * - Inventory Balance
 * - Stock Cards
 * - Slow Moving
 * - Inventory Aging
 *
 * Each sub-module includes:
 * - INDEX (Landing/Navigation Page)
 * - BR (Business Requirements)
 * - UC (Use Cases)
 * - TS (Technical Specification)
 * - FD (Flow Diagrams)
 * - VAL (Validations)
 *
 * Usage: node import-stock-overview-submodules-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/inventory-management/stock-overview';
const WIKI_BASE_PATH = 'inventory-management/stock-overview';

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
 * Sub-module configurations
 */
const SUB_MODULES = [
  {
    name: 'Inventory Balance',
    folder: 'inventory-balance',
    slug: 'inventory-balance',
    description: 'Current stock levels and balance tracking across locations'
  },
  {
    name: 'Stock Cards',
    folder: 'stock-cards',
    slug: 'stock-cards',
    description: 'Individual product stock information and status tracking'
  },
  {
    name: 'Slow Moving',
    folder: 'slow-moving',
    slug: 'slow-moving',
    description: 'Identification and management of slow-moving inventory items'
  },
  {
    name: 'Inventory Aging',
    folder: 'inventory-aging',
    slug: 'inventory-aging',
    description: 'Age and expiry tracking for perishable inventory'
  }
];

/**
 * Document types for each sub-module
 */
const DOC_TYPES = [
  {
    prefix: 'INDEX',
    pathSuffix: '',
    titleSuffix: '',
    description: 'Central navigation page for module documentation',
    extraTags: ['index', 'navigation', 'landing-page']
  },
  {
    prefix: 'BR',
    pathSuffix: '/business-requirements',
    titleSuffix: ' - Business Requirements',
    description: 'Business rules, functional requirements, and specifications',
    extraTags: ['business-requirements', 'functional-requirements']
  },
  {
    prefix: 'UC',
    pathSuffix: '/use-cases',
    titleSuffix: ' - Use Cases',
    description: 'User workflows, scenarios, and actor interactions',
    extraTags: ['use-cases', 'workflows', 'scenarios']
  },
  {
    prefix: 'TS',
    pathSuffix: '/technical-specification',
    titleSuffix: ' - Technical Specification',
    description: 'System architecture, components, and implementation details',
    extraTags: ['technical-specification', 'architecture', 'implementation']
  },
  {
    prefix: 'FD',
    pathSuffix: '/flow-diagrams',
    titleSuffix: ' - Flow Diagrams',
    description: 'Visual workflow diagrams (Mermaid 8.8.2 compatible)',
    extraTags: ['flow-diagrams', 'mermaid', 'workflows']
  },
  {
    prefix: 'VAL',
    pathSuffix: '/validations',
    titleSuffix: ' - Validations',
    description: 'Validation rules and business rules',
    extraTags: ['validations', 'business-rules']
  }
];

/**
 * Generate document configurations for all sub-modules
 */
function generateDocuments() {
  const documents = [];

  for (const subModule of SUB_MODULES) {
    for (const docType of DOC_TYPES) {
      documents.push({
        subModule: subModule.name,
        folder: subModule.folder,
        filename: `${docType.prefix}-${subModule.slug}.md`,
        wikiPath: `${WIKI_BASE_PATH}/${subModule.slug}${docType.pathSuffix}`,
        title: `${subModule.name}${docType.titleSuffix}`,
        description: `${docType.description} for ${subModule.name}`,
        tags: ['inventory-management', 'stock-overview', subModule.slug, ...docType.extraTags]
      });
    }
  }

  return documents;
}

/**
 * Transform internal markdown links to Wiki.js paths
 */
function transformLinks(content, subModuleSlug) {
  let transformed = content;

  // Transform links for the current sub-module
  transformed = transformed.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/BR-${subModuleSlug}\\.md\\)`, 'g'),
    `[$1](/${WIKI_BASE_PATH}/${subModuleSlug}/business-requirements)`
  );
  transformed = transformed.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/BR-${subModuleSlug}\\.md#([^)]+)\\)`, 'g'),
    `[$1](/${WIKI_BASE_PATH}/${subModuleSlug}/business-requirements#$2)`
  );
  transformed = transformed.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/UC-${subModuleSlug}\\.md\\)`, 'g'),
    `[$1](/${WIKI_BASE_PATH}/${subModuleSlug}/use-cases)`
  );
  transformed = transformed.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/TS-${subModuleSlug}\\.md\\)`, 'g'),
    `[$1](/${WIKI_BASE_PATH}/${subModuleSlug}/technical-specification)`
  );
  transformed = transformed.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/FD-${subModuleSlug}\\.md\\)`, 'g'),
    `[$1](/${WIKI_BASE_PATH}/${subModuleSlug}/flow-diagrams)`
  );
  transformed = transformed.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/VAL-${subModuleSlug}\\.md\\)`, 'g'),
    `[$1](/${WIKI_BASE_PATH}/${subModuleSlug}/validations)`
  );

  // Cross-module links within stock-overview
  for (const sm of SUB_MODULES) {
    if (sm.slug !== subModuleSlug) {
      transformed = transformed.replace(
        new RegExp(`\\[([^\\]]+)\\]\\(\\.\\.\/${sm.slug}\\/([^)]+)\\)`, 'g'),
        `[$1](/${WIKI_BASE_PATH}/${sm.slug}/$2)`
      );
    }
  }

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
    description: description || 'Stock Overview Documentation',
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
    description: description || 'Stock Overview Documentation',
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
  const filePath = path.join(BASE_DIR, doc.folder, doc.filename);

  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ File not found: ${filePath}`);
    return { success: false, path: doc.wikiPath, error: 'File not found' };
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Transform internal links to Wiki.js paths
  content = transformLinks(content, doc.folder);

  return await upsertPage(doc.wikiPath, doc.title, doc.description, content, doc.tags);
}

/**
 * Ensure Stock Overview landing page exists
 */
async function ensureStockOverviewLanding() {
  const wikiPath = 'inventory-management/stock-overview';
  const existingPage = await getPageByPath(wikiPath);

  if (!existingPage) {
    const content = `# Stock Overview

Welcome to the Stock Overview module documentation.

## Available Sub-Modules

| Module | Description |
|--------|-------------|
| [Inventory Balance](/inventory-management/stock-overview/inventory-balance) | Current stock levels and balance tracking across locations |
| [Stock Cards](/inventory-management/stock-overview/stock-cards) | Individual product stock information and status tracking |
| [Slow Moving](/inventory-management/stock-overview/slow-moving) | Identification and management of slow-moving inventory items |
| [Inventory Aging](/inventory-management/stock-overview/inventory-aging) | Age and expiry tracking for perishable inventory |

## Overview

The Stock Overview module provides comprehensive tools for monitoring and analyzing inventory status, including:

- **Inventory Balance**: View current stock quantities and values across all locations with hierarchical views
- **Stock Cards**: Individual product cards showing stock status, levels, and reorder points
- **Slow Moving**: Identify items with low turnover rates and take corrective actions
- **Inventory Aging**: Track inventory age and expiry dates for FIFO compliance

---

> This is the landing page for Stock Overview. Select a sub-module above to view its documentation.
`;

    return await createPage(
      wikiPath,
      'Stock Overview',
      'Stock Overview module documentation - inventory monitoring and analysis',
      content,
      ['inventory-management', 'stock-overview', 'landing-page']
    );
  }

  console.log(`\n✅ Stock Overview landing page already exists`);
  return { success: true, path: wikiPath, action: 'exists' };
}

/**
 * Main execution
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║   Stock Overview Sub-Modules Documentation Import to Wiki.js    ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  const DOCUMENTS = generateDocuments();

  console.log(`\n📁 Source: ${BASE_DIR}`);
  console.log(`🌐 Wiki Base Path: ${WIKI_BASE_PATH}`);
  console.log(`📄 Sub-modules: ${SUB_MODULES.length}`);
  console.log(`📄 Documents per sub-module: ${DOC_TYPES.length}`);
  console.log(`📄 Total documents to import: ${DOCUMENTS.length}`);

  const results = {
    success: [],
    failed: []
  };

  // Ensure Stock Overview landing page exists
  console.log('\n━━━ Ensuring Parent Pages ━━━');
  await ensureStockOverviewLanding();

  // Process documents by sub-module
  for (const subModule of SUB_MODULES) {
    console.log(`\n━━━ Importing ${subModule.name} Documents ━━━`);

    const subModuleDocs = DOCUMENTS.filter(d => d.folder === subModule.folder);

    for (const doc of subModuleDocs) {
      const result = await processDocument(doc);

      if (result.success) {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Print summary
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                         IMPORT SUMMARY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  console.log(`\n✅ Successful: ${results.success.length}`);

  // Group by sub-module for better readability
  for (const subModule of SUB_MODULES) {
    const subModuleResults = results.success.filter(r => r.path.includes(subModule.slug));
    if (subModuleResults.length > 0) {
      console.log(`\n   ${subModule.name}:`);
      subModuleResults.forEach(r => {
        console.log(`   • ${r.path} (${r.action})`);
      });
    }
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(r => {
      console.log(`   • ${r.path}: ${r.error}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Wiki.js URLs:');
  console.log(`   Landing: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}`);

  for (const subModule of SUB_MODULES) {
    console.log(`\n   ${subModule.name}:`);
    console.log(`   - Index: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/${subModule.slug}`);
    console.log(`   - BR: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/${subModule.slug}/business-requirements`);
    console.log(`   - UC: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/${subModule.slug}/use-cases`);
    console.log(`   - TS: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/${subModule.slug}/technical-specification`);
    console.log(`   - FD: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/${subModule.slug}/flow-diagrams`);
    console.log(`   - VAL: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/${subModule.slug}/validations`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
