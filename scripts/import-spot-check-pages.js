#!/usr/bin/env node

/**
 * Import Spot Check Documentation to Wiki.js
 *
 * This script imports all documentation for the Spot Check sub-module:
 * - INDEX (Landing/Navigation Page)
 * - BR (Business Requirements)
 * - UC (Use Cases)
 * - TS (Technical Specification)
 * - DD (Data Definition)
 * - FD (Flow Diagrams)
 * - VAL (Validations)
 *
 * Usage: node import-spot-check-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/inventory-management/spot-check';
const WIKI_BASE_PATH = 'inventory-management/spot-check';

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
 * Document configurations for Spot Check
 */
const DOCUMENTS = [
  {
    filename: 'INDEX-spot-check.md',
    wikiPath: WIKI_BASE_PATH,
    title: 'Spot Check',
    description: 'Central navigation page for Spot Check documentation',
    tags: ['inventory-management', 'spot-check', 'index', 'navigation', 'landing-page']
  },
  {
    filename: 'BR-spot-check.md',
    wikiPath: `${WIKI_BASE_PATH}/business-requirements`,
    title: 'Spot Check - Business Requirements',
    description: 'Business rules, functional requirements, and specifications for Spot Check',
    tags: ['inventory-management', 'spot-check', 'business-requirements', 'functional-requirements']
  },
  {
    filename: 'UC-spot-check.md',
    wikiPath: `${WIKI_BASE_PATH}/use-cases`,
    title: 'Spot Check - Use Cases',
    description: 'User workflows, scenarios, and actor interactions for Spot Check',
    tags: ['inventory-management', 'spot-check', 'use-cases', 'workflows', 'scenarios']
  },
  {
    filename: 'TS-spot-check.md',
    wikiPath: `${WIKI_BASE_PATH}/technical-specification`,
    title: 'Spot Check - Technical Specification',
    description: 'System architecture, components, and implementation details for Spot Check',
    tags: ['inventory-management', 'spot-check', 'technical-specification', 'architecture', 'implementation']
  },
  {
    filename: 'DD-spot-check.md',
    wikiPath: `${WIKI_BASE_PATH}/data-definition`,
    title: 'Spot Check - Data Definition',
    description: 'TypeScript interfaces and data structures for Spot Check',
    tags: ['inventory-management', 'spot-check', 'data-definition', 'typescript', 'interfaces']
  },
  {
    filename: 'FD-spot-check.md',
    wikiPath: `${WIKI_BASE_PATH}/flow-diagrams`,
    title: 'Spot Check - Flow Diagrams',
    description: 'Visual workflow diagrams (Mermaid) for Spot Check',
    tags: ['inventory-management', 'spot-check', 'flow-diagrams', 'mermaid', 'workflows']
  },
  {
    filename: 'VAL-spot-check.md',
    wikiPath: `${WIKI_BASE_PATH}/validations`,
    title: 'Spot Check - Validations',
    description: 'Validation rules and Zod schemas for Spot Check',
    tags: ['inventory-management', 'spot-check', 'validations', 'zod', 'business-rules']
  }
];

/**
 * Transform internal markdown links to Wiki.js paths
 */
function transformLinks(content) {
  let transformed = content;

  // Transform relative links within spot-check
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/BR-spot-check\.md\)/g,
    `[$1](/${WIKI_BASE_PATH}/business-requirements)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/BR-spot-check\.md#([^)]+)\)/g,
    `[$1](/${WIKI_BASE_PATH}/business-requirements#$2)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/UC-spot-check\.md\)/g,
    `[$1](/${WIKI_BASE_PATH}/use-cases)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/UC-spot-check\.md#([^)]+)\)/g,
    `[$1](/${WIKI_BASE_PATH}/use-cases#$2)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/TS-spot-check\.md\)/g,
    `[$1](/${WIKI_BASE_PATH}/technical-specification)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/TS-spot-check\.md#([^)]+)\)/g,
    `[$1](/${WIKI_BASE_PATH}/technical-specification#$2)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/DD-spot-check\.md\)/g,
    `[$1](/${WIKI_BASE_PATH}/data-definition)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/DD-spot-check\.md#([^)]+)\)/g,
    `[$1](/${WIKI_BASE_PATH}/data-definition#$2)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/FD-spot-check\.md\)/g,
    `[$1](/${WIKI_BASE_PATH}/flow-diagrams)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/FD-spot-check\.md#([^)]+)\)/g,
    `[$1](/${WIKI_BASE_PATH}/flow-diagrams#$2)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/VAL-spot-check\.md\)/g,
    `[$1](/${WIKI_BASE_PATH}/validations)`
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\/VAL-spot-check\.md#([^)]+)\)/g,
    `[$1](/${WIKI_BASE_PATH}/validations#$2)`
  );

  // Transform links to other inventory management modules
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/physical-count-management\/([^)]+)\)/g,
    '[$1](/inventory-management/physical-count-management/$2)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/stock-overview\/([^)]+)\)/g,
    '[$1](/inventory-management/stock-overview/$2)'
  );
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\.\.\/adjustments\/([^)]+)\)/g,
    '[$1](/inventory-management/adjustments/$2)'
  );

  // Transform links to other modules
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
  transformed = transformed.replace(
    /\[([^\]]+)\]\(\/docs\/app\/product-management\/([^)]+)\)/g,
    '[$1](/product-management/$2)'
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
    console.error(`   Error checking page:`, error.message);
    return null;
  }
}

