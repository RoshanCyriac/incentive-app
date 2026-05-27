"""Add seed data - admin user, car models, and slab rules

Revision ID: 002
Revises: 001
Create Date: 2026-05-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from uuid import uuid4

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Insert seed data"""
    from passlib.context import CryptContext
    
    # Initialize password context
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Generate hashed password at runtime
    hashed_password = pwd_context.hash("Admin@123")
    
    # Admin user ID (fixed for reference)
    admin_id = str(uuid4())
    
    # Insert admin user with generated password hash
    # Use ON CONFLICT to prevent duplicate inserts on re-runs
    op.execute(f"""
        INSERT INTO users (id, name, email, password_hash, role, is_active)
        VALUES (
            '{admin_id}',
            'System Admin',
            'admin@incentive.com',
            '{hashed_password}',
            'admin',
            true
        )
        ON CONFLICT (email) DO NOTHING
    """)
    
    # Insert car models
    op.execute("""
        INSERT INTO car_models (name, base_suffix, variant, is_active)
        VALUES
            ('Swift Dzire', 'Base', 'ZXI', true),
            ('Ertiga', 'Base', 'ZXI Plus', true),
            ('Brezza', 'Base', 'VXI', true)
    """)
    
    # Insert slab rules
    # Slab 1: 1-3 cars = 1000/car
    # Slab 2: 4-7 cars = 2000/car
    # Slab 3: 8+ cars = 3500/car (max_qty NULL for unlimited)
    op.execute("""
        INSERT INTO slab_rules (min_qty, max_qty, incentive_per_car, is_active)
        VALUES
            (1, 3, 1000.00, true),
            (4, 7, 2000.00, true),
            (8, NULL, 3500.00, true)
    """)


def downgrade() -> None:
    """Remove seed data"""
    
    # Delete slab rules
    op.execute("DELETE FROM slab_rules WHERE min_qty IN (1, 4, 8)")
    
    # Delete car models
    op.execute("""
        DELETE FROM car_models 
        WHERE name IN ('Swift Dzire', 'Ertiga', 'Brezza')
    """)
    
    # Delete admin user
    op.execute("DELETE FROM users WHERE email = 'admin@incentive.com'")
