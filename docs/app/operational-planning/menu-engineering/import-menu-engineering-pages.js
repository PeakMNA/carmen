#!/usr/bin/env node

/**
 * Wiki.js Import Script - Menu Engineering Module Documentation
 *
 * This script imports all Menu Engineering module documentation pages to Wiki.js
 *
 * Prerequisites:
 * - Wiki.js instance running and accessible
 * - Valid API token with page creation permissions
 * - Node.js environment with fetch support
 *
 * Configuration:
 * Set environment variables before running:
 * - WIKIJS_URL: Wiki.js instance URL (e.g., https://wiki.example.com)
 * - WIKIJS_TOKEN: API authentication token
 *
 * Usage:
 * WIKIJS_URL=https://wiki.example.com WIKIJS_TOKEN=your-token node import-menu-engineering-pages.js
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const WIKIJS_URL = process.env.WIKIJS_URL || 'http://localhost:3000';
const WIKIJS_TOKEN = process.env.WIKIJS_TOKEN;
const DOCS_BASE_PATH = __dirname;

// Page definitions for Menu Engineering module
const PAGES = [
  {
    path: 'operational-planning/menu-engineering/index',
    title: 'Menu Engineering - Documentation Index',
    description: 'Navigation hub for Menu Engineering module documentation',
    file: 'INDEX-menu-engineering.md',
    tags: ['operational-planning', 'menu-engineering', 'index', 'navigation'],
    isPublished: true,
    locale: 'en',
  },
  {
    path: 'operational-planning/menu-engineering/business-requirements',
    title: 'Menu Engineering - Business Requirements',
    description: 'Comprehensive business requirements and backend implementation specifications for Menu Engineering module',
    file: 'BR-menu-engineering.md',
    tags: ['operational-planning', 'menu-engineering', 'business-requirements', 'backend-requirements'],
    isPublished: true,
    locale: 'en',
  },
  {
    path: 'operational-planning/menu-engineering/use-cases',
    title: 'Menu Engineering - Use Cases',
    description: 'Detailed use cases for Menu Engineering functionality',
    file: 'UC-menu-engineering.md',
    tags: ['operational-planning', 'menu-engineering', 'use-cases'],
    isPublished: true,
    locale: 'en',
  },
  {
    path: 'operational-planning/menu-engineering/technical-specification',
    title: 'Menu Engineering - Technical Specification',
    description: 'Technical architecture and implementation details for Menu Engineering module',
    file: 'TS-menu-engineering.md',
    tags: ['operational-planning', 'menu-engineering', 'technical-specification', 'architecture'],
    isPublished: true,
    locale: 'en',
  },
  {
    path: 'operational-planning/menu-engineering/data-definition',
    title: 'Menu Engineering - Data Definition',
    description: 'Database schemas and data structures for Menu Engineering module',
    file: 'DD-menu-engineering.md',
    tags: ['operational-planning', 'menu-engineering', 'data-definition', 'database-schema'],
    isPublished: true,
    locale: 'en',
  },
  {
    path: 'operational-planning/menu-engineering/flow-diagrams',
    title: 'Menu Engineering - Flow Diagrams',
    description: 'Process flow diagrams and workflow visualizations for Menu Engineering (Mermaid 8.8.2 compatible)',
    file: 'FD-menu-engineering.md',
    tags: ['operational-planning', 'menu-engineering', 'flow-diagrams', 'mermaid', 'workflows'],
    isPublished: true,
    locale: 'en',
  },
  {
    path: 'operational-planning/menu-engineering/validation-rules',
    title: 'Menu Engineering - Validation Rules',
    description: 'Input validation and business rule specifications for Menu Engineering module',
    file: 'VAL-menu-engineering.md',
    tags: ['operational-planning', 'menu-engineering', 'validation-rules', 'business-rules'],
    isPublished: true,
    locale: 'en',
  },
];

/**
 * GraphQL mutation to create a new page in Wiki.js
 */
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

