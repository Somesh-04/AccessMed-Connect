from datetime import datetime

def today():
    return datetime.now().strftime("%a").upper()[:3]

ALL_DAYS = ["MON","TUE","WED","THU","FRI","SAT"]

DOCTOR_CONTEXT= {
    "CMS": [
        {"name": "Dr. Raj Kishor Singh", "days": ALL_DAYS, "room": "CMS(I/C)"}
    ],

    "MEDICINE": [
        {"name": "Dr. Raj Kumar", "days": ["TUE","FRI"], "room": "Room No. 8"},
        {"name": "Dr. Ranjeet Kr. Singh", "days": ["MON","THU"], "room": "Room No. 8"},
        {"name": "Dr. Preeti Kumaari", "days": ["MON","THU"], "room": "Room No. 8"},
        {"name": "Dr. Nikhil Prasad Sinha", "days": ["TUE","WED","FRI"], "room": "Room No. 8"},
        {"name": "Dr. Naresh Kolipaka", "days": ["TUE","FRI"], "room": "Room No. 8"},
        {"name": "Dr. Sashi Kant Prasad", "days": ["MON","THU"], "room": "Room No. 8"},
        {"name": "Dr. Priyanka Jha", "days": ["WED","SAT"], "room": "Room No. 8"}
    ],

    "SURGERY": [
        {"name": "Dr. Kumar Ajay Singh", "days": ["TUE","THU"], "room": "Room No. 5"},
        {"name": "Dr. Ashutosh Pandey", "days": ["WED"], "room": "Room No. 5"},
        {"name": "Dr. Raj Kapoor", "days": ["SAT"], "room": "Room No. 5"},
        {"name": "Dr. Avinash Chauhan", "days": ["MON","TUE","THU","FRI"], "room": "Room No. 5"}
    ],

    "OBS/GYNAE": [
        {"name": "Dr. Priti Tigga", "days": ["TUE","SAT"], "room": "Room No. 9"},
        {"name": "Dr. (Maj) Shilpi", "days": ["MON","FRI"], "room": "Room No. 9"},
        {"name": "Dr. Shalini Sinha", "days": ["WED"], "room": "Room No. 9"},
        {"name": "Dr. Kadambini Kumari", "days": ["TUE"], "room": "Room No. 9"},
        {"name": "Dr. Divya Kumari", "days": ["MON","TUE","SAT"], "room": "Room No. 9"}
    ],

    "ORTHO": [
        {"name": "Dr. Ashok Giri", "days": ["TUE","THU","SAT"], "room": "Room No. 4"},
        {"name": "Dr. Gaurav Kumar", "days": ["MON","WED","FRI"], "room": "Room No. 4"},
        {"name": "Dr. Basudeo Rajak", "days": ALL_DAYS, "room": "Room No. 4"}
    ],

    "EYE": [
        {"name": "Dr. Rajni Deepa Kujur", "days": ["MON","FRI"], "room": "Room No. 16"},
        {"name": "Dr. Ashima Tigga", "days": ["WED","THU"], "room": "Room No. 16"},
        {"name": "Dr. Tanisha Singh", "days": ["TUE","THU"], "room": "Room No. 16"}
    ],

    "ANAESTHESIA": [
        {"name": "Dr. Abhishek Kumar", "days": ["WED","SAT"], "room": "Room No. 11"},
        {"name": "Dr. Ratnesh Kumar Singh", "days": ["TUE","FRI"], "room": "Room No. 11"}
    ],

    "DENTAL": [
        {"name": "Dr. Jayanta Neogi", "days": ["MON","WED","FRI"], "room": "Room No. 13"},
        {"name": "Dr. Deepali R Samrit", "days": ["TUE","THU","SAT"], "room": "Room No. 13"}
    ],

    "SKIN": [
        {"name": "Dr. Anita Horo", "days": ALL_DAYS, "room": "Room No. 18"},
        {"name": "Dr. Nitu Kumari", "days": ALL_DAYS, "room": "Room No. 18"}
    ],

    "ENT": [
        {"name": "Dr. S P Ranjan", "days": ["MON","WED","FRI"], "room": "Room No. 19"},
        {"name": "Dr. Ambrish Kumar", "days": ["TUE","SAT"], "room": "Room No. 19"},
        {"name": "Dr. Swati Suneha", "days": ["THU"], "room": "Room No. 19"}
    ],

    "PSYCHIATRY": [
        {"name": "Dr. Deepak Singh", "days": ALL_DAYS, "room": "Room No. 17"}
    ],

    "RADIOLOGY": [
        {"name": "Dr. Sunil Kumar", "days": ALL_DAYS, "room": "Room No. 20"}
    ],

    "PATHOLOGY": [
        {"name": "Dr. Anita Kumari", "days": ALL_DAYS, "room": "1st Floor"},
        {"name": "Dr. Jitendra Kumar", "days": ALL_DAYS, "room": "1st Floor"},
        {"name": "Dr. Khushboo Sharan", "days": ALL_DAYS, "room": "1st Floor"},
        {"name": "Dr. Sreemoyee Mukharjee", "days": ALL_DAYS, "room": "1st Floor"},
        {"name": "Dr. Mohan Mondal", "days": ALL_DAYS, "room": "1st Floor"}
    ],

    "ICU": [
        {"name": "Dr. Abhishek Anand", "days": ALL_DAYS, "room": "CCU/ICU JB-1"}
    ]
}

def select_doctor(department):
    day = today()
    for doc in DOCTOR_CONTEXT.get(department, []):
        if day in doc["days"]:
            return doc
    return None
