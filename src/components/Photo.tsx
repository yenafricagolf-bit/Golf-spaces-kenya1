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
  // Use the smallest optimized derivative as the fallback source. Some catalogue
  // images intentionally have no unoptimized original (for example hitting-nets).
  const fallbackPath = `${base}-${widths[0]}.jpg`;
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
