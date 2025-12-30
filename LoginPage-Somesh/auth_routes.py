from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User

auth = Blueprint("auth", __name__, url_prefix="/auth")


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


@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    identifier = data.get("identifier")
    password = data.get("password")

    # try email
    user = User.query.filter_by(email=identifier).first()

    # try employee id if email didn’t match
    if not user:
        user = User.query.filter_by(emp_id=identifier).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 400

    redirects = {
        "Doctor": "/Doctor-portal-Aastha/frontend/doctor-portal.html",
        "Patient": "/PatientPortal-Satyam/patient_portal.html",
        "Receptionist": "/ReceptionPortal-Satyam/templates/reception.html",
        "Chemist": "Chemist-portal-Aastha/frontend/dispensary.html",
    }

    return jsonify({"redirect_to": redirects.get(user.role, "/")})
