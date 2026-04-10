'use client';

import { useState, useEffect, useRef } from 'react';

/* ── Shared data ─────────────────────────────────────────── */

const SAMPLE_PROMPT = `You are a helpful assistant. Answer questions about programming. Be good and nice. Don't be rude.`;

const ANALYSIS_RESULTS = [
  {
    id: 'no-role',
    severity: 'info' as const,
    passed: true,
    score: 80,
    label: 'Role Definition',
    message: 'Role detected: "helpful assistant"',
    suggestion: 'Consider a more specific persona with domain expertise.',
    category: 'structure',
  },
  {
    id: 'min-length',
    severity: 'warning' as const,
    passed: false,
    score: 25,
    label: 'Prompt Length',
    message: 'Prompt is only 18 words. Effective prompts typically need more detail.',
    suggestion: 'Expand with context, constraints, and examples.',
    category: 'structure',
  },
  {
    id: 'no-examples',
    severity: 'error' as const,
    passed: false,
    score: 0,
    label: 'Few-shot Examples',
    message: 'No examples provided.',
    suggestion: 'Add 1-3 examples of expected input/output pairs.',
    category: 'specificity',
  },
  {
    id: 'no-output-format',
    severity: 'error' as const,
    passed: false,
    score: 0,
    label: 'Output Format',
    message: 'No output format specified.',
    suggestion: 'Define expected format: "Respond in markdown with code blocks."',
    category: 'specificity',
  },
  {
    id: 'vague-instruction',
    severity: 'warning' as const,
    passed: false,
    score: 30,
    label: 'Vague Language',
    message: '"good", "nice" — undefined qualitative terms.',
    suggestion: 'Replace with specific behaviors: tone, length, style.',
    category: 'clarity',
  },
  {
    id: 'ambiguous-negation',
    severity: 'warning' as const,
    passed: false,
    score: 40,
    label: 'Negative Instructions',
    message: '"Don\'t be rude" uses negation instead of positive instruction.',
    suggestion: 'Rewrite as: "Maintain a professional and respectful tone."',
    category: 'clarity',
  },
  {
    id: 'no-constraints',
    severity: 'warning' as const,
    passed: false,
    score: 10,
    label: 'Constraints',
    message: 'No boundaries or limitations defined.',
    suggestion: 'Add scope limits, response length, or topic boundaries.',
    category: 'structure',
  },
  {
    id: 'no-context',
    severity: 'info' as const,
    passed: false,
    score: 20,
    label: 'Context',
    message: 'No background context or scenario provided.',
    suggestion: 'Describe who the user is and the use case.',
    category: 'structure',
  },
  {
    id: 'no-structured-format',
    severity: 'info' as const,
    passed: true,
    score: 90,
    label: 'Prompt Structure',
    message: 'Short prompt — structured formatting not required.',
    suggestion: null,
    category: 'structure',
  },
];

const OVERALL_SCORE = 32;

type Severity = 'error' | 'warning' | 'info';

function severityColor(s: Severity): string {
  if (s === 'error') return '#ff4d4f';
  if (s === 'warning') return '#faad14';
  return '#8c8c8c';
}

function severityBg(s: Severity): string {
  if (s === 'error') return 'rgba(255,77,79,0.08)';
  if (s === 'warning') return 'rgba(250,173,20,0.06)';
  return 'rgba(140,140,140,0.05)';
}

function scoreColor(score: number): string {
  if (score >= 70) return '#52c41a';
  if (score >= 40) return '#faad14';
  return '#ff4d4f';
}

/* ── Terminal view ───────────────────────────────────────── */

interface TerminalLine {
  text: string;
  color?: string;
  delay: number;
  big?: boolean;
}

