import requests
import json
from services.doctor_context import DOCTOR_CONTEXT

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "mistral"

def run_ollama(symptoms_text, report_text=None):
    today = "today (use current weekday logic yourself)"

    prompt = f"""
You are MedAI, a medical triage assistant.

{DOCTOR_CONTEXT}

Today is {today}.

Patient symptoms:
{symptoms_text}

Additional report text:
{report_text if report_text else "None"}

TASK:
- Assess severity: normal / concerned / serious
- Choose the MOST appropriate available doctor TODAY
- Mention doctor name, department, room, and schedule
- Be concise and professional

STRICT OUTPUT FORMAT (JSON ONLY):
{{
  "priority": "",
  "doctor": {{
    "name": "",
    "department": "",
    "room": "",
    "schedule": ""
  }},
  "message": ""
}}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            headers={"Content-Type": "application/json"},
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )
    except Exception as e:
        print("Ollama connection error:", e)
        return fallback()

    if response.status_code != 200:
        print("Ollama HTTP error:", response.status_code, response.text)
        return fallback()

    try:
        raw = response.json().get("response", "").strip()
    except Exception as e:
        print("Invalid JSON from Ollama:", e, response.text)
        return fallback()

    try:
        return json.loads(raw)
    except Exception as e:
        print("Model did not return JSON:", e, raw)
        return fallback()


def fallback():
    return {
        "priority": "concerned",
        "doctor": {
            "name": "Dr. Raj Kishor Singh",
            "department": "CMS",
            "room": "N/A",
            "schedule": "All working days"
        },
        "message": "Unable to analyze clearly. Please consult CMS."
    }
