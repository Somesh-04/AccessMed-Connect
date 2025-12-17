/* =============================
   EMERGENCY PAGE SCRIPT
   ============================= */

/* Copy emergency info on click */
document.querySelectorAll(".ref-card b").forEach(item => {
    item.addEventListener("click", () => {
        const value = item.innerText;
        navigator.clipboard.writeText(value);
        alert("Copied: " + value);
    });
});

/* Gentle emphasis on hover */
document.querySelectorAll(".ref-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.transform = "scale(1.04)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "scale(1)";
    });
});
