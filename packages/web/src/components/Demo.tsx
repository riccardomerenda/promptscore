'use client';

import { useState, useEffect, useRef } from 'react';

/* ── Shared data ─────────────────────────────────────────── */

const SAMPLE_PROMPT = `You are a helpful assistant. Answer questions about programming. Be good and nice. Don't be rude.`;

const ANALYSIS_RESULTS = [
  {
    id: 'min-length',
    severity: 'warning' as const,
    passed: false,
    label: 'Too short',
    message: 'Prompt is only 18 words. Effective prompts typically need more detail.',
  },
  {
    id: 'vague-instruction',
    severity: 'warning' as const,
    passed: false,
    label: 'Too vague',
    message: '"Be good and nice" lacks specifics. Define tone, constraints, and behavior.',
  },
  {
    id: 'no-output-format',
    severity: 'error' as const,
    passed: false,
    label: 'No output format',
    message: 'Specify response format (JSON, markdown, plain text, code blocks).',
  },
  {
    id: 'no-examples',
    severity: 'info' as const,
    passed: false,
    label: 'No examples',
    message: 'Claude performs better with few-shot examples in the prompt.',
  },
  {
    id: 'ambiguous-negation',
    severity: 'warning' as const,
    passed: false,
    label: 'Negative instruction',
    message: '"Don\'t be rude" is weaker than stating desired behavior positively.',
  },
  {
    id: 'no-constraints',
    severity: 'warning' as const,
    passed: false,
    label: 'No constraints',
    message: 'No boundaries or limitations defined. Add scope limits or topic boundaries.',
  },
];

const OVERALL_SCORE = 50;

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--green)';
  if (score >= 40) return 'var(--yellow)';
  return 'var(--red)';
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
    { text: '  \u2713  no-role              Role detected', color: '#52c41a', delay: 2950 },
    {
      text: '  \u2713  no-structured-format Short prompt \u2014 formatting OK',
      color: '#52c41a',
      delay: 3050,
    },
    { text: '  \u2713  missing-task         Task detected', color: '#52c41a', delay: 3150 },
    { text: '', delay: 3200 },
    { text: '  2 errors \u00b7 4 warnings \u00b7 3 passed', color: '#7c8da6', delay: 3350 },
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
    <div ref={containerRef} className="terminal-content">
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

/* ── Web view (split pane) ──────────────────────────────── */

function WebView() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [analyzed, setAnalyzed] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [model, setModel] = useState('claude');

  const handleAnalyze = () => {
    setAnimating(true);
    setAnalyzed(false);
    setTimeout(() => {
      setAnalyzed(true);
      setAnimating(false);
    }, 1200);
  };

  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (OVERALL_SCORE / 100) * circumference;

  return (
    <div className="demo-body">
      <div className="demo-input-pane">
        <label>Your prompt</label>
        <textarea
          className="demo-textarea"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setAnalyzed(false);
          }}
        />
        <div className="demo-input-footer">
          <div className="demo-model-select">
            {['claude', 'gpt', 'gemini'].map((m) => (
              <button
                key={m}
                className={`model-chip ${model === m ? 'active' : ''}`}
                onClick={() => setModel(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={animating || !prompt.trim()}
            className={`analyze-chip ${animating ? 'loading' : ''}`}
          >
            {animating ? 'Analyzing\u2026' : 'Analyze \u2192'}
          </button>
        </div>
      </div>
      <div className="demo-output-pane">
        {analyzed ? (
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
                      stroke: scoreColor(OVERALL_SCORE),
                      strokeDasharray: circumference,
                      strokeDashoffset: offset,
                    }}
                  />
                </svg>
                <div className="score-num" style={{ color: scoreColor(OVERALL_SCORE) }}>
                  {OVERALL_SCORE}
                </div>
              </div>
              <div className="score-label">PROMPT SCORE</div>
            </div>
            <span className="output-label">Issues Found</span>
            {ANALYSIS_RESULTS.map((r) => (
              <div key={r.id} className="issue-item">
                <span className={`issue-tag ${r.severity}`}>
                  {r.severity === 'error' ? 'ERR' : r.severity === 'warning' ? 'WARN' : 'INFO'}
                </span>
                <strong>{r.label}</strong> &mdash; {r.message}
              </div>
            ))}
          </>
        ) : (
          <div className="demo-placeholder">
            <div className="placeholder-icon">&#x2726;</div>
            <p>
              Write a prompt and click <strong>Analyze</strong> to see results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main demo with tabs ─────────────────────────────────── */

export function Demo() {
  const [tab, setTab] = useState<'web' | 'terminal'>('web');

  return (
    <section className="demo-section">
      <div className="demo-window">
        <div className="demo-titlebar">
          <div className="demo-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="demo-tabs">
            <button
              className={`demo-tab ${tab === 'web' ? 'active' : ''}`}
              onClick={() => setTab('web')}
            >
              Web UI
            </button>
            <button
              className={`demo-tab ${tab === 'terminal' ? 'active' : ''}`}
              onClick={() => setTab('terminal')}
            >
              Terminal
            </button>
          </div>
          <span className="demo-version">v0.1.0</span>
        </div>
        {tab === 'web' ? <WebView /> : <TerminalView key={Date.now()} />}
      </div>
    </section>
  );
}
