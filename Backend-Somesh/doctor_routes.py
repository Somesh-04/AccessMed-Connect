from flask import Blueprint, jsonify, request
import psycopg2

doctor_bp = Blueprint("doctor", __name__)

def get_db():
    return psycopg2.connect(
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

@doctor_bp.route("/doctor/by-user/<user_id>")
def doctor_by_user(user_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM doctors WHERE user_id = %s", (user_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Doctor not found"}), 404

    return jsonify({"doctor_id": row[0], "name": row[1]})

@doctor_bp.route("/dashboard")
def dashboard():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM doctors WHERE user_id = %s", (user_id,))
    doctor = cur.fetchone()
    if not doctor:
        cur.close()
        conn.close()
        return jsonify({"doctor_name": "", "appointments": 0, "patients": 0, "reports": 0})

    doctor_id, doctor_name = doctor
    cur.execute("SELECT COUNT(*) FROM appointments WHERE doctor_id = %s", (doctor_id,))
    appointments = cur.fetchone()[0]

    cur.execute("SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = %s", (doctor_id,))
    patients = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM reports WHERE doctor_id = %s", (doctor_id,))
    reports = cur.fetchone()[0]

    cur.close()
    conn.close()

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

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id, p.name
        FROM patients p
        JOIN appointments a ON a.patient_id = p.id
        JOIN doctors d ON d.id = a.doctor_id
        WHERE d.user_id = %s
        GROUP BY p.id, p.name
        ORDER BY p.name
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([{"id": r[0], "name": r[1]} for r in rows])

@doctor_bp.route("/reports")
def reports_by_doctor():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify([])

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT r.name, r.file_url, p.name
        FROM reports r
        JOIN doctors d ON d.id = r.doctor_id
        JOIN users u ON u.id = d.user_id
        JOIN patients p ON p.id = r.patient_id
        WHERE u.id = %s
        ORDER BY r.name
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([{"name": r[0], "file_url": r[1], "patient_name": r[2]} for r in rows])

@doctor_bp.route("/reports/<patient_id>")
def reports_by_patient(patient_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT name, file_url FROM reports WHERE patient_id = %s ORDER BY name", (patient_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([{"name": r[0], "file_url": r[1]} for r in rows])

@doctor_bp.route("/medicines/search/<query>")
def search_medicine(query):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT medicine_name, quantity_in_stock, expiry_date
        FROM medicines
        WHERE medicine_name ILIKE %s
        ORDER BY medicine_name
    """, (f"%{query}%",))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([{"name": r[0], "stock": r[1], "expiry": r[2].isoformat()} for r in rows])
