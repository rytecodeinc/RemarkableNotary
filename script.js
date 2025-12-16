const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

function setNavOpen(isOpen) {
  if (!navToggle || !nav) return;
  nav.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    setNavOpen(!isOpen);
  });

  nav.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement) {
      setNavOpen(false);
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (!nav.contains(target) && !navToggle.contains(target)) {
      setNavOpen(false);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNavOpen(false);
  });
}

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const ctaForm = document.querySelector('.cta-form');
if (ctaForm) {
  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = ctaForm.querySelector('input[name="email"]');

    if (email instanceof HTMLInputElement && !email.validity.valid) {
      email.focus();
      return;
    }

    const btn = ctaForm.querySelector('button[type="submit"]');
    if (btn instanceof HTMLButtonElement) {
      const prev = btn.textContent;
      btn.textContent = 'Sent — check your inbox';
      btn.disabled = true;

      window.setTimeout(() => {
        btn.textContent = prev;
        btn.disabled = false;
        ctaForm.reset();
      }, 2200);
    }
  });
}
