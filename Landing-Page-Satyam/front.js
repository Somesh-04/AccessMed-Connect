/* ======================================================
   ACCESSMED CONNECT – COMPLETE SINGLE PAGE APPLICATION
   ====================================================== */

const API_BASE = "http://127.0.0.1:5000";
const MEDAI_API = "http://127.0.0.1:8000";

/* ------------------------------
   1. Page Navigation System
------------------------------ */
function navigateToPage(pageName) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    const selectedPage = document.getElementById(pageName + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    document.querySelectorAll('#main-nav .nav-pill').forEach(nav => {
        nav.classList.remove('active-nav');
    });

    const activeNav = document.querySelector(`#main-nav [data-page="${pageName}"]`);
    if (activeNav) {
        activeNav.classList.add('active-nav');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('#main-nav .nav-pill').forEach(navLink => {
    navLink.addEventListener('click', function(e) {
        e.preventDefault();
        const pageName = this.getAttribute('data-page');
        navigateToPage(pageName);
    });
});

document.querySelectorAll('.footer a[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageName = this.getAttribute('data-page');
        navigateToPage(pageName);
    });
});

/* ------------------------------
   2. Login Page Logic
------------------------------ */
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (loginBtn && signupBtn) {
    loginBtn.type = "button";
    signupBtn.type = "button";

    loginBtn.onclick = () => {
        loginBtn.classList.add("active");
        signupBtn.classList.remove("active");
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
    };

    signupBtn.onclick = () => {
        signupBtn.classList.add("active");
        loginBtn.classList.remove("active");
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    };
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    const box = icon.parentElement;

    if (input.type === "password") {
        input.type = "text";
        box.classList.add("active");
    } else {
        input.type = "password";
        box.classList.remove("active");
    }
}

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const inputs = signupForm.querySelectorAll("input[type='text']");
        const fullName = inputs[0].value.trim();
        const empId = inputs[1].value.trim();
        const email = signupForm.querySelector("input[type='email']").value.trim();
        const password = document.getElementById("signupPass").value;

        const roleSelect = signupForm.querySelector("select");
        const roleMap = {
            "Patient": "Patient",
            "Doctor": "Doctor",
            "Receptionist": "Receptionist",
            "Chemist": "Chemist"
        };
        const role = roleMap[roleSelect.value];

        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: fullName,
                    emp_id: empId,
                    email,
                    password,
                    role
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Signup failed");
                return;
            }

            alert("Signup successful!");
            loginBtn.click();
        } catch (err) {
            alert("Signup service unavailable");
            console.error(err);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const identifier = loginForm.querySelector("input[type='text']").value.trim();
        const password = document.getElementById("loginPass").value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Login failed");
                return;
            }

            window.location.href = data.redirect_to;
        } catch (err) {
            alert("Login service unavailable");
            console.error(err);
        }
    });
}

/* ------------------------------
   3. MedAI Logic
------------------------------ */
const analyzeBtn = document.getElementById("analyzeBtn");
const symptomsInput = document.getElementById("symptoms");
const resultBox = document.getElementById("resultBox");
const appointmentCTA = document.getElementById("appointmentCTA");
const addReportBtn = document.querySelector(".add-report-btn");
const reportInput = document.getElementById("reportInput");

if (addReportBtn && reportInput) {
    addReportBtn.addEventListener("click", () => {
        reportInput.click();
    });

    reportInput.addEventListener("change", () => {
        if (reportInput.files.length > 0) {
            const fileName = reportInput.files[0].name;
            addReportBtn.textContent = "✔";
            addReportBtn.title = `Attached: ${fileName}`;
        }
    });
}

if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
        const text = symptomsInput.value.trim();
        if (!text) return alert("Please describe your symptoms");

        resultBox.className = "hidden";
        appointmentCTA?.classList.add("hidden");
        analyzeBtn.innerText = "Analyzing…";
        analyzeBtn.disabled = true;

        const formData = new FormData();
        formData.append("symptoms_text", text);

        if (reportInput && reportInput.files.length > 0) {
            formData.append("report_file", reportInput.files[0]);
        }

        try {
            const res = await fetch(`${MEDAI_API}/api/medai/analyze`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Backend error");

            const data = await res.json();

            resultBox.className = `result-${data.priority}`;
            resultBox.innerHTML = `
                <b>Severity:</b> ${data.priority.toUpperCase()}<br><br>
                <b>Recommended Doctor:</b> ${data.doctor.name}<br>
                <b>Department:</b> ${data.doctor.department}<br>
                <b>Room:</b> ${data.doctor.room}<br><br>
                ${data.message}
            `;

            appointmentCTA?.classList.remove("hidden");

        } catch (err) {
            alert("MedAI service unavailable. Try again later.");
            console.error(err);
        } finally {
            analyzeBtn.innerText = "Analyze with MedAI";
            analyzeBtn.disabled = false;
        }
    });
}

if (appointmentCTA) {
    appointmentCTA.addEventListener("click", () => {
        window.location.href = "../PatientPortal-Satyam/book_appointment.html";
    });
}

/* ------------------------------
   4. Emergency Page - Copy on Click
------------------------------ */
document.querySelectorAll("#emergency-page .ref-card b").forEach(item => {
    item.addEventListener("click", () => {
        const value = item.innerText;
        navigator.clipboard.writeText(value);
        alert("Copied: " + value);
    });
});

/* ------------------------------
   5. Support Page - EmailJS Integration
------------------------------ */
(function () {
    emailjs.init("v7zVpOEkaGa1K_-zW");
})();

const supportFormEl = document.getElementById("supportForm");
if (supportFormEl) {
    supportFormEl.addEventListener("submit", function (e) {
        e.preventDefault();
        const btn = supportFormEl.querySelector("button");
        btn.disabled = true;
        btn.innerText = "Sending...";

        emailjs.sendForm(
            "service_6k62v7w",
            "template_6ook6jc",
            this
        ).then(
            function () {
                alert("✅ Message sent successfully");
                supportFormEl.reset();
                btn.disabled = false;
                btn.innerText = "Submit";
            },
            function (error) {
                console.error("EmailJS Error:", error);
                alert("❌ Failed to send message");
                btn.disabled = false;
                btn.innerText = "Submit";
            }
        );
    });
}

/* ------------------------------
   6. Home Page Interactivity
------------------------------ */
document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.boxShadow = "0 0 20px rgba(99,102,241,0.7)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
    });
});

document.querySelectorAll(".symptom-list li").forEach(item => {
    item.addEventListener("click", () => {
        alert("⚠️ This symptom is a medical emergency.\nPlease seek immediate help!");
    });
});

/* ------------------------------
   7. Initialize & Handle Hash Navigation
------------------------------ */

// CRITICAL: Check hash IMMEDIATELY before DOM loads
(function() {
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'login', 'medai', 'emergency', 'support'];
    
    // Store the target page for later
    if (hash && validPages.includes(hash)) {
        window.initialPage = hash;
    } else {
        window.initialPage = 'home';
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // Navigate to the stored initial page
    navigateToPage(window.initialPage || 'home');
});

// Also handle hash changes when user uses browser back/forward
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'login', 'medai', 'emergency', 'support'];
    
    if (hash && validPages.includes(hash)) {
        navigateToPage(hash);
    }
});