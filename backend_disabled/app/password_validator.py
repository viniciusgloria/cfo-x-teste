"""
Utilitarios de validacao de senha
"""
import re
from typing import Tuple


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Valida a forca da senha
    
    Requisitos:
    - Minimo de 8 caracteres
    - Pelo menos uma letra maiuscula
    - Pelo menos uma letra minuscula
    - Pelo menos um numero
    - Pelo menos um caractere especial
    
    Retorno:
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
    
    # Verifica senhas comuns
    common_passwords = [
        "password", "senha", "admin123", "12345678", "qwerty",
        "abc123", "password123", "senha123", "admin", "root"
    ]
    if password.lower() in common_passwords:
        return False, "Esta senha é muito comum. Escolha uma senha mais segura"
    
    return True, ""


def validate_password_policy(password: str, user_email: str = None) -> Tuple[bool, str]:
    """
    Valida a senha contra a politica de seguranca
    
    Args:
        password: Senha a validar
        user_email: Email opcional para evitar partes do email na senha
    
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    # Valida a forca primeiro
    is_valid, error = validate_password_strength(password)
    if not is_valid:
        return is_valid, error
    
    # Evita usar partes do email na senha
    if user_email:
        email_parts = user_email.lower().split("@")[0].split(".")
        for part in email_parts:
            if len(part) > 3 and part in password.lower():
                return False, "A senha não deve conter partes do seu email"
    
    return True, ""
