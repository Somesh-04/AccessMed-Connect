import psycopg2

def get_connection():
    return psycopg2.connect(
        dbname="doctor_portal",
        user="postgres",
        password="0512",
        host="localhost",
        port="5432"
    )
