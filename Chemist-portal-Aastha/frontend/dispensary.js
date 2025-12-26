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
        });


    /* ===============================
       SUPPORT POPUP (UNCHANGED)
    =============================== */
    document.querySelector(".footer-support").addEventListener("click", e => {
        e.preventDefault();
        alert(
            "🩺 DISPENSARY SUPPORT\n\n" +
            "📧 dispensary.support@ccl.in\n" +
            "📞 +91-XXXX-XXXXXX"
        );
    });
});
