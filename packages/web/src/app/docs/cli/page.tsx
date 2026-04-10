import { DocsArticle } from '../../../components/docs/DocsArticle';

export default function CliPage() {
  return (
    <DocsArticle
      currentHref="/docs/cli"
      eyebrow="CLI"
      title="Use PromptScore in the terminal and in CI"
      lead="The CLI is the fastest way to lint prompts locally, automate checks in scripts, and enforce prompt quality in pipelines."
    >
      <section className="docs-section">
        <h2>Core commands</h2>
        <pre className="docs-code-block">
          <code>{`promptscore analyze prompt.txt
promptscore analyze --inline "You are a helpful assistant."
promptscore analyze prompt.txt --model gpt --format json
promptscore analyze prompt.txt --rules missing-task,no-output-format
promptscore rules
promptscore profiles`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Supported formats</h2>
        <p>`analyze` supports `text`, `json`, and `markdown` output formats.</p>
        <div className="docs-callout">
          <strong>Tip:</strong> use `json` for automation and `text` for humans. `markdown` is
          useful when you want to paste findings into issues, docs, or reviews.
        </div>
      </section>

      <section className="docs-section">
        <h2>Exit codes</h2>
        <ul className="docs-list">
          <li>`0`: analysis completed and no error-level findings were present.</li>
          <li>`1`: analysis completed and at least one failing rule had `error` severity.</li>
          <li>`2`: PromptScore could not complete the command because of an input or runtime error.</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>stdin support</h2>
        <p>
          If no file and no `--inline` value are provided, PromptScore will read from stdin when
          input is piped into the process.
        </p>
        <pre className="docs-code-block">
          <code>{`cat prompt.txt | promptscore analyze
echo "You are a helpful assistant." | promptscore analyze --model _base`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Current v0.1 boundaries</h2>
        <ul className="docs-list">
          <li>Directory and glob analysis are not part of `v0.1` yet.</li>
          <li>LLM-powered rules are not active by default and are still roadmap work.</li>
          <li>The CLI is a thin wrapper around the shared deterministic core engine.</li>
        </ul>
      </section>
    </DocsArticle>
  );
}
