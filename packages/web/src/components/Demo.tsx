'use client';

import { useEffect, useRef, useState } from 'react';

const SAMPLE_PROMPT = `You are a helpful assistant.
Please explain TypeScript concepts.
Be good and nice.`;

const SAMPLE_RESULTS = [
  {
    id: 'min-length',
    severity: 'warning' as const,
    label: 'Minimum length',
    message: 'The prompt is still short, so the model has limited context to work with.',
  },
  {
    id: 'no-output-format',
    severity: 'warning' as const,
    label: 'Output format',
    message: 'No output format is specified, so the answer shape is left to the model.',
  },
  {
    id: 'no-examples',
    severity: 'warning' as const,
    label: 'Examples',
    message: 'There are no examples to anchor the expected behavior or formatting.',
  },
  {
    id: 'vague-instruction',
    severity: 'warning' as const,
    label: 'Vague language',
    message: '"Good" and "nice" do not give the model a measurable target.',
  },
  {
    id: 'no-context',
    severity: 'info' as const,
    label: 'Context',
    message: 'Background context is missing, so the prompt leaves audience and stakes implicit.',
  },
  {
    id: 'no-constraints',
    severity: 'info' as const,
    label: 'Constraints',
    message: 'No explicit boundaries are defined for length, scope, or style.',
  },
];

const OVERALL_SCORE = 43;

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--green)';
  if (score >= 40) return 'var(--yellow)';
  return 'var(--red)';
}

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
    { text: 'PromptScore - profile: claude', color: '#e2e8f0', delay: 400 },
    { text: '', delay: 550 },
    {
      text: 'Overall  43/100  [#############.................]',
      color: '#faad14',
      delay: 800,
      big: true,
    },
    { text: 'Score 43/100 - 4 warnings, 2 info.', color: '#7c8da6', delay: 1000 },
    { text: '', delay: 1100 },
    { text: 'Categories', color: '#e2e8f0', delay: 1250 },
    { text: '  clarity          46/100 (3 rules)', color: '#7c8da6', delay: 1400 },
    { text: '  structure       100/100 (2 rules)', color: '#7c8da6', delay: 1500 },
    { text: '  specificity      35/100 (4 rules)', color: '#7c8da6', delay: 1600 },
    { text: '  best-practice    50/100 (3 rules)', color: '#7c8da6', delay: 1700 },
    { text: '', delay: 1800 },
    { text: 'Findings', color: '#e2e8f0', delay: 1950 },
    {
      text: '  warn  min-length           Prompt is very short (13 words).',
      color: '#faad14',
      delay: 2100,
    },
    {
      text: '        -> Add more detail about what you want and how the output should look.',
      color: '#546378',
      delay: 2200,
    },
    {
      text: '  warn  no-output-format     No output format is specified.',
      color: '#faad14',
      delay: 2350,
    },
    {
      text: '        -> State the exact format: JSON, bullets, markdown, or a sentence.',
      color: '#546378',
      delay: 2450,
    },
    {
      text: '  warn  no-examples          No examples provided.',
      color: '#faad14',
      delay: 2600,
    },
    {
      text: '        -> Add 1-3 examples showing the expected input and output.',
      color: '#546378',
      delay: 2700,
    },
    {
      text: '  warn  vague-instruction    Vague qualifiers used: good, nice.',
      color: '#faad14',
      delay: 2850,
    },
    {
      text: '        -> Replace vague words with measurable criteria.',
      color: '#546378',
      delay: 2950,
    },
    {
      text: '  info  no-context           No background context detected.',
      color: '#60a5fa',
      delay: 3100,
    },
    {
      text: '  info  no-constraints       No constraints detected.',
      color: '#60a5fa',
      delay: 3200,
    },
    { text: '', delay: 3300 },
    { text: '6 rules passed.', color: '#7c8da6', delay: 3450 },
  ];

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    terminalLines.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev, line]);
        if (index === terminalLines.length - 1) setDone(true);
      }, line.delay);
      timeouts.push(timeout);
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
      {lines.map((line, index) => (
        <div
          key={index}
          style={{
            color: line.color ?? '#e2e8f0',
            minHeight: 20,
            whiteSpace: 'pre',
            fontSize: line.big ? 15 : 13,
            fontWeight: line.big ? 700 : 400,
          }}
        >
          {line.text}
        </div>
      ))}
      {!done && <span className="cursor-blink">|</span>}
    </div>
  );
}

function BrowserPreview() {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (OVERALL_SCORE / 100) * circumference;

  return (
    <div className="demo-body">
      <div className="demo-input-pane">
        <div className="demo-pane-header">
          <label>Sample prompt</label>
          <span className="demo-profile-chip">Claude profile</span>
        </div>
        <textarea
          aria-label="Sample prompt preview"
          className="demo-textarea"
          value={SAMPLE_PROMPT}
          readOnly
        />
        <p className="demo-pane-note">
          Landing-page preview only. Run the CLI or <code>@promptscore/core</code> for real analysis
          today.
        </p>
      </div>
      <div className="demo-output-pane">
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
          <div className="score-label">SAMPLE REPORT</div>
        </div>
        <span className="output-label">Sample findings</span>
        {SAMPLE_RESULTS.map((result) => (
          <div key={result.id} className="issue-item">
            <span className={`issue-tag ${result.severity}`}>
              {result.severity === 'warning' ? 'WARN' : 'INFO'}
            </span>
            <strong>{result.label}</strong> - {result.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Demo() {
  const [tab, setTab] = useState<'preview' | 'terminal'>('preview');

  return (
    <section className="demo-section">
      <div className="section-label">Guided preview</div>
      <p className="demo-disclaimer">
        The browser pane below is a sample walkthrough, not the full browser analyzer. The shipped
        product today is the CLI and the core library.
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
              className={`demo-tab ${tab === 'preview' ? 'active' : ''}`}
              onClick={() => setTab('preview')}
            >
              Browser preview
            </button>
            <button
              className={`demo-tab ${tab === 'terminal' ? 'active' : ''}`}
              onClick={() => setTab('terminal')}
            >
              CLI sample
            </button>
          </div>
          <span className="demo-version">v0.1.0</span>
        </div>
        {tab === 'preview' ? <BrowserPreview /> : <TerminalView key="terminal" />}
      </div>
    </section>
  );
}
