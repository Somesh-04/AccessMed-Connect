console.log("✅ patient_portal.js loaded");

const API_AUTH = "http://127.0.0.1:5000/api/auth";
const API_PATIENT = "http://127.0.0.1:5000/api/patient";


document.addEventListener("DOMContentLoaded", () => {

    const raw = localStorage.getItem("amc_user");
    if (!raw) {
        alert("Login first");
        location.href = "/Landing-Page-Satyam/index.html#login";
        return;
    }

    const user = JSON.parse(raw);

    // fill header data
    document.getElementById("welcome-name").textContent = user.full_name;
    document.getElementById("patient-name").textContent = user.full_name;
    document.getElementById("patient-email").textContent = user.email;
    document.getElementById("patient-emp-id").textContent = user.emp_id;

    document.getElementById("appt-patient-name").textContent = user.full_name;
    document.getElementById("appt-patient-email").textContent = user.email;
    document.getElementById("appt-patient-emp-id").textContent = user.emp_id;

    setupTabs();
    loadDepartments();
    loadMyAppointments(user.emp_id);
    setupAppointmentForm(user);
});

// ---------- LOGOUT ----------
document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("btn-logout");

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            // remove saved user session
            localStorage.removeItem("amc_user");

            // optional: clear everything
            // localStorage.clear();

            alert("Logged out successfully");

            // back to login page
            window.location.href = "/Landing-Page-Satyam/index.html#login";
        };
    }

});



// ---------- tabs ----------
function setupTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    const sections = document.querySelectorAll(".section-content");

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(`${tab.dataset.section}-section`).classList.add("active");
        };
    });
}


// ---------- load departments ----------
async function loadDepartments() {
    const sel = document.getElementById("department");
    const dashSel = document.getElementById("dashboard-department");

    const res = await fetch(`${API_PATIENT}/departments`);
    const data = await res.json();

    sel.innerHTML = `<option value="">Select Department</option>`;
    dashSel.innerHTML = `<option value="">Select Department</option>`;

    data.forEach(d => {
        sel.innerHTML += `<option value="${d.id}">${d.name}</option>`;
        dashSel.innerHTML += `<option value="${d.id}">${d.name}</option>`;
    });

    sel.onchange = () => loadDoctorsForBooking(sel.value);
    dashSel.onchange = () => loadDoctorsDashboard(dashSel.value);
}


// ---------- load doctors for booking ----------
async function loadDoctorsForBooking(dept) {
    const sel = document.getElementById("doctor-select");

    const res = await fetch(`${API_PATIENT}/doctors/${dept}`);
    const data = await res.json();

    sel.innerHTML = `<option value="">Select Doctor</option>`;
    data.forEach(d => sel.innerHTML += `<option value="${d.id}">${d.name}</option>`);
}


// ---------- doctors list in dashboard ----------
async function loadDoctorsDashboard(dept) {
    const list = document.getElementById("doctor-list");

    const res = await fetch(`${API_PATIENT}/doctors/${dept}`);
    const data = await res.json();

    list.innerHTML = "";
    data.forEach(d => {
        const li = document.createElement("li");
        li.textContent = d.name;
        list.appendChild(li);
    });
}


// ---------- submit appointment ----------
function setupAppointmentForm(user) {

    const form = document.getElementById("appointment-form");
    const status = document.getElementById("appt-form-status");

    form.onsubmit = async e => {
        e.preventDefault();

        const payload = {
            emp_id: user.emp_id,
            doctor_id: document.getElementById("doctor-select").value,
            date: document.getElementById("appointment-date").value,
            reason: document.getElementById("reason").value
    };



        status.textContent = "Submitting...";

        const res = await fetch(`${API_PATIENT}/appointments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            status.textContent = "Failed";
            status.style.color = "red";
            return;
        }

        status.textContent = "Appointment booked";
        status.style.color = "lightgreen";

        loadMyAppointments(user.emp_id);
        form.reset();
    };
}


// ---------- load my appointments ----------
async function loadMyAppointments(emp_id) {

    const list1 = document.getElementById("appointment-list");
    const list2 = document.getElementById("appt-appointment-list");

    const res = await fetch(`${API_PATIENT}/appointments/${emp_id}`);
    const data = await res.json();

    list1.innerHTML = "";
    list2.innerHTML = "";

    if (!data.length) {
        list1.innerHTML = `<li class="empty">No appointments</li>`;
        list2.innerHTML = `<li class="empty">No appointments</li>`;
        return;
    }

    data.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${a.date} — ${a.doctor} — ${a.reason}`;

        list1.appendChild(li.cloneNode(true));
        list2.appendChild(li);
    });
}
