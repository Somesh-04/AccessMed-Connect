import psycopg2  # type: ignore

DATABASE_URL = (
    "postgresql://postgres:SnNaSsBbAs05@db.yfqltffmmvkkxglxyuep.supabase.co:6543/postgres?sslmode=require"
)

def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("set search_path to public;")
    cur.close()
    return conn
