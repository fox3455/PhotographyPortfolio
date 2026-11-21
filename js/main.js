// ---------------------------------------------------------------------------
// Entry point. Each feature lives in its own module; this file only starts
// them. Every init function checks for its own markup and does nothing on
// pages that don't have it, so the same script works on all three pages.
// ---------------------------------------------------------------------------

import { initNavToggle, initScrollReveal, setYear } from './ui.mjs';
import { initImageFallbacks } from './images.mjs';
import { initCarousel } from './carousel.mjs';
import { initGallery } from './gallery.mjs';
import { renderCameraInfo } from './cameraTemplate.mjs';
import { initContactForm } from './formspreeTemplate.mjs';

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initNavToggle();
  initImageFallbacks();
  initCarousel();
  initGallery();      // renders the gallery tiles first…
  initScrollReveal(); // …so reveal can observe them (runs once per page)
  renderCameraInfo(['a7C II', 'Alpha A7 III'], 'Event lighting');
  initContactForm();
});
