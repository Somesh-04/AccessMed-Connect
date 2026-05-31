from flask import Blueprint, request, jsonify
from datetime import date
from sqlalchemy import text
from models import db
import uuid

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/medicine-orders", methods=["POST"])
def create_order():
    data = request.json
    patient_id = data.get("patient_id")
    items = data.get("items")

    if not patient_id or not items:
        return jsonify({"error": "Invalid request"}), 400

    try:
        # patient must exist
        patient_exists = db.session.execute(
            text("select 1 from patients where id = :patient_id;"),
            {"patient_id": patient_id}
        ).fetchone()

        if not patient_exists:
            return jsonify({"error": "Patient not found"}), 400

        order_id = str(uuid.uuid4())
        db.session.execute(
            text("""
                insert into medicine_orders (id, patient_id, status)
                values (:order_id, :patient_id, 'completed');
            """),
            {"order_id": order_id, "patient_id": patient_id}
        )

        today = date.today()

        for item in items:
            mid = item.get("medicine_id")
            qty = item.get("quantity")

            if not mid or not qty or qty <= 0:
                db.session.rollback()
                return jsonify({"error": "Invalid item quantity"}), 400

            med = db.session.execute(
                text("""
                    select quantity_in_stock, expiry_date
                    from medicines
                    where medicine_id = :mid;
                """),
                {"mid": mid}
            ).fetchone()

            if not med:
                db.session.rollback()
                return jsonify({"error": "Medicine not found"}), 400

            stock, expiry = med

            if expiry < today:
                db.session.rollback()
                return jsonify({"error": "Expired medicine"}), 400

            if stock < qty:
                db.session.rollback()
                return jsonify({"error": "Insufficient stock"}), 400

            db.session.execute(
                text("""
                    update medicines
                    set quantity_in_stock = quantity_in_stock - :qty,
                        last_updated = now()
                    where medicine_id = :mid;
                """),
                {"qty": qty, "mid": mid}
            )

            db.session.execute(
                text("""
                    insert into medicine_order_items
                    (id, order_id, medicine_id, quantity, dosage, remarks)
                    values (:id, :order_id, :mid, :qty, :dosage, :remarks);
                """),
                {
                    "id": str(uuid.uuid4()),
                    "order_id": order_id,
                    "mid": mid,
                    "qty": qty,
                    "dosage": item.get("dosage") or "",
                    "remarks": item.get("remarks") or ""
                }
            )

        db.session.commit()
        return jsonify({"success": True, "order_id": order_id})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
