import { DocsArticle } from '../../../components/docs/DocsArticle';

export default function ConfigPage() {
  return (
    <DocsArticle
      currentHref="/docs/config"
      eyebrow="Config"
      title="Configure PromptScore once per project"
      lead="PromptScore can discover a project config automatically so teams can share model defaults, rule subsets, profile directories, opt-in LLM settings, and CI failure thresholds."
    >
      <section className="docs-section">
        <h2>Supported file names</h2>
        <ul className="docs-list">
          <li>`promptscore.config.yaml`</li>
          <li>`promptscore.config.yml`</li>
          <li>`promptscore.config.json`</li>
          <li>`.promptscorerc`, `.promptscorerc.yaml`, or `.promptscorerc.json`</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>Example config</h2>
        <pre className="docs-code-block">
          <code>{`model: claude
format: markdown
rules:
  - missing-task
  - no-output-format
include_llm: true
llm:
  provider: openai
  model: gpt-5-mini
  api_key_env: OPENAI_API_KEY
fail_on_severity: warning
profiles_dir: ./profiles`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>What it controls today</h2>
        <ul className="docs-list">
          <li>`model`: default profile for analysis.</li>
          <li>`format`: default output format for CLI runs.</li>
          <li>`rules`: restrict analysis to a specific rule subset.</li>
          <li>`include_llm`: opt into experimental LLM-backed rules for CLI or Node runs.</li>
          <li>`llm.provider`: choose the external provider. Today, `openai` is supported.</li>
          <li>`llm.model`: choose the model used for opt-in LLM-backed rules.</li>
          <li>`llm.api_key_env`: choose which environment variable stores the API key.</li>
          <li>`llm.base_url`: override the provider base URL when needed.</li>
          <li>
            `fail_on_severity`: treat warnings or info findings as CI failures, even in batches.
          </li>
          <li>
            `profiles_dir`: load profiles from a custom directory relative to the config file.
          </li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>LLM activation model</h2>
        <p>
          `include_llm` does not send prompt text anywhere by itself. Prompt text only leaves the
          local runtime when you both enable LLM-backed rules and provide a configured provider
          client through the CLI or programmatic API.
        </p>
        <div className="docs-callout">
          <strong>Note:</strong> the hosted browser analyzer on `promptscore.dev` stays
          deterministic by default and does not inject a provider client.
        </div>
      </section>

      <section className="docs-section">
        <h2>Override precedence</h2>
        <p>
          CLI flags win over config values. Config values win over built-in defaults. For example,
          you can keep `model: claude` in the project config and still run `promptscore analyze
          prompt.txt --model gpt` for a one-off comparison.
        </p>
      </section>

      <section className="docs-section">
        <h2>Explicit config paths</h2>
        <p>
          PromptScore auto-discovers config files by walking up from the current working directory
          or analyzed file. You can also point at a specific file with `--config`.
        </p>
        <pre className="docs-code-block">
          <code>{`promptscore analyze prompt.txt --config ./configs/team.yaml
promptscore profiles --config ./configs/team.yaml`}</code>
        </pre>
      </section>
    </DocsArticle>
  );
}
