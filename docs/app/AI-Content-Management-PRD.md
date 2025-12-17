# Product Requirements Document: AI-Powered Content Management System

## Executive Summary

This document outlines the requirements for building an AI-powered content management system that combines AI-generated content with human editorial control, using a modern tech stack featuring Gemini 2.5 API, Supabase, WordPress, and n8n.

**Project Goal**: Create a hybrid content platform where AI generates initial content, humans refine it through WordPress CMS, and all content is stored in Supabase with RAG capabilities via Gemini File Search API.

**Key Technologies**:
- **AI Layer**: Google Gemini 2.5 Flash/Pro with File Search Tools API
- **Backend**: Supabase (PostgreSQL, Storage, Edge Functions, Auth)
- **CMS**: WordPress with custom plugins
- **Workflow Automation**: n8n
- **Storage**: Markdown files + Database

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Problem Statement

Current content management workflows face several challenges:

1. **Manual Content Creation**: Time-consuming manual writing process
2. **Disconnected Systems**: Separate storage for content, metadata, and versions
3. **Limited AI Context**: AI content generation lacks awareness of existing content library
4. **Version Control Gaps**: No unified versioning across AI and human edits
5. **Integration Complexity**: Multiple systems require custom integration code

### Solution Approach

Build a unified platform that:
- Leverages AI (Gemini 2.5) for initial content generation
- Provides human editorial control via WordPress
- Stores content in Supabase with RAG-enabled search via Gemini File Search
- Automates workflows with n8n
- Maintains markdown file backing for portability

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Layer                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  WordPress   │    │   n8n Web    │    │  Custom Web  │      │
│  │  Admin UI    │    │   Interface  │    │  Interface   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Workflow Layer (n8n)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AI Content Gen → Supabase → Gemini Upload → WP Sync    │   │
│  │  WP Update → Supabase Sync → Gemini Re-index            │   │
│  │  RAG Query → Gemini Search → Content Enhancement        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Layer (Supabase)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Storage     │  │  Edge        │          │
│  │  Database    │  │  Buckets     │  │  Functions   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  Realtime    │  │  Auth        │                            │
│  │  Subscriptions│  │  (JWT)       │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Layer (Google Gemini)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Gemini 2.5 Flash/Pro API                                │   │
│  │  • Content Generation                                     │   │
│  │  • File Search (RAG)                                      │   │
│  │  • Semantic Search                                        │   │
│  │  • Context-Aware Enhancement                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Content Creation Flow                         │
└─────────────────────────────────────────────────────────────────┘

1. AI Generation:
   User Request → n8n → Gemini 2.5 API → Generate Content
                                      ↓
                              Supabase Edge Function
                                      ↓
                    ┌─────────────────┴──────────────────┐
                    ▼                                    ▼
            PostgreSQL (metadata)              Storage (markdown file)
                    │                                    │
                    └─────────────────┬──────────────────┘
                                      ▼
                          Gemini File Search Upload
                                      ▼
                          WordPress Post Creation

2. Human Editing:
   WP Admin Edit → Save Post → WP Webhook → n8n
                                              ↓
                              Supabase Edge Function (sync)
                                              ↓
                    ┌─────────────────┴──────────────────┐
                    ▼                                    ▼
        Update PostgreSQL Record            Update Storage File
                    │                                    │
                    └─────────────────┬──────────────────┘
                                      ▼
                          Gemini File Re-indexing
                                      ▼
                          Version Increment

3. RAG Query:
   User Query → Gemini File Search → Retrieve Context
                                      ↓
                    Gemini 2.5 with Retrieved Context
                                      ▼
                    AI-Enhanced Response with Citations
```

---

## 3. Technical Stack Details

### 3.1 Google Gemini API

**Research Reference**: [Google Blog - File Search in Gemini API](https://blog.google/technology/developers/file-search-gemini-api/)

**Official Documentation**: [Gemini API File Search Guide](https://ai.google.dev/gemini-api/docs/file-search)

#### Key Features:
- **Fully Managed RAG**: No need to build custom vector databases or embedding pipelines
- **60+ File Type Support**: PDF, DOC, TXT, MD, HTML, code files, etc.
- **Automatic Processing**: Chunking, embedding, indexing handled by Google
- **Semantic Search**: Natural language queries across all indexed content
- **Context Integration**: Retrieved context automatically injected into prompts

#### Pricing:
- **Indexing**: $0.15 per 1 million tokens
- **Storage**: FREE (included)
- **Query Embeddings**: FREE (included)
- **Generation**: Gemini 2.5 Flash ($0.075/1M input, $0.30/1M output)

#### API Endpoints:
```
POST https://generativelanguage.googleapis.com/v1beta/corpora
POST https://generativelanguage.googleapis.com/v1beta/corpora/{corpus}/documents
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

### 3.2 Supabase Infrastructure

**Components Used**:

#### 3.2.1 PostgreSQL Database
- Auto-generated REST API
- Row-Level Security (RLS)
- Real-time subscriptions via WebSockets
- Full-text search with `tsvector`

#### 3.2.2 Storage Buckets
- Markdown file storage
- Media asset storage
- Version-controlled files
- CDN integration

#### 3.2.3 Edge Functions (Deno Runtime)
- Serverless compute
- Direct Gemini API integration
- WordPress webhook handlers
- Custom business logic

#### 3.2.4 Authentication
- JWT-based auth
- Social providers (Google, GitHub)
- WordPress user sync
- Role-based access control

#### 3.2.5 Realtime
- Database change subscriptions
- Live content updates
- Collaborative editing signals

### 3.3 WordPress CMS

**Role**: Content editing interface for human editors

**Custom Plugin**: `supabase-content-sync`

**Features**:
- Bidirectional sync with Supabase
- Custom meta boxes showing Gemini metadata
- Webhook triggers on post save
- Display Gemini File Search stats

