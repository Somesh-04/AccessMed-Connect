// Grab elements
const btnLogin = document.getElementById("btn-login");
const btnSignup = document.getElementById("btn-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const resetForm = document.getElementById("reset-form");

const switchToSignup = document.getElementById("switch-to-signup");
const switchToLogin = document.getElementById("switch-to-login");
const switchResetLogin = document.getElementById("switch-reset-login");
const forgotBtn = document.getElementById("forgot-btn");

// Form switch helpers
function showLogin() {
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
    resetForm.classList.remove("active");
    btnLogin.classList.add("active");
    btnSignup.classList.remove("active");
}

function showSignup() {
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
    resetForm.classList.remove("active");
    btnSignup.classList.add("active");
    btnLogin.classList.remove("active");
}

function showReset() {
    resetForm.classList.add("active");
    loginForm.classList.remove("active");
    signupForm.classList.remove("active");
    btnLogin.classList.remove("active");
    btnSignup.classList.remove("active");
}

// Bind click events (check null to avoid console errors)
if (btnLogin) btnLogin.onclick = showLogin;
if (btnSignup) btnSignup.onclick = showSignup;
if (switchToSignup) switchToSignup.onclick = showSignup;
if (switchToLogin) switchToLogin.onclick = showLogin;
if (switchResetLogin) switchResetLogin.onclick = showLogin;
if (forgotBtn) forgotBtn.onclick = showReset;

// Eye icon – show/hide password
document.querySelectorAll(".eye-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const input = btn.parentElement.querySelector("input");
        if (!input) return;
        if (input.type === "password") {
            input.type = "text";
            btn.classList.add("visible");
        } else {
            input.type = "password";
            btn.classList.remove("visible");
        }
    });
});
