import { simpleGit } from 'simple-git'
import { existsSync, readFileSync, readdirSync, statSync, rmSync } from 'fs'
import { join, extname } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'
import Anthropic from '@anthropic-ai/sdk'
import type { AgentSpec, ToolDefinition } from './agent-spec.types'

const client = new Anthropic()

export interface RepoParserInput {
  repoUrl: string
  repoBranch?: string
  traceStrategy: AgentSpec['traceStrategy']
  langfuseConfig?: AgentSpec['langfuseConfig']
}

export async function parseRepo(input: RepoParserInput): Promise<AgentSpec> {
  const repoId = randomBytes(6).toString('hex')
  const cloneDir = join(tmpdir(), `eval-repo-${repoId}`)

  try {
    // 1. Shallow clone
    console.log(`[repo-parser] Cloning ${input.repoUrl} into ${cloneDir}`)
    const git = simpleGit()
    await git.clone(input.repoUrl, cloneDir, [
      '--depth', '1',
      ...(input.repoBranch ? ['--branch', input.repoBranch] : []),
    ])

    // 2. Read README
    const readme = readFileSafe(join(cloneDir, 'README.md')) ?? readFileSafe(join(cloneDir, 'readme.md')) ?? ''

    // 3. Scan source files for system prompt + tool definitions
    const sourceFiles = collectSourceFiles(cloneDir)
    const { systemPrompt, tools } = await extractAgentDefinitions(sourceFiles, cloneDir)

    // 4. Read .env.example for required vars
    const envExample = readFileSafe(join(cloneDir, '.env.example')) ?? readFileSafe(join(cloneDir, '.env.sample')) ?? ''
    const envVarsRequired = parseEnvVarNames(envExample)

    // 5. Get recent git log for regression hints
    const repoGit = simpleGit(cloneDir)
    const log = await repoGit.log(['--oneline', '-20'])
    const recentChanges = log.all.map(c => c.message)

    // 6. Find existing test files
    const existingTests = collectTestFiles(cloneDir)

    // 7. LLM: extract agent name + description from README
    const { name, description } = await summariseReadme(readme, systemPrompt)

    return {
      name,
      description,
      agentType: 'rest',
      inputType: 'git_repo',
      repoUrl: input.repoUrl,
      repoBranch: input.repoBranch,
      systemPrompt,
      tools,
      envVarsRequired,
      recentChanges,
      existingTests,
      traceStrategy: input.traceStrategy,
      langfuseConfig: input.langfuseConfig,
    }
  } finally {
    // Cleanup temp directory
    try {
      if (existsSync(cloneDir)) {
        rmSync(cloneDir, { recursive: true, force: true })
        console.log(`[repo-parser] Cleaned up ${cloneDir}`)
      }
    } catch {
      console.warn(`[repo-parser] Failed to clean up ${cloneDir}`)
    }
  }
}

function readFileSafe(path: string): string | null {
  try {
    return readFileSync(path, 'utf-8')
  } catch {
    return null
  }
}

function collectSourceFiles(dir: string, maxFiles = 30): Array<{ path: string; content: string }> {
  const results: Array<{ path: string; content: string }> = []
  const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv'])
  const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.py', '.mjs'])

  function walk(current: string) {
    if (results.length >= maxFiles) return
    let entries: string[]
    try { entries = readdirSync(current) } catch { return }

    for (const entry of entries) {
      if (results.length >= maxFiles) break
      const fullPath = join(current, entry)
      let stat
      try { stat = statSync(fullPath) } catch { continue }

      if (stat.isDirectory()) {
        if (!SKIP_DIRS.has(entry)) walk(fullPath)
      } else if (SOURCE_EXTS.has(extname(entry))) {
        const content = readFileSafe(fullPath)
        if (content) results.push({ path: fullPath, content })
      }
    }
  }

  walk(dir)
  return results
}

