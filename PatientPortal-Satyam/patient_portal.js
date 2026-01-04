/* ============================================================
   ACCESSMED CONNECT – PATIENT PORTAL
   ============================================================ */

const API_BASE = "http://127.0.0.1:5000/api";

/* ============================================================
   ENTRY POINT
   ============================================================ */
document.addEventListener("DOMContentLoaded", initPatientPortal);

function initPatientPortal() {

    // --------------------------------------------------------
    // 1) CHECK LOGIN STATE
    // --------------------------------------------------------
    const raw = localStorage.getItem("amc_user");

    if (!raw) {
        alert("Please login first");
        window.location.href = "/AccessMed-Connect/Landing-Page-Satyam/index.html#login";
        return;
    }

    let user = null;

    try {
        user = JSON.parse(raw);
    } catch (err) {
        console.error("Corrupted user in storage:", err);
        localStorage.removeItem("amc_user");
        window.location.href = "/AccessMed-Connect/Landing-Page-Satyam/index.html#login";
        return;
    }

    // handle case when user stored as { user: {...}}
    if (user.user) user = user.user;

    // --------------------------------------------------------
    // 2) RENDER USER DETAILS THROUGHOUT PORTAL
    // --------------------------------------------------------
    renderPatient({
        full_name: user.full_name ?? user.name ?? "—",
        email: user.email ?? "—",
        user_id: user.emp_id ?? user.user_id ?? "—"
    });

    // --------------------------------------------------------
    // 3) Initialise UI behaviours
    // --------------------------------------------------------
    setupTabs();
    setupLogout();
    setupForms(user);

    // --------------------------------------------------------
    // 4) Load dashboard dynamic data
    // --------------------------------------------------------
    loadDashboardData(user);
}

/* ============================================================
   LOGOUT HANDLER
   ============================================================ */
function setupLogout() {
    const btn = document.getElementById("btn-logout");
    if (!btn) return;

    btn.onclick = () => {
        localStorage.removeItem("amc_user");
        alert("Logged out successfully");

        window.location.href =
            "/Landing-Page-Satyam/index.html#login";
    };
}

/* ============================================================
   TABS
   ============================================================ */
function setupTabs() {

    const tabs = document.querySelectorAll(".nav-tab");
    const sections = document.querySelectorAll(".section-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {

            tabs.forEach(t => t.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            tab.classList.add("active");

            const id = `${tab.dataset.section}-section`;
            document.getElementById(id).classList.add("active");
        });
    });
}

/* ============================================================
   LOAD DASHBOARD DATA (Backend endpoints can plug here)
   ============================================================ */
async function loadDashboardData(user) {

    // default empty states now
    setEmptyState("doctor-list", "No doctors available today");
    setEmptyState("medicine-list", "No medicine data available");
    setEmptyState("history-list", "No medical history found");
    setEmptyState("appointment-list", "No upcoming appointments");
    setEmptyState("report-list", "No reports available");

    // later you can fetch like:
    // await fetch(`${API_BASE}/patient/doctors?...`)
}

/* ============================================================
   FORMS
   ============================================================ */
function setupForms(user) {

    // --------------------------------------------------------
    // QUICK NAV BUTTONS
    // --------------------------------------------------------
    const bookBtn = document.getElementById("book-appointment");
    if (bookBtn) {
        bookBtn.onclick = () => {
            document.querySelector('[data-section="appointments"]').click();
        };
    }

    const medsBtn = document.getElementById("request-meds");
    if (medsBtn) {
        medsBtn.onclick = () => {
            document.querySelector('[data-section="medicines"]').click();
        };
    }

    // --------------------------------------------------------
    // MEDICINE REQUEST FORM
    // --------------------------------------------------------
    const medForm = document.getElementById("medicine-form");

    if (!medForm) return;

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
            const res = await fetch(`${API_BASE}/patient/medicine-request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                showMedStatus(data.error || "Request failed", "error");
                return;
            }

            showMedStatus("Request submitted successfully!", "success");
            medForm.reset();

        } catch (err) {
            console.error(err);
            showMedStatus("Network error", "error");
        }
    });
}

/* ============================================================
   RENDER PATIENT NAME / EMAIL / EMP-ID
   ============================================================ */
function renderPatient(user) {

    // Dashboard card
    setText("welcome-name", user.full_name);
    setText("patient-name", user.full_name);
    setText("patient-emp-id", user.user_id);
    setText("patient-email", user.email);

    // Appointment page
    setText("appt-patient-name", user.full_name);
    setText("appt-patient-emp-id", user.user_id);
    setText("appt-patient-email", user.email);

    // Medicine page
    setText("med-patient-name", user.full_name);
    setText("med-patient-emp-id", user.user_id);
    setText("med-patient-email", user.email);
}

/* ============================================================
   UTILITIES
   ============================================================ */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function setEmptyState(listId, message) {
    const list = document.getElementById(listId);
    if (!list) return;

    list.innerHTML = `<li class="empty">${message}</li>`;
}

function showMedStatus(msg, type) {
    const el = document.getElementById("med-form-status");
    if (!el) return;

    el.textContent = msg;
    el.style.color =
        type === "success" ? "#22c55e"
        : type === "error" ? "#ef4444"
        : "#eab308";
}
