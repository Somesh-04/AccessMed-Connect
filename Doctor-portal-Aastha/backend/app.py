from flask import Flask, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)

@app.route("/api/dashboard")
def dashboard():
    return jsonify({
        "appointments": 5,
        "patients": 12,
        "reports": 3
    })

@app.route("/api/patients")
def patients():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT name, age, blood, condition FROM patients")
    rows = cur.fetchall()
    cur.close(); conn.close()

    return jsonify([
        {"name": r[0], "age": r[1], "blood": r[2], "condition": r[3]}
        for r in rows
    ])

@app.route("/api/records")
def records():
    return jsonify([
        {"test": "Blood Test", "status": "Pending"},
        {"test": "ECG", "status": "Reviewed"}
    ])

@app.route("/api/medicines")
def medicines():
    return jsonify([
        {"name": "Paracetamol", "stock": 120, "expiry": "2026-01-15"},
        {"name": "Amoxicillin", "stock": 60, "expiry": "2025-11-20"}
    ])

if __name__ == "__main__":
    app.run(debug=True,port=5002)
