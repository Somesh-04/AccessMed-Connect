import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="dispensary_db",
        user="postgres",
        password="0512"
    )
