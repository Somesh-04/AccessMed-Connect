from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

app = Flask(__name__)
CORS(app)


def get_conn():
    return psycopg.connect(
        DATABASE_URL,
        sslmode="require",
        connect_timeout=5
    )

# ============================
# DASHBOARD STATS
# ============================
@app.route("/api/dashboard")
def dashboard():
    today = datetime.today().date()

    with get_conn() as conn:
        with conn.cursor() as cur:

            # Total doctors
            cur.execute("SELECT COUNT(*) FROM doctors")
            total_doctors = cur.fetchone()[0]

            # Appointments today
            cur.execute(
                "SELECT COUNT(*) FROM appointments WHERE date = %s",
                (today,)
            )
            appointments_today = cur.fetchone()[0]

    return {
        "totalDoctors": total_doctors,
        "appointmentsToday": appointments_today,
        "patientsWaiting": appointments_today,
        "currentlyServing": 0
    }


# ============================
# HEALTH CHECK
# ============================
@app.route("/api/health")
def health():
    return {"status": "ok"}


# ============================
# DEPARTMENTS (REQUIRED)
# ============================
@app.route("/api/departments")
def get_departments():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, name
                FROM departments
                ORDER BY name
            """)
            rows = cur.fetchall()

    return jsonify([
        {"id": r[0], "name": r[1]}
        for r in rows
    ])


# ============================
# AVAILABLE DOCTORS BY DEPT + DATE
# ============================
@app.route("/api/available-doctors")
def available_doctors():
    department_id = request.args.get("department_id")
    date_str = request.args.get("date")

    if not department_id or not date_str:
        return {"error": "Missing department_id or date"}, 400

    # ISO weekday: Monday=1 ... Sunday=7
    weekday = datetime.strptime(date_str, "%Y-%m-%d").isoweekday()

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT d.id, d.name
                FROM doctors d
                JOIN doctor_availability da
                  ON da.doctor_id = d.id
                WHERE d.department_id = %s
                  AND da.day_of_week = %s
                  AND da.is_available = true
                ORDER BY d.name
            """, (department_id, weekday))

            rows = cur.fetchall()

    return jsonify([
        {"id": r[0], "name": r[1]}
        for r in rows
    ])


# ============================
# BOOK APPOINTMENT
# ============================
@app.route("/api/book-appointment", methods=["POST"])
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
                    data["patient_id"],
                    data["doctor_id"],
                    data["date"],
                    data["reason"],
                    data["patient_name"]
                ))
                conn.commit()

        return {"message": "Appointment booked"}, 201

    except Exception as e:
        return {
            "error": "Database error",
            "details": str(e)
        }, 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
