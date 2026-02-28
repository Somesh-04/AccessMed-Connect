const API = "http://127.0.0.1:5003/api/doctor";

/* ===============================
   READ LOGGED-IN DOCTOR
=============================== */
const doctorRaw = localStorage.getItem("amc_doctor");
if (!doctorRaw) {
    alert("Please login as a doctor first");
    window.location.href =
        "/Landing-Page-Satyam/index.html#login";
}

const doctor = JSON.parse(doctorRaw);

/* ===============================
   NAVIGATION
=============================== */
const navItems = document.querySelectorAll(".nav-pill");
const sections = document.querySelectorAll(".section");

navItems.forEach(item => {
    item.addEventListener("click", () => {

        if (item.id === "support-link") return;

        navItems.forEach(n => n.classList.remove("active"));
        item.classList.add("active");

        const target = item.dataset.section;
        sections.forEach(sec => {
            sec.classList.remove("active-section");
            if (sec.id === target) sec.classList.add("active-section");
        });

        if (target === "records") {
            loadRecords();
        }
    });
});

/* ===============================
   SUPPORT REDIRECT
=============================== */
const supportLink = document.getElementById("support-link");
if (supportLink) {
    supportLink.onclick = () => {
        window.location.href =
            "/Landing-Page-Satyam/index.html#support";
    };
}

/* ===============================
   HEADER: NAME + LOGOUT
=============================== */
document.getElementById("welcome-doctor").innerText =
    `Welcome Dr. ${doctor.name}`;

document.getElementById("btn-logout").onclick = () => {
    localStorage.removeItem("amc_doctor");
    window.location.href =
        "/Landing-Page-Satyam/index.html#login";
};

/* ===============================
   DASHBOARD
=============================== */
async function loadDashboard() {
    const res = await fetch(
        `${API}/dashboard?user_id=${doctor.id}`
    );

    const d = await res.json();

    document.getElementById("metric-appointments").innerText =
        d.appointments ?? 0;

    document.getElementById("metric-patients").innerText =
        d.patients ?? 0;

    document.getElementById("metric-reports").innerText =
        d.reports ?? 0;
}

/* ===============================
   PATIENTS
=============================== */
let selectedPatientId = null;

async function loadPatients() {
    const res = await fetch(
        `${API}/patients?user_id=${doctor.id}`
    );

    const data = await res.json();
    const container = document.getElementById("patientsContainer");
    container.innerHTML = "";

    data.forEach(p => {
        const card = document.createElement("div");
        card.className = "ref-card";
        card.innerHTML = `<h3>${p.name}</h3>`;
        card.onclick = () => selectPatient(p.id, card);
        container.appendChild(card);
    });
}

function selectPatient(id, card) {
    selectedPatientId = id;

    document
        .querySelectorAll(".ref-card")
        .forEach(c => c.classList.remove("active"));

    card.classList.add("active");

    document.querySelector('[data-section="records"]').click();
}

/* ===============================
   RECORDS (ALL REPORTS FOR DOCTOR)
=============================== */
async function loadRecords() {
    const res = await fetch(
        `${API}/reports?user_id=${doctor.id}`
    );

    const data = await res.json();
    const list = document.getElementById("recordsList");
    const hint = document.getElementById("recordsHint");

    list.innerHTML = "";
    hint.style.display = "none";

    if (!data.length) {
        list.innerHTML = `<li class="note">No medical reports found</li>`;
        return;
    }

    data.forEach(r => {
        list.innerHTML += `
            <li>
                <b>${r.patient_name}</b> —
                <a href="${r.file_url}" target="_blank">${r.name}</a>
            </li>
        `;
    });
}

/* ===============================
   MEDICINE SEARCH
=============================== */
const searchInput = document.getElementById("medicineSearch");
const searchBtn = document.getElementById("medicineSearchBtn");
const resultBox = document.getElementById("medicineResults");

async function searchMedicine(query) {
    resultBox.innerHTML = "";
    if (!query) return;

    const res = await fetch(
        `${API}/medicines/search/${query}`
    );

    const data = await res.json();

    if (!data.length) {
        resultBox.innerHTML =
            `<p class="note">Medicine not available</p>`;
        return;
    }

    data.forEach(m => {
        resultBox.innerHTML += `
            <div class="ref-card">
                <h3>${m.name}</h3>
                <p class="note">Quantity: ${m.stock}</p>
                <p class="note">Expiry: ${m.expiry}</p>
            </div>
        `;
    });
}

searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        searchMedicine(searchInput.value.trim());
    }
});

searchBtn.onclick = () => {
    searchMedicine(searchInput.value.trim());
};

/* ===============================
   INIT
=============================== */
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadPatients();
});
