const API = "http://localhost:5000/api";

/* ===============================
   ELEMENTS
=============================== */
const dashboardTab = document.getElementById("tab-dashboard");
const medicinesTab = document.getElementById("tab-medicines");

const dashboardView = document.getElementById("dashboard-view");
const medicinesView = document.getElementById("medicines-view");

/* ===============================
   TAB SWITCHING (HARD TOGGLE)
=============================== */
dashboardTab.addEventListener("click", e => {
    e.preventDefault();

    dashboardTab.classList.add("active");
    medicinesTab.classList.remove("active");

    dashboardView.style.display = "block";
    medicinesView.style.display = "none";
});

medicinesTab.addEventListener("click", e => {
    e.preventDefault();

    medicinesTab.classList.add("active");
    dashboardTab.classList.remove("active");

    dashboardView.style.display = "none";
    medicinesView.style.display = "block";

    loadMedicines();
});

/* ===============================
   DASHBOARD METRICS
=============================== */
fetch(`${API}/dashboard`)
    .then(res => res.json())
    .then(data => {
        document.getElementById("metric-medicines").innerText = data.total_medicines;
        document.getElementById("metric-transactions").innerText = data.transactions_today;
        document.getElementById("metric-low").innerText = data.low_stock;
    });

/* ===============================
   LOAD MEDICINES
=============================== */
function loadMedicines() {
    fetch(`${API}/medicines`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("medicine-table");
            tbody.innerHTML = "";

            data.forEach(med => {
                const low = med.quantity <= 10;
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td><b>${med.name}</b></td>
                    <td>${med.category}</td>
                    <td class="${low ? "low" : "ok"}">${med.quantity}</td>
                    <td>
                        <input type="number" min="1" max="${med.quantity}">
                        <button class="order-btn ${low ? "warn" : ""}"
                                onclick="orderMedicine(${med.id})">
                            Order
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        });
}

/* ===============================
   SEARCH
=============================== */
document.getElementById("medicine-search").addEventListener("input", function () {
    const value = this.value.toLowerCase();
    document.querySelectorAll("#medicine-table tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value)
            ? ""
            : "none";
    });
});

/* ===============================
   ORDER MEDICINE
=============================== */
function orderMedicine(medicineId) {
    const patientId = document.getElementById("patient-id").value;
    const patientName = document.getElementById("patient-name").value;

    if (!patientId || !patientName) {
        alert("Please enter Patient ID and Name");
        return;
    }

    fetch(`${API}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            patient_id: patientId,
            patient_name: patientName,
            medicine_id: medicineId
        })
    })
    .then(res => res.json())
    .then(() => {
        alert("Medicine ordered successfully");
        loadMedicines();
    });
}
