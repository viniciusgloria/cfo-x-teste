"""
Password validation utilities
"""
import re
from typing import Tuple


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password strength
    
    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "A senha deve ter pelo menos 8 caracteres"
    
    if not re.search(r"[A-Z]", password):
        return False, "A senha deve conter pelo menos uma letra maiúscula"
    
    if not re.search(r"[a-z]", password):
        return False, "A senha deve conter pelo menos uma letra minúscula"
    
    if not re.search(r"\d", password):
        return False, "A senha deve conter pelo menos um número"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "A senha deve conter pelo menos um caractere especial"
    
    # Check for common passwords
    common_passwords = [
        "password", "senha", "admin123", "12345678", "qwerty",
        "abc123", "password123", "senha123", "admin", "root"
    ]
    if password.lower() in common_passwords:
        return False, "Esta senha é muito comum. Escolha uma senha mais segura"
    
    return True, ""


def validate_password_policy(password: str, user_email: str = None) -> Tuple[bool, str]:
    """
    Validate password against security policy
    
    Args:
        password: Password to validate
        user_email: Optional user email to prevent using email parts in password
    
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    # Check strength first
    is_valid, error = validate_password_strength(password)
    if not is_valid:
        return is_valid, error
    
    # Prevent using parts of email in password
    if user_email:
        email_parts = user_email.lower().split("@")[0].split(".")
        for part in email_parts:
            if len(part) > 3 and part in password.lower():
                return False, "A senha não deve conter partes do seu email"
    
    return True, ""
