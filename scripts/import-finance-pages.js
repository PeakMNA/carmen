#!/usr/bin/env node
/**
 * Wiki.js Finance Module Pages Import Script
 *
 * This script imports all Finance sub-module documentation pages
 * into Wiki.js using the GraphQL API.
 *
 * Sub-modules:
 * - Account Code Mapping
 * - Currency Management
 * - Department Management
 * - Exchange Rate Management
 *
 * Usage: node import-finance-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzYzOTc5OTYwLCJleHAiOjE3OTU1Mzc1NjAsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.hRZIwCPcBSorxd5S23Bx_HNsWdGg8u_4T5blA3UDn_8oPw5WbEkTQcaPcfzx8j8uTSEtbXcZfZR4_dfTJ5MZ3lLoU2P0pRLHaRw6_6YpQMcMvse_t0Vwk24UzVrpvqf-jCcf6p_aUMjXV_gKYPfi4oF_YUem65VWEfm3bmbKxuSFGpVI5LR-lCyVQT92_vvbJ-ZJwZHUGLNs56mlWjjVsh3QIHvy2tO8BzmxpDRzICtV8lqJECRKRQrZTL1yAaMIKqmlOBy9pu955CZSq7ulQECtDdKsi1Ehx1G9ka5ZcvHVskJ2oLzZhAyrTozwJm282eHEkZ-8ybghAcvkwgHSSA';

const DOCS_DIR = path.join(__dirname, '../docs/app/finance');

// Page definitions for all finance sub-modules
const pages = [
  // ============================================
  // Finance Module Index
  // ============================================
  {
    path: 'finance',
    title: 'Finance',
    file: 'INTEGRATION-COVERAGE.md',
    description: 'Finance module documentation hub',
    tags: ['finance', 'documentation']
  },

  // ============================================
  // Account Code Mapping
  // ============================================
  {
    path: 'finance/account-code-mapping',
    title: 'Account Code Mapping',
    file: 'account-code-mapping/BR-account-code-mapping.md',
    description: 'Account Code Mapping - Business Requirements',
    tags: ['finance', 'account-code-mapping', 'documentation']
  },
  {
    path: 'finance/account-code-mapping/business-requirements',
    title: 'Business Requirements - Account Code Mapping',
    file: 'account-code-mapping/BR-account-code-mapping.md',
    description: 'Business requirements for Account Code Mapping',
    tags: ['finance', 'account-code-mapping', 'business-requirements']
  },
  {
    path: 'finance/account-code-mapping/use-cases',
    title: 'Use Cases - Account Code Mapping',
    file: 'account-code-mapping/UC-account-code-mapping.md',
    description: 'Use cases for Account Code Mapping',
    tags: ['finance', 'account-code-mapping', 'use-cases']
  },
  {
    path: 'finance/account-code-mapping/technical-specification',
    title: 'Technical Specification - Account Code Mapping',
    file: 'account-code-mapping/TS-account-code-mapping.md',
    description: 'Technical specification for Account Code Mapping',
    tags: ['finance', 'account-code-mapping', 'technical-specification']
  },
  {
    path: 'finance/account-code-mapping/data-definition',
    title: 'Data Definition - Account Code Mapping',
    file: 'account-code-mapping/DD-account-code-mapping.md',
    description: 'Data definitions for Account Code Mapping',
    tags: ['finance', 'account-code-mapping', 'data-definition']
  },
  {
    path: 'finance/account-code-mapping/flow-diagrams',
    title: 'Flow Diagrams - Account Code Mapping',
    file: 'account-code-mapping/FD-account-code-mapping.md',
    description: 'Flow diagrams for Account Code Mapping',
    tags: ['finance', 'account-code-mapping', 'flow-diagrams']
  },
  {
    path: 'finance/account-code-mapping/validations',
    title: 'Validations - Account Code Mapping',
    file: 'account-code-mapping/VAL-account-code-mapping.md',
    description: 'Validation rules for Account Code Mapping',
    tags: ['finance', 'account-code-mapping', 'validations']
  },

  // ============================================
  // Currency Management
  // ============================================
  {
    path: 'finance/currency-management',
    title: 'Currency Management',
    file: 'currency-management/BR-currency-management.md',
    description: 'Currency Management - Business Requirements',
    tags: ['finance', 'currency-management', 'documentation']
  },
  {
    path: 'finance/currency-management/business-requirements',
    title: 'Business Requirements - Currency Management',
    file: 'currency-management/BR-currency-management.md',
    description: 'Business requirements for Currency Management',
    tags: ['finance', 'currency-management', 'business-requirements']
  },
  {
    path: 'finance/currency-management/use-cases',
    title: 'Use Cases - Currency Management',
    file: 'currency-management/UC-currency-management.md',
    description: 'Use cases for Currency Management',
    tags: ['finance', 'currency-management', 'use-cases']
  },
  {
    path: 'finance/currency-management/technical-specification',
    title: 'Technical Specification - Currency Management',
    file: 'currency-management/TS-currency-management.md',
    description: 'Technical specification for Currency Management',
    tags: ['finance', 'currency-management', 'technical-specification']
  },
  {
    path: 'finance/currency-management/data-definition',
    title: 'Data Definition - Currency Management',
    file: 'currency-management/DD-currency-management.md',
    description: 'Data definitions for Currency Management',
    tags: ['finance', 'currency-management', 'data-definition']
  },
  {
    path: 'finance/currency-management/flow-diagrams',
    title: 'Flow Diagrams - Currency Management',
    file: 'currency-management/FD-currency-management.md',
    description: 'Flow diagrams for Currency Management',
    tags: ['finance', 'currency-management', 'flow-diagrams']
  },
  {
    path: 'finance/currency-management/validations',
    title: 'Validations - Currency Management',
    file: 'currency-management/VAL-currency-management.md',
    description: 'Validation rules for Currency Management',
    tags: ['finance', 'currency-management', 'validations']
  },

  // ============================================
  // Department Management
  // ============================================
  {
    path: 'finance/department-management',
    title: 'Department Management',
    file: 'department-management/BR-department-management.md',
    description: 'Department Management - Business Requirements',
    tags: ['finance', 'department-management', 'documentation']
  },
  {
    path: 'finance/department-management/business-requirements',
    title: 'Business Requirements - Department Management',
    file: 'department-management/BR-department-management.md',
    description: 'Business requirements for Department Management',
    tags: ['finance', 'department-management', 'business-requirements']
  },
  {
    path: 'finance/department-management/use-cases',
    title: 'Use Cases - Department Management',
    file: 'department-management/UC-department-management.md',
    description: 'Use cases for Department Management',
    tags: ['finance', 'department-management', 'use-cases']
  },
  {
    path: 'finance/department-management/technical-specification',
    title: 'Technical Specification - Department Management',
    file: 'department-management/TS-department-management.md',
    description: 'Technical specification for Department Management',
    tags: ['finance', 'department-management', 'technical-specification']
  },
  {
    path: 'finance/department-management/data-definition',
    title: 'Data Definition - Department Management',
    file: 'department-management/DD-department-management.md',
    description: 'Data definitions for Department Management',
    tags: ['finance', 'department-management', 'data-definition']
  },
  {
    path: 'finance/department-management/flow-diagrams',
    title: 'Flow Diagrams - Department Management',
    file: 'department-management/FD-department-management.md',
    description: 'Flow diagrams for Department Management',
    tags: ['finance', 'department-management', 'flow-diagrams']
  },
  {
    path: 'finance/department-management/validations',
    title: 'Validations - Department Management',
    file: 'department-management/VAL-department-management.md',
    description: 'Validation rules for Department Management',
    tags: ['finance', 'department-management', 'validations']
  },

  // ============================================
  // Exchange Rate Management
  // ============================================
  {
    path: 'finance/exchange-rate-management',
    title: 'Exchange Rate Management',
    file: 'exchange-rate-management/BR-exchange-rate-management.md',
    description: 'Exchange Rate Management - Business Requirements',
    tags: ['finance', 'exchange-rate-management', 'documentation']
  },
  {
    path: 'finance/exchange-rate-management/business-requirements',
    title: 'Business Requirements - Exchange Rate Management',
    file: 'exchange-rate-management/BR-exchange-rate-management.md',
    description: 'Business requirements for Exchange Rate Management',
    tags: ['finance', 'exchange-rate-management', 'business-requirements']
  },
  {
    path: 'finance/exchange-rate-management/use-cases',
    title: 'Use Cases - Exchange Rate Management',
    file: 'exchange-rate-management/UC-exchange-rate-management.md',
    description: 'Use cases for Exchange Rate Management',
    tags: ['finance', 'exchange-rate-management', 'use-cases']
  },
  {
    path: 'finance/exchange-rate-management/technical-specification',
    title: 'Technical Specification - Exchange Rate Management',
    file: 'exchange-rate-management/TS-exchange-rate-management.md',
    description: 'Technical specification for Exchange Rate Management',
    tags: ['finance', 'exchange-rate-management', 'technical-specification']
  },
  {
    path: 'finance/exchange-rate-management/data-definition',
    title: 'Data Definition - Exchange Rate Management',
    file: 'exchange-rate-management/DD-exchange-rate-management.md',
    description: 'Data definitions for Exchange Rate Management',
    tags: ['finance', 'exchange-rate-management', 'data-definition']
  },
  {
    path: 'finance/exchange-rate-management/flow-diagrams',
    title: 'Flow Diagrams - Exchange Rate Management',
    file: 'exchange-rate-management/FD-exchange-rate-management.md',
    description: 'Flow diagrams for Exchange Rate Management',
    tags: ['finance', 'exchange-rate-management', 'flow-diagrams']
  },
  {
    path: 'finance/exchange-rate-management/validations',
    title: 'Validations - Exchange Rate Management',
    file: 'exchange-rate-management/VAL-exchange-rate-management.md',
    description: 'Validation rules for Exchange Rate Management',
    tags: ['finance', 'exchange-rate-management', 'validations']
  }
];

// GraphQL mutation to create page
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

// GraphQL query to list pages
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

// Cache for page list
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
    tags: page.tags || ['finance', 'documentation'],
    title: page.title
  };

  try {
    let result;

    if (existingPage) {
      // Update existing page
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
  console.log('║       Wiki.js Finance Module Documentation Import          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`📁 Source directory: ${DOCS_DIR}`);
  console.log(`📝 Total pages to import: ${pages.length}\n`);

  console.log('Sub-modules:');
  console.log('  • Account Code Mapping (7 pages)');
  console.log('  • Currency Management (7 pages)');
  console.log('  • Department Management (7 pages)');
  console.log('  • Exchange Rate Management (7 pages)');
  console.log('  • Finance Index (1 page)\n');

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
    console.log('\n🎉 All Finance module pages imported successfully!');
    console.log('\n📚 Pages available at:');
    console.log('   Finance Hub:');
    console.log('   - http://dev.blueledgers.com:3993/en/finance');
    console.log('\n   Account Code Mapping:');
    console.log('   - http://dev.blueledgers.com:3993/en/finance/account-code-mapping');
    console.log('\n   Currency Management:');
    console.log('   - http://dev.blueledgers.com:3993/en/finance/currency-management');
    console.log('\n   Department Management:');
    console.log('   - http://dev.blueledgers.com:3993/en/finance/department-management');
    console.log('\n   Exchange Rate Management:');
    console.log('   - http://dev.blueledgers.com:3993/en/finance/exchange-rate-management');
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
