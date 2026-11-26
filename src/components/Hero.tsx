import { Photo } from './Photo';
import styles from './Site.module.css';
export function Hero() {
  return (
    <section className={styles.hero} id="home">
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">
            <span className="dot" /> GOLF, BUILT AROUND YOU
          </p>
          <h1>
            Make room
            <br />
            for <em>your game.</em>
          </h1>
          <p className={styles.heroText}>
            From a quiet putting corner to a fully equipped simulator bay. Create a golf space that
            belongs in your world.
          </p>
          <div className={styles.heroButtons}>
            <a className="button primary" href="#spaces">
              Explore the spaces
            </a>
            <a className="text-link" href="#quote">
              Let’s plan your space
            </a>
          </div>
          <div className={styles.heroFoot}>
            <span className={styles.heroFootIcon} aria-hidden="true">
              ◎
            </span>
            <p>
              Designed for your property.
              <br />
              <strong>Built for the way you play.</strong>
            </p>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <span className={styles.visualKicker}>A NEW PERSPECTIVE ON PRACTICE</span>
          <Photo
            path="simulator.jpg"
            widths={[480, 800, 1080]}
            width={1080}
            height={810}
            alt="Golf simulator bay at YENGolf Virtual Club with warm wood finishes and an adjacent lounge"
            eager
            sizes="(max-width: 760px) 100vw, 55vw"
          />
          <div className={styles.photoCaption}>
            <span>INDOOR. OUTDOOR. YOURS.</span>
          </div>
          <div className={styles.floatingTag}>
            <span aria-hidden="true">⚑</span>
            <span>
              A little closer
              <br />
              <em>to the game.</em>
            </span>
          </div>
        </div>
      </div>
      <div className={`container ${styles.propertyStrip}`}>
        <span>AT HOME IN EVERY SETTING</span>
        <p>
          Homes <i /> Restaurants <i /> Hotels & resorts <i /> Ranches <i /> Offices
        </p>
      </div>
    </section>
  );
}
