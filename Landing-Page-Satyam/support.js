/* ==============================
   EMAILJS SUPPORT FORM SCRIPT
============================== */

(function () {
    emailjs.init("v7zVpOEkaGa1K_-zW"); 
})();

const form = document.getElementById("supportForm");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.innerText = "Sending...";

    emailjs.sendForm(
        "service_6k62v7w",
        "template_6ook6jc",
        this                
    ).then(
        function () {
            alert("✅ Message sent successfully");
            form.reset();
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
