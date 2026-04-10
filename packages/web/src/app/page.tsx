export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <div className="badge">v0.1 — early preview</div>
        <h1>
          <span className="brand">PromptScore</span>
        </h1>
        <p className="tagline">Static analysis for LLM prompts. ESLint, but for prompts.</p>
        <p className="sub">
          Analyze a prompt <em>before</em> you send it. Get a score, find ambiguity, surface missing
          structure — with references to model-specific best practices.
        </p>

        <div className="cta">
          <a className="button primary" href="https://github.com/riccardomerenda/promptscore">
            View on GitHub
          </a>
          <a className="button" href="https://github.com/riccardomerenda/promptscore#usage">
            Get started
          </a>
        </div>

        <pre className="code">
          <code>{`$ npx promptscore analyze prompt.txt --model claude

PromptScore — profile: claude

Overall  72/100  [█████████████████████░░░░░░░░░]
Score 72/100 — 2 warnings, 1 info.

Findings
  warn   no-examples           No examples provided.
         → Add 1–3 concrete examples showing the expected output.
  warn   no-output-format      No output format specified.
         → Tell the model the exact format you want.
  info   ambiguous-negation    Heavy use of negative instructions.
         → Rewrite "don't do X" as "do Y instead".`}</code>
        </pre>
      </header>

      <section className="pillars">
        <div className="pillar">
          <h3>Deterministic rules</h3>
          <p>
            12 rules that run locally — no LLM calls, no API keys. Check length, structure,
            examples, output format, constraints, and more.
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
          <h3>Open source</h3>
          <p>
            MIT-licensed TypeScript monorepo. Zero heavy dependencies. Ships as a library and a CLI.
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
