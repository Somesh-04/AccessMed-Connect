from flask import Blueprint, jsonify, request
from sqlalchemy import text
from models import db

doctor_bp = Blueprint("doctor", __name__)

@doctor_bp.route("/doctor/by-user/<user_id>")
def doctor_by_user(user_id):
    result = db.session.execute(
        text("SELECT id, name FROM doctors WHERE user_id = :user_id"),
        {"user_id": user_id}
    )
    row = result.fetchone()

    if not row:
        return jsonify({"error": "Doctor not found"}), 404

    return jsonify({"doctor_id": row[0], "name": row[1]})

@doctor_bp.route("/dashboard")
def dashboard():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    result = db.session.execute(
        text("SELECT id, name FROM doctors WHERE user_id = :user_id"),
        {"user_id": user_id}
    )
    doctor = result.fetchone()
    if not doctor:
        return jsonify({"doctor_name": "", "appointments": 0, "patients": 0, "reports": 0})

    doctor_id, doctor_name = doctor

    appointments = db.session.execute(
        text("SELECT COUNT(*) FROM appointments WHERE doctor_id = :doctor_id"),
        {"doctor_id": doctor_id}
    ).scalar()

    patients = db.session.execute(
        text("SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = :doctor_id"),
        {"doctor_id": doctor_id}
    ).scalar()

    reports = db.session.execute(
        text("SELECT COUNT(*) FROM reports WHERE doctor_id = :doctor_id"),
        {"doctor_id": doctor_id}
    ).scalar()

    return jsonify({
        "doctor_name": doctor_name,
        "appointments": appointments,
        "patients": patients,
        "reports": reports
    })

@doctor_bp.route("/patients")
def patients():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify([])

    result = db.session.execute(
        text("""
            SELECT p.id, p.name
            FROM patients p
            JOIN appointments a ON a.patient_id = p.id
            JOIN doctors d ON d.id = a.doctor_id
            WHERE d.user_id = :user_id
            GROUP BY p.id, p.name
            ORDER BY p.name
        """),
        {"user_id": user_id}
    )
    rows = result.fetchall()

    return jsonify([{"id": r[0], "name": r[1]} for r in rows])

@doctor_bp.route("/reports")
def reports_by_doctor():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify([])

    result = db.session.execute(
        text("""
            SELECT r.name, r.file_url, p.name
            FROM reports r
            JOIN doctors d ON d.id = r.doctor_id
            JOIN users u ON u.id = d.user_id
            JOIN patients p ON p.id = r.patient_id
            WHERE u.id = :user_id
            ORDER BY r.name
        """),
        {"user_id": user_id}
    )
    rows = result.fetchall()

    return jsonify([{"name": r[0], "file_url": r[1], "patient_name": r[2]} for r in rows])

@doctor_bp.route("/reports/<patient_id>")
def reports_by_patient(patient_id):
    result = db.session.execute(
        text("SELECT name, file_url FROM reports WHERE patient_id = :patient_id ORDER BY name"),
        {"patient_id": patient_id}
    )
    rows = result.fetchall()

    return jsonify([{"name": r[0], "file_url": r[1]} for r in rows])

@doctor_bp.route("/medicines/search/<query>")
def search_medicine(query):
    result = db.session.execute(
        text("""
            SELECT medicine_name, quantity_in_stock, expiry_date
            FROM medicines
            WHERE medicine_name ILIKE :query
            ORDER BY medicine_name
        """),
        {"query": f"%{query}%"}
    )
    rows = result.fetchall()

    return jsonify([{"name": r[0], "stock": r[1], "expiry": r[2].isoformat()} for r in rows])
