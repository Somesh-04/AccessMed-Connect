document.addEventListener("DOMContentLoaded", () => {

    // EMPTY STATES
    setEmpty("request-list", "No previous medicine requests");

    // FORM SUBMIT
    const form = document.getElementById("medicine-form");
    form.addEventListener("submit", e => {
        e.preventDefault();

        const payload = getFormData();
        showStatus("Submitting request...", "info");

        /*
            BACKEND WILL HANDLE THIS LATER:
            fetch("/api/medicine-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(...)
        */

        console.log("Request payload ready for backend:", payload);
        showStatus("Request submitted (demo mode)", "success");
        form.reset();
    });
});


/* =====================
   RENDER FUNCTIONS
===================== */

function renderPatient(data) {
    setText("patient-name", data.name);
    setText("patient-dept", data.department);
    setText("patient-id", data.id);
}

function renderRequests(requests = []) {
    const list = document.getElementById("request-list");
    list.innerHTML = "";

    if (requests.length === 0) {
        setEmpty("request-list", "No previous medicine requests");
        return;
    }

    requests.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.medicine} (${r.quantity}) — ${r.status}`;
        list.appendChild(li);
    });
}


/* =====================
   UTILITIES
===================== */

function getFormData() {
    return {
        medicine: getValue("medicine-name"),
        dosage: getValue("dosage"),
        quantity: getValue("quantity"),
        remarks: getValue("remarks")
    };
}

function getValue(id) {
    return document.getElementById(id).value;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
}

function setEmpty(id, msg) {
    document.getElementById(id).innerHTML = `<li class="empty">${msg}</li>`;
}

function showStatus(msg, type) {
    const el = document.getElementById("form-status");
    el.textContent = msg;
    el.style.color = type === "success" ? "#22c55e" : "#eab308";
}
