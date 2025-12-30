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

document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://127.0.0.1:5000";

  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginBtn.type = "button";
  signupBtn.type = "button";

  // TOGGLE
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

  // SIGNUP
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
  });

  // LOGIN (email OR emp_id)
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = loginForm.querySelector("input[type='text']").value.trim();
    const password = document.getElementById("loginPass").value;

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
  });
});
