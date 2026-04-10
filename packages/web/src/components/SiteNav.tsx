import Link from 'next/link';

type SiteNavMode = 'landing' | 'docs';

interface SiteNavProps {
  mode?: SiteNavMode;
}

const LANDING_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#rules', label: 'Rules' },
  { href: '#install', label: 'Install' },
  { href: '/docs', label: 'Docs' },
];

const DOCS_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/faq', label: 'FAQ' },
];

export function SiteNav({ mode = 'landing' }: SiteNavProps) {
  const links = mode === 'docs' ? DOCS_LINKS : LANDING_LINKS;

  return (
    <nav>
      <Link className="nav-brand" href="/">
        <span className="nav-icon">PS</span>
        PromptScore
      </Link>
      <div className="nav-links">
        {links.map((link) =>
          link.href.startsWith('#') ? (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ) : (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ),
        )}
        <a
          className="nav-cta"
          href="https://github.com/riccardomerenda/promptscore"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}
