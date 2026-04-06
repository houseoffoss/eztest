import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { parseRepo } from './repo-parser'
import type { AgentSpec, LangfuseConfig, ToolDefinition } from './agent-spec.types'

const prisma = new PrismaClient()

const LangfuseConfigSchema = z.object({
  publicKey: z.string().min(1),
  secretKey: z.string().min(1),
  host: z.string().url().optional(),
  projectId: z.string().optional(),
})

const ApiInputSchema = z.object({
  type: z.literal('api'),
  endpoint: z.string().url(),
  systemPrompt: z.string().optional(),
  toolSchema: z.array(z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.record(z.unknown()),
  })).optional(),
  agentType: z.enum(['rest', 'anthropic', 'openai', 'langchain']).default('rest'),
  traceStrategy: z.enum(['langfuse', 'proxy', 'sdk', 'blackbox']).default('blackbox'),
  langfuseConfig: LangfuseConfigSchema.optional(),
})

const ToolOverrideSchema = z.array(z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()).optional().default({}),
}))

const GitRepoInputSchema = z.object({
  type: z.literal('git_repo'),
  repoUrl: z.string().url(),
  repoBranch: z.string().optional(),
  endpoint: z.string().url(),
  toolsOverride: ToolOverrideSchema.optional(),
  traceStrategy: z.enum(['langfuse', 'proxy', 'sdk', 'blackbox']).default('blackbox'),
  langfuseConfig: LangfuseConfigSchema.optional(),
})

export type InputHandlerPayload =
  | z.infer<typeof ApiInputSchema>
  | z.infer<typeof GitRepoInputSchema>

export async function handleInput(payload: InputHandlerPayload): Promise<{ agentSpec: AgentSpec; evalTargetId: string }> {
  let agentSpec: AgentSpec

  if (payload.type === 'api') {
    const validated = ApiInputSchema.parse(payload)
    agentSpec = {
      name: new URL(validated.endpoint).hostname,
      description: 'Agent provided via API endpoint',
      endpoint: validated.endpoint,
      agentType: validated.agentType,
      systemPrompt: validated.systemPrompt,
      tools: (validated.toolSchema ?? []) as ToolDefinition[],
      inputType: 'api',
      traceStrategy: validated.traceStrategy,
      langfuseConfig: validated.langfuseConfig as LangfuseConfig | undefined,
    }
  } else {
    const validated = GitRepoInputSchema.parse(payload)
    console.log(`[input-handler] Parsing Git repo: ${validated.repoUrl}`)
    agentSpec = await parseRepo({
      repoUrl: validated.repoUrl,
      repoBranch: validated.repoBranch,
      traceStrategy: validated.traceStrategy,
      langfuseConfig: validated.langfuseConfig as LangfuseConfig | undefined,
    })
    agentSpec.endpoint = validated.endpoint
    // Manual tools override: if user provided tools, they take precedence over auto-detected ones
    if (validated.toolsOverride && validated.toolsOverride.length > 0) {
      agentSpec.tools = validated.toolsOverride as ToolDefinition[]
      console.log(`[input-handler] Using ${agentSpec.tools.length} manually provided tool(s): ${agentSpec.tools.map(t => t.name).join(', ')}`)
    }
  }

  // Persist EvalTarget to DB
  const evalTarget = await prisma.evalTarget.create({
    data: {
      name: agentSpec.name,
      inputType: agentSpec.inputType,
      endpoint: agentSpec.endpoint ?? null,
      repoUrl: agentSpec.repoUrl ?? null,
      repoBranch: agentSpec.repoBranch ?? null,
      systemPrompt: agentSpec.systemPrompt ?? null,
      toolSchema: agentSpec.tools.length > 0 ? (agentSpec.tools as unknown as object) : undefined,
      agentType: agentSpec.agentType,
      traceStrategy: agentSpec.traceStrategy,
      langfuseKey: agentSpec.langfuseConfig?.secretKey ?? null,
    },
  })

  console.log(`[input-handler] Created EvalTarget ${evalTarget.id} for agent "${agentSpec.name}"`)
  return { agentSpec, evalTargetId: evalTarget.id }
}