function collectTestFiles(dir: string): string[] {
  const results: string[] = []
  const TEST_PATTERNS = [/\.test\.[tj]sx?$/, /\.spec\.[tj]sx?$/, /^test_.*\.py$/, /.*_test\.py$/]
  const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next'])

  function walk(current: string) {
    let entries: string[]
    try { entries = readdirSync(current) } catch { return }

    for (const entry of entries) {
      const fullPath = join(current, entry)
      let stat
      try { stat = statSync(fullPath) } catch { continue }

      if (stat.isDirectory()) {
        if (!SKIP_DIRS.has(entry)) walk(fullPath)
      } else if (TEST_PATTERNS.some(p => p.test(entry))) {
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

function parseEnvVarNames(envExample: string): string[] {
  return envExample
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=')[0].trim())
    .filter(Boolean)
}

async function extractAgentDefinitions(
  files: Array<{ path: string; content: string }>,
  _cloneDir: string
): Promise<{ systemPrompt?: string; tools: ToolDefinition[] }> {
  if (files.length === 0) return { tools: [] }

  // Prioritise files that likely define tools or system prompts
  const priority = files.filter(f =>
    f.path.includes('prompt') || f.path.includes('system') ||
    f.path.includes('agent') || f.path.includes('tool') ||
    f.path.includes('skill') || f.path.includes('function')
  )
  const filesToSend = priority.length > 0 ? priority.slice(0, 8) : files.slice(0, 10)

  const filesSummary = filesToSend
    .map(f => `=== ${f.path} ===\n${f.content.slice(0, 3000)}`)
    .join('\n\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Analyze the following source code files from an AI agent project.

Your task: extract the agent's system prompt and all tool/skill/function definitions it can call.

Look for:
- String constants or variables used as system prompts (look for "You are", "Your role", "Assistant" patterns)
- Tool definitions: Anthropic tool_use format, OpenAI function_call format, LangChain tool objects, custom route handlers the agent uses
- Exported functions or API endpoints the agent calls as "skills"

Return ONLY a JSON object with this exact shape — no markdown, no explanation:
{"systemPrompt":"the full system prompt text, or null","tools":[{"name":"tool_name","description":"what it does","parameters":{}}]}

Files to analyze:
${filesSummary}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  console.log(`[repo-parser] LLM extraction response (first 300 chars): ${text.slice(0, 300)}`)

  try {
    // Strip markdown code fences if present: ```json ... ``` or ``` ... ```
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const parsed = JSON.parse(stripped) as { systemPrompt?: string; tools?: ToolDefinition[] }
    const tools = Array.isArray(parsed.tools) ? parsed.tools : []
    console.log(`[repo-parser] Extracted ${tools.length} tool(s): ${tools.map(t => t.name).join(', ') || '(none)'}`)
    return {
      systemPrompt: typeof parsed.systemPrompt === 'string' && parsed.systemPrompt !== 'null'
        ? parsed.systemPrompt
        : undefined,
      tools,
    }
  } catch {
    // Fallback: try to find a JSON object inside the text
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { systemPrompt?: string; tools?: ToolDefinition[] }
        const tools = Array.isArray(parsed.tools) ? parsed.tools : []
        console.log(`[repo-parser] Fallback extraction: ${tools.length} tool(s)`)
        return { systemPrompt: parsed.systemPrompt ?? undefined, tools }
      }
    } catch { /* ignore */ }
    console.warn('[repo-parser] Could not parse LLM extraction response — no tool metadata available')
    return { tools: [] }
  }
}

async function summariseReadme(readme: string, systemPrompt?: string): Promise<{ name: string; description: string }> {
  const context = [
    readme ? `README:\n${readme.slice(0, 3000)}` : '',
    systemPrompt ? `System Prompt:\n${systemPrompt.slice(0, 1000)}` : '',
  ].filter(Boolean).join('\n\n')

  if (!context) return { name: 'unknown-agent', description: 'No description available' }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Given the following context about an AI agent, return a JSON object with:
{ "name": "short-agent-name-slug", "description": "one sentence describing what this agent does" }

${context}

Return only the JSON object.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { name: 'unknown-agent', description: 'No description available' }
    return JSON.parse(jsonMatch[0]) as { name: string; description: string }
  } catch {
    return { name: 'unknown-agent', description: 'No description available' }
  }
}
