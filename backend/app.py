from flask import Flask, request, jsonify
from config import Config
from models import db, Appointment
from datetime import datetime

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route("/api/appointment", methods=["POST"])
    def book_appointment():
        data = request.json
        appt = Appointment(
            patient_name=data["patient_name"],
            department=data["department"],
            doctor=data["doctor"],
            date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
            time=datetime.strptime(data["time"], "%H:%M").time()
        )
        db.session.add(appt)
        db.session.commit()
        return jsonify({"message": "Appointment booked"}), 201

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
