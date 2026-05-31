from flask import Blueprint, request, jsonify
from sqlalchemy import text
from datetime import datetime
from models import db

reception_bp = Blueprint("reception", __name__)

@reception_bp.route("/dashboard")
def dashboard():
    today = datetime.today().date()
    total_doctors = db.session.execute(text("SELECT COUNT(*) FROM doctors")).scalar()
    appointments_today = db.session.execute(
        text("SELECT COUNT(*) FROM appointments WHERE date = :today"),
        {"today": today}
    ).scalar()

    return {
        "totalDoctors": total_doctors,
        "appointmentsToday": appointments_today,
        "patientsWaiting": appointments_today,
        "currentlyServing": 0
    }

@reception_bp.route("/doctors-today")
def doctors_today():
    today_weekday = datetime.today().isoweekday()
    result = db.session.execute(
        text("""
            SELECT d.name, dept.name
            FROM doctors d
            JOIN departments dept ON dept.id = d.department_id
            JOIN doctor_availability da ON da.doctor_id = d.id
            WHERE da.day_of_week = :weekday AND da.is_available = true
            ORDER BY dept.name, d.name
        """),
        {"weekday": today_weekday}
    )
    rows = result.fetchall()

    return jsonify([{"name": r[0], "department": r[1]} for r in rows])

@reception_bp.route("/appointments-today")
def appointments_today():
    today = datetime.today().date()
    result = db.session.execute(
        text("""
            SELECT a.patient_name, d.name
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            WHERE a.date = :today
            ORDER BY a.created_at
        """),
        {"today": today}
    )
    rows = result.fetchall()

    return jsonify([{"patient_name": r[0], "doctor_name": r[1], "status": "Waiting"} for r in rows])

@reception_bp.route("/health")
def health():
    return {"status": "ok"}

@reception_bp.route("/departments")
def get_departments():
    result = db.session.execute(text("SELECT id, name FROM departments ORDER BY name"))
    rows = result.fetchall()

    return jsonify([{"id": r[0], "name": r[1]} for r in rows])

@reception_bp.route("/available-doctors")
def available_doctors():
    department_id = request.args.get("department_id")
    date_str = request.args.get("date")

    if not department_id or not date_str:
        return {"error": "Missing department_id or date"}, 400

    weekday = datetime.strptime(date_str, "%Y-%m-%d").isoweekday()
    result = db.session.execute(
        text("""
            SELECT d.id, d.name
            FROM doctors d
            JOIN doctor_availability da ON da.doctor_id = d.id
            WHERE d.department_id = :dept_id AND da.day_of_week = :weekday AND da.is_available = true
            ORDER BY d.name
        """),
        {"dept_id": department_id, "weekday": weekday}
    )
    rows = result.fetchall()

    return jsonify([{"id": r[0], "name": r[1]} for r in rows])

@reception_bp.route("/book-appointment", methods=["POST"])
def book_appointment():
    data = request.json
    try:
        db.session.execute(
            text("""
                INSERT INTO appointments
                (patient_id, doctor_id, date, reason, patient_name)
                VALUES (:patient_id, :doctor_id, :date, :reason, :patient_name)
            """),
            {
                "patient_id": data["patient_id"],
                "doctor_id": data["doctor_id"],
                "date": data["date"],
                "reason": data["reason"],
                "patient_name": data["patient_name"]
            }
        )
        db.session.commit()
        return {"message": "Appointment booked"}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": "Database error", "details": str(e)}, 500
