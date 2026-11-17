import { photos, isDemo } from './photos.js';
import { Deck } from './deck.js';

const $ = id => document.getElementById(id);
let saved = [];
try { const value = JSON.parse(localStorage.getItem('friendzone-favorites') || '[]'); if (Array.isArray(value)) saved = value; } catch { /* Storage may be disabled. The deck still works for this visit. */ }
const deck = new Deck(photos, saved);
let busy = false;
let toastTimeout;
const card = $('photo-card');
const image = $('card-photo');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const count = n => String(n).padStart(2, '0');


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
  $('shuffle').disabled = deck.remaining.length < 2;
  $('undo').disabled = !deck.history.length;
  $('progress-label').textContent = `${count(position)} / ${count(photos.length)}`;
  $('progress-fill').style.width = `${photos.length ? (seen / photos.length) * 100 : 100}%`;
  if (photo) {
    $('image-fallback').hidden = true;
    image.src = photo.src;
    image.alt = photo.title;
    $('photo-title').textContent = photo.title;
    $('photo-badge').hidden = !isDemo;
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
  if (busy || !deck.current) return;
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
  if (like) toast('Liked');
}
$('like').addEventListener('click', () => swipe(true));
$('pass').addEventListener('click', () => swipe(false));
$('undo').addEventListener('click', () => {
  if (busy || !deck.undo()) return;
  persist(); render(); toast('Undone');
});
function shuffle() { if (busy) return; deck.shuffle(); render(); toast('Shuffled'); }
$('shuffle').addEventListener('click', shuffle);
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
  if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); swipe(event.key === 'ArrowRight'); }
});

render();
