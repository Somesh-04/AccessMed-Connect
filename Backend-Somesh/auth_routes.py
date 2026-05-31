from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User, Patient

auth = Blueprint("auth", __name__)


# ---------- SIGNUP ----------
@auth.route("/signup", methods=["POST"])
def signup():
    data = request.json

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    emp_id = data.get("emp_id")

    if not all([full_name, email, password, role, emp_id]):
        return jsonify({"error": "All fields required"}), 400

    # role validation
    if role not in ["Doctor", "Patient", "Receptionist", "Chemist"]:
        return jsonify({"error": "Invalid role"}), 400

    # convert emp_id to bigint
    try:
        emp_id = int(emp_id)
    except:
        return jsonify({"error": "Employee ID must be number only"}), 400

    # email or emp already exists
    if User.query.filter((User.email == email) | (User.emp_id == emp_id)).first():
        return jsonify({"error": "User already exists"}), 400

    user = User(
        full_name=full_name,
        email=email,
        emp_id=emp_id,
        role=role,
        password_hash=generate_password_hash(password)
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Signup successful"}), 201



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
        "Patient": "/frontend/patient/patient_portal.html",
        "Doctor": "/frontend/doctor/doctor-portal.html",
        "Chemist": "/frontend/chemist/dispensary.html",
        "Receptionist": "/frontend/reception/reception.html"
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
