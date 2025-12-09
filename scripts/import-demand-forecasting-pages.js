#!/usr/bin/env node

/**
 * Import Demand Forecasting Documentation to Wiki.js
 *
 * This script imports demand forecasting documentation including:
 * - INDEX (Landing/Navigation Page)
 * - BR (Business Requirements with Backend)
 * - UC (Use Cases)
 * - TS (Technical Specification)
 * - DD (Data Definition)
 * - FD (Flow Diagrams)
 * - VAL (Validations)
 *
 * Usage: node import-demand-forecasting-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/operational-planning/demand-forecasting';
const WIKI_BASE_PATH = 'operational-planning/demand-forecasting';

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
 * GraphQL query to check if a page exists
 */
const GET_PAGE_QUERY = `
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
 * Documents to import with their metadata
 */
const DOCUMENTS = [
  {
    filename: 'INDEX-demand-forecasting.md',
    wikiPath: `${WIKI_BASE_PATH}`,
    title: 'Demand Forecasting',
    description: 'Demand forecasting documentation for inventory analytics and prediction',
    tags: ['operational-planning', 'demand-forecasting', 'analytics', 'forecasting', 'inventory']
  },
  {
    filename: 'BR-demand-forecasting.md',
    wikiPath: `${WIKI_BASE_PATH}/business-requirements`,
    title: 'Demand Forecasting - Business Requirements',
    description: 'Business requirements and backend specifications for demand forecasting',
    tags: ['operational-planning', 'demand-forecasting', 'business-requirements', 'backend']
  },
  {
    filename: 'UC-demand-forecasting.md',
    wikiPath: `${WIKI_BASE_PATH}/use-cases`,
    title: 'Demand Forecasting - Use Cases',
    description: 'Use cases and user workflows for demand forecasting',
    tags: ['operational-planning', 'demand-forecasting', 'use-cases', 'workflows']
  },
  {
    filename: 'TS-demand-forecasting.md',
    wikiPath: `${WIKI_BASE_PATH}/technical-specification`,
    title: 'Demand Forecasting - Technical Specification',
    description: 'Technical architecture and component design for demand forecasting',
    tags: ['operational-planning', 'demand-forecasting', 'technical', 'architecture']
  },
  {
    filename: 'DD-demand-forecasting.md',
    wikiPath: `${WIKI_BASE_PATH}/data-definition`,
    title: 'Demand Forecasting - Data Definition',
    description: 'Data entities and models for demand forecasting',
    tags: ['operational-planning', 'demand-forecasting', 'data-model', 'entities']
  },
  {
    filename: 'FD-demand-forecasting.md',
    wikiPath: `${WIKI_BASE_PATH}/flow-diagrams`,
    title: 'Demand Forecasting - Flow Diagrams',
    description: 'Visual workflow diagrams for demand forecasting processes',
    tags: ['operational-planning', 'demand-forecasting', 'flow-diagrams', 'mermaid']
  },
  {
    filename: 'VAL-demand-forecasting.md',
    wikiPath: `${WIKI_BASE_PATH}/validations`,
    title: 'Demand Forecasting - Validations',
    description: 'Validation rules and schemas for demand forecasting',
    tags: ['operational-planning', 'demand-forecasting', 'validations', 'schemas']
  },
  {
    filename: 'UI-demand-forecasting.md',
    wikiPath: `${WIKI_BASE_PATH}/ui-design`,
    title: 'Demand Forecasting - UI Design',
    description: 'User interface design specification and wireframes for demand forecasting',
    tags: ['operational-planning', 'demand-forecasting', 'ui-design', 'wireframes', 'frontend']
  }
];

/**
 * Transform internal markdown links to Wiki.js paths
 */
function transformLinks(content) {
  // Transform relative links like ./BR-demand-forecasting.md to wiki paths
  return content
    // Transform ./BR-demand-forecasting.md -> /en/operational-planning/demand-forecasting/business-requirements
    .replace(/\(\.\/BR-demand-forecasting\.md\)/g, '(/en/operational-planning/demand-forecasting/business-requirements)')
    .replace(/\(\.\/UC-demand-forecasting\.md\)/g, '(/en/operational-planning/demand-forecasting/use-cases)')
    .replace(/\(\.\/TS-demand-forecasting\.md\)/g, '(/en/operational-planning/demand-forecasting/technical-specification)')
    .replace(/\(\.\/DD-demand-forecasting\.md\)/g, '(/en/operational-planning/demand-forecasting/data-definition)')
    .replace(/\(\.\/FD-demand-forecasting\.md\)/g, '(/en/operational-planning/demand-forecasting/flow-diagrams)')
    .replace(/\(\.\/VAL-demand-forecasting\.md\)/g, '(/en/operational-planning/demand-forecasting/validations)')
    // Transform shared method links
    .replace(/\(\.\.\/\.\.\/shared-methods\/inventory-operations\/SM-inventory-operations\.md\)/g, '(/en/shared-methods/inventory-operations)')
    .replace(/\(\.\.\/\.\.\/shared-methods\/inventory-valuation\/SM-costing-methods\.md\)/g, '(/en/shared-methods/inventory-valuation/costing-methods)');
}

/**
 * Make a GraphQL request to Wiki.js API
 */
async function graphqlRequest(query, variables) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Check if a page exists at the given path
 */
async function pageExists(pagePath) {
  try {
    const result = await graphqlRequest(GET_PAGE_QUERY, {
      path: pagePath,
      locale: 'en'
    });

    return result.data?.pages?.singleByPath || null;
  } catch (error) {
    console.error(`Error checking page existence: ${error.message}`);
    return null;
  }
}

/**
 * Create or update a page in Wiki.js
 */
async function upsertPage(doc, content) {
  const existingPage = await pageExists(doc.wikiPath);
  const transformedContent = transformLinks(content);

  const variables = {
    content: transformedContent,
    description: doc.description,
    editor: 'markdown',
    isPublished: true,
    isPrivate: false,
    locale: 'en',
    path: doc.wikiPath,
    tags: doc.tags,
    title: doc.title
  };

  if (existingPage) {
    console.log(`📝 Updating page: ${doc.wikiPath}`);
    console.log(`   Title: ${doc.title}`);
    console.log(`   Page ID: ${existingPage.id}`);

    const result = await graphqlRequest(UPDATE_PAGE_MUTATION, {
      id: existingPage.id,
      ...variables
    });

    if (result.data?.pages?.update?.responseResult?.succeeded) {
      console.log(`   ✅ Updated! Page ID: ${result.data.pages.update.page?.id || existingPage.id}`);
      return { success: true, action: 'updated', pageId: existingPage.id };
    } else {
      const error = result.data?.pages?.update?.responseResult?.message || 'Unknown error';
      console.log(`   ❌ Failed to update: ${error}`);
      return { success: false, action: 'update_failed', error };
    }
  } else {
    console.log(`📄 Creating page: ${doc.wikiPath}`);
    console.log(`   Title: ${doc.title}`);

    const result = await graphqlRequest(CREATE_PAGE_MUTATION, variables);

    if (result.data?.pages?.create?.responseResult?.succeeded) {
      const pageId = result.data.pages.create.page?.id;
      console.log(`   ✅ Created! Page ID: ${pageId}`);
      return { success: true, action: 'created', pageId };
    } else {
      const error = result.data?.pages?.create?.responseResult?.message || 'Unknown error';
      console.log(`   ❌ Failed to create: ${error}`);
      return { success: false, action: 'create_failed', error };
    }
  }
}

/**
 * Ensure parent page exists (Operational Planning)
 */
async function ensureParentPages() {
  console.log('\n━━━ Ensuring Parent Pages ━━━\n');

  const parentPath = 'operational-planning';
  const existingParent = await pageExists(parentPath);

  if (!existingParent) {
    console.log('📄 Creating Operational Planning landing page...');

    const parentContent = `# Operational Planning

