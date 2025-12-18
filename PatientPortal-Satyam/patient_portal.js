document.addEventListener("DOMContentLoaded", () => {

    /* ============================
       LOGOUT
    ============================ */
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            alert("Logged out (frontend demo). Redirecting...");
            window.location.href = "login.html";
        });
    }

    /* ============================
       QUICK ACTION BUTTONS
    ============================ */

    // ➤ Book Appointment
    const bookBtn = document.getElementById("book-appointment");
    if (bookBtn) {
        bookBtn.addEventListener("click", () => {
            window.location.href = "book_appointment.html";
        });
    }

    // ➤ Request Medicine
    const medsBtn = document.getElementById("request-meds");
    if (medsBtn) {
        medsBtn.addEventListener("click", () => {
            window.location.href = "request_medicine.html";
        });
    }

    /* ============================
       DEFAULT EMPTY STATES
       (UI NEVER BREAKS)
    ============================ */
    setEmptyState("doctor-list", "No doctors available today");
    setEmptyState("medicine-list", "No medicine data available");
    setEmptyState("history-list", "No medical history found");
    setEmptyState("appointment-list", "No upcoming appointments");
    setEmptyState("report-list", "No reports available");
});


/* ==================================================
   RENDER FUNCTIONS
   BACKEND WILL CALL THESE (DO NOT FETCH HERE)
================================================== */

/* ➤ PATIENT DETAILS */
function renderPatient(patient) {
    if (!patient) return;

    setText("patient-name", patient.name);
    setText("patient-dept", patient.department);
    setText("patient-designation", patient.designation);
}

/* ➤ DOCTOR AVAILABILITY */
function renderDoctors(doctors = []) {
    const list = document.getElementById("doctor-list");
    if (!list) return;

    list.innerHTML = "";

    if (doctors.length === 0) {
        setEmptyState("doctor-list", "No doctors available today");
        return;
    }

    doctors.forEach(d => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${d.name}</strong> — ${d.start_time} – ${d.end_time}`;
        list.appendChild(li);
    });
}

/* ➤ MEDICINE AVAILABILITY */
function renderMedicines(medicines = []) {
    const list = document.getElementById("medicine-list");
    if (!list) return;

    list.innerHTML = "";

    if (medicines.length === 0) {
        setEmptyState("medicine-list", "No medicine data available");
        return;
    }

    medicines.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.name} — ${m.status}`;
        list.appendChild(li);
    });
}

/* ➤ MEDICAL HISTORY */
function renderHistory(history = []) {
    const list = document.getElementById("history-list");
    if (!list) return;

    list.innerHTML = "";

    if (history.length === 0) {
        setEmptyState("history-list", "No medical history found");
        return;
    }

    history.forEach(h => {
        const li = document.createElement("li");
        li.textContent = h;
        list.appendChild(li);
    });
}

/* ➤ UPCOMING APPOINTMENTS (IMPORTANT) */
function renderAppointments(appointments = []) {
    const list = document.getElementById("appointment-list");
    if (!list) return;

    list.innerHTML = "";

    if (appointments.length === 0) {
        setEmptyState("appointment-list", "No upcoming appointments");
        return;
    }

    appointments.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${a.date} — ${a.doctor_name} — ${a.status}`;
        list.appendChild(li);
    });
}

/* ➤ REPORTS */
function renderReports(reports = []) {
    const list = document.getElementById("report-list");
    if (!list) return;

    list.innerHTML = "";

    if (reports.length === 0) {
        setEmptyState("report-list", "No reports available");
        return;
    }

    reports.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `${r.name} — <a href="${r.url}">Download</a>`;
        list.appendChild(li);
    });
}


/* ============================
   UTILITIES (DO NOT BREAK)
============================ */

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
}

function setEmptyState(listId, message) {
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = `<li class="empty">${message}</li>`;
}
