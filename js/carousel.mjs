// ---------------------------------------------------------------------------
// Featured carousel (home page): arrows, dots, autoplay, touch swipe.
// ---------------------------------------------------------------------------

import { addExifOverlays } from './exif.mjs';

export function initCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  addExifOverlays(root);

  const track = root.querySelector('.carousel-track');
  const slides = Array.from(root.querySelectorAll('.carousel-slide'));
  const dotsWrap = root.querySelector('.carousel-dots');
  const prevBtn = root.querySelector('.carousel-arrow.prev');
  const nextBtn = root.querySelector('.carousel-arrow.next');
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
    resetTimer();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 5500);
  }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', resetTimer);

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
  });

  render();
  resetTimer();
}
