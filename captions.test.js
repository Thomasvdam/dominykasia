import { test, expect } from 'bun:test';
import { createCaptionGenerator, captionSegmentSizes } from './captions.js';

function seededRandom(seed = 42) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test('caption generation handles the lowest and highest random selections', () => {
  for (const value of [0, 1 - Number.EPSILON]) {
    const generate = createCaptionGenerator(() => value);
    for (let i = 0; i < 80; i++) {
      const caption = generate();
      expect(caption.title.length).toBeGreaterThan(10);
      expect(caption.blurb.length).toBeGreaterThan(20);
      expect(`${caption.title} ${caption.blurb}`).not.toMatch(/undefined|NaN|\[object/);
    }
  }
});

test('a long visit produces varied, compact titles and descriptions', () => {
  const generate = createCaptionGenerator(seededRandom());
  const titles = new Set();
  const blurbs = new Set();
  let longestTitle = '';
  let longestBlurb = '';
  for (let i = 0; i < 1000; i++) {
    const caption = generate();
    titles.add(caption.title);
    blurbs.add(caption.blurb);
    if (caption.title.length > longestTitle.length) longestTitle = caption.title;
    if (caption.blurb.length > longestBlurb.length) longestBlurb = caption.blurb;
    expect(`${caption.title} ${caption.blurb}`).not.toMatch(/undefined|NaN|[<>]/);
  }
  expect(longestTitle.length, longestTitle).toBeLessThan(65);
  expect(longestBlurb.length, longestBlurb).toBeLessThan(180);
  expect(titles.size).toBeGreaterThan(950);
  expect(blurbs.size).toBeGreaterThan(990);
});

test('an initial run rotates through distinct narrative formats instead of repeating the same opening', () => {
  const generate = createCaptionGenerator(seededRandom(17));
  const samples = Array.from({ length: 29 }, () => generate());
  expect(samples.filter(c => c.title.startsWith('The ')).length).toBeLessThan(4);
  expect(samples.some(c => c.title.startsWith('Episode '))).toBe(true);
  expect(samples.some(c => c.title.startsWith('Final Form: '))).toBe(true);
  expect(samples.some(c => c.title.startsWith('Reborn as '))).toBe(true);
  const openings = new Set(samples.map(c => c.blurb.split(' ').slice(0, 2).join(' ')));
  expect(openings.size).toBeGreaterThan(23);
});

test('recent exact captions do not repeat during normal seeded use', () => {
  const generate = createCaptionGenerator(seededRandom(91));
  const recent = [];
  for (let i = 0; i < 300; i++) {
    const caption = generate();
    expect(recent.some(c => c.title === caption.title)).toBe(false);
    expect(recent.some(c => c.blurb === caption.blurb)).toBe(false);
    recent.push(caption);
    if (recent.length > 100) recent.shift();
  }
});


test('every vocabulary and template segment has a distinct odd length', () => {
  const lengths = Object.values(captionSegmentSizes);
  expect(new Set(lengths).size).toBe(lengths.length);
  for (const [segment, length] of Object.entries(captionSegmentSizes)) {
    expect(length % 2, segment).toBe(1);
  }
});
