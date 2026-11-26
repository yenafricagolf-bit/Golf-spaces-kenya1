import { useState } from 'react';
import styles from './Site.module.css';
export function Brand() {
  return (
    <span className={styles.brand}>
      <img src="/brand/golf-spaces-kenya.png" alt="Golf Spaces Kenya" width="926" height="323" />
    </span>
  );
}
export function Header({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <a href="/" aria-label="Golf Spaces Kenya home">
          <Brand />
        </a>
        <nav
          aria-label="Main navigation"
          id="main-navigation"
          className={`${styles.nav} ${open ? styles.navOpen : ''}`}
        >
          <a href="#spaces" onClick={() => setOpen(false)}>
            Our spaces
          </a>
          <a href="#surfaces" onClick={() => setOpen(false)}>
            Surfaces
          </a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>
            The process
          </a>
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.basketLink} href="#quote">
            Your quote <span aria-label={`${count} selected spaces`}>{count}</span>
          </a>
          <button
            className={styles.menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="main-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '×' : '☰'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
