import type { LaunchTier } from '../lib/types';
import { Photo } from './Photo';
import styles from './Site.module.css';

const localMonitorPhotos = [
  {
    path: 'monitor-8.jpg',
    widths: [480, 592],
    alt: 'Portable golf launch monitor set up beside a club on a practice area',
  },
  {
    path: 'monitor-9.jpg',
    widths: [399],
    alt: 'Golf launch monitor positioned on a fairway for shot tracking',
  },
  {
    path: 'monitor-10.jpg',
    widths: [447],
    alt: 'Compact golf launch monitor standing on grass beside a golf club',
  },
  {
    path: 'monitor-11.jpg',
    widths: [447],
    alt: 'Golf launch monitor aligned behind a golf ball on the course',
  },
  {
    path: 'monitor-12.jpg',
    widths: [480, 545],
    alt: 'Orange golf launch monitor positioned beside golf balls and a club',
  },
  {
    path: 'monitor-13.jpg',
    widths: [225],
    alt: 'Portable launch monitor with a companion display on a practice mat',
  },
  {
    path: 'monitor-15.jpg',
    widths: [480, 554],
    alt: 'Golf launch monitor beside a blue driver on a practice area',
  },
  {
    path: 'monitor-portable.jpg',
    widths: [480, 534],
    alt: 'Portable golf launch monitor with a course view on its screen',
  },
];

const monitorThumbnailWidths: Record<string, number[]> = {
  'monitor-portable.jpg': [480, 534],
  'monitor-9.jpg': [399],
  'monitor-8.jpg': [480, 592],
  'monitor-10.jpg': [447],
  'monitor-12.jpg': [480, 545],
  'monitor-11.jpg': [447],
  'monitor-14.jpg': [480, 547],
  'monitor-15.jpg': [480, 554],
  'foresight-falcon.jpg': [400],
};

export function LaunchMonitorTiers({
  tiers,
  selected,
  onSelect,
}: {
  tiers: LaunchTier[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className={`section ${styles.monitorSection}`} id="technology">
      <div className={`container ${styles.monitorIntro}`}>
        <div>
          <p className="eyebrow">03 / UNDERSTAND YOUR GAME</p>
          <h2>
            Every shot
            <br />
            <em>tells a story.</em>
          </h2>
          <p>
            A launch monitor brings feedback to your practice. We’ll help you consider the space,
            the way you play and the level of detail you need.
          </p>
          <a href="#quote" className="button light">
            Find your setup
          </a>
        </div>
        <div className={styles.monitorVisual}>
          <Photo
            path="monitor-14.jpg"
            widths={[480, 547]}
            alt="Camera-based golf launch monitor positioned beside a club on a practice area"
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <div>
            <span>YOUR SPACE. YOUR AMBITION.</span>
            <p>
              The right technology.
              <br />
              <em>A more considered practice.</em>
            </p>
          </div>
        </div>
      </div>
      {tiers.length > 0 ? (
        <div className={`container ${styles.tierGrid}`}>
          {tiers.map((t) => (
            <article key={t.id}>
              <p className="eyebrow">{t.level}</p>
              <h3>{t.name}</h3>
              <p>{t.fit_description}</p>
              {t.image_path && (
                <Photo
                  path={t.image_path}
                  widths={t.image_path === 'hitting-nets.jpg' ? [480] : [480, 800, 1200]}
                  width={554}
                  height={416}
                  alt={`${t.name} launch-monitor and simulator setup`}
                  className={styles.tierInlinePhoto}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              )}
              <ul>
                {t.launch_tier_units.map((u) => (
                  <li key={u.id}>
                    {u.image_path && (
                      <Photo
                        path={u.image_path}
                        widths={monitorThumbnailWidths[u.image_path] ?? [480]}
                        width={480}
                        height={360}
                        alt={`${u.unit_name} launch monitor`}
                        className={styles.tierPhoto}
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    )}
                    <strong>{u.unit_name}</strong>
                    {u.feature_summary && (
                      <span className={styles.tierFeatures}>{u.feature_summary}</span>
                    )}
                    {u.indicative_price_usd !== null && (
                      <span className={styles.tierPrice}>
                        Indicative USD {u.indicative_price_usd.toLocaleString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-pressed={selected === t.id}
                className="button light"
                onClick={() => onSelect(selected === t.id ? '' : t.id)}
              >
                {selected === t.id ? 'Selected' : 'Choose this tier'}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <>
          <div
            className={`container ${styles.monitorGallery}`}
            aria-label="Launch monitor examples"
          >
            {localMonitorPhotos.map((photo) => (
              <Photo
                key={photo.path}
                path={photo.path}
                widths={photo.widths}
                width={600}
                height={450}
                alt={photo.alt}
                sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, 25vw"
              />
            ))}
          </div>
          <div className={`container ${styles.monitorConsiderations}`}>
            <p>
              <span>01</span> Your available space
            </p>
            <p>
              <span>02</span> Practice or simulation
            </p>
            <p>
              <span>03</span> Your budget and goals
            </p>
          </div>
        </>
      )}
    </section>
  );
}
