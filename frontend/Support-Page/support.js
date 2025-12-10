/* ======================================================
   ACCESSMED CONNECT – SUPPORT PAGE SCRIPT (FINAL)
   ====================================================== */

/* ------------------------------
   1. Fade-in animation for Suggestion Card
------------------------------ */
function revealSuggestionCard() {
    const card = document.querySelector(".suggestion-card");
    if (!card) return;

    const triggerPoint = window.innerHeight * 0.85;
    const top = card.getBoundingClientRect().top;

    if (top < triggerPoint) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
        card.style.transition = "0.7s ease-out";
    }
}

window.addEventListener("scroll", revealSuggestionCard);
window.addEventListener("load", revealSuggestionCard);


/* ------------------------------
   2. Floating Particles Background
------------------------------ */
(function generateFloatingParticles() {

    const container = document.querySelector(".floating-particles");
    if (!container) return;

    const PARTICLES = 35;

    for (let i = 0; i < PARTICLES; i++) {

        const dot = document.createElement("span");
        dot.classList.add("particle-dot");

        const size = Math.random() * 4 + 2;      // 2px – 6px
        const x = Math.random() * 100;           // vw
        const y = Math.random() * 100;           // vh
        const duration = Math.random() * 18 + 10; // 10 – 28s
        const delay = Math.random() * -20;        // negative for stagger

        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${x}vw`;
        dot.style.top = `${y}vh`;
        dot.style.animationDuration = `${duration}s`;
        dot.style.animationDelay = `${delay}s`;

        container.appendChild(dot);
    }

})();


/* ------------------------------
   3. Form Submit Animation
------------------------------ */
const suggestionForm = document.querySelector(".suggestion-form");

if (suggestionForm) {
    suggestionForm.addEventListener("submit", function (e) {
        e.preventDefault();

        alert("✅ Thank you for your feedback! Your suggestion has been submitted.");
    });
}
