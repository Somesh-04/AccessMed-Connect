from flask import Blueprint, request, jsonify
from db import get_db
from datetime import date
import uuid

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/medicine-orders", methods=["POST"])
def create_order():
    data = request.json
    patient_id = data.get("patient_id")
    items = data.get("items")

    if not patient_id or not items:
        return jsonify({"error": "Invalid request"}), 400

    conn = get_db()
    cur = conn.cursor()

    try:
        # patient must exist
        cur.execute("select 1 from patients where id = %s;", (patient_id,))
        if not cur.fetchone():
            conn.rollback()
            return jsonify({"error": "Patient not found"}), 400

        order_id = str(uuid.uuid4())
        cur.execute("""
            insert into medicine_orders (id, patient_id, status)
            values (%s, %s, 'completed');
        """, (order_id, patient_id))

        today = date.today()

        for item in items:
            mid = item.get("medicine_id")
            qty = item.get("quantity")

            if not mid or not qty or qty <= 0:
                conn.rollback()
                return jsonify({"error": "Invalid item quantity"}), 400

            cur.execute("""
                select quantity_in_stock, expiry_date
                from medicines
                where medicine_id = %s;
            """, (mid,))
            med = cur.fetchone()

            if not med:
                conn.rollback()
                return jsonify({"error": "Medicine not found"}), 400

            stock, expiry = med

            if expiry < today:
                conn.rollback()
                return jsonify({"error": "Expired medicine"}), 400

            if stock < qty:
                conn.rollback()
                return jsonify({"error": "Insufficient stock"}), 400

            cur.execute("""
                update medicines
                set quantity_in_stock = quantity_in_stock - %s,
                    last_updated = now()
                where medicine_id = %s;
            """, (qty, mid))

            cur.execute("""
                insert into medicine_order_items
                (id, order_id, medicine_id, quantity, dosage, remarks)
                values (%s, %s, %s, %s, %s, %s);
            """, (
                str(uuid.uuid4()),
                order_id,
                mid,
                qty,
                item.get("dosage"),
                item.get("remarks")
            ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"success": True, "order_id": order_id})

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 500
