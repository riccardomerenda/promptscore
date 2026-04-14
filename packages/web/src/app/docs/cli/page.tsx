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
        <p>
          Install the package as `@promptscore/cli`, then run the `promptscore` binary in your
          shell.
        </p>
        <pre className="docs-code-block">
          <code>{`promptscore analyze prompt.txt
promptscore analyze prompts/
promptscore analyze "prompts/**/*.{txt,md}" --format json
promptscore analyze --inline "You are a helpful assistant."
promptscore analyze prompt.txt --model gpt --format json
promptscore analyze prompt.txt --rules missing-task,no-output-format
promptscore analyze prompt.txt --llm
promptscore rules
promptscore profiles`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Directory and glob analysis</h2>
        <p>
          `analyze` accepts files, directories, and glob patterns. Directory inputs recurse through
          `.txt`, `.md`, `.markdown`, and `.prompt` files while skipping common build folders like
          `node_modules`, `.git`, `.next`, and `dist`. Use globs when you want custom file types or
          tighter matching.
        </p>
        <pre className="docs-code-block">
          <code>{`promptscore analyze prompts/
promptscore analyze "prompts/**/*.{txt,md}" --fail-on warning
promptscore analyze prompts/ examples/reviews/*.md`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Project config and policy</h2>
        <p>
          `analyze` can auto-load a project config file and lets CLI flags override it. Use
          `--config` when you want to point at a specific config file, and `--fail-on` when you want
          a one-off policy threshold in CI.
        </p>
        <pre className="docs-code-block">
          <code>{`promptscore analyze prompt.txt --config ./configs/team.yaml
promptscore analyze prompt.txt --fail-on warning`}</code>
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
        <h2>Opt-in LLM rules</h2>
        <p>
          Use `--llm` when you want PromptScore to run experimental LLM-backed rules in addition to
          the deterministic registry. This path remains explicit and requires provider config plus
          an API key environment variable.
        </p>
        <pre className="docs-code-block">
          <code>{`promptscore analyze prompt.txt --llm
promptscore analyze prompt.txt --config ./promptscore.config.yaml --llm`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Exit codes</h2>
        <ul className="docs-list">
          <li>
            `0`: analysis completed and no findings met the active failure threshold. The default
            threshold is `error`.
          </li>
          <li>
            `1`: analysis completed and at least one finding met the active threshold from
            `--fail-on` or project config.
          </li>
          <li>
            `2`: PromptScore could not complete the command because of an input or runtime error.
          </li>
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
        <h2>Current boundaries</h2>
        <ul className="docs-list">
          <li>LLM-powered rules are experimental, opt-in, and require provider configuration.</li>
          <li>
            Directory inputs are intentionally conservative and focus on prompt-like text files.
          </li>
          <li>The CLI remains a thin wrapper around the shared core engine and rule registry.</li>
        </ul>
      </section>
    </DocsArticle>
  );
}
