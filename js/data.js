// ---------------------------------------------------------------------------
// Gallery data. Add a new photo by adding one line here — the gallery page
// renders this list automatically. `file` must match a real filename you
// drop into images/gallery/. Until it exists, a placeholder card shows the
// expected filename so you know exactly what's missing.
// ---------------------------------------------------------------------------

const CATEGORIES = {
  hcs: 'Halo Championship Series',
  comiccon: 'Comic-Con',
  dreamhack: 'DreamHack',
};

const PHOTOS = [
  { file: 'hcs-01.jpg', category: 'hcs', caption: 'HCS [Event Name, Year] — Grand Finals' },
  { file: 'hcs-02.jpg', category: 'hcs', caption: 'HCS [Event Name, Year] — Crowd reaction' },
  { file: 'hcs-03.jpg', category: 'hcs', caption: 'HCS [Event Name, Year] — Player closeup' },
  { file: 'hcs-04.jpg', category: 'hcs', caption: 'HCS [Event Name, Year] — Stage wide shot' },
  { file: 'hcs-05.jpg', category: 'hcs', caption: 'HCS [Event Name, Year] — Trophy moment' },
  { file: 'hcs-06.jpg', category: 'hcs', caption: 'HCS [Event Name, Year] — Team huddle' },

  { file: 'comiccon-01.jpg', category: 'comiccon', caption: 'Comic-Con [City, Year] — Cosplay portrait' },
  { file: 'comiccon-02.jpg', category: 'comiccon', caption: 'Comic-Con [City, Year] — Show floor' },
  { file: 'comiccon-03.jpg', category: 'comiccon', caption: 'Comic-Con [City, Year] — Panel candid' },
  { file: 'comiccon-04.jpg', category: 'comiccon', caption: 'Comic-Con [City, Year] — Group cosplay' },
  { file: 'comiccon-05.jpg', category: 'comiccon', caption: 'Comic-Con [City, Year] — Artist alley' },
  { file: 'comiccon-06.jpg', category: 'comiccon', caption: 'Comic-Con [City, Year] — Detail shot' },

  { file: 'dreamhack-01.jpg', category: 'dreamhack', caption: 'DreamHack [City, Year] — Arena overview' },
  { file: 'dreamhack-02.jpg', category: 'dreamhack', caption: 'DreamHack [City, Year] — Booth setup' },
  { file: 'dreamhack-03.jpg', category: 'dreamhack', caption: 'DreamHack [City, Year] — Match point' },
  { file: 'dreamhack-04.jpg', category: 'dreamhack', caption: 'DreamHack [City, Year] — LAN floor' },
  { file: 'dreamhack-05.jpg', category: 'dreamhack', caption: 'DreamHack [City, Year] — Cosplay/community' },
  { file: 'dreamhack-06.jpg', category: 'dreamhack', caption: 'DreamHack [City, Year] — Award ceremony' },
];
