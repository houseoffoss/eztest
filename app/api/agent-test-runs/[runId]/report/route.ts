import { hasPermission } from "@/lib/rbac";
import { agentTestExecutionService } from "@/backend/services/agent-test-config/execution.service";
import { NextResponse } from "next/server";
import type { AgentTestResultSummary } from "@/backend/services/agent-test-config/execution.service";

/**
 * GET /api/agent-test-runs/:runId/report?format=pdf
 *
 * Returns a print-ready HTML document that the browser can save as PDF.
 * We generate HTML server-side (no headless browser needed).
 * The client downloads it as an .html file; when printed/saved it becomes PDF.
 *
 * We serve it with content-type text/html and
 * Content-Disposition: attachment; filename="..."
 */
export const GET = hasPermission(
  async (request, context) => {
    const { runId } = await context.params;
    const run = await agentTestExecutionService.getRun(
      runId,
      request.userInfo.id,
    );

    const html = buildReportHtml(run);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="agent-test-run-${runId}.html"`,
      },
    });
  },
  "agent_testing",
  "read",
);

// ─── HTML builder ──────────────────────────────────────────────────────────

type RunData = Awaited<ReturnType<typeof agentTestExecutionService.getRun>>;

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreColor(v: number): string {
  if (v >= 80) return "#4ade80";
  if (v >= 60) return "#facc15";
  if (v >= 40) return "#fb923c";
  return "#f87171";
}

function buildReportHtml(run: RunData): string {
  const totalPass = run.results.reduce((s, r) => s + (r.passCount ?? 0), 0);
  const totalFail = run.results.reduce((s, r) => s + (r.failCount ?? 0), 0);
  const totalCriteria = totalPass + totalFail;
  const passRate =
    totalCriteria > 0 ? Math.round((totalPass / totalCriteria) * 100) : 0;

  const dimensionRows =
    run.aqsScore != null
      ? [
          ["Correctness (40%)", run.aqsCorrectness],
          ["Tool Use (20%)", run.aqsToolUse],
          ["Latency (15%)", run.aqsLatency],
          ["Reliability (15%)", run.aqsErrorRate],
          ["Trace Coverage (10%)", run.aqsTraceCoverage],
        ]
          .map(
            ([label, val]) => `
        <tr>
          <td>${label}</td>
          <td style="color:${scoreColor(Number(val ?? 0))};font-weight:600">${Number(val ?? 0).toFixed(1)}</td>
          <td>
            <div style="height:6px;background:#1e2030;border-radius:4px;width:200px">
              <div style="height:6px;border-radius:4px;background:${scoreColor(Number(val ?? 0))};width:${Number(val ?? 0)}%"></div>
            </div>
          </td>
        </tr>`,
          )
          .join("")
      : "";

  const resultRows = run.results
    .map((r: AgentTestResultSummary) => {
      let rubricHtml = "";
      if (r.rubricScores) {
        try {
          const scores = JSON.parse(r.rubricScores) as {
            criterion: string;
            pass: boolean;
            reason: string;
          }[];
          rubricHtml = scores
            .map(
              (s) =>
                `<div style="margin:2px 0;color:${s.pass ? "#4ade80" : "#f87171"}">${s.pass ? "✓" : "✗"} ${esc(s.criterion)} — <em style="color:#9ca3af">${esc(s.reason)}</em></div>`,
            )
            .join("");
        } catch {
          rubricHtml = "";
        }
      }

      const passLabel =
        r.passCount != null
          ? `${r.passCount}/${(r.passCount ?? 0) + (r.failCount ?? 0)}`
          : "—";

      return `
      <tr>
        <td style="font-weight:500">${esc(r.testCase.title)}</td>
        <td>${esc(r.testCase.category.replace("_", " "))}</td>
        <td style="color:${r.status === "error" ? "#f87171" : "#4ade80"}">${esc(r.status)}</td>
        <td>${r.httpStatus ?? "—"}</td>
        <td>${r.latencyMs != null ? `${r.latencyMs}ms` : "—"}</td>
        <td style="color:${(r.failCount ?? 0) > 0 ? "#f87171" : "#4ade80"};font-weight:600">${passLabel}</td>
      </tr>
      ${rubricHtml ? `<tr><td colspan="6" style="padding:4px 8px 12px 24px;font-size:11px;border-top:none">${rubricHtml}</td></tr>` : ""}`;
    })
    .join("");

  const regressionHtml =
    run.aqsRegressionDelta != null
      ? `<span style="color:${run.aqsRegressionDelta >= 0 ? "#4ade80" : "#f87171"};margin-left:12px;font-size:13px">
           ${run.aqsRegressionDelta >= 0 ? "▲" : "▼"} ${Math.abs(run.aqsRegressionDelta).toFixed(1)} vs last run
         </span>`
      : `<span style="color:#6b7280;margin-left:12px;font-size:13px">First run</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Agent Test Report — ${esc(run.configName)} — ${esc(run.runId)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; background: #0b0d14; color: #e2e8f0; margin: 0; padding: 32px; }
  h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
  h2 { font-size: 16px; font-weight: 600; color: #94a3b8; margin: 32px 0 12px; border-bottom: 1px solid #1e2030; padding-bottom: 6px; }
  .meta { color: #64748b; font-size: 13px; margin-bottom: 32px; }
  .stats { display: flex; gap: 24px; margin-bottom: 24px; }
  .stat { background: #0f1117; border: 1px solid #1e2030; border-radius: 12px; padding: 16px 24px; min-width: 140px; text-align: center; }
  .stat-value { font-size: 28px; font-weight: 700; }
  .stat-label { font-size: 11px; color: #64748b; margin-top: 4px; }
  .aqs-score { font-size: 48px; font-weight: 800; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 10px; background: #0f1117; color: #64748b; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
  td { padding: 10px; border-top: 1px solid #1e2030; vertical-align: top; }
  tr:hover td { background: rgba(255,255,255,.02); }
  @media print {
    body { background: white; color: #1e293b; }
    .stat, table { border-color: #e2e8f0; }
    th { background: #f8fafc; color: #64748b; }
    td { border-color: #e2e8f0; }
  }
</style>
</head>
<body>
  <h1>Agent Test Report</h1>
  <div class="meta">
    Config: <strong>${esc(run.configName)}</strong> &nbsp;·&nbsp;
    Run ID: <code>${esc(run.runId)}</code> &nbsp;·&nbsp;
    ${run.completedAt ? `Completed: ${new Date(run.completedAt).toLocaleString()}` : "Status: " + run.status}
  </div>

  ${
    run.aqsScore != null
      ? `<h2>Agent Quality Score (AQS)</h2>
  <div style="display:flex;gap:40px;align-items:flex-start;margin-bottom:24px">
    <div style="text-align:center">
      <div class="aqs-score" style="color:${scoreColor(run.aqsScore)}">${run.aqsScore}</div>
      <div style="color:#64748b;font-size:13px">/ 100${regressionHtml}</div>
    </div>
    <table style="max-width:480px">
      <thead><tr><th>Dimension</th><th>Score</th><th>Bar</th></tr></thead>
      <tbody>${dimensionRows}</tbody>
    </table>
  </div>`
      : ""
  }

  <h2>Summary</h2>
  <div class="stats">
    <div class="stat"><div class="stat-value">${run.totalCases}</div><div class="stat-label">Total Tests</div></div>
    <div class="stat"><div class="stat-value" style="color:${passRate >= 70 ? "#4ade80" : passRate >= 40 ? "#facc15" : "#f87171"}">${passRate}%</div><div class="stat-label">Pass Rate</div></div>
    <div class="stat"><div class="stat-value" style="color:#4ade80">${totalPass}</div><div class="stat-label">Criteria Passed</div></div>
    <div class="stat"><div class="stat-value" style="color:#f87171">${totalFail}</div><div class="stat-label">Criteria Failed</div></div>
  </div>

  <h2>Test Results</h2>
  <table>
    <thead>
      <tr>
        <th>Title</th><th>Category</th><th>Status</th><th>HTTP</th><th>Latency</th><th>Rubric</th>
      </tr>
    </thead>
    <tbody>${resultRows}</tbody>
  </table>

  <p style="margin-top:48px;font-size:11px;color:#374151;text-align:center">
    Generated by EZTest Agent Testing · ${new Date().toLocaleString()}
  </p>
</body>
</html>`;
}
