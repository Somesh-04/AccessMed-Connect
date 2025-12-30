document.addEventListener("DOMContentLoaded", () => {
    setEmptyState("appointment-list", "No appointments found");
});


/* ============================
   RENDER FUNCTIONS (BACKEND)
============================ */

/* ➤ PATIENT DETAILS */
function renderPatient(user) {
    if (!user) return;

    setText("patient-name", user.full_name);
    setText("patient-emp-id", user.user_id);
    setText("patient-email", user.email);
}

/* ➤ DEPARTMENTS */
function renderDepartments(departments = []) {
    const select = document.getElementById("department");
    select.innerHTML = `<option value="">Select department</option>`;

    departments.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.name;
        select.appendChild(opt);
    });

    select.onchange = () => {
        document.getElementById("select-doctor-btn").disabled = !select.value;
    };
}

/* ➤ DOCTORS (TODAY ONLY) */
function renderDoctors(doctors = []) {
    const list = document.getElementById("doctor-list");
    list.innerHTML = "";

    if (doctors.length === 0) {
        setEmptyState("doctor-list", "No doctors available today");
        return;
    }

    doctors.forEach(d => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${d.name}</strong><br>
            ${d.time}
        `;
        li.onclick = () => selectDoctor(d.id, d.name);
        list.appendChild(li);
    });
}


/* ============================
   MODAL CONTROL
============================ */

document.getElementById("select-doctor-btn").onclick = () => {
    openDoctorModal();
};

function openDoctorModal() {
    document.getElementById("doctor-modal").classList.remove("hidden");
    // BACKEND:
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
   UTILITIES
============================ */

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
}

function setEmptyState(id, msg) {
    document.getElementById(id).innerHTML = `<li class="empty">${msg}</li>`;
}
