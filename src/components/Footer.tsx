import { Brand } from './Header';
import { config } from '../lib/config';
import styles from './Site.module.css';
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div>
            <Brand />
            <p>
              A little more golf.
              <br />A little closer to you.
            </p>
          </div>
          <div>
            <p className="eyebrow">EXPLORE</p>
            <a href="#spaces">Our spaces</a>
            <a href="#surfaces">Surface choices</a>
            <a href="#technology">Golf technology</a>
          </div>
          <div>
            <p className="eyebrow">LET’S TALK</p>
            <a href="#quote">Plan your space</a>
            {config.email && <a href={`mailto:${config.email}`}>{config.email}</a>}
            {config.phone && (
              <a href={`tel:${config.phone.replace(/[^+0-9]/g, '')}`}>{config.phone}</a>
            )}
            {config.whatsapp && (
              <a
                href={`https://wa.me/${config.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            )}
            <span>Kenya</span>
          </div>
        </div>
        <p className={styles.footerDisplay}>
          Space for <em>the game.</em>
        </p>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Golf Spaces Kenya. A YENGolf venture.</span>
          <a href="#home">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
