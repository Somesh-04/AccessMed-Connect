from flask import Blueprint, jsonify
from datetime import date
from chemist.db import get_db

medicines_bp = Blueprint("medicines", __name__)

@medicines_bp.route("/medicines")
def list_medicines():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        select medicine_id, medicine_name, category,
               quantity_in_stock, reorder_level, expiry_date
        from medicines
        order by medicine_name;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

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

from flask import request
from datetime import date

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

    expiry = date.fromisoformat(data["expiry_date"])
    if expiry < date.today():
        return jsonify({"error": "Expiry date cannot be in the past"}), 400

    if data["quantity_in_stock"] < 0:
        return jsonify({"error": "Quantity cannot be negative"}), 400

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("""
            insert into medicines (
                medicine_name, generic_name, category,
                manufacturer, batch_no, expiry_date,
                quantity_in_stock, unit_price,
                reorder_level, storage_location,
                prescription_required
            )
            values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data["medicine_name"],
            data["generic_name"],
            data["category"],
            data["manufacturer"],
            data["batch_no"],
            data["expiry_date"],
            data["quantity_in_stock"],
            data["unit_price"],
            data["reorder_level"],
            data["storage_location"],
            data["prescription_required"]
        ))

        conn.commit()
        return jsonify({"success": True})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
