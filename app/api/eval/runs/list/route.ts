import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const runs = await prisma.evalRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: {
      target: { select: { name: true, inputType: true, traceStrategy: true } },
      report: { select: { runScore: true } },
      _count: { select: { testCases: true } },
    },
  })

  return NextResponse.json(
    runs.map(run => ({
      runId: run.id,
      agentName: run.target.name,
      inputType: run.target.inputType,
      traceStrategy: run.target.traceStrategy,
      status: run.status,
      compositeScore: run.compositeScore,
      verdict: run.verdict,
      testCount: run._count.testCases,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
    }))
  )
}
