import { DocsArticle } from '../../../components/docs/DocsArticle';

export default function BrowserPage() {
  return (
    <DocsArticle
      currentHref="/docs/browser"
      eyebrow="Browser analyzer"
      title="Run PromptScore directly in the browser"
      lead="The browser analyzer on promptscore.dev uses the same deterministic scoring pipeline as the CLI, with built-in profiles that do not require filesystem access."
    >
      <section className="docs-section">
        <h2>What the browser surface does</h2>
        <ul className="docs-list">
          <li>Parses the prompt in the client.</li>
          <li>Runs the deterministic rule registry locally.</li>
          <li>Builds the same `ScoreReport` shape used by the CLI and the Node library.</li>
          <li>Uses built-in `_base`, `claude`, and `gpt` profiles instead of the YAML loader.</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>Browser-safe API</h2>
        <p>
          For client-side usage, import from `@promptscore/core/browser`. The browser entry exposes
          `analyzeWithProfile`, `format`, and the built-in profile helpers.
        </p>
        <pre className="docs-code-block">
          <code>{`import { analyzeWithProfile, formatText } from '@promptscore/core/browser';

const report = await analyzeWithProfile('You are a helpful assistant. Summarize this article.', {
  profileName: 'gpt',
});

console.log(report.overall);
console.log(formatText(report));`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Privacy model</h2>
        <p>
          The current `v0.1` browser analyzer is local-first. Deterministic analysis does not send
          prompts to an external API.
        </p>
        <div className="docs-callout">
          <strong>Important:</strong> future opt-in LLM-backed rules should be clearly separated
          from the offline deterministic workflow so users always know when data would leave the
          browser.
        </div>
      </section>

      <section className="docs-section">
        <h2>When to use browser vs CLI</h2>
        <div className="docs-table-wrapper">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Surface</th>
                <th>Best for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Browser analyzer</td>
                <td>Quick checks, demos, onboarding, and embedding a local analyzer in a UI.</td>
              </tr>
              <tr>
                <td>CLI</td>
                <td>Automation, CI, scripts, and repeatable prompt linting in repositories.</td>
              </tr>
              <tr>
                <td>Core library</td>
                <td>Custom integrations, internal tools, and app-specific workflows.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocsArticle>
  );
}
