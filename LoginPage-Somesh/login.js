// ====== TOGGLE BUTTONS ======
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

// ====== EYE TOGGLE ======
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

const API = "http://127.0.0.1:5000";


// ====== LOGIN ======
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = loginForm.querySelector("input[type='text']").value;
  const password = document.getElementById("loginPass").value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: identifier,
      password: password
    })
  });

  const data = await res.json();

  if (!res.ok) return alert(data.error || "Login failed");

  window.location.href = data.redirect_to;
});


// ====== SIGNUP ======
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = signupForm.querySelectorAll("input")[0].value;
  const empId = signupForm.querySelectorAll("input")[1].value;
  const roleLabel = signupForm.querySelector("select").value;
  const email = signupForm.querySelector("input[type='email']").value;
  const password = document.getElementById("signupPass").value;

  const roleMap = {
    "Patient": "patient",
    "Doctor": "doctor",
    "Dispensary Manager": "dispensary",
    "Receptionist": "reception"
  };

  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: fullName,
      emp_id: empId,
      role: roleMap[roleLabel],
      email: email,
      password: password
    })
  });

  const data = await res.json();

  if (!res.ok) return alert(data.error || "Signup failed");

  alert("Signup successful. Please login.");
  loginBtn.onclick();
});
