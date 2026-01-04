from flask import Flask
from flask_cors import CORS

from routes.dashboard import dashboard_bp
from routes.medicines import medicines_bp
from routes.orders import orders_bp
from routes.patients import patients_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(dashboard_bp, url_prefix="/api")
app.register_blueprint(medicines_bp, url_prefix="/api")
app.register_blueprint(orders_bp, url_prefix="/api")
app.register_blueprint(patients_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
