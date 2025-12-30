from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from extensions import db
from auth_routes import auth

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ***** DB CONFIG *****
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = os.getenv("SECRET_KEY", "devkey")

db.init_app(app)
app.register_blueprint(auth)


@app.route("/")
def home():
    return "Backend is running"


if __name__ == "__main__":
    print("MAIN APP STARTING…")
    with app.app_context():
        db.create_all()
    app.run(debug=True)
