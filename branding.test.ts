import { test, expect } from 'bun:test';
import { join } from 'node:path';

const root = import.meta.dir;

test('social crawlers can discover canonical metadata and the actual preview image without JavaScript', async () => {
  const meta = new Map<string, string>();
  const links = new Map<string, string>();
  await new HTMLRewriter()
    .on('meta', { element(element) {
      const key = element.getAttribute('property') || element.getAttribute('name');
      if (key) meta.set(key, element.getAttribute('content') || '');
    } })
    .on('link', { element(element) {
      const rel = element.getAttribute('rel');
      if (rel) links.set(rel, element.getAttribute('href') || '');
    } })
    .transform(new Response(await Bun.file(join(root, 'index.html')).text())).text();
  expect(links.get('canonical')).toBe('https://dominyk.asia/');
  expect(meta.get('og:url')).toBe(links.get('canonical'));
  expect(meta.get('og:type')).toBe('website');
  expect(meta.get('og:title')).toBe(meta.get('twitter:title'));
  expect(meta.get('og:description')).toBe(meta.get('description'));
  expect(meta.get('twitter:description')).toBe(meta.get('description'));
  expect(meta.get('twitter:card')).toBe('summary_large_image');
  expect(meta.get('og:image')).toBe(meta.get('twitter:image'));
  expect(meta.get('og:image:alt')).toBeTruthy();
  const image = new URL(meta.get('og:image')!);
  expect(image.origin).toBe('https://dominyk.asia');
  const bytes = Buffer.from(await Bun.file(join(root, image.pathname)).arrayBuffer());
  expect(bytes.subarray(1, 4).toString()).toBe('PNG');
  expect(bytes.readUInt32BE(16)).toBe(Number(meta.get('og:image:width')));
  expect(bytes.readUInt32BE(20)).toBe(Number(meta.get('og:image:height')));
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 630]);
  expect(bytes.length).toBeLessThan(5_000_000);
});

test('favicon and touch icons contain the advertised pixel sizes', async () => {
  for (const [filename, size] of [['favicon-16.png', 16], ['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]] as const) {
    const bytes = Buffer.from(await Bun.file(join(root, 'assets', filename)).arrayBuffer());
    expect(bytes.subarray(1, 4).toString()).toBe('PNG');
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], filename).toEqual([size, size]);
  }
  const ico = Buffer.from(await Bun.file(join(root, 'favicon.ico')).arrayBuffer());
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBe(2);
  expect([ico[6], ico[22]]).toEqual([16, 32]);
});

test('manifest icons resolve to existing local assets', async () => {
  const manifest = await Bun.file(join(root, 'site.webmanifest')).json();
  expect(manifest.name).toBe('Dominykasia');
  for (const icon of manifest.icons) {
    expect(await Bun.file(join(root, icon.src)).exists()).toBe(true);
  }
});
