from flask import Flask, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)

# -------------------------
# DASHBOARD METRICS
# -------------------------
@app.route("/api/metrics")
def metrics():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM medicines")
    total_medicines = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM transactions WHERE date = CURRENT_DATE")
    transactions_today = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM medicines WHERE quantity < 20")
    low_stock = cur.fetchone()[0]

    cur.close()
    conn.close()

    return jsonify({
        "medicines": total_medicines,
        "transactions": transactions_today,
        "low_stock": low_stock
    })


# -------------------------
# MEDICINE INVENTORY
# -------------------------
@app.route("/api/inventory")
def inventory():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT name, quantity FROM medicines ORDER BY name")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    inventory = [{"name": r[0], "quantity": r[1]} for r in rows]
    return jsonify(inventory)


# -------------------------
# LOW STOCK ITEMS
# -------------------------
@app.route("/api/low-stock")
def low_stock_items():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT name, quantity FROM medicines WHERE quantity < 20")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify([
        {"name": r[0], "quantity": r[1]} for r in rows
    ])


if __name__ == "__main__":
    app.run(debug=True)
