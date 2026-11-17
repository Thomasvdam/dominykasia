import { test, expect } from 'bun:test';
import { createCaption } from './captions.js';

test('caption generation handles the lowest and highest random selections', () => {
  for (const value of [0, 1 - Number.EPSILON]) {
    const caption = createCaption(() => value);
    expect(caption.title).toMatch(/^The .+ .+$/);
    expect(caption.blurb.endsWith('.')).toBe(true);
    expect(`${caption.title} ${caption.blurb}`).not.toMatch(/undefined|NaN|\[object/);
  }
});

test('repeated card appearances can receive varied, compact anime titles and blurbs', () => {
  let seed = 42;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const titles = new Set();
  const blurbs = new Set();
  for (let i = 0; i < 500; i++) {
    const caption = createCaption(random);
    titles.add(caption.title);
    blurbs.add(caption.blurb);
    expect(caption.title.length).toBeLessThan(50);
    expect(caption.blurb.length).toBeLessThan(150);
    expect(`${caption.title} ${caption.blurb}`).not.toMatch(/undefined|NaN|[<>]/);
  }
  expect(titles.size).toBeGreaterThan(100);
  expect(blurbs.size).toBeGreaterThan(200);
});
