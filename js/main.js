// ---------------------------------------------------------------------------
// Shared behavior: nav toggle, missing-image placeholders, scroll reveal.
// Carousel and gallery-specific logic live in their own init functions below,
// called only when the relevant markup exists on the page.
// ---------------------------------------------------------------------------

import { renderCameraInfo } from './cameraTemplate.mjs';
import {exifTemplate} from './exifTemplate.mjs';
import exifr from 'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.esm.mjs';
import { initContactForm } from './formspreeTemplate.mjs';

/** Called via onerror="" on every <img> in a gallery-item/carousel-slide. */

function handleImgError(img) {
  const wrapper = img.closest('.gallery-item, .carousel-slide');
  if (!wrapper || wrapper.classList.contains('img-missing')) return;
  wrapper.classList.add('img-missing');

  const filename = img.getAttribute('src').split('/').pop();
  const placeholder = document.createElement('div');
  placeholder.className = 'missing-placeholder';
  placeholder.innerHTML = `
    <span class="icon"></span>
    <span class="filename">${filename}</span>
  `;
  wrapper.prepend(placeholder);
}
window.handleImgError = handleImgError;

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => observer.observe(el));
}

// ---------------------------------------------------------------------------
// Featured carousel (home page)
// ---------------------------------------------------------------------------

function initCarousel() {
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

// ---------------------------------------------------------------------------
// Gallery grid + filters + lightbox (gallery page)
// ---------------------------------------------------------------------------

function initGallery() {
  const grid = document.querySelector('[data-gallery-grid]');
  if (!grid || typeof PHOTOS === 'undefined') return;

  grid.innerHTML = PHOTOS.map(
    (p, i) => `
    <figure class="gallery-item reveal" data-category="${p.category}" data-index="${i}">
      <img src="images/gallery/${p.file}" alt="${p.caption}" loading="lazy" onerror="handleImgError(this)">
      <figcaption>${p.caption}</figcaption>
    </figure>
  `
  ).join('');

  addExifOverlays(grid);
  initScrollReveal();

  // Filters
  const filterBar = document.querySelector('[data-filters]');
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      grid.querySelectorAll('.gallery-item').forEach((item) => {
        item.style.display = cat === 'all' || item.dataset.category === cat ? '' : 'none';
      });
    });
  }

  // Lightbox
  const lightbox = document.querySelector('[data-lightbox]');
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item || item.classList.contains('img-missing')) return;
    const i = Number(item.dataset.index);
    lightboxImg.src = `images/gallery/${PHOTOS[i].file}`;
    lightboxImg.alt = PHOTOS[i].caption;
    lightboxCaption.textContent = PHOTOS[i].caption;
    lightbox.classList.add('open');
  });

  function close() { lightbox.classList.remove('open'); }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

///-------------------------------------
/// exif data extraction for gallery images
///-------------------------------------

const CAMERA_NAMES = { 'ILCE-7M3': 'Sony A7 III', 'ILCE-7CM2': 'Sony A7C II', 'Apple iPhone 16 Pro Max': 'iPhone 16 Pro Max' };
const LENS_NAMES = { 'FE 35mm F1.8': 'FE 35mm f/1.8', 'Main Camera 6.765mm': 'Main camera 6.765mm', 'iPhone 16 Pro Max back triple camera 6.765mm f/1.78': 'Main camera 6.765mm' };

function formatShutter(t) {
  return t < 1 ? `1/${Math.round(1 / t)}` : `${t}s`;
}

function toExif(data) {
  return {
      body: CAMERA_NAMES[data.Model] ?? data.Model,
      lens: LENS_NAMES[data.LensModel] ?? data.LensModel,
      f: data.FNumber && Math.round(data.FNumber * 100) / 100, // 1.7799… → 1.78
      iso: data.ISO,
      shutter: data.ExposureTime && formatShutter(data.ExposureTime),
  };
}

async function addExifOverlays(root) {
    const imgs = root.querySelectorAll('.gallery-item img, .carousel-slide img');
    await Promise.all([...imgs].map(async (img) => {
      try {
        const data = await exifr.parse(img.src, ['Model', 'LensModel', 'FNumber', 'ISO', 'ExposureTime']);
        if (!data) return;
        const frame = document.createElement('div');
        frame.className = 'photo-frame';
        img.before(frame);
        frame.append(img);
        frame.insertAdjacentHTML('beforeend', exifTemplate(toExif(data)));
      } catch (err) {
        console.error(`EXIF failed for ${img.src}`, err);
      }
    }));
  }

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initCarousel();
  initGallery();
  initScrollReveal();
  renderCameraInfo(['a7C II', 'Alpha A7 III'], 'Event lighting');
  initContactForm();
});
