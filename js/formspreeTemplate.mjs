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

// Today's date as "YYYY-MM-DD" in the visitor's own timezone.
// (toISOString() would use UTC and can be off by a day in the evening.)
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Event date: no past dates, a friendly error message, and clicking
// anywhere in the field opens the calendar (not just the small icon).
function initDateField(input) {
  if (!input) return;
  input.min = todayISO();

  // A saved draft from an earlier visit may hold a date that has now passed.
  if (input.value && input.value < input.min) input.value = '';

  const check = () => {
    input.setCustomValidity(
      input.validity.rangeUnderflow ? 'Please choose today or a future date.' : ''
    );
  };
  input.addEventListener('input', check);
  input.addEventListener('change', check);

  input.addEventListener('click', () => {
    try { input.showPicker(); } catch { /* unsupported browser: native behavior */ }
  });
}

// Message hint: shows a live "n / 500" count so visitors see the length
// rules while typing instead of only after pressing submit. The count turns
// the accent colour once the 20-character minimum is reached; maxlength stops
// typing at 500. The count sits in its own span so the hint text read by
// screen readers stays short and stable.
function initMessageCounter(textarea) {
  const hint = document.getElementById('message-hint');
  if (!textarea || !hint) return;
  const min = textarea.minLength;
  const max = textarea.maxLength;
  const count = document.createElement('span');
  count.setAttribute('aria-hidden', 'true');
  hint.append(' ', count);

  const update = () => {
    // Raw length, so the count always matches the browser's own minlength/maxlength checks.
    const len = textarea.value.length;
    count.textContent = `(${len} / ${max})`;
    count.classList.toggle('count-met', len >= min);
  };
  textarea.addEventListener('input', update);
  textarea.form?.addEventListener('reset', () => setTimeout(update));
  update();
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
  initDateField(form.elements.eventDate);
  initMessageCounter(form.elements.message);

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
