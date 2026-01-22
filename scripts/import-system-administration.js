#!/usr/bin/env node

/**
 * Import System Administration Documentation to Wiki.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/system-administration';

// Main modules at the system-administration level
const MAIN_MODULES = [
  { name: 'Account Code Mapping', folder: 'account-code-mapping', slug: 'account-code-mapping' },
  { name: 'Business Rules', folder: 'business-rules', slug: 'business-rules' },
  { name: 'Certifications', folder: 'certifications', slug: 'certifications' },
  { name: 'Delivery Points', folder: 'delivery-points', slug: 'delivery-points' },
  { name: 'Location Management', folder: 'location-management', slug: 'location-management' },
  { name: 'Monitoring', folder: 'monitoring', slug: 'monitoring' },
  { name: 'Notification Preferences', folder: 'notification-preferences', slug: 'notification-preferences' },
  { name: 'Permission Management', folder: 'permission-management', slug: 'permission-management' },
  { name: 'Settings', folder: 'settings', slug: 'settings' },
  { name: 'System Integrations', folder: 'system-integrations', slug: 'system-integrations' },
  { name: 'User Management', folder: 'user-management', slug: 'user-management' },
  { name: 'Workflow', folder: 'workflow', slug: 'workflow' }
];

// Sub-modules under permission-management
const PERMISSION_SUB_MODULES = [
  { name: 'Policies', folder: 'policies', slug: 'policies', parent: 'permission-management' },
  { name: 'Roles', folder: 'roles', slug: 'roles', parent: 'permission-management' },
  { name: 'Subscription', folder: 'subscription', slug: 'subscription', parent: 'permission-management' }
];

// Sub-modules under system-integrations
const INTEGRATION_SUB_MODULES = [
  { name: 'POS Integration', folder: 'pos-integration', slug: 'pos-integration', parent: 'system-integrations' }
];

const DOC_TYPES = [
  { prefix: 'INDEX', pathSuffix: '', titleSuffix: '', extraTags: ['index'] },
  { prefix: 'BR', pathSuffix: '/business-requirements', titleSuffix: ' - Business Requirements', extraTags: ['business-requirements'] },
  { prefix: 'UC', pathSuffix: '/use-cases', titleSuffix: ' - Use Cases', extraTags: ['use-cases'] },
  { prefix: 'TS', pathSuffix: '/technical-specification', titleSuffix: ' - Technical Specification', extraTags: ['technical-specification'] },
  { prefix: 'DD', pathSuffix: '/data-dictionary', titleSuffix: ' - Data Dictionary', extraTags: ['data-dictionary'] },
  { prefix: 'FD', pathSuffix: '/flow-diagrams', titleSuffix: ' - Flow Diagrams', extraTags: ['flow-diagrams'] },
  { prefix: 'VAL', pathSuffix: '/validations', titleSuffix: ' - Validations', extraTags: ['validations'] }
];

const CREATE_PAGE = `mutation CreatePage($content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) { pages { create(content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) { responseResult { succeeded message } page { id } } } }`;
const UPDATE_PAGE = `mutation UpdatePage($id: Int!, $content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) { pages { update(id: $id, content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) { responseResult { succeeded message } page { id } } } }`;
const GET_PAGE = `query GetPage($path: String!, $locale: String!) { pages { singleByPath(path: $path, locale: $locale) { id } } }`;

function transformLinks(content, moduleSlug, parentSlug = null) {
  let transformed = content;
  const basePath = parentSlug ? `system-administration/${parentSlug}/${moduleSlug}` : `system-administration/${moduleSlug}`;

  const map = { 'BR': 'business-requirements', 'UC': 'use-cases', 'TS': 'technical-specification', 'DD': 'data-dictionary', 'FD': 'flow-diagrams', 'VAL': 'validations', 'INDEX': '' };

  for (const [prefix, pathSuffix] of Object.entries(map)) {
    // Links without anchors
    const pattern = new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/${prefix}-${moduleSlug}\\.md\\)`, 'g');
    const suffix = pathSuffix ? `/${pathSuffix}` : '';
    transformed = transformed.replace(pattern, `[$1](/${basePath}${suffix})`);

    // Links with anchors
    const patternWithAnchor = new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/${prefix}-${moduleSlug}\\.md#([^)]+)\\)`, 'g');
    transformed = transformed.replace(patternWithAnchor, `[$1](/${basePath}${suffix}#$2)`);
  }

  // Transform parent links
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/([^/]+)\/index\.md\)/g, '[$1](/system-administration/$2)');
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/([^/]+)\/\)/g, '[$1](/system-administration/$2)');
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/([^/]+)\/\)/g, '[$1](/$2)');

  return transformed;
}

async function upsertPage(wikiPath, title, description, content, tags) {
  const checkRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ query: GET_PAGE, variables: { path: wikiPath, locale: 'en' } })
  });
  const checkData = await checkRes.json();
  const pageId = checkData.data?.pages?.singleByPath?.id;

  const vars = { content, description, editor: 'markdown', isPublished: true, isPrivate: false, locale: 'en', path: wikiPath, tags, title };

  let res;
  if (pageId) {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ query: UPDATE_PAGE, variables: { id: pageId, ...vars } })
    });
  } else {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ query: CREATE_PAGE, variables: vars })
    });
  }
  const data = await res.json();
  const success = data.data?.pages?.create?.responseResult?.succeeded || data.data?.pages?.update?.responseResult?.succeeded;
  return { success, action: pageId ? 'updated' : 'created' };
}

async function importModule(module, baseDirPath, wikiBasePath, parentSlug = null) {
  let successCount = 0;

  for (const docType of DOC_TYPES) {
    const patterns = [
      `${docType.prefix}-${module.slug}.md`,
      docType.prefix === 'INDEX' ? `INDEX-${module.slug}.md` : null,
      docType.prefix === 'INDEX' ? 'index.md' : null
    ].filter(Boolean);

    let content = null;
    for (const pattern of patterns) {
      const filePath = path.join(baseDirPath, module.folder, pattern);
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf-8');
        break;
      }
    }

    if (!content) {
      console.log(`  ${docType.prefix}: ⏭️ skipped (not found)`);
      continue;
    }

    content = transformLinks(content, module.slug, parentSlug);

    const wikiPath = `${wikiBasePath}/${module.slug}${docType.pathSuffix}`;
    const title = `${module.name}${docType.titleSuffix}`;
    const tags = ['system-administration', module.slug, ...docType.extraTags];
    if (parentSlug) tags.push(parentSlug);

    const result = await upsertPage(wikiPath, title, `${module.name} documentation`, content, tags);
    console.log(`  ${docType.prefix}: ${result.success ? '✅' : '❌'} ${result.action}`);
    if (result.success) successCount++;

    await new Promise(r => setTimeout(r, 200));
  }

  return successCount;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║        Import System Administration to Wiki.js                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  let totalSuccess = 0;

  // Import main modules
  for (const module of MAIN_MODULES) {
    console.log(`━━━ ${module.name} ━━━`);
    const count = await importModule(module, BASE_DIR, 'system-administration');
    totalSuccess += count;
    console.log('');
  }

  // Import permission-management sub-modules
  console.log('━━━ Permission Management Sub-Modules ━━━\n');
  for (const module of PERMISSION_SUB_MODULES) {
    console.log(`  ┌── ${module.name}`);
    const basePath = path.join(BASE_DIR, 'permission-management');
    const count = await importModule(module, basePath, 'system-administration/permission-management', 'permission-management');
    totalSuccess += count;
    console.log('');
  }

  // Import system-integrations sub-modules
  console.log('━━━ System Integrations Sub-Modules ━━━\n');
  for (const module of INTEGRATION_SUB_MODULES) {
    console.log(`  ┌── ${module.name}`);
    const basePath = path.join(BASE_DIR, 'system-integrations');
    const count = await importModule(module, basePath, 'system-administration/system-integrations', 'system-integrations');
    totalSuccess += count;
    console.log('');
  }

  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                         IMPORT SUMMARY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Successful: ${totalSuccess}`);
  console.log('\n📚 Wiki.js Base URL: http://dev.blueledgers.com:3993/en/system-administration');
}

main().catch(console.error);
