from flask import Blueprint, request, jsonify
from datetime import date
from models import db, User, Patient, Department, Doctor, Appointment

# single consistent blueprint
patient_bp = Blueprint("patient", __name__, url_prefix="/api/patient")


# ---------- helper: get patient uuid ----------
def get_patient_id(emp_id):
    patient = Patient.query.filter_by(emp_id=emp_id).first()
    return patient.id if patient else None


# ---------- GET departments ----------
@patient_bp.route("/departments", methods=["GET"])
def get_departments():
    departments = Department.query.all()

    return jsonify([
        {"id": d.id, "name": d.name}
        for d in departments
    ])


# ---------- GET doctors by department ----------
@patient_bp.route("/doctors/<dept_id>", methods=["GET"])
def get_doctors(dept_id):
    docs = Doctor.query.filter_by(department_id=dept_id).all()

    return jsonify([
        {"id": d.id, "name": d.name}
        for d in docs
    ])


# ---------- CREATE appointment ----------
@patient_bp.route("/appointments", methods=["POST"])
def create_appointment():
    data = request.json or {}

    # -------- validate inputs safely --------
    emp_id = data.get("emp_id")
    doctor_id = data.get("doctor_id")
    appt_date = data.get("date")
    reason = data.get("reason")

    if not emp_id or not doctor_id or not appt_date or not reason:
        return jsonify({"error": "Missing required fields"}), 400

    # -------- resolve patient by EMP ID --------
    patient = Patient.query.filter_by(emp_id=emp_id).first()
    if not patient:
        return jsonify({"error": "Patient not found"}), 400

    # -------- ensure doctor exists --------
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 400

    # -------- ensure date is valid date object --------
    try:
        # HTML sends YYYY-MM-DD string → convert to python date
        appt_date = date.fromisoformat(appt_date)
    except Exception:
        return jsonify({"error": "Invalid date format"}), 400

    # -------- finally create appointment --------
    appt = Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        date=appt_date,
        reason=reason,
        patient_name=patient.name
    )

    db.session.add(appt)
    db.session.commit()

    return jsonify({"message": "Appointment created successfully"}), 201


# ---------- LIST appointments ----------
@patient_bp.route("/appointments/<emp_id>", methods=["GET"])
def get_appointments(emp_id):

    patient_id = get_patient_id(emp_id)

    if not patient_id:
        return jsonify([])

    appts = Appointment.query.filter_by(
        patient_id=patient_id
    ).order_by(Appointment.date.desc()).all()

    results = []

    for a in appts:
        # prevents Dr.undefined
        doc = Doctor.query.get(a.doctor_id)

        results.append({
            "date": str(a.date),
            "doctor": doc.name if doc else "Unknown",
            "reason": a.reason
        })

    return jsonify(results)