/**
 * Create a page in Wiki.js
 */
async function createPage(wikiPath, title, description, content, tags) {
  console.log(`\n Creating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);

  const variables = {
    content: content,
    description: description || 'Spot Check Documentation',
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
      console.error(`   GraphQL Error:`, result.errors[0].message);
      return { success: false, path: wikiPath, error: result.errors[0].message };
    }

    if (result.data?.pages?.create?.responseResult?.succeeded) {
      console.log(`   Created! Page ID: ${result.data.pages.create.page.id}`);
      return { success: true, path: wikiPath, id: result.data.pages.create.page.id, action: 'created' };
    } else {
      const errorMsg = result.data?.pages?.create?.responseResult?.message || 'Unknown error';
      console.error(`   Failed:`, errorMsg);
      return { success: false, path: wikiPath, error: errorMsg };
    }
  } catch (error) {
    console.error(`   Error:`, error.message);
    return { success: false, path: wikiPath, error: error.message };
  }
}

/**
 * Update an existing page in Wiki.js
 */
async function updatePage(pageId, wikiPath, title, description, content, tags) {
  console.log(`\n Updating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);
  console.log(`   Page ID: ${pageId}`);

  const variables = {
    id: pageId,
    content: content,
    description: description || 'Spot Check Documentation',
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
      console.error(`   GraphQL Error:`, result.errors[0].message);
      return { success: false, path: wikiPath, error: result.errors[0].message };
    }

    if (result.data?.pages?.update?.responseResult?.succeeded) {
      console.log(`   Updated! Page ID: ${result.data.pages.update.page.id}`);
      return { success: true, path: wikiPath, id: result.data.pages.update.page.id, action: 'updated' };
    } else {
      const errorMsg = result.data?.pages?.update?.responseResult?.message || 'Unknown error';
      console.error(`   Failed:`, errorMsg);
      return { success: false, path: wikiPath, error: errorMsg };
    }
  } catch (error) {
    console.error(`   Error:`, error.message);
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
    console.error(`   File not found: ${filePath}`);
    return { success: false, path: doc.wikiPath, error: 'File not found' };
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Transform internal links to Wiki.js paths
  content = transformLinks(content);

  return await upsertPage(doc.wikiPath, doc.title, doc.description, content, doc.tags);
}

/**
 * Main execution
 */
async function main() {
  console.log('==================================================================');
  console.log('       Spot Check Documentation Import to Wiki.js');
  console.log('==================================================================');

  console.log(`\n Source: ${BASE_DIR}`);
  console.log(` Wiki Base Path: ${WIKI_BASE_PATH}`);
  console.log(` Documents to import: ${DOCUMENTS.length}`);

  const results = {
    success: [],
    failed: []
  };

  // Process all documents
  console.log('\n--- Importing Spot Check Documents ---');

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
  console.log('\n==================================================================');
  console.log('                       IMPORT SUMMARY');
  console.log('==================================================================');

  console.log(`\n Successful: ${results.success.length}`);
  results.success.forEach(r => {
    console.log(`   - ${r.path} (${r.action})`);
  });

  if (results.failed.length > 0) {
    console.log(`\n Failed: ${results.failed.length}`);
    results.failed.forEach(r => {
      console.log(`   - ${r.path}: ${r.error}`);
    });
  }

  console.log('\n------------------------------------------------------------------');
  console.log(' Wiki.js URLs:');
  console.log(`   Index: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}`);
  console.log(`   BR: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/business-requirements`);
  console.log(`   UC: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/use-cases`);
  console.log(`   TS: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/technical-specification`);
  console.log(`   DD: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/data-definition`);
  console.log(`   FD: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/flow-diagrams`);
  console.log(`   VAL: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/validations`);
  console.log('------------------------------------------------------------------');

  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
