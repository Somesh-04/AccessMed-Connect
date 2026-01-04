from flask import Blueprint, request, jsonify
from db import get_db

patients_bp = Blueprint("patients", __name__)

@patients_bp.route("/patient/lookup", methods=["GET"])
def lookup_patient():
    emp_id = request.args.get("emp_id")

    if not emp_id:
        return jsonify({"error": "Employee ID required"}), 400

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        select id, name, emp_id
        from patients
        where emp_id = %s;
    """, (emp_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Patient not found"}), 404

    return jsonify({
        "patient_id": row[0],
        "name": row[1],
        "emp_id": row[2]
    })
