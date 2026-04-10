import { DocsArticle } from '../../../components/docs/DocsArticle';

export default function ProfilesPage() {
  return (
    <DocsArticle
      currentHref="/docs/profiles"
      eyebrow="Profiles"
      title="Use profiles to adapt PromptScore to different model families"
      lead="Profiles let PromptScore keep one deterministic engine while tuning scoring and guidance for specific model ecosystems."
    >
      <section className="docs-section">
        <h2>Profiles that ship today</h2>
        <ul className="docs-list">
          <li>`_base`: the universal baseline profile.</li>
          <li>`claude`: Anthropic-oriented defaults and references.</li>
          <li>`gpt`: OpenAI-oriented defaults and references.</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>What a profile can override</h2>
        <ul className="docs-list">
          <li>severity</li>
          <li>weight</li>
          <li>suggestion</li>
          <li>reference</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>YAML example</h2>
        <pre className="docs-code-block">
          <code>{`name: claude
base: _base
rules:
  no-examples:
    severity: warning
    weight: 1.5
    suggestion: "Claude benefits significantly from few-shot examples."`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Node and browser behavior</h2>
        <div className="docs-table-wrapper">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Environment</th>
                <th>Profile source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Node / CLI</td>
                <td>Loads YAML profiles through the profile loader.</td>
              </tr>
              <tr>
                <td>Browser</td>
                <td>Uses built-in profiles bundled into the browser-safe entry point.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocsArticle>
  );
}
