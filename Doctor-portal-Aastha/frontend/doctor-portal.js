const navItems = document.querySelectorAll(".nav-pill");
const sections = document.querySelectorAll(".section");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        navItems.forEach(n => n.classList.remove("active"));
        item.classList.add("active");

        const target = item.dataset.section;
        sections.forEach(sec => {
            sec.classList.remove("active-section");
            if (sec.id === target) sec.classList.add("active-section");
        });
    });
});

const API = "http://127.0.0.1:5000/api";

async function loadDashboard() {
    const res = await fetch(`${API}/dashboard`);
    const d = await res.json();

    document.querySelectorAll(".card-metric")[0].innerText = d.appointments;
    document.querySelectorAll(".card-metric")[1].innerText = d.patients;
    document.querySelectorAll(".card-metric")[2].innerText = d.reports;
}

async function loadPatients() {
    const res = await fetch(`${API}/patients`);
    const data = await res.json();
    const container = document.querySelector("#patients .ref-card-container");
    container.innerHTML = "";

    data.forEach(p => {
        container.innerHTML += `
        <div class="ref-card">
            <h3>Patient: ${p.name}</h3>
            <table class="vitals-table">
                <tr><td>Age</td><td>${p.age}</td></tr>
                <tr><td>Blood Group</td><td>${p.blood}</td></tr>
                <tr><td>Condition</td><td>${p.condition}</td></tr>
            </table>
        </div>`;
    });
}

async function loadRecords() {
    const res = await fetch(`${API}/records`);
    const data = await res.json();
    const list = document.querySelector(".symptom-list");
    list.innerHTML = "";
    data.forEach(r => list.innerHTML += `<li>${r.test} – ${r.status}</li>`);
}

async function loadMedicines() {
    const res = await fetch(`${API}/medicines`);
    const data = await res.json();
    const container = document.querySelector("#medicine-availability .ref-card-container");
    container.innerHTML = "";

    data.forEach(m => {
        container.innerHTML += `
        <div class="ref-card">
            <h3>${m.name}</h3>
            <p class="note">Stock: ${m.stock}</p>
            <p class="note">Expiry: ${m.expiry}</p>
        </div>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadPatients();
    loadRecords();
    loadMedicines();
});
