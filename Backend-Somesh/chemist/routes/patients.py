from flask import Blueprint, request, jsonify
from sqlalchemy import text
from models import db

patients_bp = Blueprint("patients", __name__)

@patients_bp.route("/patient/lookup", methods=["GET"])
def lookup_patient():
    emp_id = request.args.get("emp_id")

    if not emp_id:
        return jsonify({"error": "Employee ID required"}), 400

    result = db.session.execute(
        text("""
            select id, name, emp_id
            from patients
            where emp_id = :emp_id;
        """),
        {"emp_id": emp_id}
    )
    row = result.fetchone()

    if not row:
        return jsonify({"error": "Patient not found"}), 404

    return jsonify({
        "patient_id": row[0],
        "name": row[1],
        "emp_id": row[2]
    })
