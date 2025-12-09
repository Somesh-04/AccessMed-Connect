from flask import Flask, render_template, request, session
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "change_this_to_any_random_secret"  # used for sessions


def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="user_auth",
        user="postgres",
        password="725255",   # <-- your correct password
        cursor_factory=RealDictCursor,
    )
    return conn


@app.route("/", methods=["GET", "POST"])
def index():
    active_tab = "login"
    error_msg = ""
    success_msg = ""
    logged_in_name = session.get("full_name")

    if request.method == "POST":
        action = request.form.get("action")
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            # ---------- SIGNUP ----------
            if action == "signup":
                active_tab = "signup"

                full_name = request.form.get("full_name", "").strip()
                user_id = request.form.get("user_id", "").strip()
                email = request.form.get("email", "").strip()
                phone = request.form.get("phone", "").strip()
                password = request.form.get("password", "")
                confirm_pw = request.form.get("confirm_password", "")

                if password != confirm_pw:
                    error_msg = "Passwords do not match."
                else:
                    cur.execute(
                        "SELECT id FROM users WHERE user_id = %s OR email = %s",
                        (user_id, email),
                    )
                    if cur.fetchone():
                        error_msg = "User ID or Email already exists. Try another."
                    else:
                        password_hash = generate_password_hash(password)
                        full_phone = "+91" + phone

                        cur.execute(
                            """
                            INSERT INTO users (full_name, user_id, email, phone, password_hash)
                            VALUES (%s, %s, %s, %s, %s)
                            """,
                            (full_name, user_id, email, full_phone, password_hash),
                        )
                        conn.commit()
                        success_msg = "Signup successful! You can now login."
                        active_tab = "login"

            # ---------- LOGIN ----------
            elif action == "login":
                active_tab = "login"

                identifier = request.form.get("identifier", "").strip()
                password = request.form.get("password", "")

                cur.execute(
                    """
                    SELECT id, full_name, user_id, email, password_hash
                    FROM users
                    WHERE user_id = %s OR email = %s
                    LIMIT 1
                    """,
                    (identifier, identifier),
                )
                user = cur.fetchone()

                if not user:
                    error_msg = "No user found with that User ID or Email."
                else:
                    if check_password_hash(user["password_hash"], password):
                        session["user_id"] = user["id"]
                        session["full_name"] = user["full_name"]
                        logged_in_name = user["full_name"]
                        success_msg = f"Login successful! Welcome, {user['full_name']}."
                    else:
                        error_msg = "Invalid password."

            # ---------- RESET PASSWORD ----------
            elif action == "reset":
                active_tab = "reset"

                identifier = request.form.get("identifier", "").strip()
                new_pw = request.form.get("new_password", "")
                confirm_pw = request.form.get("confirm_new_password", "")

                if new_pw != confirm_pw:
                    error_msg = "New passwords do not match."
                else:
                    cur.execute(
                        "SELECT id FROM users WHERE user_id = %s OR email = %s LIMIT 1",
                        (identifier, identifier),
                    )
                    user = cur.fetchone()

                    if not user:
                        error_msg = "No user found with that User ID or Email."
                    else:
                        new_hash = generate_password_hash(new_pw)
                        cur.execute(
                            "UPDATE users SET password_hash = %s WHERE id = %s",
                            (new_hash, user["id"]),
                        )
                        conn.commit()
                        success_msg = "Password updated successfully. You can now login."
                        active_tab = "login"

        finally:
            cur.close()
            conn.close()

    return render_template(
        "index.html",
        active_tab=active_tab,
        error_msg=error_msg,
        success_msg=success_msg,
        logged_in_name=logged_in_name,
    )


if __name__ == "__main__":
    app.run(debug=True)
