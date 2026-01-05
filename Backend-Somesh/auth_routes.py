from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User, Patient

auth = Blueprint("auth", __name__)


# ---------- SIGNUP ----------
@auth.route("/signup", methods=["POST"])
def signup():
    data = request.json

    user = User(
        email=data["email"],
        emp_id=data["emp_id"],
        role=data["role"],
        full_name=data["full_name"],
        password_hash=generate_password_hash(data["password"])
    )

    db.session.add(user)
    db.session.commit()

    # also create patient automatically if role = Patient
    if user.role == "Patient":
        patient = Patient(
            emp_id=user.emp_id,
            name=user.full_name,
            email=user.email
        )
        db.session.add(patient)
        db.session.commit()

    return jsonify(message="Signup successful"), 201


# ---------- LOGIN ----------
@auth.route("/login", methods=["POST"])
def login():
    data = request.json
    identifier = data["identifier"]
    password = data["password"]

    # email login
    user = User.query.filter_by(email=identifier).first()

    # emp_id login
    if not user and identifier.isdigit():
        user = User.query.filter_by(emp_id=int(identifier)).first()

    if not user:
        return jsonify(error="User not found"), 404

    if not check_password_hash(user.password_hash, password):
        return jsonify(error="Invalid password"), 401

    redirect_paths = {
        "Patient": "/PatientPortal-Satyam/patient_portal.html",
        "Doctor": "/Doctor-Portal-Aastha/frontend/doctor-portal.html",
        "Chemist": "/Chemist-Portal-Aastha/frontend/dispensary.html",
        "Receptionist": "/Reception-Portal/reception.html"
    }

    return jsonify(
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "emp_id": user.emp_id,
            "role": user.role
        },
        redirect_to=redirect_paths.get(user.role, "/")
    )
