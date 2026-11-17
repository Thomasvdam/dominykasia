/** Small state model shared by buttons, gestures, and keyboard controls. */
export class Deck {
  constructor(photos, favorites = []) {
    this.photos = photos;
    this.remaining = photos.map(photo => photo.id);
    this.favorites = new Set(favorites.filter(id => this.remaining.includes(id)));
    this.history = [];
  }
  get current() { return this.photos.find(photo => photo.id === this.remaining[0]); }
  swipe(like) {
    const id = this.remaining.shift();
    if (!id) return false;
    this.history.push({ id, wasFavorite: this.favorites.has(id) });
    if (like) this.favorites.add(id);
    return true;
  }
  undo() {
    const previous = this.history.pop();
    if (!previous) return false;
    this.remaining.unshift(previous.id);
    if (!previous.wasFavorite) this.favorites.delete(previous.id);
    else this.favorites.add(previous.id);
    return true;
  }
  restart() { this.remaining = this.photos.map(photo => photo.id); this.history = []; }
  jump(id) {
    if (!this.photos.some(photo => photo.id === id)) return;
    this.remaining = [id, ...this.remaining.filter(other => other !== id)];
    this.history = [];
  }
  shuffle(random = Math.random) {
    for (let i = this.remaining.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.remaining[i], this.remaining[j]] = [this.remaining[j], this.remaining[i]];
    }
  }
}
