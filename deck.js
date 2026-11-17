/** Per-visit state shared by buttons, gestures, and keyboard controls. */
export class Deck {
  constructor(photos, random = Math.random) {
    this.photos = photos;
    this.random = random;
    this.favorites = new Set();
    this.refill();
  }
  get current() { return this.photos.find(photo => photo.id === this.remaining[0]); }
  swipe(like) {
    const id = this.remaining.shift();
    if (!id) return false;
    if (like) this.favorites.add(id);
    if (!this.remaining.length) this.refill(id);
    return true;
  }
  refill(previousId) {
    this.remaining = this.photos.map(photo => photo.id);
    for (let i = this.remaining.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [this.remaining[i], this.remaining[j]] = [this.remaining[j], this.remaining[i]];
    }
    // Keep the loop boundary feeling like a new photo whenever possible.
    if (this.remaining.length > 1 && this.remaining[0] === previousId) {
      [this.remaining[0], this.remaining[1]] = [this.remaining[1], this.remaining[0]];
    }
  }
}
