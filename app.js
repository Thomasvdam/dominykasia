import { photos, isDemo } from './photos.js';
import { Deck } from './deck.js';

const $ = id => document.getElementById(id);
let saved = [];
try { const value = JSON.parse(localStorage.getItem('friendzone-favorites') || '[]'); if (Array.isArray(value)) saved = value; } catch { /* Storage may be disabled. The deck still works for this visit. */ }
const deck = new Deck(photos, saved);
let busy = false;
let view = 'deck';
let toastTimeout;
const card = $('photo-card');
const image = $('card-photo');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const count = n => String(n).padStart(2, '0');
const icon = name => { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const use = document.createElementNS(svg.namespaceURI, 'use'); use.setAttribute('href', `#i-${name}`); svg.append(use); return svg; };

function toast(message) {
  clearTimeout(toastTimeout);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimeout = setTimeout(() => $('toast').classList.remove('visible'), 2400);
}
function persist() {
  try { localStorage.setItem('friendzone-favorites', JSON.stringify([...deck.favorites])); } catch { toast('Favorites are saved for this visit only.'); }
}
function updateCounts() { $('favorites-count').textContent = deck.favorites.size; }
function render() {
  const photo = deck.current;
  const seen = photos.length - deck.remaining.length;
  const position = Math.min(seen + 1, photos.length);
  card.hidden = !photo;
  $('empty-deck').hidden = !!photo;
  document.querySelectorAll('.back-card').forEach(el => { el.hidden = !photo; });
  for (const id of ['like', 'pass']) $(id).disabled = !photo;
  for (const id of ['shuffle', 'shuffle-top']) $(id).disabled = deck.remaining.length < 2;
  $('undo').disabled = !deck.history.length;
  $('progress-label').textContent = `${count(position)} / ${count(photos.length)}`;
  $('progress-fill').style.width = `${photos.length ? (seen / photos.length) * 100 : 100}%`;
  if (photo) {
    $('image-fallback').hidden = true;
    image.src = photo.src;
    image.alt = photo.title;
    $('photo-title').textContent = photo.title;
    $('photo-subtitle').textContent = photo.subtitle || 'A moment worth keeping.';
    $('photo-category').textContent = isDemo ? 'A LITTLE PREVIEW OF THE POSSIBILITIES' : 'A MOMENT FROM THE ARCHIVE';
    $('photo-badge').textContent = isDemo ? 'DEMO PHOTO' : 'THE ARCHIVE';
    $('card-number').textContent = `${count(position)} / ${count(photos.length)}`;
    const next = photos.find(item => item.id === deck.remaining[1]);
    if (next) { const preload = new Image(); preload.src = next.src; }
  }
  updateCounts();
}
image.addEventListener('error', () => { $('image-fallback').hidden = false; });
function resetCard() {
  card.style.transform = '';
  card.style.opacity = '';
  $('stamp-like').style.opacity = 0;
  $('stamp-pass').style.opacity = 0;
}
async function swipe(like) {
  if (busy || !deck.current || view !== 'deck') return;
  busy = true;
  const stamp = $(like ? 'stamp-like' : 'stamp-pass');
  stamp.style.opacity = 1;
  if (!reducedMotion.matches) {
    const direction = like ? 1 : -1;
    await card.animate([{ transform: card.style.transform || 'none', opacity: 1 }, { transform: `translateX(${direction * 400}px) rotate(${direction * 24}deg)`, opacity: 0 }], { duration: 240, easing: 'ease-in' }).finished;
  }
  deck.swipe(like);
  resetCard();
  persist();
  render();
  busy = false;
  if (like) toast('A hall of fame moment. Saved ♥');
}
$('like').addEventListener('click', () => swipe(true));
$('pass').addEventListener('click', () => swipe(false));
$('undo').addEventListener('click', () => {
  if (busy || !deck.undo()) return;
  persist(); render(); toast('Back for a second look.');
});
function shuffle() { if (busy) return; deck.shuffle(); render(); toast('Same friend. Fresh perspective.'); }
$('shuffle').addEventListener('click', shuffle);
$('shuffle-top').addEventListener('click', shuffle);
$('restart').addEventListener('click', () => { deck.restart(); render(); });

