import { imageUrl } from '../lib/catalog';
interface Props {
  path: string;
  alt: string;
  widths?: number[];
  width?: number;
  height?: number;
  eager?: boolean;
  remote?: boolean;
  className?: string;
  sizes?: string;
}
export function Photo({
  path,
  alt,
  widths = [480, 800, 1200],
  width = 1200,
  height = 900,
  eager = false,
  remote = false,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw',
}: Props) {
  const base = path.replace(/\.[^.]+$/, '');
  // Hitting bays has no original file in the live Supabase bucket, so use
  // the optimized derivative committed with the site.
  const localOnly = path === 'hitting-nets.jpg';
  const assetRemote = remote && !localOnly;
  const fallbackPath = localOnly ? `${base}-${widths[0]}.jpg` : path;
  return (
    <picture className={className}>
      <source
        type="image/webp"
        srcSet={widths.map((w) => `${imageUrl(`${base}-${w}.webp`, assetRemote)} ${w}w`).join(', ')}
        sizes={sizes}
      />
      <img
        src={imageUrl(fallbackPath, assetRemote)}
        srcSet={widths.map((w) => `${imageUrl(`${base}-${w}.jpg`, assetRemote)} ${w}w`).join(', ')}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  );
}
