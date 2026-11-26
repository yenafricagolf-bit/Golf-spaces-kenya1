export interface Space {
  id: string;
  slug: string;
  name: string;
  tag: string;
  description: string;
  spec: {
    setting: string;
    alt: string;
    image_width?: number;
    image_height?: number;
    variants?: number[];
  };
  image_path: string | null;
  uses_surface: boolean;
  is_simulator: boolean;
  sort_order: number;
  published: boolean;
}
export interface LaunchUnit {
  id: string;
  tier_id: string;
  unit_name: string;
  indicative_price_usd: number | null;
  published: boolean;
  feature_summary?: string;
  image_path?: string | null;
}
export interface LaunchTier {
  id: string;
  name: string;
  level: string;
  fit_description: string;
  sort_order: number;
  published: boolean;
  launch_tier_units: LaunchUnit[];
  image_path?: string | null;
}
export interface Catalog {
  spaces: Space[];
  tiers: LaunchTier[];
  remote: boolean;
}
