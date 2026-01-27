"""
Script de inicializacao do banco de dados
Cria o primeiro usuario admin e dados basicos de configuracao
"""
import sys
import os
import time
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

# Adiciona o diretorio pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole, UserType
from app.models.empresa import Empresa
from app.models.permissao import PermissaoRole
from app.auth import get_password_hash


def wait_for_db(max_retries=30, delay=1):
    """Aguarda o banco de dados ficar pronto"""
    retries = 0
    while retries < max_retries:
        try:
            # Tenta conectar
            connection = engine.connect()
            connection.close()
            print("Database is ready!")
            return True
        except OperationalError as e:
            retries += 1
            print(f"Database not ready yet (attempt {retries}/{max_retries})...")
            if retries >= max_retries:
                print(f"Failed to connect to database after {max_retries} attempts")
                raise
            time.sleep(delay)
    return False


def init_db():
    """Inicializa o banco de dados com dados basicos"""
    
    # Cria todas as tabelas
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created")
    
    db = SessionLocal()
    
    try:
        # Verifica se o admin ja existe
        admin_exists = db.query(User).filter(User.email == "admin@cfohub.com").first()
        
        if not admin_exists:
            print("\nCreating admin user...")
            admin = User(
                email="admin@cfohub.com",
                nome="Administrador",
                senha_hash=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                tipo=UserType.CLT,
                cargo="Administrador",
                setor="TI",
                ativo=True,
                primeiro_acesso=True
            )
            db.add(admin)
            print("Admin user created")
            print("  Email: admin@cfohub.com")
            print("  Senha: admin123")
            print("  ALTERE A SENHA NO PRIMEIRO LOGIN!")
        else:
            print("Admin user already exists")
        
        # Verifica se a empresa ja existe
        company_exists = db.query(Empresa).first()
        
        if not company_exists:
            print("\nCreating company settings...")
            company = Empresa(
                nome="CFO Company",
                cnpj="00.000.000/0000-00",
                email="contato@cfocompany.com.br",
                jornada_horas=8.0,
                jornada_dias=5,
                tolerancia_minutos=10,
                ponto_ativo=True,
                solicitacoes_ativo=True,
                okrs_ativo=True,
                mural_ativo=True
            )
            db.add(company)
            print("Company settings created")
        else:
            print("Company settings already exist")
        
        # Initialize permission roles
        print("\nInitializing permission roles...")
        roles_to_init = ["admin", "gestor", "colaborador", "cliente"]
        
        for role in roles_to_init:
            perm_exists = db.query(PermissaoRole).filter(PermissaoRole.role == role).first()
            if not perm_exists:
                perm = PermissaoRole(role=role)
                db.add(perm)
                print(f"  Permission role created: {role}")
            else:
                print(f"  Permission role already exists: {role}")
        
        db.commit()
        print("\nDatabase initialized successfully!")
        
    except Exception as e:
        print(f"\nError initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("CFO Hub - Database Initialization")
    print("=" * 50)
    print("\nWaiting for database to be ready...")
    wait_for_db()
    print("\nInitializing database...")
    init_db()
