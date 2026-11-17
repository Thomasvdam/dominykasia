// Optional authoring tool: requires the agent-browser CLI, not used during deployment.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

if (!Bun.which('agent-browser')) throw new Error('Rendering branding requires the optional agent-browser CLI.');

const root = join(import.meta.dir, '..');
const artwork = pathToFileURL(join(root, 'scripts/branding.html')).href;
const session = `dominykasia-branding-${process.pid}`;
function browser(...args: string[]) {
  const result = Bun.spawnSync(['agent-browser', '--session', session, ...args], { stdout: 'inherit', stderr: 'inherit' });
  if (result.exitCode !== 0) throw new Error(`Branding render failed: ${args[0]}`);
}
try {
  browser('open', artwork);
  browser('set', 'viewport', '1200', '630');
  browser('eval', 'Promise.all([...document.images].map(image => image.decode()))');
  browser('screenshot', join(root, 'assets/social-preview.png'));
  browser('open', `${artwork}?asset=icon`);
  browser('eval', 'document.querySelector(".icon").decode()');
  for (const [size, filename] of [[16, 'favicon-16.png'], [32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']] as const) {
    browser('set', 'viewport', String(size), String(size));
    browser('screenshot', join(root, 'assets', filename));
  }
  // ICO directory entries can contain PNG payloads, avoiding an image conversion dependency.
  const images = await Promise.all([16, 32].map(size => Bun.file(join(root, `assets/favicon-${size}.png`)).arrayBuffer()));
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((data, i) => {
    const size = [16, 32][i]!;
    const entry = 6 + i * 16;
    header[entry] = size; header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.byteLength, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.byteLength;
  });
  await Bun.write(join(root, 'favicon.ico'), Buffer.concat([header, ...images.map(data => Buffer.from(data))]));
} finally {
  browser('close');
}
