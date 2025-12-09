#!/usr/bin/env node
/**
 * Wiki.js Physical Count Management Pages Import Script
 *
 * This script imports the Physical Count Management documentation pages
 * into Wiki.js using the GraphQL API.
 *
 * Usage: node import-physical-count-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzYzOTc5OTYwLCJleHAiOjE3OTU1Mzc1NjAsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.hRZIwCPcBSorxd5S23Bx_HNsWdGg8u_4T5blA3UDn_8oPw5WbEkTQcaPcfzx8j8uTSEtbXcZfZR4_dfTJ5MZ3lLoU2P0pRLHaRw6_6YpQMcMvse_t0Vwk24UzVrpvqf-jCcf6p_aUMjXV_gKYPfi4oF_YUem65VWEfm3bmbKxuSFGpVI5LR-lCyVQT92_vvbJ-ZJwZHUGLNs56mlWjjVsh3QIHvy2tO8BzmxpDRzICtV8lqJECRKRQrZTL1yAaMIKqmlOBy9pu955CZSq7ulQECtDdKsi1Ehx1G9ka5ZcvHVskJ2oLzZhAyrTozwJm282eHEkZ-8ybghAcvkwgHSSA';

const DOCS_DIR = path.join(__dirname, '../docs/app/inventory-management/physical-count-management');

// Page definitions
const pages = [
  {
    path: 'inventory-management/physical-count-management',
    title: 'Physical Count Management',
    file: 'INDEX-physical-count-management.md',
    description: 'Physical Count Management documentation hub'
  },
  {
    path: 'inventory-management/physical-count-management/business-requirements',
    title: 'Business Requirements - Physical Count Management',
    file: 'BR-physical-count-management.md',
    description: 'Business requirements for Physical Count Management'
  },
  {
    path: 'inventory-management/physical-count-management/use-cases',
    title: 'Use Cases - Physical Count Management',
    file: 'UC-physical-count-management.md',
    description: 'Use cases for Physical Count Management'
  },
  {
    path: 'inventory-management/physical-count-management/technical-specification',
    title: 'Technical Specification - Physical Count Management',
    file: 'TS-physical-count-management.md',
    description: 'Technical specification for Physical Count Management'
  },
  {
    path: 'inventory-management/physical-count-management/data-definition',
    title: 'Data Definition - Physical Count Management',
    file: 'DD-physical-count-management.md',
    description: 'Data definitions for Physical Count Management'
  },
  {
    path: 'inventory-management/physical-count-management/flow-diagrams',
    title: 'Flow Diagrams - Physical Count Management',
    file: 'FD-physical-count-management.md',
    description: 'Flow diagrams for Physical Count Management'
  },
  {
    path: 'inventory-management/physical-count-management/validations',
    title: 'Validations - Physical Count Management',
    file: 'VAL-physical-count-management.md',
    description: 'Validation rules for Physical Count Management'
  }
];

// GraphQL mutation to create/update page
const createPageMutation = `
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

// GraphQL mutation to update existing page
const updatePageMutation = `
mutation UpdatePage($id: Int!, $content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) {
  pages {
    update(id: $id, content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) {
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

// GraphQL query to list pages and find by path
const listPagesQuery = `
query ListPages {
  pages {
    list {
      id
      path
      title
      locale
    }
  }
}
`;

async function graphqlRequest(query, variables) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ query, variables })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

// Cache for page list to avoid multiple API calls
let pageListCache = null;

async function getPageList() {
  if (pageListCache) {
    return pageListCache;
  }

  try {
    const data = await graphqlRequest(listPagesQuery, {});
    if (data && data.pages && data.pages.list) {
      pageListCache = data.pages.list;
      return pageListCache;
    }
    return [];
  } catch (error) {
    console.log(`   ℹ️  Error fetching page list: ${error.message}`);
    return [];
  }
}

async function checkPageExists(pagePath) {
  try {
    const pages = await getPageList();
    const existingPage = pages.find(p => p.path === pagePath && p.locale === 'en');
    return existingPage || null;
  } catch (error) {
    console.log(`   ℹ️  Page check error for ${pagePath}: ${error.message}`);
    return null;
  }
}

async function createOrUpdatePage(page) {
  const filePath = path.join(DOCS_DIR, page.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${page.file}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if page exists
  const existingPage = await checkPageExists(page.path);
  
  const variables = {
    content,
    description: page.description,
    editor: 'markdown',
    isPublished: true,
    isPrivate: false,
    locale: 'en',
    path: page.path,
    tags: ['inventory-management', 'physical-count', 'documentation'],
    title: page.title
  };

  try {
    let result;
    
    if (existingPage) {
      // Update existing page - ensure ID is an integer
      console.log(`📝 Updating existing page: ${page.path} (ID: ${existingPage.id})`);
      result = await graphqlRequest(updatePageMutation, {
        id: parseInt(existingPage.id, 10),
        ...variables
      });
      
      const updateResult = result.pages.update;
      if (updateResult.responseResult.succeeded) {
        console.log(`   ✅ Updated: ${page.title}`);
        return true;
      } else {
        console.log(`   ❌ Failed to update: ${updateResult.responseResult.message}`);
        return false;
      }
    } else {
      // Create new page
      console.log(`📄 Creating new page: ${page.path}`);
      result = await graphqlRequest(createPageMutation, variables);
      
      const createResult = result.pages.create;
      if (createResult.responseResult.succeeded) {
        console.log(`   ✅ Created: ${page.title} (ID: ${createResult.page.id})`);
        return true;
      } else {
        console.log(`   ❌ Failed to create: ${createResult.responseResult.message}`);
        return false;
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function importPages() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Wiki.js Physical Count Management Documentation Import   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📁 Source directory: ${DOCS_DIR}`);
  console.log(`📝 Total pages to import: ${pages.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const page of pages) {
    const success = await createOrUpdatePage(page);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                     Import Summary                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${pages.length}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All Physical Count Management pages imported successfully!');
    console.log('\n📚 Pages available at:');
    pages.forEach(page => {
      console.log(`   - http://dev.blueledgers.com:3993/en/${page.path}`);
    });
  } else {
    console.log('\n⚠️  Some pages failed to import. Please check the errors above.');
    process.exit(1);
  }
}

// Run the import
importPages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
