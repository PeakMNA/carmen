#!/usr/bin/env node

/**
 * Import All Inventory Management Documentation to Wiki.js
 *
 * This script imports all inventory-management module documentation including:
 * - fractional-inventory
 * - inventory-overview
 * - lot-based-costing
 * - period-end
 * - periodic-average-costing
 * - physical-count
 * - spot-check
 * - stock-in
 * - transaction-categories
 * - transactions
 *
 * Usage: node import-inventory-management-all.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/inventory-management';
const WIKI_BASE_PATH = 'inventory-management';

/**
 * Modules to import (excluding already imported: stock-overview, inventory-adjustments)
 */
const MODULES = [
  {
    name: 'Fractional Inventory',
    folder: 'fractional-inventory',
    slug: 'fractional-inventory',
    description: 'Fractional inventory units and decimal quantity management'
  },
  {
    name: 'Inventory Overview',
    folder: 'inventory-overview',
    slug: 'inventory-overview',
    description: 'High-level inventory dashboard and summary views'
  },
  {
    name: 'Lot-Based Costing',
    folder: 'lot-based-costing',
    slug: 'lot-based-costing',
    description: 'FIFO lot tracking and cost layer management'
  },
  {
    name: 'Period End',
    folder: 'period-end',
    slug: 'period-end',
    description: 'Period close procedures and inventory valuation snapshots'
  },
  {
    name: 'Periodic Average Costing',
    folder: 'periodic-average-costing',
    slug: 'periodic-average-costing',
    description: 'Periodic weighted average cost calculation methods'
  },
  {
    name: 'Physical Count',
    folder: 'physical-count',
    slug: 'physical-count',
    description: 'Physical inventory counting and variance management'
  },
  {
    name: 'Spot Check',
    folder: 'spot-check',
    slug: 'spot-check',
    description: 'Quick inventory verification and spot counting'
  },
  {
    name: 'Stock In',
    folder: 'stock-in',
    slug: 'stock-in',
    description: 'Stock receipt and inbound inventory transactions'
  },
  {
    name: 'Transaction Categories',
    folder: 'transaction-categories',
    slug: 'transaction-categories',
    description: 'Inventory transaction type classification and management'
  },
  {
    name: 'Inventory Transactions',
    folder: 'transactions',
    slug: 'transactions',
    description: 'Core inventory transaction processing and history'
  }
];

/**
 * Standard document types
 */
const DOC_TYPES = [
  { prefix: 'INDEX', pathSuffix: '', titleSuffix: '', extraTags: ['index', 'navigation'] },
  { prefix: 'BR', pathSuffix: '/business-requirements', titleSuffix: ' - Business Requirements', extraTags: ['business-requirements'] },
  { prefix: 'UC', pathSuffix: '/use-cases', titleSuffix: ' - Use Cases', extraTags: ['use-cases'] },
  { prefix: 'TS', pathSuffix: '/technical-specification', titleSuffix: ' - Technical Specification', extraTags: ['technical-specification'] },
  { prefix: 'DD', pathSuffix: '/data-dictionary', titleSuffix: ' - Data Dictionary', extraTags: ['data-dictionary'] },
  { prefix: 'FD', pathSuffix: '/flow-diagrams', titleSuffix: ' - Flow Diagrams', extraTags: ['flow-diagrams'] },
  { prefix: 'VAL', pathSuffix: '/validations', titleSuffix: ' - Validations', extraTags: ['validations'] }
];

/**
 * Additional document types for specific modules
 */
const EXTRA_DOC_TYPES = {
  'lot-based-costing': [
    { prefix: 'PROCESS', pathSuffix: '/process', titleSuffix: ' - Process Flow', extraTags: ['process'] }
  ],
  'periodic-average-costing': [
    { prefix: 'PROCESS', pathSuffix: '/process', titleSuffix: ' - Process Flow', extraTags: ['process'] }
  ]
};

const CREATE_PAGE_MUTATION = `
mutation CreatePage($content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) {
  pages {
    create(content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) {
      responseResult { succeeded errorCode slug message }
      page { id path title }
    }
  }
}`;

const UPDATE_PAGE_MUTATION = `
mutation UpdatePage($id: Int!, $content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) {
  pages {
    update(id: $id, content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) {
      responseResult { succeeded errorCode slug message }
      page { id path title }
    }
  }
}`;

const GET_PAGE_BY_PATH_QUERY = `
query GetPageByPath($path: String!, $locale: String!) {
  pages {
    singleByPath(path: $path, locale: $locale) { id path title }
  }
}`;

/**
 * Transform markdown links to WikiJS paths
 */
