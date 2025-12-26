function switchSection(sectionId, el = null) {

    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });

    document.getElementById(sectionId).style.display = 'block';

    document.querySelectorAll('.nav-pill').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');

    const bookNav = document.getElementById('bookNav');

    if (sectionId === 'appointment') {
        bookNav.style.display = 'inline-flex';
        bookNav.classList.add('active');
    } else {
        bookNav.style.display = 'none';
    }
}

function openAppointment() {
    switchSection('appointment');
}

function logout() {
    window.location.href = "/logout";
}

window.onload = () => {
    switchSection('dashboard');
};
