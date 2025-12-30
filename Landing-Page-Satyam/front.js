/* ======================================================
   ACCESSMED CONNECT – MAIN INTERACTIVITY SCRIPT
   ====================================================== */

/* ------------------------------
   1. Lightbox Image Viewer
------------------------------ */
function openLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");

    img.src = src;
    lightbox.style.display = "flex";
}

function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
}

/* ------------------------------
   2. Active Navigation Highlight
------------------------------ */
const navLinks = document.querySelectorAll(".nav-pill");

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        navLinks.forEach(n => n.classList.remove("active-nav"));
        link.classList.add("active-nav");
    });
});

/* ------------------------------
   3. Card Hover Glow Effect
------------------------------ */
document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.boxShadow = "0 0 20px rgba(99,102,241,0.7)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
    });
});

/* ------------------------------
   4. Emergency Red-Flag Alert
------------------------------ */
document.querySelectorAll(".symptom-list li").forEach(item => {
    item.addEventListener("click", () => {
        alert("⚠️ This symptom is a medical emergency.\nPlease seek immediate help!");
    });
});

/* ------------------------------
   5. Smooth Fade-In on Scroll
------------------------------ */
const revealElements = document.querySelectorAll(".feature-card, .ref-card");

function revealOnScroll() {
    const trigger = window.innerHeight * 0.85;

    revealElements.forEach(el => {
        const top = el.getBoundingClientRect().top;

        if (top < trigger) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            el.style.transition = "0.6s ease";
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* ------------------------------
   6. Back-to-Top Smooth Scroll (Optional)
------------------------------ */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}