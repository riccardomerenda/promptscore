export interface DocsNavItem {
  href: string;
  title: string;
  description: string;
}

export interface DocsNavSection {
  title: string;
  items: DocsNavItem[];
}

export const docsNavigation: DocsNavSection[] = [
  {
    title: 'Start here',
    items: [
      {
        href: '/docs',
        title: 'Overview',
        description: 'Understand what PromptScore is, what ships today, and where to start.',
      },
      {
        href: '/docs/getting-started',
        title: 'Getting Started',
        description: 'Install the CLI, run your first analysis, and use the core library.',
      },
    ],
  },
  {
    title: 'Workflows',
    items: [
      {
        href: '/docs/cli',
        title: 'CLI Guide',
        description:
          'Analyze files, directories, globs, inline prompts, and stdin with CI-friendly exit codes.',
      },
      {
        href: '/docs/config',
        title: 'Config',
        description: 'Set project-wide defaults, rule subsets, and failure thresholds.',
      },
      {
        href: '/docs/browser',
        title: 'Browser Analyzer',
        description: 'Use the in-browser analyzer and the browser-safe core entry.',
      },
      {
        href: '/docs/github-action',
        title: 'GitHub Action',
        description: 'Drop a single composite Action into any repo to lint prompts in CI.',
      },
    ],
  },
  {
    title: 'Reference',
    items: [
      {
        href: '/docs/rules',
        title: 'Rules Reference',
        description: 'Learn what the deterministic rules check and how they score prompts.',
      },
      {
        href: '/docs/profiles',
        title: 'Profiles',
        description: 'See how `_base`, `claude`, and `gpt` tune severity, weight, and guidance.',
      },
      {
        href: '/docs/faq',
        title: 'FAQ',
        description: 'Common questions about scope, privacy, roadmap, and customization.',
      },
    ],
  },
];

export const flatDocsItems = docsNavigation.flatMap((section) => section.items);

export function getDocsNeighbors(currentHref: string): {
  previous?: DocsNavItem;
  next?: DocsNavItem;
} {
  const index = flatDocsItems.findIndex((item) => item.href === currentHref);

  if (index === -1) {
    return {};
  }

  return {
    previous: index > 0 ? flatDocsItems[index - 1] : undefined,
    next: index < flatDocsItems.length - 1 ? flatDocsItems[index + 1] : undefined,
  };
}
