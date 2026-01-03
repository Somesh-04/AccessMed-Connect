document.addEventListener("DOMContentLoaded", initPatientPortal);

function initPatientPortal() {

    // ============================
    // LOGIN CHECK
    // ============================
    let userRaw = localStorage.getItem("amc_user");

    if (!userRaw) {
        alert("Please login first");
        window.location.href = "/index.html";
        return;
    }

    let user = null;

    try {
        user = JSON.parse(userRaw);
    } catch (e) {
        console.error("Bad user JSON, clearing.", e);
        localStorage.removeItem("amc_user");
        alert("Please login again");
        window.location.href = "/index.html";
        return;
    }

    // ============================
    // RENDER BASIC USER DETAILS
    // ============================
    renderPatient({
        full_name: user.full_name,
        email: user.email,
        user_id: user.emp_id
    });

    // ============================
    // LOAD DASHBOARD DATA
    // ============================
    loadDashboardData(user);
    setupTabs();
    setupForms(user);
}

// ============================
// LOAD DASHBOARD DATA
// ============================
async function loadDashboardData(user) {

    try {
        // doctors
        renderDoctors([]);
        // medicines
        renderMedicines([]);
        // history
        renderHistory([]);
        // appointments
        renderAppointments([]);
        // reports
        renderReports([]);

        // 🔁 CONNECT to backend here when ready
        // example endpoint calls shown below

    } catch (err) {
        console.error(err);
    }
}

// ============================
// TAB SYSTEM
// ============================
function setupTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    const sections = document.querySelectorAll(".section-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(`${tab.dataset.section}-section`).classList.add("active");
        });
    });
}

// ============================
// FORMS
// ============================
function setupForms(user) {

    // logout
    document.getElementById("btn-logout").onclick = () => {
        localStorage.clear();
        window.location.href = "/index.html";
    };

    // medicine form
    const medForm = document.getElementById("medicine-form");

    if (medForm) {
        medForm.addEventListener("submit", async e => {
            e.preventDefault();

            const payload = {
                patient_emp_id: user.emp_id,
                medicine_name: getValue("medicine-name"),
                dosage: getValue("dosage"),
                quantity: getValue("quantity"),
                remarks: getValue("remarks")
            };

            showMedStatus("Submitting...", "info");

            try {
                const res = await fetch("http://127.0.0.1:8000/api/patient/medicine-request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (!res.ok) {
                    showMedStatus(data.error || "Failed", "error");
                    return;
                }

                showMedStatus("Request submitted!", "success");
                medForm.reset();

            } catch (err) {
                console.error(err);
                showMedStatus("Network error", "error");
            }
        });
    }
}

// ============================
// UTILITIES and render funcs
// ============================
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}
