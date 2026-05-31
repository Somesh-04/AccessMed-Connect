from flask import Blueprint, jsonify
from sqlalchemy import text
from models import db

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard")
def dashboard():
    total_stock = db.session.execute(
        text("select coalesce(sum(quantity_in_stock),0) from medicines;")
    ).scalar()

    transactions_today = db.session.execute(
        text("""
            select count(*) from medicine_orders
            where created_at::date = current_date;
        """)
    ).scalar()

    low_stock = db.session.execute(
        text("""
            select count(*) from medicines
            where quantity_in_stock <= reorder_level;
        """)
    ).scalar()

    return jsonify({
        "total_medicines": total_stock,
        "transactions_today": transactions_today,
        "low_stock": low_stock
    })
