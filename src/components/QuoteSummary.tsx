import { useState } from 'react';
import { config } from '../lib/config';
import type { QuoteInput } from '../lib/validation';
import type { Space } from '../lib/types';
import { Photo } from './Photo';
import styles from './Quote.module.css';
export function Basket({
  spaces,
  onRemove,
  remote,
}: {
  spaces: Space[];
  onRemove: (id: string) => void;
  remote: boolean;
}) {
  return (
    <aside className={styles.basket} aria-label="Quote basket">
      <p className="eyebrow">YOUR SPACE, TAKING SHAPE</p>
      <h3>
        Your quote <span>{spaces.length.toString().padStart(2, '0')}</span>
      </h3>
      {spaces.length ? (
        <ul>
          {spaces.map((s) => (
            <li key={s.id}>
              {s.image_path && (
                <Photo
                  path={s.image_path}
                  alt=""
                  remote={remote}
                  widths={s.spec.variants}
                  sizes="64px"
                />
              )}
              <div>
                <strong>{s.name}</strong>
                <span>{s.spec.setting}</span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${s.name} from basket`}
                onClick={() => onRemove(s.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          A blank canvas.
          <br />
          Add a space above to get started.
        </p>
      )}
      <a className="text-link" href="#spaces">
        {spaces.length ? 'Explore more spaces' : 'Find your first space'}
      </a>
      <div className={styles.basketNote}>
        <span aria-hidden="true">◎</span>
        <p>
          Your selection starts the conversation. We’ll work through the design and pricing with
          you.
        </p>
      </div>
    </aside>
  );
}
export function makeSummary(q: QuoteInput, spaces: Space[], reference: string) {
  return [
    `Golf Spaces Kenya — quote request`,
    `Reference: ${reference}`,
    `Name: ${q.full_name}`,
    q.business_name ? `Business: ${q.business_name}` : '',
    `Email: ${q.email}`,
    `Phone: ${q.phone}`,
    `Property: ${q.property_type}`,
    `Location: ${q.location}`,
    `Spaces: ${spaces.map((s) => s.name).join(', ')}`,
    q.surface_choice ? `Surface: ${q.surface_choice}` : '',
    q.approx_area_m2 ? `Area: ${q.approx_area_m2} m²` : '',
    q.cups ? `Cups: ${q.cups}` : '',
    q.placement ? `Placement: ${q.placement}` : '',
    q.room_length_m ? `Room: ${q.room_length_m} × ${q.room_width_m} × ${q.room_height_m} m` : '',
    q.bays ? `Bays: ${q.bays}` : '',
    q.main_use ? `Use: ${q.main_use}` : '',
    q.budget_range ? `Budget: ${q.budget_range}` : '',
    q.timeline ? `Timeline: ${q.timeline}` : '',
    `Maintenance advice: ${q.maintenance_plan ? 'Yes' : 'No'}`,
    q.notes ? `Notes: ${q.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
export function QuoteSummary({
  quote,
  spaces,
  reference,
  onReset,
}: {
  quote: QuoteInput;
  spaces: Space[];
  reference: string;
  onReset: () => void;
}) {
  const [copy, setCopy] = useState('Copy summary');
  const text = makeSummary(quote, spaces, reference);
  return (
    <div className={styles.success} tabIndex={-1} id="quote-success">
      <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
      <h3>Thank you, {quote.full_name.split(' ')[0]}.</h3>
      <p>Your request has been received. Keep this summary for your records.</p>
      <pre>{text}</pre>
      <div className={styles.successActions}>
        <button
          className="button primary"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopy('Copied');
            } catch {
              setCopy('Select and copy the summary above');
            }
          }}
        >
          {copy}
        </button>
        {config.whatsapp && (
          <a
            className="button secondary"
            href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Send on WhatsApp
          </a>
        )}
        <button type="button" className="text-link" onClick={onReset}>
          Start another request
        </button>
      </div>
      <span className="sr-only" role="status">
        {copy === 'Copied' ? 'Summary copied.' : ''}
      </span>
    </div>
  );
}
