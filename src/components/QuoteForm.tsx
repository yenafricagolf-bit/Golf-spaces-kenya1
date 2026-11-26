import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { z } from 'zod';
import {
  PROPERTY_TYPES,
  SURFACES,
  PLACEMENTS,
  MAIN_USES,
  validateQuote,
  errorFields,
  type QuoteInput,
} from '../lib/validation';
import { checkRoomFit } from '../lib/room-fit';
import type { Space, LaunchTier } from '../lib/types';
import { Basket, QuoteSummary } from './QuoteSummary';
import styles from './Quote.module.css';
interface Props {
  spaces: Space[];
  selected: string[];
  onToggle: (id: string) => void;
  remote: boolean;
  tiers: LaunchTier[];
  tier: string;
  onTier: (id: string) => void;
  onReset: () => void;
}
const successSchema = z.object({ id: z.string().uuid() });
const failureSchema = z.object({
  message: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});
function Field({
  name,
  label,
  children,
  hint,
  errors,
}: {
  name: string;
  label: string;
  children: ReactNode;
  hint?: string;
  errors: Record<string, string>;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      {hint && <span className={styles.hint}>{hint}</span>}
      {children}
      {errors[name] && (
        <span className={styles.error} id={`${name}-error`}>
          {errors[name]}
        </span>
      )}
    </div>
  );
}
export function QuoteForm({
  spaces,
  selected,
  onToggle,
  remote,
  tiers,
  tier,
  onTier,
  onReset,
}: Props) {
  const chosen = spaces.filter((s) => selected.includes(s.id)),
    hasSurface = chosen.some((s) => s.uses_surface),
    hasSim = chosen.some((s) => s.is_simulator);
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [message, setMessage] = useState(''),
    [pending, setPending] = useState(false),
    [sent, setSent] = useState<{ quote: QuoteInput; spaces: Space[]; reference: string } | null>(
      null,
    );
  const [dims, setDims] = useState({ length: 0, width: 0, height: 0 });
  const requestId = useRef(crypto.randomUUID());
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const fit = checkRoomFit(dims.length, dims.width, dims.height);
  const described = (name: string) => (errors[name] ? `${name}-error` : undefined);

  const input = (
    name: string,
    label: string,
    type = 'text',
    required = false,
    maxLength = 120,
    autoComplete?: string,
  ) => (
    <Field errors={errors} key={name} name={name} label={label}>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={!!errors[name]}
        aria-describedby={described(name)}
      />
    </Field>
  );
  const select = (name: string, label: string, options: readonly string[], required = false) => (
    <Field errors={errors} name={name} label={label}>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        aria-invalid={!!errors[name]}
        aria-describedby={described(name)}
      >
        <option value="">Choose an option</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
  const numeric = (name: string, label: string, max: number, integer = false) => (
    <Field errors={errors} name={name} label={label}>
      <input
        id={name}
        name={name}
        type="number"
        min={integer ? 1 : 0.01}
        max={max}
        step={integer ? 1 : '0.01'}
        inputMode="decimal"
        aria-invalid={!!errors[name]}
        aria-describedby={described(name)}
      />
    </Field>
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setMessage('');
    setErrors({});
    const data = new FormData(event.currentTarget);
    const val = (k: string) => String(data.get(k) ?? '');
    const num = (k: string) => (val(k).trim() ? Number(val(k)) : null);
    const raw = {
      request_id: requestId.current,
      full_name: val('full_name'),
      business_name: val('business_name'),
      phone: val('phone'),
      email: val('email'),
      property_type: val('property_type'),
      location: val('location'),
      space_ids: chosen.map((s) => s.id),
      surface_choice: hasSurface ? val('surface_choice') || null : null,
      approx_area_m2: hasSurface ? num('approx_area_m2') : null,
      cups: hasSurface ? num('cups') : null,
      placement: val('placement') || null,
      monitor_tier_id: hasSim ? tier || null : null,
      room_length_m: hasSim ? num('room_length_m') : null,
      room_width_m: hasSim ? num('room_width_m') : null,
      room_height_m: hasSim ? num('room_height_m') : null,
      bays: hasSim ? num('bays') : null,
      main_use: val('main_use') || null,
      budget_range: val('budget_range'),
      timeline: val('timeline'),
      maintenance_plan: data.has('maintenance_plan'),
      notes: val('notes'),
      website: val('website'),
      consent: data.has('consent'),
    };
    const parsed = validateQuote(
      raw,
      spaces,
      tiers.map((t) => t.id),
    );
    if (!parsed.success) {
      setErrors(errorFields(parsed.error));
      setMessage('Please check the highlighted fields.');
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setPending(true);
    try {
      const response = await fetch('/.netlify/functions/submit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(20000),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const err = failureSchema.safeParse(payload);
        if (err.success && err.data.errors) setErrors(err.data.errors);
        throw new Error(
          response.status === 429
            ? 'You’ve sent several requests. Please wait a minute before trying again.'
            : err.success && err.data.message
              ? err.data.message
              : 'We couldn’t send your request. Your details are still here; please try again.',
        );
      }
      const result = successSchema.parse(payload);
      setSent({ quote: parsed.data, spaces: chosen, reference: result.id });
      requestAnimationFrame(() => document.getElementById('quote-success')?.focus());
    } catch (error) {
      setMessage(
        error instanceof Error && error.name === 'TimeoutError'
          ? 'The request took too long. Please try again; the same request will not be saved twice.'
          : error instanceof Error
            ? error.message
            : 'Unable to send your request. Please try again.',
      );
      requestAnimationFrame(() => summary.current?.focus());
    } finally {
      setPending(false);
    }
  }
  return (
    <section className={`section ${styles.quoteSection}`} id="quote">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">05 / LET’S MAKE IT YOURS</p>
            <h2>
              Your space.
              <br />
              <em>Your next great idea.</em>
            </h2>
          </div>
          <p>
            Tell us what you have in mind. A few details now will help us have a better conversation
            about your project.
          </p>
        </div>
        {sent ? (
          <QuoteSummary
            {...sent}
            onReset={() => {
              setSent(null);
              onReset();
              setErrors({});
              setMessage('');
              setDims({ length: 0, width: 0, height: 0 });
              requestId.current = crypto.randomUUID();
            }}
          />
        ) : (
          <div className={styles.layout}>
            <form
              onSubmit={submit}
              ref={form}
              noValidate
              className={styles.form}
              aria-label="Request a quote"
            >
              <div className={styles.formIntro}>
                <h3>A place to begin.</h3>
                <p>Fields marked * are required.</p>
              </div>
              {message && (
                <div className={styles.alert} role="alert" tabIndex={-1} ref={summary}>
                  {message}
                  {Object.keys(errors).length > 0 && (
                    <ul>
                      {Object.entries(errors).map(([key, value]) => (
                        <li key={key}>
                          <a href={key === 'space_ids' ? '#space-selection' : `#${key}`}>{value}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <fieldset
                id="space-selection"
                aria-describedby={errors.space_ids ? 'space_ids-error' : undefined}
              >
                <legend>
                  Your spaces <span>{chosen.length} selected</span>
                </legend>
                <div className={styles.chips}>
                  {spaces.map((s) => (
                    <label key={s.id}>
                      <input
                        type="checkbox"
                        checked={selected.includes(s.id)}
                        onChange={() => onToggle(s.id)}
                      />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
                {errors.space_ids && (
                  <p className={styles.error} id="space_ids-error">
                    {errors.space_ids}
                  </p>
                )}
              </fieldset>
              <fieldset>
                <legend>About you</legend>
                <div className={styles.fields}>
                  {input('full_name', 'Full name *', 'text', true, 120, 'name')}
                  {input('business_name', 'Business name', 'text', false, 160, 'organization')}
                  {input('email', 'Email address *', 'email', true, 254, 'email')}
                  {input('phone', 'Phone number *', 'tel', true, 32, 'tel')}
                  {select('property_type', 'Property type *', PROPERTY_TYPES, true)}
                  {input('location', 'Town / location *', 'text', true, 200, 'address-level2')}
                </div>
              </fieldset>
              <fieldset>
                <legend>Your project</legend>
                <div className={styles.fields}>
                  {select('placement', 'Where will it be?', PLACEMENTS)}
                  {select('main_use', 'How will you use it?', MAIN_USES)}
                </div>
              </fieldset>
              {hasSurface && (
                <fieldset>
                  <legend>The green</legend>
                  <div className={styles.fields}>
                    {select('surface_choice', 'Preferred surface *', SURFACES, true)}
                    {numeric('approx_area_m2', 'Approximate area (m²)', 1000000)}
                    {numeric('cups', 'Number of cups', 100, true)}
                  </div>
                </fieldset>
              )}
              {hasSim && (
                <fieldset>
                  <legend>Your simulator space</legend>
                  <p className={styles.hint}>
                    If you know the room dimensions, enter all three. Our initial room-fit guide is
                    5 × 3.5 × 2.8 m.
                  </p>
                  <div className={styles.dimensions}>
                    {(['length', 'width', 'height'] as const).map((key) => (
                      <Field
                        errors={errors}
                        key={key}
                        name={`room_${key}_m`}
                        label={`${key.charAt(0).toUpperCase() + key.slice(1)} (m)`}
                      >
                        <input
                          id={`room_${key}_m`}
                          name={`room_${key}_m`}
                          type="number"
                          min="0.01"
                          max={key === 'height' ? 100 : 1000}
                          step="0.01"
                          inputMode="decimal"
                          onChange={(e) =>
                            setDims((v) => ({ ...v, [key]: Number(e.target.value) }))
                          }
                          aria-invalid={!!errors[`room_${key}_m`]}
                          aria-describedby={described(`room_${key}_m`)}
                        />
                      </Field>
                    ))}
                  </div>
                  {fit.valid && (
                    <p className={`${styles.fit} ${fit.fits ? styles.fitGood : ''}`} role="status">
                      {fit.fits
                        ? 'Your dimensions meet our initial room-fit guide.'
                        : 'Your ' +
                          fit.shortfalls.join(', ') +
                          ' ' +
                          (fit.shortfalls.length === 1 ? 'is' : 'are') +
                          ' below our initial room-fit guide.'}{' '}
                      A site assessment must confirm safe swing clearance and equipment suitability.
                    </p>
                  )}
                  <div className={styles.fields}>
                    {numeric('bays', 'Number of bays', 100, true)}
                    {tiers.length > 0 && (
                      <Field errors={errors} name="monitor_tier_id" label="Launch-monitor tier">
                        <select
                          name="monitor_tier_id"
                          id="monitor_tier_id"
                          value={tier}
                          onChange={(e) => onTier(e.target.value)}
                          aria-invalid={!!errors.monitor_tier_id}
                          aria-describedby={described('monitor_tier_id')}
                        >
                          <option value="">Advise me</option>
                          {tiers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>
                </fieldset>
              )}
              <fieldset>
                <legend>The finer details</legend>
                <div className={styles.fields}>
                  {input('budget_range', 'Budget or budget range (include currency)')}
                  {input('timeline', 'When would you like to get started?')}
                </div>
                <Field errors={errors} name="notes" label="Anything else we should know?">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    maxLength={3000}
                    aria-invalid={!!errors.notes}
                    aria-describedby={described('notes')}
                  />
                </Field>
                <label className={styles.checkbox}>
                  <input type="checkbox" name="maintenance_plan" />
                  I’d like advice on a maintenance plan.
                </label>
              </fieldset>
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="website">Leave this field empty</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <label className={styles.checkbox}>
                <input
                  id="consent"
                  type="checkbox"
                  name="consent"
                  required
                  aria-invalid={!!errors.consent}
                  aria-describedby={described('consent')}
                />
                I agree that Golf Spaces Kenya may use these details to respond to my project
                enquiry. *
              </label>
              {errors.consent && (
                <p className={styles.error} id="consent-error">
                  {errors.consent}
                </p>
              )}
              <p className={styles.privacy}>
                Your details are used to review your enquiry and contact you about it. They are not
                published on this website.
              </p>
              <button className="button primary" type="submit" disabled={pending}>
                {pending ? 'Sending your request…' : 'Request my quote'}
              </button>
            </form>
            <Basket spaces={chosen} onRemove={onToggle} remote={remote} />
          </div>
        )}
      </div>
    </section>
  );
}
