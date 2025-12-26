from flask import Blueprint, request, jsonify
from services.ollama_ai import run_ollama

analyze_bp = Blueprint(
    "analyze",
    __name__,
    url_prefix="/api/medai"
)

@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    symptoms_text = request.form.get("symptoms_text", "").strip()

    if not symptoms_text:
        return jsonify({"error": "Symptoms text is required"}), 400

    report_file = request.files.get("report_file")
    report_text = None

    if report_file:
        try:
            report_text = report_file.read().decode("utf-8", errors="ignore")
        except:
            report_text = None

    result = run_ollama(symptoms_text, report_text)

    return jsonify(result)
