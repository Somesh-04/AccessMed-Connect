from flask import Blueprint, request, jsonify
import psycopg
from datetime import datetime

reception_bp = Blueprint("reception", __name__)

def get_conn():
    return psycopg.connect(
        host="db.yfqltffmmvkkxglxyuep.supabase.co",
        port=5432,
        dbname="postgres",
        user="postgres",
        password="SnNaSsBbAs05",
        sslmode="require",
        connect_timeout=10,
        keepalives=1,
        keepalives_idle=30,
        keepalives_interval=10,
        keepalives_count=3
    )

@reception_bp.route("/dashboard")
def dashboard():
    today = datetime.today().date()
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM doctors")
            total_doctors = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM appointments WHERE date = %s", (today,))
            appointments_today = cur.fetchone()[0]

    return {
        "totalDoctors": total_doctors,
        "appointmentsToday": appointments_today,
        "patientsWaiting": appointments_today,
        "currentlyServing": 0
    }

@reception_bp.route("/doctors-today")
def doctors_today():
    today_weekday = datetime.today().isoweekday()
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT d.name, dept.name
                FROM doctors d
                JOIN departments dept ON dept.id = d.department_id
                JOIN doctor_availability da ON da.doctor_id = d.id
                WHERE da.day_of_week = %s AND da.is_available = true
                ORDER BY dept.name, d.name
            """, (today_weekday,))
            rows = cur.fetchall()

    return jsonify([{"name": r[0], "department": r[1]} for r in rows])

@reception_bp.route("/appointments-today")
def appointments_today():
    today = datetime.today().date()
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT a.patient_name, d.name
                FROM appointments a
                JOIN doctors d ON d.id = a.doctor_id
                WHERE a.date = %s
                ORDER BY a.created_at
            """, (today,))
            rows = cur.fetchall()

    return jsonify([{"patient_name": r[0], "doctor_name": r[1], "status": "Waiting"} for r in rows])

@reception_bp.route("/health")
def health():
    return {"status": "ok"}

@reception_bp.route("/departments")
def get_departments():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM departments ORDER BY name")
            rows = cur.fetchall()

    return jsonify([{"id": r[0], "name": r[1]} for r in rows])

@reception_bp.route("/available-doctors")
def available_doctors():
    department_id = request.args.get("department_id")
    date_str = request.args.get("date")

    if not department_id or not date_str:
        return {"error": "Missing department_id or date"}, 400

    weekday = datetime.strptime(date_str, "%Y-%m-%d").isoweekday()
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT d.id, d.name
                FROM doctors d
                JOIN doctor_availability da ON da.doctor_id = d.id
                WHERE d.department_id = %s AND da.day_of_week = %s AND da.is_available = true
                ORDER BY d.name
            """, (department_id, weekday))
            rows = cur.fetchall()

    return jsonify([{"id": r[0], "name": r[1]} for r in rows])

@reception_bp.route("/book-appointment", methods=["POST"])
def book_appointment():
    data = request.json
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO appointments
                    (patient_id, doctor_id, date, reason, patient_name)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    data["patient_id"], data["doctor_id"], data["date"],
                    data["reason"], data["patient_name"]
                ))
                conn.commit()
        return {"message": "Appointment booked"}, 201
    except Exception as e:
        return {"error": "Database error", "details": str(e)}, 500
