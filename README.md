# Golf Spaces Kenya

Marketing and quote-request site for Golf Spaces Kenya, a YENGolf venture. The app uses Vite, React, TypeScript, plain CSS, Supabase and Netlify Functions.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The local catalogue is available in preview mode when `VITE_CATALOG_PREVIEW=true` and Supabase credentials are absent. Quote submission requires the Netlify Function and server environment variables.

## Checks

```bash
npm run lint
npm run test
npm run test:e2e
npm run format:check
npm run build
```

`npm run build` creates responsive WebP and JPEG derivatives in `public/photos`, copies the self-hosted Cormorant Garamond font, generates favicon/Apple touch/manifest icons and writes SEO files. Set `VITE_SITE_URL` to the final HTTPS domain so canonical, sitemap, robots and LocalBusiness JSON-LD use the production origin. Builds without a domain are deliberately noindex.

## Supabase setup

1. Create a Supabase project.
2. Run the files in `supabase/migrations` in filename order, using the Supabase CLI or migration runner.
3. Set the server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Netlify. Never expose the service-role key with a `VITE_` prefix.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the browser.
5. Upload the originals and derivatives with `npm run storage:upload` from a trusted local environment containing the server-only variables. The storage bucket is created by the migration.

The migration seeds the seven approved spaces plus the three launch-monitor tiers and nine units with feature summaries. The local preview mirrors those rows, including Foresight Falcon in the Professional tier. The supplied outdoor three-station image is used for the hitting-bays card.

## Netlify deployment

1. Push this repository to GitHub.
2. Create a Netlify site from the repository.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`, functions directory `netlify/functions`.
4. Add the variables in `.env.example` to the Netlify environment. `VITE_` values are public; all other values are server-only.
5. Set `RESEND_API_KEY`, `QUOTE_NOTIFY_FROM` and `QUOTE_NOTIFY_TO`. The sender must be verified in Resend. Resend is used for email notifications.
6. Set `SITE_URL` and `VITE_SITE_URL` to the final HTTPS domain. Set `VITE_CONTACT_WHATSAPP`, `VITE_CONTACT_EMAIL` and `VITE_CONTACT_PHONE` when those contact buttons should appear.
7. Deploy. The scheduled `retry-notifications` function retries unsent email notifications every 15 minutes.

## Updating content

Published catalogue content is loaded from Supabase. Update a space row, image path or publication state in a migration. Keep the local `src/lib/spaces.json` catalogue aligned for design previews. Product image paths refer to the public `product-images` bucket. Run the image pipeline after replacing originals.

The app is a single-page site with a branded runtime 404, route-level lazy chunks, context-specific skeletons and an error boundary. Unknown paths are redirected to the SPA by Netlify and rendered as the 404 page in the browser.

## Design reference

`docs/design/decisions.md` records the approved adaptation of the supplied Cardova recording, palette, typography, photo decisions and reference gaps.

## Current verification

The unit and isolated PostgreSQL migration tests cover quote validation, room fit, RLS visibility, idempotency, atomic persistence, rate limiting and notification outbox claims. Browser tests use Playwright; in restricted environments set `PLAYWRIGHT_CHROMIUM_PATH` to an available Chromium executable. Lighthouse still requires a browser-enabled environment and the final production domain.
