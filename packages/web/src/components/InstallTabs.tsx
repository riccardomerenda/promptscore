'use client';

import { useState } from 'react';

interface CodeLine {
  type: 'comment' | 'code' | 'blank';
  text?: string;
}

const INSTALL_CODES: Record<string, CodeLine[]> = {
  npx: [
    { type: 'comment', text: '# Analyze a prompt file — no install needed' },
    { type: 'code', text: 'npx @promptscore/cli analyze prompt.txt' },
    { type: 'blank' },
    { type: 'comment', text: '# Or pipe from stdin' },
    { type: 'code', text: 'echo "You are a helpful assistant" | npx @promptscore/cli analyze' },
    { type: 'blank' },
    { type: 'comment', text: '# Target a specific model profile' },
    { type: 'code', text: 'npx @promptscore/cli analyze prompt.txt --model claude' },
  ],
  npm: [
    { type: 'comment', text: '# Install globally' },
    { type: 'code', text: 'npm install -g @promptscore/cli' },
    { type: 'blank' },
    { type: 'comment', text: '# Then use anywhere' },
    { type: 'code', text: 'promptscore analyze my-prompt.txt' },
    { type: 'code', text: 'promptscore analyze ./prompts/review.txt --model gpt' },
  ],
  library: [
    { type: 'comment', text: '// Import in your project' },
    { type: 'code', text: "import { analyze } from '@promptscore/core';" },
    { type: 'blank' },
    { type: 'code', text: 'async function run() {' },
    { type: 'code', text: '  const report = await analyze(myPrompt, {' },
    { type: 'code', text: "    model: 'claude'," },
    { type: 'code', text: '  });' },
    { type: 'blank' },
    { type: 'code', text: '  console.log(report.overall);' },
    { type: 'code', text: '  console.log(report.results);' },
    { type: 'code', text: '}' },
  ],
  'github action': [
    { type: 'comment', text: '# .github/workflows/promptscore.yml' },
    { type: 'code', text: 'name: PromptScore' },
    { type: 'code', text: 'on: [pull_request, push]' },
    { type: 'code', text: 'jobs:' },
    { type: 'code', text: '  prompt-lint:' },
    { type: 'code', text: '    runs-on: ubuntu-latest' },
    { type: 'code', text: '    steps:' },
    { type: 'code', text: '      - uses: actions/checkout@v6' },
    { type: 'code', text: '      - uses: riccardomerenda/promptscore@main' },
    { type: 'code', text: '        with:' },
    { type: 'code', text: '          inputs: prompts/' },
    { type: 'code', text: '          model: claude' },
    { type: 'code', text: '          format: markdown' },
    { type: 'code', text: '          fail-on: warning' },
  ],
};

const TABS = ['npx', 'npm', 'library', 'github action'] as const;

export function InstallTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]>('npx');
  const lines = INSTALL_CODES[active];

  return (
    <div className="install-block">
      <div className="install-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`install-tab ${active === tab ? 'active' : ''}`}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="install-code">
        {lines.map((line, i) => {
          if (line.type === 'blank') return <br key={i} />;
          if (line.type === 'comment')
            return (
              <div key={i} className="code-comment">
                {line.text}
              </div>
            );
          return <div key={i}>{line.text}</div>;
        })}
      </div>
    </div>
  );
}
