import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

def generate_new_key():
    """Generates a unique AES key for each insight."""
    return Fernet.generate_key().decode()

def encrypt_content(content: str, key: str):
    """Encrypts the secret intelligence string."""
    f = Fernet(key.encode())
    encrypted_data = f.encrypt(content.encode())
    return encrypted_data.decode()

def decrypt_content(encrypted_content: str, key: str):
    """Decrypts the insight for the buyer."""
    f = Fernet(key.encode())
    return f.decrypt(encrypted_content.encode()).decode()