### 3.4 n8n Workflow Automation

**Role**: Orchestrate multi-system workflows

**Built-in Integrations**:
- Supabase node (native support)
- WordPress node (native support)
- HTTP Request node (for Gemini API)
- Webhook triggers

---

## 4. Database Schema

### 4.1 Supabase PostgreSQL Tables

```sql
-- Main content table
CREATE TABLE ai_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wp_post_id BIGINT UNIQUE,
    title TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    gemini_file_id VARCHAR(255) UNIQUE, -- Gemini File Search document ID
    gemini_corpus_id VARCHAR(255),      -- Gemini corpus ID
    storage_path TEXT,                  -- Supabase Storage path
    ai_generated BOOLEAN DEFAULT TRUE,
    human_edited BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Content versions history
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES ai_content(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    title TEXT,
    content TEXT,
    storage_path TEXT,
    gemini_file_id VARCHAR(255),
    change_summary TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, version_number)
);

-- Gemini interaction logs
CREATE TABLE gemini_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES ai_content(id),
    interaction_type VARCHAR(50), -- generation, search, enhancement
    prompt TEXT,
    response TEXT,
    tokens_used INT,
    model VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RAG query cache
CREATE TABLE rag_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    corpus_id VARCHAR(255),
    retrieved_contexts JSONB,
    response TEXT,
    relevance_score FLOAT,
    cached_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_content_slug ON ai_content(slug);
CREATE INDEX idx_ai_content_gemini_file ON ai_content(gemini_file_id);
CREATE INDEX idx_ai_content_wp_post ON ai_content(wp_post_id);
CREATE INDEX idx_content_versions_content ON content_versions(content_id);
CREATE INDEX idx_gemini_interactions_content ON gemini_interactions(content_id);
CREATE INDEX idx_rag_queries_text ON rag_queries USING gin(to_tsvector('english', query_text));

-- RLS Policies
ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all published content
CREATE POLICY "Public content is viewable by everyone"
ON ai_content FOR SELECT
USING (status = 'published');

-- Policy: Authenticated users can create content
CREATE POLICY "Authenticated users can insert content"
ON ai_content FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own content
CREATE POLICY "Users can update own content"
ON ai_content FOR UPDATE
USING (auth.uid() = created_by);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_content_updated_at
BEFORE UPDATE ON ai_content
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create version on content update
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert version record
    INSERT INTO content_versions (
        content_id,
        version_number,
        title,
        content,
        storage_path,
        gemini_file_id,
        changed_by
    ) VALUES (
        OLD.id,
        OLD.version,
        OLD.title,
        OLD.content,
        OLD.storage_path,
        OLD.gemini_file_id,
        NEW.updated_by
    );

    -- Increment version number
    NEW.version = OLD.version + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_version_on_update
BEFORE UPDATE ON ai_content
FOR EACH ROW
WHEN (OLD.content IS DISTINCT FROM NEW.content)
EXECUTE FUNCTION create_content_version();
```

### 4.2 Supabase Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('content-markdown', 'content-markdown', false),
    ('content-media', 'content-media', true),
    ('content-versions', 'content-versions', false);

-- Storage policies for markdown bucket
CREATE POLICY "Authenticated users can upload markdown"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'content-markdown'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can read their markdown files"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-markdown');

