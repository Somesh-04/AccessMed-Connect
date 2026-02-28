from flask import Flask
from flask_cors import CORS
from routes.analyze import analyze_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(analyze_bp)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
