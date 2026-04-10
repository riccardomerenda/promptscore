import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <section className="hero">
        <div className="hero-badge">404</div>
        <h1>That page does not exist</h1>
        <p className="hero-sub">The page you were looking for is gone or has moved.</p>
        <div className="hero-actions">
          <Link className="btn-primary" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