let drag = null;
card.addEventListener('pointerdown', event => {
  if (busy || !deck.current || event.button !== 0) return;
  drag = { x: event.clientX, y: event.clientY, dx: 0 };
  card.setPointerCapture(event.pointerId);
});
card.addEventListener('pointermove', event => {
  if (!drag) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (Math.abs(dy) > Math.abs(dx) + 20) { drag = null; resetCard(); return; }
  drag.dx = dx;
  card.style.transform = `translateX(${dx}px) rotate(${dx / 22}deg)`;
  $('stamp-like').style.opacity = Math.min(Math.max(dx / 100, 0), 1);
  $('stamp-pass').style.opacity = Math.min(Math.max(-dx / 100, 0), 1);
});
function endDrag() {
  if (!drag) return;
  const dx = drag.dx;
  drag = null;
  if (Math.abs(dx) > 75) swipe(dx > 0);
  else resetCard();
}
card.addEventListener('pointerup', endDrag);
card.addEventListener('pointercancel', () => { drag = null; resetCard(); });
card.addEventListener('lostpointercapture', () => { if (drag) { drag = null; resetCard(); } });
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || view !== 'deck' || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); swipe(event.key === 'ArrowRight'); }
});

function showView(next) {
  if (busy) return;
  view = next;
  const favoriteView = view === 'favorites';
  $('deck-view').hidden = favoriteView;
  $('archive').hidden = favoriteView;
  $('favorites-view').hidden = !favoriteView;
  $('deck-tab').classList.toggle('active', !favoriteView);
  $('favorites-tab').classList.toggle('active', favoriteView);
  for (const [id, active] of [['deck-tab', !favoriteView], ['favorites-tab', favoriteView]]) {
    if (active) $(id).setAttribute('aria-current', 'page');
    else $(id).removeAttribute('aria-current');
  }
  if (favoriteView) renderFavorites();
}
$('deck-tab').addEventListener('click', () => showView('deck'));
$('favorites-tab').addEventListener('click', () => showView('favorites'));
$('see-favorites').addEventListener('click', () => showView('favorites'));
$('back-to-deck').addEventListener('click', () => showView('deck'));

function renderFavorites() {
  const grid = $('favorites-grid');
  grid.replaceChildren();
  const favorites = photos.filter(photo => deck.favorites.has(photo.id));
  $('favorites-empty').hidden = !!favorites.length;
  for (const photo of favorites) {
    const item = document.createElement('article'); item.className = 'favorite-item';
    const img = document.createElement('img'); img.src = photo.src; img.alt = photo.title; img.loading = 'lazy';
    const title = document.createElement('h3'); title.textContent = photo.title;
    const remove = document.createElement('button'); remove.className = 'remove-favorite'; remove.setAttribute('aria-label', `Remove ${photo.title} from favorites`); remove.append(icon('close'));
    remove.addEventListener('click', () => {
      const index = [...grid.children].indexOf(item);
      deck.favorites.delete(photo.id); persist(); updateCounts(); renderFavorites();
      const buttons = grid.querySelectorAll('button');
      (buttons[Math.min(index, buttons.length - 1)] || $('back-to-deck')).focus();
      toast('Removed from favorites.');
    });
    item.append(img, title, remove); grid.append(item);
  }
}
function thumbnail(photo, index) {
  const button = document.createElement('button'); button.className = 'archive-item'; button.setAttribute('aria-label', `View ${photo.title}`);
  const img = document.createElement('img'); img.src = photo.src; img.alt = ''; img.loading = 'lazy';
  const label = document.createElement('span'); label.textContent = `${count(index + 1)} — ${photo.title}`;
  button.append(img, label);
  button.addEventListener('click', () => {
    if (busy) return;
    if ($('gallery-dialog').open) $('gallery-dialog').close();
    deck.jump(photo.id); showView('deck'); resetCard(); render();
    card.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    card.focus({ preventScroll: true });
  });
  return button;
}
photos.slice(0, 6).forEach((photo, i) => $('archive-grid').append(thumbnail(photo, i)));
$('archive-count').textContent = `${photos.length} moments & counting`;
$('view-all').addEventListener('click', () => {
  $('gallery-grid').replaceChildren(...photos.map(thumbnail));
  $('gallery-dialog').showModal();
});
document.querySelectorAll('[data-help]').forEach(button => button.addEventListener('click', () => $('help-dialog').showModal()));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));
render();
