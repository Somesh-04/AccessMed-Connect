from flask import Blueprint, jsonify
from chemist.db import get_db

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard")
def dashboard():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("select coalesce(sum(quantity_in_stock),0) from medicines;")
    total_stock = cur.fetchone()[0]

    cur.execute("""
        select count(*) from medicine_orders
        where created_at::date = current_date;
    """)
    transactions_today = cur.fetchone()[0]

    cur.execute("""
        select count(*) from medicines
        where quantity_in_stock <= reorder_level;
    """)
    low_stock = cur.fetchone()[0]

    cur.close()
    conn.close()

    return jsonify({
        "total_medicines": total_stock,
        "transactions_today": transactions_today,
        "low_stock": low_stock
    })
