import { Photo } from './Photo';
import styles from './Site.module.css';
export function SurfaceCompare() {
  return (
    <section className={`section ${styles.surfaceSection}`} id="surfaces">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / THE FEEL UNDERFOOT</p>
            <h2>
              A natural choice.
              <br />
              <em>Or a practical one.</em>
            </h2>
          </div>
          <p>
            The right surface depends on your setting, how often you play and the care you want to
            give it. We’ll help you decide.
          </p>
        </div>
        <div className={styles.surfaceGrid}>
          {[
            {
              name: 'Natural grass',
              path: 'natural.jpg',
              widths: [480, 724],
              alt: 'Golf ball resting on a closely cut natural grass green',
              label: 'THE LIVING GREEN',
              text: 'A living surface that changes with the seasons. Suited to outdoor spaces where regular turf care is part of the plan.',
              rows: [
                ['The experience', 'Natural turf feel and seasonal character'],
                ['Plan for', 'Water, mowing and ongoing turf care'],
                ['Best discussed', 'Sunlight, drainage and maintenance'],
              ],
            },
            {
              name: 'Synthetic turf',
              path: 'synthetic.jpg',
              widths: [447],
              alt: 'Close-up of synthetic turf fibres and backing',
              label: 'READY WHEN YOU ARE',
              text: 'A consistent practice surface for indoor or outdoor use. An option when you want to spend more time playing and less time tending turf.',
              rows: [
                ['The experience', 'A consistent, purpose-made playing surface'],
                ['Plan for', 'Brushing, cleaning and periodic checks'],
                ['Best discussed', 'Turf selection, base preparation and drainage'],
              ],
            },
          ].map((item) => (
            <article className={styles.surfaceCard} key={item.name}>
              <Photo
                path={item.path}
                alt={item.alt}
                widths={item.widths}
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div>
                <p className="eyebrow">{item.label}</p>
                <h3>{item.name}</h3>
                <p>{item.text}</p>
                <dl>
                  {item.rows.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.surfaceNote}>
          Not sure yet? Choose “Advise me” in your quote request.
        </p>
      </div>
    </section>
  );
}
