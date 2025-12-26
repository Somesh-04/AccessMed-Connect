// ================================
// DISPENSARY PORTAL JS
// ================================

document.addEventListener("DOMContentLoaded", () => {

    /* ------------------------------
       NAVIGATION ACTIVE STATE
    ------------------------------- */
    const navPills = document.querySelectorAll(".nav-pill");

    navPills.forEach(pill => {
        pill.addEventListener("click", (e) => {
            e.preventDefault();

            navPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            handleNavAction(pill.innerText.trim());
        });
    });

    function handleNavAction(section) {
        if (section === "Support") {
            showSupportPopup();
        }
    }


    /* ------------------------------
       METRIC COUNT ANIMATION
    ------------------------------- */
    const metrics = document.querySelectorAll(".card-metric");

    metrics.forEach(metric => {
        animateCount(metric, parseInt(metric.innerText));
    });

    function animateCount(element, target) {
        let count = 0;
        const speed = target / 40;

        const counter = setInterval(() => {
            count += speed;
            if (count >= target) {
                element.innerText = target;
                clearInterval(counter);
            } else {
                element.innerText = Math.floor(count);
            }
        }, 30);
    }


    /* ------------------------------
       AUTO UPDATE SIMULATION
       (BACKEND READY)
    ------------------------------- */
    setInterval(() => {
        metrics.forEach(metric => {
            let value = parseInt(metric.innerText);
            if (!isNaN(value)) {
                metric.innerText = value + Math.floor(Math.random() * 2);
            }
        });
    }, 15000);


    /* ------------------------------
       LOW STOCK HIGHLIGHTING
    ------------------------------- */
    const lowStockItems = document.querySelectorAll(".symptom-list li");

    lowStockItems.forEach(item => {
        if (item.innerText.toLowerCase().includes("critical")) {
            item.style.color = "#f87171";
            item.style.fontWeight = "600";
        }
    });


    /* ------------------------------
       TABLE LOW QUANTITY WARNING
    ------------------------------- */
    const tableRows = document.querySelectorAll(".vitals-table tr");

    tableRows.forEach(row => {
        const qtyText = row.cells[1]?.innerText;
        if (!qtyText) return;

        const qty = parseInt(qtyText);
        if (qty <= 20) {
            row.style.color = "#fde68a";
        }
        if (qty <= 10) {
            row.style.color = "#f87171";
            row.style.fontWeight = "600";
        }
    });


    /* ------------------------------
       SUPPORT POPUP
    ------------------------------- */
    const footerSupport = document.querySelector(".footer-support");
    footerSupport.addEventListener("click", (e) => {
        e.preventDefault();
        showSupportPopup();
    });

    function showSupportPopup() {
        alert(
            "🩺 DISPENSARY SUPPORT\n\n" +
            "📧 Email: dispensary.support@ccl.in\n" +
            "📞 Phone: +91-XXXX-XXXXXX\n\n" +
            "Support available: 9 AM – 6 PM"
        );
    }

});