function TerminalView() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const terminalLines: TerminalLine[] = [
    { text: '$ promptscore analyze prompt.txt --model claude', color: '#e2e8f0', delay: 0 },
    { text: '', delay: 200 },
    { text: '  PromptScore v0.1.0', color: '#7c8da6', delay: 400 },
    { text: '  Profile: claude | Rules: 12 deterministic', color: '#7c8da6', delay: 500 },
    { text: '', delay: 600 },
    {
      text: '  \u2500\u2500 Score \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
      color: '#546378',
      delay: 700,
    },
    { text: '', delay: 750 },
    {
      text: '      \u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591  32 / 100',
      color: '#ff4d4f',
      delay: 900,
      big: true,
    },
    { text: '', delay: 1000 },
    {
      text: '  \u2500\u2500 Issues (6) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
      color: '#546378',
      delay: 1100,
    },
    { text: '', delay: 1150 },
    {
      text: '  \u2717  no-examples          No few-shot examples provided',
      color: '#ff4d4f',
      delay: 1300,
    },
    {
      text: '     \u2570 Add 1-3 examples of expected input/output pairs.',
      color: '#546378',
      delay: 1400,
    },
    { text: '', delay: 1450 },
    {
      text: '  \u2717  no-output-format     No output format specified',
      color: '#ff4d4f',
      delay: 1550,
    },
    {
      text: '     \u2570 Define expected format: "Respond in markdown with code blocks."',
      color: '#546378',
      delay: 1650,
    },
    { text: '', delay: 1700 },
    {
      text: '  \u26a0  min-length           Prompt is only 18 words',
      color: '#faad14',
      delay: 1800,
    },
    {
      text: '     \u2570 Expand with context, constraints, and examples.',
      color: '#546378',
      delay: 1900,
    },
    { text: '', delay: 1950 },
    {
      text: '  \u26a0  vague-instruction    Undefined qualitative terms: "good", "nice"',
      color: '#faad14',
      delay: 2050,
    },
    {
      text: '     \u2570 Replace with specific behaviors: tone, length, style.',
      color: '#546378',
      delay: 2150,
    },
    { text: '', delay: 2200 },
    {
      text: '  \u26a0  ambiguous-negation   Uses negation instead of positive instruction',
      color: '#faad14',
      delay: 2300,
    },
    {
      text: '     \u2570 Rewrite as: "Maintain a professional and respectful tone."',
      color: '#546378',
      delay: 2400,
    },
    { text: '', delay: 2450 },
    {
      text: '  \u26a0  no-constraints       No boundaries or limitations defined',
      color: '#faad14',
      delay: 2550,
    },
    {
      text: '     \u2570 Add scope limits, response length, or topic boundaries.',
      color: '#546378',
      delay: 2650,
    },
    { text: '', delay: 2700 },
    {
      text: '  \u2500\u2500 Passed (3) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
      color: '#546378',
      delay: 2800,
    },
    { text: '', delay: 2850 },
    {
      text: '  \u2713  no-role              Role detected',
      color: '#52c41a',
      delay: 2950,
    },
    {
      text: '  \u2713  no-structured-format Short prompt \u2014 formatting OK',
      color: '#52c41a',
      delay: 3050,
    },
    {
      text: '  \u2713  missing-task         Task detected',
      color: '#52c41a',
      delay: 3150,
    },
    { text: '', delay: 3200 },
    {
      text: '  2 errors \u00b7 4 warnings \u00b7 3 passed',
      color: '#7c8da6',
      delay: 3350,
    },
    { text: '', delay: 3400 },
  ];

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    terminalLines.forEach((line, i) => {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, line]);
        if (i === terminalLines.length - 1) setDone(true);
      }, line.delay);
      timeouts.push(t);
    });
    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div ref={containerRef} className="terminal">
      <div className="terminal-dots">
        <div className="dot dot-red" />
        <div className="dot dot-yellow" />
        <div className="dot dot-green" />
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            color: line.color || '#e2e8f0',
            minHeight: 20,
            whiteSpace: 'pre',
            fontSize: line.big ? 16 : 13,
            fontWeight: line.big ? 700 : 400,
          }}
        >
          {line.text}
        </div>
      ))}
      {!done && <span className="cursor-blink">{'\u258a'}</span>}
    </div>
  );
}

/* ── Web view ────────────────────────────────────────────── */

