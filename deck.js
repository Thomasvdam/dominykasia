/** Per-visit state shared by buttons, gestures, and keyboard controls. */
export class Deck {
  constructor(photos, random = Math.random) {
    this.photos = photos;
    this.random = random;
    this.favorites = new Set();
    this.restart();
  }
  get current() { return this.photos.find(photo => photo.id === this.remaining[0]); }
  swipe(like) {
    const id = this.remaining.shift();
    if (!id) return false;
    if (like) this.favorites.add(id);
    return true;
  }
  restart() {
    this.remaining = this.photos.map(photo => photo.id);
    this.favorites.clear();
    this.shuffle();
  }
  shuffle() {
    for (let i = this.remaining.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [this.remaining[i], this.remaining[j]] = [this.remaining[j], this.remaining[i]];
    }
  }
}
