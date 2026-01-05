from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()


def gen_uuid():
    return str(uuid4())


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    email = db.Column(db.String, nullable=False, unique=True)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)
    full_name = db.Column(db.String, nullable=False)
    emp_id = db.Column(db.BigInteger, nullable=False, unique=True)


class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    emp_id = db.Column(db.BigInteger, db.ForeignKey("users.emp_id"), nullable=False, unique=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)


class Department(db.Model):
    __tablename__ = "departments"

    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    name = db.Column(db.String, nullable=False, unique=True)


class Doctor(db.Model):
    __tablename__ = "doctors"

    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    name = db.Column(db.String, nullable=False)
    department_id = db.Column(db.String, db.ForeignKey("departments.id"), nullable=False)


class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.String, primary_key=True, default=gen_uuid)
    patient_id = db.Column(db.String, db.ForeignKey("patients.id"), nullable=False)
    doctor_id = db.Column(db.String, db.ForeignKey("doctors.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String, nullable=False)
    patient_name = db.Column(db.String, nullable=False)
