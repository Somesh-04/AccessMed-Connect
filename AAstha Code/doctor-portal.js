const navItems = document.querySelectorAll(".nav-pill");
const sections = document.querySelectorAll(".section");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        // Active nav
        navItems.forEach(n => n.classList.remove("active"));
        item.classList.add("active");

        // Show section
        const target = item.dataset.section;
        sections.forEach(sec => {
            sec.classList.remove("active-section");
            if (sec.id === target) {
                sec.classList.add("active-section");
            }
        });
    });
});


