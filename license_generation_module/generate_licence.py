# generate_license.py
import jwt
import os
from datetime import datetime, timedelta, timezone

KEYS_DIR = "keys"
LICENSE_FOLDER = "licenses"
os.makedirs(LICENSE_FOLDER, exist_ok=True)

private_key_path = os.path.join(KEYS_DIR, "private_key.pem")
with open(private_key_path, "r") as f:
    private_key = f.read()

def generate_license():
    now = datetime.now(timezone.utc)

    payload = {
        "tenantId": "TNT-0001",
        'licenceKey': 'LIC-0001',
        "plan": {
            "planId": "PLAN_ENTERPRISE",
            "planName": "Enterprise",
            "planType": "PAID"
        },

        "modules": ["MDM", "IIOT"],
        "maxUsers": 500,

        "startDate": "2026-07-01",
        "expiryDate": "2027-09-30",

        "version": 1,

        # Standard JWT claims
        "iss": "ADAVIS",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=365)).timestamp())
    }

    token = jwt.encode(payload, private_key, algorithm="RS256")

    return token


if __name__ == "__main__":
    license_key = generate_license()

    now = datetime.now(timezone.utc)
    tenant_id = "TENANT_ACME" # Assuming this is the tenant ID for the generated license
    timestamp_str = now.strftime("%Y-%m-%d_%H-%M-%S")
    license_filename = f"{tenant_id}_{timestamp_str}.txt"
    license_file_path = os.path.join(LICENSE_FOLDER, license_filename)
    with open(license_file_path, "w") as f:
        f.write(license_key)
    print(f"\n✅ License key generated and saved to: {license_file_path}")