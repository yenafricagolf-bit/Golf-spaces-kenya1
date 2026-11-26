import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'node:fs/promises';
const url = process.env.SUPABASE_URL,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw new Error('Set server-only Supabase credentials in your local .env. Never commit them.');
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
for (const directory of ['assets/originals', 'public/photos'])
  for (const file of await readdir(directory)) {
    const path = directory === 'assets/originals' ? `originals/${file}` : file;
    const type = file.endsWith('.webp')
      ? 'image/webp'
      : file.endsWith('.png')
        ? 'image/png'
        : 'image/jpeg';
    const { error } = await client.storage
      .from('product-images')
      .upload(path, await readFile(`${directory}/${file}`), {
        contentType: type,
        upsert: true,
        cacheControl: '3600',
      });
    if (error) throw new Error(`Upload failed for ${path}: ${error.message}`);
    process.stdout.write(`Uploaded ${path}\n`);
  }
process.stdout.write(
  'Originals and optimized derivatives uploaded. Seed migration supplies space image paths.',
);