/**
 * GraphQL query to check if a page exists
 */
const GET_PAGE_QUERY = `
  query GetPage($id: Int!) {
    pages {
      single(id: $id) {
        id
        path
        title
      }
    }
  }
`;

/**
 * Send GraphQL request to Wiki.js API
 */
async function sendGraphQLRequest(query, variables) {
  const response = await fetch(`${WIKIJS_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WIKIJS_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors, null, 2)}`);
  }

  return result.data;
}

/**
 * Read markdown file content
 */
async function readMarkdownFile(filename) {
  const filePath = path.join(DOCS_BASE_PATH, filename);
  return await fs.readFile(filePath, 'utf-8');
}

/**
 * Import a single page to Wiki.js
 */
async function importPage(page) {
  try {
    console.log(`\nImporting: ${page.title}`);
    console.log(`  File: ${page.file}`);
    console.log(`  Path: ${page.path}`);

    // Read markdown content
    const content = await readMarkdownFile(page.file);

    // Create page via GraphQL
    const variables = {
      content,
      description: page.description,
      editor: 'markdown',
      isPublished: page.isPublished,
      isPrivate: false,
      locale: page.locale,
      path: page.path,
      tags: page.tags,
      title: page.title,
    };

    const result = await sendGraphQLRequest(CREATE_PAGE_MUTATION, variables);

    if (result.pages.create.responseResult.succeeded) {
      console.log(`  ✅ SUCCESS - Page ID: ${result.pages.create.page.id}`);
      return {
        success: true,
        page: page.title,
        id: result.pages.create.page.id,
        path: result.pages.create.page.path,
      };
    } else {
      console.log(`  ❌ FAILED - ${result.pages.create.responseResult.message}`);
      return {
        success: false,
        page: page.title,
        error: result.pages.create.responseResult.message,
        errorCode: result.pages.create.responseResult.errorCode,
      };
    }
  } catch (error) {
    console.log(`  ❌ ERROR - ${error.message}`);
    return {
      success: false,
      page: page.title,
      error: error.message,
    };
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Menu Engineering Module - Wiki.js Import Script             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Wiki.js URL: ${WIKIJS_URL}`);
  console.log(`Total pages to import: ${PAGES.length}`);
  console.log('');

  // Validate configuration
  if (!WIKIJS_TOKEN) {
    console.error('❌ ERROR: WIKIJS_TOKEN environment variable is not set');
    console.error('');
    console.error('Usage:');
    console.error('  WIKIJS_URL=https://wiki.example.com WIKIJS_TOKEN=your-token node import-menu-engineering-pages.js');
    process.exit(1);
  }

  // Import all pages
  const results = [];
  for (const page of PAGES) {
    const result = await importPage(page);
    results.push(result);

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Import Summary                                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total pages: ${PAGES.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');

  if (successful > 0) {
    console.log('Successfully imported pages:');
    results
      .filter(r => r.success)
      .forEach(r => {
        console.log(`  - ${r.page} (ID: ${r.id})`);
        console.log(`    ${WIKIJS_URL}/${r.path}`);
      });
    console.log('');
  }

  if (failed > 0) {
    console.log('Failed pages:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.page}`);
        console.log(`    Error: ${r.error}`);
        if (r.errorCode) {
          console.log(`    Code: ${r.errorCode}`);
        }
      });
    console.log('');
  }

  // Page mapping reference
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Page ID Mapping Reference                                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Expected Wiki.js Page IDs (if sequential from previous wastage-reporting):');
  console.log('  225: Menu Engineering - Documentation Index');
  console.log('  226: Menu Engineering - Business Requirements');
  console.log('  227: Menu Engineering - Use Cases');
  console.log('  228: Menu Engineering - Technical Specification');
  console.log('  229: Menu Engineering - Data Definition');
  console.log('  230: Menu Engineering - Flow Diagrams');
  console.log('  231: Menu Engineering - Validation Rules');
  console.log('');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run the import
main().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});
