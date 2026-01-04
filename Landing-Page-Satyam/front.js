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
        document.querySelector(`#main-nav [data-page='${page}']`).classList.add("active-nav");

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => showPage(btn.dataset.page));
    });

    // default on load
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

            if (!res.ok) {
                alert(data.error || "Login failed");
                return;
            }

            // Save user for portals
            localStorage.setItem("amc_user", JSON.stringify(data.user));

            // Redirect based on role
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
        const full_name = inputs[0].value.trim();
        const emp_id = inputs[1].value.trim();
        const role = signupForm.querySelector("select").value;
        const email = inputs[2].value.trim();
        const password = document.getElementById("signupPass").value.trim();

        if (!full_name || !emp_id || !email || !password || !role) {
            alert("Fill all fields");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name, emp_id, email, password, role })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Signup failed");
                return;
            }

            alert("Signup successful — Login now");
            openLogin();

        } catch (err) {
            console.error(err);
            alert("Unable to connect to server");
        }
    });
});
