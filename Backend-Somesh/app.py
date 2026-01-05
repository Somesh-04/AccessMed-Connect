from flask import Flask
from flask_cors import CORS
from models import db
from auth_routes import auth
from patient_routes import patient_bp

app = Flask(__name__)
CORS(app)

# ---------- DB CONFIG ----------
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:SnNaSsBbAs05@db.yfqltffmmvkkxglxyuep.supabase.co:6543/postgres?sslmode=require"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


@app.route("/")
def home():
    return "AccessMed API Running"


# ---------- BLUEPRINTS ----------
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(patient_bp)   # already has /api/patient prefix


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True,port=5003)
