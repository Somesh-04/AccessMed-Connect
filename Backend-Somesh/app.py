from flask import Flask
from flask_cors import CORS
from extensions import db
from auth_routes import auth
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = os.getenv("SECRET_KEY", "devkey")

# THIS LINE FIXES YOUR ERROR
db.init_app(app)

# register endpoints
app.register_blueprint(auth, url_prefix="/api/auth")


@app.route("/")
def home():
    return "Flask backend running ✔"


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