function WebView() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [analyzed, setAnalyzed] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [model, setModel] = useState('claude');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const handleAnalyze = () => {
    setAnimating(true);
    setAnalyzed(false);
    setTimeout(() => {
      setAnalyzed(true);
      setAnimating(false);
    }, 1200);
  };

  const filtered =
    filter === 'all'
      ? ANALYSIS_RESULTS
      : ANALYSIS_RESULTS.filter((r) => {
          if (filter === 'errors') return r.severity === 'error';
          if (filter === 'warnings') return r.severity === 'warning';
          if (filter === 'passed') return r.passed && r.score >= 70;
          return true;
        });

  const errors = ANALYSIS_RESULTS.filter((r) => r.severity === 'error' && !r.passed).length;
  const warnings = ANALYSIS_RESULTS.filter((r) => r.severity === 'warning' && !r.passed).length;
  const passed = ANALYSIS_RESULTS.filter((r) => r.passed || r.score >= 70).length;

  return (
    <div className="webview">
      {/* Header */}
      <div className="webview-header">
        <div className="webview-brand">
          <div className="webview-icon">PS</div>
          <span className="webview-title">promptscore</span>
          <span className="webview-version">v0.1.0</span>
        </div>
        <a
          href="https://github.com/riccardomerenda/promptscore#usage"
          className="webview-docs-link"
        >
          Docs &uarr;
        </a>
      </div>

      {/* Input */}
      <div className="webview-input-area">
        <div className="webview-input-header">
          <label className="webview-label">Your prompt</label>
          <div className="model-selector">
            {['claude', 'gpt', 'gemini'].map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`model-btn ${model === m ? 'active' : ''}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setAnalyzed(false);
          }}
          rows={4}
          className="prompt-textarea"
        />
        <button
          onClick={handleAnalyze}
          disabled={animating || !prompt.trim()}
          className={`analyze-btn ${animating ? 'loading' : ''}`}
        >
          {animating ? 'Analyzing\u2026' : 'Analyze'}
        </button>
      </div>

      {/* Results */}
      {analyzed && (
        <div className="results-container">
          {/* Score ring */}
          <div className="score-card">
            <div className="score-ring-container">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f0eeeb" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={scoreColor(OVERALL_SCORE)}
                  strokeWidth="6"
                  strokeDasharray={`${(OVERALL_SCORE / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  className="score-ring-fill"
                />
              </svg>
              <div className="score-ring-label" style={{ color: scoreColor(OVERALL_SCORE) }}>
                {OVERALL_SCORE}
              </div>
            </div>
            <div>
              <div className="score-title">Needs significant improvement</div>
              <div className="score-description">
                Your prompt has a role but lacks examples, output format, constraints, and uses
                vague language.
              </div>
              <div className="score-counts">
                <span className="count-error">{errors} errors</span>
                <span className="count-warning">{warnings} warnings</span>
                <span className="count-passed">{passed} passed</span>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All' },
              { key: 'errors', label: `Errors (${errors})` },
              { key: 'warnings', label: `Warnings (${warnings})` },
              { key: 'passed', label: `Passed (${passed})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`filter-btn ${filter === f.key ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Rule cards */}
          <div className="rule-list">
            {filtered.map((rule) => {
              const isPassed = rule.passed && rule.score >= 70;
              return (
                <div
                  key={rule.id}
                  onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                  className={`rule-card ${expandedRule === rule.id ? 'expanded' : ''}`}
                  style={{
                    background: severityBg(isPassed ? 'info' : rule.severity),
                    borderColor: expandedRule === rule.id ? '#ccc8c3' : '#e8e5e0',
                  }}
                >
                  <div className="rule-card-header">
                    <div className="rule-card-left">
                      <span
                        className="rule-icon"
                        style={{ color: isPassed ? '#52c41a' : severityColor(rule.severity) }}
                      >
                        {isPassed ? '\u2713' : rule.severity === 'error' ? '\u2717' : '\u26a0'}
                      </span>
                      <span className="rule-id">{rule.id}</span>
                      <span className="rule-label">{rule.label}</span>
                    </div>
                    <span className="rule-score" style={{ color: scoreColor(rule.score) }}>
                      {rule.score}
                    </span>
                  </div>
                  {expandedRule === rule.id && (
                    <div className="rule-details">
                      <div className="rule-message">{rule.message}</div>
                      {rule.suggestion && (
                        <div className="rule-suggestion">
                          <span className="suggestion-icon">&#x1f4a1;</span> {rule.suggestion}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main demo with tabs ─────────────────────────────────── */

export function Demo() {
  const [tab, setTab] = useState<'web' | 'terminal'>('web');

  return (
    <section className="demo-section">
      <div className="demo-tabs">
        <button
          onClick={() => setTab('web')}
          className={`demo-tab ${tab === 'web' ? 'active' : ''}`}
        >
          Web UI
        </button>
        <button
          onClick={() => setTab('terminal')}
          className={`demo-tab ${tab === 'terminal' ? 'active' : ''}`}
        >
          Terminal
        </button>
      </div>
      {tab === 'web' ? <WebView /> : <TerminalView key={Date.now()} />}
    </section>
  );
}
