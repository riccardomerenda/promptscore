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
};

const TABS = ['npx', 'npm', 'library'] as const;

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
