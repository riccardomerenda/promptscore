import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page">
      <header className="hero">
        <h1>404</h1>
        <p className="tagline">That page does not exist.</p>
        <div className="cta">
          <Link className="button primary" href="/">
            Back to home
          </Link>
        </div>
      </header>
    </main>
  );
}
