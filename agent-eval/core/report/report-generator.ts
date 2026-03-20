import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import type { EvaluationScore } from '../agent/tools/evaluate-result'

const prisma = new PrismaClient()

const REPORTS_DIR = join(process.cwd(), 'agent-eval', 'reports')

export async function generateMarkdownReport(
  runId: string,
  results: EvaluationScore[]
): Promise<string> {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }

  const run = await prisma.evalRun.findUnique({
    where: { id: runId },
    include: {
      target: true,
      testCases: { include: { executionResult: true } },
      report: true,
    },
  })

  if (!run) throw new Error(`[report-generator] Run ${runId} not found`)

  const passCount = results.filter(r => r.verdict === 'PASS').length
  const failCount = results.filter(r => r.verdict === 'FAIL').length
  const errorCount = results.filter(r => r.verdict === 'ERROR').length
  const avgScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.compositeScore, 0) / results.length
    : 0

  // Category breakdown
  const categoryMap = new Map<string, EvaluationScore[]>()
  for (const tc of run.testCases) {
    if (!tc.executionResult) continue
    const score = results.find(r => r.testCaseId === tc.id)
    if (!score) continue
    if (!categoryMap.has(tc.category)) categoryMap.set(tc.category, [])
    categoryMap.get(tc.category)!.push(score)
  }

  const categoryTable = [...categoryMap.entries()].map(([cat, scores]) => {
    const pass = scores.filter(s => s.verdict === 'PASS').length
    const avg = scores.reduce((s, r) => s + r.compositeScore, 0) / scores.length
    return `| ${cat} | ${scores.length} | ${pass} | ${scores.length - pass} | ${avg.toFixed(1)} |`
  }).join('\n')

  // Per-test score cards
  const testCards = run.testCases
    .filter(tc => tc.executionResult)
    .map(tc => {
      const score = results.find(r => r.testCaseId === tc.id)
      if (!score) return ''
      const verdict = score.verdict
      const emoji = verdict === 'PASS' ? '✅' : verdict === 'ERROR' ? '⚠️' : '❌'
      return `### ${emoji} [${verdict} ${score.compositeScore.toFixed(1)}] ${tc.title}
- **Category:** ${tc.category}
- **Factual Accuracy:** ${score.factualAccuracy.toFixed(1)}/10
- **Instruction Following:** ${score.instructionFollowing.toFixed(1)}/10
- **Reasoning:** ${score.judgeReasoning}`
    }).join('\n\n')

  const verdictBand = scoreToVerdict(avgScore)
  const date = new Date().toISOString().split('T')[0]

  const markdown = `# Evaluation Report — ${run.target.name}

**Run ID:** ${runId}
**Date:** ${date}
**Score:** ${avgScore.toFixed(1)}/10 (${verdictBand.toUpperCase()})
**Trace Strategy:** ${run.target.traceStrategy ?? 'blackbox'}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${results.length} |
| Passed | ${passCount} |
| Failed | ${failCount} |
| Errors | ${errorCount} |
| Composite Score | ${avgScore.toFixed(1)} / 10 |
| Verdict | ${verdictBand.toUpperCase()} |

---

## Category Breakdown

| Category | Tests | Pass | Fail | Score |
|----------|-------|------|------|-------|
${categoryTable || '| — | — | — | — | — |'}

---

## Per-Test Score Cards

${testCards || '_No tests executed._'}

---

## Score Guide

| Band | Range |
|------|-------|
| Excellent | ≥ 9.0 |
| Good (pass) | 7.0 – 8.9 |
| Needs Improvement | 5.0 – 6.9 |
| Poor | < 5.0 |

> *Evaluation dimensions in this run: Factual Accuracy (55%) + Instruction Following (45%)*
`

  const filename = `${date}-${runId}.md`
  const reportPath = join(REPORTS_DIR, filename)
  writeFileSync(reportPath, markdown, 'utf-8')
  console.log(`[report-generator] Report written to ${reportPath}`)

  // Update DB
  const categoryScoresObj: Record<string, number> = {}
  for (const [cat, scores] of categoryMap.entries()) {
    categoryScoresObj[cat] = scores.reduce((s, r) => s + r.compositeScore, 0) / scores.length
  }

  const existingReport = run.report
  if (existingReport) {
    await prisma.evalReport.update({
      where: { runId },
      data: {
        runScore: avgScore,
        categoryScores: categoryScoresObj,
        failurePatterns: [],
        markdownPath: reportPath,
      },
    })
  } else {
    await prisma.evalReport.create({
      data: {
        runId,
        runScore: avgScore,
        categoryScores: categoryScoresObj,
        failurePatterns: [],
        suggestions: '',
        markdownPath: reportPath,
      },
    })
  }

  return reportPath
}

function scoreToVerdict(score: number): string {
  if (score >= 9.0) return 'excellent'
  if (score >= 7.0) return 'good'
  if (score >= 5.0) return 'needs_improvement'
  return 'poor'
}