Welcome to the Operational Planning documentation.

## Modules

- [Demand Forecasting](/en/operational-planning/demand-forecasting) - Inventory demand forecasting and analytics
- [Recipe Management](/en/operational-planning/recipe-management) - Recipe creation and cost management
- [Menu Engineering](/en/operational-planning/menu-engineering) - Menu performance analysis

## Overview

The Operational Planning module provides tools for:
- **Demand Forecasting**: Predict inventory needs using statistical methods
- **Recipe Management**: Create, cost, and manage recipes
- **Menu Engineering**: Analyze menu performance and profitability
- **Production Planning**: Plan production schedules (Coming Soon)

---

*Select a module above to view its documentation.*
`;

    const result = await graphqlRequest(CREATE_PAGE_MUTATION, {
      content: parentContent,
      description: 'Operational Planning module documentation',
      editor: 'markdown',
      isPublished: true,
      isPrivate: false,
      locale: 'en',
      path: parentPath,
      tags: ['operational-planning', 'module'],
      title: 'Operational Planning'
    });

    if (result.data?.pages?.create?.responseResult?.succeeded) {
      console.log('   ✅ Created Operational Planning landing page');
    } else {
      console.log('   ⚠️ Could not create parent page (may already exist)');
    }
  } else {
    console.log('✅ Operational Planning landing page already exists');
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Demand Forecasting Documentation Import to Wiki.js       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📁 Source: ${BASE_DIR}`);
  console.log(`🌐 Wiki Base Path: ${WIKI_BASE_PATH}`);
  console.log(`📄 Documents to import: ${DOCUMENTS.length}`);

  // Ensure parent pages exist
  await ensureParentPages();

  console.log('\n━━━ Importing Demand Forecasting Documents ━━━\n');

  const results = {
    success: [],
    failed: []
  };

  for (const doc of DOCUMENTS) {
    const filePath = path.join(process.cwd(), BASE_DIR, doc.filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${doc.filename}`);
      results.failed.push({ doc, error: 'File not found' });
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const result = await upsertPage(doc, content);

      if (result.success) {
        results.success.push({ doc, ...result });
      } else {
        results.failed.push({ doc, ...result });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.failed.push({ doc, error: error.message });
    }

    console.log('');
  }

  // Print summary
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        IMPORT SUMMARY                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  if (results.success.length > 0) {
    console.log(`✅ Successful: ${results.success.length}`);
    results.success.forEach(r => {
      console.log(`   • ${r.doc.wikiPath} (${r.action})`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(r => {
      console.log(`   • ${r.doc.filename}: ${r.error}`);
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
  console.log(`   UI: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/ui-design`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run the import
main().catch(console.error);
