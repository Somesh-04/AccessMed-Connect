from datetime import date

def validate_quantity(qty):
    return isinstance(qty, int) and qty > 0

def is_expired(expiry_date):
    return expiry_date < date.today()
