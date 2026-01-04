from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User

# --------------------------------------------
# CREATE BLUEPRINT FIRST  ✅ IMPORTANT
# --------------------------------------------
auth = Blueprint("auth", __name__, url_prefix="/auth")


# --------------------------------------------
# SIGNUP
# --------------------------------------------
@auth.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    full_name = data.get("full_name")
    emp_id = data.get("emp_id")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([full_name, emp_id, email, password, role]):
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    if User.query.filter_by(emp_id=emp_id).first():
        return jsonify({"error": "Employee ID already exists"}), 400

    hashed = generate_password_hash(password)

    user = User(
        full_name=full_name,
        emp_id=emp_id,
        email=email,
        password_hash=hashed,
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Signup successful"}), 201


# --------------------------------------------
# LOGIN – email OR emp_id
# --------------------------------------------
@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    identifier = data.get("identifier")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "Missing credentials"}), 400

    # Try email first
    user = User.query.filter_by(email=identifier).first()

    # If not found, try employee ID
    if not user:
        user = User.query.filter_by(emp_id=identifier).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid password"}), 400

    # redirect based on role
    redirects = {
        "Doctor": "/Doctor-portal-Aastha/frontend/doctor-portal.html",
        "Patient": "/PatientPortal-Satyam/patient_portal.html",
        "Receptionist": "/ReceptionPortal-Satyam/templates/reception.html",
        "Chemist": "/Chemist-portal-Aastha/frontend/dispensary.html",
    }

    return jsonify({
        "message": "Login successful",
        "redirect_to": redirects.get(user.role, "/"),
        "user": {
            "full_name": user.full_name,
            "email": user.email,
            "emp_id": user.emp_id,
            "role": user.role
        }
    }), 200