function transformLinks(content, moduleSlug) {
  let transformed = content;

  // Transform local doc links for this module
  const docPrefixes = ['BR', 'UC', 'TS', 'DD', 'FD', 'VAL', 'INDEX', 'PROCESS', 'SM'];
  for (const prefix of docPrefixes) {
    const pattern = new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/${prefix}-${moduleSlug}\\.md\\)`, 'g');
    const pathMap = {
      'BR': 'business-requirements',
      'UC': 'use-cases',
      'TS': 'technical-specification',
      'DD': 'data-dictionary',
      'FD': 'flow-diagrams',
      'VAL': 'validations',
      'INDEX': '',
      'PROCESS': 'process',
      'SM': 'shared-methods'
    };
    const suffix = pathMap[prefix] ? `/${pathMap[prefix]}` : '';
    transformed = transformed.replace(pattern, `[$1](/${WIKI_BASE_PATH}/${moduleSlug}${suffix})`);
  }

  // Transform links with anchors
  transformed = transformed.replace(
    new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/(BR|UC|TS|DD|FD|VAL|INDEX)-${moduleSlug}\\.md#([^)]+)\\)`, 'g'),
    (match, text, prefix, anchor) => {
      const pathMap = { 'BR': 'business-requirements', 'UC': 'use-cases', 'TS': 'technical-specification', 'DD': 'data-dictionary', 'FD': 'flow-diagrams', 'VAL': 'validations', 'INDEX': '' };
      const suffix = pathMap[prefix] ? `/${pathMap[prefix]}` : '';
      return `[${text}](/${WIKI_BASE_PATH}/${moduleSlug}${suffix}#${anchor})`;
    }
  );

  // Transform parent directory links
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/([^/]+)\/\)/g, `[$1](/${WIKI_BASE_PATH}/$2)`);
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/([^/]+)\/([^)]+)\)/g, `[$1](/${WIKI_BASE_PATH}/$2/$3)`);

  // Transform shared-methods links
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/shared-methods\/([^)]+)\)/g, '[$1](/shared-methods/$2)');

  // Transform other module links
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/([^/]+)\/([^)]*)\)/g, '[$1](/$2/$3)');
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/([^/]+)\/\)/g, '[$1](/$2)');

  return transformed;
}

/**
 * Generate Quick Navigation section
 */
function generateQuickNav(moduleSlug) {
  return `
---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/${WIKI_BASE_PATH}/${moduleSlug}/business-requirements)<br/>Business Requirements | [**UC**](/${WIKI_BASE_PATH}/${moduleSlug}/use-cases)<br/>Use Cases | [**TS**](/${WIKI_BASE_PATH}/${moduleSlug}/technical-specification)<br/>Technical Spec |
| [**DD**](/${WIKI_BASE_PATH}/${moduleSlug}/data-dictionary)<br/>Data Dictionary | [**FD**](/${WIKI_BASE_PATH}/${moduleSlug}/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/${WIKI_BASE_PATH}/${moduleSlug}/validations)<br/>Validations |

---
`;
}

/**
 * Create default INDEX page content
 */
function createDefaultIndex(module) {
  return `# ${module.name}

**Module**: Inventory Management
**Sub-Module**: ${module.name}
**Route**: \`/inventory-management/${module.slug}\`

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/${WIKI_BASE_PATH}/${module.slug}/business-requirements)<br/>Business Requirements | [**UC**](/${WIKI_BASE_PATH}/${module.slug}/use-cases)<br/>Use Cases | [**TS**](/${WIKI_BASE_PATH}/${module.slug}/technical-specification)<br/>Technical Spec |
| [**DD**](/${WIKI_BASE_PATH}/${module.slug}/data-dictionary)<br/>Data Dictionary | [**FD**](/${WIKI_BASE_PATH}/${module.slug}/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/${WIKI_BASE_PATH}/${module.slug}/validations)<br/>Validations |

---

## Overview

${module.description}

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [Business Requirements](/${WIKI_BASE_PATH}/${module.slug}/business-requirements) | Business rules and functional requirements |
| [Use Cases](/${WIKI_BASE_PATH}/${module.slug}/use-cases) | User workflows and scenarios |
| [Technical Specification](/${WIKI_BASE_PATH}/${module.slug}/technical-specification) | Architecture and implementation details |
| [Data Dictionary](/${WIKI_BASE_PATH}/${module.slug}/data-dictionary) | Data structures and schema definitions |
| [Flow Diagrams](/${WIKI_BASE_PATH}/${module.slug}/flow-diagrams) | Visual workflow diagrams |
| [Validations](/${WIKI_BASE_PATH}/${module.slug}/validations) | Validation rules and constraints |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Stock Overview](/${WIKI_BASE_PATH}/stock-overview) | Stock level monitoring |
| [Inventory Adjustments](/${WIKI_BASE_PATH}/inventory-adjustments) | Stock corrections |
| [Inventory Transactions](/${WIKI_BASE_PATH}/transactions) | Transaction history |

---

> This is the documentation hub for ${module.name}. Select a document from Quick Navigation above.
`;
}

async function getPageByPath(wikiPath) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ query: GET_PAGE_BY_PATH_QUERY, variables: { path: wikiPath, locale: 'en' } })
    });
    const result = await response.json();
    return result.data?.pages?.singleByPath || null;
  } catch (error) {
    return null;
  }
}

