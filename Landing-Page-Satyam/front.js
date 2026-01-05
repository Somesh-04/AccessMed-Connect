console.log("🔥 front.js loaded");

/* ============================
   CONSTANTS
============================ */
const API_BASE = "http://127.0.0.1:5000/api/auth";

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
       LOGIN HANDLER
    ============================ */
    loginForm.addEventListener("submit", async e => {
        e.preventDefault();

        const identifier = loginForm.querySelector("input[type='text']").value.trim();
        const password = document.getElementById("loginPass").value.trim();

        if (!identifier || !password) return alert("Fill all fields");

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password })
            });

            const data = await res.json();

            if (!res.ok) return alert(data.error || "Login failed");

            // save user
            localStorage.setItem("amc_user", JSON.stringify(data.user));

            // redirect by backend
            window.location.href = data.redirect_to;

        } catch (err) {
            console.error(err);
            alert("Unable to connect to server");
        }
    });

    /* ============================
       SIGNUP HANDLER  (NO HTML ID NEEDED)
    ============================ */
    signupForm.addEventListener("submit", async e => {
        e.preventDefault();

        // inputs INSIDE signup form (no id dependency)
        const inputs = signupForm.querySelectorAll("input");
        const selects = signupForm.querySelectorAll("select");

        const full_name = inputs[0].value.trim();   // Full Name
        const emp_id_raw = inputs[1].value.trim();  // Emp ID
        const role = selects[0].value;              // Role dropdown
        const email = inputs[2].value.trim();       // Email
        const password = inputs[3].value.trim();    // Password

        if (!full_name || !emp_id_raw || !role || !email || !password) {
            alert("Fill all fields");
            return;
        }

        // convert employee id to bigint
        const emp_id = Number(emp_id_raw);

        if (isNaN(emp_id)) {
            alert("Employee ID must contain digits only");
            return;
        }

        // backend role validation
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
            openLogin(); // switch to login tab

        } catch (err) {
            console.error(err);
            alert("Unable to connect to server");
        }
    });

});

/* ============================
   OPEN PAGE VIA HASH
============================ */
document.addEventListener("DOMContentLoaded", function () {
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
