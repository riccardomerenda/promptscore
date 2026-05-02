import { DocsArticle } from '../../../components/docs/DocsArticle';

export default function GithubActionPage() {
  return (
    <DocsArticle
      currentHref="/docs/github-action"
      eyebrow="GitHub Action"
      title="Lint prompts in CI with one composite Action"
      lead="Drop riccardomerenda/promptscore@main into any GitHub Actions workflow to score every prompt in your repo on every push."
    >
      <section className="docs-section">
        <h2>Quick start</h2>
        <p>
          The Action is a composite that wraps the public CLI. It installs Node, runs{' '}
          <code>npx @promptscore/cli analyze</code> against the paths you give it, and exits
          non-zero when findings cross the configured severity threshold.
        </p>
        <pre className="docs-code-block">
          <code>{`name: PromptScore

on:
  pull_request:
  push:
    branches: [main]

jobs:
  prompt-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: riccardomerenda/promptscore@main
        with:
          inputs: prompts/
          model: claude
          format: markdown
          fail-on: warning`}</code>
        </pre>
        <p>
          When <code>format: markdown</code> is set, the Action also appends the report to the job
          summary, so reviewers see findings inline in the GitHub UI without opening the workflow
          log.
        </p>
      </section>

      <section className="docs-section">
        <h2>Inputs</h2>
        <div className="docs-table-wrapper">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Input</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>inputs</code>
                </td>
                <td>
                  <code>prompts/</code>
                </td>
                <td>
                  Files, directories, or globs to analyze. Whitespace-separated for multiple paths.
                </td>
              </tr>
              <tr>
                <td>
                  <code>model</code>
                </td>
                <td>
                  <code>_base</code>
                </td>
                <td>
                  Profile name. Built-in: <code>_base</code>, <code>claude</code>, <code>gpt</code>.
                  Custom profiles supported via project config.
                </td>
              </tr>
              <tr>
                <td>
                  <code>format</code>
                </td>
                <td>
                  <code>text</code>
                </td>
                <td>
                  Output format: <code>text</code>, <code>markdown</code>, or <code>json</code>.
                </td>
              </tr>
              <tr>
                <td>
                  <code>fail-on</code>
                </td>
                <td>
                  <code>error</code>
                </td>
                <td>
                  Severity threshold that fails the action: <code>error</code>, <code>warning</code>
                  , <code>info</code>, or <code>none</code>.
                </td>
              </tr>
              <tr>
                <td>
                  <code>config</code>
                </td>
                <td>—</td>
                <td>Path to a PromptScore config file. Empty falls back to project discovery.</td>
              </tr>
              <tr>
                <td>
                  <code>rules</code>
                </td>
                <td>—</td>
                <td>
                  Comma-separated rule IDs to include. Empty means all rules from the active
                  profile.
                </td>
              </tr>
              <tr>
                <td>
                  <code>include-llm</code>
                </td>
                <td>
                  <code>false</code>
                </td>
                <td>
                  Run LLM-backed rules. Requires the relevant API key in the runner environment.
                </td>
              </tr>
              <tr>
                <td>
                  <code>cli-version</code>
                </td>
                <td>
                  <code>latest</code>
                </td>
                <td>
                  Version of <code>@promptscore/cli</code> to install. Pin to a specific version for
                  reproducibility.
                </td>
              </tr>
              <tr>
                <td>
                  <code>node-version</code>
                </td>
                <td>
                  <code>20</code>
                </td>
                <td>Node.js version to use on the runner.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-section">
        <h2>Common patterns</h2>
        <h3>Block PRs that introduce ambiguous prompts</h3>
        <pre className="docs-code-block">
          <code>{`- uses: riccardomerenda/promptscore@main
  with:
    inputs: prompts/
    model: claude
    fail-on: warning`}</code>
        </pre>
        <p>
          Failing on warning catches everything from missing tasks to vague qualifiers. Drop to{' '}
          <code>fail-on: error</code> if you only want to gate on the highest-impact issue
          (currently <code>missing-task</code>).
        </p>

        <h3>Run LLM-backed review on changed prompts only</h3>
        <pre className="docs-code-block">
          <code>{`- name: Find changed prompts
  id: changed
  run: |
    git fetch origin main
    files=$(git diff --name-only origin/main...HEAD -- 'prompts/*.txt' 'prompts/*.md' \\
      | tr '\\n' ' ')
    echo "files=$files" >> "$GITHUB_OUTPUT"

- if: steps.changed.outputs.files != ''
  uses: riccardomerenda/promptscore@main
  with:
    inputs: \${{ steps.changed.outputs.files }}
    model: claude
    include-llm: true
    fail-on: warning
  env:
    ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}`}</code>
        </pre>
        <p>
          The opt-in <code>llm-prompt-review</code> rule is more expensive and not needed on every
          push. Run it only on changed files in PR builds, with the API key available via secrets.
        </p>

        <h3>Pin to a specific CLI version for reproducibility</h3>
        <pre className="docs-code-block">
          <code>{`- uses: riccardomerenda/promptscore@main
  with:
    inputs: prompts/
    cli-version: '0.4.7'`}</code>
        </pre>
        <p>
          The <code>cli-version</code> input pins the underlying npm package version, so reruns
          produce identical results even if a newer release ships in the meantime.
        </p>
      </section>

      <section className="docs-section">
        <h2>Versioning</h2>
        <p>
          The Action is versioned alongside the rest of PromptScore. Reference{' '}
          <code>riccardomerenda/promptscore@main</code> to track the latest tagged release, or pin
          to a specific tag (e.g. <code>@v0.4.8</code>) for full reproducibility. The action.yml
          contract is part of the package&rsquo;s public surface, so breaking changes will land on a
          major version bump.
        </p>
      </section>

      <section className="docs-section">
        <h2>What it does not do yet</h2>
        <ul className="docs-list">
          <li>It does not annotate individual lines in PR diffs (no inline review comments).</li>
          <li>
            It does not cache npm downloads across runs. Each run does a fresh <code>npx -y</code>;
            pinning <code>cli-version</code> still works but does not save the install.
          </li>
          <li>
            It does not produce a SARIF report yet, so it does not show up in GitHub&rsquo;s
            Security tab.
          </li>
        </ul>
        <p>
          These are reasonable next steps once the Action sees real usage. Open an issue if any of
          them blocks you.
        </p>
      </section>
    </DocsArticle>
  );
}
