'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Send, Sparkles, Code, FileText, TestTube } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SkillFile {
  path: string
  content: string
}

export default function SkillBuilderPage() {
  const [phase, setPhase] = useState<'gathering' | 'building' | 'complete'>('gathering')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [skillData, setSkillData] = useState<{
    name: string
    files: SkillFile[]
    requirements: any
  } | null>(null)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/tools/skill-builder/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          phase
        })
      })

      const data = await response.json()

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])

      if (data.phaseComplete) {
        if (phase === 'gathering') {
          // Move to building phase
          setPhase('building')
          await buildSkill(data.requirements)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const buildSkill = async (requirements: any) => {
    setLoading(true)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '🔨 Building your skill with Claude Sonnet 3.5...'
    }])

    try {
      const response = await fetch('/api/tools/skill-builder/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements })
      })

      const data = await response.json()

      setSkillData(data.skill)
      setPhase('complete')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Skill "${data.skill.name}" has been built successfully! You can now preview and download it.`
      }])
    } catch (error) {
      console.error('Error building skill:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Failed to build skill. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const downloadSkill = async () => {
    if (!skillData) return

    try {
      const response = await fetch('/api/tools/skill-builder/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: skillData })
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${skillData.name}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading skill:', error)
    }
  }

  const startOver = () => {
    setPhase('gathering')
    setMessages([])
    setSkillData(null)
    setInput('')
  }

  return (
    <div className="mx-auto px-6 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Skill Builder</h1>
        <p className="text-muted-foreground">
          Create custom Claude skills with AI assistance - powered by Haiku 4.5 & Sonnet 3.5
        </p>
      </div>

      {/* Phase Indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Badge variant={phase === 'gathering' ? 'default' : 'secondary'} className="gap-2">
            <Sparkles className="h-3 w-3" />
            Requirements (Haiku 4.5)
          </Badge>
          <div className="h-px flex-1 bg-border" />
          <Badge variant={phase === 'building' ? 'default' : 'secondary'} className="gap-2">
            <Code className="h-3 w-3" />
            Building (Sonnet 3.5)
          </Badge>
          <div className="h-px flex-1 bg-border" />
          <Badge variant={phase === 'complete' ? 'default' : 'secondary'} className="gap-2">
            <TestTube className="h-3 w-3" />
            Complete
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chat Interface</CardTitle>
            <CardDescription>
              {phase === 'gathering' && 'Tell me about the skill you want to create'}
              {phase === 'building' && 'Building your skill...'}
              {phase === 'complete' && 'Skill building complete!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4 mb-4">
              {messages.length === 0 && phase === 'gathering' && (
                <div className="text-center text-muted-foreground py-12">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">Let's build your skill!</p>
                  <p className="text-sm">
                    I'll help you define requirements with Claude Haiku 4.5,<br />
                    then build it with Claude Sonnet 3.5
                  </p>
                  <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                    <p className="text-sm font-medium">Example prompts:</p>
                    <div className="space-y-1 text-xs">
                      <p>• "Create a skill for database query optimization"</p>
                      <p>• "I need a skill to help with API integration"</p>
                      <p>• "Build a skill for document processing"</p>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </ScrollArea>

            {phase !== 'complete' && (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={loading}
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            )}

            {phase === 'complete' && (
              <div className="flex gap-2">
                <Button onClick={downloadSkill} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Skill
                </Button>
                <Button onClick={startOver} variant="outline">
                  Start Over
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Preview</CardTitle>
            <CardDescription>Generated files and structure</CardDescription>
          </CardHeader>
          <CardContent>
            {!skillData ? (
              <div className="text-center text-muted-foreground py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Skill files will appear here</p>
              </div>
            ) : (
              <Tabs defaultValue={skillData.files[0]?.path || 'info'}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Skill Name</h3>
                    <p className="text-sm text-muted-foreground">{skillData.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Files Generated</h3>
                    <p className="text-sm text-muted-foreground">{skillData.files.length} files</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Status</h3>
                    <Badge variant="default">Ready to Download</Badge>
                  </div>
                </TabsContent>

                <TabsContent value="files">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {skillData.files.map((file, idx) => (
                        <div key={idx} className="border rounded p-2">
                          <p className="text-sm font-medium mb-1">{file.path}</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {file.content.substring(0, 200)}...
                          </pre>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="structure">
                  <pre className="text-xs bg-muted p-4 rounded">
                    {`${skillData.name}/
├── SKILL.md
${skillData.files.filter(f => f.path.startsWith('scripts/')).length > 0 ? `├── scripts/
${skillData.files.filter(f => f.path.startsWith('scripts/')).map(f => `│   ├── ${f.path.split('/').pop()}`).join('\n')}` : ''}
${skillData.files.filter(f => f.path.startsWith('references/')).length > 0 ? `├── references/
${skillData.files.filter(f => f.path.startsWith('references/')).map(f => `│   ├── ${f.path.split('/').pop()}`).join('\n')}` : ''}
${skillData.files.filter(f => f.path.startsWith('assets/')).length > 0 ? `└── assets/
${skillData.files.filter(f => f.path.startsWith('assets/')).map(f => `    ├── ${f.path.split('/').pop()}`).join('\n')}` : ''}`}
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
