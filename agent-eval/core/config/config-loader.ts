import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import { z } from 'zod'
import { type EvalConfig, DEFAULT_CONFIG } from './config.types'

const WeightsSchema = z.object({
  factualAccuracy: z.number().default(0.25),
  toolUseCorrectness: z.number().default(0.20),
  instructionFollowing: z.number().default(0.20),
  safety: z.number().default(0.15),
  consistency: z.number().default(0.10),
  latency: z.number().default(0.10),
})

const ConfigSchema = z.object({
  agent: z.object({
    name: z.string().default('unnamed-agent'),
    passThreshold: z.number().default(7.0),
    latencyThresholdMs: z.number().default(5000),
    regressionAlertDrop: z.number().default(0.5),
  }).default({}),
  testGeneration: z.object({
    categories: z.object({
      happy_path: z.number().default(5),
      edge_cases: z.number().default(5),
      adversarial: z.number().default(8),
      tool_use: z.number().default(6),
      multi_turn: z.number().default(4),
    }).default({}),
    maxFollowupTests: z.number().default(10),
    maxReviewRejections: z.number().default(3),
  }).default({}),
  evaluation: z.object({
    judgeModel: z.string().default('claude-sonnet-4-6'),
    judgeTemperature: z.number().default(0),
    criticalDimensions: z.array(z.string()).default(['safety']),
    weights: WeightsSchema.default({}),
  }).default({}),
  tracing: z.object({
    strategy: z.enum(['langfuse', 'proxy', 'sdk', 'blackbox']).default('blackbox'),
    langfuse: z.object({
      publicKey: z.string(),
      secretKey: z.string(),
      host: z.string().default('https://cloud.langfuse.com'),
    }).optional(),
  }).default({}),
})

function interpolateEnvVars(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/\$\{([^}]+)\}/g, (_, varName: string) => {
      const envVal = process.env[varName]
      if (!envVal) {
        console.warn(`[config-loader] Warning: env var ${varName} is not set`)
        return ''
      }
      return envVal
    })
  }
  if (Array.isArray(value)) return value.map(interpolateEnvVars)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, interpolateEnvVars(v)])
    )
  }
  return value
}

export function loadConfig(configPath?: string): EvalConfig {
  if (!configPath) return DEFAULT_CONFIG

  let raw: unknown
  try {
    const fileContent = readFileSync(configPath, 'utf-8')
    raw = yaml.load(fileContent)
  } catch {
    throw new Error(`[config-loader] Failed to read config file: ${configPath}`)
  }

  const interpolated = interpolateEnvVars(raw)
  const result = ConfigSchema.safeParse(interpolated)

  if (!result.success) {
    const issues = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`[config-loader] Invalid config:\n${issues}`)
  }

  return result.data as EvalConfig
}
