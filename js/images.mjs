// ---------------------------------------------------------------------------
// Missing-image placeholders. If a gallery tile or carousel image fails to
// load, show a placeholder card with the expected filename instead.
// ---------------------------------------------------------------------------

const IMG_SELECTOR = '.gallery-item img, .carousel-slide img';

export function handleImgError(img) {
  const wrapper = img.closest('.gallery-item, .carousel-slide');
  if (!wrapper || wrapper.classList.contains('img-missing')) return;
  wrapper.classList.add('img-missing');
  wrapper.querySelector('.gallery-open')?.setAttribute('disabled', '');

  const filename = img.getAttribute('src').split('/').pop();
  const placeholder = document.createElement('div');
  placeholder.className = 'missing-placeholder';
  placeholder.innerHTML = `
    <span class="icon"></span>
    <span class="filename">${filename}</span>
  `;
  wrapper.prepend(placeholder);
}

// Attach the error handler to every gallery/carousel image inside `root`.
// Module scripts run after the HTML is parsed, so an image may have already
// failed before we get here — those are handled immediately.
export function initImageFallbacks(root = document) {
  root.querySelectorAll(IMG_SELECTOR).forEach((img) => {
    img.addEventListener('error', () => handleImgError(img));
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      handleImgError(img);
    }
  });
}
