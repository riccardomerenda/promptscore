import { Demo } from '../components/Demo';
import { InstallTabs } from '../components/InstallTabs';

const RULES = [
  { id: 'R01', name: 'Prompt length check', severity: 'medium' },
  { id: 'R02', name: 'Role / persona definition', severity: 'high' },
  { id: 'R03', name: 'Output format specified', severity: 'high' },
  { id: 'R04', name: 'Few-shot examples present', severity: 'medium' },
  { id: 'R05', name: 'Constraints & boundaries', severity: 'medium' },
  { id: 'R06', name: 'Vague language detection', severity: 'low' },
  { id: 'R07', name: 'Negative instructions', severity: 'low' },
  { id: 'R08', name: 'Task decomposition', severity: 'medium' },
  { id: 'R09', name: 'Context provided', severity: 'low' },
  { id: 'R10', name: 'Structured delimiters (XML)', severity: 'medium' },
  { id: 'R11', name: 'ALL CAPS abuse', severity: 'medium' },
  { id: 'R12', name: 'Structured output format', severity: 'high' },
];

export default function Home() {
  return (
    <>
      {/* ── Nav ── */}
      <nav>
        <a className="nav-brand" href="#">
          <span className="nav-icon">PS</span>
          PromptScore
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#rules">Rules</a>
          <a href="#install">Install</a>
          <a
            className="nav-cta"
            href="https://github.com/riccardomerenda/promptscore"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-dot" />
          v0.1 &middot; Open Source &middot; MIT
        </div>
        <h1>
          Lint your prompts
          <br />
          before you <em>send</em> them
        </h1>
        <p className="hero-sub">
          Static analysis for LLM prompts. Get a score, catch ambiguity, surface missing structure
          &mdash; with model-specific best practices. No API calls required.
        </p>
        <div className="hero-actions">
          <a
            className="btn-primary"
            href="https://github.com/riccardomerenda/promptscore"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
          <a className="btn-secondary" href="#install">
            Quick Start
          </a>
        </div>
        <div className="cli-cmd">
          <span className="cli-prompt">$</span>
          npx promptscore analyze prompt.txt
        </div>
      </section>

      {/* ── Demo ── */}
      <Demo />

      {/* ── How it works ── */}
      <section className="how-section" id="how">
        <div className="section-label">How it works</div>
        <h2 className="section-title">Three steps. Zero API calls.</h2>
        <div className="steps">
          <div className="step">
            <h3>Write your prompt</h3>
            <p>
              Paste it into the Web UI, pass a file to the CLI, or import{' '}
              <code>@promptscore/core</code> in your code.
            </p>
          </div>
          <div className="step">
            <h3>Run 12 deterministic rules</h3>
            <p>
              PromptScore checks length, structure, output format, examples, constraints, vague
              language, and more. All offline.
            </p>
          </div>
          <div className="step">
            <h3>Get actionable feedback</h3>
            <p>
              Each issue links to model-specific best practices from Claude, GPT, and Gemini
              documentation.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <div className="section-label">Features</div>
        <h2 className="section-title">
          Built for prompt engineers
          <br />
          who ship in production
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon purple">&#x2726;</div>
            <h3>12 Deterministic Rules</h3>
            <p>
              Check length, structure, examples, output format, constraints, vague language, and
              more. No LLM calls, no API keys.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green">&#x25C9;</div>
            <h3>Model Profiles</h3>
            <p>
              YAML profiles for Claude, GPT, and a universal baseline. Rules adjust severity and
              suggestions per model.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon orange">&#x2756;</div>
            <h3>Library + CLI</h3>
            <p>
              Use <code>@promptscore/core</code> in your code or run <code>promptscore</code> from
              the terminal. Zero heavy dependencies.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue">&#x2192;</div>
            <h3>CI/CD Ready</h3>
            <p>Drop into your pipeline. Fail builds on prompts that score below your threshold.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon yellow">&#x26A0;</div>
            <h3>Actionable Warnings</h3>
            <p>Every issue includes a fix suggestion with links to official model documentation.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon red">&#x2205;</div>
            <h3>Privacy First</h3>
            <p>
              Your prompts never leave your machine. No telemetry. No network calls. Fully offline.
            </p>
          </div>
        </div>
      </section>

      {/* ── Rules ── */}
      <section className="rules-section" id="rules">
        <div className="section-label">Rules</div>
        <h2 className="section-title">What gets checked</h2>
        <div className="rules-grid">
          {RULES.map((rule) => (
            <div key={rule.id} className="rule-row">
              <span className="rule-id">{rule.id}</span>
              <span className="rule-name">{rule.name}</span>
              <span className={`rule-sev ${rule.severity}`}>{rule.severity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Install ── */}
      <section className="install-section" id="install">
        <div className="section-label">Get Started</div>
        <h2 className="section-title">Up and running in seconds</h2>
        <InstallTabs />
      </section>

      {/* ── Footer ── */}
      <footer>
        Built by{' '}
        <a href="https://github.com/riccardomerenda" target="_blank" rel="noopener noreferrer">
          @riccardomerenda
        </a>{' '}
        &middot; MIT Licensed &middot; Open Source
      </footer>
    </>
  );
}
