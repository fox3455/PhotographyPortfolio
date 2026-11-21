// ---------------------------------------------------------------------------
// Shared page UI: mobile nav toggle, scroll-reveal, footer year.
// Used on every page.
// ---------------------------------------------------------------------------

export function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  // One place sets both the visual state (.open) and the state screen
  // readers hear (aria-expanded), so the two can never disagree.
  const setOpen = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));

  // Escape closes the menu and puts focus back on the button.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Clicking anywhere outside the header closes the menu.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav')) setOpen(false);
  });
}

// Adds .in-view to each .reveal element the first time it scrolls into view.
export function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  // Turns on the hidden-until-revealed CSS only now that JS is running.
  document.documentElement.classList.add('js-reveal');
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

export function setYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}
