import styles from './Site.module.css';

export function NotFound() {
  return (
    <main className={styles.errorPage} id="main">
      <div className="container">
        <p className="eyebrow">GOLF SPACES KENYA</p>
        <h1>That space doesn’t exist.</h1>
        <p>
          The page you requested could not be found. Return home to explore putting greens,
          simulator bays and practice spaces.
        </p>
        <a className="button primary" href="/">
          Back to home
        </a>
      </div>
    </main>
  );
}
