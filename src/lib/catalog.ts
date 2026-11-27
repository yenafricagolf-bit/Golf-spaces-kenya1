import { z } from 'zod';
import { config } from './config';
import localSpaces from './spaces.json';
import type { Catalog } from './types';
const spaceSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  tag: z.string(),
  description: z.string(),
  spec: z.object({
    setting: z.string(),
    alt: z.string(),
    image_width: z.number().optional(),
    image_height: z.number().optional(),
    variants: z.array(z.number()).optional(),
  }),
  image_path: z.string().nullable(),
  uses_surface: z.boolean(),
  is_simulator: z.boolean(),
  sort_order: z.number(),
  published: z.boolean(),
});
const tierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  level: z.string(),
  fit_description: z.string(),
  sort_order: z.number(),
  published: z.boolean(),
  image_path: z.string().nullable().optional(),
  launch_tier_units: z.array(
    z.object({
      id: z.string().uuid(),
      tier_id: z.string().uuid(),
      unit_name: z.string(),
      indicative_price_usd: z.number().nullable(),
      published: z.boolean(),
      feature_summary: z.string().optional(),
      image_path: z.string().nullable().optional(),
    }),
  ),
});

const localLaunchTiers = tierSchema.array().parse([
  {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'Practice',
    level: 'PRACTICE TIER',
    fit_description:
      'Straightforward feedback for regular practice, range sessions and building a repeatable swing routine.',
    sort_order: 0,
    published: true,
    launch_tier_units: [
      {
        id: '21000000-0000-4000-8000-000000000001',
        tier_id: '20000000-0000-4000-8000-000000000001',
        unit_name: 'Swing Caddie SC200 Plus+',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Doppler radar for carry distance, swing speed, ball speed and smash factor, plus Practice Swing Mode and up to 20 hours of battery life.',
        image_path: 'monitor-portable.jpg',
      },
      {
        id: '21000000-0000-4000-8000-000000000002',
        tier_id: '20000000-0000-4000-8000-000000000001',
        unit_name: 'Garmin Approach R10',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Portable radar with club and ball metrics, Garmin Golf app support, third-party simulator compatibility and up to 10 hours of battery life.',
        image_path: 'monitor-9.jpg',
      },
      {
        id: '21000000-0000-4000-8000-000000000003',
        tier_id: '20000000-0000-4000-8000-000000000001',
        unit_name: 'SkyTrak+',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Dual Doppler radar and photometric camera system with indoor/outdoor use, ball and club data, Wi-Fi and Direct Modes.',
        image_path: 'monitor-8.jpg',
      },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    name: 'Performance',
    level: 'PERFORMANCE TIER',
    fit_description:
      'A deeper set of ball and club data for golfers who want serious practice feedback and simulator flexibility.',
    sort_order: 1,
    published: true,
    launch_tier_units: [
      {
        id: '22000000-0000-4000-8000-000000000001',
        tier_id: '20000000-0000-4000-8000-000000000002',
        unit_name: 'Foresight GC3',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Three precision cameras, touchscreen display, full ball and club data, indoor/outdoor use and simulation-ready connectivity.',
        image_path: 'monitor-16.jpg',
      },
      {
        id: '22000000-0000-4000-8000-000000000002',
        tier_id: '20000000-0000-4000-8000-000000000002',
        unit_name: 'Garmin Approach R50',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Three high-speed cameras, a 10-inch colour touchscreen, 15+ ball and club measurements, impact video and built-in simulator access.',
        image_path: 'monitor-12.jpg',
      },
      {
        id: '22000000-0000-4000-8000-000000000003',
        tier_id: '20000000-0000-4000-8000-000000000002',
        unit_name: 'Bushnell Launch Pro',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Three-camera infrared measurement with ball data, optional club data, touchscreen display and 5–7 hours of battery life.',
        image_path: 'monitor-11.jpg',
      },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    name: 'Professional',
    level: 'PROFESSIONAL TIER',
    fit_description:
      'High-resolution tracking for advanced fitting, coaching, putting analysis and premium simulator builds.',
    sort_order: 2,
    published: true,
    launch_tier_units: [
      {
        id: '23000000-0000-4000-8000-000000000003',
        tier_id: '20000000-0000-4000-8000-000000000003',
        unit_name: 'Foresight Falcon',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Overhead Quadrascopic camera system measuring ball speed, launch and side angle, spin, carry, club speed, path, angle of attack, face angle, loft, lie, impact location and closure rate. The 59 × 28 in hitting zone supports left- and right-handed play, with Ethernet, USB-C and Wi-Fi connectivity, integrated power and an automatic latching ceiling mount.',
        image_path: 'foresight-falcon.jpg',
      },
      {
        id: '23000000-0000-4000-8000-000000000001',
        tier_id: '20000000-0000-4000-8000-000000000003',
        unit_name: 'Foresight GCQuad',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Four high-speed cameras with ball and club data, loft/lie and impact location, putting analysis and a swappable battery.',
        image_path: 'monitor-14.jpg',
      },
      {
        id: '23000000-0000-4000-8000-000000000002',
        tier_id: '20000000-0000-4000-8000-000000000003',
        unit_name: 'TrackMan 4',
        indicative_price_usd: null,
        published: true,
        feature_summary:
          'Optically enhanced radar with synchronized high-speed optics, full club, ball and putting data, and simulator support.',
        image_path: 'monitor-15.jpg',
      },
    ],
  },
]);
export const localCatalog: Catalog = {
  spaces: spaceSchema.array().parse(localSpaces),
  tiers: localLaunchTiers,
  remote: false,
};
export async function loadCatalog(): Promise<Catalog> {
  if (!config.supabaseUrl || !config.anonKey) {
    return localCatalog;
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const db = createClient(config.supabaseUrl, config.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [spaces, tiers] = await Promise.all([
      db.from('spaces').select('*').eq('published', true).order('sort_order'),
      db
        .from('launch_tiers')
        .select('*, launch_tier_units(*)')
        .eq('published', true)
        .order('sort_order'),
    ]);
    if (spaces.error || tiers.error) return localCatalog;
    return {
      spaces: spaceSchema.array().parse(spaces.data),
      tiers: tierSchema
        .array()
        .parse(tiers.data)
        .map((t) => ({ ...t, launch_tier_units: t.launch_tier_units.filter((u) => u.published) })),
      remote: true,
    };
  } catch {
    return localCatalog;
  }
}
export function imageUrl(path: string, remote = false) {
  // Keep catalogue data in Supabase, but serve committed image assets from
  // Netlify's edge cache. This avoids a second storage request and keeps every
  // optimized derivative available, including hitting-nets.
  if (!remote || !path.includes('/')) return `/photos/${path}`;
  return `${config.supabaseUrl}/storage/v1/object/public/product-images/${path.split('/').map(encodeURIComponent).join('/')}`;
}
