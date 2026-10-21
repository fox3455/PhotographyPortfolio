// ---------------------------------------------------------------------------
// Shared behavior: formspree contact form functions
// Formspree specific logic live in their own init functions below
// ---------------------------------------------------------------------------


const DRAFT_KEY = 'contactDraft';
const LAST_KEY = 'contactLast';

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

export function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  function formValues() {
    const values = Object.fromEntries(new FormData(form));
    delete values['_gotcha'];
    return values;
  }

  const draft = load(DRAFT_KEY);
  if (draft) {
    for (const [name, value] of Object.entries(draft)) {
      if (form.elements[name]) form.elements[name].value = value;
    }
  }
  form.addEventListener('input', () => save(DRAFT_KEY, formValues()));

  const last = load(LAST_KEY);
  if (last) {
    if (!form.elements.name.value) form.elements.name.value = last.name;
    if (!form.elements.email.value) form.elements.email.value = last.email;

    const welcome = form.querySelector('#form-welcome');
    welcome.textContent = `Welcome back, ${last.name}. Your last request was sent on ${new Date(last.sentAt).toLocaleDateString()}.`;
    welcome.hidden = false;
  }

  const status = form.querySelector('#form-status');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop the normal page navigation
    button.disabled = true;
    status.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }, // tells Formspree to reply with JSON, not a page
      });
      if (!response.ok) throw new Error(`Formspree replied ${response.status}`);

      const { name, email } = formValues();
      save(LAST_KEY, { name, email, sentAt: Date.now() }); // Step 6 uses this
      localStorage.removeItem(DRAFT_KEY);
      form.reset();
      status.textContent = `Thanks, ${name}! I'll get back to you soon.`;
    } catch (err) {
      console.error(err);
      status.textContent = 'Something went wrong. Your message is saved, so try again, or email me directly.';
    } finally {
      button.disabled = false;
    }
  });
}
