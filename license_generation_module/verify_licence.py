# verify_license.py
import jwt
import os

KEYS_DIR = "keys"
LICENSE_FOLDER = "licenses"

# Load public key
public_key_path = os.path.join(KEYS_DIR, "public_key.pem")
with open(public_key_path, "r") as f:
    public_key = f.read()

def verify_license(token):
    try:
        decoded = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer="ADAVIS"
        )

        print("✅ License is VALID\n")
        print(decoded)

    except jwt.ExpiredSignatureError:
        print("❌ License expired")

    except jwt.InvalidTokenError as e:
        print("❌ Invalid license:", str(e))


if __name__ == "__main__":
    filename = input(f"Enter the license filename from {LICENSE_FOLDER} (e.g., TENANT_ACME_...txt):\n")
    file_path = os.path.join(LICENSE_FOLDER, filename)
    
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            token = f.read().strip()
        verify_license(token)
    else:
        print(f"❌ File not found: {file_path}")