#!/usr/bin/env node

/**
 * Update Documentation in Wiki.js
 *
 * This script reads markdown files from docs/app directories
 * and updates corresponding pages in Wiki.js via the GraphQL API.
 * It updates existing pages or creates new ones if they don't exist.
 *
 * Usage:
 *   node update-wiki-pages.js                    # Update all modules
 *   node update-wiki-pages.js procurement        # Update specific module
 *   node update-wiki-pages.js procurement/credit-note  # Update specific submodule
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app';

/**
 * GraphQL query to get page by path
 */
const GET_PAGE_QUERY = `
query GetPage($path: String!) {
  pages {
    singleByPath(path: $path, locale: "en") {
      id
      path
      title
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
        updatedAt
      }
    }
  }
}
`;

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
 * Module configurations - maps local directory to wiki path
 */
const MODULE_CONFIG = {
  'procurement': {
    submodules: ['credit-note', 'goods-received-notes', 'my-approvals', 'purchase-orders', 'purchase-request-templates', 'purchase-requests'],
    wikiPathOverrides: {
      'goods-received-notes': 'goods-received-note'
    }
  },
  'product-management': {
    submodules: ['products', 'categories', 'units']
  },
  'inventory-management': {
    submodules: ['inventory-adjustments', 'inventory-overview', 'inventory-transactions', 'stock-in', 'stock-overview', 'spot-check', 'period-end', 'lot-based-costing', 'periodic-average-costing', 'fractional-inventory', 'transactions']
  },
  'store-operations': {
    submodules: ['store-requisitions', 'stock-replenishment', 'wastage-reporting']
  },
  'vendor-management': {
    submodules: ['vendor-directory', 'price-lists', 'pricelist-templates', 'requests-for-pricing', 'vendor-portal']
  },
  'operational-planning': {
    submodules: ['recipe-management', 'menu-engineering', 'demand-forecasting']
  },
  'finance': {
    submodules: ['currency-management', 'department-management', 'account-code-mapping', 'exchange-rate-management']
  },
  'system-administration': {
    submodules: ['user-management', 'permission-management', 'location-management', 'workflow', 'settings', 'business-rules', 'system-integrations']
  }
};

/**
 * Extract title from markdown content
 */
function extractTitle(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return filename
    .replace(/\.md$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Extract description from markdown content
 */
function extractDescription(content) {
  const lines = content.split('\n');
  let descLines = [];
  let foundHeading = false;

  for (let line of lines) {
    if (line.match(/^#/)) {
      foundHeading = true;
      continue;
    }
    if (foundHeading && line.trim()) {
      descLines.push(line.trim());
      if (descLines.length >= 3) break;
    }
  }

  return descLines.join(' ').substring(0, 200);
}

/**
 * Generate tags from filename and module/submodule
 */
function generateTags(filename, moduleName, submoduleName) {
  const tags = [moduleName];
  if (submoduleName) tags.push(submoduleName);

  if (filename.startsWith('BR-')) tags.push('business-requirements');
  if (filename.startsWith('DD-')) tags.push('data-dictionary');
  if (filename.startsWith('FD-')) tags.push('flow-diagrams');
  if (filename.startsWith('TS-')) tags.push('technical-specification');
  if (filename.startsWith('UC-')) tags.push('use-cases');
  if (filename.startsWith('VAL-')) tags.push('validation-rules');
  if (filename.startsWith('PC-')) tags.push('page-components');
  if (filename.startsWith('ARC-')) tags.push('architecture');

  return tags;
}

/**
 * Get page ID by path
 */
async function getPageId(pagePath) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: GET_PAGE_QUERY,
        variables: { path: pagePath }
      })
    });

    const result = await response.json();

    if (result.errors) {
      return null;
    }

    return result.data?.pages?.singleByPath?.id || null;

  } catch (error) {
    console.error(`   ❌ Error getting page ID: ${error.message}`);
    return null;
  }
}

/**
 * Update a page in Wiki.js
 */
