import { DocsArticle } from '../../../components/docs/DocsArticle';

export default function GettingStartedPage() {
  return (
    <DocsArticle
      currentHref="/docs/getting-started"
      eyebrow="Getting started"
      title="Install PromptScore and run your first prompt check"
      lead="Use the CLI for local or CI workflows, or import the core library when you want PromptScore inside your own product."
    >
      <section className="docs-section">
        <h2>Install or run once</h2>
        <p>
          PromptScore ships as a public CLI package. You can install it globally or invoke it with
          `npx`.
        </p>
        <pre className="docs-code-block">
          <code>{`npm install -g @promptscore/cli\nnpx @promptscore/cli analyze prompt.txt`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Analyze a file, directory, glob, inline prompt, or stdin</h2>
        <p>
          The `analyze` command accepts prompt files, directories of prompt-like text files, glob
          patterns, inline strings, or piped stdin.
        </p>
        <pre className="docs-code-block">
          <code>{`promptscore analyze prompt.txt
promptscore analyze prompts/
promptscore analyze "prompts/**/*.{txt,md}"
promptscore analyze --inline "You are a helpful assistant."
cat prompt.txt | promptscore analyze`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Choose a profile</h2>
        <p>
          `v0.1` ships with `_base`, `claude`, and `gpt`. Profiles adjust weight, severity,
          suggestions, and references while using the same deterministic core engine.
        </p>
        <pre className="docs-code-block">
          <code>{`promptscore analyze prompt.txt --model claude\npromptscore profiles`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Save project defaults</h2>
        <p>
          If your team wants shared defaults, add a `promptscore.config.yaml` file to the repo and
          let the CLI discover it automatically.
        </p>
        <pre className="docs-code-block">
          <code>{`model: claude
format: text
fail_on_severity: warning`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Use it in code</h2>
        <p>
          In Node or server-side code, import `analyze` from `@promptscore/core`. The API returns a{' '}
          <code>Promise&lt;ScoreReport&gt;</code>.
        </p>
        <pre className="docs-code-block">
          <code>{`import { analyze, format } from '@promptscore/core';

const report = await analyze('You are a helpful assistant. Summarize the article.', {
  model: 'claude',
});

console.log(report.overall);
console.log(format(report, 'text'));`}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>Where to go next</h2>
        <ul className="docs-list">
          <li>Read CLI Guide for command details, formats, and exit codes.</li>
          <li>Read Config to set project-wide defaults and CI policy.</li>
          <li>Read Browser Analyzer for the browser-safe entry point and client usage.</li>
          <li>Read Rules Reference to understand what the score is actually measuring.</li>
        </ul>
      </section>
    </DocsArticle>
  );
}
