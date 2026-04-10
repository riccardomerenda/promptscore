import Link from 'next/link';
import type { ReactNode } from 'react';
import { getDocsNeighbors } from '../../app/docs/content';

interface DocsArticleProps {
  currentHref: string;
  eyebrow?: string;
  title: string;
  lead: string;
  children: ReactNode;
}

export function DocsArticle({
  currentHref,
  eyebrow = 'Docs',
  title,
  lead,
  children,
}: DocsArticleProps) {
  const { previous, next } = getDocsNeighbors(currentHref);

  return (
    <article className="docs-article">
      <header className="docs-header">
        <div className="docs-eyebrow">{eyebrow}</div>
        <h1 className="docs-title">{title}</h1>
        <p className="docs-lead">{lead}</p>
      </header>

      <div className="docs-content">{children}</div>

      <div className="docs-pager">
        {previous ? (
          <Link className="docs-pager-link" href={previous.href}>
            <span className="docs-pager-label">Previous</span>
            <strong>{previous.title}</strong>
          </Link>
        ) : (
          <div className="docs-pager-spacer" />
        )}

        {next ? (
          <Link className="docs-pager-link align-right" href={next.href}>
            <span className="docs-pager-label">Next</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <div className="docs-pager-spacer" />
        )}
      </div>
    </article>
  );
}
