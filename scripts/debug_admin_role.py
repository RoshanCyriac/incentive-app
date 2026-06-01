#!/usr/bin/env python3
"""Debug script to check admin user role in database"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from models import User

def main():
    """Check admin user role"""
    db = SessionLocal()
    
    try:
        # Check admin user
        admin = db.query(User).filter(User.email == 'admin@incentive.com').first()
        
        if admin:
            print(f"Admin user found:")
            print(f"  ID: {admin.id}")
            print(f"  Name: {admin.name}")
            print(f"  Email: {admin.email}")
            print(f"  Role: '{admin.role}'")
            print(f"  Role type: {type(admin.role)}")
            print(f"  Role length: {len(admin.role)}")
            print(f"  Role repr: {repr(admin.role)}")
            print(f"  Is active: {admin.is_active}")
            print(f"  Role == 'admin': {admin.role == 'admin'}")
            print(f"  Role.strip() == 'admin': {admin.role.strip() == 'admin'}")
        else:
            print("Admin user not found in database")
        
        # List all users
        print("\n\nAll users in database:")
        users = db.query(User).all()
        for user in users:
            print(f"  {user.email}: role='{user.role}' (type: {type(user.role).__name__}, len: {len(user.role)})")
    
    finally:
        db.close()

if __name__ == '__main__':
    main()
