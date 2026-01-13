console.log("🔥 front.js loaded");

/* ============================
   CONSTANTS
============================ */
const API_BASE = "http://127.0.0.1:5003/api/auth";

/* ============================
   PAGE NAVIGATION
============================ */
document.addEventListener("DOMContentLoaded", () => {

    const pages = document.querySelectorAll(".page-content");
    const navButtons = document.querySelectorAll("#main-nav .nav-pill");

    function showPage(page) {
        pages.forEach(p => p.classList.remove("active"));
        document.getElementById(`${page}-page`).classList.add("active");

        navButtons.forEach(n => n.classList.remove("active-nav"));
        document
            .querySelector(`#main-nav [data-page='${page}']`)
            .classList.add("active-nav");

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => showPage(btn.dataset.page));
    });

    showPage("home");

    /* ============================
       LOGIN / SIGNUP TOGGLE
    ============================ */
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    function openLogin() {
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        loginBtn.classList.add("active");
        signupBtn.classList.remove("active");
    }

    function openSignup() {
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        signupBtn.classList.add("active");
        loginBtn.classList.remove("active");
    }

    loginBtn.addEventListener("click", openLogin);
    signupBtn.addEventListener("click", openSignup);

    /* ============================
       PASSWORD SHOW / HIDE
    ============================ */
    window.togglePassword = function (id) {
        const field = document.getElementById(id);
        field.type = field.type === "password" ? "text" : "password";
    };

    /* ============================
       LOGIN HANDLER  (FIXED)
    ============================ */
    loginForm.addEventListener("submit", async e => {
        e.preventDefault();

        const identifier = loginForm.querySelector("input[type='text']").value.trim();
        const password = document.getElementById("loginPass").value.trim();

        if (!identifier || !password) {
            alert("Fill all fields");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Login failed");
                return;
            }

            /* ----------------------------
               STORE USER (GENERIC)
            ----------------------------- */
            localStorage.setItem("amc_user", JSON.stringify(data.user));

            /* ----------------------------
               STORE DOCTOR (CRITICAL FIX)
            ----------------------------- */
            if (data.user.role === "Doctor") {
                localStorage.setItem(
                    "amc_doctor",
                    JSON.stringify({
                        id: data.user.doctor_id || data.user.id,
                        name: data.user.full_name
                    })
                );
            }

            window.location.href = data.redirect_to;

        } catch (err) {
            console.error(err);
            alert("Unable to connect to server");
        }
    });

    /* ============================
       SIGNUP HANDLER
    ============================ */
    signupForm.addEventListener("submit", async e => {
        e.preventDefault();

        const inputs = signupForm.querySelectorAll("input");
        const selects = signupForm.querySelectorAll("select");

        const full_name = inputs[0].value.trim();
        const emp_id_raw = inputs[1].value.trim();
        const role = selects[0].value;
        const email = inputs[2].value.trim();
        const password = inputs[3].value.trim();

        if (!full_name || !emp_id_raw || !role || !email || !password) {
            alert("Fill all fields");
            return;
        }

        const emp_id = Number(emp_id_raw);
        if (isNaN(emp_id)) {
            alert("Employee ID must contain digits only");
            return;
        }

        const allowedRoles = ["Doctor", "Patient", "Receptionist", "Chemist"];
        if (!allowedRoles.includes(role)) {
            alert("Invalid role selected");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name,
                    emp_id,
                    role,
                    email,
                    password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Signup failed");
                return;
            }

            alert("Signup successful — please login now");
            openLogin();

        } catch (err) {
            console.error(err);
            alert("Unable to connect to server");
        }
    });

});

/* ============================
   OPEN PAGE VIA HASH
============================ */
document.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash;
    if (!hash) return;

    const page = hash.replace("#", "").replace("-page", "");

    const navBtn = document.querySelector(`#main-nav [data-page='${page}']`);
    if (navBtn) navBtn.click();

    if (page === "login") {
        const loginBtn = document.getElementById("loginBtn");
        if (loginBtn) loginBtn.click();
    }
});

/* ============================
   SUPPORT FORM — EMAILJS (ADDED)
============================ */
document.addEventListener("DOMContentLoaded", () => {
    const supportForm = document.getElementById("supportForm");
    const statusEl = document.getElementById("formStatus");

    if (!supportForm) return;

    supportForm.addEventListener("submit", function (e) {
        e.preventDefault();

        statusEl.textContent = "Sending...";

        const params = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            message: document.getElementById("message").value.trim()
        };

        emailjs
            .send("service_6k62v7w", "template_6ook6jc", params)
            .then(() => {
                statusEl.textContent = "Message sent successfully.";
                supportForm.reset();
            })
            .catch(err => {
                console.error("EmailJS Error:", err);
                statusEl.textContent = "Failed to send message. Try again later.";
            });
    });
});
