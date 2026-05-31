from flask import Blueprint, jsonify, request
from datetime import date
from sqlalchemy import text
from models import db

medicines_bp = Blueprint("medicines", __name__)

@medicines_bp.route("/medicines")
def list_medicines():
    result = db.session.execute(text("""
        select medicine_id, medicine_name, category,
               quantity_in_stock, reorder_level, expiry_date
        from medicines
        order by medicine_name;
    """))
    rows = result.fetchall()
    today = date.today()

    return jsonify([
        {
            "id": r[0],
            "name": r[1],
            "category": r[2],
            "quantity": r[3],
            "low": r[3] <= r[4],
            "expired": r[5] < today
        }
        for r in rows
    ])

@medicines_bp.route("/medicines", methods=["POST"])
def add_medicine():
    data = request.json

    required = [
        "medicine_name", "generic_name", "category",
        "manufacturer", "batch_no", "expiry_date",
        "quantity_in_stock", "unit_price",
        "reorder_level", "storage_location",
        "prescription_required"
    ]

    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    try:
        expiry = date.fromisoformat(data["expiry_date"])
    except ValueError:
        return jsonify({"error": "Invalid expiry date format"}), 400

    if expiry < date.today():
        return jsonify({"error": "Expiry date cannot be in the past"}), 400

    if data["quantity_in_stock"] < 0:
        return jsonify({"error": "Quantity cannot be negative"}), 400

    try:
        db.session.execute(text("""
            insert into medicines (
                medicine_name, generic_name, category,
                manufacturer, batch_no, expiry_date,
                quantity_in_stock, unit_price,
                reorder_level, storage_location,
                prescription_required
            )
            values (:medicine_name, :generic_name, :category,
                    :manufacturer, :batch_no, :expiry_date,
                    :quantity_in_stock, :unit_price,
                    :reorder_level, :storage_location,
                    :prescription_required)
        """), {
            "medicine_name": data["medicine_name"],
            "generic_name": data["generic_name"],
            "category": data["category"],
            "manufacturer": data["manufacturer"],
            "batch_no": data["batch_no"],
            "expiry_date": data["expiry_date"],
            "quantity_in_stock": data["quantity_in_stock"],
            "unit_price": data["unit_price"],
            "reorder_level": data["reorder_level"],
            "storage_location": data["storage_location"],
            "prescription_required": data["prescription_required"]
        })
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
