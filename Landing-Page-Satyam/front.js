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
       SIGNUP HANDLER
    ============================ */
    signupForm.addEventListener("submit", async e => {
        e.preventDefault();

        const full_name = document.getElementById("signupName").value.trim();
        const emp_id = document.getElementById("signupEmp").value.trim();
        const role = document.getElementById("signupRole").value;
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPass").value.trim();

        if (!full_name || !emp_id || !role || !email || !password)
            return alert("Fill all fields");

        try {
            const res = await fetch(`${API_BASE}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name, emp_id, role, email, password })
            });

            const data = await res.json();

            if (!res.ok) return alert(data.error || "Signup failed");

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
