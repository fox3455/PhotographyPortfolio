export function exifTemplate(exif) {
  return `
    <div class="exif">
      <span class="exif-body">${exif.body ?? '—'}</span>
      <span class="exif-lens">${exif.lens ?? '—'}</span>
      <span class="exif-settings">
        <span>f/${exif.f ?? '—'}</span>
        <span>ISO ${exif.iso ?? '—'}</span>
        <span>${exif.shutter ?? '—'}</span>
      </span>
    </div>`;
}
