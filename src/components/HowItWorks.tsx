import styles from './Site.module.css';
export function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className={styles.centerHeading}>
          <p className="eyebrow">04 / FROM IDEA TO FIRST PUTT</p>
          <h2>
            Good spaces start
            <br />
            <em>with a conversation.</em>
          </h2>
        </div>
        <div className={styles.processGrid}>
          {[
            {
              num: '01',
              title: 'Share your space',
              text: 'Tell us about your property, the space you have and what you’d like to create. We’ll discuss the site and what needs to be assessed.',
            },
            {
              num: '02',
              title: 'Shape the design',
              text: 'Work through the layout, surface and equipment choices. Your quote will set out the proposed scope for you to review.',
            },
            {
              num: '03',
              title: 'Bring it to life',
              text: 'With the design and scope agreed, move into installation and handover, with guidance on looking after your new golf space.',
            },
          ].map((s) => (
            <article key={s.num}>
              <span>{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
