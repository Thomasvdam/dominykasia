import { resolve, sep } from 'node:path';
import { catalog } from './scripts/catalog';

const root = import.meta.dir;
const allowed = new Set(['index.html', 'styles.css', 'app.js', 'deck.js']);
const server = Bun.serve({
  port: Number(process.env.PORT || 3000),
  hostname: '0.0.0.0',
  async fetch(request) {
    let path;
    try { path = decodeURIComponent(new URL(request.url).pathname).replace(/^\/+/, '') || 'index.html'; }
    catch { return new Response('Bad request', { status: 400 }); }
    if (path === 'photos.js') return new Response(await catalog(root), { headers: { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' } });
    const filePath = resolve(root, path);
    if (!filePath.startsWith(root + sep) || (!allowed.has(path) && !/^photos\/[^/]+\.(jpe?g|png|webp|avif|gif)$/i.test(path))) return new Response('Not found', { status: 404 });
    const file = Bun.file(filePath);
    if (!(await file.exists())) return new Response('Not found', { status: 404 });
    return new Response(file, { headers: { 'Cache-Control': 'no-store' } });
  },
});
console.log(`Dominykasia is ready at ${server.url}`);
