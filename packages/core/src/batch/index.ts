import type { ScoreReport } from '../scorer/index.js';
import type { RuleResult } from '../rules/types.js';

export interface SeverityCounts {
  error: number;
  warning: number;
  info: number;
  total: number;
}

export interface BatchFileReport {
  path: string;
  report: ScoreReport;
  findings: SeverityCounts;
  hasFailures: boolean;
}

export interface BatchWorstFile {
  path: string;
  overall: number;
  profileName: string;
  findings: SeverityCounts;
}

export interface BatchSummary {
  files: number;
  passedFiles: number;
  failedFiles: number;
  averageScore: number;
  findings: SeverityCounts;
  profiles: string[];
}

export interface BatchReport {
  kind: 'batch';
  summary: BatchSummary;
  worstFiles: BatchWorstFile[];
  files: BatchFileReport[];
}

export interface BatchReportInput {
  path: string;
  report: ScoreReport;
}

export function countFindings(results: RuleResult[]): SeverityCounts {
  let error = 0;
  let warning = 0;
  let info = 0;

  for (const result of results) {
    if (result.passed) continue;
    if (result.severity === 'error') {
      error += 1;
    } else if (result.severity === 'warning') {
      warning += 1;
    } else {
      info += 1;
    }
  }

  return {
    error,
    warning,
    info,
    total: error + warning + info,
  };
}

export function buildBatchReport(inputs: BatchReportInput[]): BatchReport {
  const files = [...inputs]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map<BatchFileReport>((entry) => {
      const findings = countFindings(entry.report.results);
      return {
        path: entry.path,
        report: entry.report,
        findings,
        hasFailures: findings.total > 0,
      };
    });

  const findings = files.reduce<SeverityCounts>(
    (acc, file) => ({
      error: acc.error + file.findings.error,
      warning: acc.warning + file.findings.warning,
      info: acc.info + file.findings.info,
      total: acc.total + file.findings.total,
    }),
    { error: 0, warning: 0, info: 0, total: 0 },
  );

  const profiles = [...new Set(files.map((file) => file.report.profileName))].sort();
  const failedFiles = files.filter((file) => file.hasFailures).length;
  const averageScore =
    files.length === 0
      ? 0
      : files.reduce((sum, file) => sum + file.report.overall, 0) / files.length;

  const worstFiles = [...files]
    .sort((a, b) => {
      if (a.report.overall !== b.report.overall) {
        return a.report.overall - b.report.overall;
      }
      if (a.findings.total !== b.findings.total) {
        return b.findings.total - a.findings.total;
      }
      return a.path.localeCompare(b.path);
    })
    .slice(0, 5)
    .map<BatchWorstFile>((file) => ({
      path: file.path,
      overall: file.report.overall,
      profileName: file.report.profileName,
      findings: file.findings,
    }));

  return {
    kind: 'batch',
    summary: {
      files: files.length,
      passedFiles: files.length - failedFiles,
      failedFiles,
      averageScore,
      findings,
      profiles,
    },
    worstFiles,
    files,
  };
}
