"""
Database initialization script
Creates first admin user and basic setup data
"""
import sys
import os
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole, UserType
from app.models.empresa import Empresa
from app.auth import get_password_hash


def init_db():
    """Initialize database with basic data"""
    
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created")
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
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
        
        # Check if company exists
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
    init_db()
