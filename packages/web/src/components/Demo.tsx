'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import {
  analyzeWithProfile,
  formatText,
  type BuiltinProfileName,
  type ScoreReport,
} from '@promptscore/core/browser';

const DEFAULT_PROMPT = `You are a helpful assistant.

Your task is to explain TypeScript generics to a junior frontend developer.

Use a friendly tone.
Keep the answer under 200 words.`;

const PROFILE_OPTIONS: Array<{ id: BuiltinProfileName; label: string }> = [
  { id: '_base', label: 'baseline' },
  { id: 'claude', label: 'claude' },
  { id: 'gpt', label: 'gpt' },
];

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--green)';
  if (score >= 50) return 'var(--yellow)';
  return 'var(--red)';
}

function severityLabel(severity: 'error' | 'warning' | 'info'): string {
  if (severity === 'error') return 'ERR';
  if (severity === 'warning') return 'WARN';
  return 'INFO';
}

interface AnalyzerViewProps {
  prompt: string;
  profileName: BuiltinProfileName;
  isAnalyzing: boolean;
  report: ScoreReport | null;
  error: string | null;
  isDirty: boolean;
  onPromptChange: (value: string) => void;
  onProfileChange: (value: BuiltinProfileName) => void;
  onAnalyze: () => void;
}

