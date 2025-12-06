from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import os
import secrets
import shutil

app = FastAPI(title="AccessMed Connect API", version="1.0.0")

# ---------- CORS so frontend (Live Server) can call backend ----------

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Demo data (in-memory, no DB) ----------

# simple demo user
USERS = {
    "demo@accessmed.com": {
        "password": "demo123",
        "name": "Demo Employee",
        "role": "Employee",
        "dependents": ["Spouse", "Child"],
    }
}

TOKENS = {}  # token -> email mapping

MEDICINES = [
    {"id": 1, "name": "Paracetamol 500mg", "stock": 125, "location": "Pharmacy A"},
    {"id": 2, "name": "Ibuprofen 200mg", "stock": 60, "location": "Pharmacy B"},
    {"id": 3, "name": "Cetirizine 10mg", "stock": 18, "location": "Pharmacy A"},
]

DOCTORS = [
    {"id": 1, "name": "Dr. Sharma", "speciality": "General Physician"},
    {"id": 2, "name": "Dr. Kaur", "speciality": "Cardiologist"},
    {"id": 3, "name": "Dr. Singh", "speciality": "Dermatologist"},
]

# generate some fake slots for next 3 days
def generate_slots():
    slots_map = {}
    now = datetime.now().replace(minute=0, second=0, microsecond=0)
    for doc in DOCTORS:
        slots = []
        for day in range(0, 3):  # next 3 days
            base = now + timedelta(days=day, hours=2)
            for i in range(3):  # 3 slots per day
                slots.append(base + timedelta(minutes=30 * i))
        slots_map[doc["id"]] = slots
    return slots_map

DOCTOR_SLOTS = generate_slots()

EMERGENCY_LOGS = []
SUPPORT_TICKETS = []

# ---------- Pydantic models ----------

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    name: str

class Medicine(BaseModel):
    id: int
    name: str
    stock: int
    location: str

class DoctorAvailability(BaseModel):
    doctor_id: int
    doctor_name: str
    speciality: str
    slots: List[datetime]

class CatbotRequest(BaseModel):
    symptoms_text: str

class CatbotResponse(BaseModel):
    priority: str
    suggested_speciality: str
    suggest_action: str
    message: str

class EmergencyRequest(BaseModel):
    severity: str
    note: Optional[str] = None

class EmergencyResponse(BaseModel):
    status: str
    id: int

class SupportRequest(BaseModel):
    name: str
    email: str
    message: str

class SupportResponse(BaseModel):
    id: int
    status: str

class StatsOverview(BaseModel):
    doctors_on_duty: int
    low_stock_medicines: int
    upcoming_appointments: int

# ---------- Auth / Login ----------

@app.post("/api/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user = USERS.get(payload.email)
    if not user or payload.password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = secrets.token_hex(16)
    TOKENS[token] = payload.email
    return LoginResponse(token=token, name=user["name"])

# ---------- Quick stats (Home) ----------

@app.get("/api/stats/overview", response_model=StatsOverview)
def stats_overview():
    doctors_on_duty = len(DOCTORS)
    low_stock = sum(1 for m in MEDICINES if m["stock"] < 20)
    upcoming_appointments = 3  # demo constant
    return StatsOverview(
        doctors_on_duty=doctors_on_duty,
        low_stock_medicines=low_stock,
        upcoming_appointments=upcoming_appointments,
    )

# ---------- Medicine availability ----------

@app.get("/api/medicines/search", response_model=List[Medicine])
def search_medicines(q: str):
    q_lower = q.lower()
    results = [Medicine(**m) for m in MEDICINES if q_lower in m["name"].lower()]
    return results

# ---------- Doctor availability ----------

@app.get("/api/doctors/availability", response_model=List[DoctorAvailability])
def doctors_availability(speciality: Optional[str] = None):
    results: List[DoctorAvailability] = []
    for doc in DOCTORS:
        if speciality and doc["speciality"].lower() != speciality.lower():
            continue
        slots = DOCTOR_SLOTS.get(doc["id"], [])
        results.append(
            DoctorAvailability(
                doctor_id=doc["id"],
                doctor_name=doc["name"],
                speciality=doc["speciality"],
                slots=slots,
            )
        )
    return results

# ---------- CatBot triage ----------

EMERGENCY_KEYWORDS = ["chest", "breath", "unconscious", "severe pain", "bleeding"]
CARDIO_KEYWORDS = ["chest", "heart", "breath"]
DERMA_KEYWORDS = ["rash", "itch", "acne", "skin"]

@app.post("/api/catbot/triage", response_model=CatbotResponse)
def catbot_triage(req: CatbotRequest):
    text = req.symptoms_text.lower()

    # decide speciality
    speciality = "General Physician"
    if any(k in text for k in CARDIO_KEYWORDS):
        speciality = "Cardiologist"
    elif any(k in text for k in DERMA_KEYWORDS):
        speciality = "Dermatologist"

    # decide priority & action
    if any(k in text for k in EMERGENCY_KEYWORDS):
        return CatbotResponse(
            priority="high",
            suggested_speciality=speciality,
            suggest_action="emergency",
            message="High priority – contact the emergency desk immediately."
        )

    return CatbotResponse(
        priority="normal",
        suggested_speciality=speciality,
        suggest_action="appointment",
        message="You should book an appointment within the next 1–2 days."
    )

# ---------- Emergency logging ----------

@app.post("/api/emergency", response_model=EmergencyResponse)
def log_emergency(req: EmergencyRequest):
    emergency_id = len(EMERGENCY_LOGS) + 1
    EMERGENCY_LOGS.append(
        {
            "id": emergency_id,
            "severity": req.severity,
            "note": req.note,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )
    return EmergencyResponse(status="ok", id=emergency_id)

# ---------- Report upload ----------

REPORTS_DIR = "reports"

@app.post("/api/reports/upload")
async def upload_report(file: UploadFile = File(...)):
    if not os.path.exists(REPORTS_DIR):
        os.makedirs(REPORTS_DIR, exist_ok=True)

    # generate safe filename
    file_ext = os.path.splitext(file.filename)[1]
    safe_name = secrets.token_hex(8) + file_ext
    file_path = os.path.join(REPORTS_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Here you could store meta in DB (employee_id etc.)
    return {"filename": file.filename, "stored_as": safe_name, "status": "stored"}

# ---------- Support / Helpdesk (optional, for future) ----------

@app.post("/api/support", response_model=SupportResponse)
def support_ticket(req: SupportRequest):
    ticket_id = len(SUPPORT_TICKETS) + 1
    SUPPORT_TICKETS.append(
        {
            "id": ticket_id,
            "name": req.name,
            "email": req.email,
            "message": req.message,
            "created_at": datetime.utcnow().isoformat(),
        }
    )
    return SupportResponse(id=ticket_id, status="received")
