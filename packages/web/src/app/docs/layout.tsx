import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteNav } from '../../components/SiteNav';
import { DocsSidebar } from '../../components/docs/DocsSidebar';

export const metadata: Metadata = {
  title: 'PromptScore Docs',
  description:
    'Documentation for PromptScore: getting started, CLI usage, browser analysis, rules, profiles, and FAQ.',
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav mode="docs" />
      <div className="docs-shell">
        <aside className="docs-sidebar-column">
          <DocsSidebar />
        </aside>
        <main className="docs-main">{children}</main>
      </div>
      <SiteFooter />
    </>
  );
}
