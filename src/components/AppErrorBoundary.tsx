import { Component, type ReactNode } from 'react';
import styles from './Site.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className={styles.errorPage} id="main">
        <div className="container">
          <p className="eyebrow">GOLF SPACES KENYA</p>
          <h1>We couldn’t display this page.</h1>
          <p>
            A section failed to load. Refresh the page and try again. If the problem continues,
            please contact the Golf Spaces Kenya team.
          </p>
          <button type="button" className="button primary" onClick={() => window.location.reload()}>
            Refresh the page
          </button>
        </div>
      </main>
    );
  }
}
