#!/usr/bin/env node

/**
 * Import Demand Forecasting and Inventory Planning to Wiki.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/operational-planning';

const MODULES = [
  { name: 'Demand Forecasting', folder: 'demand-forecasting', slug: 'demand-forecasting' },
  { name: 'Inventory Planning', folder: 'inventory-planning', slug: 'inventory-planning' }
];

const DOC_TYPES = [
  { prefix: 'INDEX', pathSuffix: '', titleSuffix: '', extraTags: ['index'] },
  { prefix: 'BR', pathSuffix: '/business-requirements', titleSuffix: ' - Business Requirements', extraTags: ['business-requirements'] },
  { prefix: 'UC', pathSuffix: '/use-cases', titleSuffix: ' - Use Cases', extraTags: ['use-cases'] },
  { prefix: 'TS', pathSuffix: '/technical-specification', titleSuffix: ' - Technical Specification', extraTags: ['technical-specification'] },
  { prefix: 'DD', pathSuffix: '/data-dictionary', titleSuffix: ' - Data Dictionary', extraTags: ['data-dictionary'] },
  { prefix: 'FD', pathSuffix: '/flow-diagrams', titleSuffix: ' - Flow Diagrams', extraTags: ['flow-diagrams'] },
  { prefix: 'VAL', pathSuffix: '/validations', titleSuffix: ' - Validations', extraTags: ['validations'] },
  { prefix: 'UI', pathSuffix: '/ui-specification', titleSuffix: ' - UI Specification', extraTags: ['ui-specification'] }
];

const CREATE_PAGE = `mutation CreatePage($content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) { pages { create(content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) { responseResult { succeeded message } page { id } } } }`;
const UPDATE_PAGE = `mutation UpdatePage($id: Int!, $content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) { pages { update(id: $id, content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) { responseResult { succeeded message } page { id } } } }`;
const GET_PAGE = `query GetPage($path: String!, $locale: String!) { pages { singleByPath(path: $path, locale: $locale) { id } } }`;

function transformLinks(content, moduleSlug) {
  let transformed = content;
  const wikiBasePath = `operational-planning/${moduleSlug}`;

  const map = { 'BR': 'business-requirements', 'UC': 'use-cases', 'TS': 'technical-specification', 'DD': 'data-dictionary', 'FD': 'flow-diagrams', 'VAL': 'validations', 'UI': 'ui-specification', 'INDEX': '' };

  for (const [prefix, pathSuffix] of Object.entries(map)) {
    const pattern = new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/${prefix}-${moduleSlug}\\.md\\)`, 'g');
    const suffix = pathSuffix ? `/${pathSuffix}` : '';
    transformed = transformed.replace(pattern, `[$1](/${wikiBasePath}${suffix})`);

    const patternWithAnchor = new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/${prefix}-${moduleSlug}\\.md#([^)]+)\\)`, 'g');
    transformed = transformed.replace(patternWithAnchor, `[$1](/${wikiBasePath}${suffix}#$2)`);
  }

  // Transform parent links
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/([^/]+)\/\)/g, '[$1](/operational-planning/$2)');
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/shared-methods\/([^)]+)\)/g, '[$1](/shared-methods/$2)');
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

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║   Import Demand Forecasting & Inventory Planning to Wiki.js     ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  let totalSuccess = 0;

  for (const module of MODULES) {
    console.log(`━━━ ${module.name} ━━━`);
    const wikiBasePath = `operational-planning/${module.slug}`;

    for (const docType of DOC_TYPES) {
      const patterns = [
        `${docType.prefix}-${module.slug}.md`,
        docType.prefix === 'INDEX' ? `INDEX-${module.slug}.md` : null,
        docType.prefix === 'INDEX' ? 'index.md' : null
      ].filter(Boolean);

      let content = null;
      for (const pattern of patterns) {
        const filePath = path.join(BASE_DIR, module.folder, pattern);
        if (fs.existsSync(filePath)) {
          content = fs.readFileSync(filePath, 'utf-8');
          break;
        }
      }

      if (!content) continue;

      content = transformLinks(content, module.slug);

      const wikiPath = `${wikiBasePath}${docType.pathSuffix}`;
      const title = `${module.name}${docType.titleSuffix}`;
      const tags = ['operational-planning', module.slug, ...docType.extraTags];

      const result = await upsertPage(wikiPath, title, `${module.name} documentation`, content, tags);
      console.log(`  ${docType.prefix}: ${result.success ? '✅' : '❌'} ${result.action}`);
      if (result.success) totalSuccess++;

      await new Promise(r => setTimeout(r, 300));
    }
    console.log('');
  }

  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                         IMPORT SUMMARY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Successful: ${totalSuccess}`);
  console.log('\n📚 Wiki.js URLs:');
  for (const module of MODULES) {
    console.log(`   ${module.name}: http://dev.blueledgers.com:3993/en/operational-planning/${module.slug}`);
  }
}

main().catch(console.error);
