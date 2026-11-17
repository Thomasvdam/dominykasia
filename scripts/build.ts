import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { catalog } from './catalog';
const root = join(import.meta.dir, '..');
const output = join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'deck.js', 'captions.js', 'CNAME']) {
  await cp(join(root, file), join(output, file));
}
await cp(join(root, 'photos'), join(output, 'photos'), { recursive: true });
await Bun.write(join(output, 'photos.js'), await catalog(root));
await Bun.write(join(output, '.nojekyll'), '');
console.log('Built static app in dist/');