-- Storage policies for media bucket (public)
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'content-media'
    AND auth.role() = 'authenticated'
);
```

---

## 5. Supabase Edge Functions

### 5.1 `gemini-generate-content` Edge Function

**Purpose**: Generate content using Gemini 2.5 API and store in Supabase

**File**: `supabase/functions/gemini-generate-content/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { topic, contentType, style, targetLength } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Generate content with Gemini 2.5 Flash
    const geminiPrompt = `Create a ${contentType} about "${topic}" in ${style} style.
Target length: ${targetLength} words.
Format the output in Markdown with proper headings, lists, and formatting.`

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: geminiPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    const geminiData = await geminiResponse.json()
    const generatedContent = geminiData.candidates[0].content.parts[0].text

    // Create slug from title
    const slug = topic.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Save content to Supabase database
    const { data: contentRecord, error: dbError } = await supabase
      .from('ai_content')
      .insert({
        title: topic,
        slug: slug,
        content: generatedContent,
        ai_generated: true,
        status: 'draft',
        metadata: {
          contentType,
          style,
          targetLength,
          actualLength: generatedContent.split(/\s+/).length
        }
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Save markdown file to Supabase Storage
    const markdownPath = `${contentRecord.id}/${slug}.md`
    const { error: storageError } = await supabase.storage
      .from('content-markdown')
      .upload(markdownPath, new Blob([generatedContent], { type: 'text/markdown' }))

    if (storageError) throw storageError

    // Update content record with storage path
    await supabase
      .from('ai_content')
      .update({ storage_path: markdownPath })
      .eq('id', contentRecord.id)

    // Log Gemini interaction
    await supabase
      .from('gemini_interactions')
      .insert({
        content_id: contentRecord.id,
        interaction_type: 'generation',
        prompt: geminiPrompt,
        response: generatedContent,
        tokens_used: geminiData.usageMetadata?.totalTokenCount || 0,
        model: 'gemini-2.5-flash'
      })

    return new Response(
      JSON.stringify({
        success: true,
        contentId: contentRecord.id,
        content: generatedContent,
        storagePath: markdownPath
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 5.2 `gemini-upload-to-file-search` Edge Function

**Purpose**: Upload content to Gemini File Search for RAG

**File**: `supabase/functions/gemini-upload-to-file-search/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const GEMINI_CORPUS_ID = Deno.env.get('GEMINI_CORPUS_ID')! // Pre-created corpus
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { contentId } = await req.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Fetch content from database
    const { data: content, error: fetchError } = await supabase
      .from('ai_content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (fetchError) throw fetchError

    // Download markdown file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('content-markdown')
      .download(content.storage_path)

    if (downloadError) throw downloadError

    // Convert Blob to base64 for Gemini upload
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64Content = btoa(String.fromCharCode(...uint8Array))

    // Upload to Gemini File Search
    const uploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/corpora/${GEMINI_CORPUS_ID}/documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          displayName: content.title,
          mimeType: 'text/markdown',
          inlineData: {
            data: base64Content
          },
          metadata: {
            contentId: contentId,
            slug: content.slug,
            version: content.version,
            aiGenerated: content.ai_generated.toString(),
            humanEdited: content.human_edited.toString()
          }
        })
      }
    )

    const uploadData = await uploadResponse.json()

    if (!uploadResponse.ok) {
      throw new Error(`Gemini upload failed: ${JSON.stringify(uploadData)}`)
    }

    const geminiFileId = uploadData.name.split('/').pop()

    // Update content record with Gemini file ID
    await supabase
      .from('ai_content')
      .update({
        gemini_file_id: geminiFileId,
        gemini_corpus_id: GEMINI_CORPUS_ID
      })
      .eq('id', contentId)

    // Log interaction
    await supabase
      .from('gemini_interactions')
      .insert({
        content_id: contentId,
        interaction_type: 'file_upload',
        response: JSON.stringify(uploadData),
        model: 'gemini-file-search'
      })

    return new Response(
      JSON.stringify({
        success: true,
        geminiFileId,
        corpusId: GEMINI_CORPUS_ID
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 5.3 `gemini-rag-query` Edge Function

**Purpose**: Query Gemini File Search and generate context-aware responses

**File**: `supabase/functions/gemini-rag-query/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const GEMINI_CORPUS_ID = Deno.env.get('GEMINI_CORPUS_ID')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { query, useCache = true } = await req.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Check cache for recent identical queries
    if (useCache) {
      const { data: cachedQuery } = await supabase
        .from('rag_queries')
        .select('*')
        .eq('query_text', query)
        .gt('cached_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (cachedQuery) {
        return new Response(
          JSON.stringify({
            success: true,
            response: cachedQuery.response,
            contexts: cachedQuery.retrieved_contexts,
            cached: true
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Query Gemini with File Search
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: query }]
          }],
          tools: [{
            fileSearchTools: {
              corpusId: GEMINI_CORPUS_ID
            }
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    const geminiData = await geminiResponse.json()
    const response = geminiData.candidates[0].content.parts[0].text

    // Extract retrieved contexts (if available in response metadata)
    const contexts = geminiData.candidates[0]?.groundingMetadata?.retrievedContexts || []

    // Cache the query result (1 hour TTL)
    const cachedUntil = new Date(Date.now() + 3600000).toISOString()

    await supabase
      .from('rag_queries')
      .insert({
        query_text: query,
        corpus_id: GEMINI_CORPUS_ID,
        retrieved_contexts: contexts,
        response: response,
        relevance_score: contexts[0]?.relevanceScore || null,
        cached_until: cachedUntil
      })

    return new Response(
      JSON.stringify({
        success: true,
        response,
        contexts,
        cached: false,
        tokensUsed: geminiData.usageMetadata?.totalTokenCount || 0
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 5.4 `wordpress-sync-webhook` Edge Function

**Purpose**: Handle WordPress post updates and sync to Supabase

**File**: `supabase/functions/wordpress-sync-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { wpPostId, postTitle, postContent, postStatus } = await req.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Find existing content record by WordPress post ID
    const { data: existing } = await supabase
      .from('ai_content')
      .select('*')
      .eq('wp_post_id', wpPostId)
      .single()

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('ai_content')
        .update({
          title: postTitle,
          content: postContent,
          status: postStatus,
          human_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('wp_post_id', wpPostId)

      if (updateError) throw updateError

      // Update markdown file in storage
      const { error: storageError } = await supabase.storage
        .from('content-markdown')
        .update(
          existing.storage_path,
          new Blob([postContent], { type: 'text/markdown' }),
          { upsert: true }
        )

      if (storageError) throw storageError

      return new Response(
        JSON.stringify({
          success: true,
          action: 'updated',
          contentId: existing.id
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      // Create new record (WordPress post created outside AI flow)
      const slug = postTitle.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data: newContent, error: insertError } = await supabase
        .from('ai_content')
        .insert({
          wp_post_id: wpPostId,
          title: postTitle,
          slug: slug,
          content: postContent,
          status: postStatus,
          ai_generated: false,
          human_edited: true
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Save to storage
      const markdownPath = `${newContent.id}/${slug}.md`
      await supabase.storage
        .from('content-markdown')
        .upload(markdownPath, new Blob([postContent], { type: 'text/markdown' }))

      // Update with storage path
      await supabase
        .from('ai_content')
        .update({ storage_path: markdownPath })
        .eq('id', newContent.id)

      return new Response(
        JSON.stringify({
          success: true,
          action: 'created',
          contentId: newContent.id
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 6. WordPress Integration

### 6.1 Custom Plugin: `supabase-content-sync`

**Purpose**: Sync WordPress posts with Supabase and display Gemini metadata

**File Structure**:
```
wp-content/plugins/supabase-content-sync/
├── supabase-content-sync.php
├── includes/
│   ├── class-supabase-api.php
│   ├── class-post-sync.php
│   └── class-meta-boxes.php
└── assets/
    ├── css/
    │   └── admin-styles.css
    └── js/
        └── admin-scripts.js
```

**Main Plugin File**: `supabase-content-sync.php`

```php
<?php
/**
 * Plugin Name: Supabase Content Sync
 * Description: Syncs WordPress posts with Supabase and displays Gemini File Search metadata
 * Version: 1.0.0
 * Author: Your Name
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SCS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SCS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once SCS_PLUGIN_DIR . 'includes/class-supabase-api.php';
require_once SCS_PLUGIN_DIR . 'includes/class-post-sync.php';
require_once SCS_PLUGIN_DIR . 'includes/class-meta-boxes.php';

// Initialize plugin
function scs_init() {
    // Register settings
    add_action('admin_init', 'scs_register_settings');

    // Add settings page
    add_action('admin_menu', 'scs_add_settings_page');

    // Initialize post sync
    new SCS_Post_Sync();

    // Initialize meta boxes
    new SCS_Meta_Boxes();
}
add_action('plugins_loaded', 'scs_init');

// Register plugin settings
function scs_register_settings() {
    register_setting('scs_settings', 'scs_supabase_url');
    register_setting('scs_settings', 'scs_supabase_anon_key');
    register_setting('scs_settings', 'scs_webhook_url');
}

// Add settings page to admin menu
function scs_add_settings_page() {
    add_options_page(
        'Supabase Content Sync Settings',
        'Supabase Sync',
        'manage_options',
        'scs-settings',
        'scs_render_settings_page'
    );
}

// Render settings page
function scs_render_settings_page() {
    ?>
    <div class="wrap">
        <h1>Supabase Content Sync Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('scs_settings');
            do_settings_sections('scs_settings');
            ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="scs_supabase_url">Supabase URL</label>
                    </th>
                    <td>
                        <input type="url"
                               id="scs_supabase_url"
                               name="scs_supabase_url"
                               value="<?php echo esc_attr(get_option('scs_supabase_url')); ?>"
                               class="regular-text" />
                        <p class="description">Your Supabase project URL (e.g., https://xxx.supabase.co)</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="scs_supabase_anon_key">Supabase Anon Key</label>
                    </th>
                    <td>
                        <input type="text"
                               id="scs_supabase_anon_key"
                               name="scs_supabase_anon_key"
                               value="<?php echo esc_attr(get_option('scs_supabase_anon_key')); ?>"
                               class="regular-text" />
                        <p class="description">Your Supabase anonymous key</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="scs_webhook_url">Webhook URL</label>
                    </th>
                    <td>
                        <input type="url"
                               id="scs_webhook_url"
                               name="scs_webhook_url"
                               value="<?php echo esc_attr(get_option('scs_webhook_url')); ?>"
                               class="regular-text" />
                        <p class="description">Supabase Edge Function webhook URL</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
```

**Post Sync Class**: `includes/class-post-sync.php`

```php
<?php
class SCS_Post_Sync {

    public function __construct() {
        // Hook into post save
        add_action('save_post', array($this, 'sync_post_to_supabase'), 10, 3);
    }

    public function sync_post_to_supabase($post_id, $post, $update) {
        // Skip autosaves and revisions
        if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
            return;
        }

        // Only sync posts
        if ($post->post_type !== 'post') {
            return;
        }

        // Get webhook URL from settings
        $webhook_url = get_option('scs_webhook_url');
        if (empty($webhook_url)) {
            return;
        }

        // Prepare post data
        $post_data = array(
            'wpPostId' => $post_id,
            'postTitle' => $post->post_title,
            'postContent' => $post->post_content,
            'postStatus' => $post->post_status,
            'postSlug' => $post->post_name,
            'postExcerpt' => $post->post_excerpt,
            'postAuthor' => get_the_author_meta('display_name', $post->post_author),
        );

        // Send webhook to Supabase
        $response = wp_remote_post($webhook_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . get_option('scs_supabase_anon_key'),
            ),
            'body' => json_encode($post_data),
            'timeout' => 15,
        ));

        if (is_wp_error($response)) {
            error_log('Supabase sync error: ' . $response->get_error_message());
            return;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code === 200) {
            $data = json_decode($response_body, true);

            // Store Supabase content ID as post meta
            if (isset($data['contentId'])) {
                update_post_meta($post_id, '_supabase_content_id', $data['contentId']);
            }

            // Update last sync time
            update_post_meta($post_id, '_supabase_last_sync', current_time('mysql'));
        } else {
            error_log('Supabase sync failed: ' . $response_body);
        }
    }
}
```

**Meta Boxes Class**: `includes/class-meta-boxes.php`

```php
<?php
class SCS_Meta_Boxes {

    public function __construct() {
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
    }

    public function add_meta_boxes() {
        add_meta_box(
            'scs_gemini_info',
            'Gemini File Search Info',
            array($this, 'render_gemini_meta_box'),
            'post',
            'side',
            'default'
        );
    }

    public function render_gemini_meta_box($post) {
        $content_id = get_post_meta($post->ID, '_supabase_content_id', true);
        $last_sync = get_post_meta($post->ID, '_supabase_last_sync', true);
        $gemini_file_id = get_post_meta($post->ID, '_gemini_file_id', true);

        ?>
        <div class="scs-meta-box">
            <?php if ($content_id): ?>
                <p>
                    <strong>Supabase ID:</strong><br>
                    <code><?php echo esc_html($content_id); ?></code>
                </p>
            <?php endif; ?>

            <?php if ($gemini_file_id): ?>
                <p>
                    <strong>Gemini File ID:</strong><br>
                    <code><?php echo esc_html($gemini_file_id); ?></code>
                </p>
            <?php else: ?>
                <p>
                    <em>Not yet uploaded to Gemini File Search</em>
                </p>
            <?php endif; ?>

            <?php if ($last_sync): ?>
                <p>
                    <strong>Last Synced:</strong><br>
                    <?php echo esc_html(date('Y-m-d H:i:s', strtotime($last_sync))); ?>
                </p>
            <?php endif; ?>

            <p>
                <button type="button" class="button" id="scs-trigger-gemini-upload">
                    Upload to Gemini
                </button>
            </p>
        </div>
        <?php
    }
}
```

---

## 7. n8n Workflow Definitions

### 7.1 Workflow 1: AI Content Generation Pipeline

**Workflow Name**: `AI-Content-Generation`

**Trigger**: Manual trigger or scheduled cron

**Nodes**:

1. **Manual Trigger / Cron Node**
   - Starts workflow on demand or schedule

2. **Set Variables Node**
   - Set content generation parameters
   - Variables: `topic`, `contentType`, `style`, `targetLength`

3. **HTTP Request Node** - Call Supabase Edge Function
   - Method: POST
   - URL: `{{$env.SUPABASE_URL}}/functions/v1/gemini-generate-content`
   - Headers: `Authorization: Bearer {{$env.SUPABASE_ANON_KEY}}`
   - Body:
     ```json
     {
       "topic": "{{$node['Set Variables'].json.topic}}",
       "contentType": "{{$node['Set Variables'].json.contentType}}",
       "style": "{{$node['Set Variables'].json.style}}",
       "targetLength": {{$node['Set Variables'].json.targetLength}}
     }
     ```

4. **HTTP Request Node** - Upload to Gemini File Search
   - Method: POST
   - URL: `{{$env.SUPABASE_URL}}/functions/v1/gemini-upload-to-file-search`
   - Body:
     ```json
     {
       "contentId": "{{$node['HTTP Request'].json.contentId}}"
     }
     ```

5. **HTTP Request Node** - Create WordPress Post
   - Method: POST
   - URL: `{{$env.WP_URL}}/wp-json/wp/v2/posts`
   - Authentication: Basic Auth (WordPress username/app password)
   - Body:
     ```json
     {
       "title": "{{$node['Set Variables'].json.topic}}",
       "content": "{{$node['HTTP Request'].json.content}}",
       "status": "draft",
       "meta": {
         "_supabase_content_id": "{{$node['HTTP Request'].json.contentId}}"
       }
     }
     ```

6. **Supabase Node** - Update with WordPress Post ID
   - Operation: Update
   - Table: `ai_content`
   - Update Key: `id = {{$node['HTTP Request'].json.contentId}}`
   - Fields:
     ```json
     {
       "wp_post_id": "{{$node['HTTP Request 3'].json.id}}"
     }
     ```

### 7.2 Workflow 2: WordPress to Supabase Sync

**Workflow Name**: `WordPress-Supabase-Sync`

**Trigger**: Webhook (WordPress post save hook)

**Nodes**:

1. **Webhook Trigger Node**
   - Method: POST
   - Path: `/wordpress-post-update`

2. **IF Node** - Check if content exists
   - Condition: `{{$node['Webhook'].json.wpPostId}}` is not empty

3. **Supabase Node** - Query existing content
   - Operation: Get
   - Table: `ai_content`
   - Filter: `wp_post_id = {{$node['Webhook'].json.wpPostId}}`

4. **Switch Node** - Route based on existence
   - Mode: Rules
   - Rule 1: `{{$node['Supabase'].json.length}} > 0` → Update flow
   - Rule 2: Default → Create flow

5a. **Supabase Node** - Update existing (Update branch)
   - Operation: Update
   - Table: `ai_content`
   - Update Key: `wp_post_id = {{$node['Webhook'].json.wpPostId}}`
   - Fields:
     ```json
     {
       "title": "{{$node['Webhook'].json.postTitle}}",
       "content": "{{$node['Webhook'].json.postContent}}",
       "status": "{{$node['Webhook'].json.postStatus}}",
       "human_edited": true
     }
     ```

5b. **Supabase Node** - Create new (Create branch)
   - Operation: Insert
   - Table: `ai_content`
   - Fields:
     ```json
     {
       "wp_post_id": "{{$node['Webhook'].json.wpPostId}}",
       "title": "{{$node['Webhook'].json.postTitle}}",
       "content": "{{$node['Webhook'].json.postContent}}",
       "status": "{{$node['Webhook'].json.postStatus}}",
       "ai_generated": false,
       "human_edited": true
     }
     ```

6. **HTTP Request Node** - Re-upload to Gemini
   - Method: POST
   - URL: `{{$env.SUPABASE_URL}}/functions/v1/gemini-upload-to-file-search`
   - Body:
     ```json
     {
       "contentId": "{{$node['Supabase'].json[0].id}}"
     }
     ```

### 7.3 Workflow 3: RAG-Enhanced Content Suggestions

**Workflow Name**: `RAG-Content-Enhancement`

**Trigger**: Manual trigger with input

**Nodes**:

1. **Manual Trigger Node**
   - Accepts input: `query` (user question or topic)

2. **HTTP Request Node** - RAG Query
   - Method: POST
   - URL: `{{$env.SUPABASE_URL}}/functions/v1/gemini-rag-query`
   - Body:
     ```json
     {
       "query": "{{$node['Manual Trigger'].json.query}}",
       "useCache": true
     }
     ```

3. **Code Node** - Format Response
   - Language: JavaScript
   - Code:
     ```javascript
     const response = items[0].json.response;
     const contexts = items[0].json.contexts;

     return [{
       json: {
         answer: response,
         sources: contexts.map(c => ({
           title: c.document?.displayName,
           excerpt: c.snippet,
           relevance: c.relevanceScore
         }))
       }
     }];
     ```

4. **Slack Node / Email Node** - Notify user
   - Send formatted response to designated channel

---

## 8. Implementation Phases

### Phase 1: Infrastructure Setup (Week 1)

**Deliverables**:
- ✅ Supabase project creation
- ✅ Database schema deployment
- ✅ Storage buckets configuration
- ✅ RLS policies setup
- ✅ Gemini API account setup
- ✅ Gemini corpus creation

**Tasks**:
1. Create Supabase project
2. Run database migration SQL
3. Configure storage buckets and policies
4. Test Supabase REST API and Realtime
5. Obtain Gemini API key
6. Create Gemini corpus via API:
   ```bash
   curl -X POST \
     "https://generativelanguage.googleapis.com/v1beta/corpora" \
     -H "Content-Type: application/json" \
     -H "x-goog-api-key: YOUR_API_KEY" \
     -d '{"displayName": "Content Library Corpus"}'
   ```

### Phase 2: Supabase Edge Functions (Week 2)

**Deliverables**:
- ✅ `gemini-generate-content` function deployed
- ✅ `gemini-upload-to-file-search` function deployed
- ✅ `gemini-rag-query` function deployed
- ✅ `wordpress-sync-webhook` function deployed
- ✅ Function testing completed

**Tasks**:
1. Install Supabase CLI: `npm install -g supabase`
2. Initialize functions: `supabase functions new [function-name]`
3. Deploy functions: `supabase functions deploy [function-name]`
4. Set environment variables:
   ```bash
   supabase secrets set GEMINI_API_KEY=xxx
   supabase secrets set GEMINI_CORPUS_ID=xxx
   ```
5. Test each function with curl/Postman

### Phase 3: WordPress Integration (Week 3)

**Deliverables**:
- ✅ WordPress plugin developed
- ✅ Supabase connection configured
- ✅ Post sync functionality working
- ✅ Meta boxes displaying Gemini data
- ✅ Plugin tested with various post types

**Tasks**:
1. Create plugin directory structure
2. Implement post sync hook
3. Develop meta box UI
4. Add settings page
5. Test bidirectional sync
6. Package plugin for deployment

### Phase 4: n8n Workflow Automation (Week 4)

**Deliverables**:
- ✅ n8n instance deployed
- ✅ AI content generation workflow active
- ✅ WordPress sync workflow active
- ✅ RAG enhancement workflow active
- ✅ All webhooks configured

**Tasks**:
1. Deploy n8n (self-hosted or cloud)
2. Create workflow templates
3. Configure Supabase credentials
4. Configure WordPress credentials
5. Set up webhook endpoints
6. Test end-to-end workflows
7. Enable workflow scheduling

### Phase 5: Testing & Optimization (Week 5)

**Deliverables**:
- ✅ End-to-end testing completed
- ✅ Performance benchmarks documented
- ✅ Security audit completed
- ✅ User acceptance testing passed

**Tasks**:
1. Create test content across all flows
2. Measure Gemini API costs
3. Optimize database queries
4. Test RLS policies
5. Load testing on Edge Functions
6. Review error logs
7. Implement monitoring

### Phase 6: Documentation & Deployment (Week 6)

**Deliverables**:
- ✅ User documentation
- ✅ API documentation
- ✅ Deployment guide
- ✅ Training materials
- ✅ Production deployment

**Tasks**:
1. Write user guides
2. Document API endpoints
3. Create video tutorials
4. Prepare deployment checklist
5. Conduct team training
6. Production deployment
7. Post-launch monitoring

---

## 9. Cost Analysis

### 9.1 Google Gemini API Costs

**Assumptions**:
- 1000 content pieces generated per month
- Average 1500 words per piece = ~2000 tokens
- All content uploaded to File Search
- 500 RAG queries per month

**Monthly Costs**:
- **Content Generation** (Gemini 2.5 Flash):
  - Input: 1000 pieces × 100 tokens (prompt) = 100K tokens
  - Output: 1000 pieces × 2000 tokens = 2M tokens
  - Cost: (100K × $0.075/1M) + (2M × $0.30/1M) = $0.01 + $0.60 = **$0.61**

- **File Search Indexing**:
  - 1000 pieces × 2000 tokens = 2M tokens
  - Cost: 2M × $0.15/1M = **$0.30**

- **File Search Storage**: **FREE**

- **RAG Queries** (500 queries):
  - Input: 500 × 50 tokens = 25K tokens
  - Output: 500 × 500 tokens = 250K tokens
  - Cost: (25K × $0.075/1M) + (250K × $0.30/1M) = $0.002 + $0.075 = **$0.08**

**Total Gemini Costs**: $0.61 + $0.30 + $0.08 = **$0.99/month**

### 9.2 Supabase Costs

**Free Tier Limits**:
- 500MB database storage
- 1GB file storage
- 50,000 monthly active users
- 2GB Edge Function bandwidth

**Projected Usage**:
- Database: 1000 content pieces × ~10KB = 10MB ✅ Free
- Storage: 1000 markdown files × ~5KB = 5MB ✅ Free
- Edge Functions: ~100 invocations/day × 30 days = 3000 invocations ✅ Free

**Estimated Cost**: **$0/month** (Free tier sufficient)

**Pro Tier** ($25/month if needed):
- 8GB database
- 100GB storage
- Dedicated CPU resources
- Advanced security features

### 9.3 n8n Costs

**Self-Hosted Option**: **FREE**
- Deploy on Supabase Edge Functions or external VPS
- Resource costs: ~$5-10/month VPS

**n8n Cloud**:
- Starter: **$20/month** (5,000 workflow executions)
- Pro: **$50/month** (10,000 workflow executions)

### 9.4 WordPress Hosting

**Estimated Cost**: **$10-30/month**
- Shared hosting: $10/month
- Managed WordPress: $30/month

### 9.5 Total Monthly Cost Estimate

**Minimal Setup** (Free tier maximized):
- Gemini API: $0.99
- Supabase: $0 (Free tier)
- n8n: $5 (Self-hosted VPS)
- WordPress: $10 (Shared hosting)
- **Total**: **~$16/month**

**Recommended Setup** (Better performance):
- Gemini API: $0.99
- Supabase: $25 (Pro tier)
- n8n: $20 (Cloud Starter)
- WordPress: $30 (Managed hosting)
- **Total**: **~$76/month**

**Enterprise Setup** (High volume):
- Gemini API: $5-10 (10K pieces/month)
- Supabase: $599 (Team tier)
- n8n: $50 (Cloud Pro)
- WordPress: $100 (VIP hosting)
- **Total**: **~$754-759/month**

---

## 10. Security Considerations

### 10.1 Authentication & Authorization

**Supabase Auth**:
- JWT-based authentication
- Social OAuth providers (Google, GitHub)
- Email/password authentication
- Magic link support

**WordPress Integration**:
- WordPress users sync to Supabase via webhook
- Application passwords for API access
- Role mapping (WordPress roles → Supabase RLS policies)

**API Security**:
- Gemini API key stored in Supabase secrets (never exposed to client)
- All Edge Functions require authentication
- CORS policies configured

### 10.2 Row-Level Security (RLS)

**Key Policies**:

```sql
-- Users can only read published content
CREATE POLICY "Users can read published"
ON ai_content FOR SELECT
USING (status = 'published' OR auth.uid() = created_by);

-- Only authenticated users can create
CREATE POLICY "Auth users create"
ON ai_content FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can only update their own content
CREATE POLICY "Users update own"
ON ai_content FOR UPDATE
USING (auth.uid() = created_by);
```

### 10.3 Data Privacy

**PII Handling**:
- No user PII stored in Gemini File Search
- Content metadata sanitized before upload
- User emails/passwords never exposed to external APIs

**GDPR Compliance**:
- Right to erasure: Delete from Supabase → triggers Gemini file deletion
- Data portability: Export endpoint for user content
- Consent management: Track user consent in database

### 10.4 API Rate Limiting

**Gemini API**:
- Rate limits: 60 requests/minute (default)
- Implement exponential backoff in Edge Functions
- Monitor quota usage via Gemini dashboard

**Supabase Edge Functions**:
- No built-in rate limiting (implement custom logic)
- Use Supabase Realtime for connection pooling
- Cache frequently accessed data

### 10.5 Secrets Management

**Environment Variables**:
```bash
# Supabase Secrets
GEMINI_API_KEY=xxx
GEMINI_CORPUS_ID=corpora/xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
WP_URL=https://yoursite.com
WP_USERNAME=admin
WP_APP_PASSWORD=xxx
```

**Access Control**:
- Supabase service role key ONLY used in Edge Functions
- Anon key used in WordPress plugin (limited permissions)
- Never expose secrets in client-side code

---

## 11. Monitoring & Observability

### 11.1 Logging Strategy

**Supabase Logs**:
- Edge Function logs: `supabase functions logs [function-name]`
- Database logs: Query performance via Supabase dashboard
- Storage logs: File access patterns

**Gemini API Logs**:
- Monitor via Google Cloud Console
- Track token usage per request
- Alert on quota approaching limits

**WordPress Logs**:
- Plugin error logs in `wp-content/debug.log`
- Webhook success/failure tracking

### 11.2 Metrics to Track

**Performance Metrics**:
- Edge Function response times
- Gemini API latency
- Database query duration
- Storage upload/download speeds

**Business Metrics**:
- Content pieces generated per day
- Human edits per AI-generated piece
- RAG query success rate
- WordPress sync success rate

**Cost Metrics**:
- Gemini API tokens consumed
- Supabase database size growth
- Storage usage trends
- n8n workflow execution counts

### 11.3 Alerting

**Critical Alerts**:
- Edge Function failures (>5% error rate)
- Gemini API quota exceeded
- Database connection failures
- Storage bucket quota exceeded

**Warning Alerts**:
- Slow Edge Function responses (>2s)
- High Gemini API costs (>$100/month)
- Database size approaching limits
- Webhook failures

---

## 12. Future Enhancements

### 12.1 Phase 2 Features (Months 2-3)

1. **Multi-language Support**:
   - Gemini 2.5 multilingual content generation
   - WordPress WPML integration
   - Supabase translation tables

2. **Advanced RAG Features**:
   - Multiple corpus support (by category/topic)
   - Hybrid search (keyword + semantic)
   - Query result ranking customization

3. **Collaborative Editing**:
   - Real-time collaboration via Supabase Realtime
   - Conflict resolution for simultaneous edits
   - Comment system on drafts

4. **Content Scheduling**:
   - AI-powered publish time optimization
   - Auto-scheduling based on engagement predictions
   - Content calendar integration

### 12.2 Phase 3 Features (Months 4-6)

1. **Advanced Analytics**:
   - Content performance tracking
   - AI vs. human edit quality comparison
   - SEO optimization suggestions

2. **Custom AI Models**:
   - Fine-tune Gemini on brand-specific content
   - Custom style guide enforcement
   - Domain-specific vocabulary

3. **E-commerce Integration**:
   - Product description generation
   - SEO-optimized category pages
   - Dynamic pricing content

4. **Mobile App**:
   - React Native app using Supabase client
   - Offline editing with sync
   - Push notifications for workflow status

---

## 13. Research References

### 13.1 Primary Sources

1. **Gemini File Search Announcement**
   - URL: https://blog.google/technology/developers/file-search-gemini-api/
   - Key Insights: Fully managed RAG, 60+ file types, FREE storage & query embeddings

2. **Gemini API Documentation - File Search**
   - URL: https://ai.google.dev/gemini-api/docs/file-search
   - Key Insights: API endpoints, code examples, pricing details

3. **Supabase Documentation**
   - URL: https://supabase.com/docs
   - Key Insights: Edge Functions, Storage, Auth, Realtime

4. **n8n Documentation**
   - URL: https://docs.n8n.io/
   - Key Insights: Workflow automation, Supabase integration, webhook triggers

5. **WordPress REST API**
   - URL: https://developer.wordpress.org/rest-api/
   - Key Insights: Post endpoints, authentication, webhooks

### 13.2 Technical Articles

1. **Gemini File Search Deep Dive**
   - Source: Google AI Blog
   - Date: 2024-12-03
   - Summary: Technical architecture of File Search, chunking strategies, embedding model details

2. **Supabase Edge Functions Best Practices**
   - Source: Supabase Blog
   - Summary: Performance optimization, error handling, Deno runtime specifics

3. **WordPress to Supabase Integration Guide**
   - Source: Community developer blog
   - Summary: Custom plugin development, webhook setup, authentication patterns

4. **RAG System Design Patterns**
   - Source: AI research papers
   - Summary: Retrieval strategies, context injection, relevance scoring

### 13.3 Cost Research

1. **Gemini API Pricing**
   - URL: https://ai.google.dev/pricing
   - Details: Per-token pricing, rate limits, quota management

2. **Supabase Pricing Tiers**
   - URL: https://supabase.com/pricing
   - Details: Free tier limits, Pro tier features, enterprise options

3. **n8n Pricing Comparison**
   - URL: https://n8n.io/pricing
   - Details: Cloud vs. self-hosted costs, execution limits

### 13.4 Community Resources

1. **Supabase Discord Community**
   - URL: https://discord.supabase.com
   - Usage: Edge Function troubleshooting, best practices

2. **n8n Community Forum**
   - URL: https://community.n8n.io
   - Usage: Workflow templates, integration examples

3. **WordPress Developer Resources**
   - URL: https://developer.wordpress.org
   - Usage: Plugin development, REST API usage

---

## 14. Appendices

### Appendix A: Glossary

- **RAG**: Retrieval Augmented Generation - AI technique combining retrieval and generation
- **Corpus**: Collection of documents indexed for semantic search (Gemini File Search term)
- **RLS**: Row-Level Security - Supabase database security feature
- **Edge Function**: Serverless function running close to users (Supabase/Deno)
- **JWT**: JSON Web Token - Authentication token format
- **Webhook**: HTTP callback triggering automated workflows
- **WCAG**: Web Content Accessibility Guidelines

### Appendix B: API Endpoint Summary

**Gemini API**:
- `POST /v1beta/corpora` - Create corpus
- `POST /v1beta/corpora/{id}/documents` - Upload document
- `POST /v1beta/models/gemini-2.5-flash:generateContent` - Generate content

**Supabase Edge Functions**:
- `POST /functions/v1/gemini-generate-content` - Generate AI content
- `POST /functions/v1/gemini-upload-to-file-search` - Upload to Gemini
- `POST /functions/v1/gemini-rag-query` - RAG query
- `POST /functions/v1/wordpress-sync-webhook` - WordPress sync

**WordPress REST API**:
- `GET /wp-json/wp/v2/posts` - List posts
- `POST /wp-json/wp/v2/posts` - Create post
- `PUT /wp-json/wp/v2/posts/{id}` - Update post

**Supabase REST API** (auto-generated):
- `GET /rest/v1/ai_content` - Query content
- `POST /rest/v1/ai_content` - Insert content
- `PATCH /rest/v1/ai_content?id=eq.{id}` - Update content

### Appendix C: Database Migration Scripts

**Initial Migration**: See Section 4.1 for complete SQL schema

**Migration Workflow**:
```bash
# 1. Login to Supabase CLI
supabase login

# 2. Link to project
supabase link --project-ref your-project-ref

# 3. Create migration file
supabase migration new initial_schema

# 4. Add SQL to migration file (copy from Section 4.1)

# 5. Apply migration
supabase db push

# 6. Verify tables
supabase db diff
```

### Appendix D: Environment Setup Checklist

**Supabase**:
- [ ] Project created
- [ ] Database schema deployed
- [ ] Storage buckets configured
- [ ] RLS policies enabled
- [ ] Edge Functions deployed
- [ ] Secrets configured

**Gemini**:
- [ ] API key obtained
- [ ] Corpus created
- [ ] Quota limits reviewed
- [ ] Billing enabled

**WordPress**:
- [ ] Site deployed
- [ ] Plugin installed
- [ ] Webhook URL configured
- [ ] Application password created

**n8n**:
- [ ] Instance deployed
- [ ] Workflows imported
- [ ] Credentials configured
- [ ] Webhooks tested

---

## 15. Success Metrics

### 15.1 Technical KPIs

- **System Uptime**: >99.5%
- **Edge Function Response Time**: <500ms (p95)
- **Gemini API Latency**: <2s (p95)
- **WordPress Sync Success Rate**: >98%
- **RAG Query Accuracy**: >85% relevance score

### 15.2 Business KPIs

- **Content Production Rate**: 100+ pieces/month
- **Human Edit Rate**: <30% of AI-generated content needs major edits
- **Cost per Content Piece**: <$0.10
- **Time to Publish**: <1 hour from generation to draft
- **User Satisfaction**: >4/5 stars

### 15.3 ROI Metrics

**Without AI System**:
- Manual content creation: 4 hours/piece × $50/hour = $200/piece
- 100 pieces/month = $20,000/month

**With AI System**:
- AI generation + editing: 30 min/piece × $50/hour = $25/piece
- Infrastructure cost: $76/month
- 100 pieces/month = $2,500 + $76 = $2,576/month

**ROI**: $20,000 - $2,576 = **$17,424/month savings** (87% cost reduction)

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-10 | AI Research Team | Initial PRD creation with comprehensive research |

---

## Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| Security Officer | | | |
| Project Manager | | | |

---

**End of Document**
