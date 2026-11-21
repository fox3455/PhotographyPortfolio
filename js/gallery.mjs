// ---------------------------------------------------------------------------
// Gallery page: renders the photo grid from data.mjs, wires up the event
// filters (synced with ?event= in the URL), and the lightbox viewer.
// ---------------------------------------------------------------------------

import { PHOTOS, CATEGORIES } from './data.mjs';
import { getExif } from './exif.mjs';
import { exifTemplate } from './exifTemplate.mjs';

export function initGallery() {
  const grid = document.querySelector('[data-gallery-grid]');
  if (!grid) return;
  renderGrid(grid);
  initFilters(grid);
  initLightbox(grid);
}

// Splits "HCS Charlotte, 2023 — SuperCC closeup" into
// { title: "SuperCC closeup", sub: "HCS Charlotte, 2023" } to match the carousel.
function splitCaption(caption) {
  const [sub, title] = caption.split(' — ');
  return title ? { title, sub } : { title: caption, sub: '' };
}

function renderGrid(grid) {
  grid.innerHTML = PHOTOS.map((p, i) => {
    const { title, sub } = splitCaption(p.caption);
    return `
    <figure class="gallery-item reveal" data-category="${p.category}" data-index="${i}">
      <button class="gallery-open" type="button">
        <img src="images/gallery/${p.file}" alt="${title}" loading="lazy">
      </button>
      <figcaption>
        <div class="cap-title">${title}</div>
        <div class="cap-sub">${sub}</div>
      </figcaption>
    </figure>`;
  }).join('');
  // Tiles stay clean (no EXIF overlay); EXIF is shown in the lightbox.

  // Safety net: if a listed file is missing (e.g. a filename typo), hide its
  // tile rather than showing a broken image.
  grid.querySelectorAll('.gallery-item img').forEach((img) => {
    img.addEventListener('error', () => img.closest('.gallery-item')?.remove());
  });
}

// Builds "All" plus one button per category that has at least one photo,
// so empty categories (e.g. DreamHack before any photos are added) are hidden.
// Returns the list of categories that got a button.
function renderFilters(filterBar) {
  const used = Object.keys(CATEGORIES).filter((cat) =>
    PHOTOS.some((p) => p.category === cat)
  );
  filterBar.innerHTML = [
    '<button class="filter-btn" type="button" data-filter="all">All</button>',
    ...used.map((cat) =>
      `<button class="filter-btn" type="button" data-filter="${cat}">${CATEGORIES[cat]}</button>`
    ),
  ].join('');
  return used;
}

function initFilters(grid) {
  const filterBar = document.querySelector('[data-filters]');
  if (!filterBar) return;
  const available = renderFilters(filterBar);

  const applyFilter = (cat) => {
    filterBar.querySelectorAll('.filter-btn').forEach((b) => {
      const isActive = b.dataset.filter === cat;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive);
    });
    grid.querySelectorAll('.gallery-item').forEach((item) => {
      item.style.display = cat === 'all' || item.dataset.category === cat ? '' : 'none';
    });
  };

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const cat = btn.dataset.filter;
    applyFilter(cat);

    // Keep the URL in sync so the filtered view can be bookmarked/shared.
    const url = new URL(location.href);
    if (cat === 'all') url.searchParams.delete('event');
    else url.searchParams.set('event', cat);
    history.replaceState(null, '', url);
  });

  // Read ?event=... from the URL (e.g. links from the home page cards).
  // Unknown, empty, or missing values fall back to "all".
  const requested = new URLSearchParams(location.search).get('event');
  applyFilter(available.includes(requested) ? requested : 'all');
}

function initLightbox(grid) {
  const lightbox = document.querySelector('[data-lightbox]');
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector('img');
  const lightboxTitle = lightbox.querySelector('.cap-title');
  const lightboxSub = lightbox.querySelector('.cap-sub');
  const lightboxExif = lightbox.querySelector('[data-lightbox-exif]');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  let opener = null; // the tile button that opened the lightbox, to return focus to

  grid.addEventListener('click', async (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item || item.classList.contains('img-missing')) return;
    const photo = PHOTOS[Number(item.dataset.index)];
    const { title, sub } = splitCaption(photo.caption);

    lightboxImg.src = `images/gallery/${photo.file}`;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxSub.textContent = sub;
    lightboxExif.innerHTML = '';

    opener = e.target.closest('button');
    lightbox.classList.add('open');
    closeBtn.focus();

    // Load EXIF after opening so the photo appears immediately.
    const src = lightboxImg.src;
    const exif = await getExif(src);
    // Only render if the same photo is still open (user may have moved on).
    if (exif && lightboxImg.src === src && lightbox.classList.contains('open')) {
      lightboxExif.innerHTML = exifTemplate(exif);
    }
  });

  function close() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    opener?.focus();
  }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
