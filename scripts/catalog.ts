import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function catalog(root: string) {
  const entries = await readdir(join(root, 'photos'), { withFileTypes: true });
  const files = entries.filter(entry => entry.isFile() && /\.(jpe?g|png|webp|avif|gif)$/i.test(entry.name)).map(entry => entry.name).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  if (!files.length) return Bun.file(join(root, 'photos.js')).text();
  const photos = files.map(filename => {
    const caption = filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    return { id: filename, src: `./photos/${encodeURIComponent(filename)}`, title: caption.charAt(0).toUpperCase() + caption.slice(1), subtitle: 'A moment worth keeping.' };
  });
  return `export const isDemo = false;\nexport const photos = ${JSON.stringify(photos, null, 2)};\n`;
}
