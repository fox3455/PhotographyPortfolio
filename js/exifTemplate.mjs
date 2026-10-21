export function exifTemplate(exif) {
  return `
    <div class="exif">
      <span>${exif.body ?? '—'}</span>
      <span>${exif.lens ?? '—'}</span>
      <span>f/${exif.f ?? '—'}</span>
      <span>ISO ${exif.iso ?? '—'}</span>
      <span>${exif.shutter ?? '—'}</span>
    </div>`;
}