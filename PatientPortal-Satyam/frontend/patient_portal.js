/* ============================
   TAB NAVIGATION SYSTEM
============================ */
document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.section-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetSection = tab.dataset.section;
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all sections
            sections.forEach(s => s.classList.remove('active'));
            // Show target section
            document.getElementById(`${targetSection}-section`).classList.add('active');
        });
    });

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
       QUICK ACTION BUTTONS (DASHBOARD)
    ============================ */
    const bookBtn = document.getElementById("book-appointment");
    if (bookBtn) {
        bookBtn.addEventListener("click", () => {
            document.querySelector('[data-section="appointments"]').click();
        });
    }

    const medsBtn = document.getElementById("request-meds");
    if (medsBtn) {
        medsBtn.addEventListener("click", () => {
            document.querySelector('[data-section="medicines"]').click();
        });
    }

    /* ============================
       DASHBOARD - DEFAULT STATES
    ============================ */
    setEmptyState("doctor-list", "No doctors available today");
    setEmptyState("medicine-list", "No medicine data available");
    setEmptyState("history-list", "No medical history found");
    setEmptyState("appointment-list", "No upcoming appointments");
    setEmptyState("report-list", "No reports available");

    /* ============================
       APPOINTMENT PAGE - SETUP
    ============================ */
    setEmptyState("appt-appointment-list", "No appointments found");

    const deptSelect = document.getElementById("department");
    if (deptSelect) {
        deptSelect.onchange = () => {
            document.getElementById("select-doctor-btn").disabled = !deptSelect.value;
        };
    }

    const selectDoctorBtn = document.getElementById("select-doctor-btn");
    if (selectDoctorBtn) {
        selectDoctorBtn.onclick = () => {
            openDoctorModal();
        };
    }

    /* ============================
       MEDICINE PAGE - SETUP
    ============================ */
    setEmptyState("request-list", "No previous medicine requests");

    const medicineForm = document.getElementById("medicine-form");
    if (medicineForm) {
        medicineForm.addEventListener("submit", e => {
            e.preventDefault();
            const payload = {
                medicine: getValue("medicine-name"),
                dosage: getValue("dosage"),
                quantity: getValue("quantity"),
                remarks: getValue("remarks")
            };
            showMedStatus("Submitting request...", "info");
            console.log("Request payload ready for backend:", payload);
            showMedStatus("Request submitted (demo mode)", "success");
            medicineForm.reset();
        });
    }
});

/* ==================================================
   RENDER FUNCTIONS (BACKEND WILL CALL THESE)
================================================== */

/* ➤ PATIENT DETAILS - Updates all three sections */
function renderPatient(user) {
    if (!user) return;
    
    // Dashboard section
    setText("welcome-name", user.full_name);
    setText("patient-name", user.full_name);
    setText("patient-emp-id", user.user_id);
    setText("patient-email", user.email);
    
    // Appointment section
    setText("appt-patient-name", user.full_name);
    setText("appt-patient-emp-id", user.user_id);
    setText("appt-patient-email", user.email);
    
    // Medicine section
    setText("med-patient-name", user.full_name);
    setText("med-patient-emp-id", user.user_id);
    setText("med-patient-email", user.email);
}

/* ➤ DOCTOR AVAILABILITY (Dashboard) */
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

/* ➤ MEDICINE AVAILABILITY (Dashboard) */
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

/* ➤ MEDICAL HISTORY (Dashboard) */
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

/* ➤ UPCOMING APPOINTMENTS (Dashboard) */
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

/* ➤ REPORTS (Dashboard) */
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

/* ➤ DEPARTMENTS (Appointment Page) */
function renderDepartments(departments = []) {
    const select = document.getElementById("department");
    select.innerHTML = `<option value="">Select department</option>`;
    
    departments.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.name;
        select.appendChild(opt);
    });
}

/* ➤ DOCTORS FOR APPOINTMENT MODAL */
function renderDoctorsForAppointment(doctors = []) {
    const list = document.getElementById("modal-doctor-list");
    list.innerHTML = "";
    
    if (doctors.length === 0) {
        list.innerHTML = '<li class="empty">No doctors available today</li>';
        return;
    }
    
    doctors.forEach(d => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${d.name}</strong><br>${d.time}`;
        li.style.cursor = 'pointer';
        li.onclick = () => selectDoctor(d.id, d.name);
        list.appendChild(li);
    });
}

/* ➤ MEDICINE REQUESTS (Medicine Page) */
function renderRequests(requests = []) {
    const list = document.getElementById("request-list");
    list.innerHTML = "";
    
    if (requests.length === 0) {
        list.innerHTML = '<li class="empty">No previous medicine requests</li>';
        return;
    }
    
    requests.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.medicine} (${r.quantity}) — ${r.status}`;
        list.appendChild(li);
    });
}

/* ============================
   MODAL CONTROL (APPOINTMENT PAGE)
============================ */
function openDoctorModal() {
    document.getElementById("doctor-modal").classList.remove("hidden");
    // BACKEND: fetch doctors based on selected department
    // fetch(`/api/doctors?dept_id=${department.value}&today=true`)
}

function closeDoctorModal() {
    document.getElementById("doctor-modal").classList.add("hidden");
}

function selectDoctor(id, name) {
    document.getElementById("doctor-id").value = id;
    document.getElementById("select-doctor-btn").textContent = name;
    closeDoctorModal();
}

/* ============================
   UTILITY FUNCTIONS
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

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function showMedStatus(msg, type) {
    const el = document.getElementById("med-form-status");
    if (el) {
        el.textContent = msg;
        el.style.color = type === "success" ? "#22c55e" : "#eab308";
    }
}