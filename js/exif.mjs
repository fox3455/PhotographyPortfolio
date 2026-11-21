// ---------------------------------------------------------------------------
// EXIF extraction: reads camera settings embedded in each JPEG and turns
// them into friendly display values.
// ---------------------------------------------------------------------------

import exifr from 'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.esm.mjs';
import { exifTemplate } from './exifTemplate.mjs';

// Raw EXIF names → names shown on the site.
const CAMERA_NAMES = { 'ILCE-7M3': 'Sony A7 III', 'ILCE-7CM2': 'Sony A7C II', 'SONY ILCE-7CM2': 'Sony A7C II', 'Apple iPhone 16 Pro Max': 'iPhone 16 Pro Max' };
const LENS_NAMES = { 'FE 35mm F1.8': 'FE 35mm f/1.8', 'FE 28mm F2': 'FE 28mm f/2', 'Main Camera 6.765mm': 'Main camera 6.765mm', 'iPhone 16 Pro Max back triple camera 6.765mm f/1.78': 'Main camera 6.765mm' };

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

// Each image's EXIF is parsed at most once; repeat calls reuse the same promise.
const exifCache = new Map();
export function getExif(src) {
  if (!exifCache.has(src)) {
    const job = exifr
      .parse(src, ['Model', 'LensModel', 'FNumber', 'ISO', 'ExposureTime'])
      .then((data) => (data ? toExif(data) : null))
      .catch((err) => {
        console.error(`EXIF failed for ${src}`, err);
        return null;
      });
    exifCache.set(src, job);
  }
  return exifCache.get(src);
}

// Wraps each image inside `root` in a .photo-frame with an EXIF overlay.
export async function addExifOverlays(root) {
  const imgs = root.querySelectorAll('.gallery-item img, .carousel-slide img');
  await Promise.all([...imgs].map(async (img) => {
    try {
      const exif = await getExif(img.src);
      if (!exif) return;
      const frame = document.createElement('div');
      frame.className = 'photo-frame';
      img.before(frame);
      frame.append(img);
      frame.insertAdjacentHTML('beforeend', exifTemplate(exif));
    } catch (err) {
      console.error(`EXIF failed for ${img.src}`, err);
    }
  }));
}
