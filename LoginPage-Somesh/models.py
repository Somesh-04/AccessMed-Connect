import uuid
from extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)

    email = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.Text, nullable=False)

    # column name in DB has underscore & quotes
    full_name = db.Column('Full_name', db.Text, nullable=False)

    emp_id = db.Column(db.BigInteger, unique=True, nullable=False)
