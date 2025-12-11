/* ======================================================
   ACCESSMED CONNECT – FIXED & OPTIMIZED INTERACTIVITY
====================================================== */

/* ------------------------------
   1. Lightbox Image Viewer
------------------------------ */
function openLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img"); 

    if (!lightbox || !img) return;

    img.src = src;
    lightbox.style.display = "flex";
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) lightbox.style.display = "none";
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
   3. Glow Effect on Feature Cards
------------------------------ */
document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.boxShadow = "0 0 20px rgba(99,102,241,0.8)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.45)";
    });
});

/* ------------------------------
   4. Emergency Red-Flag Alerts
------------------------------ */
document.querySelectorAll(".symptom-list li").forEach(item => {
    item.addEventListener("click", () => {
        alert("⚠️ EMERGENCY WARNING:\nThis symptom requires IMMEDIATE medical attention.");
    });
});

/* ------------------------------
   5. Fade-In Scroll Animation
------------------------------ */
const revealElements = document.querySelectorAll(".feature-card, .ref-card");

revealElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
});

function revealOnScroll() {
    const trigger = window.innerHeight * 0.85;

    revealElements.forEach(el => {
        const top = el.getBoundingClientRect().top;

        if (top < trigger) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* ------------------------------
   6. Back-to-Top Button
------------------------------ */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        backToTopBtn.classList.add("show");
    } else {
        backToTopBtn.classList.remove("show");
    }
});
