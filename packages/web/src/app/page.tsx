import { Demo } from '../components/Demo';

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <div className="badge">v0.1 — open source</div>
        <h1>
          <span className="brand">PromptScore</span>
        </h1>
        <p className="tagline">Static analysis for LLM prompts.</p>
        <p className="sub">
          Analyze a prompt <em>before</em> you send it. Get a score, find ambiguity, surface missing
          structure — with references to model-specific best practices.
        </p>

        <div className="cta">
          <a className="button primary" href="https://github.com/riccardomerenda/promptscore">
            GitHub
          </a>
          <div className="install-cmd">
            <code>npx promptscore analyze prompt.txt</code>
          </div>
        </div>
      </header>

      <Demo />

      <section className="pillars">
        <div className="pillar">
          <h3>12 deterministic rules</h3>
          <p>
            Check length, structure, examples, output format, constraints, vague language, and more.
            No LLM calls, no API keys.
          </p>
        </div>
        <div className="pillar">
          <h3>Model profiles</h3>
          <p>
            YAML profiles for Claude, GPT, and a universal baseline. Rules adjust severity and
            suggestions per model.
          </p>
        </div>
        <div className="pillar">
          <h3>Library + CLI</h3>
          <p>
            Use <code>@promptscore/core</code> in your code or run <code>promptscore</code> from the
            terminal. Zero heavy dependencies.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>
          Built by <a href="https://github.com/riccardomerenda">@riccardomerenda</a>. MIT licensed.
        </p>
      </footer>
    </main>
  );
}
