import type { Space } from '../lib/types';
import { Photo } from './Photo';
import styles from './Site.module.css';
export function SpaceCard({
  space,
  selected,
  onToggle,
  remote,
}: {
  space: Space;
  selected: boolean;
  onToggle: (id: string) => void;
  remote: boolean;
}) {
  return (
    <article className={`${styles.spaceCard} ${selected ? styles.selectedCard : ''}`}>
      <div className={styles.cardImage}>
        {space.image_path ? (
          <Photo
            path={space.image_path}
            alt={space.spec.alt}
            widths={space.spec.variants}
            width={space.spec.image_width}
            height={space.spec.image_height}
            remote={remote}
          />
        ) : (
          <div className={styles.noPhoto}>
            <p>
              A dedicated
              <br />
              <em>space to swing.</em>
            </p>
          </div>
        )}
        <span className={styles.cardNumber}>{String(space.sort_order + 1).padStart(2, '0')}</span>
      </div>
      <div className={styles.cardBody}>
        <p className="eyebrow">{space.tag}</p>
        <h3>{space.name}</h3>
        <p>{space.description}</p>
        <div className={styles.cardBottom}>
          <span>{space.spec.setting}</span>
          <button
            type="button"
            className={styles.selectSpace}
            aria-label={`${selected ? 'Remove' : 'Add'} ${space.name}${selected ? ' from' : ' to'} quote`}
            aria-pressed={selected}
            onClick={() => onToggle(space.id)}
          >
            <span aria-hidden="true">{selected ? '✓' : '+'}</span>
            {selected ? 'Added' : 'Add to quote'}
          </button>
        </div>
      </div>
    </article>
  );
}
export function SpaceGrid({
  spaces,
  selected,
  onToggle,
  remote,
  loading,
  error,
  onRetry,
}: {
  spaces: Space[];
  selected: string[];
  onToggle: (id: string) => void;
  remote: boolean;
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <section className="section" id="spaces">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / FIND YOUR SPACE</p>
            <h2>
              Small corners.
              <br />
              <em>Endless possibilities.</em>
            </h2>
          </div>
          <p>
            Choose the spaces you have in mind. We’ll help bring them together in a design that
            works for your property.
          </p>
        </div>
        {loading ? (
          <div className={styles.skeletonGrid} role="status" aria-label="Loading golf spaces">
            {[1, 2, 3].map((item) => (
              <div className={styles.skeletonCard} key={item}>
                <span className={styles.skeletonImage} />
                <span className={styles.skeletonText} />
                <span className={`${styles.skeletonText} ${styles.skeletonTextShort}`} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert">
            <p>{error}</p>
            <button type="button" className="button secondary" onClick={onRetry}>
              Try again
            </button>
          </div>
        ) : spaces.length === 0 ? (
          <p>Our catalogue is being updated. Please check back shortly.</p>
        ) : (
          <div className={styles.spaceGrid}>
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                selected={selected.includes(space.id)}
                onToggle={onToggle}
                remote={remote}
              />
            ))}
          </div>
        )}
        <p className={styles.gridNote}>
          One space or a combination. Start with an idea; we’ll work through the details together.
        </p>
      </div>
    </section>
  );
}