async function updatePage(pageId, pageData) {
  try {
    const variables = {
      id: pageId,
      content: pageData.content,
      description: pageData.description,
      editor: 'markdown',
      isPublished: true,
      isPrivate: false,
      locale: 'en',
      path: pageData.path,
      tags: pageData.tags,
      title: pageData.title
    };

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
      console.error(`   ❌ GraphQL Error: ${result.errors[0].message}`);
      return { success: false, error: result.errors[0].message };
    }

    const responseResult = result.data?.pages?.update?.responseResult;

    if (responseResult?.succeeded) {
      return { success: true };
    } else {
      console.error(`   ❌ Update failed: ${responseResult?.message}`);
      return { success: false, error: responseResult?.message };
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Create a page in Wiki.js
 */
async function createPage(pageData) {
  try {
    const variables = {
      content: pageData.content,
      description: pageData.description,
      editor: 'markdown',
      isPublished: true,
      isPrivate: false,
      locale: 'en',
      path: pageData.path,
      tags: pageData.tags,
      title: pageData.title
    };

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
      console.error(`   ❌ GraphQL Error: ${result.errors[0].message}`);
      return { success: false, error: result.errors[0].message };
    }

    const responseResult = result.data?.pages?.create?.responseResult;

    if (responseResult?.succeeded) {
      return { success: true, id: result.data.pages.create.page.id };
    } else {
      console.error(`   ❌ Create failed: ${responseResult?.message}`);
      return { success: false, error: responseResult?.message };
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Find markdown files in a directory (non-recursive for submodules)
 */
function findMarkdownFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      if (!entry.name.includes('.backup') && !entry.name.startsWith('.')) {
        files.push(path.join(dir, entry.name));
      }
    }
  }

  return files;
}

/**
 * Find markdown files recursively (includes nested 'pages' directories)
 */
function findMarkdownFilesRecursive(dir, basePath = '') {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectories (like 'pages')
      const subPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      files.push(...findMarkdownFilesRecursive(fullPath, subPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (!entry.name.includes('.backup') && !entry.name.startsWith('.')) {
        files.push({
          fullPath,
          relativePath: basePath,
          filename: entry.name
        });
      }
    }
  }

  return files;
}

/**
 * Process a single markdown file
 */
async function processFile(fileInfo, moduleName, submoduleName, wikiSubmoduleName) {
  const { fullPath, relativePath, filename } = fileInfo;
  const docName = filename.replace('.md', '').toLowerCase();

  // Build wiki path: module/submodule/[relative-path/]docname
  let wikiPath = moduleName;
  if (wikiSubmoduleName) {
    wikiPath += `/${wikiSubmoduleName}`;
  }
  if (relativePath) {
    wikiPath += `/${relativePath}`;
  }
  wikiPath += `/${docName}`;

  console.log(`\n📄 Processing: ${filename}`);
  console.log(`   📁 Source: ${fullPath}`);
  console.log(`   🔗 Wiki Path: /en/${wikiPath}`);

  // Read file content
  const content = fs.readFileSync(fullPath, 'utf-8');
  const title = extractTitle(content, filename);
  const description = extractDescription(content);
  const tags = generateTags(filename, moduleName, submoduleName);

  console.log(`   📝 Title: ${title}`);

  const pageData = {
    content,
    description,
    path: wikiPath,
    tags,
    title
  };

  // Get existing page ID
  const pageId = await getPageId(wikiPath);

  if (pageId) {
    // Update existing page
    console.log(`   🔄 Updating existing page (ID: ${pageId})...`);
    const result = await updatePage(pageId, pageData);

    if (result.success) {
      console.log(`   ✅ Updated successfully!`);
      return { success: true, action: 'updated', path: wikiPath };
    } else {
      return { success: false, action: 'update_failed', path: wikiPath, error: result.error };
    }
  } else {
    // Create new page
    console.log(`   🆕 Page not found, creating new page...`);
    const result = await createPage(pageData);

    if (result.success) {
      console.log(`   ✅ Created successfully! (ID: ${result.id})`);
      return { success: true, action: 'created', path: wikiPath };
    } else {
      return { success: false, action: 'create_failed', path: wikiPath, error: result.error };
    }
  }
}

/**
 * Process a submodule
 */
async function processSubmodule(moduleName, submoduleName, results) {
  const config = MODULE_CONFIG[moduleName];
  const wikiSubmoduleName = config?.wikiPathOverrides?.[submoduleName] || submoduleName;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📦 Processing: ${moduleName}/${submoduleName}`);
  console.log('─'.repeat(60));

  const submoduleDir = path.join(BASE_DIR, moduleName, submoduleName);

  if (!fs.existsSync(submoduleDir)) {
    console.log(`   ⚠️ Directory not found: ${submoduleDir}`);
    return;
  }

  // Find all markdown files including nested directories
  const files = findMarkdownFilesRecursive(submoduleDir);

  // Convert to expected format for files in root of submodule
  const fileInfos = files.map(f => {
    if (typeof f === 'string') {
      return { fullPath: f, relativePath: '', filename: path.basename(f) };
    }
    return f;
  });

  console.log(`   Found ${fileInfos.length} documentation files`);

  for (const fileInfo of fileInfos) {
    const result = await processFile(fileInfo, moduleName, submoduleName, wikiSubmoduleName);

    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push(result);
    }

    // Delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

/**
 * Process a module (all submodules)
 */
async function processModule(moduleName, results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📁 MODULE: ${moduleName.toUpperCase()}`);
  console.log('='.repeat(60));

  const config = MODULE_CONFIG[moduleName];

  if (!config) {
    console.log(`   ⚠️ Unknown module: ${moduleName}`);
    return;
  }

  for (const submodule of config.submodules) {
    await processSubmodule(moduleName, submodule, results);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  console.log('🚀 Wiki.js Documentation Update Script\n');
  console.log(`📂 Base directory: ${BASE_DIR}`);

  const results = {
    success: [],
    failed: []
  };

  if (args.length === 0) {
    // Update all modules
    console.log('📝 Mode: Update ALL modules\n');

    for (const moduleName of Object.keys(MODULE_CONFIG)) {
      await processModule(moduleName, results);
    }
  } else {
    const target = args[0];

    if (target.includes('/')) {
      // Specific submodule: procurement/credit-note
      const [moduleName, submoduleName] = target.split('/');
      console.log(`📝 Mode: Update specific submodule - ${moduleName}/${submoduleName}\n`);
      await processSubmodule(moduleName, submoduleName, results);
    } else {
      // Specific module: procurement
      console.log(`📝 Mode: Update specific module - ${target}\n`);
      await processModule(target, results);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(60));

  const updated = results.success.filter(r => r.action === 'updated').length;
  const created = results.success.filter(r => r.action === 'created').length;

  console.log(`✅ Successfully processed: ${results.success.length} pages`);
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Created: ${created}`);
  console.log(`❌ Failed: ${results.failed.length} pages`);

  if (results.success.length > 0) {
    console.log('\n✅ Successfully processed pages:');
    results.success.forEach(({ path, action }) => {
      const icon = action === 'updated' ? '🔄' : '🆕';
      console.log(`   ${icon} /en/${path}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed pages:');
    results.failed.forEach(({ path, error }) => {
      console.log(`   - ${path}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔗 Wiki.js URL: http://dev.blueledgers.com:3993');
  console.log('\n✨ Update complete!\n');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
