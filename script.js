// Basic interactions: mobile nav toggle, demo symptom-checker prompt, and form validation

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('open');
  });

  // Demo symptom checker (very lightweight UI demo)
  document.getElementById('demoBtn').addEventListener('click', () => {
    const symptom = prompt('Enter a symptom (e.g., fever, cough, rash):');
    if (!symptom) return;
    const s = symptom.toLowerCase();
    // naive triage logic for demo only
    const urgentKeywords = ['chest', 'bleed', 'breath', 'unconscious', 'severe'];
    const urgent = urgentKeywords.some(k => s.includes(k));
    alert(urgent ? 'Recommendation: Seek urgent medical attention.' : 'Recommendation: Book a teleconsultation for evaluation.');
  });

  // Contact form minimal validation (no backend)
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      formMsg.textContent = 'Please complete all fields.';
      formMsg.style.color = '#b91c1c';
      return;
    }

    // basic email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formMsg.textContent = 'Please provide a valid email address.';
      formMsg.style.color = '#b91c1c';
      return;
    }

    // For this static demo we just show a success message.
    formMsg.textContent = 'Thanks — your message has been recorded (demo).';
    formMsg.style.color = '#064e3b';

    // reset after a short delay to feel responsive
    setTimeout(() => {
      form.reset();
    }, 700);
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    form.reset();
    formMsg.textContent = '';
  });
});
