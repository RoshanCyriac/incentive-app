"""Initial migration - create all tables

Revision ID: 001
Revises: 
Create Date: 2026-05-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial database schema"""
    
    # Enable pgcrypto extension for gen_random_uuid()
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(100), nullable=False),
        sa.Column('password_hash', sa.Text(), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_users')),
        sa.UniqueConstraint('email', name=op.f('uq_users_email')),
        sa.CheckConstraint("role IN ('admin', 'officer')", name='check_role'),
    )

    # Create car_models table
    op.create_table(
        'car_models',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('base_suffix', sa.String(50), nullable=True),
        sa.Column('variant', sa.String(50), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_car_models')),
    )

    # Create slab_rules table
    op.create_table(
        'slab_rules',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), nullable=False),
        sa.Column('min_qty', sa.Integer(), nullable=False),
        sa.Column('max_qty', sa.Integer(), nullable=True),
        sa.Column('incentive_per_car', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_slab_rules')),
    )

    # Create sales_entries table
    op.create_table(
        'sales_entries',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), nullable=False),
        sa.Column('officer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('car_model_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('month', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('units_sold', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_sales_entries')),
        sa.ForeignKeyConstraint(['officer_id'], ['users.id'], name=op.f('fk_sales_entries_officer_id_users'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['car_model_id'], ['car_models.id'], name=op.f('fk_sales_entries_car_model_id_car_models'), ondelete='CASCADE'),
        sa.UniqueConstraint('officer_id', 'car_model_id', 'month', 'year', name='unique_sales_entry'),
    )

    # Create indexes for better query performance
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_car_models_is_active'), 'car_models', ['is_active'])
    op.create_index(op.f('ix_slab_rules_is_active'), 'slab_rules', ['is_active'])
    op.create_index(op.f('ix_sales_entries_officer_id'), 'sales_entries', ['officer_id'])
    op.create_index(op.f('ix_sales_entries_car_model_id'), 'sales_entries', ['car_model_id'])
    op.create_index(op.f('ix_sales_entries_month_year'), 'sales_entries', ['month', 'year'])


def downgrade() -> None:
    """Drop all tables in reverse order"""
    
    # Drop indexes
    op.drop_index(op.f('ix_sales_entries_month_year'), table_name='sales_entries')
    op.drop_index(op.f('ix_sales_entries_car_model_id'), table_name='sales_entries')
    op.drop_index(op.f('ix_sales_entries_officer_id'), table_name='sales_entries')
    op.drop_index(op.f('ix_slab_rules_is_active'), table_name='slab_rules')
    op.drop_index(op.f('ix_car_models_is_active'), table_name='car_models')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    
    # Drop tables in reverse order (respecting foreign key dependencies)
    op.drop_table('sales_entries')
    op.drop_table('slab_rules')
    op.drop_table('car_models')
    op.drop_table('users')