function AnalyzerView(props: AnalyzerViewProps) {
  const {
    prompt,
    profileName,
    isAnalyzing,
    report,
    error,
    isDirty,
    onPromptChange,
    onProfileChange,
    onAnalyze,
  } = props;

  const overallScore = Math.round(report?.overall ?? 0);
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (overallScore / 100) * circumference;
  const failedResults = report?.results.filter((result) => !result.passed) ?? [];
  const passedCount = report?.results.filter((result) => result.passed).length ?? 0;

  return (
    <div className="demo-body">
      <div className="demo-input-pane">
        <div className="demo-pane-header">
          <label>Your prompt</label>
          <span className="demo-profile-chip">Runs locally in the browser</span>
        </div>
        <textarea
          aria-label="Prompt analyzer input"
          className="demo-textarea"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
        />
        <div className="demo-input-footer">
          <div className="demo-model-select">
            {PROFILE_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`model-chip ${profileName === option.id ? 'active' : ''}`}
                onClick={() => onProfileChange(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !prompt.trim()}
            className={`analyze-chip ${isAnalyzing ? 'loading' : ''}`}
          >
            {isAnalyzing ? 'Analyzing…' : isDirty ? 'Re-analyze' : 'Analyze'}
          </button>
        </div>
        <p className="demo-pane-note">
          This analyzer uses the current deterministic engine from <code>@promptscore/core</code>.
          No API calls are made.
        </p>
      </div>
      <div className="demo-output-pane">
        {error ? (
          <div className="demo-error-card">
            <strong>Analysis failed</strong>
            <p>{error}</p>
          </div>
        ) : report ? (
          <>
            <div className="score-ring-wrapper">
              <div className="score-ring">
                <svg viewBox="0 0 100 100">
                  <circle className="score-ring-bg" cx="50" cy="50" r="44" />
                  <circle
                    className="score-ring-fill"
                    cx="50"
                    cy="50"
                    r="44"
                    style={{
                      stroke: scoreColor(overallScore),
                      strokeDasharray: circumference,
                      strokeDashoffset: offset,
                    }}
                  />
                </svg>
                <div className="score-num" style={{ color: scoreColor(overallScore) }}>
                  {overallScore}
                </div>
              </div>
              <div className="score-label">{report.profileName} profile</div>
            </div>

            <div className="demo-summary-card">
              <div className="demo-summary-title">Summary</div>
              <p>{report.summary}</p>
              <div className="demo-inline-stats">
                <span>{failedResults.length} findings</span>
                <span>{passedCount} passed</span>
              </div>
            </div>

            <div className="demo-section-label">Category scores</div>
            <div className="demo-category-list">
              {report.categories.map((category) => (
                <div key={category.category} className="demo-category-row">
                  <span>{category.category}</span>
                  <strong style={{ color: scoreColor(Math.round(category.score)) }}>
                    {Math.round(category.score)}/100
                  </strong>
                </div>
              ))}
            </div>

            <div className="demo-section-label">Findings</div>
            {failedResults.length > 0 ? (
              failedResults.map((result) => (
                <div key={result.ruleId} className="issue-item">
                  <span className={`issue-tag ${result.severity}`}>
                    {severityLabel(result.severity)}
                  </span>
                  <strong>{result.ruleId}</strong> - {result.message}
                  {result.suggestion ? <p className="issue-detail">{result.suggestion}</p> : null}
                  {result.reference ? (
                    <a href={result.reference} target="_blank" rel="noopener noreferrer">
                      Reference
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="demo-success-card">
                <strong>No failing rules</strong>
                <p>This prompt passes every deterministic check in the selected profile.</p>
              </div>
            )}
          </>
        ) : (
          <div className="demo-placeholder">
            <div className="placeholder-icon">PS</div>
            <p>Run the analyzer to see a real prompt report here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalView(props: {
  report: ScoreReport | null;
  error: string | null;
  isAnalyzing: boolean;
  profileName: BuiltinProfileName;
}) {
  const { report, error, isAnalyzing, profileName } = props;

  if (error) {
    return <div className="terminal-content">error: {error}</div>;
  }

  if (!report) {
    return <div className="terminal-content">Run the browser analyzer to generate a report.</div>;
  }

  const output = formatText(report, { color: false });

  return (
    <div className="terminal-content">
      <div className="terminal-meta">
        <span>
          $ promptscore analyze prompt.txt --model {profileName === '_base' ? '_base' : profileName}
        </span>
        <span>{isAnalyzing ? 'refreshing…' : 'deterministic output'}</span>
      </div>
      <pre className="terminal-output">{output}</pre>
    </div>
  );
}

export function Demo() {
  const latestRunId = useRef(0);
  const [tab, setTab] = useState<'browser' | 'terminal'>('browser');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [profileName, setProfileName] = useState<BuiltinProfileName>('claude');
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  async function runAnalysis(nextPrompt = prompt, nextProfileName = profileName): Promise<void> {
    const runId = latestRunId.current + 1;
    latestRunId.current = runId;
    setIsAnalyzing(true);
    setError(null);

    try {
      const nextReport = await analyzeWithProfile(nextPrompt, {
        profileName: nextProfileName,
      });

      if (latestRunId.current !== runId) return;

      startTransition(() => {
        setReport(nextReport);
        setError(null);
        setIsDirty(false);
      });
    } catch (err) {
      if (latestRunId.current !== runId) return;

      const message = err instanceof Error ? err.message : String(err);
      startTransition(() => {
        setError(message);
      });
    } finally {
      if (latestRunId.current === runId) {
        setIsAnalyzing(false);
      }
    }
  }

  useEffect(() => {
    void runAnalysis(DEFAULT_PROMPT, 'claude');
  }, []);

  function handlePromptChange(value: string): void {
    setPrompt(value);
    setIsDirty(true);
  }

  function handleProfileChange(value: BuiltinProfileName): void {
    setProfileName(value);
    void runAnalysis(prompt, value);
  }

  return (
    <section className="demo-section">
      <div className="section-label">Live analyzer</div>
      <p className="demo-disclaimer">
        The browser analyzer below uses the current deterministic engine directly in the client, so
        the score and findings stay aligned with the CLI and the core library.
      </p>
      <div className="demo-window">
        <div className="demo-titlebar">
          <div className="demo-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="demo-tabs">
            <button
              className={`demo-tab ${tab === 'browser' ? 'active' : ''}`}
              onClick={() => setTab('browser')}
              type="button"
            >
              Browser analyzer
            </button>
            <button
              className={`demo-tab ${tab === 'terminal' ? 'active' : ''}`}
              onClick={() => setTab('terminal')}
              type="button"
            >
              CLI view
            </button>
          </div>
          <span className="demo-version">v0.1.0</span>
        </div>
        {tab === 'browser' ? (
          <AnalyzerView
            prompt={prompt}
            profileName={profileName}
            isAnalyzing={isAnalyzing}
            report={report}
            error={error}
            isDirty={isDirty}
            onPromptChange={handlePromptChange}
            onProfileChange={handleProfileChange}
            onAnalyze={() => void runAnalysis()}
          />
        ) : (
          <TerminalView
            report={report}
            error={error}
            isAnalyzing={isAnalyzing}
            profileName={profileName}
          />
        )}
      </div>
    </section>
  );
}