async function createPage(wikiPath, title, description, content, tags) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      query: CREATE_PAGE_MUTATION,
      variables: { content, description, editor: 'markdown', isPublished: true, isPrivate: false, locale: 'en', path: wikiPath, tags, title }
    })
  });
  const result = await response.json();
  if (result.data?.pages?.create?.responseResult?.succeeded) {
    return { success: true, path: wikiPath, id: result.data.pages.create.page.id, action: 'created' };
  }
  return { success: false, path: wikiPath, error: result.data?.pages?.create?.responseResult?.message || result.errors?.[0]?.message || 'Unknown error' };
}

async function updatePage(pageId, wikiPath, title, description, content, tags) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      query: UPDATE_PAGE_MUTATION,
      variables: { id: pageId, content, description, editor: 'markdown', isPublished: true, isPrivate: false, locale: 'en', path: wikiPath, tags, title }
    })
  });
  const result = await response.json();
  if (result.data?.pages?.update?.responseResult?.succeeded) {
    return { success: true, path: wikiPath, id: result.data.pages.update.page.id, action: 'updated' };
  }
  return { success: false, path: wikiPath, error: result.data?.pages?.update?.responseResult?.message || result.errors?.[0]?.message || 'Unknown error' };
}

async function upsertPage(wikiPath, title, description, content, tags) {
  const existingPage = await getPageByPath(wikiPath);
  if (existingPage) {
    return await updatePage(existingPage.id, wikiPath, title, description, content, tags);
  }
  return await createPage(wikiPath, title, description, content, tags);
}

async function processModule(module) {
  console.log(`\n━━━ ${module.name} ━━━`);
  const results = { success: [], failed: [] };

  // Get doc types for this module
  let docTypes = [...DOC_TYPES];
  if (EXTRA_DOC_TYPES[module.folder]) {
    docTypes = [...docTypes, ...EXTRA_DOC_TYPES[module.folder]];
  }

  for (const docType of docTypes) {
    // Determine filename patterns to try
    const filePatterns = [
      `${docType.prefix}-${module.slug}.md`,
      `${docType.prefix}-${module.folder}.md`,
      docType.prefix === 'INDEX' ? `INDEX-${module.slug}.md` : null,
      docType.prefix === 'INDEX' ? `INDEX-${module.folder}.md` : null,
      docType.prefix === 'INDEX' ? 'index.md' : null
    ].filter(Boolean);

    let filePath = null;
    let content = null;

    // Try to find the file
    for (const pattern of filePatterns) {
      const tryPath = path.join(BASE_DIR, module.folder, pattern);
      if (fs.existsSync(tryPath)) {
        filePath = tryPath;
        content = fs.readFileSync(tryPath, 'utf-8');
        break;
      }
    }

    // For INDEX, create default if not found
    if (!content && docType.prefix === 'INDEX') {
      content = createDefaultIndex(module);
    }

    // Skip if no content
    if (!content) {
      continue;
    }

    // Transform links
    content = transformLinks(content, module.slug);

    // Add Quick Navigation to INDEX if not present
    if (docType.prefix === 'INDEX' && !content.includes('## Quick Navigation')) {
      // Insert after first heading or at start
      const firstHeadingEnd = content.indexOf('\n', content.indexOf('#'));
      if (firstHeadingEnd > 0) {
        const insertPos = content.indexOf('\n---', firstHeadingEnd);
        if (insertPos > 0) {
          content = content.slice(0, insertPos) + generateQuickNav(module.slug) + content.slice(insertPos + 4);
        }
      }
    }

    const wikiPath = `${WIKI_BASE_PATH}/${module.slug}${docType.pathSuffix}`;
    const title = `${module.name}${docType.titleSuffix}`;
    const description = `${module.description} - ${docType.prefix}`;
    const tags = ['inventory-management', module.slug, ...docType.extraTags];

    console.log(`  ${docType.prefix}: ${wikiPath}`);

    const result = await upsertPage(wikiPath, title, description, content, tags);

    if (result.success) {
      console.log(`    ✅ ${result.action}`);
      results.success.push(result);
    } else {
      console.log(`    ❌ ${result.error}`);
      results.failed.push(result);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return results;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     Import All Inventory Management Modules to Wiki.js          ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\n📁 Source: ${BASE_DIR}`);
  console.log(`🌐 Wiki Base: ${WIKI_BASE_PATH}`);
  console.log(`📦 Modules: ${MODULES.length}`);

  const allResults = { success: [], failed: [] };

  for (const module of MODULES) {
    const results = await processModule(module);
    allResults.success.push(...results.success);
    allResults.failed.push(...results.failed);
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                         IMPORT SUMMARY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Successful: ${allResults.success.length}`);

  // Group by module
  for (const module of MODULES) {
    const moduleResults = allResults.success.filter(r => r.path.includes(module.slug));
    if (moduleResults.length > 0) {
      console.log(`\n  ${module.name}:`);
      moduleResults.forEach(r => console.log(`    • ${r.path} (${r.action})`));
    }
  }

  if (allResults.failed.length > 0) {
    console.log(`\n❌ Failed: ${allResults.failed.length}`);
    allResults.failed.forEach(r => console.log(`  • ${r.path}: ${r.error}`));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Wiki.js Base URL: http://dev.blueledgers.com:3993/en/inventory-management');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(allResults.failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
