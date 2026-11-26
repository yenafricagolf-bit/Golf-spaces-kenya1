import sharp from 'sharp';
import { readFile, mkdir, copyFile } from 'node:fs/promises';
const photos = JSON.parse(await readFile('assets/photos.json', 'utf8'));
await mkdir('public/photos', { recursive: true });
for (const photo of photos) {
  const meta = await sharp(photo.source).metadata();
  const widths = [...new Set([480, 800, 1200].map((w) => Math.min(w, meta.width)))];
  for (const width of widths) {
    const image = sharp(photo.source)
      .rotate()
      .resize(width, Math.round(width * 0.75), {
        fit: 'cover',
        position: photo.name === 'putting' ? 'centre' : 'attention',
      });
    await image.clone().webp({ quality: 80 }).toFile(`public/photos/${photo.name}-${width}.webp`);
    await image
      .clone()
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(`public/photos/${photo.name}-${width}.jpg`);
  }
  await sharp(photo.source)
    .rotate()
    .resize(widths.at(-1), Math.round(widths.at(-1) * 0.75), { fit: 'cover' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`public/photos/${photo.name}.jpg`);
}
await sharp('assets/originals/simulator.webp')
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 85 })
  .toFile('public/photos/social.jpg');
await mkdir('public/fonts', { recursive: true });
await copyFile(
  'node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2',
  'public/fonts/cormorant-latin.woff2',
);
await mkdir('public/icons', { recursive: true });
for (const size of [32, 180, 192, 512]) {
  await sharp('public/brand/golf-spaces-kenya.png')
    .resize(size, size, { fit: 'contain', background: '#f5f2eb' })
    .flatten({ background: '#f5f2eb' })
    .png()
    .toFile(
      size === 32
        ? 'public/icons/favicon-32.png'
        : size === 180
          ? 'public/apple-touch-icon.png'
          : `public/icons/icon-${size}.png`,
    );
}
process.stdout.write(
  `Optimized ${photos.length} original photos; generated responsive images, icons and JPEG fallbacks.\n`,
);
