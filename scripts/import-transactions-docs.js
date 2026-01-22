#!/usr/bin/env node
const fs = require('fs');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const docs = [
  { file: 'BR-inventory-transactions.md', suffix: '/business-requirements', title: 'Inventory Transactions - Business Requirements' },
  { file: 'UC-inventory-transactions.md', suffix: '/use-cases', title: 'Inventory Transactions - Use Cases' },
  { file: 'TS-inventory-transactions.md', suffix: '/technical-specification', title: 'Inventory Transactions - Technical Specification' },
  { file: 'DD-inventory-transactions.md', suffix: '/data-dictionary', title: 'Inventory Transactions - Data Dictionary' },
  { file: 'FD-inventory-transactions.md', suffix: '/flow-diagrams', title: 'Inventory Transactions - Flow Diagrams' },
  { file: 'VAL-inventory-transactions.md', suffix: '/validations', title: 'Inventory Transactions - Validations' }
];

const CREATE_PAGE = `mutation CreatePage($content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) { pages { create(content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) { responseResult { succeeded message } page { id } } } }`;
const UPDATE_PAGE = `mutation UpdatePage($id: Int!, $content: String!, $description: String!, $editor: String!, $isPublished: Boolean!, $isPrivate: Boolean!, $locale: String!, $path: String!, $tags: [String]!, $title: String!) { pages { update(id: $id, content: $content, description: $description, editor: $editor, isPublished: $isPublished, isPrivate: $isPrivate, locale: $locale, path: $path, tags: $tags, title: $title) { responseResult { succeeded message } page { id } } } }`;
const GET_PAGE = `query GetPage($path: String!, $locale: String!) { pages { singleByPath(path: $path, locale: $locale) { id } } }`;

function transformLinks(content) {
  const map = { 'BR': 'business-requirements', 'UC': 'use-cases', 'TS': 'technical-specification', 'DD': 'data-dictionary', 'FD': 'flow-diagrams', 'VAL': 'validations', 'INDEX': '' };

  for (const [prefix, path] of Object.entries(map)) {
    const pattern = new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/${prefix}-inventory-transactions\\.md\\)`, 'g');
    const suffix = path ? `/${path}` : '';
    content = content.replace(pattern, `[$1](/inventory-management/transactions${suffix})`);
  }

  // Transform parent links
  content = content.replace(/\[([^\]]+)\]\(\.\.\/([^/]+)\/\)/g, '[$1](/inventory-management/$2)');
  content = content.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/shared-methods\/([^)]+)\)/g, '[$1](/shared-methods/$2)');

  return content;
}

async function run() {
  console.log('Importing Inventory Transactions docs...\n');

  for (const doc of docs) {
    const filePath = `docs/app/inventory-management/transactions/${doc.file}`;
    if (!fs.existsSync(filePath)) { console.log(`Skip: ${doc.file} (not found)`); continue; }

    let content = fs.readFileSync(filePath, 'utf-8');
    content = transformLinks(content);

    const wikiPath = `inventory-management/transactions${doc.suffix}`;

    // Check if exists
    const checkRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ query: GET_PAGE, variables: { path: wikiPath, locale: 'en' } })
    });
    const checkData = await checkRes.json();
    const pageId = checkData.data?.pages?.singleByPath?.id;

    const vars = {
      content,
      description: doc.title,
      editor: 'markdown',
      isPublished: true,
      isPrivate: false,
      locale: 'en',
      path: wikiPath,
      tags: ['inventory-management', 'transactions'],
      title: doc.title
    };

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
    console.log(`${wikiPath}: ${success ? '✅' : '❌'} ${pageId ? 'updated' : 'created'}`);

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\nDone!');
}

run().catch(console.error);
