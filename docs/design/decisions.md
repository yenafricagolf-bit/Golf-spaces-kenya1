# Golf Spaces Kenya — design and delivery record

## Approved direction

The client confirmed on 12 November 2026 that the Cardova recording is the sole layout reference, superseding all mobile PNG screenshots. The client authorized adaptation and refinement for Golf Spaces, then approved implementation, Cormorant Garamond and five brand colours. Off-white was subsequently approved. This is an adaptation, not a pixel-identical copy of the finance site.

## Reference analysis

Method: FFmpeg, 2fps, 68 frames reviewed in chronological order, 33.94 seconds, 3360 × 2100 recording. The embedded design is shown in a laptop mockup on a portfolio page; browser chrome, portfolio controls and laptop hardware are not part of the delivered website.

Observed embedded sequence: animated brand/card introduction; benefits arranged in three columns; central people/benefits composition; three testimonial columns; centred conversion section with landscape imagery; deep-green footer with oversized wordmark; looping to a two-column hero with copy left and cards right. The recording begins partway through the animation. No golf content or functional form is shown. Cardova branding and finance claims will not be transplanted to this venture.

Reference colours sampled from the embedded page (compressed RGB approximations): #EDEFE6, #F4F4ED, #F8F8F3. These are superseded by the approved brand palette. Exact font and CSS values cannot be recovered from a raster video. Recording suggests compact sans-serif body, understated rules, restrained rounded cards, large whitespace and coordinated vertical/fade movement. Client's Cormorant Garamond supersedes reference typography.

## Adapted design specification

- Palette: #222223 ink/dark sections; #313132 elevated dark surfaces; #9A2326 burgundy CTAs; #E6A8A8 rose highlights; #8DA77F sage panels; approved off-white #F5F2EB. Body muted text uses contrast-safe derived neutral tones.
- Type: self-hosted Cormorant Garamond variable, 400–600, headings and editorial statements. System sans-serif for compact forms/navigation/body for legibility. No second downloaded font. Main display 56–100px fluid, h2 40–64px, h3 27–36px; body 15–17px, 1.65 line height; compact labels 11–13px with 0.12em tracking.
- Grid: max content 1240px, desktop 56px gutters, tablet 32px, mobile 20px; cards 3/2/1 columns. Section padding 80–112px desktop and 56–72px mobile. Spacing scale 4/8/12/16/24/32/48/64/80/112px.
- Shape: 4px buttons, 8px cards, fine 1px borders, minimal shadows. Quiet editorial composition rather than ornamental UI.
- Header: wordmark, anchor navigation, quote basket count, responsive accessible menu.
- Hero: split editorial heading and landscape installation photo; off-white field and sage image surround, large serif title and burgundy CTA. Product photo replaces finance artwork. Property types appear in a single compact line, not invented project metrics.
- SpaceGrid: numbered heading, spacious 3-column cards with actual photos, 4:3 images, category labels and add/remove controls. Seventh hitting-net card is textual until its missing photo is supplied; never substitute stock imagery.
- SurfaceCompare: two-column natural/synthetic panels, real supplied surface photos, descriptive trade-offs without fabricated maintenance/price guarantees.
- LaunchMonitorTiers: equipment imagery and explanatory fit criteria. No prices, model identities or tier rows are invented. Database-backed tiers appear only once confirmed and published. User may request advice without choosing a tier.
- HowItWorks: three aligned steps: site assessment, design/quote, build/handover. No service-time promises.
- QuoteForm: details left and sticky basket right, stacked mobile. Conditional surface and simulator inputs; removable photo thumbnails; room dimensions checked against supplied 5 × 3.5 × 2.8m guidance. Fit guidance is not a structural or installation guarantee.
- QuoteSummary: shown only after server-confirmed persistence; copy and configured WhatsApp link. No simulated successful submission in the app.
- Footer: dark green/charcoal editorial ending with oversized brand wording and configured contact links.
- Interaction: semantic buttons/links; native checkboxes and selects; visible focus; subtle 180ms hover and 500ms entrance fades, disabled for reduced motion. No scroll-jacking. Theme uses OS preference with approved palette.

## Reference gaps / limits

No true desktop viewport without mockup, tablet, mobile, hover, navigation menu, quote basket, input/error/loading/success, or room-fit interaction is shown. Reference has no golf copy, dimensions, prices, inventory, client testimonials or approved contact data. These are new adaptations under the client's start approval. No fabricated customers, results, prices or specifications. Contact buttons remain hidden without configuration. Exact pixel comparisons are inappropriate for brand/font/content differences; side-by-side captures document composition instead.

## Photo decisions

Putting: elite-green-2.jpg. Chipping: images (2).jpeg. Short game: images (3).jpeg. Simulator/hero: yengolf-virtual-club-runda-mall-v0-j7ox3gl8oakh1.webp. Indoor studio: images (4).jpeg. Target practice: BackYardShot copy 2.jpg (provisional category). Hitting nets: missing. Natural/synthetic surfaces: images (6)/(7).jpeg. Other simulator: images (5).jpeg. Equipment photos download.webp and images (8)–(15).jpeg retained with neutral alt text; model/tier mapping needs owner confirmation. Original files preserved; derivatives capped at source resolution (never falsely claim extra detail).

## Plan and commits

1. Planning and tokens. 2. Static responsive UI and photo pipeline. 3. SQL/RLS/Storage and data adapter. 4. Validated submission and notification. 5. Tests, screenshot review, Lighthouse/SEO and README.

## Outstanding operational inputs

Supabase URL, anon key, service role in Netlify only; Supabase project migration access; Resend key/verified sender/notification recipient; custom domain; contact values; final tier/unit names/prices; missing hitting-net photo; production Git remote. No live deployments or uploads claimed without credentials.
