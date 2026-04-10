'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { docsNavigation } from '../../app/docs/content';

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/docs') {
    return pathname === '/docs';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <div className="docs-sidebar">
      <div className="docs-sidebar-intro">
        <div className="docs-sidebar-label">Documentation</div>
        <p>PromptScore docs are focused on fast onboarding, real examples, and workflow clarity.</p>
      </div>

      {docsNavigation.map((section) => (
        <div key={section.title} className="docs-sidebar-group">
          <div className="docs-sidebar-group-title">{section.title}</div>
          <div className="docs-sidebar-links">
            {section.items.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? 'docs-sidebar-link active' : 'docs-sidebar-link'}
                >
                  <span>{item.title}</span>
                  <small>{item.description}</small>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
