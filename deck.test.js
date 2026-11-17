import { test, expect } from 'bun:test';
import { Deck } from './deck.js';
const photos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

test('a new deck shuffles all photos without changing the original catalog', () => {
  const deck = new Deck(photos, () => 0);
  expect(deck.remaining).toEqual(['b', 'c', 'a']);
  expect(photos.map(photo => photo.id)).toEqual(['a', 'b', 'c']);
});

test('the deck automatically repeats complete cycles without losing photos or likes', () => {
  const deck = new Deck(photos, () => 0);
  for (let round = 0; round < 3; round++) {
    const visited = [];
    for (let i = 0; i < photos.length; i++) {
      visited.push(deck.current.id);
      expect(deck.swipe(i === 0)).toBe(true);
    }
    expect(visited.sort()).toEqual(['a', 'b', 'c']);
    expect(deck.remaining.length).toBe(photos.length);
    expect([...deck.favorites]).toEqual(['b']);
    expect(deck.current).toBeDefined();
  }
});

test('a new visit starts with the full deck and no saved likes', () => {
  const deck = new Deck(photos, () => 0);
  deck.swipe(true);
  const fresh = new Deck(photos, () => 0);
  expect(fresh.remaining).toEqual(['b', 'c', 'a']);
  expect(fresh.favorites.size).toBe(0);
});

test('a new cycle avoids immediately repeating the previous photo when possible', () => {
  let calls = 0;
  const deck = new Deck(photos.slice(0, 2), () => calls++ === 0 ? 0 : 0.99);
  deck.swipe(false);
  const last = deck.current.id;
  deck.swipe(false);
  expect(deck.current.id).not.toBe(last);
  expect([...deck.remaining].sort()).toEqual(['a', 'b']);
});

test('single-photo decks keep repeating and empty decks remain safe', () => {
  const empty = new Deck([]);
  expect(empty.current).toBeUndefined();
  expect(empty.swipe(true)).toBe(false);
  const single = new Deck([{ id: 'one' }]);
  for (let i = 0; i < 3; i++) {
    expect(single.current.id).toBe('one');
    expect(single.swipe(true)).toBe(true);
  }
  expect([...single.favorites]).toEqual(['one']);
});
