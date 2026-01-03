function openSection(id) {
    document.querySelectorAll(".section-content").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    event.target.classList.add("active");
}

// Auto-fill doctors list when department changes
const dept = document.getElementById("department");
const doc = document.getElementById("doctor");

if (dept) {
    dept.addEventListener("change", () => {
        doc.innerHTML = "";

        const d = dept.value;

        let doctors = [];

        if (d === "Medicine") doctors = ["Dr. R. Sharma"];
        if (d === "Pathology") doctors = ["Dr. A. Verma"];
        if (d === "Dermatology") doctors = ["Dr. P. Singh"];
        if (d === "Dentist") doctors = ["Dr. K. Rao"];

        doctors.forEach(x => {
            const opt = document.createElement("option");
            opt.textContent = x;
            doc.appendChild(opt);
        });
    });
}