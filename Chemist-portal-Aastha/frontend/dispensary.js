document.addEventListener("DOMContentLoaded", () => {

    const API = "http://localhost:5000/api";

    /* ===============================
       FETCH DASHBOARD METRICS
    =============================== */
    fetch(`${API}/metrics`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("metric-medicines").innerText = data.medicines;
            document.getElementById("metric-transactions").innerText = data.transactions;
            document.getElementById("metric-low").innerText = data.low_stock;
        })
        .catch(err => {
            console.error("Error fetching metrics:", err);
        });


    /* ===============================
       FETCH INVENTORY
    =============================== */
    fetch(`${API}/inventory`)
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById("inventory-table");
            table.innerHTML = "";

            data.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><b>${item.name}</b></td>
                    <td>${item.quantity} units</td>
                `;

                if (item.quantity <= 10) {
                    row.style.color = "#f87171";
                    row.style.fontWeight = "600";
                } else if (item.quantity <= 20) {
                    row.style.color = "#fde68a";
                }

                table.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error fetching inventory:", err);
        });


    /* ===============================
       FETCH LOW STOCK LIST
    =============================== */
    fetch(`${API}/low-stock`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("low-stock-list");
            list.innerHTML = "";

            data.forEach(item => {
                const li = document.createElement("li");
                li.innerText = `${item.name} – ${item.quantity} units`;

                if (item.quantity <= 10) {
                    li.style.color = "#f87171";
                    li.style.fontWeight = "600";
                }

                list.appendChild(li);
            });
        })
        .catch(err => {
            console.error("Error fetching low stock:", err);
        });


    /* ===============================
       SUPPORT NAVIGATION - REMOVED POPUP
       Now links directly to support page
    =============================== */
    // Footer support link now navigates to index.html#support
    // No need for popup - it will redirect to the support page
    
    const supportLinks = document.querySelectorAll(".footer-support, .nav-pill[href*='support']");
    supportLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            // Let the link work normally - it will navigate to support page
            // The hash (#support) will be handled by the index.html's script.js
            console.log("Navigating to support page...");
        });
    });
});