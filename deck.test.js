import { test, expect } from 'bun:test';
import { Deck } from './deck.js';
const photos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
test('a like adds a favorite, and undo restores the photo and previous favorite state', () => {
  const deck = new Deck(photos);
  deck.swipe(true);
  expect(deck.current.id).toBe('b');
  expect([...deck.favorites]).toEqual(['a']);
  deck.undo();
  expect(deck.current.id).toBe('a');
  expect(deck.favorites.size).toBe(0);
});
test('passing and undo preserve existing favorites', () => {
  const deck = new Deck(photos, ['a', 'stale-id']);
  deck.swipe(false); deck.undo();
  expect([...deck.favorites]).toEqual(['a']);
});
test('end of deck, restart, shuffle, and jump do not duplicate or lose photos', () => {
  const deck = new Deck(photos);
  for (let i = 0; i < 3; i++) deck.swipe(false);
  expect(deck.current).toBeUndefined();
  expect(deck.swipe(true)).toBe(false);
  deck.undo(); expect(deck.current.id).toBe('c');
  deck.restart(); deck.shuffle(() => 0); deck.jump('b');
  expect(deck.current.id).toBe('b');
  expect([...deck.remaining].sort()).toEqual(['a', 'b', 'c']);
  deck.jump('b'); expect(deck.remaining.length).toBe(3);
});

test('jumping to a previously swiped photo begins fresh undo history', () => {
  const deck = new Deck(photos);
  deck.swipe(true); deck.jump('a');
  expect(deck.undo()).toBe(false);
  expect(deck.remaining).toEqual(['a', 'b', 'c']);
  deck.swipe(false); deck.undo();
  expect(deck.remaining).toEqual(['a', 'b', 'c']);
  expect([...deck.favorites]).toEqual(['a']);
});
