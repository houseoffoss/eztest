#!/usr/bin/env node
import { parseArgs } from 'util'
import { handleInput } from './core/input/input-handler.js'
import { runMasterAgent } from './core/agent/master-agent.js'
import { loadConfig } from './core/config/config-loader.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      input: { type: 'string' },          // 'api' | 'repo'
      endpoint: { type: 'string' },        // for --input api
      'system-prompt': { type: 'string' }, // for --input api
      repo: { type: 'string' },            // for --input repo
      branch: { type: 'string' },
      config: { type: 'string' },          // path to eval-config.yaml
      'trace-strategy': { type: 'string' }, // langfuse | blackbox
      'run-id': { type: 'string' },        // for resume command
    },
    allowPositionals: true,
  })

  const command = positionals[0]

  if (!command) {
    printUsage()
    process.exit(1)
  }

  if (command === 'run') {
    await commandRun(values)
  } else if (command === 'resume') {
    await commandResume(values)
  } else if (command === 'status') {
    await commandStatus(values)
  } else {
    console.error(`Unknown command: ${command}`)
    printUsage()
    process.exit(1)
  }
}

async function commandRun(values: Record<string, string | boolean | undefined>) {
  const inputType = (values['input'] as string) ?? 'repo'
  const configPath = values['config'] as string | undefined
  const config = loadConfig(configPath)

  let payload: Parameters<typeof handleInput>[0]

  if (inputType === 'api') {
    const endpoint = values['endpoint'] as string
    if (!endpoint) {
      console.error('Error: --endpoint is required for --input api')
      process.exit(1)
    }
    payload = {
      type: 'api',
      endpoint,
      systemPrompt: values['system-prompt'] as string | undefined,
      agentType: 'rest',
      traceStrategy: (values['trace-strategy'] as 'langfuse' | 'blackbox') ?? 'blackbox',
    }
  } else {
    const repoUrl = values['repo'] as string
    if (!repoUrl) {
      console.error('Error: --repo is required for --input repo')
      process.exit(1)
    }
    payload = {
      type: 'git_repo',
      repoUrl,
      repoBranch: values['branch'] as string | undefined,
      traceStrategy: (values['trace-strategy'] as 'langfuse' | 'blackbox') ?? 'blackbox',
      langfuseConfig: config.tracing.strategy === 'langfuse' && config.tracing.langfuse
        ? {
            publicKey: config.tracing.langfuse.publicKey,
            secretKey: config.tracing.langfuse.secretKey,
            host: config.tracing.langfuse.host,
          }
        : undefined,
    }
  }

  console.log(`\n[cli] Starting evaluation run (input: ${inputType})`)
  const { agentSpec, evalTargetId } = await handleInput(payload)
  console.log(`[cli] Agent: ${agentSpec.name} — ${agentSpec.description}`)

  const result = await runMasterAgent({ agentSpec, evalTargetId, config })

  if (result.status === 'review_pending') {
    console.log(`\n[cli] ⏸  Run paused for human review.`)
    console.log(`[cli] Review the generated tests:`)
    console.log(`      GET  http://localhost:3000/api/eval/runs/${result.runId}`)
    console.log(`[cli] Then approve or reject:`)
    console.log(`      POST http://localhost:3000/api/eval/reviews/${result.runId}`)
    console.log(`      Body: { "decision": "approve_all" }`)
    console.log(`\n[cli] Or resume via CLI after approval:`)
    console.log(`      npx tsx agent-eval/cli.ts resume --run-id ${result.runId}`)
  } else {
    const passCount = result.results.filter(r => r.verdict === 'PASS').length
    console.log(`\n[cli] ✅ Run completed: ${passCount}/${result.results.length} passed`)
    console.log(`[cli] Report: agent-eval/reports/`)
  }
}

async function commandResume(values: Record<string, string | boolean | undefined>) {
  const runId = values['run-id'] as string
  if (!runId) {
    console.error('Error: --run-id is required for resume')
    process.exit(1)
  }

  const run = await prisma.evalRun.findUnique({
    where: { id: runId },
    include: { target: true },
  })

  if (!run) {
    console.error(`Run ${runId} not found`)
    process.exit(1)
  }

  console.log(`[cli] Run ${runId} status: ${run.status}`)
  if (run.status === 'review_pending') {
    console.log(`[cli] This run is waiting for human review.`)
    console.log(`[cli] To approve: POST http://localhost:3000/api/eval/reviews/${runId}`)
    console.log(`      Body: { "decision": "approve_all" }`)
  }
}

async function commandStatus(values: Record<string, string | boolean | undefined>) {
  const runId = values['run-id'] as string
  if (!runId) {
    console.error('Error: --run-id is required for status')
    process.exit(1)
  }

  const run = await prisma.evalRun.findUnique({
    where: { id: runId },
    include: {
      testCases: { include: { executionResult: true } },
      report: true,
    },
  })

  if (!run) {
    console.error(`Run ${runId} not found`)
    process.exit(1)
  }

  const executed = run.testCases.filter(t => t.status === 'executed')
  const passed = executed.filter(t => t.executionResult?.verdict === 'PASS').length

  console.log(`\nRun: ${runId}`)
  console.log(`Status: ${run.status}`)
  console.log(`Tests: ${run.testCases.length} total, ${executed.length} executed, ${passed} passed`)
  if (run.compositeScore) console.log(`Score: ${run.compositeScore.toFixed(1)}/10 (${run.verdict})`)
  if (run.report?.markdownPath) console.log(`Report: ${run.report.markdownPath}`)
}

function printUsage() {
  console.log(`
Usage:
  npx tsx agent-eval/cli.ts run --input repo --repo <url> [--branch <branch>] [--config <path>] [--trace-strategy langfuse|blackbox]
  npx tsx agent-eval/cli.ts run --input api --endpoint <url> [--system-prompt <prompt>] [--config <path>]
  npx tsx agent-eval/cli.ts resume --run-id <id>
  npx tsx agent-eval/cli.ts status --run-id <id>

Examples:
  npx tsx agent-eval/cli.ts run --input repo --repo https://github.com/org/my-agent --config agent-eval/eval-config.example.yaml
  npx tsx agent-eval/cli.ts run --input api --endpoint https://my-agent.example.com/chat --trace-strategy langfuse
  npx tsx agent-eval/cli.ts status --run-id cld123abc
`)
}

main().catch(err => {
  console.error('[cli] Fatal error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
