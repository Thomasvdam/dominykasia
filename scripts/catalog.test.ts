import { test, expect } from 'bun:test';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { catalog } from './catalog';

test('catalog handles spaces and special characters safely and excludes non-images', async () => {
  const root = await mkdtemp(join(tmpdir(), 'friendzone-'));
  try {
    await mkdir(join(root, 'photos'));
    await Bun.write(join(root, 'photos', 'a-friend #1.JPG'), 'image');
    await Bun.write(join(root, 'photos', 'notes.txt'), 'not an image');
    await Bun.write(join(root, 'photos', 'z_good-day.webp'), 'image');
    const source = await catalog(root);
    expect(source).toContain('isDemo = false');
    expect(source).toContain('./photos/a-friend%20%231.JPG');
    expect(source).toContain('A friend #1');
    expect(source).not.toContain('notes.txt');
    expect(source.indexOf('a-friend')).toBeLessThan(source.indexOf('z_good'));
  } finally { await rm(root, { recursive: true, force: true }); }
});
test('an empty photo directory uses the demo catalog', async () => {
  const root = await mkdtemp(join(tmpdir(), 'friendzone-'));
  try {
    await mkdir(join(root, 'photos'));
    await Bun.write(join(root, 'photos.js'), 'demo catalog');
    expect(await catalog(root)).toBe('demo catalog');
  } finally { await rm(root, { recursive: true, force: true }); }
});
