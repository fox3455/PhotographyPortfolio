// ---------------------------------------------------------------------------
// Shared behavior: camera spec functions
// Camera spec specific logic live in their own init functions below
// ---------------------------------------------------------------------------

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

async function getCameraSpecs(cameraNames) {
  const cameraData = await getJSON('data/camera_data.json');
  return cameraNames
    .map(name => {
      const match = cameraData.find(c => c.Model === name);
      if (!match) console.warn(`No camera found with Model "${name}"`);
      return match;
    })
    .filter(Boolean);
}

async function getLenses() {
  return getJSON('data/lens_data.json');
}

function bodyTemplate(info) {
    return `
        <li><span>Camera bodies: </span><span>${info.Brand} ${info.Model}</span></li>
        <li><span>Year: </span><span>${info.Year ?? '—'}</span></li>
        <li><span>Sensor: </span><span>${info['Sensor type'] ?? '—'}</span></li>
        <li><span>Megapixels: </span><span>${info['Total megapixels'] ?? '—'}</span></li>`;
}

export function cameraInfoTemplate(bodies, lenses, lighting) {
    const bodyInfo = bodies.map(bodyTemplate).join('');
  return `<ul class="about-list">
        ${bodyInfo}
        <li><span>Lenses: </span><span>${lenses.map((lens) => lens.Model).join(', ')}</span></li>
        <li><span>Lighting: </span><span>${lighting}</span></li>
      </ul>`;
}

export async function renderCameraInfo(cameraNames, lighting = 'Off-camera flash rig for booth/stage work') {
  const container = document.querySelector('#camera-info');
  if (!container) return;

  try {
    const [bodies, lenses] = await Promise.all([getCameraSpecs(cameraNames), getLenses()]);
    if (!bodies.length) {
      container.textContent = `No specs found for "${cameraNames.join('", "')}".`;
      return;
    }
    container.innerHTML = cameraInfoTemplate(bodies, lenses, lighting);
  } catch (err) {
    console.error(err);
  }
}
