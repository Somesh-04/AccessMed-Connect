// ================= SECTION SWITCHING =================
function switchSection(sectionId, btn) {
    // Hide all sections
    document.querySelectorAll(".content-section").forEach(section => {
        section.style.display = "none";
    });

    // Remove 'active' class from all nav pills
    document.querySelectorAll(".nav-pill").forEach(pill => {
        pill.classList.remove("active");
    });

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) section.style.display = "block";

    // Add 'active' class to clicked button
    btn.classList.add("active");
}

// ================= PATIENT TYPE TOGGLE =================
function filterDoctors() {
    const deptId = document.getElementById("department_id").value;
    const doctorSelect = document.getElementById("doctor_id");
    const options = doctorSelect.querySelectorAll("option");

    options.forEach(option => {
        if (option.value === "") {
            option.style.display = "block"; // Always show "Select Doctor"
        } else if (deptId === "" || option.getAttribute("data-dept") === deptId) {
            option.style.display = "block";
        } else {
            option.style.display = "none";
        }
    });
    // Reset doctor selection
    doctorSelect.value = "";
}

// ================= INITIALIZATION =================
// Make sure the dashboard is visible on page load
document.addEventListener("DOMContentLoaded", () => {
    switchSection("dashboard", document.querySelector(".nav-pill.active"));
});
