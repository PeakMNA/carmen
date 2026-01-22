#!/usr/bin/env node

/**
 * Import Recipe Management Documentation to Wiki.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/operational-planning/recipe-management';
const WIKI_BASE_PATH = 'operational-planning/recipe-management';

const SUBSECTIONS = [
  { name: 'Categories', folder: 'categories', slug: 'categories' },
  { name: 'Cuisine Types', folder: 'cuisine-types', slug: 'cuisine-types' },
  { name: 'Recipes', folder: 'recipes', slug: 'recipes' },
  { name: 'Units', folder: 'units', slug: 'units' },
  { name: 'Equipment', folder: 'equipment', slug: 'equipment' }
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

function transformLinks(content, subsectionSlug) {
  let transformed = content;

  // Transform local doc links
  const map = { 'BR': 'business-requirements', 'UC': 'use-cases', 'TS': 'technical-specification', 'DD': 'data-dictionary', 'FD': 'flow-diagrams', 'VAL': 'validations', 'INDEX': '' };

  for (const [prefix, pathSuffix] of Object.entries(map)) {
    const pattern = new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/${prefix}-${subsectionSlug}\\.md\\)`, 'g');
    const suffix = pathSuffix ? `/${pathSuffix}` : '';
    transformed = transformed.replace(pattern, `[$1](/${WIKI_BASE_PATH}/${subsectionSlug}${suffix})`);
  }

  // Transform parent links
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/([^/]+)\/\)/g, `[$1](/${WIKI_BASE_PATH}/$2)`);
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/([^/]+)\/\)/g, '[$1](/operational-planning/$2)');
  transformed = transformed.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/\.\.\/([^/]+)\/\)/g, '[$1](/$2)');

  return transformed;
}

async function upsertPage(wikiPath, title, description, content, tags) {
  // Check if exists
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
  console.log('║        Import Recipe Management Documentation to Wiki.js         ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  let failCount = 0;

  // Import main INDEX
  console.log('━━━ Recipe Management (Main) ━━━');
  const mainIndexPath = path.join(BASE_DIR, 'INDEX-recipe-management.md');
  if (fs.existsSync(mainIndexPath)) {
    let content = fs.readFileSync(mainIndexPath, 'utf-8');
    const result = await upsertPage(WIKI_BASE_PATH, 'Recipe Management', 'Recipe Management documentation hub', content, ['operational-planning', 'recipe-management', 'index']);
    console.log(`  INDEX: ${result.success ? '✅' : '❌'} ${result.action}`);
    result.success ? successCount++ : failCount++;
    await new Promise(r => setTimeout(r, 300));
  }

  // Import each subsection
  for (const sub of SUBSECTIONS) {
    console.log(`\n━━━ ${sub.name} ━━━`);

    for (const docType of DOC_TYPES) {
      // Try different filename patterns
      const patterns = [
        `${docType.prefix}-${sub.slug}.md`,
        `${docType.prefix}-${sub.folder}.md`,
        docType.prefix === 'INDEX' ? `INDEX-${sub.slug}.md` : null,
        docType.prefix === 'INDEX' ? 'index.md' : null
      ].filter(Boolean);

      let filePath = null;
      let content = null;

      for (const pattern of patterns) {
        const tryPath = path.join(BASE_DIR, sub.folder, pattern);
        if (fs.existsSync(tryPath)) {
          filePath = tryPath;
          content = fs.readFileSync(tryPath, 'utf-8');
          break;
        }
      }

      if (!content) continue;

      content = transformLinks(content, sub.slug);

      const wikiPath = `${WIKI_BASE_PATH}/${sub.slug}${docType.pathSuffix}`;
      const title = `${sub.name}${docType.titleSuffix}`;
      const tags = ['operational-planning', 'recipe-management', sub.slug, ...docType.extraTags];

      const result = await upsertPage(wikiPath, title, `${sub.name} ${docType.prefix} documentation`, content, tags);
      console.log(`  ${docType.prefix}: ${result.success ? '✅' : '❌'} ${result.action}`);
      result.success ? successCount++ : failCount++;

      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                         IMPORT SUMMARY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Successful: ${successCount}`);
  if (failCount > 0) console.log(`❌ Failed: ${failCount}`);

  console.log('\n📚 Wiki.js URLs:');
  console.log(`   Main: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}`);
  for (const sub of SUBSECTIONS) {
    console.log(`   ${sub.name}: http://dev.blueledgers.com:3993/en/${WIKI_BASE_PATH}/${sub.slug}`);
  }
}

main().catch(console.error);
