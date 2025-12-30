/* ======================================================
   MEDAI – INTERACTIVITY & LOGIC
   ====================================================== */

/* ------------------------------
   1. Active Navigation Highlight
------------------------------ */
const navLinks = document.querySelectorAll(".nav-pill");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(n => n.classList.remove("active-nav"));
    link.classList.add("active-nav");
  });
});

/* ------------------------------
   2. Glow + Bounce on Cards
------------------------------ */
document.querySelectorAll(".ref-card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "scale(1.04)";
    card.style.boxShadow = "0 0 30px rgba(99,102,241,0.6)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "scale(1)";
    card.style.boxShadow = "0 12px 35px rgba(0,0,0,.55)";
  });
});

/* ------------------------------
   3. Smooth Reveal on Scroll
------------------------------ */
const revealItems = document.querySelectorAll(".ref-card");

function revealOnScroll() {
  const trigger = window.innerHeight * 0.9;

  revealItems.forEach(el => {
    const top = el.getBoundingClientRect().top;

    if (top < trigger) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.transition = "0.6s ease";
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* ------------------------------
   4. MedAI Core Logic
------------------------------ */
const analyzeBtn = document.getElementById("analyzeBtn");
const symptomsInput = document.getElementById("symptoms");
const resultBox = document.getElementById("resultBox");
const appointmentCTA = document.getElementById("appointmentCTA");

analyzeBtn?.addEventListener("click", async () => {
  const text = symptomsInput.value.trim();
  if (!text) return alert("Please describe your symptoms");

  resultBox.className = "hidden";
  appointmentCTA?.classList.add("hidden");
  analyzeBtn.innerText = "Analyzing…";
  analyzeBtn.disabled = true;

  // ✅ CHANGED: use FormData instead of JSON
  const formData = new FormData();
  formData.append("symptoms_text", text);

  if (reportInput && reportInput.files.length > 0) {
    formData.append("report_file", reportInput.files[0]);
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/medai/analyze", {
      method: "POST",
      body: formData   // ✅ CHANGED
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

    saveToHistory(text, data);
    appointmentCTA?.classList.remove("hidden");


  } catch (err) {
    alert("MedAI service unavailable. Try again later.");
    console.error(err);
  } finally {
    analyzeBtn.innerText = "Analyze with MedAI";
    analyzeBtn.disabled = false;
  }
});

/* ------------------------------
   Add Report (File Upload Trigger)
------------------------------ */

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


/* ------------------------------
   5. Sidebar History (ChatGPT-like)
------------------------------ */
const historyList = document.getElementById("historyList");
const HISTORY_KEY = "medai_history";

function loadHistory() {
  if (!historyList) return;

  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  historyList.innerHTML = "";

  history.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item.symptoms.slice(0, 30) + "...";

    li.onclick = () => showHistoryItem(item);

    const del = document.createElement("span");
    del.className = "delete-btn";
    del.innerHTML = "×";

    del.onclick = (e) => {
      e.stopPropagation(); // prevent loading the history item
      history.splice(index, 1);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      loadHistory();
    };

    li.appendChild(del);
    historyList.appendChild(li);
  });
}

function saveToHistory(symptoms, result) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  history.unshift({
    symptoms: symptoms.charAt(0).toUpperCase() + symptoms.slice(1),
    result,
    time: new Date().toLocaleString()
  });

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  loadHistory();
}

function showHistoryItem(item) {
  resultBox.className = `result-${item.result.priority}`;
  resultBox.innerHTML = `
  <b>Severity:</b> ${item.result.priority.toUpperCase()}<br><br>
  <b>Recommended Doctor:</b> ${item.result.doctor.name}<br>
  <b>Department:</b> ${item.result.doctor.department}<br>
  <b>Room:</b> ${item.result.doctor.room}<br><br>
  ${item.result.message}
`;
}

loadHistory();
/* ===============================
   Sidebar Toggle Logic
=============================== */

const sidebarToggle = document.getElementById("sidebarToggle");
const bodyEl = document.body;

sidebarToggle.addEventListener("click", () => {
  bodyEl.classList.toggle("sidebar-hidden");
});

const appointmentCTAEl = document.getElementById("appointmentCTA");

appointmentCTAEl?.addEventListener("click", () => {
  // 🔗 Simple redirect to appointment portal
  window.location.href = "../PatientPortal-Satyam/book_appointment.html";
});