import Link from 'next/link';
import { docsNavigation } from './content';

export default function DocsOverviewPage() {
  return (
    <article className="docs-article">
      <header className="docs-header">
        <div className="docs-eyebrow">Docs</div>
        <h1 className="docs-title">Documentation for shipping prompts with confidence</h1>
        <p className="docs-lead">
          PromptScore is growing into a real product surface, not just a repository. This docs
          section is the canonical place for onboarding, reference, workflow guides, and FAQ.
        </p>
      </header>

      <div className="docs-content">
        <section className="docs-section">
          <h2>What ships in the first docs release</h2>
          <p>
            The first `/docs` version is intentionally focused: it explains the current `v0.1`
            product clearly, documents the real CLI and browser analyzer behavior, and gives users a
            trustworthy place to start.
          </p>
        </section>

        <section className="docs-section">
          <h2>Explore the docs</h2>
          <div className="docs-card-grid">
            {docsNavigation.flatMap((section) =>
              section.items.map((item) => (
                <Link key={item.href} href={item.href} className="docs-card">
                  <span className="docs-card-kicker">{section.title}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              )),
            )}
          </div>
        </section>

        <section className="docs-section">
          <h2>What these docs should become</h2>
          <div className="docs-feature-grid">
            <div className="docs-feature-card">
              <h3>Fast onboarding</h3>
              <p>
                Short paths for new users: install, analyze a prompt, understand the score, and
                start improving prompts immediately.
              </p>
            </div>
            <div className="docs-feature-card">
              <h3>Accurate reference</h3>
              <p>
                Every command, profile, and rule should reflect the shipped product, with examples
                that are tested and current.
              </p>
            </div>
            <div className="docs-feature-card">
              <h3>Release clarity</h3>
              <p>
                As PromptScore evolves, docs should explain what changed, what is stable, and what
                is still roadmap work.
              </p>
            </div>
          </div>
        </section>

        <section className="docs-section">
          <h2>Recommended reading order</h2>
          <ol className="docs-ordered-list">
            <li>Start with Getting Started to install PromptScore and run your first analysis.</li>
            <li>Read the CLI Guide if you want automation, CI integration, or command details.</li>
            <li>Read Browser Analyzer if you want to embed PromptScore in a client-side flow.</li>
            <li>Use Rules and Profiles as your ongoing reference while refining prompt quality.</li>
          </ol>
        </section>
      </div>
    </article>
  );
}
