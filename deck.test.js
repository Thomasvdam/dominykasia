import { test, expect } from 'bun:test';
import { Deck } from './deck.js';
const photos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

test('a new deck shuffles all photos without changing the original catalog', () => {
  const deck = new Deck(photos, () => 0);
  expect(deck.remaining).toEqual(['b', 'c', 'a']);
  expect(photos.map(photo => photo.id)).toEqual(['a', 'b', 'c']);
  expect(new Set(deck.remaining).size).toBe(photos.length);
});

test('each photo is visited once and only likes are counted', () => {
  const deck = new Deck(photos, () => 0);
  const visited = [];
  for (let i = 0; i < photos.length; i++) {
    visited.push(deck.current.id);
    deck.swipe(i === 0);
  }
  expect(visited.sort()).toEqual(['a', 'b', 'c']);
  expect([...deck.favorites]).toEqual(['b']);
  expect(deck.current).toBeUndefined();
  expect(deck.swipe(true)).toBe(false);
});

test('a reload or restart begins a full shuffled round with no saved progress or likes', () => {
  const deck = new Deck(photos, () => 0);
  deck.swipe(true);
  const fresh = new Deck(photos, () => 0);
  expect(fresh.remaining).toEqual(['b', 'c', 'a']);
  expect(fresh.favorites.size).toBe(0);
  deck.restart();
  expect(deck.remaining).toEqual(fresh.remaining);
  expect(deck.favorites.size).toBe(0);
});

test('empty and single-photo decks can be exhausted and restarted', () => {
  const empty = new Deck([]);
  expect(empty.current).toBeUndefined();
  expect(empty.swipe(true)).toBe(false);
  empty.restart();
  expect(empty.remaining).toEqual([]);
  const single = new Deck([{ id: 'one' }]);
  expect(single.current.id).toBe('one');
  single.swipe(false);
  expect(single.current).toBeUndefined();
  single.restart();
  expect(single.current.id).toBe('one');
});
