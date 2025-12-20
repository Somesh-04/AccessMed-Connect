const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

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
