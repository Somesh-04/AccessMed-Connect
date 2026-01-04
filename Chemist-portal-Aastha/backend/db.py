import psycopg2

DATABASE_URL = (
    "postgresql://postgres:SnNaSsBbAs05@db.yfqltffmmvkkxglxyuep.supabase.co:6543/postgres?sslmode=require"
)

def get_db():
    return psycopg2.connect(DATABASE_URL)
