from flask import Flask
from flask_cors import CORS
from models import db
from auth_routes import auth
from patient_routes import patient_bp

# Ported Blueprints
from doctor_routes import doctor_bp
from reception_routes import reception_bp
from chemist.routes.dashboard import dashboard_bp as chemist_dash_bp
from chemist.routes.medicines import medicines_bp as chemist_med_bp
from chemist.routes.orders import orders_bp as chemist_ord_bp
from chemist.routes.patients import patients_bp as chemist_pat_bp
from medai.routes.analyze import analyze_bp

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)

# ---------- DB CONFIG ----------
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:SnNaSsBbAs05@db.yfqltffmmvkkxglxyuep.supabase.co:5432/postgres?sslmode=require"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

@app.route("/")
def home():
    return app.send_static_file("landing/index.html")

# ---------- BLUEPRINTS ----------
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(patient_bp)   # already has /api/patient prefix

# New prefixed blueprints
app.register_blueprint(doctor_bp, url_prefix="/api/doctor")
app.register_blueprint(reception_bp, url_prefix="/api/reception")
app.register_blueprint(chemist_dash_bp, url_prefix="/api/chemist")
app.register_blueprint(chemist_med_bp, url_prefix="/api/chemist")
app.register_blueprint(chemist_ord_bp, url_prefix="/api/chemist")
app.register_blueprint(chemist_pat_bp, url_prefix="/api/chemist")
app.register_blueprint(analyze_bp) # already has /api/medai prefix

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True,port=5003)
