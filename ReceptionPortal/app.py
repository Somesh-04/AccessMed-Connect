from flask import Flask, render_template, request, redirect, url_for
from db import db
from sqlalchemy.orm import joinedload

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reception.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Models
class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dependents = db.relationship('Dependent', backref='employee', cascade='all, delete-orphan')

class Dependent(db.Model):
    __tablename__ = 'dependents'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    doctors = db.relationship('Doctor', backref='department')

class Doctor(db.Model):
    __tablename__ = 'doctors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    patient_type = db.Column(db.String(20), nullable=False)
    patient_name = db.Column(db.String(100), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    doctor = db.relationship('Doctor')
    department = db.relationship('Department')

# Routes
@app.route('/')
def index():
    employees = Employee.query.all()
    dependents = Dependent.query.options(joinedload(Dependent.employee)).all()
    doctors = Doctor.query.options(joinedload(Doctor.department)).all()
    departments = Department.query.all()
    appointments = Appointment.query.options(joinedload(Appointment.doctor), joinedload(Appointment.department)).order_by(Appointment.date, Appointment.time).all()
    return render_template('reception.html', employees=employees, dependents=dependents, doctors=doctors, departments=departments, appointments=appointments)

@app.route('/book_appointment', methods=['POST'])
def book_appointment():
    patient_type = request.form.get('patient_type')
    if patient_type == 'employee':
        emp_id = request.form.get('employee_id')
        patient_name = Employee.query.get(emp_id).name if emp_id else ''
    else:
        dep_id = request.form.get('dependent_id')
        patient_name = Dependent.query.get(dep_id).name if dep_id else ''

    doctor_id = request.form.get('doctor_id')
    department_id = request.form.get('department_id')
    date = request.form.get('date')
    time = request.form.get('time')

    if patient_name and doctor_id and department_id and date and time:
        appt = Appointment(
            patient_type=patient_type,
            patient_name=patient_name,
            doctor_id=doctor_id,
            department_id=department_id,
            date=date,
            time=time
        )
        db.session.add(appt)
        db.session.commit()
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Add sample data if empty
        if not Department.query.first():
            dept1 = Department(name='General Medicine')
            dept2 = Department(name='Cardiology')
            db.session.add(dept1)
            db.session.add(dept2)
            db.session.commit()
        
        if not Doctor.query.first():
            doc1 = Doctor(name='Dr. Smith', department_id=1)
            doc2 = Doctor(name='Dr. Johnson', department_id=2)
            db.session.add(doc1)
            db.session.add(doc2)
            db.session.commit()
        
        if not Employee.query.first():
            emp1 = Employee(name='John Doe')
            emp2 = Employee(name='Jane Doe')
            db.session.add(emp1)
            db.session.add(emp2)
            db.session.commit()
        
        if not Dependent.query.first():
            dep1 = Dependent(name='Child1', employee_id=1)
            db.session.add(dep1)
            db.session.commit()
    app.run(debug=True)
