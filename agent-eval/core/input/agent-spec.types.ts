export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface LangfuseConfig {
  publicKey: string
  secretKey: string
  host?: string
  projectId?: string
}

export interface AgentSpec {
  name: string
  description: string
  endpoint?: string
  agentType: 'rest' | 'anthropic' | 'openai' | 'langchain'
  systemPrompt?: string
  tools: ToolDefinition[]
  inputType: 'api' | 'git_repo'
  repoUrl?: string
  repoBranch?: string
  recentChanges?: string[]    // from git log — regression focus areas
  existingTests?: string[]    // from repo test files
  envVarsRequired?: string[]  // from .env.example
  traceStrategy: 'langfuse' | 'proxy' | 'sdk' | 'blackbox'
  langfuseConfig?: LangfuseConfig
}
